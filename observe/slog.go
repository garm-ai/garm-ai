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
