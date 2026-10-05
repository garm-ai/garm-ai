package estate_test

import (
	"strings"
	"testing"
	"time"

	"github.com/nats-io/jwt/v2"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nkeys"

	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/topology"
)

// Property 1: the SERVER refuses an account signed by the root. Strict
// signing-key usage is on in the operator JWT; the push over $SYS is the path a
// deployment takes, and the resolver says no.
func TestTheServerRefusesAnAccountSignedByTheRoot(t *testing.T) {
	e := estate.New(t)
	keys := e.Keys()
	ac := jwt.NewAccountClaims(keys.Accounts[topology.AccountTOOLS].Identity)
	ac.Name = topology.AccountTOOLS
	sp, _ := keys.Accounts[topology.AccountTOOLS].Signing.PublicKey()
	ac.SigningKeys.Add(sp)
	rootSigned, err := ac.Encode(e.OperatorRoot())
	if err != nil {
		t.Fatal(err)
	}
	if err := e.TryPushAccount(t, rootSigned); err == nil {
		t.Fatal("the server accepted an account signed by the root; strict signing-key usage is not in force")
	}
}

// Property 2: the SERVER refuses a user signed by the account's identity key.
// The estate holds no identity seeds -- Keys.Accounts[].Identity is a public key
// -- so this test mints an account of its own, pushes it (signed correctly), and
// then signs a user with the identity seed it still has.
func TestTheServerRefusesAUserSignedByAnIdentityKey(t *testing.T) {
	e := estate.New(t)
	id, _ := nkeys.CreateAccount()
	idPub, _ := id.PublicKey()
	sign, _ := nkeys.CreateAccount()
	signPub, _ := sign.PublicKey()
	ac := jwt.NewAccountClaims(idPub)
	ac.Name = "PROBE"
	ac.SigningKeys.Add(signPub)
	encoded, err := ac.Encode(e.Keys().OperatorSigning)
	if err != nil {
		t.Fatal(err)
	}
	e.PushAccount(t, encoded)

	user := func(signer nkeys.KeyPair) (string, string) {
		ukp, _ := nkeys.CreateUser()
		upub, _ := ukp.PublicKey()
		seed, _ := ukp.Seed()
		uc := jwt.NewUserClaims(upub)
		uc.IssuerAccount = idPub
		tok, err := uc.Encode(signer)
		if err != nil {
			t.Fatal(err)
		}
		return tok, string(seed)
	}
	badJWT, badSeed := user(id)
	if nc, err := nats.Connect(e.URL, nats.UserJWTAndSeed(badJWT, badSeed), nats.Secure(e.TLS()), nats.Timeout(2*time.Second)); err == nil {
		nc.Close()
		t.Fatal("a user signed by the identity key connected")
	} else if !strings.Contains(strings.ToLower(err.Error()), "authorization") {
		t.Fatalf("refused for the wrong reason: %v", err)
	}
	goodJWT, goodSeed := user(sign)
	nc, err := nats.Connect(e.URL, nats.UserJWTAndSeed(goodJWT, goodSeed), nats.Secure(e.TLS()))
	if err != nil {
		t.Fatalf("the same user signed by the signing key was refused: %v", err)
	}
	nc.Close()
}
