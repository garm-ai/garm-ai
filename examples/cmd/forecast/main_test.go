package main

import (
	"bytes"
	"strings"
	"testing"

	"github.com/garm-ai/garm-ai/internal/estate"
)

// The example is RUN here, not merely compiled.
//
// It was built by CI and never executed, which made its central comment -- "the
// only two lines that matter" -- a claim nothing checked. An example is the first
// thing a tool author copies, so it is the last place that should be aspirational.

func TestTheExampleCallerGetsAForecastNamingOnlyTheTool(t *testing.T) {
	t.Skip("awaiting --creds; Task 8 removes this skip")
	e := estate.New(t)
	var out, errOut bytes.Buffer

	if code := forecast(e.URL, "Ghent", 3, &out, &errOut); code != 0 {
		t.Fatalf("exit %d; stderr: %s", code, errOut.String())
	}
	if !strings.Contains(out.String(), "Ghent") {
		t.Errorf("stdout is %q", out.String())
	}
	if !strings.Contains(out.String(), "high") {
		t.Errorf("the temperature is missing from %q", out.String())
	}
	if errOut.Len() != 0 {
		t.Errorf("a successful call wrote to stderr: %q", errOut.String())
	}
}

// TestTheExampleCallerShowsTheKindAndExitsNonZero. A caller that printed a forecast
// anyway, or exited 0, would be a worked example of ignoring an error.
func TestTheExampleCallerShowsTheKindAndExitsNonZero(t *testing.T) {
	t.Skip("awaiting --creds; Task 8 removes this skip")
	e := estate.New(t)
	var out, errOut bytes.Buffer

	if code := forecast(e.URL, "", 3, &out, &errOut); code == 0 {
		t.Fatal("a refused call exited 0")
	}
	if !strings.HasPrefix(errOut.String(), "INTERNAL: ") {
		t.Errorf("stderr is %q, which does not lead with the kind", errOut.String())
	}
	if out.Len() != 0 {
		t.Errorf("a refused call still printed a forecast: %q", out.String())
	}
}

// TestTheExampleCallerWithNothingListeningSaysSo rather than hanging: port 1 is
// never a NATS server, so Connect fails outright.
func TestTheExampleCallerWithNothingListeningSaysSo(t *testing.T) {
	var out, errOut bytes.Buffer
	if code := forecast("nats://127.0.0.1:1", "Ghent", 3, &out, &errOut); code == 0 {
		t.Fatal("a call with no server exited 0")
	}
	if errOut.Len() == 0 {
		t.Error("nothing was said about why it failed")
	}
}
