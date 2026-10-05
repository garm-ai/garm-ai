# Observability, end to end — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One trace per call across caller → `rund` → tool; the id a caller quotes
is that trace's id; logs carry it; counters answer *how many, failing how, from
whom*; `/livez` `/readyz` agree with `$SRV.PING`; all exported over OTLP to
whatever `OTEL_EXPORTER_OTLP_ENDPOINT` names, and nothing is sent when it is unset.

**Architecture:** Two packages. `observe` is the OTel **API** side — the tracer and
meter scope, the instruments, attribute keys, the `slog` handler that stamps trace
ids and bridges to OTLP, the health listener, the `callers.json` reader. `observe/otlp`
is the only package that imports the OTel **SDK** and exporters: `Start` configures
the global providers from the standard environment. `natscall`, `rundsvc`,
`natsserve` and `natsmicro` use the globals through the API and are no-ops until a
`main` calls `otlp.Start`. Tests install in-memory recorders through
`observe/otlp/otlptest` and assert end-to-end linkage through the estate.

**Tech Stack:** Go 1.26.6 (`mise exec -- go`) · `go.opentelemetry.io/otel`,
`otel/trace`, `otel/metric`, `otel/log`, `otel/sdk`, `otel/sdk/metric`, `otel/sdk/log`,
`exporters/otlp/otlptrace/otlptracehttp`, `exporters/otlp/otlpmetric/otlpmetrichttp`
**v1.47.0** · `exporters/otlp/otlplog/otlploghttp` **v0.23.0** ·
`go.opentelemetry.io/contrib/bridges/otelslog` **v0.21.0** · `net/http` for health.

**Spec:** [docs/specs/2026-10-04-observability-design.md](../specs/2026-10-04-observability-design.md).
§9 is the list of properties, §10 the order, §12 the decisions settled in review.

## Global Constraints

- **A property is not trusted until it has been proved to fail.** Every test added
  here is broken on purpose once. **Commit before probing**, and restore with
  `git checkout -- <file>` — never `cp`, never on an uncommitted tree.
- **Only `observe/otlp` imports the OTel SDK or an exporter.** `natscall`, `rundsvc`,
  `natsserve`, `natsmicro`, `observe` import the API alone. `serve`, `call`,
  `declared`, `images`, `fetch`, `run` and generated code import no OTel package.
  `mise run no-sdk` and the extended `no-broker` enforce both (Task 9).
- **Never a payload on a span, a metric or a log attribute.** Attributes are the
  envelope: tool, caller, run id, idempotency key, deadline, kind, sizes.
- **The caller's `traceparent` is continued** (child), never trusted for
  attribution. `garm.caller` comes from the subject the server rewrote.
- **`ToolCaller` injects `rund`'s own span context.** The verbatim forward of
  `h.Traceparent` is removed. With no span on `ctx` nothing is injected.
- **The one retry is one span** with one `retry` event.
- **No endpoint, no exporter**, and the startup line says `exporter=none`. Header
  **names** are logged, never values.
- **No histogram.** Counters and one up-down counter only (§4).
- **The wire does not change.** `invokev1.Error.id` is still a string; no proto
  edit anywhere in this plan. `buf breaking` stays green trivially.
- **Docs move in the same commit as the fact they state** — `invariants.md` rows
  with their tests, the guide with the flags, the roadmap row when the property
  lands.
- `nats.Header` is `map[string][]string`, so `propagation.HeaderCarrier(http.Header(m.Header))`
  is the carrier on both sides. Use it; do not hand-parse `traceparent`.
- OTel scope name is the module path: `observe.Scope = "github.com/garm-ai/garm-ai"`.

## Review Focus

Inputs the spec implies but no test below exercises directly — the reviewer checks
each; the owning task carries the test named:

1. **A caller that never called `otlp.Start`** (no propagator installed) invokes a
   `rund` that did. Expected: `rund` starts a fresh trace, the tool is its child,
   nothing panics, no `traceparent` header is sent by the caller. Task 7
   (`TestACallerWithoutATracerStillGetsATracedRun`).
2. **`OTEL_SDK_DISABLED=true`** with an endpoint set. Expected: no exporter built,
   startup line `exporter=none disabled=true`, spans have invalid ids, the error id
   falls back to a random one. Task 2 (`TestDisabledMeansNoExporterAndSaysSo`).
3. **A `callers.json` that does not parse, or names an account twice.** Expected:
   `rund` refuses to start and names the file; it does not start with half a map.
   Task 8 (`TestABrokenCallersFileRefusesToStart`).
4. **`/readyz` while the NATS connection is reconnecting.** Expected: 503, because
   `Ready` checks `nc.Status() == nats.CONNECTED`, not only "Start returned". Task 3
   (`TestReadyIsFalseWhileDisconnected`).
