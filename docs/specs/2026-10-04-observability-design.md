# Observability, end to end

**Date:** 2026-10-04
**Status:** built as step 9e, per `docs/plans/2026-10-04-observability.md`; six decisions
settled in review (§12)

**Spec for:** one trace per call across every process, metrics that answer *is it
up, how slow is it, who is generating load*, logs that join their traces, and the
health endpoints a scheduler needs — all through OpenTelemetry over OTLP, to
OpenObserve.

**Decided in conversation, recorded here:** everything through OTLP; no
Prometheus endpoint; OpenObserve is the backend. The code knows none of that
except OTLP.

**Why it is its own slice:** the C-level review graded operability **D** —
*"nobody can answer is it up, how slow is it, which caller is generating load
without reading stdout"* — against an engineering discipline it graded **A**.
This closes that gap, and it is a slice because it touches every process and the
wire, and getting the shape wrong is paid for on every later call.

---

## 0. The three questions, and what answers each

| question | answered by |
|---|---|
| **is it up?** | a readiness endpoint that is true only when the process can actually answer, and a liveness one that is true while it is running at all (§5) |
| **how slow is it, and where?** | one trace per call, with a span in every process it crosses (§1), and a latency histogram per tool and per caller (§4) |
| **who is generating load?** | the caller's account on every `rund` span and metric — the identity step 9d placed in the subject, now surfaced (§1, §4) |
| **what went wrong, for this call?** | the id a caller is told to quote **is the trace id** (§2), so quoting it opens the trace |

One standard carries all of it: **OpenTelemetry**, exported over **OTLP/HTTP** to
whatever is at `OTEL_EXPORTER_OTLP_ENDPOINT`. The code contains no backend's name.

---

## 1. One trace per call

A call is one trace. Three processes contribute spans to it, and the W3C
`traceparent` already in the envelope is how it crosses between them — today it
is carried and continued by nothing; this makes it mean something.

```
caller process         natscall.Invoke           span  garm.call        tool=<name>
   │  traceparent ──►
rund                   rundsvc.invoke            span  garm.run.invoke  tool, caller=<account>, caller_name, run_id, idempotency
   │  traceparent ──►  (rund's OWN span, not the caller's, forwarded)
tool service           natsserve.answer          span  garm.tool        tool, deadline_ms, kind
   │
                       the handler               ctx carries the span; the author may add to it
```

**Where each span starts.**

- `natscall` starts the caller's span from the caller's `ctx`, so a caller that is
  already inside a trace of its own — a web request, a batch step — gets this
  call as a child of it. Generated client code imports only `call` and stays
  OTel-free; the span lives in the transport package.
- `rund` *continues* the incoming context into `garm.run.invoke`, and the request
  it then makes to the tool carries **`rund`'s span context**, not the caller's
  forwarded one. Today `ToolCaller` forwards the caller's `traceparent` verbatim,
  which would make the tool a sibling of `rund` rather than its child; that is a
  correction this spec makes.
- `natsserve` continues into `garm.tool`, and the handler's `ctx` carries that
  span. A tool author who wants to add attributes imports the OTel API themselves;
  nothing is forced on a tool module, and `serve` stays as thin as it is.

**Attributes, and the rule about them.** `garm.tool`, `garm.caller` (the account
key), `garm.caller_name` (§1.1), `garm.run_id`, `garm.idempotency_key`,
`garm.deadline_ms` (the tool's declared time budget, under the name `natsserve`
enforces it by — *budget* is reserved for `rund`'s run budgets, tokens and depth
and cycles, which this spec does not define), `garm.kind` (`OK` or the error
kind; one key, so a dashboard filters on one attribute), `garm.request_bytes`,
`garm.response_bytes`. **Never a payload, never a field of
one.** Spans and logs cross a boundary the request bytes were never meant to
cross; a property below asserts that no attribute on any span carries input or
output bytes.

### 1.1 Who the caller is

