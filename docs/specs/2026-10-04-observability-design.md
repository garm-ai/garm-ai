# Observability, end to end

**Date:** 2026-10-04
**Status:** designed — nothing built; the plan follows review of this document

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
rund                   rundsvc.invoke            span  garm.run.invoke  tool, caller=<account>, run_id, idempotency
   │  traceparent ──►  (rund's OWN span, not the caller's, forwarded)
tool service           natsserve.answer          span  garm.tool        tool, budget_ms, kind
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
key), `garm.run_id`, `garm.idempotency_key`, `garm.budget_ms`, `garm.error_kind`,
`garm.request_bytes`, `garm.response_bytes`. **Never a payload, never a field of
one.** Spans and logs cross a boundary the request bytes were never meant to
cross; a property below asserts that no attribute on any span carries input or
output bytes.

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

`natsserve.correlationID()` and `rundsvc`'s equivalent read the trace id from the
span on `ctx` and fall back to a random id only when there is no span — the open
server some tests use. The wire format does not change: `invokev1.Error.id` is
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

Stdout stays, for a laptop and for a container's log collector. Nothing is
logged *only* to OTLP.

---

## 4. Metrics

Instruments, all under the `garm.` namespace, all with the OTel semantic shape
(a counter is monotonic, a histogram has buckets, an up-down counter is a gauge):

| instrument | kind | attributes | answers |
|---|---|---|---|
| `garm.tool.calls` | counter | `tool`, `kind` (`OK` or the error kind) | how many, and how many failed how |
| `garm.tool.duration` | histogram, ms | `tool` | how slow, per tool, with percentiles |
| `garm.tool.inflight` | up-down counter | `tool` | what is being answered now |
| `garm.tool.budget_exceeded` | counter | `tool` | which declarations are lies |
| `garm.run.invocations` | counter | `tool`, `caller`, `kind` | **who is generating load**, and what they get back |
| `garm.run.duration` | histogram, ms | `tool`, `caller` | how slow, per caller |
| `garm.service.drain` | counter | `service`, `queued` | how many calls a deploy drained, and whether any were waiting |

**`$SRV.STATS` is the bus-native view of `garm.tool.calls` and
`garm.tool.duration`** — requests and processing time per endpoint, already
there, read with `nats micro stats`. It is not the metrics pipeline for two
reasons: it is a snapshot a person asks for, not a series a backend keeps; and
its `num_errors` is not the tool's error count (§5). No `StatsHandler` is added
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
catch. The test pings from a credential in the service's own account; discovery
is not exported across accounts, and §11 says so.

---

## 6. Configuration — the standard variables, and nothing else

| variable | meaning |
|---|---|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | the base URL. The exporters append `/v1/traces`, `/v1/metrics`, `/v1/logs` themselves |
| `OTEL_EXPORTER_OTLP_HEADERS` | `key=value,...` sent on every export — this is where a backend's authentication goes |
| `OTEL_SERVICE_NAME` | overrides the process's name; defaults to `rund`, the service's configured name, or the caller's |
| `OTEL_SDK_DISABLED` | `true` turns everything into a no-op |

**No endpoint means no exporter**, and the startup line says so: `observability
exporter=none` — the standing rule that effective configuration is logged,
defaults included, so nobody guesses which value is in force. No flags duplicate
these; the OTel variables are the contract every collector and backend already
reads.

**OpenObserve, concretely**, is `OTEL_EXPORTER_OTLP_ENDPOINT=https://<host>/api/<org>`
and `OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <base64 email:password>`. Its
ingest paths are `/api/<org>/v1/traces` and the same pattern for the other
signals, which is exactly what the exporters derive from the base. That is the
whole of the backend's involvement, and it is a deployment's two lines.

---

## 7. One package: `observe`

```go
// Start configures the global tracer, meter and log providers from the OTEL_*
// environment and returns the function that flushes and stops them.
func Start(ctx context.Context, service string) (shutdown func(context.Context) error, err error)
```

Used by `cmd/rund`, by `natsserve` through its `Config`, and by a caller that
wants its calls traced (`natsconn.Connect` does it for the commands). `serve`,
`call`, `declared` and generated code import nothing from it: the no-broker check
gains an OTel line so that stays true. Instruments are created once, in `observe`,
and handed to `rundsvc` and `natsserve`; a package that makes its own meter is
the "one idea, two implementations" this repository exists to stop.

