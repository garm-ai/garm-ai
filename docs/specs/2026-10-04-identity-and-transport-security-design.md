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

**And one thing it establishes without using:** `rund` learns which account called,
and makes **no decision with it**. Any caller account may invoke any tool through
`rund`, exactly as today. That is a property of this slice, stated so nobody reads
"caller identity, proved" as "caller identity, gated". The authority model is what
gates, and it is absent as a block for the reasons the roadmap gives.

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

### 1.1 The threat model

Controls without named adversaries are not reviewable. These are the adversaries
this slice is built against, what each can reach, and which control stops them.

| adversary | holds | can reach | stopped by | slice |
|---|---|---|---|---|
| a **caller** gone bad — a front door or batch job | one CALLER-n credential | `rund`, as itself | account isolation: `garm.tool.>` is not in its namespace; token position means it cannot be another caller | **1** |
| a **tool service** gone bad | one TOOLS user credential | its own declared subjects, and replies | per-user subscribe permission; `_R_.>` only; the TOOLS account wall around all of it (§12 argues the width of that wall) | **1** |
| a **leaked credential**, undetected | a copy of any of the above | whatever its original holder could | revocation on detection; expiry as the floor for the leak nobody detects (§5) | **1** |
| a **zombie** — a retired service still running | a credential for a retired tool | a share of calls to a reused name | the generator emitting a revocation on removal (§4.2) | **1** |
| a **compromised `rund`** | the GARM credential | every tool subject, including retired ones | **not stopped here.** Stated in §12; this is the credential worth protecting most | — |
| an **insider with signing keys** | account or operator keys | can mint any credential | custody (§5.1): root offline, signing keys in a controlled issuance path, every issuance in the manifest | 1 — custody is a precondition of deployment |
| a **network attacker** | the wire | every payload in cleartext | TLS, required and tested (§6) | **1** |
| an **impersonated person** | a stolen bearer token | whatever that person may | **not addressed here** — slice 2 establishes a person at connect, slice 3 binds a token to its presenter | 2, 3 |
| a **flooding caller** | a valid credential | `rund`'s capacity | **not addressed here.** §12 | — |

Two rows say *not stopped here*. They are in the table so that the absence is a
decision rather than an oversight.

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

**The alternative, argued rather than skipped: one account per tenant**, with
callers as users inside it. It gives `rund` the identity authorization will most
likely key on, at a fraction of the account count, and it is the product-shaped
unit — a bank is a tenant; its front door and its batch jobs are not. Against it:
inside one account, two callers are indistinguishable to `rund`, so "which of the
tenant's systems made this call" is lost at the transport and has to come back as
a claim later.

This spec keeps **per-caller** because the mechanism is identical either way —
`AccountTokenPosition` yields the account in both — so moving to per-tenant later is
a **topology change, not a mechanism change**, and the generator is the only thing
that would need to know. The reverse move would lose information already recorded.
Start fine; coarsen if the ops cost says so.

**What this costs the product**, said plainly: a caller is an account, and auth
callout (slice 2) does not change that — it places a *user* into an *existing*
account and creates none. So **every integration partner is a provisioning action
until account creation is automated.** The automated path is the issuance
environment of §5.1, driven by an API rather than a hand; it is not in this slice,
and this sentence is here so nobody discovers that at the first partner.

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
- **"No responders" is a security win and a developer-experience trap.** A
  developer who addresses a tool directly gets the same answer as for a tool that is
  down. Absent-rather-than-refused is correct on the wire; a `garmctl` diagnostic
  that says *that subject is not in your account's namespace — call through `rund`*
  costs little and belongs with the credentials tooling.

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

**The cost, which is the mirror of §4.5:** declaring a new tool makes its service's
credential stale. Add a tool → reissue that service's credential → restart it.
That is a deploy-time coupling that does not exist today, and the catalogue's hot
reload does not help a tool service the way it helps `rund`. A tool service's
permission lags the catalogue by exactly one credential issuance, and §4.3 is what
makes that lag loud instead of silent.

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

### 4.4 From a tool author's seat

Everything above is written from the platform's side. This is the same thing from
the seat of the person it happens to.

1. **Declare.** A method in a `.proto` gains the `tool` option. `buf build`,
   `compose`: the catalogue now carries the name. Nothing else has changed.
2. **Deploy, too early.** The author deploys the service with its *existing*
   credential. It **refuses to start** and names the tool — §4.3. This is the
   moment the author learns that a permission is a thing, and the message is the
   whole explanation.
3. **Issue.** Whoever runs the issuance path (§5.1) regenerates against the new
   catalogue. The service's credential now covers the new subject; the manifest
   records the issuance.
