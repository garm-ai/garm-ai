package topology

import (
	"fmt"
	"regexp"
	"slices"
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
// makes "reissue" and "revoke the old" distinct operations -- and account keys
// for an account it has not seen, which are minted here and handed back.
func Generate(in Input) (*Output, error) {
	if in.Catalogue == nil || in.Previous == nil {
		return nil, fmt.Errorf("topology: a catalogue and a previous manifest are required")
	}
	if in.Keys.OperatorSigning == nil {
		return nil, fmt.Errorf("topology: an operator signing key is required; the root is never one")
	}
	if in.Expiry == 0 {
		in.Expiry = DefaultExpiry
	}
	opSignPub, err := in.Keys.OperatorSigning.PublicKey()
	if err != nil {
		return nil, err
	}
	// The operator JWT is root-signed and taken as GIVEN -- but checked: it must
	// list the signing key we hold, and it must be strict, or the server would
	// accept exactly what this shape exists to prevent (spec §0).
	oc, err := jwt.DecodeOperatorClaims(in.Keys.OperatorJWT)
	if err != nil {
		return nil, fmt.Errorf("topology: the operator JWT: %w", err)
	}
	if !oc.SigningKeys.Contains(opSignPub) {
		return nil, fmt.Errorf("topology: the operator JWT (root %s) does not list the signing key %s", oc.Subject, opSignPub)
	}
	if !oc.StrictSigningKeyUsage {
		return nil, fmt.Errorf("topology: the operator JWT does not set strict signing-key usage; the server would accept a root-signed account")
	}
	// Self-signed, and inside its validity window: an operator JWT nsc wrote with
	// an expiry would otherwise mint a whole generation the server rejects, and
	// one some other key signed is not the root's word at all.
	if oc.Issuer != oc.Subject {
		return nil, fmt.Errorf("topology: the operator JWT is not self-signed (issuer %s, subject %s)", oc.Issuer, oc.Subject)
	}
	var vr jwt.ValidationResults
	oc.Validate(&vr)
	for _, issue := range vr.Issues {
		// Expiry is a "time check" in jwt's terms, not a blocking issue; here it
		// blocks -- the server would refuse everything signed under it.
		if issue.Blocking || issue.TimeCheck {
			return nil, fmt.Errorf("topology: the operator JWT is not valid: %s", issue.Description)
		}
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

	// ---- account keys: given, or born here
	//
	// An account the keys do not know is new. Its identity and signing pairs are
	// minted HERE, in the issuance environment, and handed back in NewKeys for the
	// caller to keep (spec §1). The root and the operator signing key are the two
	// keys this function can never mint; see operator.go.
	newKeys := map[string]NewAccountKeys{}
	accountNames := []string{AccountSYS, AccountGARM, AccountTOOLS}
	for _, c := range in.Callers {
		accountNames = append(accountNames, CallerPrefix+c)
	}
	keys := map[string]AccountKeys{}
	for _, name := range accountNames {
		k, ok := in.Keys.Accounts[name]
		if !ok {
			id, err := nkeys.CreateAccount()
			if err != nil {
				return nil, err
			}
			pub, err := id.PublicKey()
			if err != nil {
				return nil, err
			}
			sign, err := nkeys.CreateAccount()
			if err != nil {
				return nil, err
			}
			k = AccountKeys{Identity: pub, Signing: sign}
			newKeys[name] = NewAccountKeys{Identity: id, Signing: sign}
		}
		// A key that disagrees with the manifest is a key swapped under a running
		// estate -- the attack, not a typo. BOTH keys: a swapped signing seed would
		// list only the new key on the account and leave every carried-forward
		// credential signed by one no longer listed -- dead on the push, with no
		// reissue, no revocation and no warning (found in review). A rotation is
		// the one time the signing key is meant to differ, and it is declared.
		if rec, known := in.Previous.Accounts[name]; known {
			if rec.Identity != k.Identity {
				return nil, fmt.Errorf("topology: %s's identity key %s disagrees with the manifest's %s", name, k.Identity, rec.Identity)
			}
			sp, err := k.Signing.PublicKey()
			if err != nil {
				return nil, err
			}
			if rec.Signing != sp && !slices.Contains(in.RotateSigning, name) {
				return nil, fmt.Errorf("topology: %s's signing key %s disagrees with the manifest's %s; a rotation is --rotate-signing, not a swapped seed", name, sp, rec.Signing)
			}
		}
		keys[name] = k
	}
	signingPub := func(name string) (string, error) { return keys[name].Signing.PublicKey() }

	// ---- rotation, step one (spec §4): a new signing key, listed beside the old
	// one; every credential of the account is reissued under it below.
	retiring := map[string]string{}
	rotating := map[string]bool{}
	if in.Rotate && len(in.RotateSigning) > 0 {
		return nil, fmt.Errorf("topology: --rotate and --rotate-signing together are refused: --rotate revokes every previous credential now, --rotate-signing keeps the account's alive until the old key is retired")
	}
	for _, name := range in.RotateSigning {
		if _, ok := keys[name]; !ok {
			return nil, fmt.Errorf("topology: --rotate-signing %s: no such account in this topology", name)
		}
		if in.Previous.Accounts[name].Retiring != "" {
			return nil, fmt.Errorf("topology: %s is already retiring a signing key; retire it (an ordinary issuance) before rotating again", name)
		}
		old, err := signingPub(name)
		if err != nil {
			return nil, err
		}
		sign, err := nkeys.CreateAccount()
		if err != nil {
			return nil, err
		}
		k := keys[name]
		k.Signing = sign
		keys[name] = k
		newKeys[name] = NewAccountKeys{Signing: sign}
		retiring[name] = old
		rotating[name] = true
	}
	// ---- rotation, step two: a key retiring from a previous step one is dropped
	// now -- unless something still names it, which only a hand-edited manifest
	// can arrange. Dropped means: not listed, and RECORDED as retired by this
	// generation, so a reviewer of the manifest sees it happened.
	var retired []Retirement
	for name, rec := range in.Previous.Accounts {
		if rec.Retiring == "" || rotating[name] {
			continue
		}
		for _, e := range in.Previous.Entries {
			if e.Account == name && e.SigningKey == rec.Retiring {
				return nil, fmt.Errorf("topology: %s's retiring key %s still signs %s; it cannot be retired", name, rec.Retiring, e.Name)
			}
		}
		retired = append(retired, Retirement{Account: name, Key: rec.Retiring})
	}
	sort.Slice(retired, func(i, j int) bool { return retired[i].Account < retired[j].Account })
	forced := map[string]bool{}
	for _, n := range in.Reissue {
		forced[n] = true
	}

	sysPub := keys[AccountSYS].Identity
	garmPub := keys[AccountGARM].Identity
	toolsPub := keys[AccountTOOLS].Identity

	gen := in.Previous.Generation + 1
	tags := jwt.TagList{"catalogue:" + in.Catalogue.SHA256, fmt.Sprintf("generation:%d", gen)}
	exp := in.Now.Add(in.Expiry).Unix()

	// ---- accounts
	//
	// Every account lists its signing key; nothing below is encoded with an
	// identity seed -- there is none to encode with (spec §2).
	newAccount := func(name, identity string) (*jwt.AccountClaims, error) {
		ac := jwt.NewAccountClaims(identity)
		ac.Name = name
		sp, err := signingPub(name)
		if err != nil {
			return nil, err
		}
		ac.SigningKeys.Add(sp)
		if old, ok := retiring[name]; ok {
			ac.SigningKeys.Add(old) // listed until the next issuance retires it
		}
		return ac, nil
	}
	sys, err := newAccount(AccountSYS, sysPub)
	if err != nil {
		return nil, err
	}
	tools, err := newAccount(AccountTOOLS, toolsPub)
	if err != nil {
		return nil, err
	}
	tools.Exports = jwt.Exports{{
		Name: "tools", Subject: "garm.tool.>", Type: jwt.Service,
		TokenReq: true, // private: an import needs an activation TOOLS signed (§2.2)
	}}

	garm, err := newAccount(AccountGARM, garmPub)
	if err != nil {
		return nil, err
	}
	garm.Exports = jwt.Exports{{
		Name: "run", Subject: "garm.run.v1.*.>", Type: jwt.Service,
		AccountTokenPosition: 4,    // the caller's account key, placed by the server (§3)
		TokenReq:             true, // private, like TOOLS: an importer holds an activation GARM signed (§2.2)
	}}
	// Activations are signed by the exporter's SIGNING key, with IssuerAccount
	// naming the exporter, so the identity seed is never needed.
	act := jwt.NewActivationClaims(garmPub)
	act.ImportSubject = "garm.tool.>"
	act.ImportType = jwt.Service
	act.IssuerAccount = toolsPub
	actToken, err := act.Encode(keys[AccountTOOLS].Signing)
	if err != nil {
		return nil, fmt.Errorf("topology: signing the tools activation: %w", err)
	}
	garm.Imports = jwt.Imports{{
		Name: "tools", Subject: "garm.tool.>", Account: toolsPub, Type: jwt.Service,
		Token: actToken,
	}}

	accounts := map[string]*jwt.AccountClaims{AccountSYS: sys, AccountGARM: garm, AccountTOOLS: tools}
	for _, c := range in.Callers {
		name := CallerPrefix + c
		p := keys[name].Identity
		ac, err := newAccount(name, p)
		if err != nil {
			return nil, err
		}
		runSubject := jwt.Subject(fmt.Sprintf("garm.run.v1.%s.>", p))
		// An activation for THIS caller, for THIS subject, signed by GARM: the
		// import is a signed act rather than an edit nobody reviews.
		runAct := jwt.NewActivationClaims(p)
		runAct.ImportSubject = runSubject
		runAct.ImportType = jwt.Service
		runAct.IssuerAccount = garmPub
		runToken, err := runAct.Encode(keys[AccountGARM].Signing)
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
		// Signed by the account's SIGNING key; IssuerAccount names the account.
		uc.IssuerAccount = keys[account].Identity
		tok, err := uc.Encode(keys[account].Signing)
		if err != nil {
			return Credential{}, fmt.Errorf("topology: encoding user %s: %w", name, err)
		}
		sp, err := signingPub(account)
		if err != nil {
			return Credential{}, err
		}
		return Credential{Name: name, Account: account, Public: upub, JWT: tok, Seed: string(seed),
			IssuedAt: uc.IssuedAt, ExpiresAt: exp, SigningKey: sp}, nil
	}
	var creds []Credential
	var entries []Entry
	for _, w := range wants {
		hash := permissionsHash(w.account, w.perms)
		p, had := previous[w.name]
		if had && !in.Rotate && !rotating[w.account] && !forced[w.name] && p.Account == w.account && p.PermissionsHash == hash {
			p.Reason = ""
			entries = append(entries, p)
			continue
		}
		c, err := issue(w.account, w.name, w.perms)
		if err != nil {
			return nil, err
		}
		reason := "new"
		switch {
		case rotating[w.account]:
			reason = "rotation"
		case had && forced[w.name]:
			reason = "reissued"
		case had:
			reason = "catalogue"
		}
		creds = append(creds, c)
		entries = append(entries, Entry{
			Name: c.Name, Account: c.Account, Public: c.Public,
			CatalogueSHA256: in.Catalogue.SHA256, Generation: gen, PermissionsHash: hash,
			IssuedAt: c.IssuedAt, ExpiresAt: c.ExpiresAt, SigningKey: c.SigningKey, Reason: reason,
		})
	}
	sort.Slice(creds, func(i, j int) bool { return creds[i].Name < creds[j].Name })
	sort.Slice(entries, func(i, j int) bool { return entries[i].Name < entries[j].Name })
	records := map[string]AccountRecord{}
	for name, k := range keys {
		sp, err := signingPub(name)
		if err != nil {
			return nil, err
		}
		rec := AccountRecord{Identity: k.Identity, Signing: sp, Retiring: retiring[name]}
		// Retirements are history: carried forward, plus any this issuance did.
		for key, g := range in.Previous.Accounts[name].Retired {
			if rec.Retired == nil {
				rec.Retired = map[string]int{}
			}
			rec.Retired[key] = g
		}
		for _, r := range retired {
			if r.Account == name {
				if rec.Retired == nil {
					rec.Retired = map[string]int{}
				}
				rec.Retired[r.Key] = gen
			}
		}
		records[name] = rec
	}
	manifest := Manifest{Generation: gen, CatalogueSHA256: in.Catalogue.SHA256, IssuedAt: in.Now, Accounts: records, Entries: entries}

	// ---- the delta against the previous manifest
	//
	// A rotating account's superseded credentials are NOT revoked at step one:
	// both keys are listed precisely so the old credentials keep working while
	// the new ones roll out, and a RevokeAt in the pushed account JWT would close
	// them on the spot. Retiring the old key at step two is what invalidates
	// them, by construction and for every one of them at once.
	revoke := delta(in.Previous, manifest, in.Now)
	kept := revoke[:0]
	for _, r := range revoke {
		if rotating[r.Account] && r.Kind == Superseded {
			continue
		}
		kept = append(kept, r)
	}
	revoke = kept
	for _, r := range revoke {
		ac, ok := accounts[r.Account]
		if !ok {
			// The account is gone from this topology -- a caller that has left --
			// but its credential is still out there. The revocation has to land in
			// THAT account, so it is emitted as a tombstone: the account, with no
			// imports and the revocation. Built from the manifest's record of the
			// account's keys; no seed is needed, because the operator signing key
			// signs it like any other account.
			rec, has := in.Previous.Accounts[r.Account]
			if !has {
				return nil, fmt.Errorf("topology: retiring %s needs its account record to revoke %s, and the manifest has none",
					r.Account, r.Public)
			}
			ac = jwt.NewAccountClaims(rec.Identity)
			ac.Name = r.Account
			ac.SigningKeys.Add(rec.Signing)
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

	// ---- encode: every account by the operator SIGNING key; the operator JWT
	// is passed through, never re-encoded -- only the root could.
	out := &Output{OperatorJWT: in.Keys.OperatorJWT, Accounts: map[string]string{},
		Credentials: creds, Manifest: manifest, Revoke: revoke, NewKeys: newKeys, Retired: retired}
	for name, ac := range accounts {
		s, err := ac.Encode(in.Keys.OperatorSigning)
		if err != nil {
			return nil, fmt.Errorf("topology: encoding account %s: %w", name, err)
		}
		out.Accounts[name] = s
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
