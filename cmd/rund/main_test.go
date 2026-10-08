package main

import (
	"context"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/natsconn"
	"github.com/garm-ai/garm-ai/run"
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

// Property 17: a reload re-reads the grants, so a grant added takes effect
// without restarting the component every call goes through.
func TestReloadRereadsTheGrants(t *testing.T) {
	e := estate.New(t)
	dir := t.TempDir()
	grants := filepath.Join(dir, "grants.yaml")
	callers := filepath.Join(dir, "callers.json")
	if err := os.WriteFile(callers, []byte(`{"studio":"`+e.AccountKey(estate.RoleCaller)+`"}`), 0o600); err != nil {
		t.Fatal(err)
	}
	write := func(compartments string) {
		body := "schema: v1\ncompartments: [weather]\ngrants:\n  - principal: { kind: account, id: CALLER-studio }\n    tools: [\"*\"]\n    compartments: [" + compartments + "]\n"
		if err := os.WriteFile(grants, []byte(body), 0o600); err != nil {
			t.Fatal(err)
		}
	}
	write("") // studio holds nothing yet
	auth, err := loadAuthority(grants, callers, e.Catalogue.Current(), slog.New(slog.DiscardHandler))
	if err != nil {
		t.Fatal(err)
	}
	report, _ := e.Catalogue.Current().Tool("weather.v1.schedule_report")
	principal := run.Principal{Kind: run.KindAccount, ID: e.AccountKey(estate.RoleCaller)}
	if _, err := auth.Allow(context.Background(), principal, report); err == nil {
		t.Fatal("permitted before the grant existed")
	}
	write("weather")
	var reloaded strings.Builder
	if err := reloadAuthority(auth, grants, callers, e.Catalogue.Current(), slog.New(slog.NewTextHandler(&reloaded, nil))); err != nil {
		t.Fatal(err)
	}
	if _, err := auth.Allow(context.Background(), principal, report); err != nil {
		t.Fatalf("the reloaded grant does not permit: %v", err)
	}
	// The line says WHICH content replaced which: the one question a person
	// asking "did my edit take?" has, and two generations answer it.
	line := reloaded.String()
	if !strings.Contains(line, "was=") || !strings.Contains(line, "generation=") {
		t.Errorf("the reload line does not name the old and new generation:\n%s", line)
	}
}

// Review focus 4: a reload whose file now fails the vocabulary check keeps the
// RUNNING authority -- never an empty source -- and says why.
func TestARefusedReloadKeepsTheRunningAuthority(t *testing.T) {
	e := estate.New(t)
	dir := t.TempDir()
	grants := filepath.Join(dir, "grants.yaml")
	callers := filepath.Join(dir, "callers.json")
	if err := os.WriteFile(callers, []byte(`{"studio":"`+e.AccountKey(estate.RoleCaller)+`"}`), 0o600); err != nil {
		t.Fatal(err)
	}
	good := "schema: v1\ncompartments: [weather]\ngrants:\n  - principal: { kind: account, id: CALLER-studio }\n    tools: [\"*\"]\n    compartments: [weather]\n"
	if err := os.WriteFile(grants, []byte(good), 0o600); err != nil {
		t.Fatal(err)
	}
	auth, err := loadAuthority(grants, callers, e.Catalogue.Current(), slog.New(slog.DiscardHandler))
	if err != nil {
		t.Fatal(err)
	}
	report, _ := e.Catalogue.Current().Tool("weather.v1.schedule_report")
	principal := run.Principal{Kind: run.KindAccount, ID: e.AccountKey(estate.RoleCaller)}
	if _, err := auth.Allow(context.Background(), principal, report); err != nil {
		t.Fatal(err)
	}
	// The vocabulary now omits the compartment the catalogue requires.
	if err := os.WriteFile(grants, []byte("schema: v1\ncompartments: [support]\ngrants: []\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	var buf strings.Builder
	err = reloadAuthority(auth, grants, callers, e.Catalogue.Current(), slog.New(slog.NewTextHandler(&buf, nil)))
	if err == nil {
		t.Fatal("a reload that fails the boot checks was accepted")
	}
	if !strings.Contains(err.Error(), "weather") {
		t.Errorf("the refusal does not say why: %v", err)
	}
	// And the OPERATOR is told, not only the caller of this function. Found in
	// review: this buffer was built and never read, so the half of property 17
	// that says the refusal is announced was asserted by nothing.
	if logged := buf.String(); !strings.Contains(logged, "weather") || !strings.Contains(logged, grants) {
		t.Errorf("the log does not say which file was refused and why:\n%s", logged)
	}
	if _, err := auth.Allow(context.Background(), principal, report); err != nil {
		t.Fatalf("the running authority was replaced by a refused reload: %v", err)
	}
}
