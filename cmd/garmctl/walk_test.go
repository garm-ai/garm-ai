package main

import (
	"bytes"
	"context"
	"crypto/sha256"
	"crypto/tls"
	"crypto/x509"
	"encoding/hex"
	"encoding/json"
	"flag"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"testing"
	"time"

	"github.com/nats-io/jwt/v2"
	natsserver "github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"

	"github.com/garm-ai/garm-ai/internal/devtls"
	"github.com/garm-ai/garm-ai/internal/fixtures"
	"github.com/garm-ai/garm-ai/topology"
)

// The topology walk: the lifecycle of docs/operating-the-topology.md run for
// real -- the actual commands, a real server with the full resolver, real
// credentials tried against it -- and recorded step by step for
// docs/topology.html to show. Not a test of anything: `mise run topology-walk`
// writes docs/topology-walk.js, and the page embeds what the generator did.
var walkOut = flag.String("walk-out", "", "write the topology walk-through here (docs/topology-walk.js); empty skips")

type walkFile struct {
	Path    string `json:"path"`
	Kind    string `json:"kind"`   // jwt | creds | seed | pem | json | conf | binpb | text
	Change  string `json:"change"` // new | changed | same | removed
	Secret  bool   `json:"secret"`
	Size    int    `json:"size"`
	Content string `json:"content"` // decoded claims for a jwt/creds; redacted for a seed
	hash    string
}

type walkCred struct {
	File       string   `json:"file"`
	Name       string   `json:"name"`
	Account    string   `json:"account"`
	Public     string   `json:"public"`
	Issuer     string   `json:"issuer"`
	Tags       []string `json:"tags"`
	Expires    string   `json:"expires"`
	PubAllow   []string `json:"pub_allow"`
	SubAllow   []string `json:"sub_allow"`
	Accepted   bool     `json:"accepted"`
	Reason     string   `json:"reason,omitempty"`
	FromBefore bool     `json:"from_before,omitempty"` // a copy a process still holds, not a file in creds/
}

type walkProbe struct {
	Cred    string `json:"cred"`
	Action  string `json:"action"`
	Subject string `json:"subject"`
	Outcome string `json:"outcome"`
}

type walkAccount struct {
	Name        string   `json:"name"`
	Public      string   `json:"public"`
	SigningKeys []string `json:"signing_keys"`
	Revocations int      `json:"revocations"`
	Pushed      bool     `json:"pushed"`
}

type walkBus struct {
	Server   string        `json:"server"`
	Accounts []walkAccount `json:"accounts"`
	Creds    []walkCred    `json:"creds"`
	Probes   []walkProbe   `json:"probes"`
}

type walkStep struct {
	ID      string     `json:"id"`
	Title   string     `json:"title"`
	Prose   string     `json:"prose"`
	Command string     `json:"command"`
	Stdout  string     `json:"stdout"`
	Stderr  string     `json:"stderr"`
	Error   string     `json:"error,omitempty"`
	Files   []walkFile `json:"files"`
	Bus     *walkBus   `json:"bus,omitempty"`
}

type walk struct {
	t        *testing.T
	root     string // everything under here; paths are shown relative to it
	ceremony string
	keys     string
	manifest string
	out      string
	caFile   string
	clientCA *x509.CertPool
	srv      *natsserver.Server
	res      *natsserver.DirAccResolver
	sysPub   string
	opsCreds string
	before   map[string]walkFile // last step's files, for change detection
	copies   string              // creds copied per step, for "a process still holding it"
	steps    []walkStep
}

