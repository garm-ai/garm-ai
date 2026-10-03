# Identity and transport security

**Date:** 2026-10-04
**Status:** active — this spec's §2–§10 are **step 9d**; §11 sketches the two slices
after it and specifies nothing

**Spec for:** a NATS operator-mode topology, a generator that emits it from the
catalogue, and the caller identity that falls out of it.

**Drawn:** [the identity page](../identity.html) — the three caller shapes, the
three objects, and the topology proved below.

**Decided in conversation, recorded here:** operator mode rather than server-config
accounts; build thin rather than adapt the previous estate's authorization server;
OpenFGA is out; the development identity provider is not ported; and tools and
agents stay declared in proto.

---

## 0. What this is, and what it deliberately is not

This slice establishes **which process is which**. It does not establish who a
*person* is, and it must not be read as doing so.

That is not a shortcut. It is the order the dependencies actually run in: the
later model binds a token to the process presenting it, and checking that binding
requires a trustworthy process identity to check it *against*. §11 says where the
rest goes, and §13 records a naming problem inherited from the previous estate's
version of that binding.

The deliverable is a repository in which **every existing test runs against a
server configured as production is**, and in which the sentence "only `rund` calls
`garm.tool.>`" stops being an entry in the unenforced table.

---

## 1. The constraint everything follows from

**A NATS message does not say who sent it.** `nats.Msg` carries `Subject`,
`Reply`, `Header`, `Data` and a subscription pointer. There is no client info and
no authenticated-user field. Verified by reading the struct, because every
decision below rests on it.

So identity must be made visible deliberately, and there are three ways:

| mechanism | what it proves | cost |
|---|---|---|
| **in the subject** | the server refuses a publish on a subject that is not yours, so the subject *is* the claim | a credential and a subject per caller |
| **in a signed token** | forgeable only by whoever holds the signing key | a verifier, JWKS, clock skew, rotation, revocation |
| **asserted in a header** | nothing on its own — worth exactly what the right to publish on that subject is worth | none, which is the problem |

This slice uses the first. The third is not a fourth option; it is the second
collapsed into the first, and a header is trustworthy precisely when a subject
permission makes it so.

**This is the mechanism the previous estate's standing-grant spec needed and never
named.** Its frame 16 says to compare `cnf.sub` against *"the connection's
identity"* — which a receiver cannot read off a message. The check as written is
not implementable. It becomes implementable here.

---

## 2. The topology

Accounts are the isolation boundary: a subject does not cross one except through
an explicit export **and** a matching import.

```
operator: garm
├── SYS          system account — operations only, never the data path
├── GARM         rund
│                  exports  service  garm.run.v1.*.>    account token position 4
│                  imports  service  garm.tool.>        from TOOLS
├── TOOLS        tool services
│                  exports  service  garm.tool.>        imported by GARM alone
└── CALLER-<n>   one account per caller: a front door, a batch job, a decider
                   imports  service  garm.run.v1.<own account key>.>   from GARM
                   local subject     garm.run.v1.>
```

Two properties fall out of the shape rather than out of a check.

**Only `rund` can call a tool.** `garm.tool.>` is exported by TOOLS and imported
by exactly one account. A caller does not get a refusal; it gets *no responders*,
because the subject is not in its namespace at all.

**`rund` learns who called and cannot be lied to.** §3.

### 2.1 Why one account per caller, rather than one CALLERS account

Because `AccountTokenPosition` identifies an **account**, not a user. Callers
sharing an account are indistinguishable to `rund`, which defeats the point. The
cost is honest: a caller is an account, and adding one is an operation.

### 2.2 The export is private

TOOLS exports `garm.tool.>` as a private export, so an import additionally
requires an activation token signed by TOOLS. Isolation already achieves the
property; this makes adding a second importer a deliberate, signed act rather than
an edit nobody reviews.

---

## 3. The subject layout

**Verified against a running server, not inferred from documentation.**

```
export (GARM)      garm.run.v1.*.>              AccountTokenPosition 4
a caller publishes garm.run.v1.invoke           ← UNCHANGED from today
rund receives      garm.run.v1.<ACCOUNT>.invoke
export (TOOLS)     garm.tool.>
a tool answers     garm.tool.<name>             ← UNCHANGED from today
```

One export covers every run operation, present and future, because the account
token sits at position 4 and the operation follows it. A new operation needs no
new export and no account change.

**The caller never writes its account key.** It publishes the subject it publishes
today; the import's local-subject mapping is what inserts the key, and the server
guarantees the key is the importing account's own. Nothing to forge, no header to
verify, and `natscall` does not change.

`rund` subscribes `garm.run.v1.*.invoke` and `garm.run.v1.*.fetch`, and reads the
caller from token 4 of `Subject()`, which `micro.Request` exposes.

