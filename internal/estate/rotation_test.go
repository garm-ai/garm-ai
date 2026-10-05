package estate_test

import (
	"testing"
	"time"

	"github.com/nats-io/nats.go"

	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/topology"
)

// Properties 9 and 10, end to end on the live estate: between the steps both the
// old and the new rund credentials work; after step two's push the old one's
// live connection is closed and it is refused on reconnect, and the new one is
// untouched.
func TestRotationKeepsTheOldCredentialAliveUntilStepTwo(t *testing.T) {
	e := estate.New(t)
	oldJWT, oldSeed := e.Credential(estate.RoleRund)
	closed := make(chan struct{}, 1)
	oldConn := e.ConnectWith(t, estate.RoleRund, nats.NoReconnect(),
		nats.ClosedHandler(func(*nats.Conn) { closed <- struct{}{} }))

	stepOne := e.RotateSigning(t, topology.AccountGARM)
	e.PushAccount(t, stepOne.Accounts[topology.AccountGARM])
	time.Sleep(200 * time.Millisecond)
	if !oldConn.IsConnected() {
		t.Fatal("step one's push closed the OLD credential's connection; the old key must still be listed")
	}
	newConn := e.ConnectWith(t, estate.RoleRund) // the estate now holds the new credential
	if !newConn.IsConnected() {
		t.Fatal("the new credential could not connect between the steps")
	}

	stepTwo := e.Issue(t)
	e.PushAccount(t, stepTwo.Accounts[topology.AccountGARM])
	select {
	case <-closed:
	case <-time.After(5 * time.Second):
		t.Fatal("the old credential's connection survived the retirement push")
	}
	if nc, err := nats.Connect(e.URL, nats.UserJWTAndSeed(oldJWT, oldSeed), nats.Secure(e.TLS())); err == nil {
		nc.Close()
		t.Fatal("the old credential reconnected after its signing key was retired")
	}
	if !newConn.IsConnected() {
		t.Fatal("the new credential was disturbed by the retirement")
	}
}
