package topology_test

import (
	"strings"
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

// A revocation needs the account's signing key. Without it the generator cannot do
// what the manifest obliges it to, and must say so rather than silently not revoke.
func TestRetiringACallerWithoutItsKeyIsRefused(t *testing.T) {
	keys := topology.FreshKeys([]string{"studio"})
	first, err := topology.Generate(topology.Input{
		Catalogue: weatherCatalogue(t), Callers: []string{"studio"},
		Previous: topology.Empty(), Keys: keys, Now: time.Now(),
	})
	if err != nil {
		t.Fatal(err)
	}
	delete(keys.Accounts, topology.CallerPrefix+"studio")
	_, err = topology.Generate(topology.Input{
		Catalogue: weatherCatalogue(t), Callers: nil,
		Previous: &first.Manifest, Keys: keys, Now: time.Now(),
	})
	if err == nil {
		t.Fatal("a retirement with no key to revoke with was accepted")
	}
	if !strings.Contains(err.Error(), "CALLER-studio") {
		t.Errorf("the refusal does not name the account: %v", err)
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
