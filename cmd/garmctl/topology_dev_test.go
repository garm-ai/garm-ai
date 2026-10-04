package main

import (
	"os"
	"path/filepath"
	"testing"
	"time"

	natsserver "github.com/nats-io/nats-server/v2/server"

	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/natsconn"
)

// Found in review: the guide's quick start used nats-server flags that do not
// exist and a ca.pem that came from nowhere. --dev now writes a server
// configuration and the certificate it refers to, and this test starts a real
// server FROM THAT FILE and connects to it with a credential --dev wrote. If the
// quick start cannot run, this cannot pass.
func TestDevEmitsAServerConfigThatBootsAndAcceptsItsOwnCredentials(t *testing.T) {
	e := estate.New(t)
	out := t.TempDir()
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--dev", "--callers", "studio", "--out", out)...); err != nil {
		t.Fatal(err)
	}
	for _, f := range []string{"nats-server.conf", "ca.pem", "server.pem", "server-key.pem"} {
		if _, err := os.Stat(filepath.Join(out, f)); err != nil {
			t.Fatalf("--dev did not write %s", f)
		}
	}
	opts, err := natsserver.ProcessConfigFile(filepath.Join(out, "nats-server.conf"))
	if err != nil {
		t.Fatalf("the emitted nats-server.conf does not parse: %v", err)
	}
	opts.Port, opts.NoLog, opts.NoSigs = -1, true, true
	srv, err := natsserver.NewServer(opts)
	if err != nil {
		t.Fatalf("a server would not start from the emitted config: %v", err)
	}
	go srv.Start()
	defer srv.Shutdown()
	if !srv.ReadyForConnections(10 * time.Second) {
		t.Fatal("the server never became ready")
	}
	nc, err := natsconn.Connect(srv.ClientURL(), natsconn.Options{
		Creds: filepath.Join(out, "creds", "studio.creds"), CA: filepath.Join(out, "ca.pem"),
	})
	if err != nil {
		t.Fatalf("a --dev credential could not connect to the --dev server: %v", err)
	}
	defer nc.Close()
	if !nc.IsConnected() {
		t.Fatal("not connected")
	}
}

// Found in review: credentials were written before the manifest was saved, so a
// failure between the two left credentials on disk that no manifest recorded and
// no later run would ever revoke. The manifest is saved FIRST: an entry for a
// credential that never reached disk yields a harmless revocation later; the
// reverse yields a credential nothing can take back.
func TestTheManifestIsSavedBeforeAnyCredentialIsWritten(t *testing.T) {
	e := estate.New(t)
	dev := t.TempDir()
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--dev", "--callers", "studio", "--out", dev)...); err != nil {
		t.Fatal(err)
	}
	manifest := filepath.Join(t.TempDir(), "manifest.json")
	// --out is a FILE, so writing credentials into it must fail.
	notADir := filepath.Join(t.TempDir(), "out")
	if err := os.WriteFile(notADir, []byte("in the way"), 0o600); err != nil {
		t.Fatal(err)
	}
	_, _, err := runTopology(t, append(catalogueArgs(e),
		"--callers", "studio", "--keys", filepath.Join(dev, "keys"),
		"--manifest", manifest, "--first", "--out", notADir)...)
	if err == nil {
		t.Fatal("writing credentials into a file succeeded")
	}
	if _, statErr := os.Stat(manifest); statErr != nil {
		t.Fatal("the run failed before the manifest was saved; credentials it may have written are now unrevocable")
	}
}
