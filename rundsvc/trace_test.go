package rundsvc_test

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/nats-io/nats.go"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/codes"
	"google.golang.org/protobuf/proto"

	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
	"github.com/garm-ai/garm-ai/natsserve"
	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/observe/otlp/otlptest"
	"github.com/garm-ai/garm-ai/rundsvc"
)

// A failed fetch is marked as one: the span carries the kind and an error
// status, as invoke's does. Found in review as an inconsistency.
func TestAFailedFetchIsMarkedOnItsSpan(t *testing.T) {
	rec := otlptest.Install(t)
	caller, _ := bareServer(t)
	m := nats.NewMsg(asRewritten(rundsvc.SubjectFetch))
	m.Data = mustMarshal(t, &runv1.FetchRequest{}) // no run id: INVALID
	if _, err := caller.RequestMsg(m, 2*time.Second); err != nil {
		t.Fatal(err)
	}
	span, ok := rec.SpanNamed("garm.run.fetch")
	if !ok {
		t.Fatal("no garm.run.fetch span")
	}
	var kind string
	for _, a := range span.Attributes() {
		if a.Key == observe.KeyKind {
			kind = a.Value.AsString()
		}
	}
	if kind != "INVALID" || span.Status().Code != codes.Error {
		t.Fatalf("kind=%q status=%v; want INVALID and an error status", kind, span.Status().Code)
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

// watchTool sees a copy of every request that reaches the weather tool and
// reports the traceparent it carried.
func watchTool(t *testing.T, nc *nats.Conn) <-chan string {
	t.Helper()
	seen := make(chan string, 1)
	sub, err := nc.Subscribe(natsserve.Subject("weather.v1.get_forecast"), func(m *nats.Msg) {
		seen <- m.Header.Get("traceparent")
	})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = sub.Unsubscribe() })
	if err := nc.Flush(); err != nil {
		t.Fatal(err)
	}
	return seen
}

func forecastInvoke(t *testing.T) *nats.Msg {
	t.Helper()
	m := nats.NewMsg(asRewritten(rundsvc.SubjectInvoke))
	m.Data = mustMarshal(t, &runv1.InvokeRequest{Tool: "weather.v1.get_forecast",
		Input: mustMarshal(t, &weatherv1.GetForecastRequest{Place: "Ghent", Days: 1})})
	return m
}

// The tool receives RUND's span context, not the caller's: the tool span must be
// a child of garm.run.invoke, which is a child of the caller's. Checked on the
// wire -- what traceparent reached garm.tool.* -- against the recorded span.
func TestTheToolCallCarriesRundsOwnSpanNotTheCallers(t *testing.T) {
	rec := otlptest.Install(t)
	caller, _ := bareServer(t)
	toTool := watchTool(t, caller)

	ctx, callerSpan := observe.Tracer().Start(context.Background(), "garm.call")
	m := forecastInvoke(t)
	otel.GetTextMapPropagator().Inject(ctx, observe.HeaderCarrier(m.Header))
	if _, err := caller.RequestMsg(m, 2*time.Second); err != nil {
		t.Fatal(err)
	}
	callerSpan.End()

	rundSpan, ok := rec.SpanNamed("garm.run.invoke")
	if !ok {
		t.Fatal("no garm.run.invoke span")
	}
	if rundSpan.Parent().SpanID() != callerSpan.SpanContext().SpanID() {
		t.Fatal("rund's span is not a child of the caller's")
	}
	onWire := <-toTool
	if !strings.Contains(onWire, rundSpan.SpanContext().SpanID().String()) {
		t.Fatalf("the tool received %q; want rund's span %s, not the caller's %s",
			onWire, rundSpan.SpanContext().SpanID(), callerSpan.SpanContext().SpanID())
	}
	if !strings.Contains(onWire, rundSpan.SpanContext().TraceID().String()) {
		t.Fatalf("the tool received %q; not the caller's trace %s", onWire, rundSpan.SpanContext().TraceID())
	}
}

// With no span anywhere -- no tracer, and a caller header the propagator rejects
// -- rund forwards NOTHING, rather than a verbatim copy of whatever arrived.
func TestWithNoSpanRundForwardsNoTraceparent(t *testing.T) {
	// No otlptest.Install: the globals are the OTel no-ops.
	caller, _ := bareServer(t)
	toTool := watchTool(t, caller)

	m := forecastInvoke(t)
	m.Header.Set("traceparent", "not-a-traceparent")
	if _, err := caller.RequestMsg(m, 2*time.Second); err != nil {
		t.Fatal(err)
	}
	if got := <-toTool; got != "" {
		t.Fatalf("rund forwarded traceparent %q with no span to forward", got)
	}
}

// The invocation counter carries the tool and the kind. The bare server places
// no real account key, so the caller attribute is ABSENT here -- not empty -- and
// the estate test asserts it is present there.
func TestAnInvocationIsCounted(t *testing.T) {
	rec := otlptest.Install(t)
	caller, _ := bareServer(t)
	m := nats.NewMsg(asRewritten(rundsvc.SubjectInvoke))
	m.Data = mustMarshal(t, &runv1.InvokeRequest{Tool: "no.such.tool"})
	if _, err := caller.RequestMsg(m, 2*time.Second); err != nil {
		t.Fatal(err)
	}
	ctx := context.Background()
	if n := rec.Counter(ctx, "garm.run.invocations", observe.KeyTool.String("no.such.tool"), observe.KeyKind.String("NOT_FOUND")); n != 1 {
		t.Fatalf("garm.run.invocations{no.such.tool,NOT_FOUND} = %d, want 1", n)
	}
}
