package topology_test

import (
	"strings"
	"testing"
	"time"

	"github.com/nats-io/jwt/v2"
	"github.com/nats-io/nkeys"

	"github.com/garm-ai/garm-ai/internal/fixtures"
	"github.com/garm-ai/garm-ai/topology"
)

func issueWith(t *testing.T, keys topology.Keys, prev *topology.Manifest, callers ...string) *topology.Output {
	t.Helper()
	out, err := topology.Generate(topology.Input{Catalogue: fixtures.Weather(t).Catalogue,
		Callers: callers, Previous: prev, Keys: keys, Now: time.Now()})
	if err != nil {
		t.Fatal(err)
	}
	return out
}

// What signs what (spec §2): accounts by the operator signing key; users and
// activations by the account signing key with IssuerAccount set; every account
// lists its signing key.
func TestEverythingIsSignedByASigningKeyAndNothingByAnIdentity(t *testing.T) {
	keys := topology.FreshKeys([]string{"studio"})
	out := issueWith(t, keys, topology.Empty(), "studio")
	signPub, _ := keys.OperatorSigning.PublicKey()
	for name, encoded := range out.Accounts {
		ac, err := jwt.DecodeAccountClaims(encoded)
		if err != nil {
			t.Fatal(err)
		}
		if ac.Issuer != signPub {
			t.Errorf("account %s issued by %s, want the operator signing key", name, ac.Issuer)
		}
		want, _ := keys.Accounts[name].Signing.PublicKey()
		if !ac.SigningKeys.Contains(want) {
			t.Errorf("account %s does not list its signing key", name)
		}
		for _, imp := range ac.Imports {
			if imp.Token == "" {
				continue
			}
			act, err := jwt.DecodeActivationClaims(imp.Token)
			if err != nil {
				t.Fatal(err)
			}
			if act.IssuerAccount == "" || act.Issuer == act.IssuerAccount {
				t.Errorf("activation on %s/%s signed by the exporter's identity, not its signing key", name, imp.Name)
			}
		}
	}
	for _, c := range out.Credentials {
		uc, err := jwt.DecodeUserClaims(c.JWT)
		if err != nil {
			t.Fatal(err)
		}
		if uc.IssuerAccount != keys.Accounts[c.Account].Identity {
			t.Errorf("%s: IssuerAccount %s, want %s's identity", c.Name, uc.IssuerAccount, c.Account)
		}
		want, _ := keys.Accounts[c.Account].Signing.PublicKey()
		if uc.Issuer != want {
			t.Errorf("%s signed by %s, want %s's signing key", c.Name, uc.Issuer, c.Account)
		}
	}
}

// Property 3: no operator signing key, no issuance.
func TestGenerateRefusesWithoutAnOperatorSigningKey(t *testing.T) {
	keys := topology.FreshKeys(nil)
	keys.OperatorSigning = nil
	if _, err := topology.Generate(topology.Input{Catalogue: fixtures.Weather(t).Catalogue,
		Previous: topology.Empty(), Keys: keys, Now: time.Now()}); err == nil {
		t.Fatal("issued with no operator signing key")
	}
}

// Property 4: the operator JWT must list the signing key it is handed.
func TestGenerateRefusesAnOperatorJWTThatDoesNotListItsSigningKey(t *testing.T) {
	keys := topology.FreshKeys(nil)
	other, _ := nkeys.CreateOperator()
	keys.OperatorSigning = other
	_, err := topology.Generate(topology.Input{Catalogue: fixtures.Weather(t).Catalogue,
		Previous: topology.Empty(), Keys: keys, Now: time.Now()})
	otherPub, _ := other.PublicKey()
	if err == nil || !strings.Contains(err.Error(), otherPub) {
		t.Fatalf("err = %v, want a refusal naming %s", err, otherPub)
	}
}

// Review focus 1: an operator JWT without strict signing-key usage is refused --
// with it off, the server would accept exactly what this shape exists to prevent.
func TestAnOperatorJWTWithoutStrictSigningIsRefused(t *testing.T) {
	keys := topology.FreshKeys(nil)
	op, _ := topology.InitOperator()
	oc, _ := jwt.DecodeOperatorClaims(op.JWT)
	oc.StrictSigningKeyUsage = false
	lax, err := oc.Encode(op.Root)
	if err != nil {
		t.Fatal(err)
	}
	keys.OperatorJWT, keys.OperatorSigning = lax, op.Signing
	_, err = topology.Generate(topology.Input{Catalogue: fixtures.Weather(t).Catalogue,
		Previous: topology.Empty(), Keys: keys, Now: time.Now()})
	if err == nil || !strings.Contains(err.Error(), "strict") {
		t.Fatalf("err = %v, want a refusal naming strict signing-key usage", err)
	}
}

// Property 7: a caller the keys do not know is NEW -- its keys are minted once,
// returned in NewKeys, and a second issuance given them mints nothing.
func TestANewCallersKeysAreBornOnce(t *testing.T) {
	keys := topology.FreshKeys(nil) // no caller accounts
	first := issueWith(t, keys, topology.Empty(), "studio")
	nk, ok := first.NewKeys[topology.CallerPrefix+"studio"]
	if !ok || nk.Identity == nil || nk.Signing == nil {
		t.Fatalf("NewKeys = %v, want identity and signing keys for CALLER-studio", first.NewKeys)
	}
	idPub, _ := nk.Identity.PublicKey()
	if first.Manifest.Accounts[topology.CallerPrefix+"studio"].Identity != idPub {
		t.Fatal("the manifest does not record the new account's identity")
	}
	keys.Accounts[topology.CallerPrefix+"studio"] = topology.AccountKeys{Identity: idPub, Signing: nk.Signing}
	second := issueWith(t, keys, &first.Manifest, "studio")
	if len(second.NewKeys) != 0 {
		t.Fatalf("second issuance minted %v", second.NewKeys)
	}
	if second.Manifest.Accounts[topology.CallerPrefix+"studio"].Identity != idPub {
		t.Fatal("the identity changed between issuances")
	}
}

