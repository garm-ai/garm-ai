package estate_test

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"github.com/nats-io/nats.go"
	"go.opentelemetry.io/otel/attribute"
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

const forecastTool = "weather.v1.get_forecast"

func forecast(t *testing.T, e *estate.Estate, as estate.Role, place string) error {
	t.Helper()
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, as)})
	_, err := client.GetForecast(context.Background(), &weatherv1.GetForecastRequest{Place: place, Days: 1})
	return err
}

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

func mustMarshal(t *testing.T, m proto.Message) []byte {
	t.Helper()
	b, err := proto.Marshal(m)
	if err != nil {
		t.Fatal(err)
	}
	return b
}

// rawInvoke sends an InvokeRequest with exactly these headers -- no natscall, so
// no span is opened on the caller's side.
func rawInvoke(t *testing.T, e *estate.Estate, headers map[string]string) {
	t.Helper()
	nc := e.Connect(t, estate.RoleCaller)
	m := nats.NewMsg(rundsvc.SubjectInvoke)
	m.Data = mustMarshal(t, &runv1.InvokeRequest{Tool: forecastTool,
		Input: mustMarshal(t, &weatherv1.GetForecastRequest{Place: "Ghent", Days: 1})})
	for k, v := range headers {
		m.Header.Set(k, v)
	}
	if _, err := nc.RequestMsg(m, 5*time.Second); err != nil {
		t.Fatal(err)
	}
}