`garm.caller` is the caller's **account public key** — the one the server placed
in the subject, so it is exact and unforgeable, and a 56-character string nobody
reads. The manifest knows the names (`studio`, `batch`) because `garmctl topology`
issued them; `rund` must not read the manifest. So `garmctl topology` writes one
more public artefact beside the credentials, `callers.json` — the `name ↔ account`
pairs and nothing secret — and `rund` takes it as `--callers`. A known account is
labelled with both `garm.caller` and `garm.caller_name`; an unknown one, or a
missing file, is labelled by key alone and **never dropped**. The key is the
identity; the name is a label that degrades to the key.

### 1.2 The caller's `traceparent` is trusted as correlation, never as attribution

`rund` *continues* the caller's trace: `garm.run.invoke` is a child of whatever
the envelope carried. That is what makes one call one trace and the quoted id
open it. It also means the caller chooses the trace id, and a careless or
compromised caller can reuse one, borrow another caller's, or send garbage.

That is accepted, because a trace id is **correlation**. **Attribution** is
`garm.caller`, and it comes from the server, not the envelope: filtering by caller
is right whatever the trace id says, and a hostile caller can confuse a trace view
but never who did what. A malformed header is rejected by the W3C propagator and
`rund` starts a fresh trace, with `garm.caller` set as always (property 16).
Recording the caller's trace as a *link* instead — `rund` always owning the trace
— is the right move the day callers are untrusted parties; that day the account
model has changed too.

**Across the one retry.** `natscall` retries once on *no responders*. That is
**one span** with a `retry` event carrying the reason, not two: a caller made
one call.

**When there is no tracer.** `ToolCaller` injects whatever span is on its `ctx`
through the propagator. With no span — the open server tests, a process that
never called `observe.Start` — the propagator injects nothing and `rund` forwards
nothing. The current verbatim forward of the caller's header goes; it was the
one way the tool could end up a sibling of `rund` rather than its child.

**Sampling.** Every call, for now. The volume is one span per process per call
and the backend is the deployment's; a sampling policy is a decision for the day
volume costs more than the traces are worth, and it is one line in `observe` when
that day comes.

---

## 2. The error id is the trace id

Today an `INTERNAL` error says *"quote the id when reporting this"* and the id is
sixteen random hex characters that an operator greps logs for. If a span is
active, **the id becomes the trace id**. Quoting it then opens the whole trace in
every process the call crossed, and the log lines joined to it (§3).

`natsserve.correlationID()` reads the trace id from the span on `ctx` and falls
back to a random id only when there is no span — the open server some tests use.
**`rund`'s error id stays the run id**: a run is the durable thing a caller can
`Fetch`, and `rund`'s span carries both `garm.run_id` and the trace id, so quoting
either finds the trace. The wire format does not change: `invokev1.Error.id` is
still a string, and a caller that never heard of tracing still has something to
quote.

---

## 3. Logs that join their traces

`slog` stays the logging API; nothing a tool author or `rund` writes changes. Two
things are added underneath:

- a handler that stamps `trace_id` and `span_id` onto every record written while
  a span is active, so a log line and its trace are one click apart in the
  backend;
- the `otelslog` bridge, so records are also **exported** over OTLP as log
  signals, correlated with the traces by the same ids.

**OTLP is the shipped log; stdout is for a human at a terminal.** Stdout stays,
as text, for a laptop and for a crash nobody could export. A deployment that also
tails stdout into the backend gets every line twice — the guide says so in one
sentence, and that sentence is the whole fix. If the pre-1.0 logs exporter ever
misbehaves, the fallback is stdout-only JSON through a collector; the stamping
handler makes that work unchanged.

---

## 4. Metrics

Instruments, all under the `garm.` namespace, all with the OTel semantic shape
(a counter is monotonic, an up-down counter is a gauge). **No histogram.** Every
call is traced, so every span already carries its exact duration and the backend
computes percentiles from spans; a latency histogram would be a bucketed copy of
information the traces hold in full, and its buckets a contract chosen at the
source that the backend cannot undo. It earns its place the day sampling arrives
and spans stop being the complete record — one instrument added then, not a
contract changed now.

