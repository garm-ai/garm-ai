# The run store: a run that outlives the call

**Date:** 2026-10-05
**Status:** active — built as step **10** ([plan](../plans/2026-10-05-run-store.md)); the four amendments execution made are marked **built:** inline. §12 says what it leaves out

**Spec for:** the asynchronous path of `rund` — a tool declared `async` is invoked,
the caller gets a run id back immediately, the run is executed durably by whichever
`rund` replica picks it up, and `Fetch` answers with its state and result. DBOS,
behind a narrow port, is the durability; `rund`'s own code never touches a database.

**What this slice is:** the rund spec's §7.3.1–§7.3.3 built, as far as *invoke
and fetch*. Not `Approve`, not `Cancel`, not deciders — each is designed after the
authority model, because each is a command on a run somebody else started, and
"anyone may" is not a design.

**Decided in the rund spec, repeated here only to anchor:** DBOS behind a port
([decision](../decisions/2026-10-03-durability-is-a-framework-not-ours.md));
`run_id` = DBOS workflow id = the caller's idempotency key; DBOS's workflow store
*is* the run store and is authoritative; commands go through DBOS, reads do not; a
sync call touches no database. **Read before this spec:**
[the DBOS Go SDK note](../research/2026-10-05-dbos-go-sdk.md), v1.5.0.

**Decided in review, one question at a time (§9):** scope; every run through one
queue; sync sovereign when the store is down; a run belongs to its invoking account;
`Fetch` waits; push is next.

---

## 0. One sentence per thing that changes

A caller invokes an async tool and gets **`pending { run_id }`** back the instant the
run is durable. One `rund` replica — any — dequeues it, calls the tool as a **step**,
and records the result. `Fetch` returns the run's **state, outcome and stage**, and
can **wait** for them to change. A run is **visible only to the account that invoked
it**. When the store is unreachable, **sync calls are unaffected** and async ones say
so. The `rund` process gains one flag, `--run-store`, and one dependency, the DBOS
SDK, behind one Go interface.

---

## 1. The port

```go
// Package run; the engine's view of durability. One implementation is DBOS
// (package rundbos); one is none (sync-only, today's rund). The engine never
// imports either. Built: the workflow's step 0 is the PLAN -- the catalogue is
// read once and the action list checkpointed, so a replay after a catalogue
// change follows the plan the run was started with (property 18). Built: a
// tool-call step's checkpoint is a VALUE (bytes, or the tool's error with its
// kind), never a returned error, which DBOS flattens to text and a replay would
// read back as INTERNAL; the bounded UNAVAILABLE retry is the step's own loop,
// and a call that TIMED OUT is not retried -- the work may be in flight. The
// call's deadline is the tool's declared Async.limit (review of this slice found
// the sync-era 30s fallback deciding it); a limit on the RUN arrives with a
// decider.
type Store interface {
	// Start makes the run durable and returns once it is: the id is the caller's
	// idempotency key, and a second Start with the same key and the same
	// fingerprint returns the same run without starting another.
	Start(ctx context.Context, r Run) (Started, error)
	// Fetch answers for a run. wait > 0 blocks until the state or the stage
	// changes, or wait elapses (capped by the implementation).
	Fetch(ctx context.Context, id string, wait time.Duration) (State, error)
}

type Run struct {
	ID          string            // the idempotency key, required
	Tool        string
	Input       []byte
	Fingerprint string            // sha256(tool, input), hex
	Caller      string            // the invoking account's public key
	CallerName  string            // its label, if known
	Attributes  map[string]string // correlation, tenant, compartments: the cheap dimensions
	// The ENVELOPE the caller sent, kept with the run because execution happens
	// later, on another replica, when the request is long gone (§6.1).
	Correlation string // the caller's, or the run id if it sent none
	Message     string // the caller's message id: the causation of step 0
	Traceparent string // continued by the step that executes
}

type Started struct {
	ID       string
	Existing bool // the key was seen before and the fingerprint matched
}

type State struct {
	ID          string
	Status      Status // Pending, Running, Succeeded, Failed, Cancelled
	Stage       string // the run's own word, "" until set (§5)
	Result      []byte // when Succeeded
	Error       *invokev1.Error
	Caller      string
	CreatedAt   time.Time
	CompletedAt time.Time
}
```

