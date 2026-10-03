# rund — the run manager

**Date:** 2026-10-03
**Status:** active — step 9 implements §9.1 only; everything else is designed, not built

**Spec for:** a new component, `cmd/rund`, serving `garm.run.v1`.

**Drawn:** [the logical map](../architecture.html) — declare, compose, call — and
[the deployment map](../deployment.html), which traces a synchronous call into a core
banking system and shows DBOS and Temporal side by side.

In this repository rather than a private design record because nothing here is
secret and it sits beside `docs/decisions/`, which it cites throughout.

---

## 1. Why there is a component at all

Three requirements arrived together and none of them can be met by a tool service:

**Human-in-the-loop may apply to any call.** So *something other than the tool*
must be able to pause a call before it happens.

**Both runner types are durable.** ReAct and Workflow need state by definition, so
an agent's run outlives its call.

**A tool author implements an interface and nothing else.** So durability and
pausing cannot be each tool author's problem.

The only arrangement satisfying all three is that **asynchrony is imposed on a
tool, never implemented by one.**

```
caller ──▶ garm.run.v1.invoke ──▶ rund ──┐ creates the run
                                         │ pauses for a human, if policy says so
                                         ▼
                           garm.tool.payments.v1.freeze_account
                                   (an ordinary step-8 handler)
```

`FreezeAccount`'s handler is a plain synchronous function. It never learns a
person was asked.

### 1.0 Who is in the path, and when

**rund is in the path of every call. A runner is in the path only when the thing
invoked is an agent.** Written out because the first draft left it to inference:

| invoked | delivery | answers `garm.tool.<name>` | runner? |
|---|---|---|---|
| a plain tool | `sync` | the tool service | **no** |
| a plain tool | `async` — approval may apply | the tool service | **no** |
| an agent | `async`, always | a runner | **yes** |
| an agent | `sync` | — | **refused at compose** |

So **`async` does not imply a runner.** `FreezeAccount` is async and no runner
goes near it: rund creates the run, waits for a person, then calls the ordinary
step-8 handler. Durability lives in rund, not in an executor.

And **rund cannot tell a runner from a tool service.** It resolves a name to a
subject and calls it; whoever registered that subject answers. That is
routing-is-registration in one sentence — a runner is the thing that happened to
register an agent's subject.

The fourth row is a contradiction, not merely unwise: both runner types are
durable by definition, so an agent can never complete inside a call. Refused by
`garmctl compose`, not left as a comment in an example.

#### "Should everything go through a runner?" — the question equivocates

Asked because retries, guardrails and budgets are needed by **every** call, not
only by agents. That is correct, and it refutes an argument an earlier draft of
this spec made: *"a plain tool call has no state machine — one call, one answer,
nothing to resume."* **False the moment retries exist.** Attempt 1 fails
`UNAVAILABLE`, wait 200ms, attempt 2 is a resumable state machine, and it is there
for the dullest tool in the catalogue. A cost budget consumed across a run tree is
stateful too.

The equivocation is on "runner":

| | what it is | needed by |
|---|---|---|
| **the execution engine** | retries, guardrails, budget accounting, approval, state, the run tree, the event stream | **every call** |
| **a step decider** | what to do next — an LLM loop, a graph | **only a multi-step program** |

Retries and guardrails need the first. "ReAct runner" means the second. And the
first is **rund itself**, which already resolves a tool, creates a run, applies
approval policy, calls and stores.

So: **rund is the engine; a runner is a decider plugged into it.** A plain tool's
decider is the identity function — one step, already known, no code to write. A
ReAct agent's decider is an LLM; a Workflow's is a graph. Every call gets the same
lifecycle, and only "what next" varies.

Both answers to the original question are therefore true in different words: every
call goes through the same execution machinery, and no call goes through an
*executor of a program* unless there is a program.

### 1.0.1 Retries, guardrails and budgets are the engine's, and that decides §7.1

Three uniform concerns, none of which may be declared yet, all of which belong to
rund rather than to any runner:

| | where it lives | why not in a runner |
|---|---|---|
| **retries** | the engine, keyed on error **kind** — `UNAVAILABLE` retries, `INVALID` never | a per-runner copy would make retry semantics depend on which runner answered |
| **guardrails** | the engine, before and after each call | a check that only some callers get is not a check |
| **budgets** | the engine, accounted across the run **tree** | a child cannot know what its siblings have already spent |

