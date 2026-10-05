package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
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
		"operator.jwt", "manifest.json", "revocations.json", "callers.json",
		"accounts/SYS.jwt", "accounts/GARM.jwt", "accounts/TOOLS.jwt", "accounts/CALLER-studio.jwt",
		"creds/ops.creds", "creds/rund.creds", "creds/studio.creds", "creds/weather.v1.WeatherService.creds",
		"keys/operator.jwt", "keys/operator-signing.nk",
		"keys/SYS.pub", "keys/SYS.signing.nk", "keys/GARM.pub", "keys/GARM.signing.nk", "keys/TOOLS.pub", "keys/TOOLS.signing.nk",
		"keys/CALLER-studio.pub", "keys/CALLER-studio.signing.nk",
	} {
		if _, err := os.Stat(filepath.Join(out, f)); err != nil {
			t.Errorf("--dev did not write %s", f)
		}
	}
	// --dev discards the root: nothing uses it, and a root beside a topology is
	// the one thing topology refuses.
	for _, f := range []string{"keys/root.nk", "keys/operator.nk"} {
		if _, err := os.Stat(filepath.Join(out, f)); err == nil {
			t.Errorf("--dev wrote %s; the root must not be here", f)
		}
	}
	if !strings.Contains(strings.ToLower(stderr), "root") || !strings.Contains(strings.ToLower(stderr), "discard") {
		t.Errorf("--dev did not say the root was discarded: %q", stderr)
	}
	// callers.json is the public name -> account table rund takes as --callers:
	// exactly the --callers names, each mapped to its account's public key.
	var names map[string]string
	if err := json.Unmarshal([]byte(mustRead(t, filepath.Join(out, "callers.json"))), &names); err != nil {
		t.Fatalf("callers.json: %v", err)
	}
	studio, err := jwt.DecodeAccountClaims(mustRead(t, filepath.Join(out, "accounts/CALLER-studio.jwt")))
	if err != nil {
		t.Fatal(err)
	}
	if len(names) != 1 || names["studio"] != studio.Subject {
		t.Errorf("callers.json = %v, want {studio: %s}", names, studio.Subject)
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
	// Signed by the operator SIGNING key -- the one the operator JWT lists --
	// never by the root, which the generator does not hold.
	op, err := jwt.DecodeOperatorClaims(mustRead(t, filepath.Join(out, "operator.jwt")))
	if err != nil {
		t.Fatal(err)
	}
	if len(op.SigningKeys) != 1 {
		t.Fatalf("the operator lists %d signing keys", len(op.SigningKeys))
	}
	if _, err := topology.Load(filepath.Join(out, "manifest.json"), op.Subject); err == nil {
		t.Fatal("the manifest verifies under the ROOT; it must be signed by the operator signing key")
	}
	m, err := topology.Load(filepath.Join(out, "manifest.json"), op.SigningKeys[0])
	if err != nil {
		t.Fatalf("the manifest does not verify under the operator signing key: %v", err)
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

// A second issuance against the first's manifest, with nothing changed, issues
// nothing and revokes nothing -- the delta of spec §4.2, end to end through the
// command and its files. --rotate is how everything is reissued on purpose.
func TestTheSecondIssuanceIssuesOnlyWhatChangedUnlessRotated(t *testing.T) {
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
	if len(rev) != 0 {
		t.Fatalf("an unchanged catalogue revoked %v; every process would have been restarted for nothing", rev)
	}
	if entries, _ := os.ReadDir(filepath.Join(second, "creds")); len(entries) != 0 {
		t.Fatalf("an unchanged catalogue wrote %d new credentials", len(entries))
	}
	// --rotate: everything, on purpose.
	third := t.TempDir()
	if _, _, err := runTopology(t, append(catalogueArgs(e),
		"--callers", "studio", "--keys", keys, "--manifest", manifest, "--rotate", "--out", third)...); err != nil {
		t.Fatalf("rotation: %v", err)
	}
	if err := json.Unmarshal([]byte(mustRead(t, filepath.Join(third, "revocations.json"))), &rev); err != nil {
		t.Fatal(err)
	}
	if len(rev) == 0 {
		t.Fatal("--rotate revoked nothing")
	}
	for _, r := range rev {
		if !strings.HasPrefix(r.Why, "superseded") {
			t.Errorf("rotation revoked %s for %q, want superseded", r.Public, r.Why)
		}
	}
	// And --first against an EXISTING manifest is refused: it would forget it.
	if _, _, err := runTopology(t, append(catalogueArgs(e),
		"--callers", "studio", "--keys", keys, "--manifest", manifest, "--first", "--out", t.TempDir())...); err == nil {
		t.Fatal("--first overwrote an existing manifest's history")
	}
}

// ceremonyKeys runs operator init and returns the --keys directory a deployment
// would hand topology, with the root elsewhere.
func ceremonyKeys(t *testing.T) (keys string) {
	t.Helper()
	dir := filepath.Join(t.TempDir(), "ceremony")
	if _, _, err := runOperator(t, "init", "--out", dir); err != nil {
		t.Fatal(err)
	}
	return filepath.Join(dir, "keys")
}

// Property 5: a --keys directory holding the root is refused before anything is
// read, naming the file.
func TestTopologyRefusesAKeysDirectoryHoldingTheRoot(t *testing.T) {
	e := estate.New(t)
	dir := filepath.Join(t.TempDir(), "ceremony")
	if _, _, err := runOperator(t, "init", "--out", dir); err != nil {
		t.Fatal(err)
	}
	// The mistake: copying the whole ceremony directory into place.
	keys := filepath.Join(dir, "keys")
	if err := os.Rename(filepath.Join(dir, "root", "root.nk"), filepath.Join(keys, "root.nk")); err != nil {
		t.Fatal(err)
	}
	_, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", filepath.Join(t.TempDir(), "m.json"), "--first", "--out", t.TempDir())...)
	if err == nil || !strings.Contains(err.Error(), "root.nk") {
		t.Fatalf("err = %v, want a refusal naming root.nk", err)
	}
}

// Properties 6 and 7: a first issuance births a new caller's keys into
// --keys-out (identity seed under archive/), a second issuance given them mints
// nothing and never writes --keys, and the archive can be deleted -- nothing
// reads it -- while the issuance still succeeds.
func TestAccountKeysAreBornOnceAndTheArchiveIsNeverRead(t *testing.T) {
	e := estate.New(t)
	keys := ceremonyKeys(t)
	manifest := filepath.Join(t.TempDir(), "manifest.json")
	out := t.TempDir()
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--first", "--callers", "studio", "--out", out)...); err != nil {
		t.Fatal(err)
	}
	for _, f := range []string{"CALLER-studio.pub", "CALLER-studio.signing.nk", "archive/CALLER-studio.identity.nk", "GARM.pub", "GARM.signing.nk"} {
		if _, err := os.Stat(filepath.Join(keys, f)); err != nil {
			t.Errorf("the first issuance did not write %s", f)
		}
	}
	if err := os.RemoveAll(filepath.Join(keys, "archive")); err != nil {
		t.Fatal(err)
	}
	snapshot := dirDigest(t, keys)
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", "studio", "--out", out)...); err != nil {
		t.Fatalf("second issuance without the archive: %v", err)
	}
	if dirDigest(t, keys) != snapshot {
		t.Fatal("the second issuance wrote into --keys")
	}
}

