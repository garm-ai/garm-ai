package topology_test

import (
	"strings"
	"testing"
	"time"

	"github.com/garm-ai/garm-ai/topology"
)

// Spec §4.2: the delta reissues "credentials whose permission set changed" and
// revokes retired ones. Adding a caller changes exactly one thing, so exactly one
// credential is issued and nothing is revoked.
func TestOnlyWhatChangedIsIssued(t *testing.T) {
	keys := topology.FreshKeys([]string{"studio", "batch"})
	first, err := topology.Generate(topology.Input{
		Catalogue: weatherCatalogue(t), Callers: []string{"studio"},
		Previous: topology.Empty(), Keys: keys, Now: time.Now(),
	})
	if err != nil {
		t.Fatal(err)
	}
	second, err := topology.Generate(topology.Input{
		Catalogue: weatherCatalogue(t), Callers: []string{"studio", "batch"},
		Previous: &first.Manifest, Keys: keys, Now: time.Now(),
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(second.Credentials) != 1 || second.Credentials[0].Name != "batch" {
		t.Fatalf("issued %v, want exactly [batch]", names(second))
	}
	if len(second.Revoke) != 0 {
		t.Fatalf("adding a caller revoked %v", second.Revoke)
	}
	if len(second.Manifest.Entries) != len(first.Manifest.Entries)+1 {
		t.Fatalf("manifest has %d entries, want %d", len(second.Manifest.Entries), len(first.Manifest.Entries)+1)
	}
	// A carried entry still says which catalogue and generation it was issued from.
	for _, e := range second.Manifest.Entries {
		if e.Name == "rund" && e.Generation != 1 {
			t.Errorf("rund's entry claims generation %d; it was issued in 1 and not touched", e.Generation)
		}
	}
}

// Spec §5: rotation is "issue the new credential, restart that one process, revoke
// the old". It is asked for, never implied by a catalogue change.
func TestRotateReissuesEverything(t *testing.T) {
	keys := topology.FreshKeys([]string{"studio"})
	first, err := topology.Generate(topology.Input{
		Catalogue: weatherCatalogue(t), Callers: []string{"studio"},
		Previous: topology.Empty(), Keys: keys, Now: time.Now(),
	})
	if err != nil {
		t.Fatal(err)
	}
	rotated, err := topology.Generate(topology.Input{
		Catalogue: weatherCatalogue(t), Callers: []string{"studio"},
		Previous: &first.Manifest, Keys: keys, Now: time.Now(), Rotate: true,
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(rotated.Credentials) != len(first.Credentials) {
		t.Fatalf("rotation issued %d credentials, want all %d", len(rotated.Credentials), len(first.Credentials))
	}
	if len(rotated.Revoke) != len(first.Manifest.Entries) {
		t.Fatalf("rotation revoked %d, want all %d", len(rotated.Revoke), len(first.Manifest.Entries))
	}
	for _, r := range rotated.Revoke {
		if !strings.HasPrefix(r.Why, "superseded") {
			t.Errorf("rotation revoked %s for %q, want superseded", r.Public, r.Why)
		}
	}
}

// The permission hash is over the PERMISSION SET, so it is stable across runs and
// a reader can compare a credential's entry with what the gate would check.
func TestThePermissionsHashIsStableAcrossRuns(t *testing.T) {
	keys := topology.FreshKeys([]string{"studio"})
	a, _ := topology.Generate(topology.Input{Catalogue: weatherCatalogue(t), Callers: []string{"studio"},
		Previous: topology.Empty(), Keys: keys, Now: time.Now()})
	b, _ := topology.Generate(topology.Input{Catalogue: weatherCatalogue(t), Callers: []string{"studio"},
		Previous: topology.Empty(), Keys: keys, Now: time.Now().Add(time.Hour), Rotate: true})
	for i := range a.Manifest.Entries {
		if a.Manifest.Entries[i].PermissionsHash == "" {
			t.Fatalf("%s has no permissions hash", a.Manifest.Entries[i].Name)
		}
		if a.Manifest.Entries[i].PermissionsHash != b.Manifest.Entries[i].PermissionsHash {
			t.Errorf("%s: the hash changed between two issuances of the same permissions", a.Manifest.Entries[i].Name)
		}
	}
}