**Dependencies, pinned:** `go.opentelemetry.io/otel` and `otel/sdk` v1.47.0 (stable),
`otel/sdk/log` v1.47.0, the three `otlp*http` exporters (traces and metrics at
v1.47.0; **logs at v0.23.0**), and `contrib/bridges/otelslog` **v0.21.0**. The two
pre-1.0 modules are the logs pipeline. Stated rather than hidden: if either breaks
on an upgrade, traces and metrics do not, and logs still reach stdout.

---

## 8. What changes in the repository

| | change |
|---|---|
| `observe` (new) | `Start`; the instruments; the `slog` handler that stamps ids; the readiness state and `/livez` `/readyz` |
| `natscall` | starts the caller's span; injects it on the request |
| `rundsvc` | continues the span; records `garm.run.*`; **injects `rund`'s own span context on the tool call, not the caller's** |
| `natsserve` | continues the span into the handler's `ctx`; records `garm.tool.*`; the error id is the trace id; readiness true after `Start`, false on drain |
| `natsmicro` | reports drain counts; exposes "started" and "draining" for readiness |
| `serve` | `Wire(err, id)` unchanged; `Internal`'s message unchanged — the id just means more |
| `cmd/rund`, `cmd/garmctl`, examples | `observe.Start` at the top of `main`; `--health` |
| `internal/estate` | an in-memory exporter the tests assert against; health on |
| `mise.toml` | `no-broker` also refuses OTel in `serve`, `call`, `declared`, generated code |
| `docs/guide.md` | the two OpenObserve lines; what a trace looks like |

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
10. **Generated code and `serve` import no OTel package.** The `no-broker` check,
    extended.
11. **A tool author can reach the span.** A handler that reads the span context
    from its `ctx` sees a valid trace id.
12. **The bus and the listener agree.** For a service in the estate,
    `$SRV.PING.<name>` gets a reply exactly when `/readyz` returns 200, checked
    before `Start` (no reply, 503), after `Start` (reply, 200) and after `Serve`
    has begun to drain (no reply, 503).

---

## 10. Migration order

1. `observe` and the instruments, with no process using them: properties 7, 8.
2. Health: `natsmicro` exposes started/draining; `observe` serves the endpoints;
   the estate turns them on. Properties 6, 12.
3. The trace, outside in: `natscall` starts it, `rundsvc` continues and re-injects,
   `natsserve` continues into the handler. Properties 1, 5, 9, 11.
4. The error id becomes the trace id. Property 2.
5. Metrics on both services. Property 4.
6. Logs join: the stamping handler and the bridge. Property 3.
7. The commands call `observe.Start`; the guide gains its two lines.

Steps 1–6 are entirely inside the repository and testable against an in-memory
exporter. Nothing here touches a running system; a deployment adds two
environment variables.

---

## 11. What this does not do

- **It does not sample.** Every call is traced. A policy arrives when volume
  demands one.
- **It does not re-export `$SYS`.** The bus's per-account view needs the system
  account, which nothing in the data path holds; a sidecar is a deployment
  component.
- **It does not put a payload anywhere.** Property 9 is the enforcement, and it
  is the one property here that is a security property.
- **It does not alert or dashboard.** Those are OpenObserve's, built on the
  instruments above; the names in §4 are the contract they build on, and
  renaming one is a breaking change to a dashboard nobody here can see.
- **It does not trace the catalogue load or the generator.** Those are not calls.
- **It does not export `$SRV` discovery across accounts.** A PING reaches the
  services in the pinger's account; an operator who wants one view of every
  service pings from each account, or waits for the step that decides whether
  discovery is a thing GARM should import from TOOLS.

---

## 12. Open questions

- **Histogram buckets.** The OTel defaults top out at 10 s; a tool's budget may be
  larger. Explicit buckets keyed on the budgets the catalogue declares would be
  more honest, and would make the histogram change when the catalogue does.
- **The caller's span across a reconnect.** `natscall` retries once on *no
  responders*; whether that is one span with a retry event or two spans is a
  detail the first trace will settle.
- **`traceparent` on the tool call when there is no span.** The open server tests
  have no tracer; `ToolCaller` must still forward *something* or forward nothing,
  and the choice should not depend on whether `observe.Start` ran.