func TestTopologyWalk(t *testing.T) {
	if *walkOut == "" {
		t.Skip("the topology walk writes a file; run it with -walk-out docs/topology-walk.js (mise run topology-walk)")
	}
	w := &walk{t: t, root: t.TempDir(), before: map[string]walkFile{}}
	w.ceremony = filepath.Join(w.root, "ceremony")
	w.keys = filepath.Join(w.ceremony, "keys")
	w.manifest = filepath.Join(w.root, "manifest.json")
	w.out = filepath.Join(w.root, "topo")
	w.copies = filepath.Join(w.root, "held")
	weather := fixtures.Weather(t)
	two := fixtures.TwoServices(t)
	cat := func(f fixtures.Fixture) []string {
		return []string{"--catalogue", f.URI, "--catalogue-sha256", f.SHA, "--catalogue-dir", f.Dir}
	}
	issue := func(f fixtures.Fixture, callers string, extra ...string) (string, string, error) {
		args := append([]string{"--keys", w.keys, "--manifest", w.manifest, "--callers", callers, "--out", w.out}, cat(f)...)
		return runTopology(t, append(args, extra...)...)
	}

	// 1. The ceremony.
	stdout, stderr, err := runOperator(t, "init", "--out", w.ceremony)
	w.record("ceremony", "The root ceremony, once, offline",
		"`garmctl operator init` mints the operator root and the operator signing key, writes the root-signed operator JWT, and puts the root under `root/` for custody. Everything `topology` will ever need is under `keys/`; the root is not.",
		"garmctl operator init --out ceremony", stdout, stderr, err, nil)

	// 2. The first issuance.
	stdout, stderr, err = issue(weather, "studio", "--first")
	w.startServer()
	w.record("first", "The first issuance",
		"Against the weather catalogue (one tool service, one agent) and one caller, `studio`. `--first` because there is no manifest yet. Four accounts, four credentials; every permission derived from the catalogue. The server beside it runs the full resolver, seeded with the account JWTs, and every credential is tried against it.",
		"garmctl topology --keys ceremony/keys --manifest manifest.json --first --catalogue file://weather.binpb --callers studio -o topo",
		stdout, stderr, err, w.bus(true, nil))

	// 3. A tool is added.
	stdout, stderr, err = issue(two, "studio")
	w.record("tool-added", "A tool is added",
		"The catalogue gains a second service, `weather2.v1.WeatherService`, declaring `weather-2.v1.get_forecast`. One issuance against the manifest: the new service gets a credential, everything whose permission set did not change is carried forward untouched. The changed account JWTs are pushed to the server over `$SYS` with the ops credential; the new credential is accepted.",
		"garmctl topology --keys ceremony/keys --manifest manifest.json --catalogue file://two.binpb --callers studio -o topo",
		stdout, stderr, err, w.bus(true, nil))

	// 4. A tool is removed -- and a process still holding the old credential.
	zombie := w.hold("weather2.v1.WeatherService")
	stdout, stderr, err = issue(weather, "studio")
	w.record("tool-removed", "A tool is removed",
		"The catalogue goes back to one service. Routing stopped the moment `rund` reloaded; but a credential is a bearer document in a process's hands, so the generator revokes the retired service's credential in its account JWT, lists it in `revocations.json`, and removes its file. The account is pushed. The copy a zombie process still holds is tried: refused.",
		"garmctl topology --keys ceremony/keys --manifest manifest.json --catalogue file://weather.binpb --callers studio -o topo",
		stdout, stderr, err, w.bus(true, []held{zombie}))

	// 4b. Nothing changes -- and the zombie is STILL refused: the revocation
	// is carried by the manifest into every later account JWT.
	stdout, stderr, err = issue(weather, "studio")
	w.record("revoked-stays-revoked", "Nothing changes; revoked stays revoked",
		"The same catalogue again: this issuance revokes nothing new, and every account JWT is rebuilt. The manifest's cumulative record carries generation 3's revocation into generation 4's `TOOLS` JWT, so the zombie's copy is refused again. It stays refused until the credential's own expiry, when the record prunes it.",
		"garmctl topology --keys ceremony/keys --manifest manifest.json --catalogue file://weather.binpb --callers studio -o topo",
		stdout, stderr, err, w.bus(true, []held{zombie}))

	// 5. A caller is added.
	stdout, stderr, err = issue(weather, "studio,batch")
	w.record("caller-added", "A caller is added",
		"`batch` joins `--callers`. It has no `CALLER-batch.pub` in `--keys`, so its identity and signing keys are minted and written to `--keys-out`, the identity seed under `archive/` where nothing reads it. Its account JWT, its credential and a new `callers.json` appear.",
		"garmctl topology --keys ceremony/keys --manifest manifest.json --catalogue file://weather.binpb --callers studio,batch -o topo",
		stdout, stderr, err, w.bus(true, nil))

	// 6. Rotation, step one -- with a process still on the old credential.
	oldStudio := w.hold("studio")
	live := w.connectNamed(oldStudio.path, "studio-old")
	stdout, stderr, err = issue(weather, "studio,batch", "--rotate-signing", topology.CallerPrefix+"studio")
	w.record("rotate-one", "Rotating a signing key, step one",
		"`CALLER-studio`'s signing key is replaced: the new key is listed beside the old in the account JWT, every credential of the account is reissued under it, the old seed goes to `archive/`. Nothing is revoked: a process named `studio-old` is still connected on the old credential, and stays connected.",
		"garmctl topology --keys ceremony/keys --manifest manifest.json --catalogue file://weather.binpb --callers studio,batch --rotate-signing CALLER-studio -o topo",
		stdout, stderr, err, w.bus(true, []held{oldStudio}))

	// 7. Step two refused: the old key is still on the wire.
	stdout, stderr, err = issue(weather, "studio,batch", "--verify-live", "--nats", w.srv.ClientURL(), "--ops-creds", w.opsCreds, "--tls-ca", w.caFile)
	w.record("verify-live-refused", "Step two, refused",
		"The next issuance would retire the old key. `--verify-live` asks the server which key signed each live connection, finds `studio-old` still on the old one, and refuses by name. Nothing is written.",
		"garmctl topology … --verify-live --nats nats://127.0.0.1:… --ops-creds topo/creds/ops.creds --tls-ca ca.pem -o topo",
		stdout, stderr, err, w.bus(false, []held{oldStudio}))

	// 8. Step two: the old connection is gone; the key is retired.
	live.Close()
	time.Sleep(200 * time.Millisecond)
	stdout, stderr, err = issue(weather, "studio,batch", "--verify-live", "--nats", w.srv.ClientURL(), "--ops-creds", w.opsCreds, "--tls-ca", w.caFile)
	w.record("rotate-two", "Step two: the old key is retired",
		"`studio-old` has rolled out. `--verify-live` finds no connection on the old key, the issuance drops it from the account, and the account is pushed. The copy of the old credential, signed by a key the account no longer lists, is refused.",
		"garmctl topology … --verify-live --nats nats://127.0.0.1:… --ops-creds topo/creds/ops.creds --tls-ca ca.pem -o topo",
		stdout, stderr, err, w.bus(true, []held{oldStudio}))

	// 9. A credential file is lost.
	if err := os.Remove(filepath.Join(w.out, "creds", "batch.creds")); err != nil {
		t.Fatal(err)
	}
	stdout, stderr, err = issue(weather, "studio,batch")
	w.record("creds-lost", "A credential file went missing",
		"`creds/batch.creds` is gone from `--out`. The same issuance into the same directory sees a credential the manifest records and the directory lacks, reissues it by name, and says so.",
		"rm topo/creds/batch.creds; garmctl topology --keys ceremony/keys --manifest manifest.json --catalogue file://weather.binpb --callers studio,batch -o topo",
		stdout, stderr, err, w.bus(true, nil))

	// 10. Status.
	stdout, stderr, err = runTopology(t, "--status", "--keys", w.keys, "--manifest", w.manifest)
	w.record("status", "Where things stand",
		"`--status` reads the manifest and issues nothing: the generation, the catalogue it came from, every account with its identity and signing keys, and any key still retiring.",
		"garmctl topology --status --keys ceremony/keys --manifest manifest.json", stdout, stderr, err, nil)

	w.write()
}

