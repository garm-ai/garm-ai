package otlp_test

import (
	"context"
	"log/slog"
	"testing"

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
