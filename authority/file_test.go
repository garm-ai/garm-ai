package authority_test

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/garm-ai/garm-ai/authority"
	"github.com/garm-ai/garm-ai/run"
)

// callers is the name-to-key table the file resolves through: in a deployment
// it is callers.json, which rund already takes.
var callers = map[string]string{
	"CALLER-studio": "ACSTUDIO",
	"CALLER-batch":  "ACBATCH",
	"CALLER-agent":  "ACAGENT",
}

func resolve(name string) (string, bool) { key, ok := callers[name]; return key, ok }

func loadGrants(t *testing.T, body string) (*authority.File, error) {
	t.Helper()
	path := filepath.Join(t.TempDir(), "grants.yaml")
	if err := os.WriteFile(path, []byte(body), 0o600); err != nil {
		t.Fatal(err)
	}
	return authority.LoadFile(path, resolve)
}

// one is a file with one grant, whose tools list is the argument -- the shape
// review focus 1 varies.
func one(tools string) string {
	return `schema: v1
compartments: [weather, payments]
grants:
  - principal: { kind: account, id: CALLER-studio }
    tools: [` + tools + `]
    compartments: [weather]
`
}

// Property 19: an unknown schema is refused naming the version understood.
func TestAnUnknownSchemaIsRefused(t *testing.T) {
	_, err := loadGrants(t, "schema: v2\ncompartments: []\ngrants: []\n")
	if err == nil || !strings.Contains(err.Error(), "v1") || !strings.Contains(err.Error(), "v2") {
		t.Fatalf("got %v, want a refusal naming both versions", err)
	}
	if _, err := loadGrants(t, "compartments: []\ngrants: []\n"); err == nil {
		t.Fatal("a file with no schema was accepted")
	}
}

// Review focus 1: a tool pattern is exact, one trailing ".*", or exactly "*".
// Anything else is refused when the file loads, naming the pattern -- never
// silently matching nothing (a grant that denies everything) or everything.
func TestAToolPatternMustBeExactOrATrailingStar(t *testing.T) {
	for _, bad := range []string{"weather.*.forecast", "weather*", "*.v1.get", "**", "weather.v1.*.*", ""} {
		_, err := loadGrants(t, one(`"`+bad+`"`))
		if err == nil {
			t.Errorf("pattern %q was accepted", bad)
			continue
		}
		if bad != "" && !strings.Contains(err.Error(), bad) {
			t.Errorf("pattern %q: the refusal does not name it: %v", bad, err)
		}
	}
	for _, ok := range []string{"weather.v1.get_forecast", "weather.v1.*", "*"} {
		if _, err := loadGrants(t, one(`"`+ok+`"`)); err != nil {
			t.Errorf("pattern %q: %v", ok, err)
		}
	}
}

// A grant naming an undeclared compartment is refused when the file loads -- a
// typo that would otherwise grant nothing, silently (spec §6).
func TestAGrantNamingAnUndeclaredCompartmentIsRefused(t *testing.T) {
	_, err := loadGrants(t, `schema: v1
compartments: [weather]
grants:
  - principal: { kind: account, id: CALLER-studio }
    tools: ["*"]
    compartments: [weather, payment]
`)
	if err == nil || !strings.Contains(err.Error(), "payment") {
		t.Fatalf("got %v, want a refusal naming the undeclared compartment", err)
	}
}

// A grant naming a principal the caller table does not know is refused, naming
// it: a grant that can never match is a configuration error.
func TestAGrantForAnUnknownPrincipalIsRefused(t *testing.T) {
	_, err := loadGrants(t, `schema: v1
compartments: [weather]
grants:
  - principal: { kind: account, id: CALLER-ghost }
    tools: ["*"]
    compartments: [weather]
`)
	if err == nil || !strings.Contains(err.Error(), "CALLER-ghost") {
		t.Fatalf("got %v, want a refusal naming the unknown principal", err)
	}
}

// A kind this build cannot prove is refused, naming it: a grant for a person
// would otherwise sit in the file matching nothing until auth callout exists.
func TestAPrincipalKindThisBuildCannotProveIsRefused(t *testing.T) {
	_, err := loadGrants(t, `schema: v1
compartments: [weather]
grants:
  - principal: { kind: person, id: p@example.com }
    tools: ["*"]
    compartments: [weather]
`)
	if err == nil || !strings.Contains(err.Error(), "person") {
		t.Fatalf("got %v, want a refusal naming the kind", err)
	}
}