// ---- recording ----

func (w *walk) record(id, title, prose, command, stdout, stderr string, err error, bus *walkBus) {
	w.t.Helper()
	// Paths are shown relative to the walk's root: a temp dir is nobody's business.
	clean := func(s string) string { return strings.ReplaceAll(s, w.root+"/", "") }
	st := walkStep{ID: id, Title: title, Prose: prose, Command: command, Stdout: clean(stdout), Stderr: clean(stderr), Bus: bus}
	if err != nil {
		st.Error = clean(err.Error())
	}
	st.Files = w.snapshot()
	w.steps = append(w.steps, st)
}

// snapshot lists every file under the root -- the ceremony, the keys, the
// output, the manifest -- with what it holds, and whether it changed.
func (w *walk) snapshot() []walkFile {
	w.t.Helper()
	now := map[string]walkFile{}
	_ = filepath.WalkDir(w.root, func(p string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return nil
		}
		rel, _ := filepath.Rel(w.root, p)
		if strings.HasPrefix(rel, "held/") {
			return nil
		}
		raw, err := os.ReadFile(p)
		if err != nil {
			return nil
		}
		f := walkFile{Path: rel, Size: len(raw)}
		sum := sha256.Sum256(raw)
		f.hash = hex.EncodeToString(sum[:8])
		f.Kind, f.Secret, f.Content = describe(rel, raw)
		now[rel] = f
		return nil
	})
	var out []walkFile
	for rel, f := range now {
		switch prev, had := w.before[rel]; {
		case !had:
			f.Change = "new"
		case prev.hash != f.hash:
			f.Change = "changed"
		default:
			f.Change = "same"
		}
		out = append(out, f)
	}
	for rel, prev := range w.before {
		if _, still := now[rel]; !still {
			prev.Change, prev.Content, prev.Size = "removed", "", 0
			out = append(out, prev)
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Path < out[j].Path })
	w.before = now
	return out
}

