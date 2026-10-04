package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/internal/fixtures"
)

// Deferred from review: ANY stat error on --manifest was read as "no manifest".
// An operator whose manifest path is unreadable -- here, a path under a regular
// file, ENOTDIR -- was told "no manifest at ...; pass --first", which is advice
// to forget whatever that manifest records. Only "does not exist" means absent;
// any other failure to read it is an error that names itself.
func TestAnUnreadableManifestIsNotCalledAbsent(t *testing.T) {
	e := estate.New(t)
	dev := t.TempDir()
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--dev", "--callers", "studio", "--out", dev)...); err != nil {
		t.Fatal(err)
	}
	inTheWay := filepath.Join(t.TempDir(), "file")
	if err := os.WriteFile(inTheWay, []byte("a file, not a directory"), 0o600); err != nil {
		t.Fatal(err)
	}
	manifest := filepath.Join(inTheWay, "manifest.json") // ENOTDIR, not ENOENT
	_, _, err := runTopology(t, append(catalogueArgs(e),
		"--callers", "studio", "--keys", filepath.Join(dev, "keys"),
		"--manifest", manifest, "--out", t.TempDir())...)
	if err == nil {
		t.Fatal("an unreadable manifest path was accepted")
	}
	if strings.Contains(err.Error(), "--first") {
		t.Fatalf("an unreadable manifest was called absent, and the operator told to --first: %v", err)
	}
	if !strings.Contains(err.Error(), manifest) {
		t.Errorf("the error does not name the manifest path: %v", err)
	}
}

// Deferred from review: --out accumulated across generations, so a retired
// service's credentials file stayed beside the live ones. A retirement now
// removes the retired credential's file -- the one artefact the deployment must
// not keep deploying -- and leaves everything still current in place.
func TestARetiredServicesCredentialFileIsRemoved(t *testing.T) {
	e := estate.New(t) // two tool services
	dev := t.TempDir()
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--dev", "--callers", "studio", "--out", dev)...); err != nil {
		t.Fatal(err)
	}
	keys := filepath.Join(dev, "keys")
	out := t.TempDir()
	manifest := filepath.Join(out, "manifest.json")
	if _, _, err := runTopology(t, append(catalogueArgs(e),
		"--callers", "studio", "--keys", keys, "--manifest", manifest, "--first", "--out", out)...); err != nil {
		t.Fatal(err)
	}
	second := filepath.Join(out, "creds", fixtures.SecondService+".creds")
	first := filepath.Join(out, "creds", "weather.v1.WeatherService.creds")
	for _, f := range []string{first, second} {
		if _, err := os.Stat(f); err != nil {
			t.Fatalf("after the first issuance %s is missing", f)
		}
	}
	// The second service leaves the catalogue.
	weather := fixtures.Weather(t)
	if _, _, err := runTopology(t,
		"--catalogue", weather.URI, "--catalogue-sha256", weather.SHA, "--catalogue-dir", weather.Dir,
		"--callers", "studio", "--keys", keys, "--manifest", manifest, "--out", out); err != nil {
		t.Fatalf("retiring: %v", err)
	}
	if _, err := os.Stat(second); !os.IsNotExist(err) {
		t.Fatalf("the retired service's credential file is still in --out: %v", err)
	}
	if _, err := os.Stat(first); err != nil {
		t.Fatalf("the surviving service's credential file was removed: %v", err)
	}
}
