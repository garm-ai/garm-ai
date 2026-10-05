# What the DBOS Go SDK gives, and what we take from it

**Date:** 2026-10-05
**Status:** research — read against `dbos-transact-golang` **v1.5.0** (the rund spec was
checked against v1.4.0); informs the run-store spec, decides nothing on its own

Three questions, asked before the run store is designed: what does the SDK
provide; where does it expect us to go to the database ourselves; and what do
"set" and "get" on a workflow's state actually mean. Everything below was read
from the module's source and its doc comments, not from memory.

---

## 1. The surface, grouped by what rund would use it for

| rund needs | the SDK gives | notes |
|---|---|---|
| a durable run | `RegisterWorkflow` before `Launch`; `RunWorkflow(ctx, fn, input, WithWorkflowID(id))` returns a `WorkflowHandle` | "Workflow IDs are idempotency keys": a completed id returns the recorded result and **the new input is ignored** — the hazard the rund spec names, and still nothing in the SDK fingerprints the input |
| a tool call inside a run | `RunAsStep(ctx, fn, WithStepName, WithStepMaxRetries, WithStepBackoffFactor/BaseInterval/MaxInterval, WithStepRetryPredicate)` | a step is checkpointed by sequential `function_id`; on recovery the workflow replays to the first step without a checkpoint. A step's own timeout records its error durably; the *workflow's* cancellation does not checkpoint the step and must be returned promptly |
| what happened to a run | `RetrieveWorkflow(id)` → handle; `handle.GetStatus()` → `WorkflowStatus` (status, name, input/output, error, attempts, executor, created/started/updated/completed, deadline, parent, forked-from, attributes, authenticated user/roles, queue, priority, deduplication id); `handle.GetResult(WithHandleTimeout)` waits | `Fetch` is `RetrieveWorkflow` + `GetStatus`, as the rund spec said |
| the steps of a run | `GetWorkflowSteps(id)` → `[]StepInfo{StepID, StepName, Output, Error, ChildWorkflowID, StartedAt, CompletedAt}` | the per-step audit, from DBOS, with no table of ours |
| listings | `ListWorkflows` with `WithFilter{Status, Name, WorkflowIDs, WorkflowIDPrefix, ParentWorkflowID, HasParent, User, Attributes, CreatedAfter/Before, CompletedAfter/Before, DequeuedAfter/Before, QueueName, ExecutorIDs, AppVersion, ApplicationName, Limit, Offset, SortDesc, LoadInput, LoadOutput}`; `GetWorkflowAggregates`, `GetStepAggregates` | attribute filtering is JSONB containment — AND, never OR — exactly as the rund spec found |
| commands on a run | `CancelWorkflow(id, WithCancelChildren)`, `ResumeWorkflow`, `ForkWorkflow{OriginalWorkflowID, StartStep}`, `RewindWorkflow`, `SetWorkflowDelay`, `DeleteWorkflows` | cancel/resume are the SDK's; "approve" is a message (§3) |
| tags | `WithWorkflowAttributes(map)` at start; `SetWorkflowAttributes(id, map)` later (replaces the whole map) | where tool, caller, correlation and tenant go |
| who | `WithAuthenticatedUser`, `WithAssumedRole`, `WithAuthenticatedRoles` | native columns; only user is filterable, roles must be duplicated into attributes (rund spec §7.3.2) — still true in v1.5.0 |
| rund replicas | queues: `RegisterQueue(WithWorkerConcurrency, WithGlobalConcurrency, WithRateLimiter, WithPriorityEnabled, partition keys)`, `Enqueue`, `WithDeduplicationID` / `WithDeduplicationPolicy` | an `ExecutorID` per process (`DBOS__VMID`), `WithMaxRecoveryAttempts` and a dead-letter state when exceeded |
| time | `Sleep(ctx, d)` durable; `WithTimeout(ctx, d)` durable workflow deadline; `WithDelay`/`WithDelayUntil`; schedules (`CreateSchedule`, cron) | timers survive restarts |
| our own tables, if ever | `NewDataSource(ctx, pool)` + `RunAsTransaction(ctx, ds, fn)` | one transaction writes our rows and DBOS's completion record — the record lives in **a completion table in our schema**, created by `NewDataSource`; so our bookkeeping is exactly-once relative to the run |
| a process that hosts no workflows | `NewClient(ctx, ClientConfig{DatabaseURL …})` → `Client`: enqueue, retrieve, list, cancel, resume, fork, send, get-event, read-stream, set-attributes, steps, aggregates, queues, schedules | a `Client` **never creates or migrates** the system database (v1 change); it verifies the schema and refuses if absent |
| local development and tests | `DatabaseURL: "sqlite::memory:"` or a file, pure-Go driver (`modernc.org/sqlite`, no cgo) via `import _ ".../dbos/driver/sqlite"` | **the test estate needs no Postgres**; `compose.yaml` gets Postgres for the real thing |
| the schema | `Launch` creates and migrates by default; `Config.SkipMigrations` verifies instead; `MigrationStatements(schema, from)` returns the SQL (some statements `CONCURRENTLY`, so outside a transaction); the `dbos` CLI has `migrate`, `reset`, `workflow list/cancel/resume` | a deployment can own the migration step and hand rund `SkipMigrations: true` |
| observability | `Config.Logger` is `*slog.Logger`; `DBOS__VMID`/`DBOS__APPVERSION`; the optional Conductor/Console SaaS | our `observe.Handler` on its logger joins its lines to the trace |

