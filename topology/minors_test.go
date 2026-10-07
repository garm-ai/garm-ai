package topology_test

import (
	"testing"
	"time"

	"github.com/nats-io/jwt/v2"

	"github.com/garm-ai/garm-ai/topology"
)

// Deferred from review: a revocation is dated in.Now, but a credential's iat is
// the wall clock at encoding. A Now earlier than the iat would date the
// revocation before the credential was issued, and the server would not honour
// it. The manifest records the real iat, and a revocation is never earlier.
func TestARevocationIsNeverDatedBeforeTheCredentialItRevokes(t *testing.T) {
	keys := topology.FreshKeys(nil)
	past := time.Now().Add(-48 * time.Hour)
	first, err := topology.Generate(topology.Input{
		Catalogue: weatherCatalogue(t), Previous: topology.Empty(), Keys: keys, Now: past,
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, e := range first.Manifest.Entries {
		if e.IssuedAt == 0 {
			t.Fatalf("%s: the manifest does not record when it was issued", e.Name)
		}
	}
	retired, err := topology.Generate(topology.Input{
		Catalogue: emptyCatalogue(t), Previous: &first.Manifest, Keys: keys, Now: past,
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(retired.Revoke) == 0 {
		t.Fatal("nothing was revoked")
	}
	issued := map[string]int64{}
	for _, e := range first.Manifest.Entries {
		issued[e.Public] = e.IssuedAt
	}
	for _, r := range retired.Revoke {
		if r.At.Unix() < issued[r.Public] {
			t.Errorf("%s revoked at %d, before it was issued at %d; the server would ignore it",
				r.Public, r.At.Unix(), issued[r.Public])
		}
	}
	// And the account JWT carries the honoured time, not the stale one.
	ac, err := jwt.DecodeAccountClaims(retired.Accounts[topology.AccountTOOLS])
	if err != nil {
		t.Fatal(err)
	}
	for pub, at := range ac.Revocations {
		if at < issued[pub] {
			t.Errorf("TOOLS revokes %s at %d, before its iat %d", pub, at, issued[pub])
		}
	}
}

// Deferred from review: GARM's run-service export was public while TOOLS's was
// private, for no reason §2.2 would accept -- a private export makes a second
// importer a signed act. Every caller's import now carries an activation GARM
// signed for that caller alone.
func TestGARMExportsPrivatelyAndEachCallerHoldsItsOwnActivation(t *testing.T) {
	out := generate(t, "studio", "batch")
	garm, err := jwt.DecodeAccountClaims(out.Accounts[topology.AccountGARM])
	if err != nil {
		t.Fatal(err)
	}
	// Two exports -- the run service and the event stream -- both private.
	if len(garm.Exports) != 2 {
		t.Fatalf("GARM exports %d things, want the run service and the event stream", len(garm.Exports))
	}
	for _, ex := range garm.Exports {
		if !ex.TokenReq {
			t.Fatalf("GARM's export %s is not private: %+v", ex.Name, ex)
		}
	}
	for _, caller := range []string{"studio", "batch"} {
		ac, err := jwt.DecodeAccountClaims(out.Accounts[topology.CallerPrefix+caller])
		if err != nil {
			t.Fatal(err)
		}
		if len(ac.Imports) != 2 || ac.Imports[0].Token == "" || ac.Imports[1].Token == "" {
			t.Fatalf("%s imports without an activation: %+v", caller, ac.Imports)
		}
		act, err := jwt.DecodeActivationClaims(ac.Imports[0].Token)
		if err != nil {
			t.Fatalf("%s: the activation does not decode: %v", caller, err)
		}
		if act.Subject != ac.Subject {
			t.Errorf("%s holds an activation issued to %s, not to itself (%s)", caller, act.Subject, ac.Subject)
		}
		// Signed by GARM's SIGNING key, on behalf of GARM (IssuerAccount): the
		// identity key signs nothing after creation (signing-keys spec §2).
		if act.IssuerAccount != garm.Subject || !garm.SigningKeys.Contains(act.Issuer) {
			t.Errorf("%s's activation was issued by %s for %s, not by GARM's signing key for GARM", caller, act.Issuer, act.IssuerAccount)
		}
		if string(act.ImportSubject) != string(ac.Imports[0].Subject) {
			t.Errorf("%s's activation is for %s, its import is %s", caller, act.ImportSubject, ac.Imports[0].Subject)
		}
	}
}
