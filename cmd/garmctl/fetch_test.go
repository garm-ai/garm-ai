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
	e := estate.New(t, estate.WithoutStore())
	out, err := runFetch(t, e, "some-run", "--wait", "1s")
	if err != nil {
		t.Fatalf("fetch: %v\n%s", err, out)
	}
	if !strings.Contains(out, "NOT_RETAINED") {
		t.Fatalf("output:\n%s", out)
	}
}

func TestFetchRefusesAMalformedWait(t *testing.T) {
	e := estate.New(t, estate.WithoutStore())
	if _, err := runFetch(t, e, "some-run", "--wait", "soon"); err == nil {
		t.Fatal("a malformed --wait was accepted")
	}
}
