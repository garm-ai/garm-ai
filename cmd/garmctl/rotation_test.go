package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

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
	by, err := liveSigners(ops, 2*time.Second)
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
