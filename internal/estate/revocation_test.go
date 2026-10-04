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
// else -- INCLUDING the other user of the same account. The zombie case of spec
// §4.2, end to end through the real resolver, not the server's update method
// called directly, which would prove the disconnect but not the path.
//
// Two tool services share TOOLS. Retiring ONE of them (the catalogue goes back
// to weather only) must close exactly that one's connection.
func TestARevocationPushedOverSYSClosesOnlyTheRevokedConnection(t *testing.T) {
	e := estate.New(t)

	// Both tool users hold their credentials, with reconnects OFF so a server-side
	// close surfaces as closed rather than as a retry loop the test cannot see.
	closed2 := make(chan struct{}, 1)
	tool2 := e.ConnectWith(t, estate.RoleTool2, nats.NoReconnect(),
		nats.ClosedHandler(func(*nats.Conn) { closed2 <- struct{}{} }))
	closed1 := make(chan struct{}, 1)
	tool1 := e.ConnectWith(t, estate.RoleTool, nats.NoReconnect(),
		nats.ClosedHandler(func(*nats.Conn) { closed1 <- struct{}{} }))
	rund := e.ConnectWith(t, estate.RoleRund, nats.NoReconnect())
	if !tool1.IsConnected() || !tool2.IsConnected() {
		t.Fatal("a tool is not connected before the revocation")
	}

	// The second service leaves the catalogue; the first stays.
	reissued := e.Reissue(t, estate.WeatherCatalogue(t))
	var retired int
	for _, r := range reissued.Revoke {
		if r.Account == topology.AccountTOOLS {
			retired++
		}
	}
	if retired != 1 {
		t.Fatalf("retiring one of two services revoked %d TOOLS credentials: %v", retired, reissued.Revoke)
	}

	// The push, as operations would do it.
	e.PushAccount(t, reissued.Accounts[topology.AccountTOOLS])

	select {
	case <-closed2:
	case <-time.After(5 * time.Second):
		t.Fatal("the revoked tool connection is still open 5s after the push")
	}
	// Refused on a fresh connection too, with the credential it still holds.
	jwtToken, seed := e.Credential(estate.RoleTool2)
	if nc, err := nats.Connect(e.URL, nats.UserJWTAndSeed(jwtToken, seed), nats.Secure(e.TLS())); err == nil {
		nc.Close()
		t.Fatal("the revoked credential connected again")
	}
	// And nobody else noticed -- the OTHER user of the SAME account first.
	select {
	case <-closed1:
		t.Fatal("the surviving tool service, in the same account, was disconnected by its neighbour's revocation")
	default:
	}
	if !tool1.IsConnected() {
		t.Fatal("the surviving tool service is no longer connected")
	}
	if !rund.IsConnected() {
		t.Fatal("rund, in another account, was disconnected")
	}
}
