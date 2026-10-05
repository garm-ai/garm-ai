# Signing keys: the root offline, accounts that can rotate

**Date:** 2026-10-05
**Status:** designed — nothing built; the plan follows review of this document

**Spec for:** the key shape the identity spec's §5.1 describes and the generator does
not yet produce — a root that signs nothing day to day, an operator signing key
that signs accounts, an account signing key that signs every credential — and the
one operation that shape exists for: rotating a key without touching anything that
trusts the root.

**Why it is its own slice:** the identity spec's §13 found it ("the generator signs
every account with the operator key itself, so `Keys.Operator` *is* the root; users
are signed by each account's identity key, so an account carries no signing key to
rotate"), and §10 step 5's first deployment precondition cannot be ticked until it
lands. The C-level review put it first among the next slices because it blocks
deployment, and it is small: an input-shape change to the generator, one new
command, and one new operation.

**Decided in review, one question at a time (§9):** one long-lived signing key per
account; a separate offline `garmctl operator init`; account keys born in the
issuance environment; two-step rotation.

---

## 0. The three keys, and who holds each

| key | signs | lives | created by |
|---|---|---|---|
| **operator root** | the operator JWT, once — and later a replacement operator signing key | **offline**; never in the issuance environment; never an input to `topology` | `garmctl operator init`, offline |
| **operator signing key** | every account JWT | the issuance environment, as `--keys/operator-signing.nk` | `garmctl operator init`, offline, listed in the operator JWT |
| **account identity key** | nothing, after creation — it *is* the account's name | its **public** key in `--keys/<ACCOUNT>.pub`; its seed in `--keys/archive/`, read by nothing | the generator, in the issuance environment, on first sight of the account |
| **account signing key** | every user credential of that account, and the account's activation tokens | the issuance environment, as `--keys/<ACCOUNT>.signing.nk` | the generator, in the issuance environment, with the identity key |

The sentence the identity spec built on — *keys are an input to the generator, never
produced by it* — narrows to its true form: **the root and the operator signing key
are never produced by the generator**, and a test proves there is no code path
that could. Account keys are born where they are used, because the issuance
environment is already the security boundary (identity §5.1) and because caller
accounts arrive on demand, long after the root ceremony, and must not require a
trip to the offline machine each time.

**What NATS enforces, so this is not a convention.** The operator JWT sets
`StrictSigningKeyUsage`: the server then refuses an account JWT signed by the
operator *identity* key and a user JWT signed by an account *identity* key. The
shape is checked by the thing that terminates the connection, not by a rule in
a document.

---

## 1. What the generator takes, and what it refuses

```go
type Keys struct {
	// OperatorJWT is the root-signed operator claim, taken as GIVEN. The generator
	// verifies it lists OperatorSigning's public key and refuses otherwise.
	OperatorJWT     string
	OperatorSigning nkeys.KeyPair
	// Accounts by name. Identity is a PUBLIC key; Signing is the seed that signs
	// the account's users and activations. An account absent here is NEW: the
	// generator mints both keys and returns them in Output.NewKeys.
	Accounts map[string]AccountKeys
}

type AccountKeys struct {
	Identity string        // public key; the seed is archived, never read
	Signing  nkeys.KeyPair
}
```

`Generate` **refuses** to run when `OperatorSigning` is nil or when `OperatorJWT`
does not list its public key. It has no path that creates an operator key: the
only `nkeys.CreateOperator` in the module is in `garmctl operator init`, and a
test greps for it.

`garmctl topology` **refuses** to run when `--keys` contains `root.nk` — the
file `operator init` writes for the root — so the two commands can never be run
from one directory by accident. The refusal names the file and says where the
root belongs.

**New accounts.** A caller named in `--callers` with no `<ACCOUNT>.pub` in
`--keys` is new. The generator mints its identity and signing keypairs and
returns them in `Output.NewKeys`; `garmctl topology` writes
`<ACCOUNT>.pub`, `<ACCOUNT>.signing.nk` and `archive/<ACCOUNT>.identity.nk`
(0600, written once, never read) to **`--keys-out`** before anything else is
written. `--keys-out` defaults to `--keys` on a laptop; in a cluster `--keys`
is a mounted secret and read-only, so `--keys-out` is a scratch path the
issuance job then stores into the secret store. A second issuance finds the
keys in `--keys` and mints nothing — the identity public key is stable across
issuances, `--keys` itself is never written, and a test holds both.

---

## 2. What signs what

