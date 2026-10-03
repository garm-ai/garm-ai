# rund's durability is a framework's job, not ours

**Date:** 2026-10-03
**Status:** active

**Decision.** `rund` uses **DBOS** for durable execution, behind a narrow port so
that a Temporal implementation is possible later. Postgres returns on the
asynchronous path.

## Why rund must own durability at all

Human-in-the-loop may apply to **any** call, and a plain tool call declared `async`
because a person may approve it has **no decider in its path** — it is one step,
the built-in. If `rund` owns no durability, nobody holds that run.

So this is not a preference. It falls out of the requirement.

## What was tried first, and what it showed

NATS-only, event-sourced, was the preferred answer: it would have kept the
previous estate's constraint that the component every call passes through has no
database. A throwaway spike built it — a ~140-line engine on JetStream — and
probed nine properties, each verified by breaking the mechanism and watching the
probe fail.

**The primitives all work.** This is worth recording, because it means the
rejection is not "NATS can't":

| | |
|---|---|
| per-run compare-and-swap | `WithExpectLastSequencePerSubject` — two concurrent approvals, exactly one wins, across three processes on three nodes |
| a dead decider | a lease with `Nats-TTL` plus `SubjectDeleteMarkerTTL` fires a marker (`Nats-Marker-Reason: MaxAge`) that a sweeper turns into `TIMED_OUT` |
| crash between a tool call and recording it | the tool was **requested twice and executed once** |
| a replica dying mid-run | another replica, which had never seen the run, finished it — no operator, no handoff |
| parallel steps | three children joined correctly, result ordered by step id rather than arrival |
| replay | five folds byte-identical |
| publish dedup (`Nats-Msg-Id`) | **turned out not to be load-bearing** — the fold absorbs a duplicate on its own |

**Two findings ended it**, and both arrived in the last minutes of the spike:

1. **A probe was vacuous and I could not see it.** The classic early-ack bug — ack
   the message before doing the work — was introduced deliberately, and the probe
   written specifically to catch a replica dying mid-run **passed anyway**.
2. **The clustered probe was flaky**: green in 11s alone, timed out at 96s when run
   after its siblings. Harness or design — **I could not say which**, and in a
   hand-rolled engine every ambiguous failure is ours to diagnose.

The second is the real argument. A framework's failures have been diagnosed by
other people already.

## What this costs, stated rather than softened

**Postgres is back** in the component every call passes through, overturning a
constraint the previous estate held emphatically.
[§1.0.2](../specs/2026-10-03-rund-design.md) keeps the mitigation, and it matters
more now, not less: **a sync call starts no workflow and touches no store.** That
is a testable invariant, and the step that adds the store has to keep it true.

**`rund` is coupled to a framework**, and swapping it is not a configuration
change.

## The port, and what it is not

`rund`'s logic is written against a narrow durability port — start a run, record a
step, await an external signal, set a timer, read state — with one DBOS
implementation.

**It is a hypothesis until a second implementation exists.** An interface written
against one implementation usually fits only that one, so nothing here should claim
rund is "swappable". It claims only that the surface was kept small and that
rund's own logic does not reach for DBOS primitives directly. If Temporal is ever
needed, that is a day's work or a rewrite, and we will not know which until
somebody tries.

Deciders are unaffected: [§7.3](../specs/2026-10-03-rund-design.md) still permits a
decider to own its execution state (DBOS, Temporal) or to be a pure reducer whose
state rund checkpoints.

## What survives from the spike

- **An idempotency key on every tool call is mandatory, in any engine.** Measured:
  across 60 runs on three replicas the tool was requested 61 times and executed 60.
  The replicas really do race.
- **JetStream still carries the event stream** subscribers read. That is fan-out,
  not durability, and DBOS does not replace it.
- **Determinism discipline applies to workflow bodies too** — no wall clock, no map
  iteration order, no fresh ids inside one.