### 3.1 What this costs `rundsvc`

- `SubjectInvoke` and `SubjectFetch` become **patterns**, not the subjects a caller
  publishes. The "nothing answered on X" message must name the pattern honestly, or
  it will send an operator looking for a subject nobody publishes.
- The caller arrives as a 56-character account key. `rund` maps it to a name
  through the generated topology; an unmapped key is logged and treated as unknown,
  never as absent.
- `micro` endpoint subjects must accept a wildcard. They do.

---

## 4. Permissions are derived from the catalogue

A tool service's permissions are not written by anyone. The catalogue knows every
tool's name; a subject comes from a name; therefore the permission is a function of
the catalogue.

```
user weatherd, account TOOLS
  subscribe  garm.tool.weather.v1.get_forecast     one allow per DECLARED tool
  publish    _R_.>                                 see §4.1 — this is not optional
```

**Declaring a tool is what creates its permission, and a service cannot answer a
tool it does not declare.** That is the same rule the rest of the repository runs
on — a field arrives when the thing that enforces it arrives — applied to the
transport.

### 4.1 `_R_.>`, and the failure it prevents

A cross-account service reply arrives on **`_R_.<x>.<y>`, not `_INBOX.>`**
(`replyPrefix = "_R_."`, nats-server `server/accounts.go`). A tool whose publish
permission allows only the inbox prefix **receives the call and is silently refused
the reply**; the caller waits out its own deadline and reports a hung tool.

Found by a probe that failed. It is written here in the specification, not left in
a commit message, because a generator that omits it produces an estate that looks
correct and times out.

### 4.2 When a tool leaves the catalogue

Deriving a permission from the catalogue says what happens when a tool is *added*.
Removal is the harder half, and **only one of its three effects is automatic**.

**Routing stops at once.** `rund` reloads, the name does not resolve, callers get
`NOT_FOUND`. Built and tested.

**The permission does not shrink.** A user JWT is a **bearer document held by the
process**. Regenerating the topology produces a *new* document; the running service
keeps the old one, with the old permission, until it is replaced *and the old one
revoked*. **Nothing about editing a catalogue reaches a credential already in a
process's hands.**

**The subscription survives.** The service is still mounted and still subscribed.
Harmless only because nothing but `rund` may publish there and `rund` will not —
which is defence by behaviour rather than by structure, and so does not count.

#### The risk this creates is name reuse

`natsmicro` sets no queue group, so micro's default applies and **every instance
answering a subject shares one**. If `weather.v1.get_forecast` is retired and that
name is later reused by a different service, a zombie process still holding the old
credential **joins the same queue group and takes a share of the calls**. The queue
group is precisely what makes that silent rather than loud.

`compose` refuses two tools claiming one name *at a point in time*; it cannot see
across time, and nothing else does either.

#### So removal is an output of the generator, not an operator's memory

The generator takes the **previous topology** alongside the new catalogue and emits
a delta: which credentials to reissue because their permission set changed, and
which to **revoke** because a service was retired. `RevokeAt(pubKey, t)` retires one
user's credentials issued before `t`; `RevokeAt(jwt.All, t)` retires every
credential of an account before `t`, which is the blunt generation cut-off for a
compromise or a wholesale rotation.

A removal that produces no revocation is a bug in the generator, not a decision an
operator gets to make.

#### Ordering: grant before use, revoke after disuse

- **Adding** a tool: the permission lands **before** the service answering it starts,
  or it cannot subscribe.
- **Removing** a tool: the service stops **before** its credential is revoked, or it
  loses its connection mid-call.

Both are the same rule — the permission set is briefly a superset of what is
running, and never a subset.

### 4.3 A service refuses to start if a mount is not permitted

If a service's generated code still mounts a tool its credential no longer permits,
`Start` **succeeds** and the subscription is refused **asynchronously** — the same
shape as §4.1, and just as quiet. In the spike, `LastError()` showed the violation
only after a sleep, so no timing-dependent check can be the gate.

The process holds its own user JWT, so the check is local and deterministic:
**decode it, and compare every mounted subject against the credential's own allowed
subjects before announcing**. A mount not covered is a refusal to start, naming the
tool.

This turns "boots cleanly and never answers" into "does not boot, and says why",
and it needs no round trip to the server.

### 4.4 `rund`'s own permissions, and why they are a wildcard

`rund` publishes `garm.tool.>` through its import and subscribes its two run
patterns. It gets no system-account access and no JetStream permissions; when the
run store arrives it reaches Postgres, not the bus, for that.

**The wildcard is deliberate.** Were `rund`'s permission to enumerate tools, every
catalogue change would require reissuing `rund`'s credential — and **hot reload
would be pointless, because the permission would lag the catalogue it exists to
track**. What bounds `rund` is the catalogue it loads, not its credential.

