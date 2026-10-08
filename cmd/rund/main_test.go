package main

import (
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/natsconn"
	"github.com/garm-ai/garm-ai/rundbos"
)

// A broken --callers table refuses to start, naming the file, BEFORE anything
// is loaded or dialled -- the NATS URL below reaches nothing, and the catalogue
// does not exist, so a refusal that came from either would be the wrong one.
func TestABrokenCallersTableRefusesToStartBeforeAnythingElse(t *testing.T) {
	p := filepath.Join(t.TempDir(), "callers.json")
	if err := os.WriteFile(p, []byte(`{not json`), 0o600); err != nil {
		t.Fatal(err)
	}
	err := serveRund("nats://127.0.0.1:1", natsconn.Options{}, "file://does-not-exist.binpb", "", t.TempDir(),
		"rund", "0.1.0", p, "", "", rundbos.Config{}, slog.New(slog.DiscardHandler))
	if err == nil || !strings.Contains(err.Error(), p) {
		t.Fatalf("err = %v, want one naming %s", err, p)
	}
}

// Review focus 2: --grants names principals by NAME, so --callers is required
// to resolve them. A grant that can never match is a configuration error, and
// accepting it silently would deny every call with "no grant".
func TestGrantsWithoutCallersRefusesToStart(t *testing.T) {
	e := estate.New(t)
	grants := filepath.Join(t.TempDir(), "grants.yaml")
	if err := os.WriteFile(grants, []byte("schema: v1\ncompartments: []\ngrants: []\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	err := serveRund(e.URL, natsconn.Options{Creds: e.CredsFile(t, estate.RoleRund), CA: e.CAFile(t)},
		e.CatalogueURI, e.CatalogueSHA, e.Dir, "rund", "0.1.0", "", "", grants, rundbos.Config{}, slog.New(slog.DiscardHandler))
	if err == nil || !strings.Contains(err.Error(), "--callers") || !strings.Contains(err.Error(), "--grants") {
		t.Fatalf("err = %v, want one naming both flags", err)
	}
}

// Property 10: a catalogue tool requiring a compartment the deployment does not
// declare is a tool nobody can call -- refused at boot, naming both.
func TestAnUndeclaredCompartmentInTheCatalogueRefusesToStart(t *testing.T) {
	e := estate.New(t)
	dir := t.TempDir()
	grants := filepath.Join(dir, "grants.yaml")
	// The estate's catalogue declares weather.v1.schedule_report requiring
	// "weather"; this vocabulary omits it.
	if err := os.WriteFile(grants, []byte("schema: v1\ncompartments: [support]\ngrants: []\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	callers := filepath.Join(dir, "callers.json")
	if err := os.WriteFile(callers, []byte(`{"studio":"`+e.AccountKey(estate.RoleCaller)+`"}`), 0o600); err != nil {
		t.Fatal(err)
	}
	err := serveRund(e.URL, natsconn.Options{Creds: e.CredsFile(t, estate.RoleRund), CA: e.CAFile(t)},
		e.CatalogueURI, e.CatalogueSHA, e.Dir, "rund", "0.1.0", callers, "", grants, rundbos.Config{}, slog.New(slog.DiscardHandler))
	if err == nil || !strings.Contains(err.Error(), "weather") {
		t.Fatalf("err = %v, want one naming the tool's undeclared compartment", err)
	}
}
