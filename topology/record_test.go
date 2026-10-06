package topology_test

import (
	"testing"
	"time"

	"github.com/nats-io/jwt/v2"

	"github.com/garm-ai/garm-ai/topology"
)

func day(n int) time.Time { return time.Date(2026, 10, n, 12, 0, 0, 0, time.UTC) }

// A revocation is PERMANENT until the credential's own expiry: an account JWT
// is rebuilt on every issuance, so the record of what was revoked has to be
// carried by the manifest into every later JWT, not only the one that did it.
// Found by the signing-keys review; this is the fix and its proof.
func TestARevocationIsCarriedAcrossGenerations(t *testing.T) {
	keys := topology.FreshKeys(nil)
	first, err := topology.Generate(topology.Input{Catalogue: weatherCatalogue(t), Previous: topology.Empty(), Keys: keys, Now: day(1)})
	if err != nil {
		t.Fatal(err)
	}
	var service string
	for _, e := range first.Manifest.Entries {
		if e.Account == topology.AccountTOOLS {
			service = e.Public
		}
	}
	second, err := topology.Generate(topology.Input{Catalogue: emptyCatalogue(t), Previous: &first.Manifest, Keys: keys, Now: day(2)})
	if err != nil {
		t.Fatal(err)
	}
	if len(second.Revoke) != 1 || second.Revoke[0].Public != service {
		t.Fatalf("the retirement revoked %v", second.Revoke)
	}
	// A third issuance with NOTHING changed: this issuance revokes nothing new...
	third, err := topology.Generate(topology.Input{Catalogue: emptyCatalogue(t), Previous: &second.Manifest, Keys: keys, Now: day(3)})
	if err != nil {
		t.Fatal(err)
	}
	if len(third.Revoke) != 0 {
		t.Fatalf("an unchanged catalogue revoked %v", third.Revoke)
	}
	// ...and the account JWT it writes STILL refuses the retired credential.
	ac, err := jwt.DecodeAccountClaims(third.Accounts[topology.AccountTOOLS])
	if err != nil {
		t.Fatal(err)
	}
	if _, revoked := ac.Revocations[service]; !revoked {
		t.Fatalf("generation 3's TOOLS account forgot generation 2's revocation; it carries %v", ac.Revocations)
	}
	// The manifest is where it lives: the record names the generation that did it.
	if n := len(third.Manifest.Revocations); n != 1 || third.Manifest.Revocations[0].Generation != 2 || third.Manifest.Revocations[0].Public != service {
		t.Fatalf("the manifest's revocation record: %+v", third.Manifest.Revocations)
	}
}

// Once the credential itself has expired the server would refuse it anyway,
// so its revocation leaves the record and the JWT stays small.
func TestARevocationIsPrunedOnceTheCredentialHasExpired(t *testing.T) {
	keys := topology.FreshKeys(nil)
	const life = 2 * time.Hour
	first, err := topology.Generate(topology.Input{Catalogue: weatherCatalogue(t), Previous: topology.Empty(), Keys: keys, Now: day(1), Expiry: life})
	if err != nil {
		t.Fatal(err)
	}
	second, err := topology.Generate(topology.Input{Catalogue: emptyCatalogue(t), Previous: &first.Manifest, Keys: keys, Now: day(1).Add(time.Hour), Expiry: life})
	if err != nil {
		t.Fatal(err)
	}
	if len(second.Manifest.Revocations) != 1 {
		t.Fatalf("record after the retirement: %+v", second.Manifest.Revocations)
	}
	// Still inside the credential's life: carried.
	third, err := topology.Generate(topology.Input{Catalogue: emptyCatalogue(t), Previous: &second.Manifest, Keys: keys, Now: day(1).Add(90 * time.Minute), Expiry: life})
	if err != nil {
		t.Fatal(err)
	}
	if len(third.Manifest.Revocations) != 1 {
		t.Fatalf("pruned before the credential expired: %+v", third.Manifest.Revocations)
	}
	// Past it: pruned from the record and from the JWT.
	fourth, err := topology.Generate(topology.Input{Catalogue: emptyCatalogue(t), Previous: &third.Manifest, Keys: keys, Now: day(1).Add(3 * time.Hour), Expiry: life})
	if err != nil {
		t.Fatal(err)
	}
	if len(fourth.Manifest.Revocations) != 0 {
		t.Fatalf("an expired credential's revocation was kept: %+v", fourth.Manifest.Revocations)
	}
	ac, err := jwt.DecodeAccountClaims(fourth.Accounts[topology.AccountTOOLS])
	if err != nil {
		t.Fatal(err)
	}
	if len(ac.Revocations) != 0 {
		t.Fatalf("the JWT still carries %v", ac.Revocations)
	}
}

// A caller that LEFT has no account in the topology, so its revocation lives
// in a tombstone account JWT -- and the tombstone is re-emitted on every
// issuance while the revocation lives, or the next push would forget it.
func TestATombstoneIsReemittedWhileItsRevocationLives(t *testing.T) {
	keys := topology.FreshKeys([]string{"studio"})
	first, err := topology.Generate(topology.Input{Catalogue: weatherCatalogue(t), Callers: []string{"studio"}, Previous: topology.Empty(), Keys: keys, Now: day(1)})
	if err != nil {
		t.Fatal(err)
	}
	second, err := topology.Generate(topology.Input{Catalogue: weatherCatalogue(t), Previous: &first.Manifest, Keys: keys, Now: day(2)})
	if err != nil {
		t.Fatal(err)
	}
	const studio = topology.CallerPrefix + "studio"
	if _, has := second.Accounts[studio]; !has {
		t.Fatal("the leaving caller's tombstone was not emitted at generation 2")
	}
	third, err := topology.Generate(topology.Input{Catalogue: weatherCatalogue(t), Previous: &second.Manifest, Keys: keys, Now: day(3)})
	if err != nil {
		t.Fatal(err)
	}
	encoded, has := third.Accounts[studio]
	if !has {
		t.Fatal("generation 3 forgot the tombstone, and with it the revocation")
	}
	ac, err := jwt.DecodeAccountClaims(encoded)
	if err != nil {
		t.Fatal(err)
	}
	if len(ac.Revocations) != 1 {
		t.Fatalf("the tombstone carries %v", ac.Revocations)
	}
}