| instrument | kind | attributes | answers |
|---|---|---|---|
| `garm.tool.calls` | counter | `tool`, `kind` (`OK` or the error kind) | how many, and how many failed how |
| `garm.tool.inflight` | up-down counter | `tool` | what is being answered now |
| `garm.tool.deadline_exceeded` | counter | `tool` | which declared time budgets are lies |
| `garm.run.invocations` | counter | `tool`, `caller`, `caller_name`, `kind` | **who is generating load**, and what they get back |
| `garm.service.drain` | counter | `service`, `queued` (bool) | how many drains, and whether any call was waiting at the time — a bool, so the series is bounded; the count is on the log line |

**`$SRV.STATS` is the bus-native view of `garm.tool.calls`** — requests and
processing time per endpoint, already there, read with `nats micro stats`. It is
not the metrics pipeline for two reasons: it is a snapshot a person asks for, not
a series a backend keeps; and its `num_errors` is not the tool's error count (§5). No `StatsHandler` is added
in this slice — the OTLP instruments are the one place a number is kept.

**The per-account figures NATS already keeps** — connections, messages, bytes per
account, over `$SYS` — are the bus's own view of *who is generating load* and need
no code to exist. They are **not** re-exported in this slice: `rund` must not hold
the system-account credential (identity spec §6), and a sidecar that reads `$SYS`
and exports it is a deployment component, not this repository's. Named here so
nobody builds it twice.

---

## 5. Health

A scheduler needs two answers over HTTP, so each process gets a small, optional
listener:

- `GET /livez` — 200 while the process is running. Nothing more; liveness is
  "restart me if this stops answering".
- `GET /readyz` — 200 only when `Start` has returned (every subscription flushed,
  the gate passed) **and** the connection is connected; 503 otherwise, and 503
  again once `Serve` begins to drain, so a scheduler stops sending work to a
  process that has stopped accepting it.

Off unless `--health <addr>` is given; the test estate turns it on to prove it.

**What NATS micro's contract gives, and what it does not.** Every service built
on `micro.AddService` — every tool service and `rund`, since both go through
`natsmicro` — answers the three verbs NATS ADR-32 defines: `$SRV.PING`,
`$SRV.INFO`, `$SRV.STATS`, each also at `.<name>` and `.<name>.<id>`. **There is
no health verb.** What the three give, read from nats.go v1.54.0:

- **PING answers while the service's subscriptions are live, and only then.**
  `Stop()` drains the verb subscriptions together with the endpoints, so from
  the bus's side *answers PING* and *answers calls* are one state, by
  construction. That is readiness in the bus's own terms, and `nats micro ls`
  reads it.
- **STATS** carries, per endpoint, `num_requests`, `processing_time` and
  `average_processing_time` — real, maintained by `micro` around every handler —
  and `num_errors`, which counts **only NATS-level errors** (a permissions
  violation, a slow consumer) and never a tool error. A tool error is a normal
  reply carrying an `Error` envelope, which `micro` cannot see; whoever reads
  `num_errors` as the error rate reads zero forever. Named here so nobody does.
- **INFO** lists the endpoints and their subjects.

So the bus already carries a readiness signal, free. It is not enough on its own
because the thing that restarts or routes to a process — a scheduler, a load
balancer — speaks HTTP, holds no NATS credential, and sits in no account. Hence
the listener. The two must tell the same truth, and that is a property, not a
hope: **`$SRV.PING.<name>` answers exactly when `/readyz` is 200**, through
before-`Start`, after-`Start` and draining (§9, property 12). A readiness flag
that disagreed with the bus would be the vacuous check this repository exists to
catch. Discovery is not exported across accounts, and §11 says so.

---

## 6. Configuration — the standard variables, and nothing else

| variable | meaning |
|---|---|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | the base URL. The exporters append `/v1/traces`, `/v1/metrics`, `/v1/logs` themselves |
| `OTEL_EXPORTER_OTLP_HEADERS` | `key=value,...` sent on every export — this is where a backend's authentication goes |
| `OTEL_SERVICE_NAME` | overrides the process's name; defaults to `rund`, the service's configured name, or the caller's |
| `OTEL_SDK_DISABLED` | `true` installs **nothing** — no ids, no bridge, no propagator, nothing added to the wire. Off means off; it is not the same as having no endpoint |
| `OTEL_EXPORTER_OTLP_{TRACES,METRICS,LOGS}_ENDPOINT` | a signal's own endpoint, used as given; any one of them, or the generic one, turns the exporter on, and the startup line names the variables in force |