Error sentinels that matter for us: `ErrWorkflowCancelled` (cause `context.Canceled` or `DeadlineExceeded`), `ErrTimeout` (a `Recv`/`GetEvent`/`GetResult` wait), `ErrConflictingWorkflowID`, `ErrUnexpectedWorkflow` (same id, different function or queue), `ErrMaxStepRetriesExceeded`, `ErrDeadLetterQueue`, `ErrNonExistentWorkflow`, `ErrWorkflowPanic`.

---

## 2. Direct to the database: what DBOS says, and what we do

**What the SDK offers instead of SQL.** Every read rund needs has a function:
`ListWorkflows` with sixteen filters, `GetWorkflowSteps`, the two aggregates,
`RetrieveWorkflow`. They run as plain queries — not workflows — and are callable
from a `Client` in a process that hosts no workflows. That is the sanctioned way
for *another* process (a dashboard, `garmctl`, an ops job) to read run state:
construct a `Client` on the system database and call the same functions rund
does. It is "direct to the database" in deployment terms (no call to rund) and
through the SDK in code terms.

**What DBOS says about SQL over its tables.** Its docs describe the twelve
system tables (`workflow_status`, `workflow_input`, `workflow_output`,
`operation_outputs`, `workflow_events`, `notifications`, `streams`, `queues`,
`workflow_schedules`, `application_versions`, …) column by column — and say
**nothing** either way about applications querying them. The only stability
promise is for the *functions* ("periodically updated, typically to add
parameters, all backwards-compatible"); none is made for the tables. In the Go
module the row types live under `dbos/internal/models` and the schema under
`dbos/internal` — the "breaks on a patch bump with no compile error" the rund
spec rejected still holds.

**Where we stand, unchanged from the rund spec:**

- **No SQL of ours over DBOS's tables.** Reads go through the SDK's query
  functions, from rund or from a `Client`.
- **Our own tables, when we need OR-queries or real pagination, are written
  through `RunAsTransaction`** so they are exactly-once with the run — and that
  is the step where rund acquires a migration of its own, said on the step.
- **Migrations of DBOS's schema are a deployment's, not rund's**, if the
  deployment wants it so: `MigrationStatements` + `SkipMigrations`. The
  default (`Launch` migrates) is right for a laptop and the estate.

The one thing the SDK does *not* give and the spec already said we must build:
**an input fingerprint** on the run, so a reused key with different bytes is
refused rather than answered from the recording.

---

## 3. "Set" and "get" on a workflow: five mechanisms, and which is which

| mechanism | who sets | who gets | shape | durable? |
|---|---|---|---|---|
| **status + result** | the workflow, by returning | `GetStatus`, `GetResult`, `ListWorkflows` | `PENDING → ENQUEUED → SUCCESS / ERROR / CANCELLED …`, output or error | yes — this *is* the run |
| **events** `SetEvent(ctx, key, value)` / `GetEvent(ctx, id, key, timeout)` | **only the workflow**, as a durable step; same key overwrites | anyone with a `Client`; **waits** up to `timeout` for the key to appear | a key→value the run publishes about itself — "stage", "awaiting approval", a partial result | yes — `workflow_events`, with history |
| **messages** `Send(ctx, id, msg, topic, WithIdempotencyKey)` / `Recv(ctx, topic, timeout)` | anyone with a `Client` (a durable step if from a workflow) | **only the workflow**, waiting up to `timeout` | a queue of messages *into* the run — an approval, a decider's report, a cancel-with-reason | yes — `notifications`, consumed once |
| **streams** `WriteStream` / `ReadStream`, `ReadStreamAsync`, `CloseStream` | the workflow | anyone, including live | an append-only log the run emits — progress, tokens, partial outputs | yes — `streams` |
| **attributes** `WithWorkflowAttributes` / `SetWorkflowAttributes` | the starter, or anyone later (replace whole map) | `ListWorkflows(WithFilterAttributes)`, `GetStatus` | tags for finding runs — tool, caller, correlation, tenant | yes — JSONB column, GIN-indexed |

**Mapping onto the rund spec's vocabulary:**

- `Fetch` → `RetrieveWorkflow` + `GetStatus` (and `GetWorkflowSteps` for the detail).
- the run's **tags** (§7.3.2) → attributes; **`garm.caller`** goes here *and* as `WithAuthenticatedUser`, so the native column is populated too.
- **what a decider tells rund** (§3.1 reports) and **`Approve`** → `Send` to the run's id on a named topic; the run `Recv`s with a durable timeout. The idempotency key on `Send` is the model's-never-sets-it key, supplied by the decider or the approver's front door.
- **what a subscriber sees** (§3.2 events) → `SetEvent` for the latest state of a thing (`stage=awaiting_approval`), `WriteStream` for a sequence (every step's outcome); both readable by a `Client` without rund in the path.
- a run's **tree** → `ParentWorkflowID` from a child workflow started inside a step; `WithFilterParentWorkflowID` lists it.

**Two consequences for the port.** The port needs a *signal* verb (`Send`) and a
*publish* verb (`SetEvent`/`WriteStream`) beside start/step/fetch — but the first
slice uses only start, step, fetch and the fingerprint; signals arrive with
`Approve`. And `GetEvent`/`ReadStream` being `Client` operations means **the
"events a subscriber sees" never need to cross NATS at all** — a consumer with a
database credential reads them from DBOS — which is a design choice the run-store
spec must make rather than inherit: NATS events (what the rund spec drew) or DBOS
reads (what the SDK offers). Named here; decided there.

---

## 4. What changed between v1.4.0 and v1.5.0 that touches us

- `Launch()` failure is terminal; a `Client` no longer creates or migrates the
  system database.
- `Config.SkipMigrations` verifies the schema instead of creating it.
- A custom `Serializer` must be total; the default is JSON. Our run input is
  protobuf bytes — stored as `[]byte` under JSON that is base64, fine; a
  protobuf-aware serializer is a later nicety, not a need.
- SQLite as a first-class system database (pure Go). This is the headline for
  us: the estate runs DBOS in memory, every property proved without a container.