Two verbs, because the first slice uses two. `Signal` (for `Approve` — a DBOS
`Send`) and `Publish` (a `SetEvent`/`WriteStream` from inside the run) are the
next two, and are not declared until the thing that uses them exists — the rule
this repository runs on. **The port is a hypothesis until a second implementation
exists** (rund spec §7.3.1); the `none` implementation is a null object, not the
second.

**What executes.** The DBOS implementation registers **one workflow**, `invoke`,
whose input is the `Run` and whose body is: *for each planned action, call the tool
as a step; return the last result.* The engine's `plan` is what it is today (one
action for a plain tool); the workflow is the engine's loop made durable, not a
second engine. Each tool call is `RunAsStep` named `<run_id>:<i>` — the step's
idempotency key is the one the engine already derives — retried only on
`UNAVAILABLE`, a bounded number of times, by DBOS's retry predicate. Any other
kind fails the run with that kind.

---

## 2. Every run goes through one queue

`Start` enqueues on a DBOS queue named **`runs`** (`WithWorkflowID(key)`), and
returns when the enqueue is durable. Any `rund` replica listening on `runs`
dequeues an **`ENQUEUED`** run and executes it: that is what makes replicas
interchangeable for *new* work, gives concurrency and rate limits per queue, and
makes `WithDeduplicationID` native. The cost is one dequeue hop, milliseconds.

**What the queue does not do — read from the SDK, not assumed.** Once dequeued a
run is `PENDING` and owned by the executor that claimed it. If that replica dies
mid-run, the queue runner does **not** take the run over: it claims `ENQUEUED`
rows only. DBOS re-enqueues a dead executor's `PENDING` runs in exactly two
places — at `Launch`, for **the launching process's own executor id**, and on a
request from its paid Conductor. (`dbos/recovery.go`, `queue.go`'s claim,
`sysdb.ReenqueueForRecovery`, v1.5.0.) The first draft of this section said "the
next dequeue picks it up"; it does not.

So recovery of in-flight work rests on one thing: **a replica's executor id is
stable across restarts.** `rund --run-store-executor <id>` names it; it defaults
to the hostname, which is stable on a laptop and in a StatefulSet, and is *not*
stable for a Deployment's pods. The guide says which to use. Everything in flight
on `rund-2` when it dies is finished by `rund-2` when it returns, from its last
completed step; everything still `ENQUEUED` is taken by whoever is up. That is the
honest split: **distribution is the queue's, recovery is the identity's.**

Cross-executor recovery without the Conductor — a lease, a heartbeat, a reaper
that re-enqueues what a provably dead replica held — is a later slice, listed on
the roadmap beside what it waits on (a liveness signal DBOS does not keep).
Building it now would be guessing whether an executor is dead, and a guess here
is a run executed twice.

**The resilience property this buys:** *start a run, stop the replica executing it
after the tool has been called and before the step is recorded, relaunch a replica
with the same executor id, and it finishes the run; the tool was requested twice
and executed once (the step key), and `Fetch` sees one result.* The throwaway
spike proved the primitives; this is the same property on the real path, in the
estate — two DBOS contexts on one SQLite file, the second launched with the
first's executor id after the first is shut down mid-step.

---

## 3. The wire

Additive only; `buf breaking` stays green.

```proto
message InvokeResponse {
  string run_id = 1;
  oneof outcome {
    bytes result = 2;     // sync: the answer
    Pending pending = 3;  // async: the run is durable; Fetch for the rest
  }
}
message Pending {}        // room for retry_after and a first stage, later

message FetchRequest {
  string run_id = 1;
  // wait > 0: answer when the state or the stage changes, or after wait,
  // whichever first. Capped by rund (§4). 0: now.
  google.protobuf.Duration wait = 2;
}
message FetchResponse {
  RunState state = 1;
  oneof outcome { bytes result = 2; garm.invoke.v1.Error error = 3; }
  string stage = 4;
  google.protobuf.Timestamp created_at = 5;
  google.protobuf.Timestamp completed_at = 6;
}
enum RunState {
  RUN_STATE_UNSPECIFIED = 0;
  RUN_STATE_NOT_RETAINED = 1; // a sync tool's id, as today
  RUN_STATE_RUNNING = 2;      // pending or executing; the distinction is DBOS's, not the caller's
  RUN_STATE_SUCCEEDED = 3;
  RUN_STATE_FAILED = 4;
  RUN_STATE_CANCELLED = 5;    // an operator's command, or the replica's run ceiling (built: --run-store-run-limit); Cancel the verb is a later slice
}
```

