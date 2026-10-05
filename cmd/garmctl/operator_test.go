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
