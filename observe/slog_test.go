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
	prev := otel.GetTracerProvider()
	otel.SetTracerProvider(tp)
	t.Cleanup(func() { otel.SetTracerProvider(prev) })

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
