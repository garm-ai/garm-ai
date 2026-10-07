# Push: a subscriber sees a run without polling

**Date:** 2026-10-07
**Status:** designed — nothing built; the plan follows review of this document

**Spec for:** the event feed of a run. A run emits events as it goes — its stage,
each step's outcome, its end, and later a decider's questions and a streamed
answer's chunks — a subscriber receives them as they happen, and a subscriber
that was not there receives what it missed. Built on the run store
([spec](2026-10-05-run-store-design.md)); the thing the authority model's
approval flow and a chat front end both need before they can exist.

**What this slice is:** one `Event` message and one `Events` verb on the wire; the
workflow writing every event to a DBOS stream and `rund` publishing each on an
account-token stream export; `Follow` in the generated client; `--follow` on
`garmctl fetch`. Not `Answer`, not a decider, not tool-side streaming — §12.

Decided in conversation on 2026-10-06 and 2026-10-07, one question at a time;
§9 records each decision and the alternative it beat.

---

## 0. One sentence per thing that changes

A run **writes every event to a DBOS stream**, which is its record. `rund`
**publishes each event live** on `garm.run.v1.<OWNER>.out.<run_id>.<seq>`, a
stream export the owner's account imports and nobody else can. A subscriber
that missed events calls **`Events(run_id, after, wait)`** and gets them from
the record, through `rund`, with the ownership check `Fetch` has. The generated
client's **`Follow`** stitches catch-up to live by sequence number so no caller
writes that twice. An event is **a word and a reference, never a payload**,
with one bounded exception, a `chunk` of streamed text, capped at 4 KB. **`done`
carries no result**: results are fetched. Publishing the live copy is **best
effort** and never fails the run; writing the record is not.

---

## 1. The record: a DBOS stream per run

The workflow writes each event with `WriteStream(ctx, "events", ev)`. A DBOS
stream is append-only, ordered by offset, part of the workflow's durable state
and checkpointed like a step: a replayed workflow does not write an event
twice, and a recovered run continues its sequence where it stopped. The stream
is closed by `CloseStream` when the workflow returns, so a reader can tell "no
more" from "not yet".

The **sequence number** of an event is its stream offset plus one, so `after: 0`
means "from the start" on the wire and no event is numbered zero. It is assigned
at write, by DBOS, once; the live copy carries the same number. That is what
makes the stitch in §4 exact rather than heuristic.

The stream is read by `rund` only, with `ReadStream` from an offset for
catch-up (§4). No consumer reads DBOS directly in this slice; the research note
says a `Client` could, and §12 says why not yet.

Retention is the run's: when a run is deleted its stream goes with it. A
retention policy is a later slice.

## 2. The live copy: an account-token stream export

On the request side a caller publishes a flat subject and the server rewrites it
with the caller's account key, so `rund` reads an identity nothing a caller
writes can forge (identity spec §3). Push is the same mechanism in the other
direction. NATS applies `account_token_position` to stream exports as it does to
service exports (`accounts.go`, checked 2026-10-05).

- `rund`'s account (`GARM`) exports the **stream** `garm.run.v1.*.out.>` with
  the account token at position four.
- Every caller account imports it. The server permits an import of that stream
  only for subjects carrying the importer's own key at position four.
- `rund` publishes event `seq` of run `r`, owned by account `A`, to
  `garm.run.v1.<A>.out.<r>.<seq>`, with the `Event` as the body and no headers
  a subscriber needs. The owner is what the run store recorded at `Start`.
- A caller subscribes to `garm.run.v1.out.<r>.>` in its own account; the import
  maps it; it receives exactly its own runs' events. Another account subscribing
  to the same run id receives nothing: the subject it would need carries a key
  it cannot import.

Ownership on the bus is therefore structural, as `rund.visible` is for `Fetch`
(run-store spec §4), and the authority model replaces both in one place when a
team may watch a run it did not start.

The generator derives one more import per caller account from the catalogue,
which lands in the next issuance as a reissue of every caller credential, once.
`garmctl topology` says nothing new: the export is the shape it already derives
for `invoke`.