The generated client gains `Fetch(ctx, runID, wait)` and the `pending` outcome
surfaces as a typed `run.Ref` with `Await(ctx)` that loops on `Fetch(wait)` — the
rund spec's `ref.Await`. `garmctl call` prints `pending <run id>` and gains
`garmctl fetch <run id> [--wait 30s]`.

---

## 4. `Fetch`: ownership, waiting, and what is answered

**Ownership.** The invoking account is recorded on the run — `WithAuthenticatedUser`
*and* the `garm.caller` attribute, so the native column and the filterable one
agree. `Fetch` from any other account answers **`NOT_FOUND`**, indistinguishable from
an id that never existed. That comparison is the first body of one function,
`rund.visible(principal, run) bool`, which the authority model will replace with
grants, compartments and teams; its callers do not change. The cheap dimensions a
task list will filter on — `tool`, `caller`, `correlation`, and the slots `tenant`
and `compartments`, empty for now — are attributes from day one, because DBOS's
attribute filter is containment (AND, one compartment at a time) and the rund spec's
§7.3.2 task-list shape depends on them being there.

**Waiting.** `wait` is implemented on DBOS's blocking read for completion
(`GetResult` with a handle timeout). **Built:** a stage change has no blocking
primitive in the SDK (`GetEvent` returns at once when the key exists), so it is
a 200 ms re-read inside `rund` (`rundbos.StagePoll`); the caller's contract is
unchanged — one request, held, never a poller on the bus.
`rund` caps `wait` at **`MaxFetchWait = 30s`**; a longer request is clamped, not
refused, and the response says what it waited for. A caller's NATS request deadline
must cover `wait`; the generated client derives it (`wait + call.Overhead`). A
thousand front doors waiting are a thousand blocked goroutines in `rund`, not a
thousand pollers on the bus.

**What is answered.** `state` from DBOS's status (`PENDING`/`ENQUEUED` → `RUNNING`;
`CANCELLED` → `CANCELLED`); `stage` from the event (§5); the two timestamps and
the tool from the workflow row. **Built:** the tool's error is the workflow's
*returned value*, not a Go error — DBOS serialises a returned error to its text,
and the kind would have had to be smuggled through it — so DBOS `SUCCESS` means
"the run reached an answer" (the result, or the tool's refusal with its kind,
exactly as a sync failure would have carried it → `FAILED`) and DBOS `ERROR`
means "the run could not be executed" (→ `FAILED`, `INTERNAL`). **Built:** with a
store, an id the store has never seen is `NOT_FOUND`, the same answer as a
foreign run; `NOT_RETAINED` stays the answer only when `rund` has no store, since
the engine cannot tell a sync id from an unknown one once a store exists.

---

## 5. `stage`: the run's own word

One well-known DBOS event key, **`stage`**, set only from inside the workflow, with
values from an enum this spec owns:

| stage | set when |
|---|---|
| `queued` | **built:** reported by `Fetch` from DBOS's `ENQUEUED` status — no workflow exists yet to set an event |
| `calling:<step>` | just before a tool call step |
| `done` | the workflow is returning |

`Approve` adds `awaiting_approval` with a reference to the question; deciders add
theirs. **A stage value is a word and a reference, never a payload** — the rule
spans and logs already keep. Three things it is not: it is not the status (DBOS's,
never mirrored); it is not a tag (attributes are for finding runs); it is not a log
(streams are, later).

---

## 6. Idempotency, and the one guard DBOS does not provide

`run_id` is the caller's `Garm-Idempotency-Key`. **An async `Invoke` without one is
`INVALID`** — rund minting a key would make a retry a second run, which is the
opposite of idempotent. (A sync call keeps today's behaviour: the key is optional,
the run id is logged, nothing is stored.)

DBOS's rule is *"a completed workflow id returns the recorded result; the new input
is ignored."* That is the classic idempotency hazard: reuse a key with a different
request and get a correct-looking answer to a question you did not ask. So the run
carries **`fingerprint = sha256(tool ‖ input)`** as an attribute, written at `Start`,
and `Start` compares before DBOS is asked: a known key with a different fingerprint
is **`INVALID: this idempotency key was used for a different request`**. The SDK's
"input ignored" path is never reached. Property 4 proves it.