**This is the decisive argument for §7.1(a).** If a runner drives its own loop,
then every runner type must implement guardrails, budget accounting and retry
policy — ReAct gets a copy, Workflow gets a copy, and they diverge. That is
exactly the failure this repository was started to avoid: the previous estate's CEL
dialect existed twice and a guard could pass lint and fail at load. A pure-reducer
runner cannot diverge, because it contains none of it.

The price is chattiness, and it is real: decide → act → decide means two round
trips and a persist per step, so an eight-step run is roughly sixteen round trips
and eight writes. Affordable for runs measured in seconds to minutes that may wait
on a person — and optimisable later (batched decisions, co-location) **without
changing the contract**, which is the test that matters.

**Retries interact with delivery, and not as a special case.** A sync call may
retry *in memory*, bounded by its declared budget: if the next attempt would not
fit in the remaining budget, it is not made. A retry that must outlive the call
requires `async`. So the fast path keeps retries without a store, by the same
budget rule rather than an exception to it.

**A cost budget is not `Sync.budget`.** That one is time. Tokens, money and call
counts are a different field with a different enforcer — an accountant that does
not exist — so they are designed here and declared nowhere.

### 1.0.2 What this collapses, and the part that should worry us

`rund` is three of the previous estate's components:

| old | its job | where it went |
|---|---|---|
| `garmd` | route by tool name, enforce policy, hot path, **no Postgres** | rund |
| `agentd` | the durable loop, DBOS, owned no schema | rund (state) + a decider (the loop) |
| `tasksd` | human approvals, as a tool, with its own schema, migrations and a sweeper | **dissolved** |
| `sts` | token exchange | **unchanged**, still separate |

`tasksd` dissolving is the clearest win: once runs are durable, "waiting for a
person" is a **state**, not a subsystem. A daemon with a schema and a sweeper
becomes two fields on a run and one RPC.

**And the part that should worry us.** That estate's constraint was emphatic —
garmd was to have no Postgres access and no knowledge of migrations or databases.
rund takes garmd's job *and* agentd's store, which overturns it. The reasons still
hold: a component in the hot path of every call now has a database dependency, so
a slow or unavailable store can take down calls that never needed it, and the
blast radius of the thing every caller talks to has grown.

Un-collapsing is not the answer — that split cost a ten-step chain between an
agent and a tool, four bugs in series on one endpoint each masking the next, and a
day to get the plane back. But the constraint was not arbitrary and this spec does
not get to wave it away.

**So: collapse the contract, keep the store boundary crossable.** The split falls
along the sync/async line for free:

| | needs | touches the store |
|---|---|---|
| sync | routing, guardrails, in-memory retries, the call | **no** |
| async | a run, a tree, approval, events | yes |

One proto surface and one logical component, with the property that the stateless
path *provably* does not need the store. Separating them later is then a deployment
decision rather than a redesign — one binary with two roles, or two binaries, is a
question operational reality answers.

Which makes it a **testable invariant rather than an intention**: *a sync call
touches no store.* Trivially true in step 9, which has no store; the step that adds
one has to keep it true.

### 1.1 Two layers

| | subjects | who talks to it |
|---|---|---|
| **external** | `garm.run.v1.*` | callers, UIs, runners |
| **internal** | `garm.tool.<name>` | **only** rund |

A caller never addresses `garm.tool.<name>`. That is what makes layer 2 free to
stay the dumb synchronous thing step 8 built.

Both committed decisions survive.
[routing-is-registration](../decisions/2026-10-03-routing-is-registration.md) is
*strengthened*: rund routes by tool name to a subject and still never learns that
agents or runners exist — an agent is a tool whose subject a runner registered.
[a-subject-is-derived-from-the-identity](../decisions/2026-10-03-a-subject-is-derived-from-the-identity.md)
now describes layer 2.

### 1.1.1 A run is a tree

A runner calls tools **through rund** (§8.3 frame 3), and such a call may itself
need approval — human-in-the-loop applies to any call, including a nested one. So
it needs its own state, which means **its own run**.

```
r1  assist.v1.payment_triage        correlation c1, no parent
├── r2  payments.v1.get_balance     correlation c1, parent r1
└── r3  payments.v1.list_payments   correlation c1, parent r2   (causation: after r2)
```

One correlation id across the whole tree; causation ids are its edges. A `Run`
therefore carries `parent_run_id`, empty at the root.

