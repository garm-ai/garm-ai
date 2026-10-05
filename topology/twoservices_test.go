package topology_test

import (
	"sort"
	"testing"
	"time"

	"github.com/garm-ai/garm-ai/internal/fixtures"
	"github.com/garm-ai/garm-ai/topology"
)

// Review Focus 2: two services, two users, each with exactly its own subjects.
// Review Focus 5: a name with the charset `declared` permits yields a literal
// subject -- no wildcard, no escaping, no re-validation.
func TestTwoServicesGetTwoCredentialsWithDisjointSubjects(t *testing.T) {
	out, err := topology.Generate(topology.Input{
		Catalogue: fixtures.TwoServices(t).Catalogue, Callers: []string{"studio"},
		Previous: topology.Empty(), Keys: topology.FreshKeys([]string{"studio"}), Now: time.Now(),
	})
	if err != nil {
		t.Fatalf("Generate: %v", err)
	}
	a := credential(t, out, "weather.v1.WeatherService")
	b := credential(t, out, fixtures.SecondService)

	subs := func(allow []string) []string {
		s := append([]string(nil), allow...)
		sort.Strings(s)
		return s
	}
	wantA := []string{"$SRV.>", "garm.tool.weather.v1.get_forecast", "garm.tool.weather.v1.schedule_report"}
	wantB := []string{"$SRV.>", "garm.tool." + fixtures.SecondTool}
	if got := subs(a.Permissions.Sub.Allow); len(got) != 3 || got[0] != wantA[0] || got[1] != wantA[1] || got[2] != wantA[2] {
		t.Errorf("weather.v1.WeatherService may subscribe %v, want %v", got, wantA)
	}
	if got := subs(b.Permissions.Sub.Allow); len(got) != 2 || got[0] != wantB[0] || got[1] != wantB[1] {
		t.Errorf(fixtures.SecondService+" may subscribe %v, want %v", got, wantB)
	}
	for _, s := range a.Permissions.Sub.Allow {
		if s == "garm.tool."+fixtures.SecondTool {
			t.Error("the first service may subscribe to the second's tool")
		}
	}
}
