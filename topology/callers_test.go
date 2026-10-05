package topology_test

import (
	"testing"
	"time"

	"github.com/nats-io/jwt/v2"

	"github.com/garm-ai/garm-ai/topology"
)

// Found in review: dropping a caller from Callers left its previous entry with no
// account to revoke in, and the generator dereferenced nil. A partner leaving is a
// legitimate operation; the only thing allowed to build the topology must not
// crash on it.
func TestRetiringACallerRevokesItsCredentialAndEmitsATombstone(t *testing.T) {
	keys := topology.FreshKeys([]string{"studio"})
	first, err := topology.Generate(topology.Input{
		Catalogue: weatherCatalogue(t), Callers: []string{"studio"},
		Previous: topology.Empty(), Keys: keys, Now: time.Now(),
	})
	if err != nil {
		t.Fatal(err)
	}
	second, err := topology.Generate(topology.Input{
		Catalogue: weatherCatalogue(t), Callers: nil, // studio has left
		Previous: &first.Manifest, Keys: keys, Now: time.Now(),
	})
	if err != nil {
		t.Fatalf("retiring a caller: %v", err)
	}
	encoded, ok := second.Accounts[topology.CallerPrefix+"studio"]
	if !ok {
		t.Fatal("the retired caller's account was not emitted; its revocation has nowhere to land")
	}
	ac, err := jwt.DecodeAccountClaims(encoded)
	if err != nil {
		t.Fatal(err)
	}
	if len(ac.Revocations) == 0 {
		t.Fatal("the retired caller's credential was not revoked in its account")
	}
	if len(ac.Imports) != 0 {
		t.Errorf("a retired caller still imports %v; a tombstone reaches nothing", ac.Imports)
	}
	for _, c := range second.Credentials {
		if c.Name == "studio" {
			t.Error("a retired caller was issued a new credential")
		}
	}
}

// A tombstone needs no key of the departed account: it is built from the
// manifest's record of the account and signed by the operator signing key like
// any other. (Under the old shape this test asserted a refusal without the
// account's key; the manifest now carries what the tombstone needs.)
func TestRetiringACallerWhoseKeysAreGoneStillEmitsATombstone(t *testing.T) {
	keys := topology.FreshKeys([]string{"studio"})
	first, err := topology.Generate(topology.Input{
		Catalogue: weatherCatalogue(t), Callers: []string{"studio"},
		Previous: topology.Empty(), Keys: keys, Now: time.Now(),
	})
	if err != nil {
		t.Fatal(err)
	}
	delete(keys.Accounts, topology.CallerPrefix+"studio")
	second, err := topology.Generate(topology.Input{
		Catalogue: weatherCatalogue(t), Callers: nil,
		Previous: &first.Manifest, Keys: keys, Now: time.Now(),
	})
	if err != nil {
		t.Fatalf("retiring a caller whose keys are gone: %v", err)
	}
	ac, err := jwt.DecodeAccountClaims(second.Accounts[topology.CallerPrefix+"studio"])
	if err != nil {
		t.Fatal(err)
	}
	opPub, _ := keys.OperatorSigning.PublicKey()
	if ac.Issuer != opPub || len(ac.Revocations) == 0 {
		t.Fatalf("tombstone issued by %s with %d revocations", ac.Issuer, len(ac.Revocations))
	}
	if ac.Subject != first.Manifest.Accounts[topology.CallerPrefix+"studio"].Identity {
		t.Error("the tombstone is not the departed account")
	}
}

// Found in review: a caller named "rund" issued a second credential called rund,
// which garmctl topology then wrote over rund's own file; a duplicate name dropped
// out of the manifest's delta; "../evil" wrote outside the creds directory.
func TestCallerNamesThatWouldCollideOrEscapeAreRefused(t *testing.T) {
	for _, bad := range [][]string{
		{"rund"},                      // another credential's name
		{"ops"},                       // another credential's name
		{"weather.v1.WeatherService"}, // a tool service's name
		{"studio", "studio"},          // a duplicate
		{"../evil"},                   // a path
		{"a b"},                       // a space
		{"studio/x"},                  // a separator
	} {
		_, err := topology.Generate(topology.Input{
			Catalogue: weatherCatalogue(t), Callers: bad,
			Previous: topology.Empty(), Keys: topology.FreshKeys(bad), Now: time.Now(),
		})
		if err == nil {
			t.Errorf("callers %v were accepted", bad)
		}
	}
	// And the charset that IS allowed still is.
	if _, err := topology.Generate(topology.Input{
		Catalogue: weatherCatalogue(t), Callers: []string{"batch-x_2"},
		Previous: topology.Empty(), Keys: topology.FreshKeys([]string{"batch-x_2"}), Now: time.Now(),
	}); err != nil {
		t.Errorf("a legal caller name was refused: %v", err)
	}
}