Three things follow. A nested call gets a per-call record and its own approval
state for free. The allowlist is checked **per nested call**, at call time, which
is where the contract's loudest claim finally has an enforcer. And it is the real
reason `run_id` is on every `InvokeResponse` including a synchronous one —
uniformity, not decoration.

The cost: a tree of runs is a tree of rows. A ReAct agent making eight calls is
nine runs. That is the price of approval being possible on any one of them, and
it is a reason the store's shape matters.

### 1.2 rund is the catalogue's first consumer

`garmctl compose` has emitted `catalogue.binpb` since step 4 and **nothing has
ever read it**. rund loads it to resolve a tool name, read its delivery and
budget, and find the message types for typed payloads (§4). That closes the loop
from `images.yaml` to a running call.

---

## 2. The interface is one pattern, repeated

The full external surface is about eight operations. It stays simple because every
one of them has the same shape:

> **A generic operation, with a typed payload whose type the catalogue resolves.**

`Invoke(tool, bytes)` is the first instance, not a special case. `ProvideContext`,
`Answer` and `Approve` are the same move with a different resolver. Nothing on the
wire is agent-specific; the **generated client** carries the types (§4).

| operation | keyed by | payload type resolved from |
|---|---|---|
| `Invoke` | tool name | the tool's request message |
| `Fetch` | run id | — |
| `Cancel` | run id | — |
| `Suspend` / `Resume` | run id | — |
| `Approve` | run id + step id | a fixed decision message |
| `ProvideContext` | run id | the agent's declared context type |
| `Answer` | run id + question id | the question's declared answer type |
| `GetInvokeCard` | **tool name** | — |
| `GetCard` | run id + kind | — |

**`GetInvokeCard` is the one operation not keyed by a run**, because it is how you
collect the input that *starts* one. That exception is worth noticing: everything
else is a run operation, which is why they belong to the platform and are declared
once rather than per agent.

---

## 3. The run talks back — on two channels, not one

`Invoke`/`Fetch` alone is pull-only, and a ReAct agent emitting eight intermediate
results against a polling API is untenable. But there are **two** directions here
and conflating them is a correctness bug, not a design preference.

| | direction | delivery | why |
|---|---|---|---|
| **report** | runner → rund | **request/reply, acknowledged** | rund is authoritative for a run's state. A lost report leaves a run `RUNNING` forever |
| **event** | rund → subscribers | fire-and-forget pub/sub | a UI missing a frame is a cosmetic loss; `Fetch` is the source of truth |

The first draft of this spec had only the second, which would have made a runner's
"I am finished" a publish that rund happened to be subscribed to. That is a
durable state machine advanced by an unacknowledged message.

### 3.1 Reports: what a runner tells rund

```proto
rpc Report(ReportRequest) returns (ReportResponse);

message ReportRequest {
  string run_id = 1;
  uint64 sequence = 2;          // the runner's own counter, so rund rejects a replay
  oneof report {
    Progress  progress  = 3;    // an intermediate result
    NeedsInfo needs_info = 4;   // blocked: context the agent declared a type for
    Question  question  = 5;    // blocked: a specific question, with an id to answer
    Finished  finished  = 6;    // terminal, and the runner says WHICH terminal
  }
}

message Finished {
  oneof outcome {
    bytes result = 1;                  // SUCCEEDED
    garm.invoke.v1.Error error = 2;    // FAILED
    Cancelled cancelled = 3;           // CANCELLED — confirming a request to stop
    TimedOut timed_out = 4;            // TIMED_OUT — the runner gave up on itself
  }
}
```

rund validates that the reporting runner owns the run, persists, **then** fans the
event out. Persist-before-publish, so a subscriber never sees a state that did not
survive.

**`NeedsInfo` and `Question` are both blocked states and are not the same thing.**
`ProvideContext` may be called at any time, solicited or not — a caller can supply
context before anything asks. `Answer` replies to a specific `question_id` and only
exists because something asked. Same `WAITING_FOR_INFO` state; different reply
paths, and only one of them has an id to quote.

### 3.2 Events: what a subscriber sees

```
garm.run.event.<run_id>
```

Derived from the run id, so it needs **no declaration** — there is no new surface
to govern, which is why this does not grow the contract.

`sequence` is monotonic per run, so a subscriber knows it missed something rather
than silently skipping a step. **A late subscriber needs history**, which needs
JetStream: deferred, because core pub/sub serves a live viewer and `Fetch` covers
catching up on the outcome. The step that adds a UI decides whether replay is
required.

