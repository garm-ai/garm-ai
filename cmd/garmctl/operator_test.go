package main

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/nats-io/jwt/v2"
)

func runOperator(t *testing.T, args ...string) (stdout, stderr string, err error) {
	t.Helper()
	cmd := operatorCmd()
	var out, errOut bytes.Buffer
	cmd.SetOut(&out)
	cmd.SetErr(&errOut)
	cmd.SilenceUsage, cmd.SilenceErrors = true, true
	cmd.SetArgs(args)
	err = cmd.Execute()
	return out.String(), errOut.String(), err
}

// Property 12: the ceremony writes the root apart from the keys, says so as its
// last line, and refuses to run twice against the same directory.
func TestOperatorInitWritesTheRootApartAndRefusesToRepeat(t *testing.T) {
	dir := filepath.Join(t.TempDir(), "ceremony")
	stdout, _, err := runOperator(t, "init", "--out", dir)
	if err != nil {
		t.Fatal(err)
	}
	for _, f := range []string{"root/root.nk", "keys/operator.jwt", "keys/operator-signing.nk"} {
		if _, err := os.Stat(filepath.Join(dir, f)); err != nil {
			t.Errorf("init did not write %s", f)
		}
	}
	lines := strings.Split(strings.TrimSpace(stdout), "\n")
	if last := lines[len(lines)-1]; !strings.Contains(last, "root") || !strings.Contains(strings.ToLower(last), "custody") {
		t.Errorf("the last line does not send the root to custody: %q", last)
	}
	oc, err := jwt.DecodeOperatorClaims(mustRead(t, filepath.Join(dir, "keys", "operator.jwt")))
	if err != nil || !oc.StrictSigningKeyUsage || len(oc.SigningKeys) != 1 {
		t.Fatalf("operator.jwt: %v strict=%v keys=%d", err, oc.StrictSigningKeyUsage, len(oc.SigningKeys))
	}
	before := mustRead(t, filepath.Join(dir, "root", "root.nk"))
	if _, _, err := runOperator(t, "init", "--out", dir); err == nil {
		t.Fatal("a second ceremony against the same directory ran")
	}
	if after := mustRead(t, filepath.Join(dir, "root", "root.nk")); after != before {
		t.Fatal("the second run touched the root")
	}
}

// The operator-level rotation's first half: a replacement signing key, listed
// beside the current one in a new root-signed operator JWT.
func TestReplaceSigningKeyListsBothKeys(t *testing.T) {
	dir := filepath.Join(t.TempDir(), "ceremony")
	if _, _, err := runOperator(t, "init", "--out", dir); err != nil {
		t.Fatal(err)
	}
	out := filepath.Join(t.TempDir(), "replaced")
	if _, _, err := runOperator(t, "replace-signing-key", "--root", filepath.Join(dir, "root", "root.nk"),
		"--operator", filepath.Join(dir, "keys", "operator.jwt"), "--out", out); err != nil {
		t.Fatal(err)
	}
	was, _ := jwt.DecodeOperatorClaims(mustRead(t, filepath.Join(dir, "keys", "operator.jwt")))
	now, err := jwt.DecodeOperatorClaims(mustRead(t, filepath.Join(out, "operator.jwt")))
	if err != nil {
		t.Fatal(err)
	}
	if len(now.SigningKeys) != 2 || !now.SigningKeys.Contains(was.SigningKeys[0]) || now.Subject != was.Subject {
		t.Fatalf("replaced operator lists %v (was %v)", now.SigningKeys, was.SigningKeys)
	}
}

// Review finding 6: replace-signing-key refuses an existing --out (as init does)
// and prints the sequence that makes the new key safe to adopt -- the server's
// operator JWT first, then the keys directory.
func TestReplaceSigningKeyRefusesAnExistingOutAndPrintsTheSequence(t *testing.T) {
	dir := filepath.Join(t.TempDir(), "ceremony")
	if _, _, err := runOperator(t, "init", "--out", dir); err != nil {
		t.Fatal(err)
	}
	if _, _, err := runOperator(t, "replace-signing-key", "--root", filepath.Join(dir, "root", "root.nk"),
		"--operator", filepath.Join(dir, "keys", "operator.jwt"), "--out", filepath.Join(dir, "keys")); err == nil {
		t.Fatal("replace-signing-key wrote over the live keys directory")
	}
	out := filepath.Join(t.TempDir(), "replaced")
	stdout, _, err := runOperator(t, "replace-signing-key", "--root", filepath.Join(dir, "root", "root.nk"),
		"--operator", filepath.Join(dir, "keys", "operator.jwt"), "--out", out)
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []string{"operator.jwt", "server", "operator-signing.nk"} {
		if !strings.Contains(stdout, want) {
			t.Errorf("the sequence does not mention %q:\n%s", want, stdout)
		}
	}
}

// Deferred minor 14: a half-made ceremony directory (a failed first run) is
// refused with a way forward, not a bare "exists".
func TestOperatorInitNamesTheWayForwardForAHalfMadeDirectory(t *testing.T) {
	dir := filepath.Join(t.TempDir(), "ceremony")
	if err := os.MkdirAll(filepath.Join(dir, "root"), 0o700); err != nil {
		t.Fatal(err)
	}
	_, _, err := runOperator(t, "init", "--out", dir)
	if err == nil || !strings.Contains(err.Error(), "remove") {
		t.Fatalf("err = %v, want a refusal that says to remove the half-made directory and run again", err)
	}
	complete := filepath.Join(t.TempDir(), "done")
	if _, _, err := runOperator(t, "init", "--out", complete); err != nil {
		t.Fatal(err)
	}
	_, _, err = runOperator(t, "init", "--out", complete)
	if err == nil || strings.Contains(err.Error(), "remove") {
		t.Fatalf("err = %v, want a refusal that does NOT suggest removing a complete ceremony", err)
	}
}