// describe says what a file is and renders what a reader may see of it. A seed
// is never shown; a JWT is shown decoded; a credential's JWT is decoded and its
// seed is not shown.
func describe(rel string, raw []byte) (kind string, secret bool, content string) {
	name := filepath.Base(rel)
	switch {
	case strings.HasSuffix(name, ".nk"):
		return "seed", true, "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
	case strings.HasSuffix(name, ".creds"):
		token, err := jwt.ParseDecoratedJWT(raw)
		if err != nil {
			return "creds", true, "(unreadable: " + err.Error() + ")"
		}
		uc, err := jwt.DecodeUserClaims(token)
		if err != nil {
			return "creds", true, "(unreadable: " + err.Error() + ")"
		}
		return "creds", true, "-----BEGIN NATS USER JWT----- (decoded)\n" + pretty(uc) + "\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
	case strings.HasSuffix(name, ".jwt"):
		if strings.HasPrefix(name, "operator") {
			oc, err := jwt.DecodeOperatorClaims(string(raw))
			if err == nil {
				return "jwt", false, pretty(oc)
			}
		}
		ac, err := jwt.DecodeAccountClaims(string(raw))
		if err == nil {
			return "jwt", false, pretty(ac)
		}
		return "jwt", false, string(raw)
	case strings.HasSuffix(name, ".pem"):
		first, _, _ := strings.Cut(string(raw), "\n")
		return "pem", strings.Contains(name, "key"), first + "\n…"
	case strings.HasSuffix(name, ".json"):
		return "json", false, string(raw)
	case strings.HasSuffix(name, ".conf"):
		return "conf", false, string(raw)
	case strings.HasSuffix(name, ".binpb"):
		return "binpb", false, fmt.Sprintf("(the catalogue: %d bytes of FileDescriptorSet)", len(raw))
	case strings.HasSuffix(name, ".pub"):
		return "text", false, strings.TrimSpace(string(raw))
	}
	return "text", false, string(raw)
}

func pretty(v any) string {
	b, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return err.Error()
	}
	return string(b)
}

// ---- the server and the bus ----

func (w *walk) startServer() {
	t := w.t
	t.Helper()
	certPEM, keyPEM, err := devtls.SelfSigned(time.Hour, "127.0.0.1")
	if err != nil {
		t.Fatal(err)
	}
	cert, err := tls.X509KeyPair(certPEM, keyPEM)
	if err != nil {
		t.Fatal(err)
	}
	w.clientCA = x509.NewCertPool()
	w.clientCA.AppendCertsFromPEM(certPEM)
	w.caFile = filepath.Join(w.root, "ca.pem")
	if err := os.WriteFile(w.caFile, certPEM, 0o600); err != nil {
		t.Fatal(err)
	}
	opClaims, err := jwt.DecodeOperatorClaims(mustRead(t, filepath.Join(w.out, "operator.jwt")))
	if err != nil {
		t.Fatal(err)
	}
	w.res, err = natsserver.NewDirAccResolver(t.TempDir(), 0, 2*time.Second, natsserver.NoDelete)
	if err != nil {
		t.Fatal(err)
	}
	w.sysPub = strings.TrimSpace(mustRead(t, filepath.Join(w.keys, topology.AccountSYS+".pub")))
	for _, a := range w.accountJWTs() {
		if err := w.res.Store(a.pub, a.encoded); err != nil {
			t.Fatal(err)
		}
	}
	srv, err := natsserver.NewServer(&natsserver.Options{
		Host: "127.0.0.1", Port: -1, NoLog: true, NoSigs: true,
		TrustedOperators: []*jwt.OperatorClaims{opClaims},
		AccountResolver:  w.res,
		SystemAccount:    w.sysPub,
		TLSConfig:        &tls.Config{Certificates: []tls.Certificate{cert}, MinVersion: tls.VersionTLS13},
	})
	if err != nil {
		t.Fatal(err)
	}
	go srv.Start()
	t.Cleanup(srv.Shutdown)
	if !srv.ReadyForConnections(10 * time.Second) {
		t.Fatal("nats-server not ready")
	}
	w.srv = srv
	w.opsCreds = filepath.Join(w.out, "creds", "ops.creds")
}