### 3.3 Terminal states, and who declares one

```proto
enum RunState {
  RUN_STATE_UNSPECIFIED = 0;
  RUN_STATE_RUNNING = 1;
  RUN_STATE_WAITING_FOR_APPROVAL = 2;
  RUN_STATE_WAITING_FOR_INFO = 3;
  // Asked to stop, not yet confirmed. A real state, not a gap -- see below.
  RUN_STATE_CANCELLING = 4;
  RUN_STATE_SUCCEEDED = 5;
  RUN_STATE_FAILED = 6;
  RUN_STATE_CANCELLED = 7;
  RUN_STATE_TIMED_OUT = 8;
}
```

**Cancellation is cooperative, which is why `CANCELLING` exists.** `Cancel(run_id)`
cannot force a runner to stop in the middle of a tool call — the call is already in
flight and the tool will answer. So rund records `CANCELLING`, the runner notices
at its next step and reports `Finished{cancelled}`. A design with no intermediate
state has to either lie about having stopped or block the caller until the runner
agrees.

**A run nobody reports on must still terminate.** If a runner dies, no report ever
arrives and the run sits in `RUNNING` forever — the one failure mode this whole
section exists to prevent, reappearing by omission. Two mechanisms, and the choice
belongs to the step that builds the store:

- a **run deadline** held by rund, from `Async.run_limit` — simple, and a long
  human wait has to be excluded from it or every approval times out
- a **lease the runner renews** — tolerates long waits naturally, and costs a
  heartbeat and a sweeper

Either way `TIMED_OUT` has two authors: the runner giving up on itself, and rund
giving up on a runner. Both are the same terminal state and a `Finished` record
should say which, or an operator cannot tell a slow tool from a dead runner.

## 4. Typed payloads without a typed wire

`bytes`, never `google.protobuf.Any`. An `Any` carries a type URL — a **second**
statement of a type the tool name or the agent's declaration already determines,
and two sources that can disagree about the one thing this platform refuses to
state twice. rund holds the catalogue, so it can decode for a log line without the
wire carrying a redundant claim.

The types reach the developer at **generation** time, not on the wire:

```go
client := paymentsv1.NewPaymentsClient(rund)

bal, err := client.GetBalance(ctx, &GetBalanceRequest{AccountId: "a-1"})
// sync  -> (*GetBalanceResponse, error).  Deadline is the DECLARED 2s.

ref, err := client.FreezeAccount(ctx, &FreezeAccountRequest{…})
// async -> (*run.Ref, error).  A DIFFERENT SIGNATURE, from the declaration.
res, err := ref.Await(ctx)
// the caller's own patience. Giving up does NOT cancel the run.
```

**Flipping a tool from sync to async makes every caller fail to compile.** That is
the no-`Unimplemented`-embed discipline applied to delivery; the alternative is a
caller waiting forever for an answer that has quietly become a receipt.

`call.Invoker` mirrors `serve.Registrar`, so generated client code imports no
broker and `mise run no-broker` keeps covering it:

```go
type Invoker interface {
	Invoke(ctx context.Context, tool string, input []byte) (*runv1.InvokeResponse, error)
	Fetch(ctx context.Context, runID string) (*runv1.FetchResponse, error)
}
```

### 4.1 An agent declares the context it accepts

```proto
message Agent {
  repeated ToolRef tools = 1;
  string context_type = 4;   // e.g. "assist.v1.TriageContext"; empty = free text
}
```

A proto full name used as an **address**, which is what a type name is — not as an
identity. The catalogue holds the descriptor, so compose refuses a `context_type`
naming a message nothing declares, by the machinery that already refuses an
unresolved allowlist entry.

---

## 5. Cards: derived by default, declared when bespoke

The estate this replaces made every card a generated endpoint —
`web.v1.fetch_page_input_card`, `web.v1.fetch_page_result_card`, two extra mounts
per tool plus a default implementation, an override interface and a reflective
descriptor lookup. That is most of how one tool's generated file reached 230
lines.

It conflated two things:

**A default card is a derivation.** A form for `GetBalanceRequest` — fields,
types, which are required — is computable from the descriptor, and the catalogue
carries the full `FileDescriptorSet`. So a renderer computes the default input and
result card for **every** tool with zero per-tool endpoints, zero generated lines
and zero declarations.

