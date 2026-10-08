package topology_test

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/nats-io/jwt/v2"
	"github.com/nats-io/nkeys"

	"github.com/garm-ai/garm-ai/topology"
)

// accountKey is a real public account key, which the caller table requires.
func accountKey(t *testing.T) string {
	t.Helper()
	kp, err := nkeys.CreateAccount()
	if err != nil {
		t.Fatal(err)
	}
	pub, err := kp.PublicKey()
	if err != nil {
		t.Fatal(err)
	}
	return pub
}

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

// CallerKeys is the inverse of the table Callers writes: a grant file names
// "CALLER-studio" and the table names "studio", so the prefix lives here --
// in the package that owns it -- rather than in each binary that reads grants.
func TestCallerKeysResolvesAGrantsPrincipalNameToItsAccount(t *testing.T) {
	path := filepath.Join(t.TempDir(), "callers.json")
	if err := os.WriteFile(path, []byte(`{"studio":"`+accountKey(t)+`"}`), 0o600); err != nil {
		t.Fatal(err)
	}
	resolve, err := topology.CallerKeys(path)
	if err != nil {
		t.Fatal(err)
	}
	key, ok := resolve("CALLER-studio")
	if !ok || key == "" {
		t.Fatalf("CALLER-studio did not resolve: %q %v", key, ok)
	}
	if _, ok := resolve("studio"); ok {
		t.Error("the unprefixed name resolved; a grant file names the ACCOUNT, which carries the prefix")
	}
	if _, ok := resolve("CALLER-nobody"); ok {
		t.Error("an unknown name resolved")
	}
}

// A broken table is refused here, not resolved to nothing: every grant would
// otherwise fail to match and every call be refused "no grant".
func TestCallerKeysRefusesABrokenTable(t *testing.T) {
	path := filepath.Join(t.TempDir(), "callers.json")
	if err := os.WriteFile(path, []byte(`{not json`), 0o600); err != nil {
		t.Fatal(err)
	}
	if _, err := topology.CallerKeys(path); err == nil || !strings.Contains(err.Error(), path) {
		t.Fatalf("err = %v, want one naming %s", err, path)
	}
}
