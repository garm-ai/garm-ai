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
	KeyTool           = attribute.Key("garm.tool")
	KeyCaller         = attribute.Key("garm.caller")      // the account public key
	KeyCallerName     = attribute.Key("garm.caller_name") // a label; may be absent
	KeyRunID          = attribute.Key("garm.run_id")
	KeyIdempotencyKey = attribute.Key("garm.idempotency_key")
	KeyDeadlineMillis = attribute.Key("garm.deadline_ms")
	KeyKind           = attribute.Key("garm.kind")
	KeyRequestBytes   = attribute.Key("garm.request_bytes")
	KeyResponseBytes  = attribute.Key("garm.response_bytes")
	KeyService        = attribute.Key("garm.service")
	KeyQueued         = attribute.Key("garm.queued") // bool: was anything waiting at the drain
)

// Tracer is the module's tracer, from whatever provider is global.
func Tracer() trace.Tracer { return otel.Tracer(Scope) }

// Kind is the metric label for an outcome: "OK" for nil, else the error's kind
// without the enum prefix. A bare error is INTERNAL, exactly as serve.Wire says
// -- one definition of "what kind is this", not a second one here.
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
	instrumentsMu sync.Mutex
	instruments   *Metrics
)

// Instruments returns the one set. A second meter for the same idea is the
// "one idea, two implementations" this repository exists to stop, so there is
// no constructor to call twice.
func Instruments() *Metrics {
	instrumentsMu.Lock()
	defer instrumentsMu.Unlock()
	if instruments == nil {
		instruments = newInstruments()
	}
	return instruments
}

func newInstruments() *Metrics {
	m := otel.Meter(Scope)
	return &Metrics{
		ToolCalls:            must(m.Int64Counter("garm.tool.calls", metric.WithDescription("tool calls answered, by outcome kind"))),
		ToolInflight:         must(m.Int64UpDownCounter("garm.tool.inflight", metric.WithDescription("tool calls being answered now"))),
		ToolDeadlineExceeded: must(m.Int64Counter("garm.tool.deadline_exceeded", metric.WithDescription("tool calls that ran past their declared deadline"))),
		RunInvocations:       must(m.Int64Counter("garm.run.invocations", metric.WithDescription("invocations rund answered, by caller and outcome kind"))),
		ServiceDrain:         must(m.Int64Counter("garm.service.drain", metric.WithDescription("drains, with how many calls were in flight"))),
	}
}

// must: the API returns an error only for an invalid instrument NAME, which is a
// constant above. Panicking at first use is the right response to a typo here.
func must[T any](v T, err error) T {
	if err != nil {
		panic(err)
	}
	return v
}