**Only a bespoke card needs anything**, and then it is a tool like any other:

```proto
option (garm.tool.v1.tool) = {
  name: "payments.v1.freeze_account_approval"
  card: { of: "payments.v1.freeze_account" kind: CARD_KIND_APPROVAL }
  sync: { budget: { seconds: 1 } }
};
```

Two things follow from a card being a tool. It gets its **own policy** — "may see
that an approval is pending" is not "may approve" is not "may call
freeze_account", three grants over three things. And `card.of` resolves through
the allowlist's machinery, so a card pointing at nothing is the same refusal.

**A context card is the same story.** An agent that declares `context_type` gets a
form derived from that message; one that declares none gets **a generic text
card**. So "very specific cards or a generic text-based card" is not two features
— it is the default-derivation rule with and without a declared type.

---

## 6. Delivery, and why `sync` is a safety claim

```proto
oneof delivery { Sync sync = 3; Async async = 4; }
```

A `oneof`, so a tool cannot forget to say — and "forgot" must not quietly become
async.

`async` is **not about being slow**. `FreezeAccount` takes milliseconds and is
async; `ListPayments` pages a ledger for ten seconds and is sync. The axis is
whether **state outlives the call**.

`Sync{budget}` binds in three places, which is what makes it a fact:

| | |
|---|---|
| the generated client | uses it as the deadline, so no caller invents a number |
| the tool's transport | cancels past it — the caller has given up, so the work is unread |
| `garmctl compose` | refuses an agent whose budget is below the **largest** in its allowlist |

The floor is the max and not the sum, deliberately: summing needs to know whether
calls are sequential, which nothing knows until something **orders** calls. That
is the graph, and it is a later step. An honest weak check beats a strong one
resting on a guess.

**And declaring `Sync` declares that no human may be interposed.** Without that,
approval policy could turn a truthful `budget: 2s` into four hours with the author
doing nothing wrong. rund refuses to attach approval policy to a sync tool — which
is the named enforcer for "some tools must never allow HITL".

---

## 7. Runner types, how a decider is addressed, and a substantial retraction

### 7.0 A decider is not addressed like a tool

The engine/decider model of §1.0.1 breaks an invariant this design had been
protecting, and it is better to say so than to let it erode quietly.

> garmd does not know about agents. An agent is a tool: a service at a NATS
> subject. — `garmd/CLAUDE.md:21`, the previous estate

rund calls a decider **repeatedly**, and the shapes differ:

```
a tool subject:     (request)      → response                 answered ONCE
a decider subject:  (state, event) → (new state, actions)     answered MANY TIMES
```

You cannot drive a loop against something that answers once. So "an agent is a
tool at a subject" is false under this model **however deciders are addressed**,
and the question is only which addressing is better.

**Deciders are addressed by TYPE:**

```
garm.runner.react       one service, serving EVERY ReAct agent
garm.runner.workflow
```

Because a decider is **type-shaped, not agent-shaped**: it is generic machinery
parameterised by an agent's declaration — prompt, allowlist, step limit — and
nothing agent-specific lives in it. Deploying one per agent would be absurd.

The operational payoff is the decisive part: **declaring a new ReAct agent
requires no deployment.** The alternative, a decider subscribing to each agent's
own subject, means every new agent needs the runner to pick it up.

And note what a **caller** does with any of this: nothing. A client calls
`garm.run.v1.invoke` with a tool name and knows no subject, no runner and no type.
A client that routed by runner type would know something it must never need.

### 7.0.1 Three deciders, one of them built in

| decider | where it runs | serves |
|---|---|---|
| **single-step** | **in-process in rund** | every plain tool — sync *and* async |
| **ReAct** | `garm.runner.react` | agents declaring `react` |
| **Workflow** | `garm.runner.workflow` | agents declaring `workflow` |

One decider *interface*, three implementations, two of them deployed. The same
shape as `serve.Registrar` and `natsserve`: an interface this repository owns, with
transports behind it.

**The single-step decider is NOT a deployed service**, and that is deliberate. Its
entire logic is "call the one tool, you are done", so a round trip to a service for
it costs two hops on a 2ms read — and worse, it would make a plain call depend on a
deployed runner, which is exactly what stops step 9 from being thin.

**It is also not called "sync", because that is the wrong axis.**
`payments.v1.freeze_account` is **single-step AND async**: one tool call, but a
person may approve it first. Naming the decider after delivery would leave that case
homeless.

