# C-level review — production grade, security, developer experience, scalability, evolution

**Date:** 2026-10-04
**Status:** findings open — the action list at the end is the input to the next roadmap pass
**Reviewed:** branch `identity-9d` at `d321f71`, after step 9d and both review fix passes
**Lenses:** CPO · CTO · CISO · Chief AI, against five questions the repository was asked to answer

The question put to this review was whether the repository is building production
grade, with security as a first-class citizen, developer experience not an
afterthought, scalability and resilience baked in from day one, and an
evolutionary architecture. The findings are graded against *that* bar, not against
what is typical.

The tree was surveyed before writing, not recalled:

| | |
|---|---|
| hand-written Go | ~5,600 lines, 9 direct dependencies, `go 1.26` |
| tests | ~5,700 lines, **172** tests, run with `-race`; every security property was proved to fail before being trusted |
| vacuous tests found and replaced in the last two days | **4** — each had passed for a reason other than the one it claimed |
| `TODO` / `FIXME` / `HACK` | **0** |
| invariants | **98 enforced**, each naming its test; **8 recorded as unenforced**, each saying why |
| decision records | 15, each with what was rejected |
| specs | 2, both amended in the commits that found their errors |
| CI | `mise run ci` locally and on GitHub, identical; 9 tasks including generated-code drift in both directions and `go mod tidy -diff` |

The one-sentence verdict: **the engineering culture is production grade; the system
is not yet, and the gap is operability and authorization, not quality.**

---

## 1. Production grade — **B−** (engineering discipline A, operability D)

### What holds

- The test discipline is the strongest thing in the tree. Security properties are
  proved to fail by breaking their mechanism; four tests that passed for the wrong
  reason were caught and replaced (a TLS test that passed with TLS optional, a
  reply-permission test watching the wrong connection, an isolation test that
  passed while nothing could reach the tool, a "publishes nothing" test asserting
  an unrestricted permission).
- Generated code is committed and drift-checked in both directions — `git diff`
  for change, `git ls-files --others` for the new file the diff cannot see.
- Errors carry a kind and leave the cause at home; the caller gets an id to quote
  and the operator gets the chain. `serve.Wire` is total: no path can reply with
  nothing.
- Shutdown drains queued calls, proved with two calls because one passed with the
  drain deleted.
- A tool's declared budget binds in three places from one declaration: the
  generated client's deadline, the handler's deadline, and the compose check.

### What does not

- **There is no observability.** No metrics, no trace export, no health or
  readiness endpoint. `traceparent` is propagated through the envelope and
  emitted nowhere. "Ready" is a log line, and the guide says a readiness probe
  hangs off it — a probe cannot hang off a log line. Nobody can answer *is it up,
  how slow is it, which caller is generating load* without reading stdout. The
  per-account `$SYS` statistics that operator mode provides for free are surfaced
  by nothing.
- **No `LICENSE` in a public repository.** Nobody can legally use it. Blocking,
  and a five-minute fix.
- **No inbound payload guard.** An oversized *reply* becomes an error (tested); an
  oversized *request* hits the server's `max_payload` and the caller gets a
  transport error with no kind. The standing rule is that large artefacts do not
  cross the bus; the inbound side should refuse with `INVALID` and a size.
- **No retry on transient failure.** `UNAVAILABLE` is distinguished from `INTERNAL`
  precisely so a caller can retry, and nothing does — not even one bounded retry
  for "no responders during a deploy". Recorded as waiting on the run store; the
  synchronous path still needs one.
- **No release or compatibility story.** No tags, no semver on the contract, no
  `buf breaking` in CI (§5). The proto packages say `v1`; nothing holds them to it.

---

## 2. Security first-class — **A− on what exists; the largest piece is unbuilt by design**

### What holds

- Every test runs against **operator mode over TLS 1.3 with the real resolver**,
  built by the same generator a deployment runs. The configuration that is tested
  is the configuration that is deployed.
- Permissions are **derived from the catalogue**. A tool service subscribes to
  exactly what it declares; its publish is **denied outright**; NATS allow-responses
  is its only way to answer. Proved both ways — with it the chain answers, without
  it the chain times out — after a first cut that gave the tool no publish
  permission at all and was therefore unrestricted, which a probe caught.
- The caller's identity is **placed in the subject by the server**
  (`AccountTokenPosition`). A caller publishes what it published before and cannot
  write its own key, let alone another's.
- A service **refuses to start** when its credential does not cover a mount —
  allow or deny — naming the subject. `rund` is gated by the same code as a tool.