**No endpoint means no exporter** — but the SDK is still installed, so spans get
ids and three processes' stdout join on one — and the startup line says so:
`observability exporter=none` — the standing rule that effective configuration
is logged, defaults included, so nobody guesses which value is in force. The
final flush is bounded (`otlp.FlushTimeout`, 5 s): a dead backend must not turn
a clean shutdown into a hang past an orchestrator's grace period. With an endpoint the
line is `observability exporter=otlp endpoint=<url> headers=[Authorization]`:
**header names, never values**, and a test asserts the value is absent from the
log (property 14). No flags duplicate these variables, and there is no
headers-file alternative: the variable is the contract every collector and
deployment tool already speaks, and a second path is the debt of the day they
diverge. The credential it carries is the deployment's **shared ingest
credential**, not a per-process identity; per-process tokens are an OpenObserve
configuration when wanted, not a code change.

**OpenObserve, concretely**, is `OTEL_EXPORTER_OTLP_ENDPOINT=https://<host>/api/<org>`
and `OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <base64 email:password>`. Its
ingest paths are `/api/<org>/v1/traces` and the same pattern for the other
signals, which is exactly what the exporters derive from the base. That is the
whole of the backend's involvement, and it is a deployment's two lines.

---

## 7. Two packages: `observe` and `observe/otlp`

```go
// observe: the API side -- Scope, Tracer(), Instruments(), the attribute keys,
// Handler(next slog.Handler), ServeHealth, CallerNames. Imports the OTel API only.

// observe/otlp: the SDK side, and the only importer of it.
// Start configures the global tracer, meter and log providers from the OTEL_*
// environment and returns the function that flushes and stops them.
func Start(ctx context.Context, service string, log *slog.Logger) (stop func(context.Context) error, err error)
```

Two packages rather than one because the import rule below makes one impossible:
`natsserve` must reach the instruments and the slog handler without reaching the
SDK, so what it reaches cannot live beside `Start`.

**Called explicitly, in every `main`** — `rund`, `garmctl`, every example, and a
tool author's own process:

```go
log := slog.New(observe.Handler(slog.NewTextHandler(os.Stderr, nil)))
stop, err := otlp.Start(ctx, "weatherd", log)
defer stop(ctx)
```

Two visible lines are the honest price. `natsserve` and `rundsvc` never configure
anything: they use the **global** tracer and meter through the OTel *API*, which
is a no-op until somebody installs a provider — so an author with their own OTel
setup skips our two lines and their spans still come out. A library that installs
process-global state on an author's behalf is the convenience that becomes a flag,
then an option struct, then a debt.

Hence the import rule, enforced by a check beside `no-broker`: **only
`observe/otlp` imports the OTel SDK and exporters**; `natsserve`, `rundsvc`, `natscall` and
`natsmicro` import the API alone; `serve`, `call`, `declared` and generated code
import no OTel package at all. Instruments are created once, in `observe`, and
handed to `rundsvc` and `natsserve`; a package that makes its own meter is the
"one idea, two implementations" this repository exists to stop.

**Dependencies, pinned:** `go.opentelemetry.io/otel` and `otel/sdk` v1.47.0 (stable),
`otel/sdk/log` v1.47.0, the three `otlp*http` exporters (traces and metrics at
v1.47.0; **logs at v0.23.0**), and `contrib/bridges/otelslog` **v0.21.0**. The two
pre-1.0 modules are the logs pipeline. Stated rather than hidden: if either breaks
on an upgrade, traces and metrics do not, and logs still reach stdout. Also
stated: the HTTP exporters pull `google.golang.org/grpc` and `grpc-gateway` in
transitively (their request types are shared with the gRPC exporters), and
`protobuf` moved 1.36.11 → 1.36.12 with them — the direct list above is not the
whole dependency story.

---

## 8. What changes in the repository

