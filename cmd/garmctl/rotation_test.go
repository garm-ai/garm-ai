package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/nats-io/jwt/v2"
	"github.com/nats-io/nats.go"

	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/topology"
)

// keysFromEstate lays the estate's issuance state out the way a deployment holds
// it -- a --keys directory and a signed manifest -- so the COMMAND can continue
// the estate's issuance.
func keysFromEstate(t *testing.T, e *estate.Estate) (keys, manifest, out string) {
	t.Helper()
	keys = filepath.Join(t.TempDir(), "keys")
	if err := writeKeys(keys, e.Keys()); err != nil {
		t.Fatal(err)
	}
	manifest = filepath.Join(t.TempDir(), "manifest.json")
	m := e.Topology().Manifest
	if err := m.Save(manifest, e.Keys().OperatorSigning); err != nil {
		t.Fatal(err)
	}
	return keys, manifest, t.TempDir()
}

const estateCallers = "studio,batch"

// liveSigners sees the issuer key of a live connection -- the field the live
// check stands on, pinned against a real server.
func TestLiveSignersSeesTheIssuerKey(t *testing.T) {
	e := estate.New(t)
	rund := e.ConnectWith(t, estate.RoleRund, nats.Name("rund-live"))
	defer rund.Close()
	ops := e.Connect(t, estate.RoleOps)
	by, err := liveSigners(ops, 2*time.Second, 1)
	if err != nil {
		t.Fatal(err)
	}
	garmSigner, _ := e.Keys().Accounts[topology.AccountGARM].Signing.PublicKey()
	for _, name := range by[garmSigner] {
		if name == "rund-live" {
			return
		}
	}
	t.Fatalf("rund-live not attributed to GARM's signing key %s; got %v", garmSigner, by)
}

// Property 11a: --verify-live refuses to retire a key still on the wire, naming
// the connection; with that connection closed, step two proceeds.
//
// The CALLER-studio account, because the estate itself keeps no connection in
// it: rotating GARM would leave the estate's own rund -- a process that has not
// rolled out -- on the old key, and --verify-live would rightly refuse forever.
// That is the check doing its job, and it is what the first draft of this test
// found.
func TestVerifyLiveRefusesWhileTheOldKeyIsStillOnTheWire(t *testing.T) {
	e := estate.New(t)
	keys, manifest, out := keysFromEstate(t, e)
	ops := e.CredsFile(t, estate.RoleOps)
	ca := e.CAFile(t)
	const account = topology.CallerPrefix + "studio"
	// a process on the OLD credential, named so the refusal can name it
	old := e.ConnectWith(t, estate.RoleCaller, nats.Name("studio-old"))
	// step one, through the command
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", estateCallers,
		"--rotate-signing", account, "--out", out)...); err != nil {
		t.Fatal(err)
	}
	e.PushAccount(t, mustRead(t, filepath.Join(out, "accounts", account+".jwt")))
	if !old.IsConnected() {
		t.Fatal("step one closed the old connection")
	}
	_, stderr, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", estateCallers,
		"--verify-live", "--nats", e.URL, "--ops-creds", ops, "--tls-ca", ca, "--out", out)...)
	if err == nil || !strings.Contains(err.Error()+stderr, "studio-old") {
		t.Fatalf("step two ran with the old key live; err=%v stderr=%s", err, stderr)
	}
	old.Close()
	time.Sleep(100 * time.Millisecond)
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", estateCallers,
		"--verify-live", "--nats", e.URL, "--ops-creds", ops, "--tls-ca", ca, "--out", out)...); err != nil {
		t.Fatalf("step two after the old connection closed: %v", err)
	}
}

// Review focus 4: with nothing retiring, --verify-live makes no connection.
func TestVerifyLiveIsInertWhenNothingIsRetiring(t *testing.T) {
	e := estate.New(t)
	keys, manifest, out := keysFromEstate(t, e)
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", estateCallers,
		"--verify-live", "--nats", "nats://127.0.0.1:1", "--ops-creds", "/nonexistent", "--out", out)...); err != nil {
		t.Fatalf("--verify-live tried to connect with nothing retiring: %v", err)
	}
}

