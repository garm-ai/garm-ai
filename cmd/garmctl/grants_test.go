package main

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/nats-io/nkeys"

	"github.com/garm-ai/garm-ai/internal/fixtures"
)

func runGrants(t *testing.T, args ...string) (stdout, stderr string, err error) {
	t.Helper()
	cmd := grantsCmd()
	var out, errOut bytes.Buffer
	cmd.SetOut(&out)
	cmd.SetErr(&errOut)
	cmd.SilenceUsage, cmd.SilenceErrors = true, true
	cmd.SetArgs(args)
	err = cmd.Execute()
	return out.String(), errOut.String(), err
}

// callersFile writes the name -> account key table `garmctl topology` writes
// and `rund --callers` reads, with a real account key per name.
func callersFile(t *testing.T, names ...string) string {
	t.Helper()
	table := map[string]string{}
	for _, n := range names {
		kp, err := nkeys.CreateAccount()
		if err != nil {
			t.Fatal(err)
		}
		pub, err := kp.PublicKey()
		if err != nil {
			t.Fatal(err)
		}
		table[n] = pub
	}
	raw, err := json.Marshal(table)
	if err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(t.TempDir(), "callers.json")
	if err := os.WriteFile(path, raw, 0o600); err != nil {
		t.Fatal(err)
	}
	return path
}

func grantsFile(t *testing.T, body string) string {
	t.Helper()
	path := filepath.Join(t.TempDir(), "grants.yaml")
	if err := os.WriteFile(path, []byte(body), 0o600); err != nil {
		t.Fatal(err)
	}
	return path
}

const goodGrants = `schema: v1
compartments: [weather, support]
grants:
  - principal: { kind: account, id: CALLER-studio }
    tools: ["weather.v1.*"]
    compartments: [weather]
  - principal: { kind: account, id: CALLER-batch }
    acts_for: { kind: person, id: ada }
    tools: ["*"]
    compartments: [support]
`

// A good file checks clean and PRINTS WHAT EACH PRINCIPAL MAY INVOKE: the
// point of the command is that a person reviewing grants can read back what
// they granted, by name, without starting rund.
func TestGrantsCheckPrintsWhatEachPrincipalMayInvoke(t *testing.T) {
	stdout, _, err := runGrants(t,
		"check", "--grants", grantsFile(t, goodGrants), "--callers", callersFile(t, "studio", "batch"))
	if err != nil {
		t.Fatalf("a good file was refused: %v", err)
	}
	for _, want := range []string{"CALLER-studio", "weather.v1.*", "weather", "CALLER-batch", "person:ada"} {
		if !strings.Contains(stdout, want) {
			t.Errorf("the report does not name %q:\n%s", want, stdout)
		}
	}
}

// With a catalogue, it answers the question the file alone cannot: which
// DECLARED tools each principal may invoke. The report asks the same decider a
// call asks, so a tool it lists as invocable is one that call would permit --
// and the second list is the one a person debugging a DENIED comes for.
func TestGrantsCheckAgainstTheCatalogueNamesTheToolsEachPrincipalMayInvoke(t *testing.T) {
	cat := fixtures.TwoServices(t)
	stdout, _, err := runGrants(t,
		"check", "--grants", grantsFile(t, goodGrants), "--callers", callersFile(t, "studio", "batch"),
		"--catalogue", cat.URI, "--catalogue-sha256", cat.SHA, "--catalogue-dir", cat.Dir)
	if err != nil {
		t.Fatalf("a good file was refused against the catalogue: %v", err)
	}
	const gated = "weather.v1.schedule_report" // requires `weather`
	// studio holds `weather` and its pattern covers the tool: invocable.
	if may := block(stdout, "CALLER-studio", "may invoke:"); !strings.Contains(may, gated) {
		t.Errorf("studio holds `weather`, yet may invoke:\n%s", may)
	}
	// studio's pattern is weather.v1.*, so the second service is out of reach --
	// and not by a compartment, so it earns no line at all.
	if may := block(stdout, "CALLER-studio", "may invoke:"); strings.Contains(may, "weather-2.v1.") {
		t.Errorf("studio's pattern does not cover the second service, yet:\n%s", may)
	}
	// batch's pattern is "*", so the tool is admitted and refused for the
	// compartment -- which is the line that explains a DENIED.
	if may := block(stdout, "CALLER-batch", "may invoke:"); strings.Contains(may, gated) {
		t.Errorf("batch does not hold `weather`, yet may invoke:\n%s", may)
	}
	refused := block(stdout, "CALLER-batch", "refused anyway")
	if !strings.Contains(refused, gated) || !strings.Contains(refused, "weather") {
		t.Errorf("batch's refusal does not name the tool and the compartment:\n%s", refused)
	}
}

// section is the part of the report under one principal's heading.
func section(report, principal string) string {
	i := strings.Index(report, principal)
	if i < 0 {
		return ""
	}
	rest := report[i:]
	if j := strings.Index(rest[len(principal):], "\nCALLER-"); j >= 0 {
		return rest[:len(principal)+j]
	}
	return rest
}

