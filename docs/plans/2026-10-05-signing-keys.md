# Signing keys — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The key shape the identity spec's §5.1 describes: a root that is never an
input to `topology`, an operator signing key that signs accounts, an account
signing key that signs every credential and activation — enforced by the server
(`StrictSigningKeyUsage`) — plus the two-step rotation that shape exists for, with
`--verify-live` asking the bus whether an old key is still in use.

**Architecture:** `topology.Keys` changes shape (`OperatorJWT` + `OperatorSigning` +
per-account `{Identity public, Signing}`); `Generate` verifies the operator JWT,
signs accounts with the signing key, lists signing keys on every account, mints
keys for accounts it has not seen and returns them in `Output.NewKeys`; the
manifest records per-account keys, each entry's signer and reason. A new
`garmctl operator init` holds the module's only `CreateOperator`. `garmctl
topology` gains `--keys-out`, `--rotate-signing`, `--status`, `--verify-live`,
and refuses a directory holding `root.nk`. The estate switches to the shape and
re-proves every identity property.

**Tech Stack:** Go 1.26.6 (`mise exec -- go`) · `github.com/nats-io/jwt/v2` v2.8.2
(`OperatorClaims.StrictSigningKeyUsage`, `AccountClaims.SigningKeys`,
`UserClaims/ActivationClaims.IssuerAccount`) · `nkeys` v0.4.16 · `nats-server/v2`
v2.15.0 in process (`$SYS.REQ.SERVER.PING.CONNZ` with `{"auth":true}` →
`conns[].issuer_key`).

**Spec:** [docs/specs/2026-10-05-signing-keys-design.md](../specs/2026-10-05-signing-keys-design.md).
§7 lists the properties, §8 the order, §9 the decisions.

## Global Constraints

- **A property is not trusted until it has been proved to fail.** Break the
  mechanism, watch the test fail, `git checkout --` restore. **Commit the real
  edit before probing** — a probe's `git checkout` on an uncommitted file wipes
  it (it happened in step 9e).
- **The root is never an input to `Generate` and never created by it.** The only
  `nkeys.CreateOperator()` in the module is in `topology/operator.go`; a test
  greps for it.
- **Nothing is encoded with an identity seed** after creation. `Keys.Accounts[a].Identity`
  is a `string` public key — the type makes it impossible.
- **Permissions, revocation (`RevokeAt`), the manifest's signature scheme and the
  wire are unchanged.** No proto edit; `buf breaking` stays trivially green.
- **The operator JWT carries no `SystemAccount`** — `operator init` runs before
  any account exists. The server config names it (the dev conf and the estate
  already do). Ruling recorded here; spec §3 is amended in Task 1's commit.
- **`--dev` writes no root seed**: nothing uses it, and a root on disk beside a
  topology is the thing `topology` refuses. `--dev` says the root was discarded.
  Spec §3 amended likewise.
- **Break forward.** The old `Keys` shape and the old manifest are not read.
- **Docs move in the same commit as the fact they state.**
- Use `mise exec -- go`; the shell's `go` is the wrong version.

## Review Focus

Inputs the spec implies but no task's tests exercise directly:

1. **An operator JWT without `StrictSigningKeyUsage`** handed to `Generate`
   (someone used `nsc` and forgot). Expected: refused, naming the field — the
   whole design rests on it. Task 1 (`TestAnOperatorJWTWithoutStrictSigningIsRefused`).
2. **`--rotate-signing` on an account that is already retiring.** Expected:
   refused — two overlapping rotations would need three listed keys and a
   manifest that cannot say which is which. Task 4 (`TestRotatingAnAlreadyRetiringAccountIsRefused`).
3. **`--keys-out` pointing at `--keys` in a read-only directory** (the cluster
   mistake). Expected: the write fails *before* the manifest is saved and before
   any credential is written, naming the path. Task 3 (`TestAnUnwritableKeysOutFailsBeforeAnythingIsWritten`).
4. **`--verify-live` with no retiring key anywhere.** Expected: no connection is
   made at all — the flag is inert, not an error. Task 4
   (`TestVerifyLiveIsInertWhenNothingIsRetiring`, with an unreachable `--nats`).
5. **A manifest whose `accounts` record disagrees with `--keys`** (identity public
   differs). Expected: refused, naming the account — a key swapped under a
   running estate is the attack, not a typo. Task 1 (`TestAKeysIdentityThatDisagreesWithTheManifestIsRefused`).

---

## File structure

| path | responsibility |
|---|---|
| `topology/topology.go` | `Keys`, `AccountKeys`, `NewAccountKeys`, `Input.RotateSigning`, `Output.NewKeys` |
| `topology/operator.go` (new) | `Operator{Root, Signing, JWT}`, `InitOperator()` — the one `CreateOperator`; `ReplaceSigningKey` |
| `topology/generate.go` | verify operator JWT; sign with signing keys; `SigningKeys`; mint new accounts; rotation and retirement |
| `topology/manifest.go` | `Manifest.Accounts`, `AccountRecord`, `Entry.SigningKey`, `Entry.Reason`; refuse the old shape |
| `topology/testkeys.go` | `FreshKeys` under the new shape |
| `topology/*_test.go` | properties 3, 4, 7, 8, 11; review-focus 1, 2, 5 |
| `internal/estate/estate.go` | new shape; `StrictSigningKeyUsage`; `ApplyNewKeys`; `RotateSigning(t, account)` |
| `internal/estate/signing_test.go` (new) | properties 1, 2, 9, 10, 11a |
| `cmd/garmctl/operator.go` (new) | `operator init`, `--replace-signing-key` |
| `cmd/garmctl/topology.go` | new `--keys` layout, `--keys-out`, refuse `root.nk`, `--rotate-signing`, `--status`, `--verify-live`, `--ops-creds` |
| `cmd/garmctl/live.go` (new) | `liveSigners(nc) (map[issuerKey][]connName, error)` over `CONNZ` |
| `cmd/garmctl/*_test.go` | properties 5, 6, 7 (keys untouched), 12, 11a; review-focus 3, 4; dev boot |
| docs | identity spec §5.1/§13/status; signing spec amendments; `identity.html`, `deployment.html`; guide §4; invariants; roadmap |

---

### Task 1: `topology` — the shape, the operator ceremony, and `Generate` under it

**Files:**
- Modify: `topology/topology.go`, `topology/generate.go`, `topology/manifest.go`, `topology/testkeys.go`
- Create: `topology/operator.go`, `topology/operator_test.go`, `topology/signing_test.go`
- Modify: every `topology/*_test.go` that touches `keys.Operator` (`manifest_test.go:133,136,145`; `callers_names_test.go:27`)
- Modify: `docs/specs/2026-10-05-signing-keys-design.md` §3 (no `SystemAccount` in the operator JWT; `--dev` writes no root)

**Interfaces:**
- Produces:
  ```go
  type Keys struct { OperatorJWT string; OperatorSigning nkeys.KeyPair; Accounts map[string]AccountKeys }
  type AccountKeys struct { Identity string; Signing nkeys.KeyPair }
  type NewAccountKeys struct { Identity nkeys.KeyPair; Signing nkeys.KeyPair } // Identity nil for a rotation
  type Operator struct { Root nkeys.KeyPair; Signing nkeys.KeyPair; JWT string }
  func InitOperator() (Operator, error)
  func ReplaceSigningKey(root nkeys.KeyPair, current string) (newSigning nkeys.KeyPair, operatorJWT string, err error)
  func FreshKeys(callers []string) Keys          // new shape; root discarded
  type AccountRecord struct { Identity, Signing, Retiring string }
  // Manifest gains Accounts map[string]AccountRecord; Entry gains SigningKey, Reason string
  // Input gains RotateSigning []string; Output gains NewKeys map[string]NewAccountKeys
  ```
- `Generate` refuses: `OperatorSigning == nil`; operator JWT not listing it; operator JWT without `StrictSigningKeyUsage`; a `--keys` identity that disagrees with the manifest's record.

- [ ] **Step 1: Write the failing tests — properties 3, 4, 7; review-focus 1, 5**

`topology/operator_test.go`:
```go
package topology_test

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/nats-io/jwt/v2"

	"github.com/garm-ai/garm-ai/topology"
)

// The operator JWT the ceremony writes is root-signed, lists exactly the signing
// key, and turns strict signing-key usage on -- the field the whole shape rests
// on, because it is what makes the SERVER refuse a root-signed account.
func TestInitOperatorWritesAStrictRootSignedOperator(t *testing.T) {
	op, err := topology.InitOperator()
	if err != nil {
		t.Fatal(err)
	}
	oc, err := jwt.DecodeOperatorClaims(op.JWT)
	if err != nil {
		t.Fatal(err)
	}
	rootPub, _ := op.Root.PublicKey()
	signPub, _ := op.Signing.PublicKey()
	if oc.Subject != rootPub || oc.Issuer != rootPub {
		t.Errorf("subject %s issuer %s, want the root %s", oc.Subject, oc.Issuer, rootPub)
	}
	if len(oc.SigningKeys) != 1 || !oc.SigningKeys.Contains(signPub) {
		t.Errorf("signing keys %v, want exactly %s", oc.SigningKeys, signPub)
	}
	if !oc.StrictSigningKeyUsage {
		t.Error("strict signing-key usage is off; the server would accept a root-signed account")
	}
	if oc.SystemAccount != "" {
		t.Error("the operator JWT names a system account it cannot know at ceremony time")
	}
}

// Property 3, the structural half: the only place an operator key is created is
// operator.go. Every other file is checked by reading it, because a test that
// called Generate and hoped is not a proof of absence.
func TestTheOnlyCreateOperatorIsInOperatorGo(t *testing.T) {
	root := filepath.Join("..")
	var offenders []string
	_ = filepath.WalkDir(root, func(path string, d os.DirEntry, err error) error {
		if err != nil || d.IsDir() || !strings.HasSuffix(path, ".go") || strings.HasSuffix(path, "_test.go") {
			return nil
		}
		body, err := os.ReadFile(path)
		if err != nil {
			return nil
		}
		if strings.Contains(string(body), "nkeys.CreateOperator(") && filepath.Base(path) != "operator.go" {
			offenders = append(offenders, path)
		}
	})
	if len(offenders) > 0 {
		t.Fatalf("CreateOperator outside topology/operator.go: %v", offenders)
	}
}
```

`topology/signing_test.go`:
```go
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

func generate(t *testing.T, keys topology.Keys, prev *topology.Manifest, callers ...string) *topology.Output {
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
	out := generate(t, keys, topology.Empty(), "studio")
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
	first := generate(t, keys, topology.Empty(), "studio")
	nk, ok := first.NewKeys[topology.CallerPrefix+"studio"]
	if !ok || nk.Identity == nil || nk.Signing == nil {
		t.Fatalf("NewKeys = %v, want identity and signing keys for CALLER-studio", first.NewKeys)
	}
	idPub, _ := nk.Identity.PublicKey()
	if first.Manifest.Accounts[topology.CallerPrefix+"studio"].Identity != idPub {
		t.Fatal("the manifest does not record the new account's identity")
	}
	keys.Accounts[topology.CallerPrefix+"studio"] = topology.AccountKeys{Identity: idPub, Signing: nk.Signing}
	second := generate(t, keys, &first.Manifest, "studio")
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
	first := generate(t, keys, topology.Empty(), "studio")
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
	out := generate(t, keys, topology.Empty(), "studio")
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
```

- [ ] **Step 2: Run them** — `mise exec -- go test ./topology/ 2>&1 | tail -5`. Expected: compile FAIL (`InitOperator`, `OperatorSigning`, `NewKeys` undefined).

- [ ] **Step 3: `topology/topology.go` — the shape**

Replace the `Keys` block (and its "NOT YET THE SHAPE" comment) with:
```go
// Keys is what signs. The shape spec §5.1 of the identity spec describes and the
// signing-keys spec §1 pins: the ROOT IS NOT HERE. OperatorJWT is root-signed and
// taken as given; OperatorSigning signs accounts; each account's Signing signs its
// users and activations; Identity is a PUBLIC key, so nothing here can ever
// encode with an identity seed.
type Keys struct {
	OperatorJWT     string
	OperatorSigning nkeys.KeyPair
	// Accounts by name: SYS, GARM, TOOLS, CALLER-<n>. An account missing here is
	// NEW: Generate mints its keys and returns them in Output.NewKeys.
	Accounts map[string]AccountKeys
}

// AccountKeys is one account's keys as the issuance environment holds them.
type AccountKeys struct {
	Identity string // public; the seed is archived by the caller, read by nothing
	Signing  nkeys.KeyPair
}

// NewAccountKeys is what Generate minted and the caller must keep: both pairs for
// a new account; Signing only for a rotation (Identity nil).
type NewAccountKeys struct {
	Identity nkeys.KeyPair
	Signing  nkeys.KeyPair
}
```
`Input` gains, after `Rotate`:
```go
	// RotateSigning names accounts whose signing key is replaced: a new key is
	// minted and listed beside the old, and every credential of the account is
	// reissued under it (spec §4 step one). The old key is dropped at the next
	// issuance that finds it retiring.
	RotateSigning []string
```
`Output` gains:
```go
	// NewKeys is every account key Generate minted: a new account's pair, or a
	// rotation's new signing key. The caller writes them where --keys-out says.
	NewKeys map[string]NewAccountKeys
```
Update the package comment: "Keys are an INPUT" → "The root and the operator signing key are an INPUT the generator never produces; account keys are born here on first sight and handed back in NewKeys."

- [ ] **Step 4: `topology/operator.go`**

```go
package topology

import (
	"fmt"

	"github.com/nats-io/jwt/v2"
	"github.com/nats-io/nkeys"
)

// Operator is what the root ceremony produces. Root leaves the machine; Signing
// and JWT go to the issuance environment.
type Operator struct {
	Root    nkeys.KeyPair
	Signing nkeys.KeyPair
	JWT     string
}

// InitOperator is the ONE place an operator key is created. The JWT it writes is
// root-signed, lists exactly the signing key, and turns StrictSigningKeyUsage on
// -- which is what makes the SERVER refuse an account signed by the root or a
// user signed by an account's identity key (spec §0). It names no system account:
// none exists yet; the server configuration names it.
func InitOperator() (Operator, error) {
	root, err := nkeys.CreateOperator()
	if err != nil {
		return Operator{}, err
	}
	signing, err := nkeys.CreateOperator()
	if err != nil {
		return Operator{}, err
	}
	encoded, err := operatorJWT(root, signing)
	if err != nil {
		return Operator{}, err
	}
	return Operator{Root: root, Signing: signing, JWT: encoded}, nil
}

// ReplaceSigningKey is the operator-level rotation's first half: a new signing
// key, and an operator JWT listing it beside the current one. Retiring the old
// one is spec §3's deferred step; this exists so the server's acceptance of a
// replacement key is proved now.
func ReplaceSigningKey(root nkeys.KeyPair, current string) (nkeys.KeyPair, string, error) {
	signing, err := nkeys.CreateOperator()
	if err != nil {
		return nil, "", err
	}
	rootPub, err := root.PublicKey()
	if err != nil {
		return nil, "", err
	}
	signPub, err := signing.PublicKey()
	if err != nil {
		return nil, "", err
	}
	oc := jwt.NewOperatorClaims(rootPub)
	oc.Name = "garm"
	oc.StrictSigningKeyUsage = true
	oc.SigningKeys.Add(signPub, current)
	encoded, err := oc.Encode(root)
	if err != nil {
		return nil, "", fmt.Errorf("topology: encoding the operator: %w", err)
	}
	return signing, encoded, nil
}

func operatorJWT(root, signing nkeys.KeyPair) (string, error) {
	rootPub, err := root.PublicKey()
	if err != nil {
		return "", err
	}
	signPub, err := signing.PublicKey()
	if err != nil {
		return "", err
	}
	oc := jwt.NewOperatorClaims(rootPub)
	oc.Name = "garm"
	oc.StrictSigningKeyUsage = true
	oc.SigningKeys.Add(signPub)
	encoded, err := oc.Encode(root)
	if err != nil {
		return "", fmt.Errorf("topology: encoding the operator: %w", err)
	}
	return encoded, nil
}
```
(Two functions share the claim-building; fold into one `encodeOperator(root, keys ...string)` if that reads better — one definition.)

- [ ] **Step 5: `topology/testkeys.go`**

```go
// FreshKeys mints a throwaway operator -- root discarded, because nothing may
// hold it -- and identity + signing keys for every account. FOR TESTS AND
// `garmctl topology --dev` ONLY.
func FreshKeys(callers []string) Keys {
	op, err := InitOperator()
	if err != nil {
		panic(err)
	}
	k := Keys{OperatorJWT: op.JWT, OperatorSigning: op.Signing, Accounts: map[string]AccountKeys{}}
	names := []string{AccountSYS, AccountGARM, AccountTOOLS}
	for _, c := range callers {
		names = append(names, CallerPrefix+c)
	}
	for _, name := range names {
		id, err := nkeys.CreateAccount()
		if err != nil {
			panic(err)
		}
		pub, err := id.PublicKey()
		if err != nil {
			panic(err)
		}
		sign, err := nkeys.CreateAccount()
		if err != nil {
			panic(err)
		}
		k.Accounts[name] = AccountKeys{Identity: pub, Signing: sign}
	}
	return k
}
```

- [ ] **Step 6: `topology/manifest.go`**

```go
type Manifest struct {
	Generation      int                      `json:"generation"`
	CatalogueSHA256 string                   `json:"catalogue_sha256"`
	IssuedAt        time.Time                `json:"issued_at"`
	// Accounts records every account's public keys -- identity, signing, and a
	// retiring signing key between the two steps of a rotation (spec §4, §5).
	Accounts map[string]AccountRecord `json:"accounts"`
	Entries  []Entry                  `json:"entries"`
}

// AccountRecord is one account's keys as the manifest knows them. All public.
type AccountRecord struct {
	Identity string `json:"identity"`
	Signing  string `json:"signing"`
	Retiring string `json:"retiring,omitempty"`
}
```
`Entry` gains:
```go
	// SigningKey is the public key that signed this credential, so a rotation
	// can say what it reissued and a retirement can check nothing still names
	// the old key.
	SigningKey string `json:"signing_key"`
	// Reason is why this entry was issued: "new", "catalogue", "rotation";
	// empty for a carry-forward.
	Reason string `json:"reason,omitempty"`
```
`canonical` sorts entries as before (the map marshals deterministically). `Load` adds, after the signature verifies:
```go
	if s.Manifest.Accounts == nil {
		return nil, fmt.Errorf("topology: %s predates signing keys and cannot be continued; start again with --first under the new key layout", path)
	}
```
and `Empty()` returns `&Manifest{Accounts: map[string]AccountRecord{}}` so an explicit first manifest passes that check.

- [ ] **Step 7: `topology/generate.go`**

Replace the preamble (lines 23–76) with:
```go
	if in.Catalogue == nil || in.Previous == nil {
		return nil, fmt.Errorf("topology: a catalogue and a previous manifest are required")
	}
	if in.Keys.OperatorSigning == nil {
		return nil, fmt.Errorf("topology: an operator signing key is required; the root is never one")
	}
	if in.Expiry == 0 {
		in.Expiry = DefaultExpiry
	}
	signPub, err := in.Keys.OperatorSigning.PublicKey()
	if err != nil {
		return nil, err
	}
	// The operator JWT is root-signed and taken as GIVEN -- but checked: it must
	// list the signing key we hold, and it must be strict, or the server would
	// accept exactly what this shape exists to prevent (spec §0).
	oc, err := jwt.DecodeOperatorClaims(in.Keys.OperatorJWT)
	if err != nil {
		return nil, fmt.Errorf("topology: the operator JWT: %w", err)
	}
	if !oc.SigningKeys.Contains(signPub) {
		return nil, fmt.Errorf("topology: the operator JWT (root %s) does not list the signing key %s", oc.Subject, signPub)
	}
	if !oc.StrictSigningKeyUsage {
		return nil, fmt.Errorf("topology: the operator JWT does not set strict signing-key usage; the server would accept a root-signed account")
	}
	// (caller-name validation unchanged)
	...
	// ---- account keys: given, or born here
	//
	// An account the keys do not know is new. Its identity and signing pairs are
	// minted HERE, in the issuance environment, and handed back in NewKeys for the
	// caller to keep (spec §1). The root and the operator signing key are the two
	// keys this function can never mint; see operator.go.
	newKeys := map[string]NewAccountKeys{}
	accountNames := []string{AccountSYS, AccountGARM, AccountTOOLS}
	for _, c := range in.Callers {
		accountNames = append(accountNames, CallerPrefix+c)
	}
	keys := map[string]AccountKeys{}
	for _, name := range accountNames {
		k, ok := in.Keys.Accounts[name]
		if !ok {
			id, err := nkeys.CreateAccount()
			if err != nil {
				return nil, err
			}
			pub, err := id.PublicKey()
			if err != nil {
				return nil, err
			}
			sign, err := nkeys.CreateAccount()
			if err != nil {
				return nil, err
			}
			k = AccountKeys{Identity: pub, Signing: sign}
			newKeys[name] = NewAccountKeys{Identity: id, Signing: sign}
		}
		// A key that disagrees with the manifest is a key swapped under a running
		// estate -- the attack, not a typo (review focus 5).
		if rec, known := in.Previous.Accounts[name]; known && rec.Identity != k.Identity {
			return nil, fmt.Errorf("topology: %s's identity key %s disagrees with the manifest's %s", name, k.Identity, rec.Identity)
		}
		keys[name] = k
	}
	signingPub := func(name string) (string, error) { return keys[name].Signing.PublicKey() }
```
Then, in place of `accKey(...)` uses: `sysPub := keys[AccountSYS].Identity` etc. Every `jwt.NewAccountClaims(pub)` is followed by:
```go
	sp, _ := signingPub(name)
	ac.SigningKeys.Add(sp)
```
Activations: `act.IssuerAccount = toolsPub; actToken, err := act.Encode(keys[AccountTOOLS].Signing)`; same for `runAct` with `garmPub` / `keys[AccountGARM].Signing`.

`issue` signs with the signing key and records it:
```go
	uc.IssuerAccount = keys[account].Identity
	tok, err := uc.Encode(keys[account].Signing)
	...
	sp, _ := signingPub(account)
	return Credential{..., SigningKey: sp}, nil
```
(add `SigningKey string` to `Credential` so the entry can carry it.) The entry gets `SigningKey: c.SigningKey, Reason: reason` where `reason` is `"new"` if `previous[w.name]` is absent, else `"catalogue"`. (Rotation adds `"rotation"` in Task 4.)

Tombstones: replace the `in.Keys.Accounts[r.Account]` lookup with the manifest record:
```go
			rec, has := in.Previous.Accounts[r.Account]
			if !has {
				return nil, fmt.Errorf("topology: retiring %s needs its account record to revoke %s, and the manifest has none", r.Account, r.Public)
			}
			ac = jwt.NewAccountClaims(rec.Identity)
			ac.Name = r.Account
			ac.SigningKeys.Add(rec.Signing)
```
(no key needed — the tombstone is signed by the operator signing key like every account; `delta_test.go`'s "needs its signing key" test becomes "a tombstone is built from the manifest's record": update its assertion.)

Manifest assembly:
```go
	records := map[string]AccountRecord{}
	for name, k := range keys {
		sp, _ := signingPub(name)
		records[name] = AccountRecord{Identity: k.Identity, Signing: sp}
	}
	manifest := Manifest{Generation: gen, CatalogueSHA256: in.Catalogue.SHA256, IssuedAt: in.Now, Accounts: records, Entries: entries}
```
Encode accounts with `ac.Encode(in.Keys.OperatorSigning)`; `out.OperatorJWT = in.Keys.OperatorJWT` (passed through, never re-encoded); `out.NewKeys = newKeys`. Delete the `jwt.NewOperatorClaims` block.

- [ ] **Step 8: Fix the tests that touched `keys.Operator`**

`manifest_test.go`: `Save(path, keys.OperatorSigning)`, `keys.OperatorSigning.PublicKey()`, `other.OperatorSigning.PublicKey()`. `callers_names_test.go:27`: `want := keys.Accounts[topology.CallerPrefix+"studio"].Identity`. `delta_test.go`'s tombstone test (`grep -n "needs its signing key\|tombstone" topology/delta_test.go`): the retired caller's account is removed from `Keys.Accounts` as before; assert the output now **contains** a tombstone account for it whose `Issuer` is the operator signing key and whose revocations list the credential — rather than an error.

Amend spec §3: the operator JWT carries no `SystemAccount` (the server config does); `--dev` writes no root seed and says the root was discarded.

- [ ] **Step 9: Run; vet**

`mise exec -- go test ./topology/ 2>&1 | tail -8 && mise exec -- go vet ./topology/`. Expected: PASS. The estate and everything on it will not compile until Task 2 — `go build ./...` fails here and that is expected; run only `./topology/`.

- [ ] **Step 10: Commit; probe**

```bash
git add topology docs/specs
git commit -m "topology: the signing-key shape -- a root-signed operator JWT as input, signing keys on every account, keys born here for new accounts"
```
Probe property 4: in `Generate`, delete the `!oc.SigningKeys.Contains(signPub)` check. Expected: `TestGenerateRefusesAnOperatorJWTThatDoesNotListItsSigningKey` FAILS. Restore. Probe review-focus 5: delete the identity-disagreement check. Expected: `TestAKeysIdentityThatDisagreesWithTheManifestIsRefused` FAILS. Restore.

---

### Task 2: The estate switches — the server enforces the shape

**Files:**
- Modify: `internal/estate/estate.go`
- Create: `internal/estate/signing_test.go`

**Interfaces:**
- Consumes: Task 1's `Keys`, `FreshKeys`, `Output.NewKeys`.
- Produces: `(*Estate).ApplyNewKeys(out *topology.Output)`; `(*Estate).Keys() topology.Keys`; `(*Estate).OperatorRoot() nkeys.KeyPair` (the estate keeps its throwaway root, for the tests that need to sign *badly*); `Reissue` applies `NewKeys`.

- [ ] **Step 1: Write the failing tests — properties 1 and 2**

`internal/estate/signing_test.go`:
```go
package estate_test

import (
	"strings"
	"testing"
	"time"

	"github.com/nats-io/jwt/v2"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nkeys"

	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/topology"
)

// Property 1: the SERVER refuses an account signed by the root. Strict
// signing-key usage is on in the operator JWT; the push over $SYS is the path a
// deployment takes, and the resolver says no.
func TestTheServerRefusesAnAccountSignedByTheRoot(t *testing.T) {
	e := estate.New(t)
	keys := e.Keys()
	ac := jwt.NewAccountClaims(keys.Accounts[topology.AccountTOOLS].Identity)
	ac.Name = topology.AccountTOOLS
	sp, _ := keys.Accounts[topology.AccountTOOLS].Signing.PublicKey()
	ac.SigningKeys.Add(sp)
	rootSigned, err := ac.Encode(e.OperatorRoot())
	if err != nil {
		t.Fatal(err)
	}
	if err := e.TryPushAccount(t, rootSigned); err == nil {
		t.Fatal("the server accepted an account signed by the root; strict signing-key usage is not in force")
	}
}

// Property 2: the SERVER refuses a user signed by the account's identity key.
// The estate holds no identity seeds -- Keys.Accounts[].Identity is a public key
// -- so this test mints an account of its own, pushes it (signed correctly), and
// then signs a user with the identity seed it still has.
func TestTheServerRefusesAUserSignedByAnIdentityKey(t *testing.T) {
	e := estate.New(t)
	id, _ := nkeys.CreateAccount()
	idPub, _ := id.PublicKey()
	sign, _ := nkeys.CreateAccount()
	signPub, _ := sign.PublicKey()
	ac := jwt.NewAccountClaims(idPub)
	ac.Name = "PROBE"
	ac.SigningKeys.Add(signPub)
	encoded, err := ac.Encode(e.Keys().OperatorSigning)
	if err != nil {
		t.Fatal(err)
	}
	e.PushAccount(t, encoded)

	user := func(signer nkeys.KeyPair) (string, string) {
		ukp, _ := nkeys.CreateUser()
		upub, _ := ukp.PublicKey()
		seed, _ := ukp.Seed()
		uc := jwt.NewUserClaims(upub)
		uc.IssuerAccount = idPub
		tok, err := uc.Encode(signer)
		if err != nil {
			t.Fatal(err)
		}
		return tok, string(seed)
	}
	badJWT, badSeed := user(id)
	if nc, err := nats.Connect(e.URL, nats.UserJWTAndSeed(badJWT, badSeed), nats.Secure(e.TLS()), nats.Timeout(2*time.Second)); err == nil {
		nc.Close()
		t.Fatal("a user signed by the identity key connected")
	} else if !strings.Contains(strings.ToLower(err.Error()), "authorization") {
		t.Fatalf("refused for the wrong reason: %v", err)
	}
	goodJWT, goodSeed := user(sign)
	nc, err := nats.Connect(e.URL, nats.UserJWTAndSeed(goodJWT, goodSeed), nats.Secure(e.TLS()))
	if err != nil {
		t.Fatalf("the same user signed by the signing key was refused: %v", err)
	}
	nc.Close()
}
```

- [ ] **Step 2: Run** — `mise exec -- go test ./internal/estate/ -run 'TestTheServerRefuses' 2>&1 | tail -4`. Expected: compile FAIL (`e.Keys`, `e.OperatorRoot`, `e.TryPushAccount` undefined; and the estate itself does not build against Task 1's `Keys`).

- [ ] **Step 3: Estate changes**

In `New`: `op, err := topology.InitOperator()` (keep `op.Root` on the estate as `root`); build `keys := topology.FreshKeys(callers)` **then overwrite** `keys.OperatorJWT, keys.OperatorSigning = op.JWT, op.Signing` so the estate's operator is the one whose root it holds — or give `FreshKeys` a sibling `FreshKeysFor(op topology.Operator, callers)`; the latter is cleaner, add it in `testkeys.go` and have `FreshKeys` call it. Decode `keys.OperatorJWT` for `TrustedOperators`; `SystemAccount: keys.Accounts[topology.AccountSYS].Identity`; preload `res.Store(keys.Accounts[name].Identity, encoded)`.

Add:
```go
// Keys is the estate's issuance keys -- what a deployment's issuance environment
// holds. No root: it is in OperatorRoot, apart, as it would be.
func (e *Estate) Keys() topology.Keys { return e.keys }

// OperatorRoot is the throwaway root the estate's operator JWT was signed with,
// kept ONLY so a test can sign something badly and watch the server refuse it.
func (e *Estate) OperatorRoot() nkeys.KeyPair { return e.root }

// ApplyNewKeys folds what an issuance minted into the estate's keys, as the
// issuance environment would keep them.
func (e *Estate) ApplyNewKeys(out *topology.Output) {
	for name, nk := range out.NewKeys {
		k := e.keys.Accounts[name]
		if nk.Identity != nil {
			k.Identity, _ = nk.Identity.PublicKey()
		}
		k.Signing = nk.Signing
		e.keys.Accounts[name] = k
	}
}

// TryPushAccount is PushAccount that returns the server's refusal instead of
// failing the test, for a test whose point is the refusal.
func (e *Estate) TryPushAccount(t testing.TB, encoded string) error { ... same body, returning the error ... }
```
`PushAccount` calls `TryPushAccount` and fatals. `Reissue` calls `e.ApplyNewKeys(out)` before returning. `AccountKey(as)` returns `e.keys.Accounts[CallerPrefix+as].Identity`.

- [ ] **Step 4: Build and run everything that stands on the estate**

`mise exec -- go build ./... && mise exec -- go test ./internal/estate/ ./natscall/ ./rundsvc/ ./natsserve/ ./cmd/... ./examples/... 2>&1 | tail -12`. Expected: `cmd/garmctl` fails to build (`readKeys`/`writeKeys` still use the old shape) — stub that in Task 3; everything else PASS. If `go build ./...` blocks the run, do Task 3's Step 3 (the key I/O) first and ledger the reorder.

- [ ] **Step 5: Commit; probe property 1**

```bash
git add internal/estate topology
git commit -m "estate: the signing-key shape, strict signing-key usage on the server, and the two refusals it enforces"
```
Probe: in `topology/operator.go` set `oc.StrictSigningKeyUsage = false`. Expected: `TestTheServerRefusesAnAccountSignedByTheRoot` FAILS ("the server accepted…") and `TestTheServerRefusesAUserSignedByAnIdentityKey` FAILS ("connected"); also Task 1's `TestInitOperatorWritesAStrict…` fails. Restore.

---

### Task 3: `garmctl operator init`, the `--keys` layout, `--keys-out`, the refusals

**Files:**
- Create: `cmd/garmctl/operator.go`, `cmd/garmctl/operator_test.go`
- Modify: `cmd/garmctl/root.go` (`AddCommand(operatorCmd())`), `cmd/garmctl/topology.go`, `cmd/garmctl/topology_test.go`, `cmd/garmctl/topology_dev_test.go`

**Interfaces:**
- Produces: `garmctl operator init --out <dir>`; `garmctl operator replace-signing-key --root <file> --operator <jwt> --out <dir>`; `--keys` layout `operator.jwt`, `operator-signing.nk`, `<ACCOUNT>.pub`, `<ACCOUNT>.signing.nk`, `archive/<ACCOUNT>.identity.nk`; `--keys-out`; `readKeys(dir, callers) (topology.Keys, error)` tolerating missing caller accounts (they are new); `writeNewKeys(dir string, nk map[string]topology.NewAccountKeys) error`.

- [ ] **Step 1: Write the failing tests — properties 5, 6, 7 (keys untouched), 12; review-focus 3**

`cmd/garmctl/operator_test.go`:
```go
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
	if last := lines[len(lines)-1]; !strings.Contains(last, "root/") || !strings.Contains(strings.ToLower(last), "custody") {
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
```

Append to `cmd/garmctl/topology_test.go`:
```go
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
// reads it -- while the chain still closes.
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
	snapshot := dirDigest(t, keys)
	if err := os.RemoveAll(filepath.Join(keys, "archive")); err != nil {
		t.Fatal(err)
	}
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
```
Imports to add: `crypto/sha256`, `encoding/hex`. Note the 0o500 directory: `root` ignores permissions — these tests assume a non-root user, as the repository's other permission tests do.

Update `TestDevEmitsAThrowawayTopologyAndSaysSo`'s file list: `keys/operator.jwt`, `keys/operator-signing.nk`, `keys/SYS.pub`, `keys/SYS.signing.nk`, `keys/CALLER-studio.pub`, `keys/CALLER-studio.signing.nk`; **no** `keys/root.nk` and no `keys/operator.nk`; stderr contains "root" and "discarded".

- [ ] **Step 2: Run** — compile FAIL (`operatorCmd` undefined).

- [ ] **Step 3: `cmd/garmctl/operator.go`**

```go
package main

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/nats-io/jwt/v2"
	"github.com/nats-io/nkeys"
	"github.com/spf13/cobra"

	"github.com/garm-ai/garm-ai/topology"
)

func operatorCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "operator",
		Short: "The root ceremony: run OFFLINE, once",
	}
	cmd.AddCommand(operatorInitCmd(), operatorReplaceCmd())
	return cmd
}

func operatorInitCmd() *cobra.Command {
	var out string
	cmd := &cobra.Command{
		Use:   "init",
		Short: "Create the root and the operator signing key; write the root apart",
		Long: "init is the one place an operator key is created. It writes the root\n" +
			"seed under <out>/root and everything topology needs under <out>/keys.\n" +
			"The root signs nothing day to day: move root/ to custody now, and never\n" +
			"let it sit where topology runs -- topology refuses a --keys that holds it.",
		RunE: func(cmd *cobra.Command, _ []string) error {
			if out == "" {
				return errors.New("--out is required")
			}
			if _, err := os.Stat(out); err == nil {
				return fmt.Errorf("%s exists; a ceremony is not repeated by accident", out)
			}
			op, err := topology.InitOperator()
			if err != nil {
				return err
			}
			for _, d := range []string{"root", "keys"} {
				if err := os.MkdirAll(filepath.Join(out, d), 0o700); err != nil {
					return err
				}
			}
			if err := writeSeed(filepath.Join(out, "root", "root.nk"), op.Root); err != nil {
				return err
			}
			if err := writeSeed(filepath.Join(out, "keys", "operator-signing.nk"), op.Signing); err != nil {
				return err
			}
			if err := os.WriteFile(filepath.Join(out, "keys", "operator.jwt"), []byte(op.JWT), 0o600); err != nil {
				return err
			}
			rootPub, _ := op.Root.PublicKey()
			fmt.Fprintf(cmd.OutOrStdout(), "ok: operator %s; keys for topology in %s\n", rootPub, filepath.Join(out, "keys"))
			fmt.Fprintf(cmd.OutOrStdout(), "MOVE %s TO CUSTODY NOW: the root signs nothing day to day and must never be where topology runs\n", filepath.Join(out, "root"))
			return nil
		},
	}
	cmd.Flags().StringVarP(&out, "out", "o", "", "directory to create; must not exist")
	return cmd
}

func operatorReplaceCmd() *cobra.Command {
	var rootPath, operatorPath, out string
	cmd := &cobra.Command{
		Use:   "replace-signing-key",
		Short: "Mint a new operator signing key, listed beside the current one (run OFFLINE)",
		RunE: func(cmd *cobra.Command, _ []string) error {
			if rootPath == "" || operatorPath == "" || out == "" {
				return errors.New("--root, --operator and --out are required")
			}
			root, err := readSeed(rootPath)
			if err != nil {
				return err
			}
			current, err := jwt.DecodeOperatorClaims(mustReadString(operatorPath))
			if err != nil {
				return err
			}
			keys := current.SigningKeys.Keys()
			if len(keys) != 1 {
				return fmt.Errorf("%s lists %d signing keys; replace-signing-key expects exactly one (retiring the old one is not built yet)", operatorPath, len(keys))
			}
			signing, encoded, err := topology.ReplaceSigningKey(root, keys[0])
			if err != nil {
				return err
			}
			if err := os.MkdirAll(out, 0o700); err != nil {
				return err
			}
			if err := writeSeed(filepath.Join(out, "operator-signing.nk"), signing); err != nil {
				return err
			}
			return os.WriteFile(filepath.Join(out, "operator.jwt"), []byte(encoded), 0o600)
		},
	}
	cmd.Flags().StringVar(&rootPath, "root", "", "the root seed (root/root.nk)")
	cmd.Flags().StringVar(&operatorPath, "operator", "", "the current operator.jwt")
	cmd.Flags().StringVarP(&out, "out", "o", "", "directory for the new operator.jwt and operator-signing.nk")
	return cmd
}

func writeSeed(path string, kp nkeys.KeyPair) error {
	seed, err := kp.Seed()
	if err != nil {
		return err
	}
	return os.WriteFile(path, seed, 0o600)
}

func readSeed(path string) (nkeys.KeyPair, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return nkeys.FromSeed(bytes.TrimSpace(raw))
}
```
(`mustReadString` — a plain `os.ReadFile` returning the error; name it `readString`. `bytes` import.) `root.go`: `cmd.AddCommand(operatorCmd())`.

- [ ] **Step 4: `cmd/garmctl/topology.go` — the layout, `--keys-out`, the refusals, `--dev`**

`readKeys(dir string, callers []string) (topology.Keys, error)`:
```go
	// The one file that must NOT be here. Checked before anything is read, so
	// a copied-over ceremony directory is refused by name rather than used.
	if _, err := os.Stat(filepath.Join(dir, "root.nk")); err == nil {
		return topology.Keys{}, fmt.Errorf("%s holds root.nk: the root must never be where topology runs; it belongs in custody (operator init wrote it under root/)", dir)
	}
	k := topology.Keys{Accounts: map[string]topology.AccountKeys{}}
	jwtBytes, err := os.ReadFile(filepath.Join(dir, "operator.jwt"))
	...
	k.OperatorJWT = string(jwtBytes)
	if k.OperatorSigning, err = readSeed(filepath.Join(dir, "operator-signing.nk")); err != nil { ... }
	names := []string{topology.AccountSYS, topology.AccountGARM, topology.AccountTOOLS}
	for _, c := range callers { names = append(names, topology.CallerPrefix+c) }
	for _, n := range names {
		pub, err := os.ReadFile(filepath.Join(dir, n+".pub"))
		if errors.Is(err, fs.ErrNotExist) {
			continue // new: Generate mints it
		}
		if err != nil { return k, err }
		sign, err := readSeed(filepath.Join(dir, n+".signing.nk"))
		if err != nil { return k, fmt.Errorf("%s has %s.pub but no usable signing seed: %w", dir, n, err) }
		k.Accounts[n] = topology.AccountKeys{Identity: strings.TrimSpace(string(pub)), Signing: sign}
	}
	return k, nil
```
`writeNewKeys(dir string, nk map[string]topology.NewAccountKeys) error` — creates `dir` and `dir/archive` (0700); for each: `<name>.signing.nk` (seed, 0600); if `Identity != nil`: `<name>.pub` (public key, 0644) and `archive/<name>.identity.nk` (seed, 0600). Called **before** `Manifest.Save`: the order is keys → manifest → output, because a key that never reached disk is an account nothing can ever issue for, worse than a manifest entry for a credential that never landed.

`RunE`: add `keysOut` (default `""` → `keysDir`); `--dev`: `keys = topology.FreshKeys(callers)`, message now "minting a THROWAWAY operator (root discarded) and keys, written beside the output; never deploy these". `writeKeys` for `--dev` writes the new layout (`operator.jwt`, `operator-signing.nk`, `<n>.pub`, `<n>.signing.nk`; no archive — `FreshKeys` has no identity seeds). Manifest `Save`/`Load` use `keys.OperatorSigning`.

- [ ] **Step 5: Run the garmctl suite; the dev boot**

`mise exec -- go test ./cmd/garmctl/ 2>&1 | tail -8`. Expected: PASS, including `TestDevEmitsAServerConfigThatBootsAndAcceptsItsOwnCredentials` — which now boots a server from an operator JWT with strict usage and connects with a signing-key-signed credential: the quick start under the new shape.

- [ ] **Step 6: Commit; probes**

```bash
git add cmd/garmctl
git commit -m "garmctl operator init; the --keys layout with the root apart; --keys-out; topology refuses a directory holding the root"
```
Probe 5: delete the `root.nk` stat in `readKeys`. Expected: `TestTopologyRefusesAKeysDirectoryHoldingTheRoot` FAILS. Restore. Probe 7: make `writeNewKeys` write to `keysDir` instead of `keysOut`… no — probe the *other* half: have `readKeys` ignore an existing `<n>.pub` for callers (always treat as new). Expected: `TestAccountKeysAreBornOnce…` FAILS ("wrote into --keys" or a changed identity in the manifest → Generate refuses). Restore.

---

### Task 4: Rotation — two steps, `--verify-live`, `--status`

**Files:**
- Modify: `topology/generate.go`, `topology/topology.go`; `cmd/garmctl/topology.go`; `internal/estate/estate.go`
- Create: `topology/rotation_test.go`, `cmd/garmctl/live.go`, `cmd/garmctl/rotation_test.go`, `internal/estate/rotation_test.go`

**Interfaces:**
- Consumes: `Input.RotateSigning`, `AccountRecord.Retiring`, `Entry.SigningKey`.
- Produces: `(*Estate).RotateSigning(t, account string) *topology.Output` (reissue with `RotateSigning`, applies new keys); `(*Estate).Issue(t) *topology.Output` (an ordinary reissue, same catalogue); `liveSigners(nc *nats.Conn) (map[string][]string, error)`; flags `--rotate-signing`, `--status`, `--verify-live`, `--nats`, `--ops-creds`, `--tls-ca`.

- [ ] **Step 1: Write the failing tests — properties 8, 11; review-focus 2** (`topology/rotation_test.go`)

```go
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
	first := generate(t, keys, topology.Empty(), "studio")
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
	first := generate(t, keys, topology.Empty(), "studio")
	oldPub, _ := keys.Accounts[topology.AccountGARM].Signing.PublicKey()
	stepOne := rotate(t, keys, &first.Manifest, topology.AccountGARM)
	keys = apply(keys, stepOne)

	stepTwo := generate(t, keys, &stepOne.Manifest, "studio")
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
	first := generate(t, keys, topology.Empty(), "studio")
	oldPub, _ := keys.Accounts[topology.AccountGARM].Signing.PublicKey()
	stepOne := rotate(t, keys, &first.Manifest, topology.AccountGARM)
	keys = apply(keys, stepOne)
	tampered := stepOne.Manifest
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
	first := generate(t, keys, topology.Empty(), "studio")
	stepOne := rotate(t, keys, &first.Manifest, topology.AccountGARM)
	keys = apply(keys, stepOne)
	_, err := topology.Generate(topology.Input{Catalogue: fixtures.Weather(t).Catalogue, Callers: []string{"studio"},
		Previous: &stepOne.Manifest, Keys: keys, Now: time.Now(), RotateSigning: []string{topology.AccountGARM}})
	if err == nil || !strings.Contains(err.Error(), "retiring") {
		t.Fatalf("err = %v, want a refusal because GARM is already retiring a key", err)
	}
}
```

- [ ] **Step 2: Run** — FAIL (`RotateSigning` ignored: no `NewKeys[GARM]`).

- [ ] **Step 3: Rotation in `Generate`**

After the account-keys block:
```go
	// ---- rotation (spec §4)
	rotating := map[string]bool{}
	for _, name := range in.RotateSigning {
		if _, ok := keys[name]; !ok {
			return nil, fmt.Errorf("topology: --rotate-signing %s: no such account in this topology", name)
		}
		if in.Previous.Accounts[name].Retiring != "" {
			return nil, fmt.Errorf("topology: %s is already retiring a signing key; retire it (an ordinary issuance) before rotating again", name)
		}
		sign, err := nkeys.CreateAccount()
		if err != nil {
			return nil, err
		}
		old, _ := keys[name].Signing.PublicKey()
		retiring[name] = old
		k := keys[name]
		k.Signing = sign
		keys[name] = k
		newKeys[name] = NewAccountKeys{Signing: sign}
		rotating[name] = true
	}
	// A key retiring from a previous step one is dropped now -- unless something
	// still names it, which only a hand-edited manifest can arrange.
	for name, rec := range in.Previous.Accounts {
		if rec.Retiring == "" || rotating[name] {
			continue
		}
		for _, e := range in.Previous.Entries {
			if e.Account == name && e.SigningKey == rec.Retiring {
				return nil, fmt.Errorf("topology: %s's retiring key %s still signs %s; it cannot be retired", name, rec.Retiring, e.Name)
			}
		}
		// retired: simply not listed below, and not recorded
	}
```
(`retiring := map[string]string{}` declared before.) Account claims: `ac.SigningKeys.Add(sp)`; `if old, ok := retiring[name]; ok { ac.SigningKeys.Add(old) }` — and, for an account whose previous record has `Retiring` and is not rotating now, list only the current key (that is the drop). Carry-forward: `if p, ok := previous[w.name]; ok && !in.Rotate && !rotating[w.account] && …` — a rotating account's credentials are all reissued with `reason = "rotation"`. Manifest records: `Retiring: retiring[name]` (empty when none). `delta` already revokes the superseded credentials of the rotating account (their public keys changed); that is correct — the old credentials die when the old key is dropped anyway, and a revocation dated now is belt and braces.

- [ ] **Step 4: Run** — `mise exec -- go test ./topology/ 2>&1 | tail -5`. Expected: PASS.

- [ ] **Step 5: The live estate — properties 9, 10, 11a** (`internal/estate/rotation_test.go`)

```go
package estate_test

import (
	"testing"
	"time"

	"github.com/nats-io/nats.go"

	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/topology"
)

// Properties 9 and 10, end to end on the live estate: between the steps both the
// old and the new rund credentials work; after step two's push the old one's
// live connection is closed and it is refused on reconnect, and the new one is
// untouched.
func TestRotationKeepsTheOldCredentialAliveUntilStepTwo(t *testing.T) {
	e := estate.New(t)
	oldJWT, oldSeed := e.Credential(estate.RoleRund)
	closed := make(chan struct{}, 1)
	oldConn := e.ConnectWith(t, estate.RoleRund, nats.NoReconnect(),
		nats.ClosedHandler(func(*nats.Conn) { closed <- struct{}{} }))

	stepOne := e.RotateSigning(t, topology.AccountGARM)
	e.PushAccount(t, stepOne.Accounts[topology.AccountGARM])
	time.Sleep(200 * time.Millisecond)
	if !oldConn.IsConnected() {
		t.Fatal("step one's push closed the OLD credential's connection; the old key must still be listed")
	}
	newConn := e.ConnectWith(t, estate.RoleRund) // the estate now holds the new credential
	if !newConn.IsConnected() {
		t.Fatal("the new credential could not connect between the steps")
	}

	stepTwo := e.Issue(t)
	e.PushAccount(t, stepTwo.Accounts[topology.AccountGARM])
	select {
	case <-closed:
	case <-time.After(5 * time.Second):
		t.Fatal("the old credential's connection survived the retirement push")
	}
	if nc, err := nats.Connect(e.URL, nats.UserJWTAndSeed(oldJWT, oldSeed), nats.Secure(e.TLS())); err == nil {
		nc.Close()
		t.Fatal("the old credential reconnected after its signing key was retired")
	}
	if !newConn.IsConnected() {
		t.Fatal("the new credential was disturbed by the retirement")
	}
}
```
Property 11a is a `garmctl` test (Step 7), because `--verify-live` is the command's.

Estate additions:
```go
// Issue reissues against the current catalogue and manifest -- an ordinary
// issuance, which is what step two of a rotation is.
func (e *Estate) Issue(t testing.TB) *topology.Output { return e.Reissue(t, e.Catalogue.Current()) }

// RotateSigning is step one of spec §4 for one account.
func (e *Estate) RotateSigning(t testing.TB, account string) *topology.Output {
	t.Helper()
	out, err := topology.Generate(topology.Input{
		Catalogue: e.Catalogue.Current(), Callers: callers,
		Previous: &e.topo.Manifest, Keys: e.keys, Now: time.Now(), RotateSigning: []string{account},
	})
	if err != nil {
		t.Fatalf("rotating %s: %v", account, err)
	}
	e.topo = out
	e.ApplyNewKeys(out)
	e.adoptCredentials(out) // e.creds[c.Name] = c for every reissued credential
	return out
}
```
`Reissue` also calls `adoptCredentials`, so `Connect(t, RoleRund)` after a rotation uses the new credential (today `Reissue` leaves `e.creds` stale — note it in the ledger as a latent bug fixed here).

- [ ] **Step 6: Run** — `mise exec -- go test ./internal/estate/ -run TestRotation 2>&1 | tail -4`. Expected: PASS once the estate helpers exist (RED first on the missing methods).

- [ ] **Step 7: `garmctl` — `--rotate-signing`, `--status`, `--verify-live`; property 11a; review-focus 4**

`cmd/garmctl/live.go`:
```go
package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/nats-io/nats.go"
)

// liveSigners asks the cluster, with the ops credential, which signing key each
// live connection's credential was issued by: issuer key -> connection names.
// This is the evidence step two of a rotation refuses without (spec §4): the
// manifest knows what was issued, the bus knows what is in use.
func liveSigners(nc *nats.Conn) (map[string][]string, error) {
	req, _ := json.Marshal(map[string]any{"auth": true})
	reply, err := nc.Request("$SYS.REQ.SERVER.PING.CONNZ", req, 3*time.Second)
	if err != nil {
		return nil, fmt.Errorf("asking the cluster for its connections: %w", err)
	}
	var resp struct {
		Data struct {
			Conns []struct {
				Name      string `json:"name"`
				IssuerKey string `json:"issuer_key"`
			} `json:"connections"`
		} `json:"data"`
	}
	if err := json.Unmarshal(reply.Data, &resp); err != nil {
		return nil, fmt.Errorf("the cluster's CONNZ reply: %w", err)
	}
	by := map[string][]string{}
	for _, c := range resp.Data.Conns {
		if c.IssuerKey != "" {
			by[c.IssuerKey] = append(by[c.IssuerKey], c.Name)
		}
	}
	return by, nil
}
```
(Check the exact field name for the connection list in `server.Connz` — `Conns []*ConnInfo json:"connections"` — and that `issuer_key` is populated when `auth` is requested; a `TestLiveSignersSeesTheIssuerKey` against the estate's ops connection pins it.) One server answers `SERVER.PING`; a cluster answers once per server — collect every reply for `3*time.Second` with `SubscribeSync` on an inbox rather than `Request`, so a multi-server deployment is counted whole. Write it that way from the start.

`topology.go` `RunE`: before `Generate`, when `verifyLive` and any `previous.Accounts[*].Retiring != ""` and that account is not in `rotateSigning`: connect with `--nats`/`--ops-creds`/`--tls-ca` (via `natsconn.Connect`), `liveSigners`, and refuse if the retiring key is present, naming the connections. When nothing is retiring, no connection is made (review focus 4). `--status`: load the manifest, print generation, catalogue, per-account `signing`/`retiring` and, for a retiring account, the count of entries and the sentence from spec §4; exit 0; no issuance.

`cmd/garmctl/rotation_test.go`:
```go
// Property 11a: --verify-live refuses to retire a key still on the wire, naming
// the connection; with that connection closed, step two proceeds.
func TestVerifyLiveRefusesWhileTheOldKeyIsStillOnTheWire(t *testing.T) {
	e := estate.New(t)
	keys, manifest, out := keysFromEstate(t, e) // writes the estate's Keys to a --keys dir and its manifest to a file
	ops := e.CredsFile(t, estate.RoleOps)
	ca := e.CAFile(t)
	// step one, through the command
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", "studio,batch", "--rotate-signing", "GARM", "--out", out)...); err != nil {
		t.Fatal(err)
	}
	e.PushAccount(t, mustRead(t, filepath.Join(out, "accounts", "GARM.jwt")))
	// a process still on the OLD credential
	old := e.ConnectWith(t, estate.RoleRund, nats.Name("rund-old"))
	_, stderr, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", "studio,batch",
		"--verify-live", "--nats", e.URL, "--ops-creds", ops, "--tls-ca", ca, "--out", out)...)
	if err == nil || !strings.Contains(err.Error()+stderr, "rund-old") {
		t.Fatalf("step two ran with the old key live; err=%v stderr=%s", err, stderr)
	}
	old.Close()
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", "studio,batch",
		"--verify-live", "--nats", e.URL, "--ops-creds", ops, "--tls-ca", ca, "--out", out)...); err != nil {
		t.Fatalf("step two after the old connection closed: %v", err)
	}
}

// Review focus 4: with nothing retiring, --verify-live makes no connection.
func TestVerifyLiveIsInertWhenNothingIsRetiring(t *testing.T) {
	e := estate.New(t)
	keys, manifest, out := keysFromEstate(t, e)
	if _, _, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", "studio,batch",
		"--verify-live", "--nats", "nats://127.0.0.1:1", "--ops-creds", "/nonexistent", "--out", out)...); err != nil {
		t.Fatalf("--verify-live tried to connect with nothing retiring: %v", err)
	}
}
```
`keysFromEstate` writes `e.Keys()` in the `--keys` layout (operator JWT, signing seed, every account's `.pub` and `.signing.nk`) and saves `e.Topology().Manifest` signed by the operator signing key — a test helper in `topology_test.go`. The estate's `rund` credential name is `rund`; `nats.Name("rund-old")` is the connection name `CONNZ` reports, so the refusal names it.

- [ ] **Step 8: Whole suite; commit; probes**

`mise exec -- go test ./... 2>&1 | grep -v "no test files" | tail -20`. Expected: PASS.
```bash
git add topology internal/estate cmd/garmctl
git commit -m "rotation: --rotate-signing lists both keys and reissues the account; the next issuance retires; --verify-live asks the bus; --status"
```
Probe 10: in `Generate`, keep listing the retiring key after step two (never drop). Expected: `TestRotationStepTwoRetiresTheOldKey` and `TestRotationKeepsTheOldCredentialAliveUntilStepTwo` FAIL. Restore. Probe 11a: make `liveSigners` return an empty map. Expected: `TestVerifyLiveRefusesWhileTheOldKeyIsStillOnTheWire` FAILS ("step two ran with the old key live"). Restore.

---

### Task 5: Docs — the identity spec's status moves, the drawings, the guide

**Files:**
- Modify: `docs/specs/2026-10-04-identity-and-transport-security-design.md` (status line; §5.1 "built"; §13's item closed; §10 step 5's first checkbox now producible), `docs/specs/2026-10-05-signing-keys-design.md` (status: built), `docs/specs/README.md`, `docs/identity.html`, `docs/deployment.html`, `docs/guide.md` §4, `docs/invariants.md`, `docs/roadmap.md`, `docs/reviews/2026-10-04-c-level-review.md` (Progress: signing-key shape → done)

- [ ] **Step 1: The guide's quick start**

```bash
garmctl compose examples/images.yaml -o build/catalogue.binpb
garmctl topology --dev --catalogue file://build/catalogue.binpb --callers forecast -o build/topo
```
stays one command for a laptop; add the deployment shape beneath it:
```bash
garmctl operator init --out ceremony            # OFFLINE, once; move ceremony/root to custody
garmctl topology --keys ceremony/keys --keys-out ceremony/keys --manifest manifest.json --first \
  --catalogue file://build/catalogue.binpb --callers studio -o topo
```
and the rotation sequence in four lines (`--rotate-signing GARM` → roll out → `--verify-live … ` → done), with the sentence that `kubectl rollout status` is necessary and not sufficient.

- [ ] **Step 2: `identity.html` and `deployment.html`** — the key table from the spec's §0 and the rotation sequence; keep the built / next / designed-only distinction; check the other drawing when changing one (specs/README's rule).

- [ ] **Step 3: `invariants.md`** — a "Signing keys" subsection: one row per property 1–13 and 11a with its test, and the three review-focus tests.

- [ ] **Step 4: `roadmap.md`** — the row "The operator signing-key shape; the root offline" → done, step **9f**; `reviews/…c-level-review.md` Progress table row → done.

- [ ] **Step 5: `mise run ci`; `mise run bench` only if the call path changed (it did not — note that in the ledger rather than adding a row); commit**

```bash
git add docs
git commit -m "docs: signing keys landed -- identity spec §5.1 built, the drawings, the guide's ceremony and rotation, invariants, roadmap"
```

---

## Self-review

**Spec coverage.** §0 shape + strict usage (T1, T2) · §1 inputs, refusals, new accounts, `--keys-out` (T1, T3) · §2 what signs what (T1 `TestEverythingIsSigned…`) · §3 ceremony, replace-signing-key, no `nsc`, `--dev` (T3; amendment: no `SystemAccount`, no dev root) · §4 rotation, retirement, straggler guard, `--verify-live`, `--status` (T4) · §5 manifest (T1) · §6 table (all) · §7 properties: 1 T2 · 2 T2 · 3 T1 · 4 T1 · 5 T3 · 6 T3 · 7 T1+T3 · 8 T4 · 9 T4 · 10 T4 · 11 T4 · 11a T4 · 12 T3 · 13 T2 (the switch) · §8 order followed · §10 nothing built that it excludes.

**Placeholder scan.** `liveSigners` tells the implementer to confirm one JSON field name against `server.Connz` and pins it with a test; `keysFromEstate` is described by what it writes (the layout is fully specified in T3). No TBDs.

**Type consistency.** `Keys{OperatorJWT, OperatorSigning, Accounts map[string]AccountKeys}` in T1–T4; `NewAccountKeys{Identity, Signing}` with `Identity == nil` for rotation in T1 and T4; `AccountRecord{Identity, Signing, Retiring}` in T1 and T4; `Entry.SigningKey/Reason` in T1 and T4; estate `Keys()`, `OperatorRoot()`, `ApplyNewKeys`, `TryPushAccount`, `Issue`, `RotateSigning` in T2 and T4.

**Review Focus.** 1 → T1 · 2 → T4 · 3 → T3 · 4 → T4 · 5 → T1.