// --status reports a retiring key and issues nothing.
func TestStatusReportsARetiringKeyAndIssuesNothing(t *testing.T) {
	e := estate.New(t)
	keys, manifest, out := keysFromEstate(t, e)
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", estateCallers,
		"--rotate-signing", topology.AccountGARM, "--out", out)...); err != nil {
		t.Fatal(err)
	}
	before := mustRead(t, manifest)
	stdout, _, err := runTopology(t, "--status", "--keys", keys, "--manifest", manifest)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(stdout, "GARM") || !strings.Contains(strings.ToLower(stdout), "retiring") {
		t.Fatalf("--status did not report GARM's retiring key:\n%s", stdout)
	}
	if mustRead(t, manifest) != before {
		t.Fatal("--status changed the manifest")
	}
	if _, statErr := os.Stat(filepath.Join(out, "accounts")); statErr != nil {
		t.Fatal("step one's output is gone") // sanity: the earlier issuance wrote it
	}
}

// Review finding 4: step one archives the superseded signing seed before the new
// one is written, and writes seeds atomically -- the old key is still listed on
// the live account, so its seed must survive, and a crash mid-write must not
// leave a truncated seed for the only key that can issue.
func TestRotationArchivesTheOldSigningSeed(t *testing.T) {
	e := estate.New(t)
	keys, manifest, out := keysFromEstate(t, e)
	const account = topology.CallerPrefix + "studio"
	oldSeed := mustRead(t, filepath.Join(keys, account+".signing.nk"))
	oldPub, _ := e.Keys().Accounts[account].Signing.PublicKey()
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", estateCallers,
		"--rotate-signing", account, "--out", out)...); err != nil {
		t.Fatal(err)
	}
	archived := filepath.Join(keys, "archive", account+".signing."+oldPub+".nk")
	if got := mustRead(t, archived); got != oldSeed {
		t.Fatalf("the superseded seed was not archived intact at %s", archived)
	}
	kp, err := readSeed(filepath.Join(keys, account+".signing.nk"))
	if err != nil {
		t.Fatal(err)
	}
	newPub, _ := kp.PublicKey()
	m, err := topology.Load(manifest, mustOperatorSigners(t, keys)...)
	if err != nil {
		t.Fatal(err)
	}
	if m.Accounts[account].Signing != newPub {
		t.Fatalf("the seed on disk (%s) is not the signing key the manifest records (%s)", newPub, m.Accounts[account].Signing)
	}
	if entries, _ := os.ReadDir(keys); len(entries) == 0 {
		t.Fatal("keys dir empty")
	}
	for _, en := range mustReadDir(t, keys) {
		if strings.HasSuffix(en, ".tmp") {
			t.Fatalf("a temp file was left behind: %s", en)
		}
	}
}

// Review finding 3: retiring a key is a decision, not a side effect of the next
// issuance -- it needs --verify-live, or --no-verify-live said on purpose -- and
// when it happens the command says so.
func TestRetirementNeedsAnExplicitDecisionAndIsAnnounced(t *testing.T) {
	e := estate.New(t)
	keys, manifest, out := keysFromEstate(t, e)
	const account = topology.CallerPrefix + "studio"
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", estateCallers,
		"--rotate-signing", account, "--out", out)...); err != nil {
		t.Fatal(err)
	}
	_, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", estateCallers, "--out", out)...)
	if err == nil || !strings.Contains(err.Error(), account) || !strings.Contains(err.Error(), "--verify-live") {
		t.Fatalf("a routine issuance retired a key without being asked; err = %v", err)
	}
	stdout, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", estateCallers,
		"--no-verify-live", "--out", out)...)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(stdout, "retired") || !strings.Contains(stdout, account) {
		t.Fatalf("the retirement was not announced:\n%s", stdout)
	}
}

// Review finding 5: CONNZ answers at most a page (1024 by default) per request;
// liveSigners pages until it has every connection, so a server with more
// connections than a page cannot hide one.
func TestLiveSignersPagesThroughConnz(t *testing.T) {
	e := estate.New(t)
	prev := connzPageSize
	connzPageSize = 1
	t.Cleanup(func() { connzPageSize = prev })
	for _, name := range []string{"page-a", "page-b", "page-c"} {
		c := e.ConnectWith(t, estate.RoleRund, nats.Name(name))
		defer c.Close()
	}
	ops := e.Connect(t, estate.RoleOps)
	by, err := liveSigners(ops, 2*time.Second, 1)
	if err != nil {
		t.Fatal(err)
	}
	garmSigner, _ := e.Keys().Accounts[topology.AccountGARM].Signing.PublicKey()
	seen := map[string]bool{}
	for _, name := range by[garmSigner] {
		seen[name] = true
	}
	for _, name := range []string{"page-a", "page-b", "page-c"} {
		if !seen[name] {
			t.Errorf("%s not seen with a page size of 1: %v", name, by[garmSigner])
		}
	}
}