- A revocation pushed over `$SYS` **closes a live connection** in under 50 ms,
  refuses it on reconnect, and touches nobody else in the same account.
- The issuance manifest is signed and the generator refuses to run without it.
  Keys are an input it never produces.
- A model's output reaches only `InvokeRequest.input`. It cannot set an id, a
  budget or an idempotency key, and that is structural, not a rule to remember.
- The spec carries a threat model (§1.1) with two rows that say *not stopped here*.
  The unenforced table exists and is honest.

### What does not — in the order a CISO would want them

1. **Nothing authorizes anything.** Any caller may invoke any tool through `rund`.
   Identity is proved and then not used. Stated in three places, and the right
   sequencing — but for a bank the thing that *gates* is the thing that does not
   exist. The authority model is absent as a block; it should follow the run
   store directly, ahead of person identity.
2. **The root is not offline.** The generator signs accounts with the operator key
   itself and accounts carry no signing keys. Recorded as not yet producible; it
   blocks the first checkbox of deployment and is its own task.
3. **The catalogue is integrity-checked, not authenticated.** A digest proves the
   bytes are the bytes you were told; it does not prove who produced them. The
   catalogue is now the permission source — every credential derives from it — so
   a swapped catalogue reissues the estate. Signing it waited on "a threat model";
   the threat model exists now, and this row should move.
4. **No supply-chain checks.** `go.sum` pins; there is no `govulncheck` in CI, no
   SBOM, no dependency review. Nine direct dependencies make this cheap.
5. **No rate limiting and no NATS account limits.** The generator could set
   `max_connections`, `max_payload` and `max_subscriptions` per account in one
   line each; it sets none. A valid caller credential can saturate `rund`.
6. **No call audit.** The manifest audits issuance; nothing audits calls until the
   run store lands. Correct sequencing, and the first thing a regulator asks for.

---

## 3. Developer experience — **B** (superb for a Go tool author, thin everywhere else)

### What holds

- A tool author writes **one function**. The generated handler interface has no
  `Unimplemented` embed, so adding a tool to the `.proto` and forgetting it fails
  the build.
- The generated client carries the declared budget as its deadline. The caller
  names a tool and nothing else.
- `garmctl compose` names the *repositories* in a collision, not the descriptors.
  Error messages say what to do next — the flag to pass, the file to open.
- The guide is checked by CI (`guide-files`), and its quick start boots a real
  server in a test (`TestDevEmitsAServerConfigThatBootsAndAcceptsItsOwnCredentials`).
- The documentation — specs that correct themselves, decisions with rejected
  alternatives, an invariants table that names the test, three drawings — is
  better than most organisations' internal wikis.

### What does not — the CPO's list

