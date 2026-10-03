package estate_test

import (
	"bufio"
	"net"
	"strings"
	"testing"
	"time"

	"github.com/garm-ai/garm-ai/internal/estate"
)

// Property 11: the server refuses a connection that will not speak TLS.
//
// Not tested through nats.go, and the reason is a finding: a nats.go client with
// no TLS option sees `tls_required` in the server's INFO and UPGRADES TO TLS ON
// ITS OWN -- then fails on the untrusted test certificate. A test written that way
// passed with TLS made optional on the server, because the client was being
// refused by its own certificate check, not by the server. So this speaks the
// protocol directly: read INFO, send CONNECT in cleartext, and expect the server
// to say no.
func TestPlainTextIsRefused(t *testing.T) {
	e := estate.New(t)
	// ClientURL reports tls:// once TLS is configured; either scheme is just a prefix.
	addr := strings.TrimPrefix(strings.TrimPrefix(e.URL, "nats://"), "tls://")
	conn, err := net.DialTimeout("tcp", addr, 2*time.Second)
	if err != nil {
		t.Fatal(err)
	}
	defer conn.Close()
	_ = conn.SetDeadline(time.Now().Add(3 * time.Second))
	r := bufio.NewReader(conn)

	info, err := r.ReadString('\n')
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(info, `"tls_required":true`) {
		t.Fatalf("the server does not advertise tls_required: %s", info)
	}
	// A CONNECT in the clear. A valid credential is beside the point -- the server
	// must refuse before it looks at one.
	if _, err := conn.Write([]byte(`CONNECT {"verbose":false,"pedantic":false}` + "\r\nPING\r\n")); err != nil {
		t.Fatal(err)
	}
	reply, err := r.ReadString('\n')
	if err == nil && strings.HasPrefix(reply, "+OK") {
		t.Fatalf("a cleartext CONNECT was accepted: %q", reply)
	}
	if err == nil && strings.HasPrefix(reply, "PONG") {
		t.Fatal("a cleartext connection reached PING/PONG: the server accepted it")
	}
	// Either -ERR or a closed connection is a refusal.
	if err == nil && !strings.HasPrefix(reply, "-ERR") {
		t.Fatalf("unexpected reply to a cleartext CONNECT: %q", reply)
	}
}
