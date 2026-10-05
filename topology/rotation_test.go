package topology_test

import (
	"strings"
	"testing"
	"time"

	"github.com/nats-io/jwt/v2"

	"github.com/garm-ai/garm-ai/internal/fixtures"
	"github.com/garm-ai/garm-ai/topology"
)

func rotate(t *testing.T, keys topology.Keys, prev *topology.Manifest, account string) *topology.Output {
	t.Helper()
	out, err := topology.Generate(topology.Input{Catalogue: fixtures.Weather(t).Catalogue, Callers: []string{"studio"},
		Previous: prev, Keys: keys, Now: time.Now(), RotateSigning: []string{account}})
	if err != nil {
		t.Fatal(err)
	}
	return out
}

func apply(keys topology.Keys, out *topology.Output) topology.Keys {
	for name, nk := range out.NewKeys {
		k := keys.Accounts[name]
		if nk.Identity != nil {
			k.Identity, _ = nk.Identity.PublicKey()
		}
		k.Signing = nk.Signing
		keys.Accounts[name] = k
	}
	return keys
}

// Property 8: step one lists both keys, reissues every credential of the
// account under the new one with reason "rotation", records the old key as
// retiring, and carries every OTHER account forward untouched.
func TestRotationStepOneListsBothKeysAndReissuesOnlyThatAccount(t *testing.T) {
	keys := topology.FreshKeys([]string{"studio"})
	first := issueWith(t, keys, topology.Empty(), "studio")
	oldPub, _ := keys.Accounts[topology.AccountGARM].Signing.PublicKey()

	out := rotate(t, keys, &first.Manifest, topology.AccountGARM)
	nk, ok := out.NewKeys[topology.AccountGARM]
	if !ok || nk.Identity != nil || nk.Signing == nil {
		t.Fatalf("NewKeys[GARM] = %+v, want a signing key only", nk)
	}
	newPub, _ := nk.Signing.PublicKey()
	ac, _ := jwt.DecodeAccountClaims(out.Accounts[topology.AccountGARM])
	if !ac.SigningKeys.Contains(newPub) || !ac.SigningKeys.Contains(oldPub) {
		t.Fatalf("GARM lists %v, want both %s and %s", ac.SigningKeys.Keys(), newPub, oldPub)
	}
	rec := out.Manifest.Accounts[topology.AccountGARM]
	if rec.Signing != newPub || rec.Retiring != oldPub {
		t.Fatalf("GARM recorded as %+v", rec)
	}
	prev := map[string]topology.Entry{}
	for _, e := range first.Manifest.Entries {
		prev[e.Name] = e
	}
	for _, e := range out.Manifest.Entries {
		switch e.Account {
		case topology.AccountGARM:
			if e.SigningKey != newPub || e.Reason != "rotation" || e.Public == prev[e.Name].Public {
				t.Errorf("%s: not reissued under the new key: %+v", e.Name, e)
			}
		default:
			if e.Public != prev[e.Name].Public || e.IssuedAt != prev[e.Name].IssuedAt {
				t.Errorf("%s (%s) was touched by GARM's rotation", e.Name, e.Account)
			}
		}
	}
}

// Step two: the next issuance drops the retiring key and clears the record.
func TestRotationStepTwoRetiresTheOldKey(t *testing.T) {
	keys := topology.FreshKeys([]string{"studio"})
	first := issueWith(t, keys, topology.Empty(), "studio")
	oldPub, _ := keys.Accounts[topology.AccountGARM].Signing.PublicKey()
	stepOne := rotate(t, keys, &first.Manifest, topology.AccountGARM)
	keys = apply(keys, stepOne)

	stepTwo := issueWith(t, keys, &stepOne.Manifest, "studio")
	ac, _ := jwt.DecodeAccountClaims(stepTwo.Accounts[topology.AccountGARM])
	if ac.SigningKeys.Contains(oldPub) || len(ac.SigningKeys) != 1 {
		t.Fatalf("GARM still lists %v after step two", ac.SigningKeys.Keys())
	}
	if rec := stepTwo.Manifest.Accounts[topology.AccountGARM]; rec.Retiring != "" {
		t.Fatalf("retiring not cleared: %+v", rec)
	}
}

// Property 11: a straggler -- an entry that still names the retiring key --
// stops step two, by name.
func TestStepTwoRefusesAStraggler(t *testing.T) {
	keys := topology.FreshKeys([]string{"studio"})
	first := issueWith(t, keys, topology.Empty(), "studio")
	oldPub, _ := keys.Accounts[topology.AccountGARM].Signing.PublicKey()
	stepOne := rotate(t, keys, &first.Manifest, topology.AccountGARM)
	keys = apply(keys, stepOne)
	tampered := stepOne.Manifest
	tampered.Entries = append([]topology.Entry(nil), stepOne.Manifest.Entries...)
	for i := range tampered.Entries {
		if tampered.Entries[i].Name == "rund" {
			tampered.Entries[i].SigningKey = oldPub // hand-edited back
		}
	}
	_, err := topology.Generate(topology.Input{Catalogue: fixtures.Weather(t).Catalogue, Callers: []string{"studio"},
		Previous: &tampered, Keys: keys, Now: time.Now()})
	if err == nil || !strings.Contains(err.Error(), "rund") {
		t.Fatalf("err = %v, want a refusal naming rund", err)
	}
}

// Review focus 2: rotating an account that is already retiring is refused.
func TestRotatingAnAlreadyRetiringAccountIsRefused(t *testing.T) {
	keys := topology.FreshKeys([]string{"studio"})
	first := issueWith(t, keys, topology.Empty(), "studio")
	stepOne := rotate(t, keys, &first.Manifest, topology.AccountGARM)
	keys = apply(keys, stepOne)
	_, err := topology.Generate(topology.Input{Catalogue: fixtures.Weather(t).Catalogue, Callers: []string{"studio"},
		Previous: &stepOne.Manifest, Keys: keys, Now: time.Now(), RotateSigning: []string{topology.AccountGARM}})
	if err == nil || !strings.Contains(err.Error(), "retiring") {
		t.Fatalf("err = %v, want a refusal because GARM is already retiring a key", err)
	}
}