| document | issuer | `IssuerAccount` | encoded with |
|---|---|---|---|
| operator JWT | root | — | root seed, in `operator init` only |
| account JWT | operator signing key | — | `OperatorSigning` |
| user JWT | account signing key | the account's identity public key | `Accounts[a].Signing` |
| activation token (an export's grant to an importer) | account signing key | the exporting account's identity public key | `Accounts[a].Signing` |

Every account JWT carries `SigningKeys = [its signing key]` — and, during a
rotation, two. Nothing is ever encoded with an identity seed after `operator
init` and the generator's one `CreateAccount` call, which is why the archive
is an archive.

**No scoped signing keys.** NATS can put a permission template on a signing key
so that users it signs inherit it. Our permissions are per credential, derived
from the catalogue — a tool service's allow-list is its declared tools — so a
scoped key would mean one key per tool service for no gain, and the user JWT
would lose the permissions a reviewer reads today. Permissions stay on the user
JWT; the signing key is about *who may mint*, not *what is minted*.

---

## 3. The root ceremony: `garmctl operator init`

```
garmctl operator init --out <dir>
```

Run **offline, once**. Writes:

```
<dir>/root/root.nk                 the root seed -- leaves this machine now
<dir>/keys/operator.jwt            root-signed; lists the operator signing key; StrictSigningKeyUsage
<dir>/keys/operator-signing.nk     what topology signs accounts with
```

and prints, as its last line, that `root/` must be moved to custody and must
never be present where `topology` runs. Refuses an existing `<dir>`: a ceremony
is not repeated by accident. ~60 lines; the operator JWT it writes is the only
document in the estate the root ever signs — until a signing key is replaced,
which is the same command with `--replace-signing-key`, run offline against the
root, and which produces a new `operator.jwt` listing the new key *and* the old
one until the next `operator init --retire-signing-key` drops it. That is the
operator-level mirror of §4, built in this slice only as far as the test that
proves a replacement key signs accounts the server accepts; the two-step retire
at operator level is specified, not built, and the status says so.

**`nsc` is not required and not documented.** A deployment that insists on it is
not blocked: `topology` needs *an* operator JWT listing *a* signing key it holds,
and `nsc` can produce exactly that. We test and document our own ceremony only.

**`--dev`** runs the ceremony and the issuance in one go and **discards the
root** — nothing uses it, and a root beside a topology is the one thing
`topology` refuses — saying, as it already does for every key it writes, that
this is a toy a deployment must never do. The guide's quick start stays one
command.

**The operator JWT names no system account.** `operator init` runs before any
account exists. The server configuration names it (`system_account:` in the
dev conf; `Options.SystemAccount` in the estate), which is where NATS reads it
from anyway when both are set.

---

## 4. Rotation: two issuances, carried by the manifest

Dropping a signing key from an account JWT invalidates every credential it
signed *the instant the JWT is pushed*. Rotation is therefore two steps, and the
manifest carries the state between them.

**Step one** — `garmctl topology --rotate-signing GARM …`:

1. a new signing keypair for GARM is minted (an account key: born in the
   issuance environment, written to `--keys` like any other, the old seed left in
   place but no longer used);
2. GARM's account JWT lists **both** keys, new first;
3. **every** credential in GARM is reissued under the new key — carry-forward is
   suspended for the rotating account, the one reason an unchanged credential is
   ever re-signed, and the manifest entry says `"reason": "rotation"`;
4. the manifest records `accounts.GARM.retiring = <old public key>`;
5. every other account is carried forward untouched;
6. the account's superseded credentials are **not** revoked — both keys are
   listed precisely so they keep working while the new ones roll out, and a
   `RevokeAt` in the pushed account JWT would close them on the spot (found by
   the live estate: the first build did revoke them, and step one's push cut
   the old connection). Retiring the key at step two is what invalidates them,
   all at once, by construction.

Deployments roll out the new credential files. In between, `garmctl topology
--status` (and the next issuance's log) says: *GARM: signing key retiring; the
old key is still listed; run an issuance to retire it once every process has
its new credential.*

**Step two** — the next ordinary issuance:

7. sees `retiring` on GARM, drops the old key from the account JWT, records the
   retirement with its generation, and clears `retiring`;
8. refuses to do so if any manifest entry still names the retiring key as its
   signer — which cannot happen after a complete step one, and is exactly what
   happens if someone hand-edits the manifest or re-runs step one with a
   different caller list. The refusal names the credentials.

**What the generator cannot know from the manifest** is whether the rollout
finished: it knows every credential was *issued*, not that every process
*reconnected* with it. But the bus knows. Every live connection's user JWT
names the key that signed it, and the system account's `CONNZ` request lists
them. So step two takes **`--verify-live`**: with the ops credential it asks
the cluster and **refuses to retire a key that any live connection was signed
by**, naming the connections. Evidence from the bus, not a hope about the
rollout — and it works on a laptop exactly as on a cluster. On Kubernetes
`kubectl rollout status` is necessary and not sufficient: a Deployment can be
"rolled out" with one pod still reconnecting on an old mount. (`nats.go`
re-reads a credentials file on reconnect, and a mounted Secret updates in
place, so a pod often picks up its new credential without a restart; useful,
and not what step two relies on.)

**Per-credential revocation is unchanged.** `RevokeAt` in the account JWT, dated
at or after the credential's `iat`, pushed over `$SYS`. Rotation is for a key;
revocation is for a credential; neither is the other's job.

---

## 5. The manifest

```json
{
  "generation": 7,
  "catalogue_sha256": "…",
  "issued_at": "…",
  "accounts": {
    "GARM": { "identity": "AC…", "signing": "AC…", "retiring": "AC…" }
  },
  "entries": [
    { "name": "rund", "account": "GARM", "public": "UA…", "signing_key": "AC…",
      "catalogue_sha256": "…", "generation": 7, "permissions_hash": "…",
      "issued_at": 1759612800, "reason": "rotation" }
  ]
}
```

Two additions: `accounts` (identity, signing, and the retiring key if any — all
public) and `signing_key` on every entry, so a rotation can say what it reissued
and step two can check nothing still names the old key. `reason` is `"new"`,
`"catalogue"`, `"rotation"` or absent for a carry-forward — the manifest already
said *what* was issued; now it says *why* a credential changed. The manifest is
still signed by the operator signing key and still carries no seed.

**Break forward.** Nothing is in production; the old `Keys` shape and the old
manifest are not read, and `Load` refuses a manifest without `accounts` with
a message that says to start with `--first` under the new shape.

---

## 6. What changes in the repository

| | change |
|---|---|
| `topology/topology.go` | `Keys`, `AccountKeys`; `Output.NewKeys`; `Input.RotateSigning []string` |
| `topology/generate.go` | verify the operator JWT; sign accounts with the operator signing key; `SigningKeys` on every account; users and activations signed by account signing keys with `IssuerAccount`; mint keys for new accounts; the rotation and retirement steps |
| `topology/manifest.go` | `Accounts`, `Entry.SigningKey`, `Entry.Reason`; refuse the old shape |
| `topology/testkeys.go` | `FreshKeys` produces the new shape, including a throwaway root and a root-signed operator JWT |
| `topology/operator.go` (new) | `InitOperator() (root, signing nkeys.KeyPair, operatorJWT string, err)` — the one `CreateOperator` |
| `cmd/garmctl/operator.go` (new) | `operator init`; `--replace-signing-key` |
| `cmd/garmctl/topology.go` | `readKeys`/`writeKeys` for the new layout; refuse `root.nk`; write new accounts' keys to `--keys-out` first; `--rotate-signing`; `--status`; `--verify-live` over `$SYS` `CONNZ` |
| `internal/estate` | the new shape; `StrictSigningKeyUsage` on the server; `Rotate(t, account)` for the rotation tests |
| `docs/specs/…identity…` | §5.1 status: built; §13 item closed; §10 step 5's first precondition now producible |
| `docs/identity.html`, `docs/deployment.html` | the key table and the rotation sequence |
| `docs/guide.md` §4 | `garmctl operator init` before `topology`, in the quick start and in `--dev` |
| `docs/invariants.md`, `docs/roadmap.md` | rows as they land |

---

## 7. Properties, stated as tests

Each proved to fail first.

1. **The server refuses an account signed by the root.** An account JWT encoded
   with the root seed, pushed to the estate's resolver, is rejected — strict
   signing-key usage is on and is enforced by the server, not by us.
2. **The server refuses a user signed by an account's identity key.** A user JWT
   encoded with the identity seed is refused at connect with an authorization
   error, while the same user signed by the signing key connects.
3. **The generator cannot create an operator key.** `Generate` with
   `OperatorSigning == nil` refuses; and a test greps the module for
   `nkeys.CreateOperator` and finds it only in `topology/operator.go`.
4. **The generator verifies the operator JWT.** An operator JWT that does not list
   the signing key it was given is refused, naming both keys.
5. **`topology` refuses a directory holding the root.** With `root.nk` present in
   `--keys`, `garmctl topology` exits before reading anything else and names the
   file.
6. **The identity seed is never read.** `garmctl topology` succeeds with
   `--keys/archive/` deleted; the activation chain (caller → `rund` → tool) still
   closes, so activations were signed by the signing key.
7. **A new caller's keys are born once.** Two issuances with a new caller: the
   second reads the first's `<ACCOUNT>.pub` and mints nothing — the identity
   public key in the manifest is identical, and `Output.NewKeys` is empty.
8. **Rotation step one lists both keys and reissues the account, and only it.**
   After `--rotate-signing GARM`: the account JWT lists two signing keys; every
   GARM entry has `reason: rotation` and the new `signing_key`; every other
   account's entries are carried forward unchanged (same `public`, same
   `issued_at`); the manifest records `retiring`.
9. **Both old and new credentials work between the steps.** On the live estate,
   after step one's account JWT is pushed, a connection holding the old `rund`
   credential stays up and the new one connects.
10. **Step two retires the key and the old credential dies.** The next issuance
    drops the old key; after its account JWT is pushed, the old credential's
    live connection is closed and it is refused on reconnect; the new one is
    untouched.
11. **Step two refuses stragglers.** A manifest hand-edited so one GARM entry
    still names the retiring key makes the next issuance refuse, naming it.
11a. **`--verify-live` refuses while the old key is still on the wire.** On the
    live estate after step one, with one connection still holding the old
    `rund` credential, step two with `--verify-live` refuses and names it;
    close that connection and step two proceeds.
12. **`operator init` refuses to repeat.** A second run against the same `--out`
    exits non-zero and writes nothing; the first run's last line names `root/`.
13. **Every identity property still holds under the new shape.** The estate
    switches to it, so `estate`, `topology`, `rundsvc` and `natscall`'s existing
    tests are the proof; property 2 of the identity spec (a caller cannot reach
    a tool) is re-run explicitly in the plan's final step as the sentinel.

---

## 8. Migration order

1. `topology`: `Keys`/`AccountKeys`/manifest shape; `Generate` under the new shape
   with `FreshKeys`; properties 3, 4, 7.
2. The estate switches: strict signing-key usage on the server; properties 1, 2,
   6, 13.
3. `garmctl operator init` and the `--keys` layout: properties 5, 12; `--dev`
   runs both; the quick start test still boots.
4. Rotation: `--rotate-signing`, `retiring`, retirement; properties 8–11.
5. Docs: identity spec status, §13, `identity.html`, `deployment.html`, guide,
   invariants, roadmap.

Steps 1–4 touch nothing running. A deployment adopts this by running `operator
init` offline once and starting issuance with `--first` under the new layout.

---

## 9. Decisions settled in review

| question | decision | the alternative, and why not |
|---|---|---|
| what a signing key is scoped to | one long-lived key per account; rotation is loud and deliberate (§4) | per generation — fights carry-forward, lists grow forever; a listed standby — unused key to guard, revisit after a rehearsed rotation |
| who produces the root-signed operator JWT | `garmctl operator init`, offline, ~60 lines (§3) | `nsc` — a second tool, its own store layout, settings to tolerate; accepted as input, not documented |
| where account keys come from | born in the issuance environment on first sight; identity seed archived, never read (§1) | an offline ceremony per account — every new caller a trip to the offline machine; create-and-destroy — a door closed for nothing |
| what a rotation does | two issuances; both keys listed in between; carry-forward suspended for the account; the old key dropped at the next issuance, refusing if anything still names it (§4) | a timed grace window — a clock cuts off a slow rollout; manual — nothing ensures it happens |

Three details settled without a question: no scoped signing keys (§2);
activation tokens signed by the account signing key (§2); break forward, no
migration (§5).

---

## 10. What this does not do

- **It does not make an HSM a configuration option.** The identity spec's §5.1
  names "an HSM-backed signer" as the shape a bank will ask for. nkeys are
  ed25519 and the signer needs the raw seed; a cloud KMS cannot sign an nkeys
  JWT in place. The realistic cluster shape is the seed in a secret store with
  audited, short-lived access. The generator is unchanged either way — keys are
  an input — but "HSM" should not be read as a switch.

- **It does not design the issuance environment.** §5.1 of the identity spec
  names what it must be; this slice makes the generator's inputs match it. The
  API that onboards a partner without a hand is that environment with a front
  on it, still not designed.
- **It does not build the operator-level two-step retire.** Replacing an operator
  signing key is specified in §3 and tested as far as "a replacement key signs
  accounts the server accepts"; retiring the old one is the same shape as §4 and
  lands when a rotation at that level is first rehearsed.
- **It does not change permissions, revocation, the manifest's signature, or
  anything on the wire.** `natscall` publishes what it published; `rund` reads
  the caller from the subject as before.
- **It does not gate the rollout.** The generator knows what was issued, not
  what restarted (§4).
