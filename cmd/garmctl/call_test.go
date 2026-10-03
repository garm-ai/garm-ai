package main

import (
	"bytes"
	"encoding/json"
	"strings"
	"testing"

	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/serve"
)

// The command runs against a REAL estate, and that is the point of these tests.
//
// `call` is the only place in this repository that turns typed JSON into a message
// through descriptors alone -- protojson into a dynamicpb built from the
// catalogue's own Input(), and the answer back out the same way. Nothing else
// imports either package, so nothing else can catch a mistake in it, and it is the
// first surface a person touches.
func run(t *testing.T, e *estate.Estate, args ...string) (stdout, stderr string, err error) {
	t.Helper()
	cmd := callCmd()
	var out, errOut bytes.Buffer
	cmd.SetOut(&out)
	cmd.SetErr(&errOut)
	cmd.SilenceUsage = true  // the root sets these; callCmd alone does not
	cmd.SilenceErrors = true // main is what prints an error, exactly once
	cmd.SetArgs(append([]string{
		"--nats", e.URL,
		"--catalogue", e.CatalogueURI,
		"--catalogue-sha256", e.CatalogueSHA,
		"--catalogue-dir", e.Dir,
	}, args...))
	err = cmd.Execute()
	return out.String(), errOut.String(), err
}

// TestCallReachesTheToolAndPrintsItsAnswerAsJSON, naming only the tool.
func TestCallReachesTheToolAndPrintsItsAnswerAsJSON(t *testing.T) {
	e := estate.New(t)
	stdout, _, err := run(t, e, "weather.v1.get_forecast", `{"place":"Ghent","days":3}`)
	if err != nil {
		t.Fatalf("call: %v", err)
	}
	// Parsed, not substring-matched: the claim is that what came back is JSON of
	// the DECLARED response shape, and a field name is part of that claim.
	var got struct {
		Summary     string `json:"summary"`
		HighCelsius int    `json:"highCelsius"`
	}
	if jsonErr := json.Unmarshal([]byte(stdout), &got); jsonErr != nil {
		t.Fatalf("the output is not JSON: %v\n%s", jsonErr, stdout)
	}
	if !strings.Contains(got.Summary, "Ghent") {
		t.Errorf("summary is %q, so the place did not survive the round trip", got.Summary)
	}
	if got.HighCelsius == 0 {
		t.Error("highCelsius is absent or zero: the answer did not come from the handler")
	}
}

// TestCallDefaultsToAnEmptyRequest. The tool refuses it, which is the proof the
// empty body was really sent rather than the command refusing to send one.
func TestCallDefaultsToAnEmptyRequest(t *testing.T) {
	e := estate.New(t)
	if _, _, err := run(t, e, "weather.v1.get_forecast"); err == nil {
		t.Fatal("an empty request was answered; weatherd refuses a missing place")
	}
}

// TestCallRefusesAnUnknownFieldRatherThanDroppingIt is the one behaviour the
// command's own help text promises: "an unknown field is a typo the command refuses
// rather than a value the tool silently ignores". That promise is one
// protojson.UnmarshalOptions field away from being false, and nothing else here
// would notice it flipping.
func TestCallRefusesAnUnknownFieldRatherThanDroppingIt(t *testing.T) {
	e := estate.New(t)
	_, _, err := run(t, e, "weather.v1.get_forecast", `{"place":"Ghent","dayz":3}`)
	if err == nil {
		t.Fatal("a misspelt field was accepted and dropped")
	}
	// The message has to name the SHAPE, or a person cannot tell which field was
	// wrong against what.
	if !strings.Contains(err.Error(), "weather.v1.GetForecastRequest") {
		t.Errorf("the refusal does not name the request type: %v", err)
	}
	if !strings.Contains(err.Error(), "dayz") {
		t.Errorf("the refusal does not name the field: %v", err)
	}
}

// TestCallRefusesJSONOfTheWrongType. A string where the declaration says int32 is
// the other half of "what you may type is what the tool declared".
func TestCallRefusesJSONOfTheWrongType(t *testing.T) {
	e := estate.New(t)
	if _, _, err := run(t, e, "weather.v1.get_forecast", `{"place":"Ghent","days":"three"}`); err == nil {
		t.Fatal(`days:"three" was accepted for an int32 field`)
	}
}

// TestAnUnknownToolNamesTheCatalogue. "unknown tool" is unactionable when the real
// question is which namespace is loaded.
func TestAnUnknownToolNamesTheCatalogue(t *testing.T) {
	e := estate.New(t)
	_, _, err := run(t, e, "weather.v1.nope", "{}")
	if err == nil {
		t.Fatal("an unknown tool was called")
	}
	if !strings.Contains(err.Error(), "c.binpb") {
		t.Errorf("the refusal does not say which catalogue was searched: %v", err)
	}
}

// TestNoCatalogueSaysWhatToPass, rather than failing somewhere later with a nil
// namespace.
func TestNoCatalogueSaysWhatToPass(t *testing.T) {
	cmd := callCmd()
	var out, errOut bytes.Buffer
	cmd.SetOut(&out)
	cmd.SetErr(&errOut)
	cmd.SilenceUsage, cmd.SilenceErrors = true, true
	cmd.SetArgs([]string{"weather.v1.get_forecast"})
	err := cmd.Execute()
	if err == nil {
		t.Fatal("a call ran with no catalogue")
	}
	if !strings.Contains(err.Error(), "--catalogue") {
		t.Errorf("the refusal does not name the flag to pass: %v", err)
	}
}

// TestADigestMismatchStopsTheCall. The digest is the only thing standing between a
// command and a swapped namespace, so a wrong one must not be a warning.
func TestADigestMismatchStopsTheCall(t *testing.T) {
	e := estate.New(t)
	bad := *e
	bad.CatalogueSHA = strings.Repeat("0", 64)
	if _, _, err := run(t, &bad, "weather.v1.get_forecast", `{"place":"Ghent"}`); err == nil {
		t.Fatal("a catalogue with the wrong digest was used")
	}
}

// TestAToolsRefusalArrivesWithItsKindForAPerson.
//
// The command RETURNS the error and main renders it; an earlier revision printed it
// here and called os.Exit, which jumped over two defers and meant this path could
// not be tested at all. serve.Describe is what main applies, so that is what is
// asserted.
func TestAToolsRefusalArrivesWithItsKindForAPerson(t *testing.T) {
	e := estate.New(t)
	_, _, err := run(t, e, "weather.v1.get_forecast", `{"place":""}`)
	if err == nil {
		t.Fatal("an empty place was answered")
	}
	if got := serve.Describe(err); !strings.HasPrefix(got, "INTERNAL: ") {
		t.Errorf("a person is shown %q, which does not lead with the kind", got)
	}
}
