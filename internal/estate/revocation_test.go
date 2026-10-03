package estate_test

import (
	"testing"
	"time"

	"github.com/nats-io/nats.go"

	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/topology"
)

// Properties 8 and 8c: a revocation pushed over $SYS closes a LIVE connection
// holding the revoked credential, refuses it on reconnect, and touches nobody
// else. The zombie case of spec §4.2, end to end through the real resolver --
// not the server's update method called directly, which would prove the
// disconnect but not the path.
func TestARevocationPushedOverSYSClosesALiveConnection(t *testing.T) {
	e := estate.New(t)

	// A tool service holding its credential, with reconnects OFF so a server-side
	// close surfaces as closed rather than as a retry loop the test cannot see.
	closed := make(chan struct{}, 1)
	tool := e.ConnectWith(t, estate.RoleTool, nats.NoReconnect(),
		nats.ClosedHandler(func(*nats.Conn) { closed <- struct{}{} }))
	if !tool.IsConnected() {
		t.Fatal("the tool is not connected before the revocation")
	}
	rund := e.ConnectWith(t, estate.RoleRund, nats.NoReconnect())

	// The catalogue loses its tools: the generator, against this estate's own
	// manifest and keys, retires the tool service and revokes its credential in
	// the TOOLS account JWT.
	reissued := e.Reissue(t, estate.EmptyCatalogue(t))
	var retired bool
	for _, r := range reissued.Revoke {
		if r.Account == topology.AccountTOOLS {
			retired = true
		}
	}
	if !retired {
		t.Fatalf("the reissue revoked nothing in TOOLS: %v", reissued.Revoke)
	}

	// The push, as operations would do it.
	e.PushAccount(t, reissued.Accounts[topology.AccountTOOLS])

	select {
	case <-closed:
	case <-time.After(5 * time.Second):
		t.Fatal("the revoked tool connection is still open 5s after the push")
	}
	// Refused on a fresh connection too, with the credential it still holds.
	jwtToken, seed := e.Credential(estate.RoleTool)
	if nc, err := nats.Connect(e.URL, nats.UserJWTAndSeed(jwtToken, seed), nats.Secure(e.TLS())); err == nil {
		nc.Close()
		t.Fatal("the revoked credential connected again")
	}
	// And nobody else noticed: rund, in GARM, is untouched.
	if !rund.IsConnected() {
		t.Fatal("rund was disconnected by a revocation in another account")
	}
}
