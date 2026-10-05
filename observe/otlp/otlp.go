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
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/propagation"
	sdklog "go.opentelemetry.io/otel/sdk/log"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

// The standard variables. Read here only to DECIDE and to LOG; the exporters read
// them again themselves, which is what keeps this in step with every collector.
// A signal-specific endpoint is honoured as given (no suffix appended), exactly
// as the exporters treat it; the generic one gets /v1/<signal> appended by them.
const (
	envEndpoint = "OTEL_EXPORTER_OTLP_ENDPOINT"
	envTraces   = "OTEL_EXPORTER_OTLP_TRACES_ENDPOINT"
	envMetrics  = "OTEL_EXPORTER_OTLP_METRICS_ENDPOINT"
	envLogs     = "OTEL_EXPORTER_OTLP_LOGS_ENDPOINT"
	envHeaders  = "OTEL_EXPORTER_OTLP_HEADERS"
	envDisabled = "OTEL_SDK_DISABLED"
)

// FlushTimeout bounds the final flush: a dead backend must not turn a clean
// shutdown into a hang past an orchestrator's grace period.
const FlushTimeout = 5 * time.Second

// Start installs the global tracer, meter and logger providers, and the W3C
// propagator, and returns the function that flushes and stops them.
//
// Two quiet modes, deliberately different. With NO ENDPOINT the providers are
// installed without exporters: spans still get ids, because the id a caller
// quotes is the trace id whether or not anything is shipped, and three
// processes' stdout still join on it; nothing leaves the process. With
// OTEL_SDK_DISABLED=true -- the standard OFF switch -- nothing is installed at
// all: no ids, no bridge, no propagator, nothing added to the wire; off means
// off. The startup line says which, with header NAMES and never values (§6).
func Start(ctx context.Context, service string, log *slog.Logger) (stop func(context.Context) error, err error) {
	if log == nil {
		log = slog.Default()
	}
	if strings.EqualFold(os.Getenv(envDisabled), "true") {
		log.Info("observability", "exporter", "none", "disabled", true, "service", service)
		return func(context.Context) error { return nil }, nil
	}
	endpoint := os.Getenv(envEndpoint)
	// Each signal exports if it has an endpoint of its own or the generic one.
	signals := map[string]string{}
	for _, v := range []string{envEndpoint, envTraces, envMetrics, envLogs} {
		if os.Getenv(v) != "" {
			signals[v] = os.Getenv(v)
		}
	}
	export := len(signals) > 0
	traces := endpoint != "" || os.Getenv(envTraces) != ""
	metrics := endpoint != "" || os.Getenv(envMetrics) != ""
	logs := endpoint != "" || os.Getenv(envLogs) != ""

	// OTEL_SERVICE_NAME wins over the name the process was given: Merge takes the
	// second argument's value for a key both carry.
	fromEnv, err := resource.New(ctx, resource.WithFromEnv(), resource.WithTelemetrySDK())
	if err != nil {
		return nil, fmt.Errorf("observability resource: %w", err)
	}
	res, err := resource.Merge(resource.NewSchemaless(attribute.String("service.name", service)), fromEnv)
	if err != nil {
		return nil, fmt.Errorf("observability resource: %w", err)
	}

	var (
		traceOpts  = []sdktrace.TracerProviderOption{sdktrace.WithResource(res)}
		metricOpts = []sdkmetric.Option{sdkmetric.WithResource(res)}
		logOpts    = []sdklog.LoggerProviderOption{sdklog.WithResource(res)}
	)
	if traces {
		te, err := otlptracehttp.New(ctx)
		if err != nil {
			return nil, fmt.Errorf("trace exporter: %w", err)
		}
		traceOpts = append(traceOpts, sdktrace.WithBatcher(te))
	}
	if metrics {
		me, err := otlpmetrichttp.New(ctx)
		if err != nil {
			return nil, fmt.Errorf("metric exporter: %w", err)
		}
		metricOpts = append(metricOpts, sdkmetric.WithReader(sdkmetric.NewPeriodicReader(me)))
	}
	if logs {
		le, err := otlploghttp.New(ctx)
		if err != nil {
			return nil, fmt.Errorf("log exporter: %w", err)
		}
		logOpts = append(logOpts, sdklog.WithProcessor(sdklog.NewBatchProcessor(le)))
	}
	tp := sdktrace.NewTracerProvider(traceOpts...)
	mp := sdkmetric.NewMeterProvider(metricOpts...)
	lp := sdklog.NewLoggerProvider(logOpts...)
	otel.SetTracerProvider(tp)
	otel.SetMeterProvider(mp)
	otel.SetLoggerProvider(lp)
	// Without this the global propagator is a no-op and nothing crosses a hop.
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))

	exporter := "none"
	if export {
		exporter = "otlp"
	}
	// Which variables are in force, by NAME, so a deployment that set the
	// signal-specific one sees it acknowledged rather than told exporter=none.
	inForce := make([]string, 0, len(signals))
	for v := range signals {
		inForce = append(inForce, v)
	}
	sort.Strings(inForce)
	log.Info("observability", "exporter", exporter, "endpoint", endpoint, "endpoints", inForce,
		"headers", headerNames(os.Getenv(envHeaders)), "disabled", false, "service", service)

	return func(ctx context.Context) error {
		// Bounded, whatever ctx the caller passed: the exporters retry for up to
		// a minute by default, and a flush that outlives an orchestrator's grace
		// period is a SIGKILL that looks like a hang.
		if _, has := ctx.Deadline(); !has {
			var cancel context.CancelFunc
			ctx, cancel = context.WithTimeout(ctx, FlushTimeout)
			defer cancel()
		}
		return errors.Join(tp.Shutdown(ctx), mp.Shutdown(ctx), lp.Shutdown(ctx))
	}, nil
}

// headerNames is the NAMES in a `k=v,k2=v2` header list, sorted. The values are
// credentials and are never logged.
func headerNames(list string) []string {
	names := []string{}
	for _, kv := range strings.Split(list, ",") {
		if k, _, ok := strings.Cut(strings.TrimSpace(kv), "="); ok && k != "" {
			names = append(names, k)
		}
	}
	sort.Strings(names)
	return names
}