// The file resolves NAMES to account keys: a grant is written for
// CALLER-studio, and it matches the principal whose ID is that account's key.
// A human reviews this file; 56 random characters invite a typo nobody can see.
func TestAGrantIsWrittenByNameAndMatchesByKey(t *testing.T) {
	f, err := loadGrants(t, one(`"weather.v1.*"`))
	if err != nil {
		t.Fatal(err)
	}
	got, err := f.For(context.Background(), run.Principal{Kind: run.KindAccount, ID: "ACSTUDIO"}, now)
	if err != nil || len(got) != 1 || !got[0].Admits("weather.v1.get_forecast") {
		t.Fatalf("%+v %v", got, err)
	}
	if got[0].ID == "" {
		t.Error("the grant has no id, so a decision cannot say what it relied on")
	}
	none, err := f.For(context.Background(), run.Principal{Kind: run.KindAccount, ID: "CALLER-studio"}, now)
	if err != nil || len(none) != 0 {
		t.Fatalf("a grant matched by NAME rather than by key: %+v", none)
	}
}

// An expired grant is not returned at all: the source filters by time, so the
// decision sees only live grants -- and a file of only expired grants is a
// principal that holds nothing.
func TestTheSourceFiltersExpiredGrants(t *testing.T) {
	f, err := loadGrants(t, `schema: v1
compartments: [weather]
grants:
  - principal: { kind: account, id: CALLER-studio }
    tools: ["*"]
    compartments: [weather]
    expires: 2026-10-08T11:00:00Z
  - principal: { kind: account, id: CALLER-studio }
    tools: ["weather.v1.*"]
    compartments: [weather]
    expires: 2026-10-09T00:00:00Z
`)
	if err != nil {
		t.Fatal(err)
	}
	got, _ := f.For(context.Background(), run.Principal{Kind: run.KindAccount, ID: "ACSTUDIO"}, now)
	if len(got) != 1 || got[0].Admits("payments.v1.x") {
		t.Fatalf("the expired grant was returned: %+v", got)
	}
}

// acts_for is parsed, typed, and carried onto the grant: the person an agent
// acts for, which the audit answers with (spec §8). Its kind need not be
// provable -- nobody authenticates as it in this build; it is recorded.
func TestActsForIsParsedAndCarried(t *testing.T) {
	f, err := loadGrants(t, `schema: v1
compartments: [payments]
grants:
  - principal: { kind: account, id: CALLER-agent }
    acts_for: { kind: person, id: p.laenen@example.com }
    tools: ["payments.v1.*"]
    compartments: [payments]
`)
	if err != nil {
		t.Fatal(err)
	}
	got, _ := f.For(context.Background(), run.Principal{Kind: run.KindAccount, ID: "ACAGENT"}, now)
	if len(got) != 1 || got[0].ActsFor == nil {
		t.Fatalf("%+v", got)
	}
	if *got[0].ActsFor != (run.Principal{Kind: run.KindPerson, ID: "p.laenen@example.com"}) {
		t.Fatalf("acts_for = %+v", *got[0].ActsFor)
	}
}

// The vocabulary and the generation are what rund's boot checks and its reload
// line need.
func TestTheFileReportsItsVocabularyAndGeneration(t *testing.T) {
	f, err := loadGrants(t, one(`"*"`))
	if err != nil {
		t.Fatal(err)
	}
	if v := f.Vocabulary(); len(v) != 2 || v[0] != "payments" || v[1] != "weather" {
		t.Fatalf("vocabulary %v, want the declared compartments, sorted", v)
	}
	if g := f.Generation(); len(g) != 12 {
		t.Fatalf("generation %q, want twelve hex characters of the digest", g)
	}
	other, err := loadGrants(t, one(`"weather.v1.*"`))
	if err != nil {
		t.Fatal(err)
	}
	if other.Generation() == f.Generation() {
		t.Error("two different files share a generation")
	}
}

// An unreadable or malformed file is an error naming the path, never a source
// that silently grants nothing.
func TestAMalformedFileIsRefusedNamingThePath(t *testing.T) {
	path := filepath.Join(t.TempDir(), "grants.yaml")
	if err := os.WriteFile(path, []byte("schema: v1\ngrants: [this is not a grant]\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	if _, err := authority.LoadFile(path, resolve); err == nil || !strings.Contains(err.Error(), path) {
		t.Fatalf("got %v, want a refusal naming %s", err, path)
	}
	if _, err := authority.LoadFile(filepath.Join(t.TempDir(), "absent.yaml"), resolve); err == nil {
		t.Fatal("a missing file loaded")
	}
}

var _ = time.Time{}