// Review focus 5: a key that disagrees with the manifest is the attack, not a typo.
func TestAKeysIdentityThatDisagreesWithTheManifestIsRefused(t *testing.T) {
	keys := topology.FreshKeys([]string{"studio"})
	first := issueWith(t, keys, topology.Empty(), "studio")
	swapped, _ := nkeys.CreateAccount()
	pub, _ := swapped.PublicKey()
	keys.Accounts[topology.CallerPrefix+"studio"] = topology.AccountKeys{Identity: pub, Signing: swapped}
	_, err := topology.Generate(topology.Input{Catalogue: fixtures.Weather(t).Catalogue, Callers: []string{"studio"},
		Previous: &first.Manifest, Keys: keys, Now: time.Now()})
	if err == nil || !strings.Contains(err.Error(), "CALLER-studio") {
		t.Fatalf("err = %v, want a refusal naming CALLER-studio", err)
	}
}

// The manifest records every account's keys and each entry's signer and reason.
func TestTheManifestRecordsAccountsAndSigners(t *testing.T) {
	keys := topology.FreshKeys([]string{"studio"})
	out := issueWith(t, keys, topology.Empty(), "studio")
	for name, k := range keys.Accounts {
		rec, ok := out.Manifest.Accounts[name]
		signPub, _ := k.Signing.PublicKey()
		if !ok || rec.Identity != k.Identity || rec.Signing != signPub || rec.Retiring != "" {
			t.Errorf("account %s recorded as %+v", name, rec)
		}
	}
	for _, e := range out.Manifest.Entries {
		signPub, _ := keys.Accounts[e.Account].Signing.PublicKey()
		if e.SigningKey != signPub || e.Reason != "new" {
			t.Errorf("%s: signing_key %s reason %q", e.Name, e.SigningKey, e.Reason)
		}
	}
}

// Review finding 1 (critical): a SIGNING key that disagrees with the manifest is
// refused too. The first build checked only the identity: a swapped signing seed
// was accepted, the account JWT listed only the new key, and every carried-forward
// credential -- still signed by the old one -- died on the push with no reissue,
// no revocation and no warning.
func TestAKeysSigningKeyThatDisagreesWithTheManifestIsRefused(t *testing.T) {
	keys := topology.FreshKeys([]string{"studio"})
	first := issueWith(t, keys, topology.Empty(), "studio")
	swapped, _ := nkeys.CreateAccount()
	k := keys.Accounts[topology.AccountGARM]
	k.Signing = swapped
	keys.Accounts[topology.AccountGARM] = k
	_, err := topology.Generate(topology.Input{Catalogue: fixtures.Weather(t).Catalogue, Callers: []string{"studio"},
		Previous: &first.Manifest, Keys: keys, Now: time.Now()})
	if err == nil || !strings.Contains(err.Error(), "GARM") || !strings.Contains(err.Error(), "signing") {
		t.Fatalf("err = %v, want a refusal naming GARM's signing key", err)
	}
}

// Review finding 7: a credential whose file never landed is reissued when asked
// by name, with a reason that says so -- the repair for an output that failed
// after the manifest was saved.
func TestANamedCredentialIsReissuedOnRequest(t *testing.T) {
	keys := topology.FreshKeys([]string{"studio"})
	first := issueWith(t, keys, topology.Empty(), "studio")
	second, err := topology.Generate(topology.Input{Catalogue: fixtures.Weather(t).Catalogue, Callers: []string{"studio"},
		Previous: &first.Manifest, Keys: keys, Now: time.Now(), Reissue: []string{"rund"}})
	if err != nil {
		t.Fatal(err)
	}
	var reissued bool
	for _, e := range second.Manifest.Entries {
		if e.Name == "rund" && e.Reason == "reissued" && e.Generation == second.Manifest.Generation {
			reissued = true
		}
		if e.Name != "rund" && e.Generation != first.Manifest.Generation {
			t.Errorf("%s was reissued although only rund was asked for", e.Name)
		}
	}
	if !reissued {
		t.Fatal("rund was not reissued")
	}
}

// Review finding 6: a manifest signed by a previous operator signing key still
// loads while the operator JWT lists that key -- so replacing the operator
// signing key does not strand the manifest.
func TestLoadAcceptsAnySignerTheOperatorLists(t *testing.T) {
	keys := topology.FreshKeys(nil)
	out := issueWith(t, keys, topology.Empty())
	path := t.TempDir() + "/manifest.json"
	if err := out.Manifest.Save(path, keys.OperatorSigning); err != nil {
		t.Fatal(err)
	}
	oldPub, _ := keys.OperatorSigning.PublicKey()
	newKey, _ := nkeys.CreateOperator()
	newPub, _ := newKey.PublicKey()
	if _, err := topology.Load(path, newPub, oldPub); err != nil {
		t.Fatalf("a manifest signed by a still-listed key did not load: %v", err)
	}
	if _, err := topology.Load(path, newPub); err == nil {
		t.Fatal("a manifest signed by an unlisted key loaded")
	}
}