| | change |
|---|---|
| `observe` (new) | the instruments; the `slog` handler that stamps ids; `/livez` `/readyz`; the `callers.json` reader |
| `observe/otlp` (new) | `Start`; `otlptest` records in memory for tests |
| `natscall` | starts the caller's span; injects it on the request |
| `rundsvc` | continues the span; records `garm.run.*`; labels `garm.caller_name` from `--callers`; **injects `rund`'s own span context on the tool call, not the caller's** |
| `natsserve` | continues the span into the handler's `ctx`; records `garm.tool.*`; the error id is the trace id; readiness true after `Start`, false on drain |
| `natsmicro` | `Ready()`; records `garm.service.drain` with the in-flight count |
| `serve` | `Wire(err, id)` unchanged; `Internal`'s message unchanged — the id just means more |
| `cmd/rund`, `cmd/garmctl`, examples | `observe.Start` at the top of `main`; `--health`; `rund --callers` |
| `cmd/garmctl topology` | writes `callers.json` (`name ↔ account`, public) beside the credentials |
| `internal/estate` | one in-memory recorder across the three processes, which is what makes end-to-end linkage assertable |
| `mise.toml` | `no-broker` also refuses OTel in `serve`, `call`, `declared`, generated code; a new `no-sdk` refuses the OTel SDK outside `observe/otlp` |
| `docs/guide.md` | the two `observe.Start` lines; the two OpenObserve variables; what a trace looks like; the double-shipping sentence |

---

## 9. Properties, stated as tests

Each is a test the implementation must carry, and each must be proved to fail
before it is trusted — the rule this repository runs on.

1. **One call is one trace.** Through the estate, a `GetForecast` produces spans
   named `garm.call`, `garm.run.invoke` and `garm.tool` that share one trace id,
   and the tool span's parent is `rund`'s span, not the caller's.
2. **The id a caller is told to quote is the trace id.** An `INTERNAL` error's id
   equals the trace id of the span that produced it.
3. **A log line written during a call carries the trace id.** The estate's captured
   `rund` log has `trace_id=<the trace id of the call>` on the invoke line.
4. **Metrics count what happened.** One successful call increments
   `garm.tool.calls{tool,kind=OK}` and `garm.run.invocations{tool,caller,kind=OK}`
   by one; a refused call increments with its kind.
5. **The caller's account is on the span and the metric.** `garm.caller` on
   `garm.run.invoke` equals the caller's account key — the one the server placed
   in the subject.
6. **Readiness tells the truth.** `/readyz` is 503 before `Start`, 200 after, and
   503 again once `Serve` has begun to drain, while `/livez` stays 200 throughout.
7. **No endpoint, no export, and the startup line says so.** With no
   `OTEL_EXPORTER_OTLP_ENDPOINT`, nothing is sent anywhere and the log carries
   `exporter=none`.
8. **The standard variables are honoured, in OpenObserve's shape.** With the
   endpoint set to a fake receiver and a header configured, spans arrive at
   `<base>/v1/traces` with that header present.
9. **No span attribute carries a payload.** Over every span of a call whose input
   contains a sentinel string, no attribute value contains the sentinel.
10. **Generated code and `serve` import no OTel package, and only `observe/otlp`
    imports the SDK.** The `no-broker` check extended, and a `no-sdk` check
    beside it.
11. **A tool author can reach the span.** A handler that reads the span context
    from its `ctx` sees a valid trace id.
12. **The bus and the listener agree.** For a `natsmicro` service on a bare
    server — lifecycle agreement is not a permissions question —
    `$SRV.PING.<name>` gets a reply exactly when `/readyz` returns 200, checked
    before `Start` (no reply, 503), after `Start` (reply, 200) and after `Serve`
    has begun to drain (no reply, 503).
13. **A caller is named when known and never dropped when not.** With a
    `callers.json` naming `studio`, the span and metric carry
    `garm.caller_name=studio`; a call from an account the file does not name
    carries `garm.caller` and no name, and is counted.
14. **The startup line never carries a header value.** With
    `OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <x>`, the log contains
    `headers=[Authorization]` and does not contain `<x>`.
