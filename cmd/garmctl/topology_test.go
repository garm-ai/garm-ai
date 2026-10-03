package main

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/nats-io/jwt/v2"

	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/topology"
)

func runTopology(t *testing.T, args ...string) (stdout, stderr string, err error) {
	t.Helper()
	cmd := topologyCmd()
	var out, errOut bytes.Buffer
	cmd.SetOut(&out)
	cmd.SetErr(&errOut)
	cmd.SilenceUsage, cmd.SilenceErrors = true, true
	cmd.SetArgs(args)
	err = cmd.Execute()
	return out.String(), errOut.String(), err
}

func catalogueArgs(e *estate.Estate) []string {
	return []string{"--catalogue", e.CatalogueURI, "--catalogue-sha256", e.CatalogueSHA, "--catalogue-dir", e.Dir}
}

func mustRead(t *testing.T, path string) string {
	t.Helper()
	b, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("%s: %v", path, err)
	}
	return string(b)
}

// --dev emits a complete, throwaway topology: every document a deployment would
// get, plus the keys it would never get, and says so.
func TestDevEmitsAThrowawayTopologyAndSaysSo(t *testing.T) {
	e := estate.New(t)
	out := t.TempDir()
	_, stderr, err := runTopology(t, append(catalogueArgs(e), "--dev", "--callers", "studio", "--out", out)...)
	if err != nil {
		t.Fatalf("topology --dev: %v", err)
	}
	if !strings.Contains(strings.ToLower(stderr), "throwaway") {
		t.Errorf("--dev did not warn that its keys are throwaway: %q", stderr)
	}
	for _, f := range []string{
		"operator.jwt", "manifest.json", "revocations.json",
		"accounts/SYS.jwt", "accounts/GARM.jwt", "accounts/TOOLS.jwt", "accounts/CALLER-studio.jwt",
		"creds/ops.creds", "creds/rund.creds", "creds/studio.creds", "creds/weather.v1.WeatherService.creds",
		"keys/operator.nk", "keys/SYS.nk", "keys/GARM.nk", "keys/TOOLS.nk", "keys/CALLER-studio.nk",
	} {
		if _, err := os.Stat(filepath.Join(out, f)); err != nil {
			t.Errorf("--dev did not write %s", f)
		}
	}
}

// Property 10: no data-path credential carries system-account access.
func TestNoDataPathCredentialIsInTheSystemAccount(t *testing.T) {
	e := estate.New(t)
	out := t.TempDir()
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--dev", "--callers", "studio", "--out", out)...); err != nil {
		t.Fatal(err)
	}
	sys, err := jwt.DecodeAccountClaims(mustRead(t, filepath.Join(out, "accounts/SYS.jwt")))
	if err != nil {
		t.Fatal(err)
	}
	entries, err := os.ReadDir(filepath.Join(out, "creds"))
	if err != nil {
		t.Fatal(err)
	}
	if len(entries) < 4 {
		t.Fatalf("only %d credentials written", len(entries))
	}
	for _, f := range entries {
		token, err := jwt.ParseDecoratedJWT([]byte(mustRead(t, filepath.Join(out, "creds", f.Name()))))
		if err != nil {
			t.Fatalf("%s: %v", f.Name(), err)
		}
		uc, err := jwt.DecodeUserClaims(token)
		if err != nil {
			t.Fatalf("%s: %v", f.Name(), err)
		}
		inSYS := uc.IssuerAccount == sys.Subject
		if f.Name() == "ops.creds" && !inSYS {
			t.Errorf("ops is not in SYS")
		}
		if f.Name() != "ops.creds" && inSYS {
			t.Errorf("%s is in the system account", f.Name())
		}
	}
}

// Property 12: the written manifest's entries carry the catalogue digest, and the
// manifest verifies under the operator that signed it.
func TestTheManifestCarriesTheCatalogueDigestAndVerifies(t *testing.T) {
	e := estate.New(t)
	out := t.TempDir()
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--dev", "--callers", "studio", "--out", out)...); err != nil {
		t.Fatal(err)
	}
	op, err := jwt.DecodeOperatorClaims(mustRead(t, filepath.Join(out, "operator.jwt")))
	if err != nil {
		t.Fatal(err)
	}
	m, err := topology.Load(filepath.Join(out, "manifest.json"), op.Subject)
	if err != nil {
		t.Fatalf("the manifest does not verify under its own operator: %v", err)
	}
	if len(m.Entries) == 0 {
		t.Fatal("the manifest is empty")
	}
	for _, en := range m.Entries {
		if en.CatalogueSHA256 != e.CatalogueSHA {
			t.Errorf("%s was issued from %s, want %s", en.Name, en.CatalogueSHA256, e.CatalogueSHA)
		}
	}
}

// Property 13: no manifest, no run -- and the refusal says how to do a first
// issuance on purpose.
func TestTopologyRefusesToRunWithoutAManifest(t *testing.T) {
	e := estate.New(t)
	dev := t.TempDir()
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--dev", "--callers", "studio", "--out", dev)...); err != nil {
		t.Fatal(err)
	}
	out := t.TempDir()
	_, _, err := runTopology(t, append(catalogueArgs(e),
		"--callers", "studio", "--keys", filepath.Join(dev, "keys"),
		"--manifest", filepath.Join(out, "manifest.json"), "--out", out)...)
	if err == nil {
		t.Fatal("topology ran with no manifest; it would never revoke anything")
	}
	if !strings.Contains(err.Error(), "--first") {
		t.Errorf("the refusal does not say how to issue for the first time: %v", err)
	}
}

// A second issuance against the first's manifest revokes the first's credentials
// -- the delta, end to end through the command and its files.
func TestTheSecondIssuanceRevokesTheFirst(t *testing.T) {
	e := estate.New(t)
	dev := t.TempDir()
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--dev", "--callers", "studio", "--out", dev)...); err != nil {
		t.Fatal(err)
	}
	keys := filepath.Join(dev, "keys")
	first := t.TempDir()
	manifest := filepath.Join(first, "manifest.json")
	if _, _, err := runTopology(t, append(catalogueArgs(e),
		"--callers", "studio", "--keys", keys, "--manifest", manifest, "--first", "--out", first)...); err != nil {
		t.Fatalf("first issuance: %v", err)
	}
	var rev []topology.Revocation
	if err := json.Unmarshal([]byte(mustRead(t, filepath.Join(first, "revocations.json"))), &rev); err != nil {
		t.Fatal(err)
	}
	if len(rev) != 0 {
		t.Fatalf("a first issuance revoked %v", rev)
	}
	second := t.TempDir()
	if _, _, err := runTopology(t, append(catalogueArgs(e),
		"--callers", "studio", "--keys", keys, "--manifest", manifest, "--out", second)...); err != nil {
		t.Fatalf("second issuance: %v", err)
	}
	if err := json.Unmarshal([]byte(mustRead(t, filepath.Join(second, "revocations.json"))), &rev); err != nil {
		t.Fatal(err)
	}
	if len(rev) == 0 {
		t.Fatal("the second issuance revoked nothing; the first generation's credentials live on")
	}
	for _, r := range rev {
		if !strings.HasPrefix(r.Why, "superseded") {
			t.Errorf("revoked %s for %q, want superseded", r.Public, r.Why)
		}
	}
	// And --first against an EXISTING manifest is refused: it would forget it.
	if _, _, err := runTopology(t, append(catalogueArgs(e),
		"--callers", "studio", "--keys", keys, "--manifest", manifest, "--first", "--out", t.TempDir())...); err == nil {
		t.Fatal("--first overwrote an existing manifest's history")
	}
}