4. **Deploy.** The service starts, mounts, answers. `rund`, which has already hot
   reloaded the catalogue, routes to it.
5. **Retire, later.** The author removes the method. `compose` drops the name,
   `rund` stops routing, and the generator — seeing the manifest — emits a
   reissue for that service and a revocation for the old credential. The author
   deploys the narrower service before the revocation lands (§4.2, ordering).

Step 2 is deliberate: an author will deploy before issuing, because that is what
they did yesterday, and the gate is what turns that into a one-line lesson rather
than a silent hour.

### 4.5 `rund`'s own permissions, and why they are a wildcard

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

**Expiry is the floor, not the mechanism.** The argument against expiry above is an
argument against *short* expiry — reconnect storms come from TTLs measured in
minutes. It is not an argument against expiry at all, and "no `exp`" means a leaked
credential nobody noticed is **valid forever**. Revocation needs detection; expiry
is the backstop for the leak that was not detected. So: every service credential
carries a **long expiry — one year by default, a deployment input** — and rotation
is scheduled well inside it. Slice 2's per-connection JWTs are short-lived by
construction, because a connection re-authenticates on reconnect; that is a
different object and the two numbers should not be confused.

**Every credential carries the catalogue digest it was issued from**, in the user
JWT's tags, and the generation it belongs to. Without that, "revoke everything
before generation N" is a timestamp guess, and property 8c is not implementable.

### 5.1 Keys, and where they live

Three keys, and custody for each is a **precondition of deployment** (§10 step 5),
not an open question.

**The operator root key** signs nothing day to day. It lives offline. It signs
**operator signing keys**, and those are what sign accounts — so a compromised
signing key is rotated by the root without touching anything that trusts the root.
NATS supports this directly, and it is the design rather than an option.

**Account signing keys** sign every user credential. They are what the issuance
path needs, and so they are what an attacker wants. They live in **the issuance
environment** — a controlled place the generator runs, with access that is logged
and keys that never leave it. Not a laptop. The generator takes them as an input
there; it does not take them anywhere else.

**SYS credentials** push resolver updates and read `$SYS`. Operations only (§6),
issued from the same environment, held by nothing in the data path.

**The issuance environment is the security boundary** of this whole slice, and the
generator being a CLI is a statement about its interface, not about where it runs.
A CI job with an audited secret store is the minimum; an HSM-backed signer is the
shape a bank will ask for, and the generator's "keys are an input" is what makes
either possible without changing it.

---

## 6. The system account and the resolver

**SYS is operations-only.** Not `rund`, not a tool, not a caller. In slice 2 it
also carries connection requests, which is a second reason the separation is
established now while it is free.

**The resolver is the NATS-based one in production** — accounts stored and
replicated by the servers themselves, updated over `$SYS`, with no separate account
server to run or keep available. **Tests run the same full resolver in process**
(`DirAccResolver` on a temporary directory), so that an account update pushed over
`$SYS.REQ.ACCOUNT.<key>.CLAIMS.UPDATE` with the operations credential is the path
the tests exercise — not a memory stub that cannot take one. That is what makes
property 8c a test rather than a hope.

**TLS is required.** Account isolation is authorization; it encrypts nothing, and
without TLS every payload crosses the bus in cleartext — the credential seed never
travels, but a payment request does. The server is configured to refuse non-TLS
connections, the test estate runs TLS so the configuration that is tested is the
configuration that is deployed (§7), and this is property 11. It is not a deployment
concern; it is the difference between isolation and privacy.

**Observability comes with the mode.** Operator mode exposes per-account connection
and message statistics over `$SYS`, so "which caller is generating this load"
becomes answerable for the first time, with no code. That is part of why the
per-account ops cost is worth paying.

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
must.

**The previous topology has a home: the issuance manifest.** A signed document,
committed to the deployment repository beside `images.yaml`, recording every
credential issued — user public key, account, the catalogue digest it was issued
from, its generation, when, and the permission set's hash. The generator **refuses
to run without it** (an empty manifest is explicit, not absent), reads it as the
previous state, emits the delta, and writes the new manifest back. Git is the single
source of truth, a review is a pull request, and two operators running from
different previous states is a merge conflict rather than two conflicting
revocations.

The manifest is also the **audit trail** — who issued what, from which catalogue,
when — which §5.1 needs and which revocation-by-generation cannot work without.

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
| `garmctl … --dev` | emits a throwaway local topology with fresh keys, so running `rund` + a tool + a caller on a laptop stays a three-command quick start rather than an issuance ceremony |

That `natscall` is untouched, and that `natsserve`'s **subjects** are untouched, is
the single most useful consequence of §3, and it was not a given — it is what the
sixth probe was for. `natsserve` gains only the startup gate, which is new behaviour
rather than a changed wire.