- **Go only.** One generator, one SDK. Deferred on good evidence (the previous
  estate's Python SDK was a README), but every non-Go caller today is `garmctl
  call` from a shell. The language-neutral constants an SDK would otherwise copy —
  subject derivation, header names, `budget + overhead` — are still Go constants.
  Declaring them is the prerequisite that should land before a second language is
  even requested.
- **The local stack is six commands in three terminals.** `--dev` made it
  *possible*; nothing made it *one command*. A `garmctl dev up` running server,
  `rund` and the example tool in one process is the largest single DX improvement
  available, and the previous estate proved the shape.
- **"No responders" is a trap** for a developer who misaddresses a tool —
  indistinguishable from "the tool is down". The diagnostic was suggested and not
  built.
- **Onboarding a caller is an operations ticket**, and auth callout will not
  change that. Stated honestly in the spec; a product constraint until issuance
  has an API.
- **Tool authors now meet credentials.** The gate's refusal names the tool, which
  is the right first contact; "where do I get the new credential" is a trace in
  the spec, not a command.

---

## 4. Scalability and resilience — **C+** (the shape is right; nothing is measured, limited, or broken on purpose)

### What holds

- NATS micro queue groups give horizontal scaling of `rund` and of every tool
  service for free. `rund` is stateless today.
- The catalogue is held behind an atomic pointer for hot reload.
- Drain-on-shutdown is proven; revocation and permission changes need no restart
  of anything else; delta issuance means adding a tool restarts one service, not
  the bus.
- Per-caller accounts make per-account limits and metrics *possible*.

### What does not

- **Nothing is measured.** No benchmark, no per-call overhead, no p99. The
  durability decision was partly on cost-per-call grounds and the cost per call
  of what exists is unknown.
- **Nothing is limited.** No account limits, no deliberate `max_payload`, no
  connection limits, no slow-consumer policy.
- **Nothing is broken on purpose.** The drain test is the only resilience test:
  no server restart mid-call, no resolver unavailable, no `rund` replica dying
  with a queued call, no clock skew on a revocation. The NATS-only spike proved
  those primitives are testable in process; the production path has none.
- **Resilience under the run store is undesigned.** DBOS sits behind a port; what
  `rund` does when Postgres is unreachable — refuse async, keep serving sync — is
  not written, and "sync never touches the store" needs a test the moment the
  store exists.
- **One cluster.** Leaf nodes and superclusters are recorded as not addressed; a
  bank will have them.

---

## 5. Evolutionary architecture — **A−** (the strongest axis, with one missing guard)

### What holds

- "A field arrives when the thing that enforces it arrives" is applied without
  exception, and the roadmap's third column — *what has to exist first* — turns a
  wish list into a dependency graph.
- `oneof delivery` and the one-arm `oneof outcome` are shaped so `Pending` joins
  additively. The plan seam in `run` is where deciders attach. DBOS is behind a
  narrow port, labelled a hypothesis until a second implementation exists.
- Identity landed in three slices, each complete on its own. Specs were amended
  in the commits that found their errors; the decision record lists what the
  build taught the spec.
- Transport swappability was *narrowed* by identity and the narrowing was written
  down, rather than a stale claim left standing.

### What does not

- **`buf breaking` is not in CI.** For a proto-first system this is the single
  most important evolutionary guard — the thing that makes `v1` mean something —
  and it is one task away. Every other evolutionary property here is enforced;
  this one is honour-system.
- **Wire-shape versioning waits on a second repository.** The descriptor hash
  should land before that repository exists, or the first drift is found in
  production.
- **Retired names have no memory.** `compose` refuses a collision at a point in
  time; nothing refuses a name reused after retirement. Credentials are revoked,
  which closes the security hole; the catalogue has no tombstones, so the
  operational confusion remains.

---

## Chief AI — the honest version

What exists is the **governance substrate**, not an AI platform. There is no
decider, no model call, no prompt, no evaluation, no cost accounting. An agent
today is an allowlist and the word `async`. That is deliberate sequencing — the
previous estate's four worst bugs lived in the authority-and-agent layer, and
building it on sand failed once — and it is defensible. It also means the
platform's value proposition is the least-built thing in the tree, which should
be named rather than assumed away.

The foundations that matter for AI safety are here and structural: model output
cannot touch the envelope; the allowlist is enforced at compose rather than
asserted; an agent can never be `sync`, so a human can always be interposed;
budgets bind. Those are the right primitives.

What an AI platform needs that has no shape here yet:

- **Tools carry no natural-language description** in the contract. A ReAct decider
  has a name and a proto schema and nothing to choose by. That is a contract-level
  decision to take before the first decider, not a detail to add later.
- **No data classification.** PII crosses the bus in tool payloads with no marking.
- **No evaluation harness, no red-team cases, no cost model.** "An accountant" is a
  roadmap row.
- **Determinism discipline for decider bodies** is a sentence in a decision record
  and not yet a test.

---

## Action list

### Before calling it production grade — days, not weeks

1. `LICENSE`.
2. `buf breaking` and `govulncheck` in `mise run ci`, each proved to fail first.
3. Readiness and liveness endpoints on `rund` and `natsserve`; metrics export — at
   minimum per-tool call counts and latency, and the `$SYS` per-account figures
   that already exist.
4. An inbound payload guard that refuses with `INVALID` and a size; NATS account
   limits in the generator.
5. One bounded retry on `UNAVAILABLE`; a benchmark that records per-call overhead.

### Next slices, in order

The operator signing-key shape (unblocks deployment) → the run store (unblocks
async, audit, human-in-the-loop) → **the authority model** (the thing that gates)
→ person identity. Authorization ahead of person identity: a bank's first question
is "who may call what", and the answer today is "everyone, everything".

### Decide now, build later

Tool descriptions in the contract · data classification on payloads · `garmctl
dev up` · the language-neutral wire constants that precede any second SDK ·
catalogue signing, which now has its threat model · tombstones for retired names.

---

## How to read the grades

A grade is against the bar the repository set for itself, not against the
industry. **B−** for production grade with an **A** for discipline means the code
would survive production and the operators would not: nothing tells them it is
up. **A−** for security means the slice that exists is done properly and the slice
that gates is not started. The grades are expected to move; the point of writing
them down is that the next review can say by how much.