15. **The one retry is one span.** A call that meets *no responders* once and then
    succeeds produces one `garm.call` span with one `retry` event.
16. **A malformed `traceparent` still yields a complete, attributed trace.**
    `rund` starts a fresh trace, the tool span is its child, and `garm.caller` is
    the server-placed account.

---

## 10. Migration order

1. `observe` and the instruments, with no process using them: properties 7, 8, 14.
2. Health: `natsmicro` exposes started/draining; `observe` serves the endpoints;
   the estate turns them on. Properties 6, 12.
3. The trace, outside in: `natscall` starts it, `rundsvc` continues and re-injects,
   `natsserve` continues into the handler. Properties 1, 5, 9, 11, 15, 16.
3a. The caller's name: `garmctl topology` writes `callers.json`; `rund --callers`
   labels. Property 13.
4. The error id becomes the trace id. Property 2.
5. Metrics on both services. Property 4.
6. Logs join: the stamping handler and the bridge. Property 3.
7. The commands and examples call `observe.Start`; the `no-sdk` check; the guide
   gains its lines. Property 10.

Steps 1–6 are entirely inside the repository and testable against an in-memory
exporter. Nothing here touches a running system; a deployment adds two
environment variables.

---

## 11. What this does not do

- **It does not sample.** Every call is traced. A policy arrives when volume
  demands one.
- **It does not export a latency histogram.** Spans carry exact durations; the
  backend computes percentiles. A histogram arrives with sampling (§4).
- **It does not enforce or define any budget.** Run budgets — tokens, depth,
  cycles — are `rund`'s design; when `rund` enforces one, the exceeded outcome is
  recorded here as a kind, nothing more.
- **It does not re-export `$SYS`.** The bus's per-account view needs the system
  account, which nothing in the data path holds; a sidecar is a deployment
  component.
- **It does not put a payload in any span, metric or log *attribute*, nor in any
  log body the envelope writes.** Property 9 is the enforcement — spans and
  shipped log records both — and it is the one property here that is a security
  property. What it cannot cover is a tool author's own error text: the cause
  chain a handler returns is logged with its id and, from this slice on, shipped
  over OTLP. An error that interpolates an input ships that input. The guide
  says so where authors read it.
- **It does not alert or dashboard.** Those are OpenObserve's, built on the
  instruments above; the names in §4 are the contract they build on, and
  renaming one is a breaking change to a dashboard nobody here can see.
- **It does not trace the catalogue load or the generator.** Those are not calls.
- **It does not export `$SRV` discovery across accounts.** A PING reaches the
  services in the pinger's account; an operator who wants one view of every
  service pings from each account, or waits for the step that decides whether
  discovery is a thing GARM should import from TOOLS.

---

## 12. Decisions settled in review

Asked one at a time, each with a recommendation, each accepted:

| question | decision | the alternative, and why not |
|---|---|---|
| who is "the caller" | account key as identity, name from `callers.json` as label, unknown callers by key (§1.1) | key only — exact but unreadable on a dashboard; name in the JWT — `rund` cannot read account claims without the system account |
| histogram buckets | **no histogram**; latency from spans (§4) | OTel defaults stop at 10 s; per-budget buckets change with the catalogue; a fixed set is a contract the backend cannot undo |
| who turns observability on | explicit `observe.Start` in every `main`; only `observe` imports the SDK (§7) | `natsserve` installing global providers — fights an author's own setup, becomes a flag |
| the backend credential | `OTEL_EXPORTER_OTLP_HEADERS` only; log header names, never values (§6) | a headers-file flag — two ways to configure one thing |
| the logs pipeline | OTLP is the shipped log, stdout stays text for humans; the guide warns against tailing both (§3) | stdout-only JSON via a collector — makes a collector required for one signal of three |
| the caller's `traceparent` | continued, as correlation; `garm.caller` from the server is attribution (§1.2) | links — no caller can pollute another's trace, but the caller loses the one id |

Three details settled without a question, because they had one answer: the retry
is one span with an event (§1.2); `ToolCaller` forwards only what the propagator
injects, which is nothing when there is no span (§1.2); the health listener is
off unless `--health <addr>` names an address (§5).