type accountJWT struct{ name, pub, encoded string }

func (w *walk) accountJWTs() []accountJWT {
	w.t.Helper()
	entries, err := os.ReadDir(filepath.Join(w.out, "accounts"))
	if err != nil {
		w.t.Fatal(err)
	}
	var out []accountJWT
	for _, e := range entries {
		encoded := mustRead(w.t, filepath.Join(w.out, "accounts", e.Name()))
		ac, err := jwt.DecodeAccountClaims(encoded)
		if err != nil {
			w.t.Fatal(err)
		}
		out = append(out, accountJWT{strings.TrimSuffix(e.Name(), ".jwt"), ac.Subject, encoded})
	}
	return out
}

func (w *walk) connect(creds string, extra ...nats.Option) (*nats.Conn, error) {
	opts := append([]nats.Option{nats.UserCredentials(creds), nats.RootCAs(w.caFile), nats.Timeout(3 * time.Second), nats.MaxReconnects(0)}, extra...)
	return nats.Connect(w.srv.ClientURL(), opts...)
}

func (w *walk) connectNamed(creds, name string) *nats.Conn {
	w.t.Helper()
	nc, err := w.connect(creds, nats.Name(name))
	if err != nil {
		w.t.Fatal(err)
	}
	w.t.Cleanup(nc.Close)
	return nc
}

type held struct{ name, path string }

// hold copies a credential as a running process would hold it, so a later step
// can try it after the file itself was replaced or removed.
func (w *walk) hold(name string) held {
	w.t.Helper()
	if err := os.MkdirAll(w.copies, 0o700); err != nil {
		w.t.Fatal(err)
	}
	src := filepath.Join(w.out, "creds", name+".creds")
	dst := filepath.Join(w.copies, fmt.Sprintf("%s.%d.creds", name, len(w.steps)))
	if err := os.WriteFile(dst, []byte(mustRead(w.t, src)), 0o600); err != nil {
		w.t.Fatal(err)
	}
	return held{name, dst}
}

// bus pushes every account JWT that changed since the last push (when push is
// set), then tries every credential in creds/ and every held copy against the
// server, and runs the permission probes.
func (w *walk) bus(push bool, holds []held) *walkBus {
	t := w.t
	t.Helper()
	b := &walkBus{Server: w.srv.ClientURL()}
	for _, a := range w.accountJWTs() {
		ac, _ := jwt.DecodeAccountClaims(a.encoded)
		acc := walkAccount{Name: a.name, Public: a.pub, Revocations: len(ac.Revocations)}
		for k := range ac.SigningKeys {
			acc.SigningKeys = append(acc.SigningKeys, k)
		}
		sort.Strings(acc.SigningKeys)
		if push {
			if cur, err := w.res.Fetch(a.pub); err != nil || cur != a.encoded {
				if err := w.push(a.encoded); err != nil {
					t.Fatal(err)
				}
				acc.Pushed = true
			}
		}
		b.Accounts = append(b.Accounts, acc)
	}
	entries, err := os.ReadDir(filepath.Join(w.out, "creds"))
	if err != nil {
		t.Fatal(err)
	}
	for _, e := range entries {
		b.Creds = append(b.Creds, w.try(filepath.Join(w.out, "creds", e.Name()), "creds/"+e.Name(), false))
	}
	for _, h := range holds {
		c := w.try(h.path, "a copy of "+h.name+".creds a process still holds", true)
		b.Creds = append(b.Creds, c)
	}
	// Permission probes: what the credentials may and may not do.
	b.Probes = append(b.Probes,
		w.probe("studio", "publish", "garm.tool.weather.v1.get_forecast"),
		w.probe("studio", "publish", "garm.run.v1.invoke"),
		w.probe("weather.v1.WeatherService", "subscribe", "garm.tool.weather.v1.get_forecast"),
		w.probe("weather.v1.WeatherService", "subscribe", "garm.run.v1.>"),
		w.probe("rund", "subscribe", "garm.run.v1.*.invoke"),
	)
	return b
}