Core NATS, not JetStream: the bus delivers to whoever is subscribed **now**, and
keeps nothing. A subscriber that was not there has the record (§4). This is
decision one, and the reason JetStream retention is not a second thing an
operator sizes.

## 3. The wire

```proto
// garm/run/v1/run.proto -- additions; everything existing is unchanged.

service RunService {
  rpc Invoke(InvokeRequest) returns (InvokeResponse);
  rpc Fetch(FetchRequest) returns (FetchResponse);
  // Events returns a run's events after a cursor, in order, and holds the
  // request until there is one when there is none yet. The run's owner only.
  rpc Events(EventsRequest) returns (EventsResponse);
}

message EventsRequest {
  string run_id = 1;
  // Return events with seq > after. 0 is the start.
  uint64 after = 2;
  // How long rund may hold the request when no event is past the cursor yet.
  // Zero answers at once. Capped at 30s, as Fetch's wait is.
  google.protobuf.Duration wait = 3;
}

message EventsResponse {
  // In sequence order, at most 256; a caller a long way behind pages.
  repeated Event events = 1;
  // True once the run's stream is closed and every event is before or in this
  // reply: there will be no more.
  bool closed = 2;
}

// One thing that happened in a run. A word and a reference, never a payload --
// with ONE bounded exception, chunk, whose text is capped. done carries no
// result: a result can be large, is already in the run, and is fetched with
// the ownership check and the typed decoding Fetch has.
message Event {
  string run_id = 1;
  uint64 seq = 2;                       // the stream position, from 1; assigned once at write
  google.protobuf.Timestamp at = 3;
  oneof kind {
    Stage    stage    = 10;             // the stage word, as Fetch shows it: queued, calling:<i>, done
    Step     step     = 11;             // a tool-call step's key and outcome kind, no bytes
    Progress progress = 12;             // a short text and an optional fraction (a decider's)
    Question question = 13;             // a question's id and text, for a decider that needs input
    Chunk    chunk    = 14;             // a piece of a streamed answer, in order, ≤ 4 KB of text
    Done     done     = 15;             // the terminal state; the result is fetched, not pushed
  }
}

message Stage    { string stage = 1; }
message Step     { string key = 1; garm.invoke.v1.ErrorKind kind = 2; string tool = 3; }
message Progress { string text = 1; optional float fraction = 2; }
message Question { string id = 1; string text = 2; }
message Chunk    { string text = 1; }        // > 4 KB is refused at write; larger content is an artefact reference in a Progress or Question
message Done     { RunState state = 1; }
```

Additive to `run.proto`: a new RPC, four new messages; `buf breaking` stays
green. `Progress`, `Question` and `Chunk` are defined now so the wire does not
change when a decider arrives; nothing emits them in this slice.

The same `Event` bytes are what the workflow writes to the stream and what
`rund` publishes on the subject: one encoding, so catch-up and live are
indistinguishable except by where they came from.

## 4. Catch-up, and `Follow`

`Events` is a verb beside `Fetch`, not a widening of it: `Fetch` is a run's
state and outcome, one thing; `Events` is a sequence with a cursor; the two have
different caps, holds and sizes, and one verb would carry two contracts.

- `rund` reads the stream from offset `after` (`ReadStream` with
  `WithReadStreamFromOffset`), returns up to 256 events and whether the stream
  is closed.
- With nothing past the cursor and `wait > 0`, `rund` holds the request until an
  event arrives or `wait` elapses, capped at `MaxFetchWait` (30 s), re-reading
  on the same 200 ms cadence the stage wait uses (`rundbos.StagePoll`); one
  request held, never a poller on the bus.
- Ownership: the run store's `visible` check, the same as `Fetch`. A run the
  caller did not start has no events: `NOT_FOUND`, indistinguishable from an
  unknown id. With no store, `Events` answers `NOT_RETAINED`-equivalent: an
  empty, closed reply.

The generated client gains **`Follow(ctx, ref) iter.Seq2[*Event, error]`**, which
does the stitch once for everyone:

1. subscribe to `garm.run.v1.out.<run>.>` in the caller's account;
2. call `Events(after: 0)` until `closed` or the batch is short, yielding each;
3. switch to the live subscription, dropping any event whose `seq` is at or
   below the last yielded, yielding the rest;
4. on a disconnect, go to 2 with the last `seq` as the cursor;
5. return after yielding `done`.

Subscribe-then-catch-up is the order that cannot miss: an event published
between steps 2 and 3 is either in the batch or in the subscription's buffer,
and the sequence number says which to keep. A caller that wants history only —
a batch job an hour later — calls `Events` alone and the bus is never touched.

`garmctl fetch --follow` prints events as they arrive and returns on `done`;
with `--after N` it starts from a cursor.

## 5. What the workflow emits, and the publish rule

In this slice the `invoke` workflow emits, in order: `stage queued` is not an
event (nothing is running yet to write one; `Fetch` reports it from DBOS's
status, as today), then for each action `stage calling:<i>`, the tool-call
step, `step {key, kind, tool}`, then `stage done` and `done {state}`. A tool's
refusal is a `step` with the tool's kind and a `done {FAILED}`; a cancelled run
emits `done {CANCELLED}` from the cancel path.

Emitting is two acts of different standing, inside one step:

1. **Write the record.** `WriteStream` — durable by DBOS's rules, checkpointed,
   not repeated on replay. If it fails, the step fails, and the run with it:
   a run with no record of what it did is not a run this platform keeps.
2. **Publish the live copy.** A core NATS publish on the owner's subject, best
   effort: a publish that fails or finds no bus is logged and counted
   (`garm.run.events{outcome=delivered|dropped}`) and **never fails the run**,
   because a subscriber that missed it has the record. On a replay the step is
   checkpointed and the publish does not repeat: live means now, and now has
   passed.

The `stage` DBOS event (`SetEvent`) stays as it is, the latest word a `Fetch`
shows without reading history; the `Stage` event in the stream is the history
of it.

## 6. Ownership and what a subscriber cannot learn

A subscriber learns about a run only if its account started it, by two
independent mechanisms: the import on the bus (§2) and `visible` on `Events`
(§4). Neither depends on the other being right. An event carries no input, no
result and no tool reply; a `step` carries a key and a kind; a `chunk` carries
text a decider chose to show. Spans and logs keep their rule unchanged: no
payload, and the `chunk` exception is the wire's, not theirs.

## 7. The generator

`topology.Generate` derives, for `GARM`, a stream export `garm.run.v1.*.out.>`
with `AccountTokenPosition: 4`, and for each `CALLER-<name>`, an import of it
at `garm.run.v1.<key>.out.>` mapped to `garm.run.v1.out.>`, plus the
subscribe permission `garm.run.v1.out.>` on the caller's credential. One
issuance reissues every caller credential (its permission set changed); the
manifest's delta says so. `rund`'s credential gains publish on
`garm.run.v1.*.out.>`.

## 8. Configuration, `rund`, `garmctl`

No new flag. `rund` publishes from the same connection it serves on. The
counter joins `observe.Instruments`. `garmctl fetch` gains `--follow` and
`--after`. `scripts/e2e.sh` follows the async report run live and then, after
it has finished, follows it again from zero to prove catch-up: both runs print
`stage calling:0`, `step weather.v1.schedule_report OK`, `stage done`,
`done SUCCEEDED`.

## 9. Decisions settled in conversation

| decision | chosen | beat |
|---|---|---|
| where a late subscriber gets history | DBOS is the record, the bus is live only; catch-up through `rund` | the bus replays from a JetStream stream per account: a second durable copy, retention to size, the artefact rule under strain |
| how the live copy reaches only the owner | an account-token stream export, owner placed in the subject by `rund`, imported per caller account | `rund` filtering per subscriber by a permission per run id written at subscription time |
| what an event carries | one `Event`, six kinds, a 4 KB chunk cap, larger content as an artefact reference, `done` without the result | events as payload carriers; a result pushed on completion |
| how catch-up is read | a separate `Events` verb with a cursor and a capped hold; `Follow` in the client doing the stitch; `--follow` on `garmctl fetch` | widening `Fetch` with a cursor |
| scope and the publish rule | emit `stage`, `step`, `done` from the workflow; record first and durable, live second and best effort, never failing the run; 256 per batch | failing a run when the bus is unreachable; emitting `question`/`chunk` before a decider exists |