**One thing narrows.** The repository's transport story has been "`natsserve` is the
only package that imports a broker, so replacing the transport regenerates nothing".
That remains true of the generated code. It is no longer true of *identity*, which
is now NATS-shaped to the core — operator mode, token position, account isolation.
Replacing the bus would mean redesigning this slice, not reconfiguring it. That is
the right trade for the chosen bus, and the decision record says so rather than
letting the older claim stand unqualified.

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
    revoked, **with a running service holding it** — the zombie case in §4.2. Proved
    by pushing the updated account over `$SYS` with the operations credential and
    watching the live connection close with reason `Revocation`; not by calling the
    server's update method directly, which proves the disconnect but not the path.
9. The generator emits, for a catalogue, exactly one subscribe permission per
   declared tool and no others.
10. No data-path credential carries system-account access.
11. The server refuses a connection without TLS; the test estate connects with it.
12. Every issued credential carries the catalogue digest and generation it was
    issued from, and the manifest the generator writes agrees with it.
13. The generator refuses to run without a manifest, and a run from a manifest
    that does not match the credentials actually deployed is detectable — the
    manifest's permission hashes are what the §4.3 gate can be checked against.

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
5. **Deployment credentials**, when everything above is green — **and not before
   three preconditions hold**, none of which is code: the operator root is offline
   and accounts are signed by a signing key (§5.1); the issuance environment exists
   and is where the generator runs (§5.1); and TLS is on (§6). Each is a checkbox a
   reviewer ticks, and a deployment without all three is not this design.

Steps 1–4 are entirely inside the repository. Only step 5 touches a running system,
and **step 5 is the one-way door**: step 2 can be reverted with a commit; once
credentials are deployed, returning to an open bus is a rollout, not a revert.

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
- **It does not authorize anything.** It establishes who called and decides nothing
  with it; any caller may invoke any tool through `rund`. §0.
- **It encrypts the wire and nothing else.** TLS is required (§6). Account isolation
  is still authorization, not confidentiality, and `xkey` arrives with slice 2
  because that is when a *secret* first crosses the bus inside a message.
- **It does not stop a compromised `rund`.** `rund` holds the only import that
  reaches tools; that is the design, and it is why `rund`'s credential is the one
  worth protecting most.
- **It does not give a deployment predicates over calls.** "Never above €1m, whoever
  asks" is not expressible here, is not expressible in a grant caveat either, and is
  an open question in the authority model rather than this spec.
- **It keeps every tool service in one account, and that is a blast-radius
  decision, not a naming one.** Inside TOOLS, a payments tool and a marketing tool
  are separated only by user permissions; the account wall is around both. A
  misissued permission — and the generator is new code — is *inside* that wall. The
  argument for accepting it now: the permission a tool holds is a subscribe on its
  own subjects and a publish on `_R_.>`, so the worst a misissue does is let one tool
  answer another's calls, which the §4.3 gate and property 9 are built to catch, and
  the wall that matters most — callers cannot reach tools at all — is an account
  boundary already. The argument for partitioning later: the first time a tool
  handles something the others must not even be able to *see*, that is a wall, not a
  permission. Per-tenant or per-sensitivity TOOLS accounts are a topology change the
  generator absorbs; this spec records that the question was asked.
- **It does not address more than one cluster.** Leaf nodes, superclusters and
  gateways change how accounts resolve and where the resolver lives; a tool in an
  on-premises leaf reached by `rund` in a cloud cluster is a real shape and is not
  designed here.
- **It does not rate-limit.** A valid caller credential can saturate `rund`. NATS
  has per-account limits that could be the first answer; nothing here sets them.
- **`_R_.>` is a broad grant, and this is why it is safe.** A tool may publish to any
  reply subject in its account. It is safe because reply subjects are random and a
  tool sees only its own; it would stop being safe the day someone "simplifies" it
  to `>`, and this sentence is here for that person.

---

## 13. Open questions

- **Where do caller accounts come from?** The generator reads the catalogue, and a
  catalogue does not know about callers. A deployment input alongside it — and now
  that the manifest (§7) is an input anyway, the list of callers belongs in the same
  committed, reviewed place. That answers the shape; the content is still a
  deployment's to write.
- **Does `rund` need a caller's *name* at all in this slice?** Nothing uses it yet.
  Carrying it is cheap; logging it before anything enforces it risks reading as a
  guarantee.
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

- **Where does the issuance environment live, and what drives it?** §5.1 names what
  it must be; the deployment decides whether that is a CI job with a secret store or
  an HSM-backed signer. The generator is the same in both. The API that would let a
  partner be onboarded without a hand (§2.1) is this environment with a front on it,
  and it is not designed here.