5. **A tool handler that panics.** Not this plan's to fix — micro recovers nothing
   today either — but the span must not leak: the `garm.tool` span ends via `defer`.
   Task 6 (`TestTheToolSpanEndsEvenWhenTheHandlerPanics`, which recovers in the
   test's handler wrapper and asserts the span was ended).

---

## File structure

| path | responsibility |
|---|---|
| `observe/observe.go` | `Scope`; `Tracer()`; attribute keys; `Instruments()` (once, from the global meter) |
| `observe/slog.go` | `Handler(next slog.Handler) slog.Handler` — stamps `trace_id`/`span_id`, fans out to the `otelslog` bridge |
| `observe/health.go` | `ServeHealth(ctx, addr, ready func() bool)` — `/livez`, `/readyz` |
| `observe/callers.go` | `CallerNames` (account → name), `LoadCallerNames(path)` |
| `observe/otlp/otlp.go` | `Start(ctx, service, log)` — providers from `OTEL_*`, propagator, startup line |
| `observe/otlp/otlptest/otlptest.go` | `Install(t) *Recorder` — in-memory spans, metrics, logs on the globals |
| `natsmicro/natsmicro.go` | `Ready()`, `draining`, in-flight count, drain counter |
| `natscall/natscall.go` | `garm.call` span, inject, retry event |
| `rundsvc/rundsvc.go` | extract, `garm.run.invoke` span, metrics, caller name, inject own context |
| `natsserve/natsserve.go` | extract, `garm.tool` span, metrics, error id = trace id |
| `topology/callers.go` | `CallerNames(out *Output) (map[string]string, error)` |
| `cmd/garmctl/topology.go` | writes `callers.json` |
| `cmd/rund/main.go`, `examples/cmd/weatherd/main.go`, `examples/cmd/forecast/main.go`, `cmd/garmctl/main.go` | `observe.Handler`, `otlp.Start`, `--health`, `--callers` |
| `internal/estate/estate.go` | installs `otlptest`, exposes `Recorder()`, `CallerNames` |
| `internal/estate/observability_test.go` | properties 1, 2, 3, 4, 5, 9, 13, 16 and review-focus 1 |
| `mise.toml` | `no-broker` extended; `no-sdk` |
| `docs/guide.md`, `docs/invariants.md`, `docs/roadmap.md`, `docs/performance.md` | the facts, as they land |

---

### Task 1: `observe` — the API side

**Files:**
- Create: `observe/observe.go`, `observe/slog.go`, `observe/observe_test.go`, `observe/slog_test.go`
- Modify: `go.mod` (API modules + otelslog)

**Interfaces:**
- Produces: `observe.Scope`, `observe.Tracer() trace.Tracer`, `observe.Instruments() *Metrics`,
  `observe.Metrics{ToolCalls, ToolInflight, ToolDeadlineExceeded, RunInvocations, ServiceDrain}`,
  attribute keys `observe.KeyTool … observe.KeyResponseBytes`, `observe.Kind(err error) string`,
  `observe.Handler(next slog.Handler) slog.Handler`.

- [ ] **Step 1: Add the API dependencies**

```bash
mise exec -- go get go.opentelemetry.io/otel@v1.47.0 go.opentelemetry.io/otel/trace@v1.47.0 \
  go.opentelemetry.io/otel/metric@v1.47.0 go.opentelemetry.io/otel/log@v1.47.0 \
  go.opentelemetry.io/contrib/bridges/otelslog@v0.21.0 \
  go.opentelemetry.io/otel/sdk@v1.47.0 go.opentelemetry.io/otel/sdk/metric@v1.47.0 go.opentelemetry.io/otel/sdk/log@v1.47.0
```
Expected: go.mod gains the modules. (The SDK modules are test-only here and real in Task 2.)

- [ ] **Step 2: Write the failing test for `Kind` and `Instruments`**

`observe/observe_test.go`:
```go
package observe_test

import (
	"errors"
	"testing"

	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/serve"
)

// Kind is the metric label for an outcome: "OK", or the kind without its enum
// prefix, so a dashboard reads INVALID rather than ERROR_KIND_INVALID.
func TestKindIsOKOrTheBareKindName(t *testing.T) {
	cases := map[string]error{
		"OK":          nil,
		"INVALID":     serve.Invalid("x"),
		"UNAVAILABLE": serve.Unavailable("x"),
		"INTERNAL":    errors.New("bare"),
	}
	for want, err := range cases {
		if got := observe.Kind(err); got != want {
			t.Errorf("Kind(%v) = %q, want %q", err, got, want)
		}
	}
}

// Instruments is created once: two calls are the same pointer, so natsserve and
// rundsvc cannot end up with two meters for one idea.
func TestInstrumentsIsASingleton(t *testing.T) {
	if observe.Instruments() != observe.Instruments() {
		t.Fatal("two calls built two instrument sets")
	}
	if observe.Instruments().ToolCalls == nil {
		t.Fatal("ToolCalls is nil")
	}
}
```

- [ ] **Step 3: Run it**

Run: `mise exec -- go test ./observe/ 2>&1 | tail -5`
Expected: FAIL — package does not exist.

- [ ] **Step 4: Write `observe/observe.go`**

```go
// Package observe is the OpenTelemetry API side of this repository: the one
// tracer and meter scope, the instruments, the attribute keys, and the slog
// handler that joins a log line to its trace.
//
// It imports the OTel API only. Nothing here exports anything: until a main
// calls observe/otlp.Start the globals are no-ops, and every span, counter and
// log record below costs nothing and goes nowhere. That split is enforced by
// `mise run no-sdk`.
package observe

import (
	"errors"
	"strings"
	"sync"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"

	"github.com/garm-ai/garm-ai/serve"
)

// Scope names every tracer, meter and logger this module creates.
const Scope = "github.com/garm-ai/garm-ai"

// Attribute keys. The ENVELOPE, never the payload: a span, a metric or a log
// line crosses a boundary the request bytes were never meant to cross.
const (
	KeyTool            = attribute.Key("garm.tool")
	KeyCaller          = attribute.Key("garm.caller")      // the account public key
	KeyCallerName      = attribute.Key("garm.caller_name") // a label; may be absent
	KeyRunID           = attribute.Key("garm.run_id")
	KeyIdempotencyKey  = attribute.Key("garm.idempotency_key")
	KeyDeadlineMillis  = attribute.Key("garm.deadline_ms")
	KeyKind            = attribute.Key("garm.kind")
	KeyRequestBytes    = attribute.Key("garm.request_bytes")
	KeyResponseBytes   = attribute.Key("garm.response_bytes")
	KeyService         = attribute.Key("garm.service")
	KeyQueued          = attribute.Key("garm.queued")
)

// Tracer is the module's tracer, from whatever provider is global.
func Tracer() trace.Tracer { return otel.Tracer(Scope) }

// Kind is the metric label for an outcome: "OK" for nil, else the error's kind
// without the enum prefix. A bare error is INTERNAL, exactly as serve.Wire says.
func Kind(err error) string {
	if err == nil {
		return "OK"
	}
	var e *serve.Error
	if errors.As(err, &e) {
		return strings.TrimPrefix(serve.Wire(e, "").GetKind().String(), "ERROR_KIND_")
	}
	return "INTERNAL"
}

// Metrics is every instrument this repository records, created once.
type Metrics struct {
	ToolCalls            metric.Int64Counter       // garm.tool.calls {tool, kind}
	ToolInflight         metric.Int64UpDownCounter // garm.tool.inflight {tool}
	ToolDeadlineExceeded metric.Int64Counter       // garm.tool.deadline_exceeded {tool}
	RunInvocations       metric.Int64Counter       // garm.run.invocations {tool, caller, caller_name, kind}
	ServiceDrain         metric.Int64Counter       // garm.service.drain {service, queued}
}

var (
	instrumentsOnce sync.Once
	instruments     *Metrics
)

// Instruments returns the one set. A second meter for the same idea is the
// "one idea, two implementations" this repository exists to stop, so there is
// no constructor to call twice.
func Instruments() *Metrics {
	instrumentsOnce.Do(func() {
		m := otel.Meter(Scope)
		instruments = &Metrics{
			ToolCalls:            must(m.Int64Counter("garm.tool.calls", metric.WithDescription("tool calls answered, by outcome kind"))),
			ToolInflight:         must(m.Int64UpDownCounter("garm.tool.inflight", metric.WithDescription("tool calls being answered now"))),
			ToolDeadlineExceeded: must(m.Int64Counter("garm.tool.deadline_exceeded", metric.WithDescription("tool calls that ran past their declared deadline"))),
			RunInvocations:       must(m.Int64Counter("garm.run.invocations", metric.WithDescription("invocations rund answered, by caller and outcome kind"))),
			ServiceDrain:         must(m.Int64Counter("garm.service.drain", metric.WithDescription("drains, with how many calls were in flight"))),
		}
	})
	return instruments
}

// must: the API returns an error only for an invalid instrument NAME, which is a
// constant above. Panicking at first use is the right response to a typo here.
func must[T any](v T, err error) T {
	if err != nil {
		panic(err)
	}
	return v
}
```

Note the `Kind` helper leans on `serve.Wire`'s rule: an unset kind is INTERNAL. That keeps one definition of "what kind is this".

- [ ] **Step 5: Run it**

Run: `mise exec -- go test ./observe/ 2>&1 | tail -5`
Expected: PASS.

- [ ] **Step 6: Write the failing test for the slog handler**

`observe/slog_test.go`:
```go
package observe_test

import (
	"bytes"
	"context"
	"log/slog"
	"strings"
	"testing"

	"go.opentelemetry.io/otel"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"

	"github.com/garm-ai/garm-ai/observe"
)

// A line written while a span is active carries that span's trace id; a line
// written outside any span carries none. The SDK is imported here, in a TEST,
// to make a real span -- the package under test imports only the API.
func TestALogLineInsideASpanCarriesItsTraceID(t *testing.T) {
	tp := sdktrace.NewTracerProvider()
	t.Cleanup(func() { _ = tp.Shutdown(context.Background()) })
	otel.SetTracerProvider(tp)

	var out bytes.Buffer
	log := slog.New(observe.Handler(slog.NewTextHandler(&out, nil)))

	ctx, span := observe.Tracer().Start(context.Background(), "probe")
	log.InfoContext(ctx, "inside")
	span.End()
	log.Info("outside")

	want := "trace_id=" + span.SpanContext().TraceID().String()
	lines := strings.Split(strings.TrimSpace(out.String()), "\n")
	if len(lines) != 2 {
		t.Fatalf("want 2 lines, got %q", out.String())
	}
	if !strings.Contains(lines[0], want) {
		t.Errorf("inside line lacks %s: %s", want, lines[0])
	}
	if strings.Contains(lines[1], "trace_id=") {
		t.Errorf("outside line has a trace id: %s", lines[1])
	}
}
```

- [ ] **Step 7: Run it**

Run: `mise exec -- go test ./observe/ -run TestALogLine 2>&1 | tail -5`
Expected: FAIL — `observe.Handler` undefined.

- [ ] **Step 8: Write `observe/slog.go`**

```go
package observe

import (
	"context"
	"log/slog"

	"go.opentelemetry.io/contrib/bridges/otelslog"
	"go.opentelemetry.io/otel/trace"
)

// Handler wraps a process's slog handler so that every record written while a
// span is active carries trace_id and span_id, and every record is ALSO handed
// to the OTel log bridge -- which exports it over OTLP once observe/otlp.Start
// has installed a provider, and drops it before.
//
// Stdout is for a human at a terminal; OTLP is the shipped log. A deployment that
// tails stdout into the same backend gets every line twice (spec §3).
func Handler(next slog.Handler) slog.Handler {
	return &handler{next: next, bridge: otelslog.NewHandler(Scope)}
}

type handler struct {
	next   slog.Handler
	bridge slog.Handler
}

func (h *handler) Enabled(ctx context.Context, l slog.Level) bool {
	return h.next.Enabled(ctx, l) || h.bridge.Enabled(ctx, l)
}

func (h *handler) Handle(ctx context.Context, r slog.Record) error {
	if sc := trace.SpanContextFromContext(ctx); sc.IsValid() {
		r.AddAttrs(slog.String("trace_id", sc.TraceID().String()), slog.String("span_id", sc.SpanID().String()))
	}
	// The bridge reads the span from ctx itself; the stamped attrs are for stdout.
	_ = h.bridge.Handle(ctx, r)
	return h.next.Handle(ctx, r)
}

func (h *handler) WithAttrs(attrs []slog.Attr) slog.Handler {
	return &handler{next: h.next.WithAttrs(attrs), bridge: h.bridge.WithAttrs(attrs)}
}

func (h *handler) WithGroup(name string) slog.Handler {
	return &handler{next: h.next.WithGroup(name), bridge: h.bridge.WithGroup(name)}
}
```

- [ ] **Step 9: Run it; tidy**

Run: `mise exec -- go test ./observe/ 2>&1 | tail -5 && mise exec -- go mod tidy && mise exec -- go vet ./observe/`
Expected: PASS; tidy changes only go.mod/go.sum.

- [ ] **Step 10: Commit, then prove the handler test can fail**

```bash
git add observe go.mod go.sum
git commit -m "observe: the API side -- scope, instruments, attribute keys, the slog handler that stamps trace ids"
```
Break: in `slog.go` change `sc.IsValid()` to `false`. Run: `mise exec -- go test ./observe/ -run TestALogLine 2>&1 | tail -3`. Expected: FAIL `inside line lacks trace_id=`. Restore: `git checkout -- observe/slog.go`.

---

### Task 2: `observe/otlp` — the SDK side, and `otlptest`

**Files:**
- Create: `observe/otlp/otlp.go`, `observe/otlp/otlp_test.go`, `observe/otlp/otlptest/otlptest.go`
- Modify: `go.mod`

**Interfaces:**
- Consumes: `observe.Scope`.
- Produces: `otlp.Start(ctx context.Context, service string, log *slog.Logger) (stop func(context.Context) error, err error)`;
  `otlptest.Install(t testing.TB) *otlptest.Recorder` with `Spans() []sdktrace.ReadOnlySpan`,
  `SpanNamed(name string) (sdktrace.ReadOnlySpan, bool)`, `Counter(ctx, name string, attrs ...attribute.KeyValue) int64`,
  `Logs() []sdklog.Record`.

- [ ] **Step 1: Add the exporters**

```bash
mise exec -- go get go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp@v1.47.0 \
  go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp@v1.47.0 \
  go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp@v0.23.0
```

- [ ] **Step 2: Write the failing tests — properties 7, 8, 14 and review-focus 2**

`observe/otlp/otlp_test.go`:
```go
package otlp_test

import (
	"bytes"
	"context"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"

	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/observe/otlp"
)

func start(t *testing.T, env map[string]string) (log string, stop func(context.Context) error) {
	t.Helper()
	for _, k := range []string{"OTEL_EXPORTER_OTLP_ENDPOINT", "OTEL_EXPORTER_OTLP_HEADERS", "OTEL_SDK_DISABLED", "OTEL_SERVICE_NAME"} {
		t.Setenv(k, "") // every variable pinned, so the test does not read the shell's
	}
	for k, v := range env {
		t.Setenv(k, v)
	}
	var out bytes.Buffer
	stop, err := otlp.Start(context.Background(), "probe", slog.New(slog.NewTextHandler(&out, nil)))
	if err != nil {
		t.Fatalf("Start: %v", err)
	}
	t.Cleanup(func() { _ = stop(context.Background()) })
	return out.String(), stop
}

// Property 7: no endpoint, no exporter, and the line says so. A span still gets a
// valid id, because the error id a caller quotes is that id whether or not it is
// exported anywhere.
func TestNoEndpointMeansNoExporterAndSaysSo(t *testing.T) {
	log, _ := start(t, nil)
	if !strings.Contains(log, "exporter=none") {
		t.Fatalf("startup line: %s", log)
	}
	_, span := observe.Tracer().Start(context.Background(), "probe")
	defer span.End()
	if !span.SpanContext().IsValid() {
		t.Fatal("a span has no id without an exporter; the error id would be meaningless")
	}
}

// Properties 8 and 14: the standard variables are honoured in OpenObserve's shape
// -- base URL plus /v1/traces, the configured header present -- and the header's
// VALUE is never logged.
func TestTheStandardVariablesReachTheBackendAndTheValueIsNotLogged(t *testing.T) {
	var mu sync.Mutex
	var paths, auths []string
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		mu.Lock()
		paths = append(paths, r.URL.Path)
		auths = append(auths, r.Header.Get("Authorization"))
		mu.Unlock()
		w.WriteHeader(http.StatusOK)
	}))
	t.Cleanup(srv.Close)

	const secret = "Basic c2VjcmV0OnZhbHVl"
	log, stop := start(t, map[string]string{
		"OTEL_EXPORTER_OTLP_ENDPOINT": srv.URL + "/api/garm",
		"OTEL_EXPORTER_OTLP_HEADERS":  "Authorization=" + secret,
	})
	if !strings.Contains(log, "exporter=otlp") || !strings.Contains(log, "headers=[Authorization]") {
		t.Errorf("startup line: %s", log)
	}
	if strings.Contains(log, "c2VjcmV0") {
		t.Fatalf("the header VALUE is in the log: %s", log)
	}

	_, span := observe.Tracer().Start(context.Background(), "probe")
	span.End()
	if err := stop(context.Background()); err != nil {
		t.Fatalf("stop: %v", err)
	}

	mu.Lock()
	defer mu.Unlock()
	var sawTraces bool
	for i, p := range paths {
		if p == "/api/garm/v1/traces" {
			sawTraces = true
		}
		if auths[i] != secret {
			t.Errorf("request to %s carried Authorization %q", p, auths[i])
		}
	}
	if !sawTraces {
		t.Fatalf("no request reached /api/garm/v1/traces; paths were %v", paths)
	}
}

// Review focus 2: OTEL_SDK_DISABLED wins over an endpoint.
func TestDisabledMeansNoExporterAndSaysSo(t *testing.T) {
	log, _ := start(t, map[string]string{
		"OTEL_EXPORTER_OTLP_ENDPOINT": "http://127.0.0.1:1/api/garm",
		"OTEL_SDK_DISABLED":           "true",
	})
	if !strings.Contains(log, "exporter=none") || !strings.Contains(log, "disabled=true") {
		t.Fatalf("startup line: %s", log)
	}
}
```

- [ ] **Step 3: Run them**

Run: `mise exec -- go test ./observe/otlp/ 2>&1 | tail -5`
Expected: FAIL — package does not exist.

- [ ] **Step 4: Write `observe/otlp/otlp.go`**

```go
// Package otlp configures the OpenTelemetry SDK from the standard environment and
// installs it as the process's global providers. It is the ONLY package in this
// module that imports the SDK or an exporter (mise run no-sdk).
//
// Called once, at the top of every main, explicitly -- a library that installs
// process-global state on an author's behalf fights the author's own setup and
// becomes a flag (spec §7). Two lines are the honest price:
//
//	stop, err := otlp.Start(ctx, "weatherd", log)
//	defer stop(ctx)
package otlp

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"sort"
	"strings"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/log/global"
	"go.opentelemetry.io/otel/propagation"
	sdklog "go.opentelemetry.io/otel/sdk/log"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

// The standard variables. Read here only to DECIDE and to LOG; the exporters read
// them again themselves, which is what keeps this in step with every collector.
const (
	envEndpoint = "OTEL_EXPORTER_OTLP_ENDPOINT"
	envHeaders  = "OTEL_EXPORTER_OTLP_HEADERS"
	envDisabled = "OTEL_SDK_DISABLED"
)

// Start installs the global tracer, meter and logger providers, and the W3C
// propagator, and returns the function that flushes and stops them.
//
// With no endpoint -- or OTEL_SDK_DISABLED=true -- the providers are installed
// WITHOUT exporters: spans still get ids, because the id a caller quotes is the
// trace id whether or not anything is shipped; nothing leaves the process. The
// startup line says which, with header NAMES and never values (spec §6).
func Start(ctx context.Context, service string, log *slog.Logger) (stop func(context.Context) error, err error) {
	if log == nil {
		log = slog.Default()
	}
	endpoint := os.Getenv(envEndpoint)
	disabled := strings.EqualFold(os.Getenv(envDisabled), "true")
	export := endpoint != "" && !disabled

	res, err := resource.Merge(
		resource.NewSchemaless(attribute.String("service.name", service)),
		must(resource.New(ctx, resource.WithFromEnv(), resource.WithTelemetrySDK())), // OTEL_SERVICE_NAME wins
	)
	if err != nil {
		return nil, fmt.Errorf("observability resource: %w", err)
	}

	var (
		traceOpts  = []sdktrace.TracerProviderOption{sdktrace.WithResource(res)}
		metricOpts = []sdkmetric.Option{sdkmetric.WithResource(res)}
		logOpts    = []sdklog.LoggerProviderOption{sdklog.WithResource(res)}
	)
	if export {
		te, err := otlptracehttp.New(ctx)
		if err != nil {
			return nil, fmt.Errorf("trace exporter: %w", err)
		}
		me, err := otlpmetrichttp.New(ctx)
		if err != nil {
			return nil, fmt.Errorf("metric exporter: %w", err)
		}
		le, err := otlploghttp.New(ctx)
		if err != nil {
			return nil, fmt.Errorf("log exporter: %w", err)
		}
		traceOpts = append(traceOpts, sdktrace.WithBatcher(te))
		metricOpts = append(metricOpts, sdkmetric.WithReader(sdkmetric.NewPeriodicReader(me)))
		logOpts = append(logOpts, sdklog.WithProcessor(sdklog.NewBatchProcessor(le)))
	}
	tp := sdktrace.NewTracerProvider(traceOpts...)
	mp := sdkmetric.NewMeterProvider(metricOpts...)
	lp := sdklog.NewLoggerProvider(logOpts...)
	otel.SetTracerProvider(tp)
	otel.SetMeterProvider(mp)
	global.SetLoggerProvider(lp)
	// Without this the global propagator is a no-op and nothing crosses a hop.
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))

	exporter := "none"
	if export {
		exporter = "otlp"
	}
	log.Info("observability", "exporter", exporter, "endpoint", endpoint, "headers", headerNames(os.Getenv(envHeaders)),
		"disabled", disabled, "service", service)

	return func(ctx context.Context) error {
		return errors.Join(tp.Shutdown(ctx), mp.Shutdown(ctx), lp.Shutdown(ctx))
	}, nil
}

// headerNames is the NAMES in a `k=v,k2=v2` header list, sorted. The values are
// credentials and are never logged.
func headerNames(list string) []string {
	var names []string
	for _, kv := range strings.Split(list, ",") {
		if k, _, ok := strings.Cut(strings.TrimSpace(kv), "="); ok && k != "" {
			names = append(names, k)
		}
	}
	sort.Strings(names)
	if names == nil {
		return []string{}
	}
	return names
}

func must[T any](v T, err error) T {
	if err != nil {
		panic(err)
	}
	return v
}
```

- [ ] **Step 5: Run the tests**

Run: `mise exec -- go test ./observe/otlp/ 2>&1 | tail -8`
Expected: PASS ×3. If `TestTheStandardVariables…` sees only `/v1/metrics` or `/v1/logs`, the trace batcher did not flush before `stop` — `tp.Shutdown` flushes; check the order in `stop`.

- [ ] **Step 6: Write `observe/otlp/otlptest/otlptest.go`**

```go
// Package otlptest installs in-memory recorders as the process's global OTel
// providers, for tests that assert what a call produced. Tests only; a test
// using it must not run in parallel with another, because the globals are one.
package otlptest

import (
	"context"
	"testing"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/log/global"
	"go.opentelemetry.io/otel/propagation"
	sdklog "go.opentelemetry.io/otel/sdk/log"
	"go.opentelemetry.io/otel/sdk/log/logtest"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/metric/metricdata"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/sdk/trace/tracetest"
)

// Recorder holds what the process recorded since Install.
type Recorder struct {
	spans  *tracetest.InMemoryExporter
	reader *sdkmetric.ManualReader
	logs   *logtest.Recorder
}

// Install replaces the globals for the duration of t, with the W3C propagator so
// context crosses hops exactly as it does under otlp.Start.
func Install(t testing.TB) *Recorder {
	t.Helper()
	r := &Recorder{spans: tracetest.NewInMemoryExporter(), reader: sdkmetric.NewManualReader(), logs: logtest.NewRecorder()}
	tp := sdktrace.NewTracerProvider(sdktrace.WithSyncer(r.spans))
	mp := sdkmetric.NewMeterProvider(sdkmetric.WithReader(r.reader))
	prevTP, prevMP, prevLP, prevProp := otel.GetTracerProvider(), otel.GetMeterProvider(), global.GetLoggerProvider(), otel.GetTextMapPropagator()
	otel.SetTracerProvider(tp)
	otel.SetMeterProvider(mp)
	global.SetLoggerProvider(r.logs)
	otel.SetTextMapPropagator(propagation.TraceContext{})
	t.Cleanup(func() {
		_ = tp.Shutdown(context.Background())
		_ = mp.Shutdown(context.Background())
		otel.SetTracerProvider(prevTP)
		otel.SetMeterProvider(prevMP)
		global.SetLoggerProvider(prevLP)
		otel.SetTextMapPropagator(prevProp)
	})
	return r
}

// Spans is every ended span so far.
func (r *Recorder) Spans() []sdktrace.ReadOnlySpan {
	stubs := r.spans.GetSpans()
	out := make([]sdktrace.ReadOnlySpan, 0, len(stubs))
	for _, s := range stubs.Snapshots() {
		out = append(out, s)
	}
	return out
}

// SpanNamed is the first ended span with that name.
func (r *Recorder) SpanNamed(name string) (sdktrace.ReadOnlySpan, bool) {
	for _, s := range r.Spans() {
		if s.Name() == name {
			return s, true
		}
	}
	return nil, false
}

// Counter is the current value of an int64 counter for exactly these attributes;
// zero if never recorded.
func (r *Recorder) Counter(ctx context.Context, name string, attrs ...attribute.KeyValue) int64 {
	var rm metricdata.ResourceMetrics
	if err := r.reader.Collect(ctx, &rm); err != nil {
		return 0
	}
	want := attribute.NewSet(attrs...)
	for _, sm := range rm.ScopeMetrics {
		for _, m := range sm.Metrics {
			if m.Name != name {
				continue
			}
			if sum, ok := m.Data.(metricdata.Sum[int64]); ok {
				for _, dp := range sum.DataPoints {
					if dp.Attributes.Equals(&want) {
						return dp.Value
					}
				}
			}
		}
	}
	return 0
}

// Logs is every record the bridge received.
func (r *Recorder) Logs() []sdklog.Record { return r.logs.Result()... }
```

**Correction to the last line before you write it:** `logtest.Recorder.Result()` returns `[]*logtest.ScopeRecords`, each with `Records []logtest.EmittedRecord`. Write `Logs()` as:

```go
// Logs is every record the bridge received, flattened.
func (r *Recorder) Logs() []logtest.EmittedRecord {
	var out []logtest.EmittedRecord
	for _, sr := range r.logs.Result() {
		out = append(out, sr.Records...)
	}
	return out
}
```
and drop the `sdklog` import if unused. (The exact type names are v1.47.0's; if `go vet` disagrees, read `$(mise exec -- go list -m -f '{{.Dir}}' go.opentelemetry.io/otel/sdk/log)/logtest/recorder.go` and use what is there — the shape, a recorder that is a `log.LoggerProvider`, is stable.)

- [ ] **Step 7: Write a test that uses the recorder**

Append to `observe/otlp/otlp_test.go`:
```go
// otlptest sees a span and a counter recorded through the API side.
func TestTheRecorderSeesWhatTheAPIRecords(t *testing.T) {
	rec := otlptest.Install(t)
	ctx, span := observe.Tracer().Start(context.Background(), "probe")
	span.End()
	observe.Instruments().ToolCalls.Add(ctx, 1, metric.WithAttributes(observe.KeyTool.String("x"), observe.KeyKind.String("OK")))

	if _, ok := rec.SpanNamed("probe"); !ok {
		t.Fatal("the span was not recorded")
	}
	if n := rec.Counter(ctx, "garm.tool.calls", observe.KeyTool.String("x"), observe.KeyKind.String("OK")); n != 1 {
		t.Fatalf("garm.tool.calls = %d, want 1", n)
	}
}
```
Imports to add: `"go.opentelemetry.io/otel/metric"`, `"github.com/garm-ai/garm-ai/observe/otlp/otlptest"`.

**Caveat the test will teach:** `observe.Instruments()` is a `sync.Once` over the global meter at FIRST call. If an earlier test in the same binary called it before `Install`, the counter is bound to the old provider and this reads 0. The fix is in `observe`, not the test: make `Instruments()` cheap to call and bind lazily — simplest honest shape is to keep the singleton but have `otlptest.Install` call `observe.ResetInstrumentsForTest()`, an exported-but-named-for-tests reset (`observe/testing.go`, documented as tests-only like `topology.FreshKeys`). Add it when the test demands it, not before.

- [ ] **Step 8: Run; vet; tidy; commit; probe**

Run: `mise exec -- go test ./observe/... 2>&1 | tail -8 && mise exec -- go vet ./observe/... && mise exec -- go mod tidy`
Expected: PASS ×5 (Task 1's two + four here, minus one if the singleton caveat bit and was fixed).

```bash
git add observe go.mod go.sum
git commit -m "observe/otlp: the SDK from the standard environment; otlptest records in memory"
```
Probe property 14: in `otlp.go`, log `os.Getenv(envHeaders)` instead of `headerNames(...)`. Expected: `TestTheStandardVariables…` FAILS with `the header VALUE is in the log`. Restore with `git checkout -- observe/otlp/otlp.go`.

---

### Task 3: Health — `natsmicro.Ready`, the listener, and agreement with `$SRV.PING`

**Files:**
- Modify: `natsmicro/natsmicro.go`
- Create: `observe/health.go`, `observe/health_test.go`, `natsmicro/health_test.go`

**Interfaces:**
- Consumes: `observe.Instruments().ServiceDrain`, keys `KeyService`, `KeyQueued`.
- Produces: `(*natsmicro.Service).Ready() bool`; `observe.ServeHealth(ctx context.Context, addr string, ready func() bool) (bound string, stop func(context.Context) error, err error)`.

- [ ] **Step 1: Write the failing tests — properties 6 and 12, review-focus 4**

`natsmicro/health_test.go`:
```go
package natsmicro_test

import (
	"context"
	"net/http"
	"testing"
	"time"

	"github.com/nats-io/nats.go"

	"github.com/garm-ai/garm-ai/observe"
)

func get(t *testing.T, url string) int {
	t.Helper()
	resp, err := http.Get(url)
	if err != nil {
		t.Fatalf("GET %s: %v", url, err)
	}
	resp.Body.Close()
	return resp.StatusCode
}

func pingAnswers(nc *nats.Conn, name string) bool {
	_, err := nc.Request("$SRV.PING."+name, nil, 300*time.Millisecond)
	return err == nil
}

// Properties 6 and 12 together: /readyz is 200 exactly when $SRV.PING answers --
// before Start neither, after Start both, once Serve drains neither -- and /livez
// is 200 throughout. A readiness flag that disagreed with the bus would be the
// vacuous check this repository exists to catch.
func TestReadyAgreesWithPingThroughTheLifecycle(t *testing.T) {
	url := serverURL(t)
	nc := connect(t, url)
	probe := connect(t, url)
	s := newService(t)
	if err := s.Mount("echo", "probe.echo", echo(s)); err != nil {
		t.Fatal(err)
	}
	bound, stopHealth, err := observe.ServeHealth(context.Background(), "127.0.0.1:0", s.Ready)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = stopHealth(context.Background()) })
	live, ready := "http://"+bound+"/livez", "http://"+bound+"/readyz"

	if get(t, live) != 200 || get(t, ready) != 503 || pingAnswers(probe, "probe") {
		t.Fatal("before Start: want livez 200, readyz 503, no PING")
	}
	stop := serve(t, s, nc)
	if get(t, live) != 200 || get(t, ready) != 200 || !pingAnswers(probe, "probe") {
		t.Fatal("after Start: want livez 200, readyz 200, PING answers")
	}
	if err := stop(); err != nil {
		t.Fatal(err)
	}
	if get(t, live) != 200 || get(t, ready) != 503 || pingAnswers(probe, "probe") {
		t.Fatal("after drain: want livez 200, readyz 503, no PING")
	}
}

// Review focus 4: a started service whose connection is not CONNECTED is not ready.
func TestReadyIsFalseWhileDisconnected(t *testing.T) {
	url := serverURL(t)
	nc := connect(t, url)
	s := newService(t)
	if err := s.Mount("echo", "probe.echo", echo(s)); err != nil {
		t.Fatal(err)
	}
	serve(t, s, nc)
	if !s.Ready() {
		t.Fatal("ready should be true after Start")
	}
	nc.Close() // a closed connection is the sharpest "not connected"
	if s.Ready() {
		t.Fatal("ready while the connection is closed")
	}
}
```
`newService` in `natsmicro_test.go` builds `Config{Name: "probe", …}` — check the name it uses (`sed -n 57,66p natsmicro/natsmicro_test.go`) and use that name in `pingAnswers`.

- [ ] **Step 2: Run them**

Run: `mise exec -- go test ./natsmicro/ -run 'TestReady' 2>&1 | tail -5`
Expected: FAIL — `s.Ready` and `observe.ServeHealth` undefined.

- [ ] **Step 3: `natsmicro` — ready, draining, in-flight count, drain counter**

In `natsmicro/natsmicro.go`:

Add imports `"sync/atomic"`, `"go.opentelemetry.io/otel/metric"`, `"github.com/garm-ai/garm-ai/observe"`.

In `Service` add fields:
```go
	inFlight sync.WaitGroup
	// inFlightN mirrors inFlight as a number, for the drain line and the metric;
	// a WaitGroup cannot be read.
	inFlightN atomic.Int64
	// draining is set the moment Serve begins to stop, before Stop() has drained
	// anything, so readiness goes false BEFORE the last call is answered rather
	// than after -- a scheduler must stop routing here first.
	draining atomic.Bool
```

`Track` becomes:
```go
func (s *Service) Track(f func()) {
	s.inFlight.Add(1)
	s.inFlightN.Add(1)
	defer func() { s.inFlightN.Add(-1); s.inFlight.Done() }()
	f()
}
```

Add after `Track`:
```go
// Ready is what /readyz reports: Start has returned, Serve has not begun to
// drain, and the connection is connected -- which is also exactly when micro's
// $SRV.PING answers, and a test holds the two to that (spec §5).
func (s *Service) Ready() bool {
	s.mu.Lock()
	svc, nc := s.svc, s.nc
	s.mu.Unlock()
	return svc != nil && !s.draining.Load() && nc != nil && nc.Status() == nats.CONNECTED
}
```

In `Serve`, immediately after `<-ctx.Done()`:
```go
	s.draining.Store(true)
	queued := s.inFlightN.Load()
	observe.Instruments().ServiceDrain.Add(context.Background(), 1,
		metric.WithAttributes(observe.KeyService.String(s.cfg.Name), observe.KeyQueued.Int64(queued)))
	s.log.Info("draining", "service", s.cfg.Name, "in_flight", queued)
```

- [ ] **Step 4: `observe/health.go`**

```go
package observe

import (
	"context"
	"errors"
	"net"
	"net/http"
	"time"
)

// ServeHealth answers /livez (200 while the process runs) and /readyz (200 while
// ready() is true, else 503) on addr, which may end in :0. It exists because the
// thing that restarts or routes to a process speaks HTTP and holds no NATS
// credential; the bus's own view is $SRV.PING, and natsmicro.Ready is held to
// agree with it (spec §5).
func ServeHealth(ctx context.Context, addr string, ready func() bool) (bound string, stop func(context.Context) error, err error) {
	ln, err := net.Listen("tcp", addr)
	if err != nil {
		return "", nil, err
	}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /livez", func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusOK) })
	mux.HandleFunc("GET /readyz", func(w http.ResponseWriter, _ *http.Request) {
		if ready() {
			w.WriteHeader(http.StatusOK)
			return
		}
		w.WriteHeader(http.StatusServiceUnavailable)
	})
	srv := &http.Server{Handler: mux, ReadHeaderTimeout: 5 * time.Second, BaseContext: func(net.Listener) context.Context { return ctx }}
	go func() { _ = srv.Serve(ln) }()
	return ln.Addr().String(), func(ctx context.Context) error {
		if err := srv.Shutdown(ctx); err != nil && !errors.Is(err, http.ErrServerClosed) {
			return err
		}
		return nil
	}, nil
}
```

- [ ] **Step 5: Run; the natsmicro suite; vet**

Run: `mise exec -- go test ./natsmicro/ ./observe/... 2>&1 | tail -8 && mise exec -- go vet ./natsmicro/ ./observe/...`
Expected: PASS.

- [ ] **Step 6: Commit, then prove property 12 can fail both ways**

```bash
git add natsmicro observe
git commit -m "natsmicro: Ready, draining, in-flight count and the drain counter; observe: /livez and /readyz"
```
Break A: in `Ready`, drop `&& !s.draining.Load()`. Expected: `TestReadyAgreesWithPing…` FAILS at "after drain". Restore.
Break B: in `Serve`, move `s.draining.Store(true)` to after `s.inFlight.Wait()`. Expected: still passes — note that: this probe is weaker than the readiness-before-answered claim, and a test for it belongs with a slow handler (`natsserve.TestAHandlerIsNotHandedACancelledContextDuringTheDrain` has the shape). Add it: `TestReadyGoesFalseBeforeTheLastCallIsAnswered` — mount a handler that blocks on a channel, send one request, cancel Serve, assert `Ready()` is false while the handler is still blocked, then release it. Run; RED with break B in place; GREEN restored. Restore with `git checkout -- natsmicro/natsmicro.go`, keep the new test, commit it.

---

### Task 4: `natscall` starts the trace

**Files:**
- Modify: `natscall/natscall.go`
- Create: `natscall/trace_test.go`

**Interfaces:**
- Consumes: `observe.Tracer()`, keys, `otlptest.Install`.
- Produces: a `garm.call` span, `SpanKindClient`, attributes `garm.tool`, `garm.request_bytes`, `garm.response_bytes`, `garm.kind`; `traceparent` injected from `ctx`.

- [ ] **Step 1: Write the failing tests — property 15 and injection**

`natscall/trace_test.go`:
```go
package natscall_test

import (
	"context"
	"testing"
	"time"

	natsserver "github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"go.opentelemetry.io/otel/trace"

	"github.com/garm-ai/garm-ai/call"
	"github.com/garm-ai/garm-ai/natscall"
	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/observe/otlp/otlptest"
	"github.com/garm-ai/garm-ai/rundsvc"
)

func bare(t *testing.T) *nats.Conn {
	t.Helper()
	srv, err := natsserver.NewServer(&natsserver.Options{Host: "127.0.0.1", Port: -1, NoLog: true, NoSigs: true})
	if err != nil {
		t.Fatal(err)
	}
	go srv.Start()
	t.Cleanup(srv.Shutdown)
	if !srv.ReadyForConnections(5 * time.Second) {
		t.Fatal("server not ready")
	}
	nc, err := nats.Connect(srv.ClientURL())
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(nc.Close)
	return nc
}

// The request carries the CALLER's span, and the span is a child of whatever the
// caller's ctx already held.
func TestInvokeInjectsTheCallersSpanAndIsAChildOfTheCallersContext(t *testing.T) {
	rec := otlptest.Install(t)
	nc := bare(t)
	var got string
	sub, _ := nc.Subscribe(rundsvc.SubjectInvoke, func(m *nats.Msg) {
		got = m.Header.Get("traceparent")
		_ = m.Respond([]byte{}) // an empty InvokeResponse
	})
	defer sub.Unsubscribe()

	ctx, parent := observe.Tracer().Start(context.Background(), "the-callers-own-work")
	_, _ = natscall.Client{NC: nc}.Invoke(ctx, "x", nil, call.Options{})
	parent.End()

	span, ok := rec.SpanNamed("garm.call")
	if !ok {
		t.Fatal("no garm.call span")
	}
	if span.Parent().SpanID() != parent.SpanContext().SpanID() {
		t.Fatal("garm.call is not a child of the caller's span")
	}
	if got == "" || !contains(got, span.SpanContext().TraceID().String()) {
		t.Fatalf("traceparent on the wire was %q, want the caller's trace %s", got, span.SpanContext().TraceID())
	}
}

// Property 15: the one retry is ONE span with one retry event.
func TestTheOneRetryIsOneSpanWithAnEvent(t *testing.T) {
	rec := otlptest.Install(t)
	nc := bare(t)
	// Nobody answers for the first attempt; a responder appears at 50ms, before
	// the retry at 100ms.
	time.AfterFunc(50*time.Millisecond, func() {
		_, _ = nc.Subscribe(rundsvc.SubjectInvoke, func(m *nats.Msg) { _ = m.Respond([]byte{}) })
		_ = nc.Flush()
	})
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	if _, err := natscall.Client{NC: nc}.Invoke(ctx, "x", nil, call.Options{}); err != nil {
		t.Fatalf("the retry did not succeed: %v", err)
	}
	var calls int
	for _, s := range rec.Spans() {
		if s.Name() == "garm.call" {
			calls++
			var retries int
			for _, ev := range s.Events() {
				if ev.Name == "retry" {
					retries++
				}
			}
			if retries != 1 {
				t.Errorf("want 1 retry event, got %d", retries)
			}
		}
	}
	if calls != 1 {
		t.Fatalf("want 1 garm.call span, got %d", calls)
	}
}

func contains(s, sub string) bool { return len(sub) > 0 && len(s) >= len(sub) && (s == sub || indexOf(s, sub) >= 0) }
func indexOf(s, sub string) int {
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return i
		}
	}
	return -1
}
```
Replace the last two helpers with `strings.Contains` — they are written out only so the test file is self-contained here; use the standard library.

- [ ] **Step 2: Run them**

Run: `mise exec -- go test ./natscall/ -run 'TestInvokeInjects|TestTheOneRetry' 2>&1 | tail -5`
Expected: FAIL — no `garm.call` span.

- [ ] **Step 3: Implement in `natscall/natscall.go`**

Imports to add: `"net/http"`, `"go.opentelemetry.io/otel"`, `"go.opentelemetry.io/otel/attribute"`, `"go.opentelemetry.io/otel/codes"`, `"go.opentelemetry.io/otel/propagation"`, `"go.opentelemetry.io/otel/trace"`, `"github.com/garm-ai/garm-ai/observe"`.

Replace `Invoke`:
```go
// Invoke sends one InvokeRequest to rund and returns the tool's response bytes.
//
// It opens the call's span -- the ROOT of the trace unless the caller's ctx is
// already inside one, in which case this call is a child of the caller's own
// work. Generated client code stays OTel-free: the span lives here, on the
// transport, and the propagator puts it on the wire.
func (c Client) Invoke(ctx context.Context, tool string, input []byte, o call.Options) (result []byte, err error) {
	ctx, span := observe.Tracer().Start(ctx, "garm.call", trace.WithSpanKind(trace.SpanKindClient),
		trace.WithAttributes(observe.KeyTool.String(tool), observe.KeyRequestBytes.Int(len(input))))
	defer func() { finish(span, err, len(result)) }()

	body, err := proto.Marshal(&runv1.InvokeRequest{Tool: tool, Input: input})
	if err != nil {
		return nil, serve.Internal(fmt.Errorf("marshalling the request: %w", err))
	}
	m := nats.NewMsg(rundsvc.SubjectInvoke)
	m.Data = body
	correlation := o.Correlation
	if correlation == "" {
		correlation = newID()
	}
	set(m, rundsvc.HeaderCorrelation, correlation)
	set(m, rundsvc.HeaderMessage, newID())
	set(m, rundsvc.HeaderIdempotency, o.Idempotency)
	// The span on ctx wins; o.Traceparent is for a caller with no tracer that
	// still wants to pass a context through verbatim.
	set(m, rundsvc.HeaderTraceparent, o.Traceparent)
	otel.GetTextMapPropagator().Inject(ctx, propagation.HeaderCarrier(http.Header(m.Header)))

	reply, err := c.request(ctx, m, rundsvc.PatternInvoke)
	if err != nil {
		return nil, err
	}
	if code := reply.Header.Get(micro.ErrorCodeHeader); code != "" {
		return nil, wireError(code, reply)
	}
	var resp runv1.InvokeResponse
	if err := proto.Unmarshal(reply.Data, &resp); err != nil {
		return nil, serve.Internal(fmt.Errorf("the reply is not an InvokeResponse: %w", err))
	}
	return resp.GetResult(), nil
}

// finish records the outcome on the span: the kind as an attribute always, an
// error status only when there was one.
func finish(span trace.Span, err error, responseBytes int) {
	span.SetAttributes(observe.KeyKind.String(observe.Kind(err)), observe.KeyResponseBytes.Int(responseBytes))
	if err != nil {
		span.SetStatus(codes.Error, observe.Kind(err))
	}
	span.End()
}
```

In `request`, where the retry happens, add the event before the second attempt:
```go
		trace.SpanFromContext(ctx).AddEvent("retry", trace.WithAttributes(attribute.String("reason", "no responders")))
		reply, err = c.NC.RequestMsgWithContext(ctx, m)
```

`Fetch` gets the same shape with span name `garm.fetch` and `observe.KeyRunID.String(runID)` — write it; do not leave `Fetch` untraced because "it is less important".

- [ ] **Step 4: Run; the natscall suite (estate-backed, so slower)**

Run: `mise exec -- go test ./natscall/ 2>&1 | tail -8`
Expected: PASS, including the existing retry test in `limits_test.go`.

- [ ] **Step 5: Commit; probe property 15**

```bash
git add natscall
git commit -m "natscall: the call is a span; the retry is an event on it"
```
Break: wrap the second `RequestMsgWithContext` in its own `observe.Tracer().Start(ctx, "garm.call")`/`End()`. Expected: `TestTheOneRetryIsOneSpan…` FAILS `want 1 garm.call span, got 2`. Restore.

---

### Task 5: `rundsvc` continues the trace and injects its own

**Files:**
- Modify: `rundsvc/rundsvc.go`
- Create: `rundsvc/trace_test.go`

**Interfaces:**
- Consumes: `observe.Tracer()`, `observe.Instruments().RunInvocations`, `observe.CallerNames` (Task 8 adds the type; here `Serve` keeps its signature and names are added in Task 8).
- Produces: span `garm.run.invoke` (`SpanKindServer`) with `garm.tool`, `garm.caller`, `garm.idempotency_key`, `garm.run_id`, `garm.kind`; `ToolCaller.Call` injects from `ctx`; `withCaller` takes and returns a `context.Context`.

- [ ] **Step 1: Write the failing tests**

`rundsvc/trace_test.go`:
```go
package rundsvc_test

import (
	"context"
	"net/http"
	"testing"
	"time"

	"github.com/nats-io/nats.go"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/trace"
	"google.golang.org/protobuf/proto"

	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
	"github.com/garm-ai/garm-ai/natsserve"
	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/observe/otlp/otlptest"
	"github.com/garm-ai/garm-ai/rundsvc"
)

// The tool receives RUND's span context, not the caller's: the tool span must be
// a child of garm.run.invoke, which is a child of the caller's. Checked on the
// wire here -- what traceparent reached garm.tool.* -- against the recorded span.
func TestTheToolCallCarriesRundsOwnSpanNotTheCallers(t *testing.T) {
	rec := otlptest.Install(t)
	caller, _ := bareServer(t)

	// Watch what reaches the tool. The weather service is mounted by bareServer;
	// a second subscriber on the same subject sees a copy of the request.
	var toTool string
	seen := make(chan struct{}, 1)
	sub, _ := caller.Subscribe(natsserve.Subject("weather.v1.get_forecast"), func(m *nats.Msg) {
		toTool = m.Header.Get("traceparent")
		seen <- struct{}{}
	})
	defer sub.Unsubscribe()
	_ = caller.Flush()

	// The caller's own span, injected the way natscall does it.
	ctx, callerSpan := observe.Tracer().Start(context.Background(), "garm.call")
	body, _ := proto.Marshal(&runv1.InvokeRequest{Tool: "weather.v1.get_forecast",
		Input: mustMarshal(t, &weatherv1.GetForecastRequest{Place: "Ghent", Days: 1})})
	m := nats.NewMsg(asRewritten(rundsvc.SubjectInvoke))
	m.Data = body
	otel.GetTextMapPropagator().Inject(ctx, propagation.HeaderCarrier(http.Header(m.Header)))
	if _, err := caller.RequestMsg(m, 2*time.Second); err != nil {
		t.Fatal(err)
	}
	callerSpan.End()
	<-seen

	rundSpan, ok := rec.SpanNamed("garm.run.invoke")
	if !ok {
		t.Fatal("no garm.run.invoke span")
	}
	if rundSpan.Parent().SpanID() != callerSpan.SpanContext().SpanID() {
		t.Fatal("rund's span is not a child of the caller's")
	}
	if !contains(toTool, rundSpan.SpanContext().SpanID().String()) {
		t.Fatalf("the tool received %q; want rund's span %s, not the caller's %s",
			toTool, rundSpan.SpanContext().SpanID(), callerSpan.SpanContext().SpanID())
	}
	if !contains(toTool, rundSpan.SpanContext().TraceID().String()) {
		t.Fatalf("the tool received %q; not the caller's trace %s", toTool, rundSpan.SpanContext().TraceID())
	}
}

// With no span anywhere -- no caller header, no tracer -- rund forwards NOTHING,
// rather than a verbatim copy of an absent header or an invented one.
func TestWithNoSpanRundForwardsNoTraceparent(t *testing.T) {
	// No otlptest.Install: the globals are the OTel no-ops.
	caller, _ := bareServer(t)
	var toTool *string
	seen := make(chan struct{}, 1)
	sub, _ := caller.Subscribe(natsserve.Subject("weather.v1.get_forecast"), func(m *nats.Msg) {
		v := m.Header.Get("traceparent")
		toTool = &v
		seen <- struct{}{}
	})
	defer sub.Unsubscribe()
	_ = caller.Flush()

	body, _ := proto.Marshal(&runv1.InvokeRequest{Tool: "weather.v1.get_forecast",
		Input: mustMarshal(t, &weatherv1.GetForecastRequest{Place: "Ghent", Days: 1})})
	m := nats.NewMsg(asRewritten(rundsvc.SubjectInvoke))
	m.Data = body
	if _, err := caller.RequestMsg(m, 2*time.Second); err != nil {
		t.Fatal(err)
	}
	<-seen
	if *toTool != "" {
		t.Fatalf("rund forwarded traceparent %q with no span to forward", *toTool)
	}
}

// The invocation counter carries the tool, the caller and the kind. The bare
// server places no real account key, so the caller attribute is absent here; the
// estate test asserts it is present there.
func TestAnInvocationIsCounted(t *testing.T) {
	rec := otlptest.Install(t)
	caller, _ := bareServer(t)
	body, _ := proto.Marshal(&runv1.InvokeRequest{Tool: "no.such.tool"})
	m := nats.NewMsg(asRewritten(rundsvc.SubjectInvoke))
	m.Data = body
	if _, err := caller.RequestMsg(m, 2*time.Second); err != nil {
		t.Fatal(err)
	}
	ctx := context.Background()
	if n := rec.Counter(ctx, "garm.run.invocations", observe.KeyTool.String("no.such.tool"), observe.KeyKind.String("NOT_FOUND")); n != 1 {
		t.Fatalf("garm.run.invocations{no.such.tool,NOT_FOUND} = %d, want 1", n)
	}
}

func mustMarshal(t *testing.T, m proto.Message) []byte {
	t.Helper()
	b, err := proto.Marshal(m)
	if err != nil {
		t.Fatal(err)
	}
	return b
}

func contains(s, sub string) bool { return strings.Contains(s, sub) }
```
Add `"strings"` to the imports and inline `strings.Contains` instead of the helper. `bareServer` and `asRewritten` exist in `rundsvc_test.go`. **Watch the `TestAnInvocationIsCounted` attribute set:** the bare server yields no caller, so `garm.caller` must be *absent* from the set (not empty-string) for `Counter` to match — this pins the rule "unknown is absent, never empty".

- [ ] **Step 2: Run them**

Run: `mise exec -- go test ./rundsvc/ -run 'TestTheToolCall|TestWithNoSpan|TestAnInvocation' 2>&1 | tail -6`
Expected: `TestTheToolCall…` FAIL (no span); `TestWithNoSpan…` **PASS already?** — no: today `ToolCaller` forwards `h.Traceparent` verbatim and the caller sent none, so it passes vacuously. Make it bite: in that test have the caller send a *garbage* `traceparent: not-a-traceparent` header. Today's code forwards it verbatim → the test FAILS (`forwarded traceparent "not-a-traceparent"`). After the change the propagator rejects it, there is no span (no tracer), nothing is injected → PASS. Edit the test accordingly before continuing. `TestAnInvocation…` FAIL (0).

- [ ] **Step 3: Implement in `rundsvc/rundsvc.go`**

Imports to add: `"net/http"`, `"go.opentelemetry.io/otel"`, `"go.opentelemetry.io/otel/codes"`, `"go.opentelemetry.io/otel/metric"`, `"go.opentelemetry.io/otel/propagation"`, `"go.opentelemetry.io/otel/trace"`, `"github.com/garm-ai/garm-ai/observe"`.

Replace `withCaller`:
```go
// withCaller is what every handler does first: continue the caller's trace, learn
// who called, say so, and put it where the engine can reach it.
//
// The trace is CONTINUED -- the span opened here is a child of whatever the
// envelope carried -- and that is correlation, never attribution: the caller
// chose that id. Attribution is the account key, and it comes from the subject
// the server rewrote (spec §1.2). A malformed traceparent is rejected by the
// propagator and a fresh trace begins, with the caller set as always.
func withCaller(e *run.Engine, r micro.Request, op string) (context.Context, trace.Span) {
	ctx := otel.GetTextMapPropagator().Extract(context.Background(), propagation.HeaderCarrier(http.Header(r.Headers())))
	ctx, span := observe.Tracer().Start(ctx, "garm.run."+op, trace.WithSpanKind(trace.SpanKindServer))
	acc, ok := CallerFromSubject(r.Subject())
	if !ok {
		e.Log.WarnContext(ctx, "a call arrived without a caller account in its subject", "op", op, "subject", r.Subject())
		return ctx, span
	}
	span.SetAttributes(observe.KeyCaller.String(acc))
	e.Log.InfoContext(ctx, op, "caller", acc)
	return context.WithValue(ctx, CallerKey{}, acc), span
}
```
`r.Headers()` is `micro.Headers`, which is `nats.Header` — convert with `http.Header(nats.Header(r.Headers()))` if the compiler asks.

Replace `invoke`:
```go
func invoke(e *run.Engine, r micro.Request) {
	ctx, span := withCaller(e, r, "invoke")
	defer span.End()
	var req runv1.InvokeRequest
	if err := proto.Unmarshal(r.Data(), &req); err != nil {
		reply(r, serve.Wire(serve.Invalid("the request could not be read as garm.run.v1.InvokeRequest"), ""))
		record(ctx, span, "", serve.Invalid("unreadable"))
		return
	}
	h := headersOf(r)
	span.SetAttributes(observe.KeyTool.String(req.GetTool()), observe.KeyIdempotencyKey.String(h.Idempotency))
	resp, failure := e.Invoke(ctx, &req, h)
	if failure != nil {
		reply(r, failure)
		// The run id is the error's id (run.Engine.fail), so it is known here.
		span.SetAttributes(observe.KeyRunID.String(failure.GetId()))
		record(ctx, span, req.GetTool(), &serve.Error{Kind: failure.GetKind()})
		return
	}
	span.SetAttributes(observe.KeyRunID.String(resp.GetRunId()))
	record(ctx, span, req.GetTool(), nil)
	respond(r, resp)
}

// record closes out an invocation on the span and the counter. The caller
// attribute is copied from the span's context value so the counter and the span
// agree; absent -- not empty -- when there is none.
func record(ctx context.Context, span trace.Span, tool string, err error) {
	kind := observe.Kind(err)
	attrs := []attribute.KeyValue{observe.KeyTool.String(tool), observe.KeyKind.String(kind)}
	if acc, ok := ctx.Value(CallerKey{}).(string); ok && acc != "" {
		attrs = append(attrs, observe.KeyCaller.String(acc))
	}
	span.SetAttributes(observe.KeyKind.String(kind))
	if err != nil {
		span.SetStatus(codes.Error, kind)
	}
	observe.Instruments().RunInvocations.Add(ctx, 1, metric.WithAttributes(attrs...))
}
```
Add `"go.opentelemetry.io/otel/attribute"` to imports. `fetch` gets the same two-line change: `ctx, span := withCaller(e, r, "fetch"); defer span.End()` and passes `ctx` to `e.Fetch`.

In `ToolCaller.Call`, replace `set(m, HeaderTraceparent, h.Traceparent)` with:
```go
	// RUND's span context, not the caller's forwarded header: the tool is a child
	// of this hop. With no span on ctx the propagator injects nothing.
	otel.GetTextMapPropagator().Inject(ctx, propagation.HeaderCarrier(http.Header(m.Header)))
```
`run.Headers.Traceparent` and `HeaderTraceparent` stay: `headersOf` still reads it into the engine's record (the audit trail), and `natscall` still sets it for a tracer-less caller. Update the comment on `run.Headers.Traceparent` to say it is *recorded* here and *propagated* by the transport.

- [ ] **Step 4: Run the rundsvc suite**

Run: `mise exec -- go test ./rundsvc/ 2>&1 | tail -8`
Expected: PASS. `caller_test.go`'s `TestRundLogsTheCallingAccount` greps the log for `caller=` — still true.

- [ ] **Step 5: Commit; probe the injection**

```bash
git add rundsvc run
git commit -m "rundsvc: continue the caller's trace, inject rund's own on the tool call, count invocations"
```
Break: restore `set(m, HeaderTraceparent, h.Traceparent)` beside the Inject (so the verbatim header wins when set — put it AFTER Inject). Expected: `TestTheToolCallCarriesRundsOwnSpan…` FAILS naming the caller's span id. Restore.

---

### Task 6: `natsserve` continues into the handler; the error id is the trace id

**Files:**
- Modify: `natsserve/natsserve.go`
- Create: `natsserve/trace_test.go`

**Interfaces:**
- Consumes: `observe.Tracer()`, `observe.Instruments()`.
- Produces: span `garm.tool` (`SpanKindServer`) with `garm.tool`, `garm.deadline_ms`, `garm.request_bytes`, `garm.response_bytes`, `garm.kind`; handler `ctx` carries the span; `fail` uses the trace id when valid; counters `garm.tool.calls`, `garm.tool.inflight`, `garm.tool.deadline_exceeded`.

- [ ] **Step 1: Write the failing tests — properties 2 and 11, deadline counter, review-focus 5**

`natsserve/trace_test.go`:
```go
package natsserve_test

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"go.opentelemetry.io/otel/trace"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/emptypb"

	"github.com/garm-ai/garm-ai/natsserve"
	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/observe/otlp/otlptest"
)

// Property 11: the handler's ctx carries the span.
func TestAHandlerCanReachTheSpan(t *testing.T) {
	otlptest.Install(t)
	nc := conn(t, 0)
	var seen trace.SpanContext
	s := service(t, "probe.span", func(ctx context.Context, _ proto.Message) (proto.Message, error) {
		seen = trace.SpanContextFromContext(ctx)
		return &emptypb.Empty{}, nil
	})
	run(t, s, nc)
	call(t, nc, natsserve.Subject("probe.span"), &emptypb.Empty{})
	if !seen.IsValid() {
		t.Fatal("the handler's ctx carried no span")
	}
}

// Property 2: the id a caller is told to quote IS the trace id.
func TestTheErrorIDIsTheTraceID(t *testing.T) {
	rec := otlptest.Install(t)
	nc := conn(t, 0)
	s := service(t, "probe.fail", func(context.Context, proto.Message) (proto.Message, error) {
		return nil, errors.New("a bare error: INTERNAL with an id")
	})
	run(t, s, nc)
	msg := call(t, nc, natsserve.Subject("probe.fail"), &emptypb.Empty{})
	_, _, typed := wireError(t, msg)
	span, ok := rec.SpanNamed("garm.tool")
	if !ok {
		t.Fatal("no garm.tool span")
	}
	if typed.GetId() != span.SpanContext().TraceID().String() {
		t.Fatalf("error id %q, trace id %s", typed.GetId(), span.SpanContext().TraceID())
	}
}

// Without a tracer the id falls back to a random one -- never empty, never the
// invalid all-zero trace id.
func TestWithoutATracerTheIDIsStillSomething(t *testing.T) {
	nc := conn(t, 0)
	s := service(t, "probe.fail2", func(context.Context, proto.Message) (proto.Message, error) {
		return nil, errors.New("bare")
	})
	run(t, s, nc)
	_, _, typed := wireError(t, call(t, nc, natsserve.Subject("probe.fail2"), &emptypb.Empty{}))
	if typed.GetId() == "" || strings.Trim(typed.GetId(), "0") == "" {
		t.Fatalf("id is %q", typed.GetId())
	}
}

// garm.tool.calls counts by kind; inflight returns to zero; a handler that runs
// past its deadline is counted.
func TestToolCountersCountWhatHappened(t *testing.T) {
	rec := otlptest.Install(t)
	nc := conn(t, 0)
	s := service(t, "probe.count", func(context.Context, proto.Message) (proto.Message, error) {
		return &emptypb.Empty{}, nil
	})
	run(t, s, nc)
	call(t, nc, natsserve.Subject("probe.count"), &emptypb.Empty{})
	call(t, nc, natsserve.Subject("probe.count"), &emptypb.Empty{})
	ctx := context.Background()
	if n := rec.Counter(ctx, "garm.tool.calls", observe.KeyTool.String("probe.count"), observe.KeyKind.String("OK")); n != 2 {
		t.Errorf("calls{OK} = %d, want 2", n)
	}
	if n := rec.Counter(ctx, "garm.tool.inflight", observe.KeyTool.String("probe.count")); n != 0 {
		t.Errorf("inflight = %d after both answered, want 0", n)
	}
}
```
For the deadline counter, extend `TestADeclaredBudgetBecomesTheHandlersDeadline`'s sibling `TestAHandlerPastItsBudgetIsCancelled` (natsserve_test.go:595) with an `otlptest.Install(t)` at its top and, at its end:
```go
	if n := rec.Counter(context.Background(), "garm.tool.deadline_exceeded", observe.KeyTool.String(<that test's tool name>)); n != 1 {
		t.Errorf("deadline_exceeded = %d, want 1", n)
	}
```
Read the test to find the tool name and how it registers a budget (it uses a generated-style `Endpoint` call with a budget).

Review-focus 5 — `TestTheToolSpanEndsEvenWhenTheHandlerPanics`: a handler that panics kills the process under micro today; do NOT add a recover in `natsserve` for this plan (that is a behaviour change with its own spec). Instead, assert the structure: `answer` ends the span with `defer`. The honest test is the one above (`TestTheErrorIDIsTheTraceID`) plus reading the code; record in the ledger that review-focus 5 is covered by inspection, not a test, and why.

- [ ] **Step 2: Run them**

Run: `mise exec -- go test ./natsserve/ -run 'TestAHandlerCanReach|TestTheErrorID|TestWithoutATracer|TestToolCounters' 2>&1 | tail -6`
Expected: first two and fourth FAIL; `TestWithoutATracer…` passes today (random id) — it is the regression guard for the fallback; keep it.

- [ ] **Step 3: Implement in `natsserve/natsserve.go`**

Imports to add: `"net/http"`, `"go.opentelemetry.io/otel"`, `"go.opentelemetry.io/otel/codes"`, `"go.opentelemetry.io/otel/metric"`, `"go.opentelemetry.io/otel/propagation"`, `"go.opentelemetry.io/otel/trace"`, `"github.com/garm-ai/garm-ai/observe"`.

Replace `answer`'s opening (keep its comments; amend the last paragraph of the comment above it — the trace id now DOES arrive from the request, "and that is a later step" is this step):
```go
func (s *Service) answer(e endpoint, r micro.Request) {
	// The caller's trace, continued; the span is what the handler sees on ctx.
	// Background, not the process's context: shutdown must not cancel a call we
	// have committed to answering (see above).
	ctx := otel.GetTextMapPropagator().Extract(context.Background(), propagation.HeaderCarrier(http.Header(r.Headers())))
	ctx, span := observe.Tracer().Start(ctx, "garm.tool", trace.WithSpanKind(trace.SpanKindServer),
		trace.WithAttributes(observe.KeyTool.String(e.tool), observe.KeyDeadlineMillis.Int64(e.budget.Milliseconds()),
			observe.KeyRequestBytes.Int(len(r.Data()))))
	defer span.End()
	inst := observe.Instruments()
	toolAttr := metric.WithAttributes(observe.KeyTool.String(e.tool))
	inst.ToolInflight.Add(ctx, 1, toolAttr)
	defer inst.ToolInflight.Add(ctx, -1, toolAttr)

	if e.budget > 0 {
		var cancel context.CancelFunc
		ctx, cancel = context.WithTimeout(ctx, e.budget)
		defer cancel()
	}
	in := e.newReq()
	if err := proto.Unmarshal(r.Data(), in); err != nil {
		s.fail(ctx, e, r, serve.Invalid("the request could not be read as %s", e.method).Because(err))
		return
	}

	out, err := e.handle(ctx, in)
	if errors.Is(ctx.Err(), context.DeadlineExceeded) {
		inst.ToolDeadlineExceeded.Add(ctx, 1, toolAttr)
	}
	if err != nil {
		s.fail(ctx, e, r, err)
		return
	}
	body, err := proto.Marshal(out)
	if err != nil {
		s.fail(ctx, e, r, serve.Internal(fmt.Errorf("marshalling the response: %w", err)))
		return
	}
	if err := r.Respond(body); err != nil {
		s.fail(ctx, e, r, serve.Internal(fmt.Errorf("sending the response: %w", err)))
		return
	}
	span.SetAttributes(observe.KeyKind.String("OK"), observe.KeyResponseBytes.Int(len(body)))
	inst.ToolCalls.Add(ctx, 1, metric.WithAttributes(observe.KeyTool.String(e.tool), observe.KeyKind.String("OK")))
}
```
Add `"errors"` to imports.

`fail` takes `ctx` and uses the trace id:
```go
// fail is the single exit for every error, so no path can forget to reply.
//
// The id a caller is told to quote is the TRACE id when there is one -- quoting
// it opens the whole trace in every process the call crossed -- and a random
// one when there is not, so a caller with no tracer still has something to quote.
func (s *Service) fail(ctx context.Context, e endpoint, r micro.Request, err error) {
	id := correlationID(ctx)
	w := serve.Wire(err, id)
	kind := strings.TrimPrefix(w.GetKind().String(), "ERROR_KIND_")
	span := trace.SpanFromContext(ctx)
	span.SetAttributes(observe.KeyKind.String(kind))
	span.SetStatus(codes.Error, kind)
	observe.Instruments().ToolCalls.Add(ctx, 1, metric.WithAttributes(observe.KeyTool.String(e.tool), observe.KeyKind.String(kind)))

	s.log.ErrorContext(ctx, "tool call failed", "id", id, "tool", e.tool, "kind", w.GetKind().String(), "error", err)
	// ... the rest unchanged ...
}

// correlationID is the token a caller quotes and an operator joins on: the trace
// id when a span is active, else sixteen random hex characters.
func correlationID(ctx context.Context) string {
	if sc := trace.SpanContextFromContext(ctx); sc.IsValid() {
		return sc.TraceID().String()
	}
	var b [8]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "no-id-available"
	}
	return hex.EncodeToString(b[:])
}
```
Use `observe.Kind(err)` instead of the `TrimPrefix` if the two agree (they do, by construction — `Kind` goes through `Wire`); one definition.

- [ ] **Step 4: Run the suite**

Run: `mise exec -- go test ./natsserve/ 2>&1 | tail -8`
Expected: PASS. `TestABareErrorNeverReachesTheCallerOverTheWire` is unaffected: the id is not the cause.

- [ ] **Step 5: Commit; probe property 2**

```bash
git add natsserve
git commit -m "natsserve: continue the trace into the handler; the quoted id is the trace id; tool counters"
```
Break: in `correlationID` return the random id unconditionally. Expected: `TestTheErrorIDIsTheTraceID` FAILS. Restore.

---

### Task 7: The estate proves the chain — properties 1, 3, 4, 5, 9, 16, review-focus 1

**Files:**
- Modify: `internal/estate/estate.go`
- Create: `internal/estate/observability_test.go`

**Interfaces:**
- Consumes: `otlptest.Install`, `observe.Handler`.
- Produces: `(*Estate).Recorder() *otlptest.Recorder`; the estate's `rund` logger is wrapped with `observe.Handler`.

- [ ] **Step 1: Write the failing tests**

`internal/estate/observability_test.go`:
```go
package estate_test

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/nats-io/nats.go"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"google.golang.org/protobuf/proto"

	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/natscall"
	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/rundsvc"
	"github.com/garm-ai/garm-ai/serve"
)

func spans(t *testing.T, e *estate.Estate) (call, run, tool sdktrace.ReadOnlySpan) {
	t.Helper()
	rec := e.Recorder()
	var ok bool
	if call, ok = rec.SpanNamed("garm.call"); !ok {
		t.Fatal("no garm.call span")
	}
	if run, ok = rec.SpanNamed("garm.run.invoke"); !ok {
		t.Fatal("no garm.run.invoke span")
	}
	if tool, ok = rec.SpanNamed("garm.tool"); !ok {
		t.Fatal("no garm.tool span")
	}
	return
}

func attr(s sdktrace.ReadOnlySpan, key string) (string, bool) {
	for _, a := range s.Attributes() {
		if string(a.Key) == key {
			return a.Value.Emit(), true
		}
	}
	return "", false
}

// Property 1: one call is one trace, and the tool's parent is rund, not the caller.
// Property 5: the caller's account is on rund's span, and it is the server-placed one.
func TestOneCallIsOneTraceWithRundBetweenCallerAndTool(t *testing.T) {
	e := estate.New(t)
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, estate.RoleCaller)})
	if _, err := client.GetForecast(context.Background(), &weatherv1.GetForecastRequest{Place: "Ghent", Days: 1}); err != nil {
		t.Fatal(err)
	}
	call, run, tool := spans(t, e)
	if call.SpanContext().TraceID() != run.SpanContext().TraceID() || run.SpanContext().TraceID() != tool.SpanContext().TraceID() {
		t.Fatal("three spans, not one trace")
	}
	if run.Parent().SpanID() != call.SpanContext().SpanID() {
		t.Error("rund is not the caller's child")
	}
	if tool.Parent().SpanID() != run.SpanContext().SpanID() {
		t.Error("the tool is not rund's child")
	}
	acc, ok := attr(run, "garm.caller")
	if !ok || acc != e.AccountKey(estate.RoleCaller) {
		t.Errorf("garm.caller = %q, want the studio account %s", acc, e.AccountKey(estate.RoleCaller))
	}
}

// Property 3: rund's log line for the call carries the trace id.
func TestRundsLogLineCarriesTheTraceID(t *testing.T) {
	e := estate.New(t)
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, estate.RoleCaller)})
	if _, err := client.GetForecast(context.Background(), &weatherv1.GetForecastRequest{Place: "Ghent", Days: 1}); err != nil {
		t.Fatal(err)
	}
	_, run, _ := spans(t, e)
	want := "trace_id=" + run.SpanContext().TraceID().String()
	if !strings.Contains(e.RundLog(), want) {
		t.Fatalf("rund's log lacks %s:\n%s", want, e.RundLog())
	}
}

// Property 4: one successful call increments both counters by one, with the kind.
func TestCountersCountOneCall(t *testing.T) {
	e := estate.New(t)
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, estate.RoleCaller)})
	if _, err := client.GetForecast(context.Background(), &weatherv1.GetForecastRequest{Place: "Ghent", Days: 1}); err != nil {
		t.Fatal(err)
	}
	ctx := context.Background()
	const tool = "weather.v1.get_forecast"
	if n := e.Recorder().Counter(ctx, "garm.tool.calls", observe.KeyTool.String(tool), observe.KeyKind.String("OK")); n != 1 {
		t.Errorf("garm.tool.calls = %d", n)
	}
	if n := e.Recorder().Counter(ctx, "garm.run.invocations", observe.KeyTool.String(tool),
		observe.KeyCaller.String(e.AccountKey(estate.RoleCaller)), observe.KeyKind.String("OK")); n != 1 {
		t.Errorf("garm.run.invocations = %d", n)
	}
}

// Property 9: no span attribute carries the payload. The input holds a sentinel
// no envelope field could; every attribute on every span is checked for it.
func TestNoSpanAttributeCarriesThePayload(t *testing.T) {
	e := estate.New(t)
	const sentinel = "PAYLOAD-SENTINEL-7f3a"
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, estate.RoleCaller)})
	_, _ = client.GetForecast(context.Background(), &weatherv1.GetForecastRequest{Place: sentinel, Days: 1})
	if len(e.Recorder().Spans()) < 3 {
		t.Fatal("the call produced fewer than three spans; the check would be vacuous")
	}
	for _, s := range e.Recorder().Spans() {
		for _, a := range s.Attributes() {
			if strings.Contains(a.Value.Emit(), sentinel) {
				t.Errorf("span %s attribute %s carries the payload", s.Name(), a.Key)
			}
		}
	}
}

// Property 16: a malformed traceparent still yields a complete, attributed trace.
func TestAMalformedTraceparentStillYieldsAnAttributedTrace(t *testing.T) {
	e := estate.New(t)
	nc := e.Connect(t, estate.RoleCaller)
	body, _ := proto.Marshal(&runv1.InvokeRequest{Tool: "weather.v1.get_forecast",
		Input: mustMarshal(t, &weatherv1.GetForecastRequest{Place: "Ghent", Days: 1})})
	m := nats.NewMsg(rundsvc.SubjectInvoke)
	m.Data = body
	m.Header.Set("traceparent", "00-not-a-trace-at-all")
	if _, err := nc.RequestMsg(m, 5*time.Second); err != nil {
		t.Fatal(err)
	}
	rec := e.Recorder()
	run, ok := rec.SpanNamed("garm.run.invoke")
	if !ok {
		t.Fatal("no rund span")
	}
	tool, ok := rec.SpanNamed("garm.tool")
	if !ok {
		t.Fatal("no tool span")
	}
	if !run.SpanContext().IsValid() || run.Parent().IsValid() {
		t.Error("rund should have started a fresh ROOT trace")
	}
	if tool.Parent().SpanID() != run.SpanContext().SpanID() {
		t.Error("the tool is not rund's child")
	}
	if acc, _ := attr(run, "garm.caller"); acc != e.AccountKey(estate.RoleCaller) {
		t.Errorf("garm.caller = %q", acc)
	}
}

// Review focus 1: a caller with NO tracer and NO propagator still gets a traced
// run, as a root at rund.
func TestACallerWithoutATracerStillGetsATracedRun(t *testing.T) {
	e := estate.New(t)
	// Simulate "the caller process never called otlp.Start": swap in a no-op
	// propagator for the caller's injection only. The estate shares one process,
	// so inject by hand with nothing and send.
	nc := e.Connect(t, estate.RoleCaller)
	body, _ := proto.Marshal(&runv1.InvokeRequest{Tool: "weather.v1.get_forecast",
		Input: mustMarshal(t, &weatherv1.GetForecastRequest{Place: "Ghent", Days: 1})})
	m := nats.NewMsg(rundsvc.SubjectInvoke)
	m.Data = body // no traceparent at all
	if _, err := nc.RequestMsg(m, 5*time.Second); err != nil {
		t.Fatal(err)
	}
	run, ok := e.Recorder().SpanNamed("garm.run.invoke")
	if !ok || run.Parent().IsValid() {
		t.Fatal("rund should be the root of a fresh trace")
	}
}

// Property 2, end to end: the id a CALLER reads out of an INTERNAL error is the
// trace id of the tool span that produced it.
func TestTheIDACallerQuotesOpensTheTrace(t *testing.T) {
	e := estate.New(t)
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, estate.RoleCaller)})
	// The example handler returns a bare error for... <find the input that makes
	// weatherd.Service return a non-serve error, or add one to the example that
	// is clearly a probe -- e.g. Days < 0 -> errors.New("negative days")>.
	_, err := client.GetForecast(context.Background(), &weatherv1.GetForecastRequest{Place: "Ghent", Days: -1})
	var se *serve.Error
	if !errors.As(err, &se) || se.Kind.String() != "ERROR_KIND_INTERNAL" {
		t.Fatalf("want INTERNAL, got %v", err)
	}
	tool, ok := e.Recorder().SpanNamed("garm.tool")
	if !ok {
		t.Fatal("no tool span")
	}
	if !strings.Contains(se.Message, tool.SpanContext().TraceID().String()) {
		t.Fatalf("the caller was told %q; the trace is %s", se.Message, tool.SpanContext().TraceID())
	}
}

func mustMarshal(t *testing.T, m proto.Message) []byte {
	t.Helper()
	b, err := proto.Marshal(m)
	if err != nil {
		t.Fatal(err)
	}
	return b
}
```
Read `examples/weatherd/weatherd.go` first: if no input makes it return a bare `error`, add exactly one — `Days < 0` → `errors.New("days cannot be negative")` with a comment that it is deliberately a bare error so the INTERNAL path is exercisable end to end. (`rund` itself keeps the run id as its error id — see the spec amendment in §2 committed with this plan — so the only end-to-end INTERNAL-with-trace-id path is the tool's.) Remove unused imports (`otel`, `propagation`, `http`) if the final file does not use them.

- [ ] **Step 2: Run them**

Run: `mise exec -- go test ./internal/estate/ -run 'TestOneCall|TestRundsLog|TestCounters|TestNoSpan|TestAMalformed|TestACallerWithout|TestTheIDACaller' 2>&1 | tail -10`
Expected: compile FAIL — `e.Recorder`, `e.AccountKey` undefined.

- [ ] **Step 3: Estate changes**

In `estate.go`:
- import `"github.com/garm-ai/garm-ai/observe"` and `"github.com/garm-ai/garm-ai/observe/otlp/otlptest"`.
- `Estate` gains `rec *otlptest.Recorder`.
- In `New`, first line after `e := &Estate{}`: `e.rec = otlptest.Install(t)` with the comment: *the three processes share this one process, so one recorder sees the caller's, rund's and the tool's spans — which is what makes end-to-end linkage assertable at all.*
- `rund`'s logger: `Log: slog.New(observe.Handler(slog.NewTextHandler(e.rundLog, nil)))`.
- Add:
```go
// Recorder is what the estate's processes recorded: spans, counters, log records.
func (e *Estate) Recorder() *otlptest.Recorder { return e.rec }

// AccountKey is the public key of a caller role's account -- the value the
// server places at token 4 and rund reports as garm.caller.
func (e *Estate) AccountKey(as Role) string {
	pub, err := e.keys.Accounts[topology.CallerPrefix+string(as)].PublicKey()
	if err != nil {
		return ""
	}
	return pub
}
```
Check `topology.CallerPrefix` is the account-name prefix (`"CALLER-"`) and `Keys.Accounts` is keyed by account name — `grep -n "CallerPrefix\|Accounts " topology/topology.go`.

- [ ] **Step 4: Run; the whole estate-backed set**

Run: `mise exec -- go test ./internal/estate/ ./natscall/ ./cmd/garmctl/ ./examples/cmd/forecast/ 2>&1 | tail -10`
Expected: PASS.

- [ ] **Step 5: Commit; probe property 9**

```bash
git add internal/estate examples/weatherd
git commit -m "estate: one recorder across the three processes; the chain's observability properties"
```
Break: in `natsserve.answer`, add `attribute.String("garm.input", string(r.Data()))` to the span. Expected: `TestNoSpanAttributeCarriesThePayload` FAILS naming `garm.tool`/`garm.input`. Restore. Also probe property 1: in `rundsvc.ToolCaller.Call` inject from `context.Background()` instead of `ctx`. Expected: `TestOneCallIsOneTrace…` FAILS "the tool is not rund's child". Restore.

---

### Task 8: The caller's name — `callers.json`, `rund --callers`, property 13

**Files:**
- Create: `topology/callers.go`, `topology/callers_names_test.go`, `observe/callers.go`, `observe/callers_test.go`
- Modify: `cmd/garmctl/topology.go` (`writeOutput`), `cmd/garmctl/topology_test.go`, `rundsvc/rundsvc.go` (`Serve` signature), `cmd/rund/main.go`, `internal/estate/estate.go`, `internal/estate/observability_test.go`

**Interfaces:**
- Produces: `topology.CallerNames(out *Output) (map[string]string, error)` — **name → account public key**, callers only;
  `observe.CallerNames` = `map[string]string` **account public key → name**; `observe.LoadCallerNames(path string) (CallerNames, error)`;
  `rundsvc.Serve(svc *natsmicro.Service, e *run.Engine, names observe.CallerNames) error`; `rund --callers <path>`.

- [ ] **Step 1: Failing test for `topology.CallerNames`**

`topology/callers_names_test.go`:
```go
package topology_test

import (
	"testing"
	"time"

	"github.com/garm-ai/garm-ai/internal/fixtures"
	"github.com/garm-ai/garm-ai/topology"
)

// callers.json is name -> account public key, callers ONLY -- never SYS, GARM
// or TOOLS, which are not callers and whose keys a dashboard has no use for.
func TestCallerNamesIsEveryCallerAndNothingElse(t *testing.T) {
	keys := topology.FreshKeys([]string{"studio", "batch"})
	out, err := topology.Generate(topology.Input{Catalogue: fixtures.Weather(t).Catalogue,
		Callers: []string{"studio", "batch"}, Previous: topology.Empty(), Keys: keys, Now: time.Now()})
	if err != nil {
		t.Fatal(err)
	}
	names, err := topology.CallerNames(out)
	if err != nil {
		t.Fatal(err)
	}
	if len(names) != 2 {
		t.Fatalf("want 2 callers, got %v", names)
	}
	want, _ := keys.Accounts["CALLER-studio"].PublicKey()
	if names["studio"] != want {
		t.Errorf("studio -> %q, want %s", names["studio"], want)
	}
}
```

- [ ] **Step 2: Run** — `mise exec -- go test ./topology/ -run TestCallerNames 2>&1 | tail -3`. Expected: FAIL undefined.

- [ ] **Step 3: `topology/callers.go`**

```go
package topology

import (
	"fmt"
	"strings"

	"github.com/nats-io/jwt/v2"
)

// CallerNames is the public name -> account-key table a deployment hands rund as
// --callers, so a dashboard reads "studio" beside the key the server placed in
// the subject. Nothing secret: both halves are already in the account JWTs.
func CallerNames(out *Output) (map[string]string, error) {
	names := map[string]string{}
	for account, encoded := range out.Accounts {
		if !strings.HasPrefix(account, CallerPrefix) {
			continue
		}
		ac, err := jwt.DecodeAccountClaims(encoded)
		if err != nil {
			return nil, fmt.Errorf("account %s: %w", account, err)
		}
		names[strings.TrimPrefix(account, CallerPrefix)] = ac.Subject
	}
	return names, nil
}
```
Run the test. Expected: PASS.

- [ ] **Step 4: Failing test for `observe.LoadCallerNames`, including review-focus 3**

`observe/callers_test.go`:
```go
package observe_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/garm-ai/garm-ai/observe"
)

func write(t *testing.T, body string) string {
	t.Helper()
	p := filepath.Join(t.TempDir(), "callers.json")
	if err := os.WriteFile(p, []byte(body), 0o600); err != nil {
		t.Fatal(err)
	}
	return p
}

// The file is name -> key (what garmctl writes); the map is key -> name (what
// rund looks up). An unknown key is simply absent.
func TestLoadCallerNamesInvertsTheFile(t *testing.T) {
	names, err := observe.LoadCallerNames(write(t, `{"studio":"ACKEY1","batch":"ACKEY2"}`))
	if err != nil {
		t.Fatal(err)
	}
	if names["ACKEY1"] != "studio" || names["ACKEY2"] != "batch" {
		t.Fatalf("got %v", names)
	}
	if _, ok := names["ACUNKNOWN"]; ok {
		t.Fatal("an unknown key resolved")
	}
}

// Review focus 3: a broken file refuses, naming the file; two names for one key
// refuse too, because a label that could be either is a lie.
func TestABrokenCallersFileRefuses(t *testing.T) {
	for name, body := range map[string]string{"garbage": `{not json`, "duplicate key": `{"a":"ACKEY1","b":"ACKEY1"}`} {
		p := write(t, body)
		if _, err := observe.LoadCallerNames(p); err == nil || !strings.Contains(err.Error(), p) {
			t.Errorf("%s: err = %v, want one naming %s", name, err, p)
		}
	}
}
```
Add `"strings"` to imports.

- [ ] **Step 5: Run** — FAIL undefined. **Then `observe/callers.go`:**

```go
package observe

import (
	"encoding/json"
	"fmt"
	"os"
)

// CallerNames labels a caller's account key with the name the topology issued it
// under. A label, not an identity: the key is what the server placed in the
// subject; the name is what a person reads. An account the table does not know
// is reported by key alone and never dropped (spec §1.1).
type CallerNames map[string]string

// LoadCallerNames reads the callers.json garmctl topology writes: name -> key.
// Empty path means no table.
func LoadCallerNames(path string) (CallerNames, error) {
	if path == "" {
		return nil, nil
	}
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var byName map[string]string
	if err := json.Unmarshal(raw, &byName); err != nil {
		return nil, fmt.Errorf("%s: %w", path, err)
	}
	names := CallerNames{}
	for name, key := range byName {
		if prev, dup := names[key]; dup {
			return nil, fmt.Errorf("%s: %q and %q both name account %s", path, prev, name, key)
		}
		names[key] = name
	}
	return names, nil
}

// Name is the label for key, or "" and false.
func (c CallerNames) Name(key string) (string, bool) {
	n, ok := c[key]
	return n, ok
}
```
Run `./observe/`. Expected: PASS.

- [ ] **Step 6: `garmctl topology` writes it; test**

In `cmd/garmctl/topology.go` `writeOutput`, before `revocations.json`:
```go
	names, err := topology.CallerNames(res)
	if err != nil {
		return err
	}
	callers, _ := json.MarshalIndent(names, "", "  ")
	if err := os.WriteFile(filepath.Join(dir, "callers.json"), callers, 0o644); err != nil {
		return err
	}
```
(0o644: it is public; the creds beside it are 0o600 and that difference is the point.)

In `cmd/garmctl/topology_test.go` find the test that asserts the output layout (`grep -n "revocations.json" cmd/garmctl/topology_test.go`) and add: `callers.json` exists, parses, and has exactly the `--callers` names as keys. Run RED (file absent) → GREEN.

- [ ] **Step 7: `rundsvc.Serve` takes names; `rund --callers`; the estate passes its table; property 13**

`rundsvc.Serve(svc, e, names observe.CallerNames)`; store `names` in a small `handlers` struct or closure and in `withCaller`, after `KeyCaller`:
```go
	if name, ok := names.Name(acc); ok {
		span.SetAttributes(observe.KeyCallerName.String(name))
		ctx = context.WithValue(ctx, callerNameKey{}, name)
	}
```
and in `record`, add `KeyCallerName` to the counter attrs when present. `withCaller` therefore takes `names` as a parameter. Fix every `Serve` call: `cmd/rund/main.go` (load from `--callers`; a load error is fatal at start), `internal/estate/estate.go` (build with `topology.CallerNames(topo)` inverted — or simply `observe.CallerNames{e.AccountKey(RoleCaller): "studio", e.AccountKey(RoleCaller2): "batch"}` — and keep **one** caller, `batch`, OUT of the table so property 13's unknown half is real), `rundsvc/rundsvc_test.go` (`nil`).

`cmd/rund/main.go`: flag `callers = flag.String("callers", "", "callers.json as garmctl topology wrote it; names callers on spans and metrics")`, in the `starting` line, `observe.LoadCallerNames(*callers)` in `serveRund` before `rundsvc.Serve`.

Property 13 in `internal/estate/observability_test.go`:
```go
// Property 13: a known caller is named; an unknown one is counted by key alone.
func TestAKnownCallerIsNamedAndAnUnknownOneIsStillCounted(t *testing.T) {
	e := estate.New(t)
	for _, role := range []estate.Role{estate.RoleCaller, estate.RoleCaller2} {
		client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, role)})
		if _, err := client.GetForecast(context.Background(), &weatherv1.GetForecastRequest{Place: "Ghent", Days: 1}); err != nil {
			t.Fatal(err)
		}
	}
	ctx, rec := context.Background(), e.Recorder()
	const tool = "weather.v1.get_forecast"
	if n := rec.Counter(ctx, "garm.run.invocations", observe.KeyTool.String(tool), observe.KeyCaller.String(e.AccountKey(estate.RoleCaller)),
		observe.KeyCallerName.String("studio"), observe.KeyKind.String("OK")); n != 1 {
		t.Errorf("studio, named: %d", n)
	}
	if n := rec.Counter(ctx, "garm.run.invocations", observe.KeyTool.String(tool), observe.KeyCaller.String(e.AccountKey(estate.RoleCaller2)),
		observe.KeyKind.String("OK")); n != 1 {
		t.Errorf("batch, by key alone: %d", n)
	}
}
```
Run RED → GREEN.

- [ ] **Step 8: Whole suite; commit; probe**

Run: `mise exec -- go test ./... 2>&1 | tail -15`
Expected: PASS everywhere.
```bash
git add topology observe rundsvc cmd internal
git commit -m "callers.json: garmctl writes the name table, rund labels spans and counters with it; unknown callers stay by key"
```
Probe property 13's second half: in `withCaller`, `return` early (skip the handler) when the name is unknown. Expected: "batch, by key alone: 0". Restore.

---

### Task 9: The mains, the checks, the docs, the number

**Files:**
- Modify: `cmd/rund/main.go`, `examples/cmd/weatherd/main.go`, `examples/cmd/forecast/main.go`, `cmd/garmctl/main.go`, `mise.toml`, `docs/guide.md`, `docs/invariants.md`, `docs/roadmap.md`, `docs/performance.md`, `docs/specs/README.md`, `docs/reviews/2026-10-04-c-level-review.md` (Progress table)

- [ ] **Step 1: `mise.toml` — `no-sdk`, and `no-broker` extended. Prove each fails first.**

```toml
[tasks."no-broker"]
# ... existing comment ...
run = """
set -e
for pkg in ./serve ./call ./declared ./images ./fetch ./run ./examples/gen/...; do
  if go list -deps "$pkg" 2>/dev/null | grep -Eq 'nats-io|go.opentelemetry.io'; then
    echo "$pkg reaches a broker or OTel package:" >&2
    go list -deps "$pkg" | grep -E 'nats-io|go.opentelemetry.io' >&2
    echo "generated code and the seam it is written against import neither a broker nor OTel" >&2
    exit 1
  fi
done
"""

[tasks."no-sdk"]
description = "Refuse an OTel SDK or exporter import anywhere but observe/otlp"
# observe/otlp.Start configures the SDK, once, at the top of every main. Every
# other package uses the API, which is a no-op until then -- so a tool author
# with their own OTel setup is not fought, and a library here never installs
# process-global state on anyone's behalf (observability spec §7). Proved to
# fail: with `import _ "go.opentelemetry.io/otel/sdk/trace"` in natsserve.
run = """
set -e
for pkg in ./natsserve ./rundsvc ./natscall ./natsmicro ./observe ./topology; do
  if go list -deps "$pkg" 2>/dev/null | grep -Eq 'go.opentelemetry.io/otel/(sdk|exporters)'; then
    echo "$pkg reaches the OTel SDK:" >&2
    go list -deps "$pkg" | grep -E 'go.opentelemetry.io/otel/(sdk|exporters)' >&2
    echo "only observe/otlp configures the SDK; everything else uses the API" >&2
    exit 1
  fi
done
"""
```
Add `"no-sdk"` to `ci`'s `depends` after `"no-broker"`. Prove: add `import _ "go.opentelemetry.io/otel/sdk/trace"` to `natsserve/natsserve.go` → `mise run no-sdk` exits 1 naming natsserve; `git checkout -- natsserve/natsserve.go`. Prove `no-broker`'s extension: add `import _ "go.opentelemetry.io/otel"` to `serve/serve.go` → exits 1; restore. Note `./observe` is in the no-sdk list but imports `contrib/bridges/otelslog` — that is the API bridge, not the SDK; the pattern `otel/(sdk|exporters)` does not match it. Confirm by running.

- [ ] **Step 2: The mains**

Each `main` gets, right after building `log`:
```go
	log := slog.New(observe.Handler(slog.NewTextHandler(os.Stderr, nil)))
	stop, err := otlp.Start(ctx, *name, log)
	if err != nil {
		log.Error("observability", "error", err)
		os.Exit(1)
	}
	defer stop(context.Background())
```
`ctx` is `context.Background()` where none exists yet. In `rund` and `weatherd`, add `health = flag.String("health", "", "address for /livez and /readyz, e.g. 127.0.0.1:8080; empty means no listener")` and, after `svc.Start(nc)` succeeds (so `ready` can become true), when non-empty:
```go
	if health != "" {
		bound, stopHealth, err := observe.ServeHealth(ctx, health, svc.Ready)
		if err != nil {
			return err
		}
		defer stopHealth(context.Background())
		log.Info("health", "addr", bound)
	}
```
— `svc.Ready` for `rund` is the `natsmicro.Service`; for `weatherd` add `func (s *Service) Ready() bool { return s.svc.Ready() }` to `natsserve`. Start the listener **before** `Start` so a scheduler probing early gets 503 rather than connection refused: move the block above `svc.Start(nc)`. Every `starting` line gains `"health", *health` and `rund`'s gains `"callers", *callers`. `forecast` and `garmctl` call `otlp.Start` with service names `"forecast"` and `"garmctl"`; no health. **The `main` in `garmctl` has no logger today** — build one on stderr for the startup line only, and keep `--help` quiet: call `otlp.Start` inside `root()`'s `PersistentPreRunE`, not in `main`, so `garmctl --help` does not print an observability line.

Run: `mise exec -- go build ./... && mise exec -- go test ./cmd/... ./examples/... 2>&1 | tail -6`. Expected: builds; PASS. `cmd/garmctl`'s existing tests run `call` through the estate — the estate already installed `otlptest`; `otlp.Start` in `PersistentPreRunE` would then REPLACE the recorder's providers mid-test. Guard: in `root()`, skip `otlp.Start` when `OTEL_SDK_DISABLED=true`, and have the estate-backed garmctl tests `t.Setenv("OTEL_SDK_DISABLED", "true")`. Ruling to ledger: the command's own observability is not what those tests test.

- [ ] **Step 3: Docs — same commit as the flags**

`docs/guide.md` §4: after the `go run` block, add:
```markdown
Every process opens with the same two lines, and they are the whole of its
observability setup:

```go
log := slog.New(observe.Handler(slog.NewTextHandler(os.Stderr, nil)))
stop, err := otlp.Start(ctx, "weatherd", log)   // reads OTEL_EXPORTER_OTLP_ENDPOINT; none means export nothing
defer stop(ctx)
```

With no endpoint the startup line says `observability exporter=none` and nothing
leaves the process. To ship everything to OpenObserve, two variables:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=https://o2.example.com/api/garm
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic $(echo -n 'user@example.com:password' | base64)"
```

One call is one trace — `garm.call` in the caller, `garm.run.invoke` in `rund`
(with the caller's account and, given `--callers build/topo/callers.json`, its
name), `garm.tool` in the tool — and the id an `INTERNAL` error tells a caller to
quote is that trace's id. Logs go to stdout for you and over OTLP for the
backend; **do not also tail stdout into OpenObserve**, or every line arrives
twice. `--health 127.0.0.1:8080` serves `/livez` and `/readyz`; `/readyz` is 200
exactly when `nats micro ping` gets an answer from the service.
```
Also fix the sample log block to show the `observability exporter=none …` line.

`docs/invariants.md`, new `### Observability` subsection under Enforced, one row per property with its test name — properties 1–16 as landed (histogram property removed; note property 12's venue is `natsmicro`). Add `no-sdk` and the `no-broker` extension rows to the transport table.

`docs/roadmap.md`: the "Being built" table gains `| One trace per call; the quoted id is the trace id; counters; /readyz agrees with $SRV.PING; OTLP to OpenObserve | ✅ **9e** |`.

`docs/specs/README.md`: observability row → `active — built as step 9e`.

`docs/reviews/2026-10-04-c-level-review.md` Progress table: the observability finding → closed, naming this plan.

- [ ] **Step 4: `mise run ci`; the number**

Run: `mise run ci 2>&1 | tail -15`. Expected: every task green, including `breaking` (no proto change), `tidy`, `vuln`, `no-sdk`.

Run: `mise run bench 2>&1 | grep Benchmark`. Append a row to `docs/performance.md` with the new figures against the 2026-10-04 baseline (191k–221k serial / 229 allocs). Three spans and a propagator per call will cost allocations; **record the number, do not tune it** — and if serial crosses 300k ns/op say so in the row's note as the next thing to look at.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "observability: every main starts the SDK from the environment; health; no-sdk check; guide, invariants, roadmap, the benchmark row"
```

---

## Self-review

**Spec coverage.** §1 trace (Tasks 4–7) · §1.1 caller name (8) · §1.2 trust, retry event, no-span forwarding (5, 4, 5) · §2 error id (6, 7) · §3 logs (1, 7) · §4 counters, no histogram (1, 5, 6, 3) · §5 health and PING agreement (3) · §6 env, header names (2) · §7 two packages, explicit Start, import rule (1, 2, 9) · §8 table (all) · §9 properties 1–16: 1 T7 · 2 T6+T7 · 3 T7 · 4 T7 · 5 T7 · 6 T3 · 7 T2 · 8 T2 · 9 T7 · 10 T9 · 11 T6 · 12 T3 · 13 T8 · 14 T2 · 15 T4 · 16 T7 · §10 order followed (health moved after the API package because it needs the drain counter; step "3a" is Task 8) · §11 nothing built that it excludes.

**Spec amendments this plan requires** (committed with the plan): §2 — `rund`'s error id stays the **run id** (a caller can `Fetch` it; the span carries both `garm.run_id` and the trace id, so quoting either finds the trace); the tool's id becomes the trace id. §7 — `observe` is two packages, `observe` (API) and `observe/otlp` (SDK), because the import rule in the same section makes one package impossible. §8/§9 — property 12 is proved in `natsmicro` against a bare server (lifecycle agreement is not a permissions question); the estate does not need a listener. §4 — `garm.service.drain` is recorded by `natsmicro`.

**Placeholder scan.** Task 7 asks the implementer to read `weatherd.go` and add a bare-error input if none exists — that is a decision with its text given (`Days < 0`), not a TBD. Task 2 Step 6 corrects its own last line in place and names the file to read if v1.47.0's `logtest` differs. Task 6's review-focus 5 is deliberately covered by inspection with the reason stated.

**Type consistency.** `otlp.Start(ctx, service, log) (stop, err)` used identically in T2, T9. `observe.ServeHealth(ctx, addr, ready) (bound, stop, err)` in T3, T9. `rundsvc.Serve(svc, e, names)` in T8 for all three callers. `Recorder.Counter(ctx, name, attrs...)`, `SpanNamed(name)`, `Spans()` in T2, T4–T8. `observe.Kind(err)` in T1, T4, T5, T6. `KeyCaller` absent-not-empty rule stated in T5 and relied on in T7/T8.

**Review Focus.** Five lines, each pinned: 1 → T7, 2 → T2, 3 → T8, 4 → T3, 5 → T6 (inspection, reasoned).
