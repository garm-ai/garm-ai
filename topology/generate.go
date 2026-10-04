package topology

import (
	"fmt"
	"regexp"
	"sort"
	"strings"

	"github.com/nats-io/jwt/v2"
	"github.com/nats-io/nkeys"

	"github.com/garm-ai/garm-ai/declared"
)

// callerName is a filename-safe identifier. Dots are excluded on purpose: a tool
// service's name has them, and the two must not be confusable.
var callerName = regexp.MustCompile(`^[A-Za-z0-9_-]+$`)

// Generate builds the topology for a catalogue. It is deterministic given its
// inputs except for user keys, which are fresh on every issuance -- that is what
// makes "reissue" and "revoke the old" distinct operations.
func Generate(in Input) (*Output, error) {
	if in.Catalogue == nil || in.Previous == nil || in.Keys.Operator == nil {
		return nil, fmt.Errorf("topology: a catalogue, a previous manifest and an operator signing key are all required")
	}
	if in.Expiry == 0 {
		in.Expiry = DefaultExpiry
	}
	// Every credential is a FILE named after it and a manifest entry keyed on it,
	// so a caller's name must be a safe filename and unique among everything else
	// that gets a credential -- ops, rund, and every tool service. Found in review:
	// a caller named "rund" was issued a second credential called rund, which the
	// command then wrote over rund's own file.
	taken := map[string]bool{"ops": true, "rund": true}
	for svc := range toolServices(in.Catalogue.Tools) {
		taken[svc] = true
	}
	seen := map[string]bool{}
	for _, c := range in.Callers {
		switch {
		case !callerName.MatchString(c):
			return nil, fmt.Errorf("topology: caller %q: a name is one or more of A-Z a-z 0-9 - _", c)
		case strings.EqualFold(c, AccountSYS), strings.EqualFold(c, AccountGARM), strings.EqualFold(c, AccountTOOLS):
			return nil, fmt.Errorf("topology: caller %q would shadow an account name", c)
		case taken[c]:
			return nil, fmt.Errorf("topology: caller %q is already the name of another credential", c)
		case seen[c]:
			return nil, fmt.Errorf("topology: caller %q is listed twice", c)
		}
		seen[c] = true
	}
	opPub, err := in.Keys.Operator.PublicKey()
	if err != nil {
		return nil, err
	}
	accKey := func(name string) (nkeys.KeyPair, string, error) {
		kp, ok := in.Keys.Accounts[name]
		if !ok {
			return nil, "", fmt.Errorf("topology: no signing key for account %s", name)
		}
		p, err := kp.PublicKey()
		return kp, p, err
	}

	sysKP, sysPub, err := accKey(AccountSYS)
	if err != nil {
		return nil, err
	}
	garmKP, garmPub, err := accKey(AccountGARM)
	if err != nil {
		return nil, err
	}
	toolsKP, toolsPub, err := accKey(AccountTOOLS)
	if err != nil {
		return nil, err
	}

	gen := in.Previous.Generation + 1
	tags := jwt.TagList{"catalogue:" + in.Catalogue.SHA256, fmt.Sprintf("generation:%d", gen)}
	exp := in.Now.Add(in.Expiry).Unix()

	// ---- accounts
	sys := jwt.NewAccountClaims(sysPub)
	sys.Name = AccountSYS

	tools := jwt.NewAccountClaims(toolsPub)
	tools.Name = AccountTOOLS
	tools.Exports = jwt.Exports{{
		Name: "tools", Subject: "garm.tool.>", Type: jwt.Service,
		TokenReq: true, // private: an import needs an activation TOOLS signed (§2.2)
	}}

	garm := jwt.NewAccountClaims(garmPub)
	garm.Name = AccountGARM
	garm.Exports = jwt.Exports{{
		Name: "run", Subject: "garm.run.v1.*.>", Type: jwt.Service,
		AccountTokenPosition: 4,    // the caller's account key, placed by the server (§3)
		TokenReq:             true, // private, like TOOLS: an importer holds an activation GARM signed (§2.2)
	}}
	act := jwt.NewActivationClaims(garmPub)
	act.ImportSubject = "garm.tool.>"
	act.ImportType = jwt.Service
	actToken, err := act.Encode(toolsKP)
	if err != nil {
		return nil, fmt.Errorf("topology: signing the tools activation: %w", err)
	}
	garm.Imports = jwt.Imports{{
		Name: "tools", Subject: "garm.tool.>", Account: toolsPub, Type: jwt.Service,
		Token: actToken,
	}}

	accounts := map[string]*jwt.AccountClaims{AccountSYS: sys, AccountGARM: garm, AccountTOOLS: tools}
	keys := map[string]nkeys.KeyPair{AccountSYS: sysKP, AccountGARM: garmKP, AccountTOOLS: toolsKP}
	for _, c := range in.Callers {
		name := CallerPrefix + c
		kp, p, err := accKey(name)
		if err != nil {
			return nil, err
		}
		ac := jwt.NewAccountClaims(p)
		ac.Name = name
		runSubject := jwt.Subject(fmt.Sprintf("garm.run.v1.%s.>", p))
		// An activation for THIS caller, for THIS subject, signed by GARM: the
		// import is a signed act rather than an edit nobody reviews.
		runAct := jwt.NewActivationClaims(p)
		runAct.ImportSubject = runSubject
		runAct.ImportType = jwt.Service
		runToken, err := runAct.Encode(garmKP)
		if err != nil {
			return nil, fmt.Errorf("topology: signing %s's run activation: %w", name, err)
		}
		ac.Imports = jwt.Imports{{
			Name:    "run",
			Subject: runSubject,
			Account: garmPub, Type: jwt.Service,
			LocalSubject: "garm.run.v1.>", // what the caller publishes today, unchanged
			Token:        runToken,
		}}
		accounts[name] = ac
		keys[name] = kp
	}

	// ---- what each process SHOULD hold, decided before anything is issued
	type want struct {
		account, name string
		perms         jwt.Permissions
	}
	wants := []want{{AccountSYS, "ops", ops()}, {AccountGARM, "rund", rund()}}
	services := toolServices(in.Catalogue.Tools)
	svcNames := make([]string, 0, len(services))
	for svc := range services {
		svcNames = append(svcNames, svc)
	}
	sort.Strings(svcNames)
	for _, svc := range svcNames {
		wants = append(wants, want{AccountTOOLS, svc, toolService(services[svc])})
	}
	for _, c := range in.Callers {
		wants = append(wants, want{CallerPrefix + c, c, caller()})
	}

	// ---- issue what changed; carry forward what did not
	//
	// A credential whose account and permission set are what the manifest already
	// records is not touched: its entry is copied, no new key is minted, nothing
	// is revoked, and the process holding it keeps running. That is spec §4.2's
	// delta -- "credentials whose permission set changed" -- and the reason adding
	// one tool does not restart every process on the bus. Rotate overrides it.
	previous := map[string]Entry{}
	for _, e := range in.Previous.Entries {
		previous[e.Name] = e
	}
	issue := func(account, name string, p jwt.Permissions) (Credential, error) {
		kp, err := nkeys.CreateUser()
		if err != nil {
			return Credential{}, err
		}
		upub, err := kp.PublicKey()
		if err != nil {
			return Credential{}, err
		}
		seed, err := kp.Seed()
		if err != nil {
			return Credential{}, err
		}
		uc := jwt.NewUserClaims(upub)
		uc.Name = name
		uc.Permissions = p
		uc.Tags = tags
		uc.Expires = exp
		apub, err := keys[account].PublicKey()
		if err != nil {
			return Credential{}, err
		}
		uc.IssuerAccount = apub
		tok, err := uc.Encode(keys[account])
		if err != nil {
			return Credential{}, fmt.Errorf("topology: encoding user %s: %w", name, err)
		}
		return Credential{Name: name, Account: account, Public: upub, JWT: tok, Seed: string(seed), IssuedAt: uc.IssuedAt}, nil
	}
	var creds []Credential
	var entries []Entry
	for _, w := range wants {
		hash := permissionsHash(w.account, w.perms)
		if p, ok := previous[w.name]; ok && !in.Rotate && p.Account == w.account && p.PermissionsHash == hash {
			entries = append(entries, p)
			continue
		}
		c, err := issue(w.account, w.name, w.perms)
		if err != nil {
			return nil, err
		}
		creds = append(creds, c)
		entries = append(entries, Entry{
			Name: c.Name, Account: c.Account, Public: c.Public,
			CatalogueSHA256: in.Catalogue.SHA256, Generation: gen, PermissionsHash: hash,
			IssuedAt: c.IssuedAt,
		})
	}
	sort.Slice(creds, func(i, j int) bool { return creds[i].Name < creds[j].Name })
	sort.Slice(entries, func(i, j int) bool { return entries[i].Name < entries[j].Name })
	manifest := Manifest{Generation: gen, CatalogueSHA256: in.Catalogue.SHA256, IssuedAt: in.Now, Entries: entries}

	// ---- the delta against the previous manifest
	revoke := delta(in.Previous, manifest, in.Now)
	for _, r := range revoke {
		ac, ok := accounts[r.Account]
		if !ok {
			// The account is gone from this topology -- a caller that has left --
			// but its credential is still out there. The revocation has to land in
			// THAT account, so it is emitted as a tombstone: the account, with no
			// imports and the revocation, signed by its own key. Without the key
			// there is no honest way to revoke, and saying so beats not revoking.
			kp, has := in.Keys.Accounts[r.Account]
			if !has {
				return nil, fmt.Errorf("topology: retiring %s needs its signing key to revoke %s, and none was given",
					r.Account, r.Public)
			}
			pub, err := kp.PublicKey()
			if err != nil {
				return nil, err
			}
			ac = jwt.NewAccountClaims(pub)
			ac.Name = r.Account
			accounts[r.Account] = ac
		}
		ac.RevokeAt(r.Public, r.At)
	}

	// ---- limits, on every account, in the JWT (review finding: there were none)
	for name, ac := range accounts {
		ac.Limits.Payload = MaxPayload
		// A credential here is a seed-signed nkey; a bearer user JWT -- one the
		// server accepts without a signature -- must not be, on any account.
		ac.Limits.DisallowBearer = true
		if strings.HasPrefix(name, CallerPrefix) {
			ac.Limits.Conn = CallerConnections
		}
	}

	// ---- encode
	out := &Output{Accounts: map[string]string{}, Credentials: creds, Manifest: manifest, Revoke: revoke}
	for name, ac := range accounts {
		s, err := ac.Encode(in.Keys.Operator)
		if err != nil {
			return nil, fmt.Errorf("topology: encoding account %s: %w", name, err)
		}
		out.Accounts[name] = s
	}
	op := jwt.NewOperatorClaims(opPub)
	op.Name = "garm"
	op.SystemAccount = sysPub
	if out.OperatorJWT, err = op.Encode(in.Keys.Operator); err != nil {
		return nil, fmt.Errorf("topology: encoding the operator: %w", err)
	}
	return out, nil
}

// toolServices groups the catalogue's NON-agent tools by the proto service that
// declares them. A service whose only methods are agents has no entry: no Go is
// generated for an agent and nothing answers one.
func toolServices(set *declared.Set) map[string][]string {
	by := map[string][]string{}
	for _, t := range set.Tools() {
		if t.IsAgent() {
			continue
		}
		svc := string(t.Method.Parent().FullName())
		by[svc] = append(by[svc], t.Name)
	}
	for _, names := range by {
		sort.Strings(names)
	}
	return by
}
