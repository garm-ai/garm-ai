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
	names := []string{}
	for _, kv := range strings.Split(list, ",") {
		if k, _, ok := strings.Cut(strings.TrimSpace(kv), "="); ok && k != "" {
			names = append(names, k)
		}
	}
	sort.Strings(names)
	return names
}