func (w *walk) push(encoded string) error {
	ac, err := jwt.DecodeAccountClaims(encoded)
	if err != nil {
		return err
	}
	ops, err := w.connect(w.opsCreds)
	if err != nil {
		return fmt.Errorf("ops: %w", err)
	}
	defer ops.Close()
	reply, err := ops.Request("$SYS.REQ.ACCOUNT."+ac.Subject+".CLAIMS.UPDATE", []byte(encoded), 5*time.Second)
	if err != nil {
		return fmt.Errorf("pushing %s: %w", ac.Name, err)
	}
	var resp struct {
		Error *struct {
			Description string `json:"description"`
		} `json:"error"`
	}
	if err := json.Unmarshal(reply.Data, &resp); err != nil {
		return fmt.Errorf("pushing %s: unreadable reply %q", ac.Name, reply.Data)
	}
	if resp.Error != nil {
		return fmt.Errorf("pushing %s: the server refused it: %s", ac.Name, resp.Error.Description)
	}
	return nil
}

func (w *walk) try(path, label string, fromBefore bool) walkCred {
	c := walkCred{File: label, FromBefore: fromBefore}
	raw, err := os.ReadFile(path)
	if err != nil {
		c.Reason = err.Error()
		return c
	}
	if token, err := jwt.ParseDecoratedJWT(raw); err == nil {
		if uc, err := jwt.DecodeUserClaims(token); err == nil {
			c.Name, c.Public, c.Issuer, c.Account = uc.Name, uc.Subject, uc.Issuer, uc.IssuerAccount
			c.Tags = []string(uc.Tags)
			c.PubAllow, c.SubAllow = []string(uc.Pub.Allow), []string(uc.Sub.Allow)
			if uc.Expires > 0 {
				c.Expires = time.Unix(uc.Expires, 0).UTC().Format(time.RFC3339)
			}
		}
	}
	nc, err := w.connect(path)
	if err != nil {
		c.Reason = err.Error()
		return c
	}
	nc.Close()
	c.Accepted = true
	return c
}

// probe connects with a credential and tries one publish or subscribe,
// reporting the server's asynchronous permissions violation if one comes.
func (w *walk) probe(cred, action, subject string) walkProbe {
	p := walkProbe{Cred: cred, Action: action, Subject: subject}
	violations := make(chan string, 4)
	nc, err := w.connect(filepath.Join(w.out, "creds", cred+".creds"), nats.ErrorHandler(func(_ *nats.Conn, _ *nats.Subscription, err error) {
		violations <- err.Error()
	}))
	if err != nil {
		p.Outcome = "could not connect: " + err.Error()
		return p
	}
	defer nc.Close()
	switch action {
	case "publish":
		err = nc.Publish(subject, []byte("probe"))
	case "subscribe":
		_, err = nc.SubscribeSync(subject)
	}
	if err == nil {
		err = nc.Flush()
	}
	if err != nil {
		p.Outcome = "refused by the client: " + err.Error()
		return p
	}
	select {
	case v := <-violations:
		p.Outcome = "refused by the server: " + v
	case <-time.After(400 * time.Millisecond):
		p.Outcome = "allowed"
	}
	return p
}

// ---- output ----

func (w *walk) write() {
	t := w.t
	t.Helper()
	doc := map[string]any{
		"generated_at": time.Now().UTC().Format(time.RFC3339),
		"steps":        w.steps,
	}
	var buf bytes.Buffer
	buf.WriteString("// Written by `mise run topology-walk` (cmd/garmctl/walk_test.go): the lifecycle of\n")
	buf.WriteString("// docs/operating-the-topology.md run for real and recorded. Regenerate, do not edit.\n")
	buf.WriteString("window.TOPOLOGY_WALK = ")
	enc := json.NewEncoder(&buf)
	enc.SetIndent("", " ")
	enc.SetEscapeHTML(false)
	if err := enc.Encode(doc); err != nil {
		t.Fatal(err)
	}
	buf.WriteString(";\n")
	if err := os.WriteFile(*walkOut, buf.Bytes(), 0o644); err != nil {
		t.Fatal(err)
	}
	t.Logf("wrote %s: %d steps", *walkOut, len(w.steps))
	_ = context.Background
}