## 10. Properties, stated as tests

1. **An async run's events are recorded in order with sequence numbers from 1**,
   `stage calling:0`, `step`, `stage done`, `done SUCCEEDED`, readable by
   `Events(after: 0)` after the run has finished.
2. **A live subscriber receives the same events, same numbers**, as they happen.
3. **A late subscriber gets what it missed**: `Follow` started after the run
   finished yields the full sequence from the record and returns on `done`.
4. **`Follow` started mid-run yields every event exactly once**, in order,
   across the catch-up/live boundary — proved with a tool blocked at step 0 so
   the boundary falls inside the run.
5. **A disconnect resumes from the last sequence** with no duplicate and no gap.
6. **Another account subscribing to the run's subject receives nothing**, on the
   real bus with the real import.
7. **Another account's `Events` is `NOT_FOUND`**, indistinguishable from an
   unknown run.
8. **A tool's refusal is a `step` with the tool's kind and a `done FAILED`.**
9. **A cancelled run emits `done CANCELLED`.**
10. **`Events` with `wait` returns when an event arrives**, not when the wait
    elapses, and returns on the cap when none does.
11. **A bus that cannot be published to drops the live copy, counts it, and the
    run finishes with its record complete.**
12. **A replayed run does not publish twice**: in the recovery test, the live
    subscriber sees `step` once.
13. **A chunk over 4 KB is refused at write**, with the limit in the error.
14. **`done` carries no result**, and `Events` never returns input or result
    bytes for any kind.
15. **The event feed carries no payload** for the sentinel-input test, on the
    bus and in the record.
16. **`buf breaking` is green**; the existing `Invoke`/`Fetch` wire is untouched.
17. **Only `rundbos` imports DBOS**: `Follow`, the generated code and
    `natscall` reach nothing from `dbos-inc`.
18. **One issuance after the generator change reissues every caller
    credential and no other**, and the walk shows the new import.

## 11. Migration order

1. The wire: `Event`, `EventsRequest/Response`, `Events` RPC; `buf breaking`.
2. The record: the workflow emits to the DBOS stream; `Store.Events(id, after,
   wait)`; `Engine.Events` with ownership; `rundsvc` serving it. Properties 1,
   7, 8, 9, 10, 13, 14.
3. The live copy: the generator's export and imports; `rund` publishing inside
   the emit step with the best-effort rule and the counter. Properties 2, 6, 11,
   12, 18.
4. `Follow` in the generated client and `natscall`; `garmctl fetch --follow`.
   Properties 3, 4, 5, 15, 17.
5. The quick start's follow, live and catch-up; docs.

Steps 1–4 are inside the repository and need no container.

## 12. What this does not do

- **`Answer`.** `Send` into the run, the reply to a `question`. Arrives with the
  first decider that asks one; the wire's `Question` is defined here so it can.
- **`question`, `progress`, `chunk` emitted by anything.** A decider's.
- **Tool-side streaming.** A tool still answers once. A model's tokens will come
  from the decider's own model step inside `rund`, which is where `chunk` is
  written from; a server-streaming RPC on a tool stays refused by the generator.
- **A consumer reading DBOS directly** with a `Client` credential, bypassing
  `rund`. Possible, and the research note says so; not before the authority
  model says who may.
- **A team watching a run it did not start.** The authority model.
- **JetStream.** Nothing in this slice needs a stream the bus keeps; if
  subscribers ever outnumber what `rund`'s catch-up can serve, an export of a
  JetStream stream is additive to §2 and changes nothing the workflow records.
- **Retention.** The run's.