// Property 1: one call is one trace, and the tool's parent is rund, not the caller.
// Property 5: the caller's account is on rund's span, and it is the server-placed one.
func TestOneCallIsOneTraceWithRundBetweenCallerAndTool(t *testing.T) {
	e := estate.New(t)
	if err := forecast(t, e, estate.RoleCaller, "Ghent"); err != nil {
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
	if err := forecast(t, e, estate.RoleCaller, "Ghent"); err != nil {
		t.Fatal(err)
	}
	_, run, _ := spans(t, e)
	want := "trace_id=" + run.SpanContext().TraceID().String()
	if !strings.Contains(e.RundLog(), want) {
		t.Fatalf("rund's log lacks %s:\n%s", want, e.RundLog())
	}
	// Not only rundsvc's thin "invoke caller=" line: the ENGINE's line -- the one
	// with the run id, the correlation id and the catalogue -- is the one an
	// operator reads, and it must be joined too.
	var engineLine string
	for _, line := range strings.Split(e.RundLog(), "\n") {
		if strings.Contains(line, "msg=invoked") {
			engineLine = line
		}
	}
	if engineLine == "" || !strings.Contains(engineLine, want) {
		t.Fatalf("the engine's 'invoked' line is not joined to the trace: %q", engineLine)
	}
}

// Property 4: one successful call increments both counters by one, with the kind.
func TestCountersCountOneCall(t *testing.T) {
	e := estate.New(t)
	if err := forecast(t, e, estate.RoleCaller, "Ghent"); err != nil {
		t.Fatal(err)
	}
	ctx := context.Background()
	if n := e.Recorder().Counter(ctx, "garm.tool.calls", observe.KeyTool.String(forecastTool), observe.KeyKind.String("OK")); n != 1 {
		t.Errorf("garm.tool.calls = %d", n)
	}
	// studio is in the estate's --callers table, so its point carries the name too;
	// Counter matches the attribute set EXACTLY, which is what pins "absent, not
	// empty" for the unnamed caller in property 13.
	if n := e.Recorder().Counter(ctx, "garm.run.invocations", observe.KeyTool.String(forecastTool),
		observe.KeyCaller.String(e.AccountKey(estate.RoleCaller)), observe.KeyCallerName.String("studio"), observe.KeyKind.String("OK")); n != 1 {
		t.Errorf("garm.run.invocations = %d", n)
	}
}

// Property 9: no span attribute carries the payload. The input holds a sentinel
// no envelope field could; every attribute on every span is checked for it.
func TestNoSpanAttributeCarriesThePayload(t *testing.T) {
	e := estate.New(t)
	const sentinel = "PAYLOAD-SENTINEL-7f3a"
	_ = forecast(t, e, estate.RoleCaller, sentinel)
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
	// The shipped log records too -- body and attributes. The guarantee is about
	// what the ENVELOPE puts there; a tool author's own error text is theirs, and
	// the guide says so.
	for _, r := range e.Recorder().Logs() {
		if strings.Contains(r.Body().Emit(), sentinel) {
			t.Errorf("a shipped log body carries the payload: %s", r.Body())
		}
		r.WalkAttributes(func(kv attribute.KeyValue) bool {
			if strings.Contains(kv.Value.Emit(), sentinel) {
				t.Errorf("shipped log attribute %s carries the payload", kv.Key)
			}
			return true
		})
	}
}

// Property 16: a malformed traceparent still yields a complete, attributed trace,
// with rund as its root.
func TestAMalformedTraceparentStillYieldsAnAttributedTrace(t *testing.T) {
	e := estate.New(t)
	rawInvoke(t, e, map[string]string{"traceparent": "00-not-a-trace-at-all"})
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

// Review focus 1: a caller with NO tracer sends no traceparent at all, and still
// gets a traced run, rooted at rund.
func TestACallerWithoutATracerStillGetsATracedRun(t *testing.T) {
	e := estate.New(t)
	rawInvoke(t, e, nil)
	run, ok := e.Recorder().SpanNamed("garm.run.invoke")
	if !ok || run.Parent().IsValid() {
		t.Fatal("rund should be the root of a fresh trace")
	}
}

// Property 2, end to end: the id a CALLER reads out of an INTERNAL error opens
// the trace. Through rund that id is the RUN id (spec §2): it is garm.run_id on
// rund's span, which shares its trace with the tool span that failed -- so
// searching the backend for the quoted id lands on the whole trace.
func TestTheIDACallerQuotesOpensTheTrace(t *testing.T) {
	e := estate.New(t)
	err := forecast(t, e, estate.RoleCaller, "") // the example answers a bare error
	var se *serve.Error
	if !errors.As(err, &se) || se.Kind.String() != "ERROR_KIND_INTERNAL" {
		t.Fatalf("want INTERNAL, got %v", err)
	}
	_, run, tool := spans(t, e)
	runID, ok := attr(run, "garm.run_id")
	if !ok || runID == "" {
		t.Fatal("rund's span carries no run id")
	}
	if !strings.Contains(se.Message, runID) {
		t.Fatalf("the caller was told %q; rund's run id is %s", se.Message, runID)
	}
	if run.SpanContext().TraceID() != tool.SpanContext().TraceID() {
		t.Fatal("the run's trace is not the failing tool's trace")
	}
	if kind, _ := attr(tool, "garm.kind"); kind != "INTERNAL" {
		t.Errorf("the tool span says %q, want INTERNAL", kind)
	}
}

// Property 13: a known caller is named; an unknown one is counted by key alone.
// The estate's table names studio and deliberately NOT batch.
func TestAKnownCallerIsNamedAndAnUnknownOneIsStillCounted(t *testing.T) {
	e := estate.New(t)
	for _, role := range []estate.Role{estate.RoleCaller, estate.RoleCaller2} {
		if err := forecast(t, e, role, "Ghent"); err != nil {
			t.Fatal(err)
		}
	}
	ctx, rec := context.Background(), e.Recorder()
	if n := rec.Counter(ctx, "garm.run.invocations", observe.KeyTool.String(forecastTool), observe.KeyCaller.String(e.AccountKey(estate.RoleCaller)),
		observe.KeyCallerName.String("studio"), observe.KeyKind.String("OK")); n != 1 {
		t.Errorf("studio, named: %d", n)
	}
	if n := rec.Counter(ctx, "garm.run.invocations", observe.KeyTool.String(forecastTool), observe.KeyCaller.String(e.AccountKey(estate.RoleCaller2)),
		observe.KeyKind.String("OK")); n != 1 {
		t.Errorf("batch, by key alone: %d", n)
	}
	_, run, _ := spans(t, e)
	if name, _ := attr(run, "garm.caller_name"); name != "studio" {
		t.Errorf("garm.caller_name on the first span = %q, want studio", name)
	}
}
