package otlp_test

import (
	"context"
	"log/slog"
	"testing"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/baggage"
	"go.opentelemetry.io/otel/metric"

	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/observe/otlp/otlptest"
)

// otlptest sees a span, a counter and a log record recorded through the API side.
func TestTheRecorderSeesWhatTheAPIRecords(t *testing.T) {
	rec := otlptest.Install(t)
	ctx, span := observe.Tracer().Start(context.Background(), "probe")
	span.End()
	observe.Instruments().ToolCalls.Add(ctx, 1, metric.WithAttributes(observe.KeyTool.String("x"), observe.KeyKind.String("OK")))
	slog.New(observe.Handler(slog.DiscardHandler)).InfoContext(ctx, "a line")

	if _, ok := rec.SpanNamed("probe"); !ok {
		t.Fatal("the span was not recorded")
	}
	if n := rec.Counter(ctx, "garm.tool.calls", observe.KeyTool.String("x"), observe.KeyKind.String("OK")); n != 1 {
		t.Fatalf("garm.tool.calls = %d, want 1", n)
	}
	logs := rec.Logs()
	if len(logs) != 1 || logs[0].Body().AsString() != "a line" {
		t.Fatalf("logs = %v, want one record 'a line'", logs)
	}
	if logs[0].TraceID() != span.SpanContext().TraceID() {
		t.Fatal("the log record is not joined to the span's trace")
	}
}

// The test estate propagates what production propagates -- trace context AND
// baggage -- so a baggage regression cannot hide behind a test-only propagator.
func TestTheRecorderPropagatesBaggageLikeProduction(t *testing.T) {
	otlptest.Install(t)
	member, err := baggage.NewMember("tenant", "acme")
	if err != nil {
		t.Fatal(err)
	}
	bag, err := baggage.New(member)
	if err != nil {
		t.Fatal(err)
	}
	ctx := baggage.ContextWithBaggage(context.Background(), bag)
	h := observe.HeaderCarrier{}
	otel.GetTextMapPropagator().Inject(ctx, h)
	got := baggage.FromContext(otel.GetTextMapPropagator().Extract(context.Background(), h))
	if got.Member("tenant").Value() != "acme" {
		t.Fatalf("baggage did not cross the hop: headers %v", h.Keys())
	}
}