// Review finding 5, the other edge: a cluster where fewer servers answer than
// expected is not evidence; --servers says how many must, and the default is one.
func TestVerifyLiveRefusesWhenFewerServersAnswerThanExpected(t *testing.T) {
	e := estate.New(t)
	keys, manifest, out := keysFromEstate(t, e)
	ops := e.CredsFile(t, estate.RoleOps)
	ca := e.CAFile(t)
	const account = topology.CallerPrefix + "studio"
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", estateCallers,
		"--rotate-signing", account, "--out", out)...); err != nil {
		t.Fatal(err)
	}
	_, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", estateCallers,
		"--verify-live", "--servers", "2", "--nats", e.URL, "--ops-creds", ops, "--tls-ca", ca, "--out", out)...)
	if err == nil || !strings.Contains(err.Error(), "2") || !strings.Contains(err.Error(), "server") {
		t.Fatalf("one server answered where two were expected, and step two ran; err = %v", err)
	}
}

// Review finding 7: a credential file that never landed is reissued on the next
// run, and the run says so -- the repair for an output that failed after the
// manifest was saved.
func TestAMissingCredentialFileIsReissued(t *testing.T) {
	e := estate.New(t)
	keys, manifest, out := keysFromEstate(t, e)
	// --rotate, so every credential is written into out (a continuation of the
	// estate's manifest would carry everything forward and write no files).
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", estateCallers, "--rotate", "--out", out)...); err != nil {
		t.Fatal(err)
	}
	lost := filepath.Join(out, "creds", "studio.creds")
	if err := os.Remove(lost); err != nil {
		t.Fatal(err)
	}
	stdout, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", estateCallers, "--out", out)...)
	if err != nil {
		t.Fatal(err)
	}
	if _, statErr := os.Stat(lost); statErr != nil {
		t.Fatal("the missing credential file was not reissued")
	}
	if !strings.Contains(stdout, "studio") || !strings.Contains(stdout, "missing") {
		t.Fatalf("the reissue was not announced:\n%s", stdout)
	}
}

// Review finding 6, end to end: after the operator signing key is replaced, the
// manifest the old key signed still loads -- the operator JWT still lists that
// key -- and an ordinary issuance continues under the new one.
func TestAManifestSignedByTheReplacedKeyStillLoads(t *testing.T) {
	e := estate.New(t)
	keys, manifest, out := keysFromEstate(t, e)
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", estateCallers, "--out", out)...); err != nil {
		t.Fatal(err)
	}
	root := filepath.Join(t.TempDir(), "root.nk")
	if err := writeSeed(root, e.OperatorRoot()); err != nil {
		t.Fatal(err)
	}
	replaced := filepath.Join(t.TempDir(), "replaced")
	if _, _, err := runOperator(t, "replace-signing-key", "--root", root, "--operator", filepath.Join(keys, "operator.jwt"), "--out", replaced); err != nil {
		t.Fatal(err)
	}
	for _, f := range []string{"operator.jwt", "operator-signing.nk"} {
		if err := os.WriteFile(filepath.Join(keys, f), []byte(mustRead(t, filepath.Join(replaced, f))), 0o600); err != nil {
			t.Fatal(err)
		}
	}
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", estateCallers, "--out", out)...); err != nil {
		t.Fatalf("the issuance after replacing the operator signing key: %v", err)
	}
}

func mustOperatorSigners(t *testing.T, keys string) []string {
	t.Helper()
	oc, err := jwt.DecodeOperatorClaims(mustRead(t, filepath.Join(keys, "operator.jwt")))
	if err != nil {
		t.Fatal(err)
	}
	return []string(oc.SigningKeys)
}

func mustReadDir(t *testing.T, dir string) []string {
	t.Helper()
	entries, err := os.ReadDir(dir)
	if err != nil {
		t.Fatal(err)
	}
	names := make([]string, 0, len(entries))
	for _, en := range entries {
		names = append(names, en.Name())
	}
	return names
}