The concession is stated plainly: a compromised `rund` can publish on any tool
subject, including a retired one. It could already call every *declared* tool, so
the marginal loss is small, and `rund`'s credential is consequently the one worth
protecting most (§12).

**An agent needs no credential at all.** The generator emits no Go for an agent and
no service answers one, so adding or removing an agent has no credential
consequence.

---

## 5. Credentials, revocation, and rotation

**One credential per process**, carrying a user JWT and a seed. Deployment reads a
`.creds` file; tests pass `nats.UserJWTAndSeed` and touch no disk.

**Revocation, not expiry.** Short-lived user JWTs sound safer and are worse here:
NATS does not renew them, so a long-running tool service would be disconnected on a
timer and reconnect storms become the failure mode. Operator mode offers the better
mechanism — `Revocations` on the **account**, pushed through the resolver, killing
one user without restarting a server or touching any other process.

Rotation is therefore: issue the new credential, restart that one process, revoke
the old. No clock pressure, and revocation takes effect at once rather than after a
TTL.

**Nothing in this slice has an `exp`.** When slice 2 issues user JWTs per
connection they are short-lived by construction, because a connection re-authenticates
when it reconnects. Giving long-lived service credentials an expiry *now* would add
an outage mode and remove nothing.

---

## 6. The system account and the resolver

**SYS is operations-only.** Not `rund`, not a tool, not a caller. In slice 2 it
also carries connection requests, which is a second reason the separation is
established now while it is free.

**The resolver is the NATS-based one in production** — accounts stored and
replicated by the servers themselves, updated over `$SYS`, with no separate account
server to run or keep available. **Tests preload `MemAccResolver`** from the same
generated documents.

---

## 7. One generator, two consumers

The topology is generated by code that reads the catalogue, and it has exactly two
consumers:

- **tests**, which build it in process and hand it to `natsserver.Options`
  (`TrustedOperators`, `AccountResolver`, `SystemAccount`);
- **deployment**, which writes the operator, accounts and credentials out.

**The configuration that is tested is the configuration that is deployed**, because
there is one of them. This is the property that makes the slice enforcement rather
than a story, and it is the reason the generator comes before anything else in §10.

It lives in `garmctl` beside `compose`, reading the same artefact. Signing keys are
an input, never an output: the generator never invents a key it also trusts.

**It takes the previous topology as a second input** (§4.2), because a removal is
only visible as a difference. A generator that sees one catalogue can emit the
permissions that should exist; only one that sees two can emit the revocations that
must. That makes its inputs two things rather than one, which §13 already dislikes
about caller accounts — but here it is inherent rather than incidental.

---

## 8. What changes in the repository

| | change |
|---|---|
| `garmctl` | a new command: read the catalogue, emit the topology |
| `internal/estate` | builds the topology, starts the server in operator mode, hands out credentials by role — `Connect(t, RoleCaller)` rather than a bare dial |
| `rundsvc` | subscribes the wildcard patterns; reads the caller from token 4; maps a key to a name |
| `natscall` | **nothing** — it publishes the same subject it publishes today |
| `natsserve` | the startup gate of §4.3 — subjects are unchanged, but a mount outside the credential must refuse to start |
| `cmd/rund`, `cmd/garmctl`, examples | a credentials flag, and `nats.UserCredentials` on connect |

That `natscall` is untouched, and that `natsserve`'s **subjects** are untouched, is
the single most useful consequence of §3, and it was not a given — it is what the
sixth probe was for. `natsserve` gains only the startup gate, which is new behaviour
rather than a changed wire.

---

## 9. Security properties, stated as tests

Each is a test the implementation must carry, and each must be proved to fail
before it is trusted.

1. A caller credential publishing on `garm.tool.<name>` reaches nothing.
2. **`rund` reaches the tool it imports.** Property 1 passes vacuously while
   nothing can reach the tool — this pairing is not optional, and in the probe the
   isolation result *was* meaningless until this one passed.
3. `rund` receives the caller's account key at token 4, placed by the server.
4. Two caller accounts are distinguishable at `rund`.
5. A caller publishing today's `garm.run.v1.invoke` still reaches `rund`.
6. A tool service cannot subscribe to a tool it does not declare.
7. A tool service **can** reply — the `_R_.>` permission is present. Fails as a
   timeout rather than a refusal if omitted, which is why it is its own property.
8. A revoked user cannot connect; no other user of that account is affected.
8a. Removing a tool from the catalogue produces a **revocation** in the generator's
    output, not merely a smaller next credential.
8b. A service whose mount is not covered by its own credential **refuses to start**,
    and names the tool. Proved by generating a credential for a narrower catalogue
    than the service was built against — the case that otherwise boots and never
    answers.
8c. A credential issued for a previous catalogue generation no longer connects once
    revoked, with a running service holding it — the zombie case in §4.2.
