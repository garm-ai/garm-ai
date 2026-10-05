package observe_test

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/nats-io/nkeys"

	"github.com/garm-ai/garm-ai/observe"
)

// key is a real public account key: the loader validates them, so a test's
// table carries what a deployment's would.
func key(t *testing.T) string {
	t.Helper()
	kp, err := nkeys.CreateAccount()
	if err != nil {
		t.Fatal(err)
	}
	pub, err := kp.PublicKey()
	if err != nil {
		t.Fatal(err)
	}
	return pub
}

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
	k1, k2 := key(t), key(t)
	names, err := observe.LoadCallerNames(write(t, `{"studio":"`+k1+`","batch":"`+k2+`"}`))
	if err != nil {
		t.Fatal(err)
	}
	if n, _ := names.Name(k1); n != "studio" {
		t.Fatalf("%s -> %q", k1, n)
	}
	if n, _ := names.Name(k2); n != "batch" {
		t.Fatalf("%s -> %q", k2, n)
	}
	if _, ok := names.Name(key(t)); ok {
		t.Fatal("an unknown key resolved")
	}
}

// A mistyped or hand-edited key refuses at load, naming the file and the name:
// attribution would survive (garm.caller is the server-placed key) but a
// name-filtered dashboard would lie.
func TestAKeyThatIsNotAnAccountKeyRefuses(t *testing.T) {
	p := write(t, `{"studio":"ACNOTAKEY"}`)
	_, err := observe.LoadCallerNames(p)
	if err == nil || !strings.Contains(err.Error(), p) || !strings.Contains(err.Error(), "studio") {
		t.Fatalf("err = %v, want one naming %s and studio", err, p)
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
	k := key(t)
	for name, body := range map[string]string{"garbage": `{not json`, "duplicate key": `{"a":"` + k + `","b":"` + k + `"}`} {
		p := write(t, body)
		if _, err := observe.LoadCallerNames(p); err == nil || !strings.Contains(err.Error(), p) {
			t.Errorf("%s: err = %v, want one naming %s", name, err, p)
		}
	}
}
