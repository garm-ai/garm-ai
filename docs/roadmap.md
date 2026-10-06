# What is built, what is next, and what each unbuilt thing waits on

**The third column is the point.** This repository's rule is that *a field arrives
when the thing that enforces it arrives*, so the useful question about anything
unbuilt is not "when" but **"what has to exist first"**. A row with no answer there
is a wish, and should be deleted rather than carried.

This is the **single list**. [docs/invariants.md](invariants.md) says what holds
today and names the test; [docs/decisions/](decisions/) says why; the
[rund spec](specs/2026-10-03-rund-design.md) §9.2 carries the same staging for that
one component in more detail. They link here rather than repeating it.

## Built

| | proved by |
|---|---|
| A tool is an RPC method carrying one option; an agent is a tool rund runs with a decider | [invariants](invariants.md) · `declared` |
| A tool's name is its identity; the proto path is an address | `declared.TestIdentityAndAddressAreSeparateFields` |
| No two tools share a name; a name is routable | `declared` — a security rule, not a style one |
| The allowlist is enforced, not asserted | `garmctl compose` |
| Many repositories' images merge into one verified namespace | `images`, `fetch` |
| An artefact resolves from `file://`, `s3://` or `https://`, digest-pinned | `fetch` |
| Generated transport glue; a missing tool fails to **compile** | `protoc-gen-garm-go` |
| A declared tool is reachable over NATS, with a graceful drain | `natsserve` |
| Errors carry a kind and leave the cause at home | `serve` |
| A tool declares its delivery; silence is refused | `declared.DeliveryProblems` |
| Only `rund` calls `garm.tool.>` — the caller's permission refuses it, and the account boundary behind that | `estate.TestACallerCannotReachAToolSubject` beside `TestRundReachesTheToolItImports` |
| A caller's identity arrives in the subject, placed by the server | `rundsvc.TestTheCallerIsTokenFourAndMustBeAnAccountKey` · `TestRundLogsTheCallingAccount` |
| Every test runs against operator mode, TLS, the full resolver | `internal/estate` |
| One trace per call; the quoted id opens it; counters by tool and caller; `/readyz` agrees with `$SRV.PING`; OTLP to OpenObserve | `estate.TestOneCallIsOneTraceWithRundBetweenCallerAndTool` · `natsmicro.TestReadyAgreesWithPingThroughTheLifecycle` — step **9e** |
| **Revoked stays revoked**: the manifest's cumulative record carries every revocation into every later account JWT until the credential expires; a leaving caller's tombstone is re-emitted while its revocation lives | `topology.TestARevocationIsCarriedAcrossGenerations` · `TestARevocationIsPrunedOnceTheCredentialHasExpired` · `TestATombstoneIsReemittedWhileItsRevocationLives` |
| The root offline; accounts signed by an operator signing key, credentials by account signing keys, enforced by the server; two-step rotation with `--verify-live` | `estate.TestTheServerRefusesAnAccountSignedByTheRoot` · `estate.TestRotationKeepsTheOldCredentialAliveUntilStepTwo` · `garmctl.TestVerifyLiveRefusesWhileTheOldKeyIsStillOnTheWire` — step **9f** |
| **The run store**: an async tool is `pending{run_id}` once durable, executed from a DBOS queue by a replica, read back with `Fetch --wait`; the plan is step 0 and a replay follows it; the key is fingerprinted; a run is visible to its invoking account only; sync is sovereign when the store is down; only `rundbos` imports DBOS | `estate.TestAnAsyncToolIsPendingThenAnswered` · `rundbos.TestAStoppedReplicasRunIsFinishedByItsSuccessorWithTheSameIdentity` · `rundbos.TestAReplayFollowsThePlanRecordedAtStart` · `estate.TestSyncIsSovereignWhenTheStoreIsDown` · `mise run no-sdk` — step **10** |

## Being built

| | step |
|---|---|
| `rund`: `Invoke`/`Fetch`, catalogue-loaded, sync fast path | ✅ **9b** |
| The budget binds: handler deadline and compose check | ✅ 9b — the client deadline lands with the client, in 9c |
| Correlation, causation, message ids and `traceparent`, end to end | ✅ 9b |
| The generated client, `garmctl call`, and an example loop that answers | ✅ **9c** |