// block is the indented list under one heading inside one principal's section.
func block(report, principal, heading string) string {
	s := section(report, principal)
	i := strings.Index(s, heading)
	if i < 0 {
		return ""
	}
	rest := s[i:]
	if j := strings.Index(rest, "\n"); j >= 0 {
		rest = rest[j+1:] // the heading may be longer than what was searched for
	}
	var out []string
	for _, line := range strings.Split(rest, "\n") {
		if !strings.HasPrefix(line, "    ") {
			break
		}
		out = append(out, strings.TrimSpace(line))
	}
	return strings.Join(out, "\n")
}

func TestGrantsCheckRefusals(t *testing.T) {
	callers := callersFile(t, "studio")
	cases := []struct{ name, body, want string }{
		{"an undeclared compartment in a grant", `schema: v1
compartments: [weather]
grants:
  - principal: { kind: account, id: CALLER-studio }
    tools: ["*"]
    compartments: [wether]
`, "vocabulary"},
		{"a principal no caller table knows", `schema: v1
compartments: [weather]
grants:
  - principal: { kind: account, id: CALLER-nobody }
    tools: ["*"]
    compartments: [weather]
`, "CALLER-nobody"},
		{"a grant that admits no tool", `schema: v1
compartments: [weather]
grants:
  - principal: { kind: account, id: CALLER-studio }
    tools: []
    compartments: [weather]
`, "no tools"},
		{"a schema this build does not understand", `schema: v2
compartments: []
grants: []
`, "schema"},
		{"an unknown field", `schema: v1
compartments: []
grantz: []
`, "grantz"},
		{"a principal kind nothing can prove", `schema: v1
compartments: [weather]
grants:
  - principal: { kind: person, id: ada }
    tools: ["*"]
    compartments: [weather]
`, "cannot be proved"},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			_, _, err := runGrants(t, "check", "--grants", grantsFile(t, c.body), "--callers", callers)
			if err == nil {
				t.Fatalf("%s was accepted", c.name)
			}
			if !strings.Contains(err.Error(), c.want) {
				t.Fatalf("the refusal does not say %q: %v", c.want, err)
			}
		})
	}
}

// The catalogue cross-check is the one refusal the file alone cannot make: a
// declared tool requiring a compartment the deployment never declares is a tool
// nobody can call, and rund refuses to start on it (spec §6). The check must be
// available without starting rund, which is why this command exists.
func TestGrantsCheckRefusesACatalogueRequirementTheFileDoesNotDeclare(t *testing.T) {
	cat := fixtures.TwoServices(t)
	body := `schema: v1
compartments: [support]
grants:
  - principal: { kind: account, id: CALLER-studio }
    tools: ["*"]
    compartments: [support]
`
	_, _, err := runGrants(t, "check", "--grants", grantsFile(t, body), "--callers", callersFile(t, "studio"),
		"--catalogue", cat.URI, "--catalogue-sha256", cat.SHA, "--catalogue-dir", cat.Dir)
	if err == nil {
		t.Fatal("a catalogue requiring `weather` against a file that does not declare it was accepted")
	}
	if !strings.Contains(err.Error(), "weather") || !strings.Contains(err.Error(), "schedule_report") {
		t.Fatalf("the refusal names neither the compartment nor the tool: %v", err)
	}
}

// --grants names principals by NAME, so --callers is required: the same rule
// rund enforces at boot, enforced here rather than resolving nothing silently.
func TestGrantsCheckWithoutCallersIsRefused(t *testing.T) {
	_, _, err := runGrants(t, "check", "--grants", grantsFile(t, goodGrants))
	if err == nil || !strings.Contains(err.Error(), "callers") {
		t.Fatalf("err = %v, want one naming --callers", err)
	}
}

// Found in review: the report built its second list from `Admits` with no
// liveness filter and printed the tool's requirements as the reason -- so an
// EXPIRED grant with `tools: ["*"]` and no compartments listed every tool as
// "refused for a compartment it does not hold", `requires none`. Both halves
// were wrong, on the one screen a person reads when debugging a refusal.
func TestGrantsCheckSaysAGrantIsExpiredRatherThanBlamingACompartment(t *testing.T) {
	cat := fixtures.TwoServices(t)
	body := `schema: v1
compartments: [weather]
grants:
  - principal: { kind: account, id: CALLER-studio }
    tools: ["*"]
    compartments: [weather]
    expires: 2020-01-01T00:00:00Z
`
	stdout, _, err := runGrants(t, "check", "--grants", grantsFile(t, body), "--callers", callersFile(t, "studio"),
		"--catalogue", cat.URI, "--catalogue-sha256", cat.SHA, "--catalogue-dir", cat.Dir)
	if err != nil {
		t.Fatalf("an expired grant is a valid file: %v", err)
	}
	s := section(stdout, "CALLER-studio")
	if !strings.Contains(s, "EXPIRED") {
		t.Errorf("the report does not mark the expired grant:\n%s", s)
	}
	if strings.Contains(s, "requires weather;") {
		t.Errorf("the report blames a compartment for an expired grant:\n%s", s)
	}
	if block(stdout, "CALLER-studio", "may invoke") != "" {
		t.Errorf("an expired grant admits something:\n%s", s)
	}
}