The standing rule is unchanged and restated: **a model never sets a key.** For a
call made on a model's behalf the decider supplies it, and a model's output reaches
only `InvokeRequest.input`.

### 6.1 The id chain across a durable run

Today the chain is one function deep: the engine takes the caller's headers, mints
a message id per step, sets each step's causation to the previous message id, and
the tool receives all of it. A durable run breaks that in two places, and this is
how each is kept.

**The request is gone when the run executes.** So the envelope is stored with the
`Run` at `Start` — `Correlation`, the caller's `Message` id, `Traceparent`, and the
key — and the workflow reads them from its durable input. Nothing about a step's
headers comes from a request.

**A step can be replayed.** A replica dying mid-step means DBOS re-executes it
under the same `run_id:i`; if the engine minted a fresh message id on the replay
the tool would see two message ids for one logical call and the trail would show
two causes. So **inside a run, message ids are deterministic**: step `i`'s message
id is `hash(run_id, i)` — it looks like every other id and leaks nothing — and its
causation is the caller's message id for `i = 0`, step `i−1`'s message id after.
A replay re-sends the *same* message, which is what "requested twice, executed
once" should look like on the wire: the tool's idempotency check collapses it and
the audit shows one cause.

What the tool receives is therefore unchanged in shape:

| header | sync, today | inside a durable run |
|---|---|---|
| `Garm-Correlation-Id` | the caller's, or the run id | the same, from the stored envelope |
| `Garm-Causation-Id` | the previous step's message id; the caller's for step 0 | the same, derived from durable state |
| `Garm-Message-Id` | minted per step | `hash(run_id, i)`: stable across replay |
| `Garm-Idempotency-Key` | `run_id:i` | `run_id:i` |
| `traceparent` | rund's span | the run's trace, continued by the executing step |

And the reason this matters beyond replay: when `Approve` lands, the approval is a
`Send` whose message id becomes the causation of the step it unblocks — the rund
spec's frame 8, *the chain records that a human caused the call* — which is only
possible because causation is set per step from durable state, not from the
request that started the run.

---

## 7. When the store is unreachable: sync is sovereign

The hot path has no database (rund spec §1.0.2), and this slice keeps it that way
under failure, not only in the happy case.

| moment | behaviour |
|---|---|
| boot, store unreachable | `rund` starts and serves sync. `Launch` failed; the `Store` is a `degraded` wrapper that answers every async `Invoke` and `Fetch` with **`UNAVAILABLE: the run store is unreachable`** (a kind a caller may retry) and retries `Launch` on a backoff (1 s doubling to 30 s). Logged at boot and on every transition. |
| running, store lost | each async operation returns `UNAVAILABLE` naming the store; sync unaffected; the background retry resumes. DBOS surfaces a lost connection per operation, not as a reconnect we can watch, so the wrapper treats a connection error from DBOS as "lost" and starts the retry. |
| store back | the next async call runs; the log says so. |
| `/readyz` | **unaffected** — `rund` is ready for what it can do, and a restart would not help. |
| the signal | a counter `garm.run.store{state=up|down}` on every transition, and the startup line's `run_store=<url, credentials redacted>` or `run_store=none`. |

**With no `--run-store` at all** `rund` is exactly today's: sync only, and an async
tool is refused per call with the message it carries today, now naming the flag.

---

## 8. Configuration, schema, and where Postgres lives

- `rund --run-store <url>`: `postgres://…` for a deployment, `sqlite:…` for a
  laptop; empty means sync-only. Credentials in the URL are redacted in the
  startup line, by the same rule as OTLP headers. **Built:** `--run-store-run-limit`
  (default 24h) is the deployment's ceiling on one run, applied as DBOS's durable
  deadline at enqueue — computed when execution starts, surviving a restart,
  `CANCELLED` past it. A tool's `Async.limit` bounds one call; this bounds the run;
  a limit an author declares for a run arrives with a decider. **Built:** `--run-store-migrate=false`
  with a schema that is absent or not current REFUSES TO START naming the flag —
  configuration, not weather; only an unreachable database degrades (§7).
- The DBOS schema is `dbos`, in a database named `garm`. `Launch` creates and
  migrates it by default — right for a laptop and the estate. A deployment that
  owns its migrations passes `--run-store-migrate=false` (DBOS's `SkipMigrations`:
  verify, never create) and applies `MigrationStatements` with its own tooling; the
  `dbos` CLI's `migrate` is one such tool. **`rund` therefore knows no migration**
  of its own: it has no table.