// Review focus 3: an unwritable --keys-out fails BEFORE the manifest is saved or
// a credential written -- the cluster mistake of pointing it at the read-only
// mount must not leave half an issuance behind.
func TestAnUnwritableKeysOutFailsBeforeAnythingIsWritten(t *testing.T) {
	e := estate.New(t)
	keys := ceremonyKeys(t)
	keysOut := filepath.Join(t.TempDir(), "ro")
	if err := os.MkdirAll(keysOut, 0o500); err != nil {
		t.Fatal(err)
	}
	manifest := filepath.Join(t.TempDir(), "manifest.json")
	out := filepath.Join(t.TempDir(), "out")
	_, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--keys-out", keysOut, "--manifest", manifest, "--first", "--callers", "studio", "--out", out)...)
	if err == nil || !strings.Contains(err.Error(), keysOut) {
		t.Fatalf("err = %v, want a failure naming %s", err, keysOut)
	}
	if _, statErr := os.Stat(manifest); statErr == nil {
		t.Error("the manifest was saved although the keys could not be")
	}
	if _, statErr := os.Stat(filepath.Join(out, "creds")); statErr == nil {
		t.Error("credentials were written although the keys could not be")
	}
}

// dirDigest is a stable fingerprint of a directory's files and contents.
func dirDigest(t *testing.T, dir string) string {
	t.Helper()
	h := sha256.New()
	_ = filepath.WalkDir(dir, func(path string, d os.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return err
		}
		h.Write([]byte(path))
		h.Write([]byte(mustRead(t, path)))
		return nil
	})
	return hex.EncodeToString(h.Sum(nil))
}
