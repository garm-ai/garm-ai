package main

import (
	"bytes"
	"strings"
	"testing"

	"github.com/garm-ai/garm-ai/internal/estate"
)

func runFetch(t *testing.T, e *estate.Estate, args ...string) (stdout string, err error) {
	t.Helper()
	cmd := fetchCmd()
	var out bytes.Buffer
	cmd.SetOut(&out)
	cmd.SetErr(&out)
	cmd.SilenceUsage = true
	cmd.SilenceErrors = true
	cmd.SetArgs(append([]string{
		"--nats", e.URL,
		"--creds", e.CredsFile(t, estate.RoleCaller),
		"--tls-ca", e.CAFile(t),
		"--catalogue", e.CatalogueURI,
		"--catalogue-sha256", e.CatalogueSHA,
		"--catalogue-dir", e.Dir,
	}, args...))
	err = cmd.Execute()
	return out.String(), err
}

// Against a rund with no store, fetch says NOT_RETAINED -- the honest answer,
// printed for a person -- and exits 0: nothing went wrong.
func TestFetchSaysNotRetainedWithoutAStore(t *testing.T) {
	e := estate.New(t)
	out, err := runFetch(t, e, "some-run", "--wait", "1s")
	if err != nil {
		t.Fatalf("fetch: %v\n%s", err, out)
	}
	if !strings.Contains(out, "NOT_RETAINED") {
		t.Fatalf("output:\n%s", out)
	}
}

func TestFetchRefusesAMalformedWait(t *testing.T) {
	e := estate.New(t)
	if _, err := runFetch(t, e, "some-run", "--wait", "soon"); err == nil {
		t.Fatal("a malformed --wait was accepted")
	}
}

// --follow prints the run's events, one line each, and returns on done.
func TestFetchFollowPrintsTheEventsAndReturnsOnDone(t *testing.T) {
	e := estate.New(t, estate.WithStore())
	stdout, _, err := run(t, e, "weather.v1.schedule_report", `{"place":"Ghent"}`, "--idempotency-key", "k-follow")
	if err != nil || !strings.HasPrefix(stdout, "pending k-follow") {
		t.Fatalf("%v %s", err, stdout)
	}
	out, err := runFetch(t, e, "k-follow", "--follow")
	if err != nil {
		t.Fatalf("fetch --follow: %v\n%s", err, out)
	}
	for _, want := range []string{"stage calling:0", "step k-follow:0 OK", "stage done", "done SUCCEEDED"} {
		if !strings.Contains(out, want) {
			t.Fatalf("missing %q in:\n%s", want, out)
		}
	}
	after, err := runFetch(t, e, "k-follow", "--follow", "--after", "2")
	if err != nil || strings.Contains(after, "calling:0") || !strings.Contains(after, "done SUCCEEDED") {
		t.Fatalf("--after 2: %v\n%s", err, after)
	}
}
