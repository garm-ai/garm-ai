package topology_test

import (
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/nats-io/jwt/v2"

	"github.com/garm-ai/garm-ai/topology"
)

// Property 8a: removing a tool produces a REVOCATION, not merely a smaller next
// credential. Proved with a catalogue that has no tool at all, so the service
// disappears entirely.
func TestRetiringAServiceRevokesItsCredential(t *testing.T) {
	keys := topology.FreshKeys(nil)
	first, err := topology.Generate(topology.Input{
		Catalogue: weatherCatalogue(t), Previous: topology.Empty(), Keys: keys,
		Now: time.Date(2026, 10, 4, 12, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatal(err)
	}
	// The same catalogue again. Every credential is REISSUED with a fresh key and
	// the previous one revoked as superseded (spec §5) -- but nothing is retired.
	again, err := topology.Generate(topology.Input{
		Catalogue: weatherCatalogue(t), Previous: &first.Manifest, Keys: keys,
		Now: time.Date(2026, 10, 5, 12, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(again.Revoke) != len(first.Manifest.Entries) {
		t.Fatalf("an unchanged catalogue revoked %d of %d previous credentials", len(again.Revoke), len(first.Manifest.Entries))
	}
	for _, r := range again.Revoke {
		if !strings.HasPrefix(r.Why, "superseded") {
			t.Errorf("an unchanged catalogue revoked %s for %q, want superseded", r.Public, r.Why)
		}
	}
	// Now a catalogue with no tools: the tool service is retired.
	third, err := topology.Generate(topology.Input{
		Catalogue: emptyCatalogue(t), Previous: &again.Manifest, Keys: keys,
		Now: time.Date(2026, 10, 6, 12, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatal(err)
	}
	var retired bool
	for _, r := range third.Revoke {
		if r.Account == topology.AccountTOOLS && strings.HasPrefix(r.Why, "retired") {
			retired = true
		}
	}
	if !retired {
		t.Fatalf("the retired tool service was not revoked as retired: %v", third.Revoke)
	}
	// And the revocation is IN the account JWT, where the server reads it.
	ac, err := jwt.DecodeAccountClaims(third.Accounts[topology.AccountTOOLS])
	if err != nil {
		t.Fatal(err)
	}
	if len(ac.Revocations) == 0 {
		t.Fatal("the revocation did not reach the TOOLS account claims")
	}
}

// Property 13: no manifest, no run.
func TestTheGeneratorRefusesToRunWithoutAManifest(t *testing.T) {
	_, err := topology.Generate(topology.Input{
		Catalogue: weatherCatalogue(t), Previous: nil, Keys: topology.FreshKeys(nil), Now: time.Now(),
	})
	if err == nil {
		t.Fatal("Generate ran with no previous manifest; it would never revoke anything")
	}
}

// Review Focus 3: a manifest whose digest matches but is missing a service must
// ISSUE for that service, not treat it as unchanged.
func TestAManifestMissingAServiceCausesAnIssuance(t *testing.T) {
	keys := topology.FreshKeys(nil)
	first, err := topology.Generate(topology.Input{
		Catalogue: weatherCatalogue(t), Previous: topology.Empty(), Keys: keys, Now: time.Now(),
	})
	if err != nil {
		t.Fatal(err)
	}
	pruned := first.Manifest
	pruned.Entries = nil
	for _, e := range first.Manifest.Entries {
		if e.Account != topology.AccountTOOLS {
			pruned.Entries = append(pruned.Entries, e)
		}
	}
	second, err := topology.Generate(topology.Input{
		Catalogue: weatherCatalogue(t), Previous: &pruned, Keys: keys, Now: time.Now(),
	})
	if err != nil {
		t.Fatal(err)
	}
	var issued bool
	for _, e := range second.Manifest.Entries {
		if e.Account == topology.AccountTOOLS {
			issued = true
		}
	}
	if !issued {
		t.Fatal("the service absent from the manifest was not issued a credential")
	}
}

// The manifest round-trips through disk, signed, and a tampered one is refused.
func TestTheManifestIsSignedAndATamperedOneIsRefused(t *testing.T) {
	keys := topology.FreshKeys(nil)
	out, err := topology.Generate(topology.Input{
		Catalogue: weatherCatalogue(t), Previous: topology.Empty(), Keys: keys, Now: time.Now(),
	})
	if err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(t.TempDir(), "manifest.json")
	if err := out.Manifest.Save(path, keys.Operator); err != nil {
		t.Fatal(err)
	}
	opPub, _ := keys.Operator.PublicKey()
	back, err := topology.Load(path, opPub)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if back.Generation != out.Manifest.Generation || len(back.Entries) != len(out.Manifest.Entries) {
		t.Fatal("the manifest did not round-trip")
	}
	other := topology.FreshKeys(nil)
	otherPub, _ := other.Operator.PublicKey()
	if _, err := topology.Load(path, otherPub); err == nil {
		t.Fatal("a manifest signed by one key verified under another")
	}
}