| | steps | decider | delivery |
|---|---|---|---|
| `payments.v1.get_balance` | 1 | built-in | sync |
| `payments.v1.freeze_account` | 1 | built-in | **async** (approval) |
| `assist.v1.payment_triage` | n | ReAct | async |
| — | n | ReAct / Workflow | **sync: impossible** (§1.0) |

It needs no new field. `runner` lives inside `Agent`, so absence already says it:

| declaration | decider |
|---|---|
| no `agent` block | built-in single-step |
| `agent { react: {…} }` | `garm.runner.react` |
| `agent { workflow: {…} }` | `garm.runner.workflow` |
| `agent {}` with no runner set | **refused at compose** |

So rund has **one code path** — drive a decider — and no `if sync { call directly }`
branch. That matters beyond tidiness: a second path is where guardrails and budget
accounting get applied twice, or once.

**And step 9 ships only the built-in**, which is the real reason to do it this way.
The decider interface is then designed by a working implementation from the start,
rather than invented when the first ReAct runner arrives and found to be the wrong
shape. Same discipline as letting a real consumer design the client.

### 7.1 What survives of routing-is-registration

| | decided by |
|---|---|
| *what kind of thing* answers — a tool, or a ReAct/Workflow decider | **declared** |
| *which instance* answers — `react-v2` or `react-experimental` | **registration**, on `garm.runner.react` |

rund must know an agent is an agent, because driving a loop and making a call are
different acts. That invariant was true of a **dumb router**; rund owns the run,
the tree, retries and budgets, and is not one.

So [routing-is-registration](../decisions/2026-10-03-routing-is-registration.md) is
substantially superseded, and the half that survives is the half that was always
the real point: a tool author never names somebody else's deployment.

### 7.2 Runner types in the declaration

[routing-is-registration](../decisions/2026-10-03-routing-is-registration.md)
says there is no runner type field because *"nothing reads it if routing is
registration."* That was true when written and is no longer, for a reason not
visible then: there was no runner-specific declaration content, so there was
genuinely nothing to check.

Two enforcers now exist, so the type is declared:

**Compose-time completeness.** A `Workflow` with no steps, or a `ReAct` with no
prompt, is refusable — but only if the type is known.

**Catalogue ↔ discovery reconciliation.** If a ReAct runner registers a subject
declared `workflow`, NATS hides it behind a queue group and calls are answered by
the wrong kind of runner. Declared type versus what `$SRV.INFO` reports is
checkable.

The part that record was right about **stands**: the *implementation* is never
declared. `react-v2` versus `react-experimental` is a deployment's topology,
settled by registration. A tool author who could name it would be choosing
somebody else's deployment.

The type is carried by **which message is set**, not an enum beside the content:

```proto
oneof runner { ReAct react = 2; Workflow workflow = 3; }
```

so `type says X / content says Y` is unrepresentable, and adding a type is
additive.

### 7.3 Who owns a decider's state — and the argument that was wrong

An earlier revision of this spec decided **(a) rund owns everything**, a decider
being a pure reducer, on these grounds: otherwise every decider kind would carry
its own copy of guardrails, retry policy and budget accounting and they would
diverge.

**That argument is false**, and asking what DBOS and Temporal would look like as
two implementations is what exposed it. A decider's tool calls go **through rund**
(§8.3 frame 3), so rund applies guardrails, retries and budget accounting
regardless of who initiated the call. Nothing is duplicated.

What a decider actually owns is only its own **orchestration position** — which
step, what history, which timer — and that is exactly what DBOS and Temporal exist
to own. You do not adopt Temporal in order to run it statelessly.

**So the interface permits both, and does not have to choose:**

| decider | keeps state between reports | state travels |
|---|---|---|
| `react` | no — a pure reducer | round-tripped through rund |
| `workflow` · DBOS | **yes**, in its own Postgres | never leaves the decider |
| `workflow` · Temporal | **yes**, in Temporal's store | never leaves the decider |

One `Report` channel (§3.1) serves both: a reducer-style decider includes its state
in every report and expects it back; a Temporal-style one ignores that field.

The two-store objection **dissolves** rather than being accepted, because the two
stores hold different facts:

- **rund is authoritative about a run's PUBLIC state** — waiting, finished, the
  result, the tree. There is no field anywhere in `garm.run.v1` for a decider's
  position.
- **a decider is authoritative about its EXECUTION state**, which rund never reads.