- **The estate runs DBOS on a SQLite file** in the test's temp dir (pure Go
  driver). **Built:** not `sqlite::memory:` — DBOS pools eight connections, and
  with the pure-Go driver each connection to `:memory:` is its own empty
  database, while a shared-cache memory database locks table-wide under the
  pool. Every property below is proved without a container, and the resilience
  property with two in-process `rund`s sharing one SQLite file.
- **Postgres joins `compose.yaml`** with this slice — `garm-postgres`, database
  `garm`, a volume — and `mise run e2e-compose` runs one async invoke through it:
  `pending`, then `fetch --wait` to the result. The quick start's native path stays
  sync-only unless `--run-store` is given.
- DBOS's logger is `rund`'s `slog`, through `observe.Handler`, so its lines join
  the trace; `DBOS__VMID` is set from the hostname when unset.

---

## 9. Decisions settled in review

| question | decision | the alternative, and why not |
|---|---|---|
| scope | async `Invoke` + `Fetch`, the port, the fingerprint, the store-down behaviour; **not** `Cancel`/`Approve`/deciders | each of those is a command on a run somebody else started, better designed once the authority model exists than built as "anyone may" |
| the shape of run state | not ours to choose: DBOS's status is authoritative, `RunState` is a projection (rund spec §7.3.2) — the question was withdrawn | a history table of our own — two state machines |
| who executes a run | every async run through one DBOS queue, `runs`, so new work is distributed; **recovery of in-flight work needs a stable executor id** (`--run-store-executor`), because DBOS re-enqueues a dead executor's `PENDING` runs only at that executor's own relaunch — corrected after reading the SDK (§2) | interchangeable replicas with automatic takeover — not what the OSS SDK does; a reaper of our own — a guess about liveness that executes a run twice |
| the store unreachable | sync sovereign, async `UNAVAILABLE` naming the store, background retry, `/readyz` unaffected (§7) | a hard dependency — takes the sync path down for a database it never touches; two processes — doubles the deployment |
| who may `Fetch` | the invoking account; a foreign `Fetch` is `NOT_FOUND`; one visibility function the authority model replaces; cheap dimensions recorded now (§4) | any caller — an id leaks through logs and tickets; scope by caller name — a grant, which is the authority model's job |
| does `Fetch` wait | yes, `wait` capped at 30 s on DBOS's blocking reads (§4); **push is the next slice** | immediate only — a thousand pollers; push now — forces the DBOS-reads-vs-NATS-events choice before its first consumer exists |
| how callers read `stage` | through `rund`'s `Fetch`; the DBOS `Client` path is for operators and dashboards | a database credential for callers — a caller holds a NATS credential, and `Fetch` is what authority will gate |

Settled without a question: the wire (§3); the fingerprint (§6); the envelope stored
with the run and deterministic message ids inside it (§6.1); one `RunAsStep` per
tool call, `UNAVAILABLE`-only retry (§1); the caller's `traceparent` stored at
`Start` and continued by the executing step; `--run-store`/`--run-store-migrate`
(§8); DBOS on SQLite in the estate (§8).

---

## 10. Properties, stated as tests

Each proved to fail first.

1. **An async invoke is `pending` and durable before the caller is answered.** The
   `InvokeResponse` carries `pending{run_id}` with `run_id` equal to the key; a
   `Fetch` immediately after sees `RUNNING` (never `NOT_FOUND`).
2. **The run completes without the caller, and `Fetch` returns the tool's result.**
   Through the estate, `Fetch(wait: 10s)` on a pending run returns `SUCCEEDED` and
   the same bytes a sync call would have.
3. **A tool's refusal becomes the run's failure, with its kind.** The example's
   empty-place `INTERNAL` arrives as `FAILED` with `INTERNAL` and the quoted id;
   `INVALID` arrives as `INVALID`.
4. **A reused key with different input is refused before DBOS.** Same key, different
   `Place`: `INVALID`, the original run untouched, no second workflow.
5. **A reused key with the same input is the same run.** Two `Invoke`s, one run id,
   `Started.Existing` true the second time, one tool call.
6. **An async invoke without an idempotency key is `INVALID`.**
7. **A run is visible only to its invoking account.** `studio` invokes; `batch`'s
   `Fetch` of the id is `NOT_FOUND`; `studio`'s is `RUNNING`/`SUCCEEDED`.