## Waiting on something real

**Step 9 is complete**: a caller names a tool and gets an answer, through a
generated client it did not write, over a transport it does not import.



| | waits on |
|---|---|
| `Cancel` · `Suspend` · `Resume`, and the `CANCELLING` state | the authority model — the store's own commands exist; who may issue them does not |
| A run deadline or a decider lease, so a dead decider cannot hang a run | a decider (DBOS timers are there) |
| Retry policy, keyed on error **kind** | a decider — a tool-call step retries `UNAVAILABLE` three times today, fixed, not declared, and never a call that timed out |
| Run events, `Progress`, and a per-run subject subscribers read | push |
| Replay for a late subscriber | a UI that needs history |
| `Report`, and every terminal state but `SUCCEEDED`/`FAILED` | a decider |
| `ProvideContext` · `Answer` · `Question` · `NeedsInfo` | a decider |
| Decider kinds (`ReAct`, `Workflow`) in the declaration | a decider |
| A `$SRV.INFO` check for two implementations on one kind's subject | a **second** implementation |
| Approval, `ApprovalNeeded`, and policy that may interpose a human | the run store **and** the authority model |
| Guardrails before and after a call | something to check — the authority model |
| Cost budgets across a run tree | an accountant |
| A task list filtered by **compartment and principal** | the authority model — and a projection table, since JSONB containment is AND-only and cannot express "any of my compartments" |
| rund owning a schema and migrations | a listing surface that needs OR queries and real pagination. A deliberate step, because it concedes the second half of the original no-database constraint |
| A **per-declaration** run limit, and the check that it is ≥ the largest call limit in an allowlist | a decider. `Async.limit` (one call to the handler) and `rund --run-store-run-limit` (the deployment's ceiling on any run, `CANCELLED` past it) are built; a limit an author declares for a run needs the thing that runs several steps |
| Cards of any kind, input, result, approval, context | a renderer |
| Hot reload of the catalogue, converging every replica | a trigger — a JetStream KV key an operator sets |
| A descriptor hash over wire shape | two repositories on two contract versions, so drift can exist |
| Catalogue signing | a threat model that says digest-pinning is not enough |
| A person's identity, and standing grants | the identity spec's slices 2 and 3 — an auth-callout service, then a grant store |

## The authority model, absent as a block

No clearance, compartments, verbs, tool sets, principal ceiling, bounds, model,
prompts, graph or consent. Every one is real and most will return.

They are absent together because **that is where all four of 2026-10-02's bugs
lived** in the estate this replaces, and because an authority model asserted by a
declaration and enforced by nothing is worse than none — it reads as a guarantee.
They return one at a time, each with its enforcer, each with a row above naming
what it waited on.

## Next

| | waits on |
|---|---|
| **Push** — a subscriber sees a run's events without polling: DBOS streams as the record, a NATS stream export `garm.run.v1.*.out.>` for live delivery; `Answer` as `Send` for a decider that needs input | nothing — the run store is built; next |
| The authority model, then `Cancel` / `Approve` / deciders on it | push, so an approver can be told |
| **Cross-executor recovery** — a dead replica's in-flight runs taken over by a live one without DBOS's Conductor; a lease and a heartbeat, because DBOS re-enqueues a dead executor's runs only at that executor's own relaunch | the run store; a liveness signal DBOS does not keep |

| A `garmctl topology --push` that sends every changed account JWT to the cluster over `$SYS` with the ops credential | nothing — today it is one `nats request` per changed account ([operating the topology](operating-the-topology.md)) |

## Found, not yet fixed

Nothing at the moment. The last entry, revocations not carried across
generations, was closed by the manifest's cumulative revocation record.

## Deliberately undecided

| | |
|---|---|
| Whether an agent's service should end in `Service` | [parked](decisions/2026-10-03-service-naming-deferred.md) — buf's `STANDARD` against the domain, twice |
| Whether `testdata/` and `examples/` stay separate | they now have the same *shape*; a third fixture shape is the moment to check |

## How to change this file

Add a row when you decide to build something, with its third column filled in.
Move it up when it lands, and link the test. **If you cannot say what a row waits
on, do not add it** — that is the difference between a roadmap and a wish list,
and the estate this replaces has 273,768 lines of markdown that did not keep it.
