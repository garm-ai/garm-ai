package observe_test

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/garm-ai/garm-ai/observe"
)

func write(t *testing.T, body string) string {
	t.Helper()
	p := filepath.Join(t.TempDir(), "callers.json")
	if err := os.WriteFile(p, []byte(body), 0o600); err != nil {
		t.Fatal(err)
	}
	return p
}

// The file is name -> key (what garmctl writes); the map is key -> name (what
// rund looks up). An unknown key is simply absent.
func TestLoadCallerNamesInvertsTheFile(t *testing.T) {
	names, err := observe.LoadCallerNames(write(t, `{"studio":"ACKEY1","batch":"ACKEY2"}`))
	if err != nil {
		t.Fatal(err)
	}
	if n, _ := names.Name("ACKEY1"); n != "studio" {
		t.Fatalf("ACKEY1 -> %q", n)
	}
	if n, _ := names.Name("ACKEY2"); n != "batch" {
		t.Fatalf("ACKEY2 -> %q", n)
	}
	if _, ok := names.Name("ACUNKNOWN"); ok {
		t.Fatal("an unknown key resolved")
	}
}

// No file means no table, not an error: the label is optional, the key is not.
func TestNoCallersFileIsNoTable(t *testing.T) {
	names, err := observe.LoadCallerNames("")
	if err != nil || names != nil {
		t.Fatalf("got %v, %v", names, err)
	}
	if _, ok := names.Name("ACKEY1"); ok {
		t.Fatal("a nil table resolved a key")
	}
}

// Review focus 3: a broken file refuses, naming the file; two names for one key
// refuse too, because a label that could be either is a lie.
func TestABrokenCallersFileRefuses(t *testing.T) {
	for name, body := range map[string]string{"garbage": `{not json`, "duplicate key": `{"a":"ACKEY1","b":"ACKEY1"}`} {
		p := write(t, body)
		if _, err := observe.LoadCallerNames(p); err == nil || !strings.Contains(err.Error(), p) {
			t.Errorf("%s: err = %v, want one naming %s", name, err, p)
		}
	}
}