9. The generator emits, for a catalogue, exactly one subscribe permission per
   declared tool and no others.
10. No data-path credential carries system-account access.

---

## 10. Migration order

Chosen so the repository is never in a state where the tests pass and nothing is
enforced.

1. **The generator and its tests**, with no server involved. Property 9.
2. **The test estate switches to operator mode.** No production change. Every
   existing test then runs against a production-shaped server — the step most likely
   to expose a wrong assumption, and reversible.
3. **The isolation tests land.** Properties 1, 2, 6, 7 — 1 and 2 in the same commit,
   for the reason in §9.
4. **`rund`'s subscription moves** to the wildcard and begins reading the caller
   identity, which nothing yet *uses*. Properties 3, 4, 5.
5. **Deployment credentials**, when everything above is green.

Steps 1–4 are entirely inside the repository. Only step 5 touches a running system.

---

## 11. The two slices after this one

Sketched so the shape is visible. **Neither is specified here**, and neither should
be built from this section.

**Slice 2 — connection identity.** Auth callout: a service swapping an external
token or client assertion for a NATS user JWT, so a human or a service is identified
*at connect*. Two day-one requirements rather than hardening: the request crosses
`$SYS.REQ.USER.AUTH` where **base64 is encoding, not encryption**, so it needs
account isolation and `xkey`; and it blocks every new connection with a 2-second
default timeout, so it is HA before anything depends on it. Replay is handled
already — each connection gets a one-time `user_nkey` that must match in the reply.

The development identity provider returns here **as a fixture beside the verifier**,
not as a port. The previous estate's own notes name minter/verifier drift as an open
hazard; a round-trip test closes it.

**Slice 3 — delegated identity.** The consent template, the standing grant, the
per-call token. The [identity page](../identity.html) carries the model and the four
gaps found in it.

---

## 12. What this does not do

- **It does not identify a person.** §0.
- **It does not encrypt anything.** Account isolation is authorization, not
  confidentiality. TLS between client and server is a deployment concern this spec
  does not cover, and `xkey` arrives with slice 2 because that is when a secret
  first crosses the bus.
- **It does not stop a compromised `rund`.** `rund` holds the only import that
  reaches tools; that is the design, and it is why `rund`'s credential is the one
  worth protecting most.
- **It does not give a deployment predicates over calls.** "Never above €1m, whoever
  asks" is not expressible here, is not expressible in a grant caveat either, and is
  an open question in the authority model rather than this spec.
- **It does not partition tools by tenant.** All tool services share TOOLS. A
  per-tenant TOOLS account is a natural extension and is not needed until two tenants
  deploy tools with the same declared names, which `compose` refuses first.

---

## 13. Open questions

- **Where do caller accounts come from?** The generator reads the catalogue, and a
  catalogue does not know about callers. Likely a deployment input alongside it, but
  that makes the generator's input two things rather than one, and that is worth
  disliking.
- **Does `rund` need a caller's *name* at all in this slice?** Nothing uses it yet.
  Carrying it is cheap; logging it before anything enforces it risks reading as a
  guarantee.
- **Operator key custody.** The operator key signs accounts and is the root of all
  of it. A deployment needs a real answer — offline, HSM, or a signing key with the
  root kept out of reach — and "the generator takes it as an input" is not that
  answer, only the shape of it.
- **The inherited binding claim is called `cnf`, and should not be.** `cnf` is
  RFC 7800's *confirmation* claim, and its meaning is precise: the issuer declares
  the presenter **possesses a particular key**, and the recipient can
  **cryptographically confirm** that possession. Its registered members are key
  representations — `jwk`, `jwe`, `kid`, `jku`, with `x5t#S256` from RFC 8705 and
  `jkt` for DPoP. The previous estate wrote `cnf = { sub: runner:agentd }`: `sub` is
  not a registered member, it is not a key, and nothing is cryptographically
  confirmed — the receiver compares a string. That borrows the name and drops the
  mechanism, and a reader who knows the RFC will assume a proof that is not there.

  The underlying property is nevertheless real **in this design**, and stronger than
  a string comparison: NATS proves possession of the user's nkey at connect through
  a nonce challenge, and §3 puts the account key in the subject by server rewrite.
  So possession *is* proved — by the transport rather than by the token.

  Two honest ways to settle it when slice 3 arrives: carry a genuine
  proof-of-possession key and conform to RFC 7800, or **name the claim for what it
  is** — the process the token was minted for, which `exec` already names — and state
  that the binding is transport-enforced. Taking the RFC's name for a non-conformant
  member is the one option to rule out.

- **How does a revocation reach a running cluster in tests?** Revocation is specified
  and property 8 asserts it; the resolver push path is exercised only in deployment
  unless the test estate grows a resolver that accepts updates.