What does not dissolve: a decider that dies silently still leaves a run `RUNNING`,
and the state needed to resume it now sits in a store rund cannot read. With
Temporal that is Temporal's problem to solve, which is a reason to use it. With a
hand-rolled decider it is ours, and §3.3 still names two mechanisms and picks
neither.

### 7.4 Two implementations of one kind, and the hazard

The kind is declared; **which implementation serves it is a subject in rund's
routing table** — deployment config, in the same place the NATS URL lives.

```
workflow → garm.runner.workflow.temporal      with per-agent overrides
react    → garm.runner.react
```

So migrating an estate from DBOS to Temporal touches no `.proto` and no tool, and
can proceed agent by agent.

**The hazard, and the reconciliation check of §7.2 does not catch it.** If a DBOS
service and a Temporal service both register `garm.runner.workflow`, NATS
queue-groups them and **calls split randomly between two engines** — half the runs
landing in a store the other cannot read. Both report their kind as `workflow` and
both are correct, so comparing declared kind against reported kind sees nothing.

What catches it is coarser and has to be written down: **`$SRV.INFO` showing two
distinct service NAMES answering one kind's subject.** The per-implementation
subjects above are the structural half of the same answer — `…workflow.dbos` and
`…workflow.temporal` cannot collide by accident, so sharing a subject becomes a
deliberate act rather than a deployment slip.

## 8. Call stacks

### 8.1 A sync call

```
0  caller      client.GetBalance(ctx, req)
1  natscall    headers: correlation=c1 causation=— message=m1 idempotency=k1 traceparent=…
               nc.Request("garm.run.v1.invoke", InvokeRequest{tool, input})
2  rund        catalogue: payments.v1.get_balance → Sync{2s}
3  rund        refuses if approval policy is attached to a sync tool
4  rund        run_id=r1; log{c1, causation=m1, message=m2, r1, tool}
5  rund        nc.Request("garm.tool.payments.v1.get_balance", input, deadline 2s)
               headers: correlation=c1 causation=m1 message=m2 idempotency=k1
6  natsserve   unmarshal → handler ctx carries the ids AND a 2s deadline
7  handler     returns *GetBalanceResponse
8  rund        InvokeResponse{run_id=r1, result}.  NOTHING IS STORED
9  natscall    unmarshal → *GetBalanceResponse
```

Frame 8 is the fast path: a run id exists and is logged, and no state is kept. So
`Fetch(r1)` is **not** available for a sync run, and says so rather than lying.

### 8.2 An async call that waits on a person

```
0-2 as above; delivery is Async{}
3  rund        durable run r2, state RUNNING, input stored
4  rund        policy: approval required → state WAITING_FOR_APPROVAL
               publish Event{r2, seq=1, approval_needed}
5  rund        InvokeResponse{run_id=r2, pending{WAITING_FOR_APPROVAL, retry_after=absent}}
               absent BECAUSE THERE IS NO HONEST ESTIMATE for a person
   …
6  UI          GetCard(r2, CARD_KIND_APPROVAL) → the declared card, or the derived one
7  approver    Approve(r2, step, APPROVED)
8  rund        state RUNNING; nc.Request to the tool, causation = the approve message
               SO THE CAUSATION CHAIN RECORDS THAT A HUMAN CAUSED THE CALL
9  rund        store result, state SUCCEEDED, publish Event{r2, seq=2, finished}
10 caller      ref.Await / Fetch returns the result
```

Frame 8 is the point of causation ids: the chain shows the approval caused the
call, which a correlation id alone cannot say.

### 8.3 An agent asking a question

```
0  caller      client.TriagePayment(...) → run r3, pending
1  rund        resolves assist.v1.payment_triage → a runner registered the subject
2  rund        hands the work to the runner; THE CALL IS SHORT, THE RUN IS LONG
3  runner      calls payments.v1.get_balance — THROUGH rund, so the allowlist is
               enforced at call time and the ids chain
4  runner      needs something only a person knows
               Report(r3, seq=4, question{question_id=q1})   ← ACKNOWLEDGED
5  rund        persists WAITING_FOR_INFO, THEN publishes Event{r3, seq=4, question}
               persist-before-publish, so no subscriber sees a state that did not survive
6  UI          GetCard(r3, CARD_KIND_QUESTION) → derived from the declared answer
               type, or a generic text card when none is declared
7  person      Answer(r3, q1, payload)
8  runner      resumes, finishes
               Report(r3, seq=N, finished{result})           ← ACKNOWLEDGED
9  rund        persists SUCCEEDED, publishes Event{r3, seq=N, finished}
```

