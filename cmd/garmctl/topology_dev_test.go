package main

import (
	"fmt"
	"net"
	"os"
	"path/filepath"
	"strings"
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
	opts.Port, opts.HTTPPort, opts.NoLog, opts.NoSigs = -1, 0, true, true
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

// --dev also writes a config for a CONTAINER: paths relative to the config's
// directory and a listen on every interface, because nats-server resolves file
// paths against its working directory and a container's is /topo. The test
// boots a server from it with that working directory, exactly as compose does.
func TestDevEmitsAContainerConfigThatBootsFromItsOwnDirectory(t *testing.T) {
	e := estate.New(t)
	out := t.TempDir()
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--dev", "--callers", "studio", "--out", out)...); err != nil {
		t.Fatal(err)
	}
	conf := mustRead(t, filepath.Join(out, "nats-server.docker.conf"))
	for _, abs := range []string{out, "127.0.0.1:4222"} {
		if strings.Contains(conf, abs) {
			t.Fatalf("the container config carries %q; it must be relative and listen on every interface:\n%s", abs, conf)
		}
	}
	t.Chdir(out)
	opts, err := natsserver.ProcessConfigFile("nats-server.docker.conf")
	if err != nil {
		t.Fatalf("the container config does not parse from its own directory: %v", err)
	}
	// Random client port, monitoring off: the config's 0.0.0.0:8222 is for the
	// container's health check and collides with whatever a laptop runs there.
	opts.Port, opts.HTTPPort, opts.NoLog, opts.NoSigs = -1, 0, true, true
	srv, err := natsserver.NewServer(opts)
	if err != nil {
		t.Fatalf("a server would not start from the container config: %v", err)
	}
	go srv.Start()
	defer srv.Shutdown()
	if !srv.ReadyForConnections(10 * time.Second) {
		t.Fatal("the server never became ready")
	}
	// Through 127.0.0.1, as a client reaches the container's mapped port: the
	// certificate is for 127.0.0.1 and localhost, and 0.0.0.0 is a listen
	// address, not a name a client dials.
	url := fmt.Sprintf("nats://127.0.0.1:%d", srv.Addr().(*net.TCPAddr).Port)
	nc, err := natsconn.Connect(url, natsconn.Options{
		Creds: filepath.Join(out, "creds", "studio.creds"), CA: filepath.Join(out, "ca.pem"),
	})
	if err != nil {
		t.Fatalf("a --dev credential could not connect to the server booted from the container config: %v", err)
	}
	nc.Close()
}