8. **`Fetch(wait)` returns when the run completes, not after `wait`.** A tool that
   takes 300 ms; `Fetch(wait: 10s)` returns in well under a second with the result.
9. **`wait` is capped.** `Fetch(wait: 1h)` on a run that never completes returns
   `RUNNING` after `MaxFetchWait`.
10. **`stage` is the run's word.** Before execution `queued`; during the tool call
    `calling:0`; after, `done` — observed through `Fetch`.
11. **Stop the replica mid-step; its successor finishes the run; the tool ran once.**
    Two DBOS contexts on one SQLite store; the tool handler blocks on a channel;
    the executing context is shut down; the handler is released; a second context
    launched with the **same executor id** recovers and completes the run; the
    tool's requests carried the same `run_id:0` key and message id, and `Fetch`
    sees one result. A second context with a *different* executor id does not
    take the run — asserted too, because it is the limit §2 names.
12. **Sync is sovereign when the store is down.** Store closed: a sync call answers;
    an async `Invoke` is `UNAVAILABLE` naming the store; `/readyz` is 200. Store
    reopened: the next async `Invoke` runs. The counter moved `down` then `up`.
13. **No `--run-store`, no change.** `rund` without the flag behaves exactly as
    today: the existing suite passes, and an async tool is refused per call naming
    the flag.
14. **The run's trace is one trace.** The `garm.tool` span of the executing step
    has the caller's trace id, with `garm.run_id` on it.
15. **The run store holds no credential in the clear.** The startup line's
    `run_store` is the URL with the password redacted; a test asserts the password
    is absent.
16. **The port is the only DBOS importer.** `mise run no-sdk`'s sibling: `run`,
    `rundsvc`, `natscall` import nothing from `dbos-inc`; only `rundbos` does.
17. **The id chain survives durability and replay.** The tool receives the
    caller's correlation id and, as step 0's causation, the caller's message id;
    in property 11's replay the two requests the tool saw carry the **same**
    message id and the same `run_id:0` key.
18. **A replay follows the plan recorded at start.** The successor's catalogue
    has no tools at all; the recovered run still finishes with its answer, because
    the plan was step 0's checkpoint (`rundbos.TestAReplayFollowsThePlanRecordedAtStart`).

---

## 11. Migration order

1. The port, the `none` implementation, and the wire: `Pending`, `FetchRequest.wait`,
   `FetchResponse` fields, `RunState.CANCELLED`; `rund` without `--run-store`
   unchanged. Properties 6, 13, 16.
2. `rundbos` on SQLite in the estate: `Start`, the `invoke` workflow with one step
   per tool call, the envelope and deterministic message ids, `Fetch` without
   `wait`. Properties 1, 2, 3, 14, 17.
3. The fingerprint and ownership. Properties 4, 5, 7.
4. `wait` and `stage`. Properties 8, 9, 10.
5. The queue and two replicas. Property 11.
6. The degraded store. Properties 12, 15.
7. Postgres: `compose.yaml`, `--run-store` on the quick start's compose path,
   `e2e-compose` runs one async invoke; the generated client's `Ref.Await`,
   `garmctl fetch`; docs.

Steps 1–6 are inside the repository and need no container.

---

## 12. What this does not do

- **No `Cancel`, `Approve`, `Suspend`, `Resume`, deciders, cards, questions.** Each
  is a command on a run; they follow the authority model.
- **No push.** A subscriber learns of a run's change by `Fetch(wait)`. Push is the
  next slice and forces the choice this one deliberately defers: DBOS reads from a
  `Client` (no bus) or NATS events on `garm.run.v1.<ACCOUNT>.events` (the rund
  spec's drawing). Both stay possible.
- **No task list.** `ListWorkflows` is not exposed to callers; the dimensions it
  will filter on are recorded (§4).
- **No retention policy.** DBOS keeps runs until deleted. A deployment decides with
  `DeleteWorkflows` or its own job; a sentence here, a slice later.
- **No table of ours.** Everything is DBOS's; the step where `rund` would acquire a
  migration (rund spec §7.3.2) has not been taken.
- **It does not change data classification, but it changes what needs it.** The run
  store holds inputs and outputs at rest — the first component in the estate that
  does. Encryption at rest is the deployment's; the classification work the review
  listed now has a concrete table to classify.
- **No DBOS Conductor.** Optional, not configured, not documented.