Frame 3 is where the contract's loudest claim finally has an enforcer: **the
allowlist is the only authority on what a run may call**, checked when the call is
made and not only when the tree is composed.

---

## 9. Staging

### 9.1 Step 9 — the sync fast path, no store

- `garm/run/v1` with **`Invoke` and `Fetch` only**
- the decider interface, with **only the built-in single-step implementation** — so
  the interface is proved by a real consumer and no runner need be deployed
- `cmd/rund`, loading `catalogue.binpb`
- `call.Invoker` + `natscall`, and a generated typed client
- correlation + causation + message ids and `traceparent`, caller → rund → tool
- the `Sync{budget}` check in all three places of §6
- `garmctl call`, and an `examples/` loop that answers
- `Fetch` on a sync run says it is not retained, rather than lying

Deliberately absent and stated: no store, no `Async`, no events, no cards, no
runner, no HITL.

### 9.2 Later, each waiting on something real

| | waits on |
|---|---|
| `Async` delivery, `Fetch` meaning something | the store |
| events, `Progress` | the store, and a subscriber |
| `Cancel` / `Suspend` / `Resume`, and `CANCELLING` | the store |
| `Report`, and therefore every terminal state but `SUCCEEDED`/`FAILED` | a runner |
| a run deadline or a runner lease | the store, and a sweeper |
| `Approve`, `ApprovalNeeded`, approval policy | the store **and** the authority model |
| `ProvideContext`, `Answer`, `Question`, `NeedsInfo`, `Progress` | a runner |
| runner types in `Agent` | a runner |
| cards of any kind | a renderer |
| retry policy | the store, for anything outliving a call |
| a `$SRV.INFO` check for two implementations on one kind's subject | a second implementation existing (§7.4) |
| guardrails | something to check, i.e. the authority model |
| cost budgets | an accountant |
| JetStream replay for late subscribers | a UI that needs history |

Every row is a field or an RPC that **must not be declared** before its row's
right-hand column exists. That is the rule this repository was started to keep,
and this table is the form it takes for a component designed further ahead than it
is built.

---

## 10. Invariants step 9 must prove

| | |
|---|---|
| A caller reaches a tool without knowing its subject | an e2e test through the generated client |
| One correlation id spans caller → rund → tool; causation chains `m1→m2` | asserted on captured headers and log records |
| A sync tool's declared budget is the client's deadline | no literal timeout anywhere in the client |
| …and the handler's context carries it | the handler observes a deadline equal to the budget |
| Approval policy on a sync tool is refused | rund refuses at load |
| An agent whose budget is below its allowlist's max is refused | `garmctl compose` |
| An agent declaring `sync` is refused | `garmctl compose` — both runner types are durable, so it cannot complete inside a call |
| rund has one execution path, not two | the built-in decider is the only implementation in step 9, and the sync path goes through it — so there is no second path to drift |
| A sync call reaches the tool with **no runner in the path** | the step 9 e2e test, which runs no runner at all |
| `Fetch` on a sync run says it is not retained | and does not fabricate a result |
| A tool name rund cannot resolve is `NOT_FOUND`, naming the catalogue | not `INTERNAL` |
| Generated client code imports no broker | `mise run no-broker` |

## 11. Risks worth writing down

**A runner that dies silently is the failure this design must not have.** §3.3
names two mechanisms and picks neither; until one exists, every terminal state
other than `SUCCEEDED` and `FAILED` depends on a cooperative runner, and a crashed
one leaves a run `RUNNING`. That is acceptable only while no runner exists.

**This spec designs eight operations and builds two.** The risk is the other six
arriving as a pile rather than as steps, which is how the previous estate reached
five unenforced concepts. The §9.2 table is the mitigation and it is only worth
anything if each row is actually refused until its condition holds.

**rund is in the hot path of every call.** Step 8's tools were reachable directly;
they no longer are. That buys HITL, durability and one place for authority, and it
costs a hop and a component that can be down. Accepted deliberately — the
alternative puts a store in every tool service.

**`context_type` is a proto name in a string field.** The weakest part of §4.1.
Compose can verify it resolves, so the failure mode is a build error rather than a
runtime surprise, but it remains a type reference the type system does not check.
