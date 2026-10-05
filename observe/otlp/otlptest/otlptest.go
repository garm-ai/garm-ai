// Package otlptest installs in-memory recorders as the process's global OTel
// providers, for tests that assert what a call produced. Tests only; a test
// using it must not run in parallel with another, because the globals are one.
package otlptest

import (
	"context"
	"sync"
	"testing"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/propagation"
	sdklog "go.opentelemetry.io/otel/sdk/log"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/metric/metricdata"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/sdk/trace/tracetest"

	"github.com/garm-ai/garm-ai/observe"
)

// Recorder holds what the process recorded since Install.
type Recorder struct {
	spans  *tracetest.InMemoryExporter
	reader *sdkmetric.ManualReader
	logs   *logSink
}

// Install replaces the globals for the duration of t, with the same propagator
// otlp.Start installs, so context crosses hops exactly as it does in production.
//
// The globals are one per process, so a test using this cannot run in parallel
// with another; t.Setenv makes that a panic rather than a comment.
func Install(t testing.TB) *Recorder {
	t.Helper()
	t.Setenv("GARM_OTLPTEST", "1")
	r := &Recorder{spans: tracetest.NewInMemoryExporter(), reader: sdkmetric.NewManualReader(), logs: &logSink{}}
	tp := sdktrace.NewTracerProvider(sdktrace.WithSyncer(r.spans))
	mp := sdkmetric.NewMeterProvider(sdkmetric.WithReader(r.reader))
	lp := sdklog.NewLoggerProvider(sdklog.WithProcessor(sdklog.NewSimpleProcessor(r.logs)))
	prevTP, prevMP, prevLP, prevProp := otel.GetTracerProvider(), otel.GetMeterProvider(), otel.GetLoggerProvider(), otel.GetTextMapPropagator()
	otel.SetTracerProvider(tp)
	otel.SetMeterProvider(mp)
	otel.SetLoggerProvider(lp)
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))
	// The instruments are bound to the meter that was global when first asked
	// for; an earlier test in this binary may have bound them to the previous one.
	observe.ResetInstrumentsForTest()
	t.Cleanup(func() {
		_ = tp.Shutdown(context.Background())
		_ = mp.Shutdown(context.Background())
		_ = lp.Shutdown(context.Background())
		otel.SetTracerProvider(prevTP)
		otel.SetMeterProvider(prevMP)
		otel.SetLoggerProvider(prevLP)
		otel.SetTextMapPropagator(prevProp)
		observe.ResetInstrumentsForTest()
	})
	return r
}

// Spans is every ended span so far.
func (r *Recorder) Spans() []sdktrace.ReadOnlySpan { return r.spans.GetSpans().Snapshots() }

// SpanNamed is the first ended span with that name.
func (r *Recorder) SpanNamed(name string) (sdktrace.ReadOnlySpan, bool) {
	for _, s := range r.Spans() {
		if s.Name() == name {
			return s, true
		}
	}
	return nil, false
}

// Counter is the current value of an int64 counter for EXACTLY these attributes;
// zero if never recorded. Exact, so a test that expects an attribute to be absent
// is not satisfied by a point that carries it empty.
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

// Logs is every record the bridge emitted.
func (r *Recorder) Logs() []sdklog.Record { return r.logs.records() }

// logSink is an sdklog.Exporter that keeps records in memory. Twenty lines,
// rather than a module: v1.47.0's sdk/log ships no logtest package.
type logSink struct {
	mu   sync.Mutex
	recs []sdklog.Record
}

func (s *logSink) Export(_ context.Context, recs []sdklog.Record) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, r := range recs {
		s.recs = append(s.recs, r.Clone())
	}
	return nil
}
func (s *logSink) Shutdown(context.Context) error   { return nil }
func (s *logSink) ForceFlush(context.Context) error { return nil }
func (s *logSink) records() []sdklog.Record {
	s.mu.Lock()
	defer s.mu.Unlock()
	return append([]sdklog.Record(nil), s.recs...)
}
