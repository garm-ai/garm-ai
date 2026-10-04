package topology_test

import (
	"testing"
	"time"

	"github.com/garm-ai/garm-ai/internal/fixtures"
	"github.com/garm-ai/garm-ai/topology"
)

// callers.json is name -> account public key, callers ONLY -- never SYS, GARM
// or TOOLS, which are not callers and whose keys a dashboard has no use for.
func TestCallerNamesIsEveryCallerAndNothingElse(t *testing.T) {
	keys := topology.FreshKeys([]string{"studio", "batch"})
	out, err := topology.Generate(topology.Input{Catalogue: fixtures.Weather(t).Catalogue,
		Callers: []string{"studio", "batch"}, Previous: topology.Empty(), Keys: keys, Now: time.Now()})
	if err != nil {
		t.Fatal(err)
	}
	names, err := topology.CallerNames(out)
	if err != nil {
		t.Fatal(err)
	}
	if len(names) != 2 {
		t.Fatalf("want 2 callers, got %v", names)
	}
	want, _ := keys.Accounts[topology.CallerPrefix+"studio"].PublicKey()
	if names["studio"] != want {
		t.Errorf("studio -> %q, want %s", names["studio"], want)
	}
}
