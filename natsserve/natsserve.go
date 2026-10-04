// Package natsserve answers declared tools over NATS, as a micro service.
//
// It is the only package here that imports a broker. Generated code imports
// serve.Registrar and nothing else, so a tool author's module never resolves this
// one, and replacing the transport regenerates nothing.
//
// # A subject is derived from the tool's IDENTITY
//
//	garm.tool.<declared name>     garm.tool.weather.v1.get_forecast
//	                              garm.tool.trip-planner
//
// Not from the proto path. The estate this replaces routed on the ADDRESS --
// contracts/wire.Subject turned /calc.v1.Calculator/Add into calc.v1.Calculator.Add
// -- which throws away the whole point of separating the two: a tool re-homed to a
// different proto package, service or method keeps its subject here, because its
// name never changed. It also deletes a workaround, since that estate derived
// endpoint names from the full subject "because two proto services in one process
// would otherwise both offer an endpoint called Get". Names are unique, so that
// cannot happen.
//
// An agent is a tool, so a decider mounts one through this same interface. Nothing
// here knows which is which, which is what keeps routing-is-registration true.
package natsserve

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/micro"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protoreflect"

	"github.com/garm-ai/garm-ai/natsmicro"
	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/serve"
)

// SubjectPrefix namespaces every tool call.
//
// A constant, not configuration. It keeps our traffic apart from everything else on
// a cluster and makes `garm.tool.>` a usable observation point; two deployments
// sharing one cluster are separated by NATS accounts, which is the mechanism that
// exists for it. A configurable prefix would be a knob nothing enforces.
const SubjectPrefix = "garm.tool."

// Subject is where a tool is answered. Exported because a caller needs the same
// derivation, and a caller computing it differently is the drift this prevents.
func Subject(toolName string) string { return SubjectPrefix + toolName }

// endpointName is what $SRV.INFO shows.
//
// micro's name charset is ^[A-Za-z0-9\-_]+$ -- it excludes the dot -- while a tool
// name is dot-separated segments of exactly that charset. So replacing the dots is
// total: declared.validateName already guarantees every other character is legal.
func endpointName(toolName string) string { return strings.ReplaceAll(toolName, ".", "_") }

// Config is what a deployment knows and generated code does not.
//
// Logger receives the cause chain of every error, keyed by the id the caller is
// given -- the other half of "the cause never crosses the wire", because without
// it the cause is not hidden, it is lost.
type Config = natsmicro.Config

type endpoint struct {
	tool    string
	method  protoreflect.FullName
	budget  time.Duration
	newReq  func() proto.Message
	handle  func(context.Context, proto.Message) (proto.Message, error)
	subject string
}

// Service answers declared tools. It implements serve.Registrar.
//
// The micro lifecycle -- mounting, the flush that makes Start's promise true, and
// the three-step drain -- is natsmicro's. What is here is the TOOL semantics:
// where a tool's subject comes from, how its budget becomes a deadline, and how an
// error reaches a caller.
type Service struct {
	svc *natsmicro.Service
	log *slog.Logger
}

// New validates what micro would otherwise reject at Start.
func New(cfg Config) (*Service, error) {
	svc, err := natsmicro.New(cfg)
	if err != nil {
		return nil, err
	}
	return &Service{svc: svc, log: svc.Log()}, nil
}

// Start mounts every tool and returns once they are answering -- or refuses,
// before mounting anything, if this process's own credential does not cover a
// mount. That refusal names the tool; the alternative is a service that starts
// cleanly and never answers (spec §4.3). The gate is natsmicro's, so rund is
// gated by the same code.
func (s *Service) Start(nc *nats.Conn) error { return s.svc.Start(nc) }

// Serve answers until ctx is cancelled, then drains.
func (s *Service) Serve(ctx context.Context) error { return s.svc.Serve(ctx) }

// Run is Start then Serve.
func (s *Service) Run(ctx context.Context, nc *nats.Conn) error { return s.svc.Run(ctx, nc) }

// Ready is what /readyz reports: started, not draining, connected. It agrees with
// $SRV.PING by construction (natsmicro.Ready).
func (s *Service) Ready() bool { return s.svc.Ready() }

// Endpoint implements serve.Registrar. Generated code calls it once per tool,
// before Start.
func (s *Service) Endpoint(
	name string,
	method protoreflect.FullName,
	budget time.Duration,
	newRequest func() proto.Message,
	handle func(context.Context, proto.Message) (proto.Message, error),
) error {
	if name == "" || newRequest == nil || handle == nil {
		return fmt.Errorf("endpoint %q: a name, a request constructor and a handler are all required", name)
	}
	e := endpoint{
		tool: name, method: method, budget: budget,
		newReq: newRequest, handle: handle, subject: Subject(name),
	}
	return s.svc.Mount(endpointName(name), e.subject,
		micro.HandlerFunc(func(r micro.Request) { s.svc.Track(func() { s.answer(e, r) }) }))
}

// A call's context is NOT derived from the one that stops the service.
//
// Shutdown cancels that context, and the whole point of Serve's drain is that a call
// already accepted still gets answered -- so handing that call a cancelled context
// tells it to abort at the exact moment we have committed to finishing it. A
// ctx-aware handler would fail one call per deploy, per queued call, while the drain
// politely waited for it to.
//
// context.Background() rather than the process's values, because a call's context
// belongs to the CALL. Per-request values -- the trace, the deadline -- arrive from
// the request: the caller's trace is continued here, and the span is what the
// handler finds on its ctx (observability spec §1).
func (s *Service) answer(e endpoint, r micro.Request) {
	ctx := otel.GetTextMapPropagator().Extract(context.Background(), observe.HeaderCarrier(r.Headers()))
	ctx, span := observe.Tracer().Start(ctx, "garm.tool", trace.WithSpanKind(trace.SpanKindServer),
		trace.WithAttributes(observe.KeyTool.String(e.tool), observe.KeyDeadlineMillis.Int64(e.budget.Milliseconds()),
			observe.KeyRequestBytes.Int(len(r.Data()))))
	defer span.End()
	inst := observe.Instruments()
	toolAttr := metric.WithAttributes(observe.KeyTool.String(e.tool))
	inst.ToolInflight.Add(ctx, 1, toolAttr)
	defer inst.ToolInflight.Add(ctx, -1, toolAttr)
	// The budget the tool's own .proto declared becomes the handler's deadline.
	//
	// Step 8 deliberately imposed none, on the grounds that "a hung tool is the
	// caller's own deadline to enforce, and imposing one here would be a policy
	// with no stated reason". THE DECLARATION IS NOW THAT REASON -- and it is the
	// tool's own, read from the generated binding rather than from a header a
	// caller could assert.
	//
	// Past it the caller has already given up, so the work is unread; for a tool
	// with side effects, worse than wasted.
	if e.budget > 0 {
		var cancel context.CancelFunc
		ctx, cancel = context.WithTimeout(ctx, e.budget)
		defer cancel()
	}
	in := e.newReq()
	if err := proto.Unmarshal(r.Data(), in); err != nil {
		// The caller sent bytes this tool cannot read. That is INVALID and the
		// unmarshal error is a LOCAL detail -- it can quote field numbers and
		// lengths from whatever was actually sent.
		s.fail(ctx, e, r, serve.Invalid("the request could not be read as %s", e.method).Because(err))
		return
	}

	out, err := e.handle(ctx, in)
	if errors.Is(ctx.Err(), context.DeadlineExceeded) {
		// The declaration lied, whatever the handler then returned.
		inst.ToolDeadlineExceeded.Add(ctx, 1, toolAttr)
	}
	if err != nil {
		s.fail(ctx, e, r, err)
		return
	}

	body, err := proto.Marshal(out)
	if err != nil {
		s.fail(ctx, e, r, serve.Internal(fmt.Errorf("marshalling the response: %w", err)))
		return
	}
	if err := r.Respond(body); err != nil {
		// The reply did not go out -- most often because the response exceeds the
		// server's max_payload. Replying with an error is the difference between a
		// caller learning this and a caller hanging to its own deadline, and the
		// error reply is small enough to fit where the response did not.
		s.fail(ctx, e, r, serve.Internal(fmt.Errorf("sending the response: %w", err)))
		return
	}
	span.SetAttributes(observe.KeyKind.String("OK"), observe.KeyResponseBytes.Int(len(body)))
	inst.ToolCalls.Add(ctx, 1, metric.WithAttributes(observe.KeyTool.String(e.tool), observe.KeyKind.String("OK")))
}

// fail is the single exit for every error, so no path can forget to reply.
//
// The id a caller is told to quote is the TRACE id when there is one -- quoting
// it opens the whole trace in every process the call crossed -- and a random one
// when there is not, so a caller with no tracer still has something to quote.
func (s *Service) fail(ctx context.Context, e endpoint, r micro.Request, err error) {
	id := correlationID(ctx)
	w := serve.Wire(err, id)
	kind := observe.Kind(err)
	span := trace.SpanFromContext(ctx)
	span.SetAttributes(observe.KeyKind.String(kind))
	span.SetStatus(codes.Error, kind)
	observe.Instruments().ToolCalls.Add(ctx, 1, metric.WithAttributes(observe.KeyTool.String(e.tool), observe.KeyKind.String(kind)))

	// The other half of "the cause never crosses the wire". err here still carries
	// the full chain; this is the only place it is recorded, and the id is the join.
	s.log.ErrorContext(ctx, "tool call failed",
		"id", id,
		"tool", e.tool,
		"kind", w.GetKind().String(),
		"error", err,
	)

	description := w.GetMessage()
	if id != "" {
		// Appended so a client reading only the micro headers still has the token
		// the fixed INTERNAL message tells it to quote. The typed body carries it
		// as a field; both come from one invokev1.Error.
		description = fmt.Sprintf("%s (id: %s)", description, id)
	}
	body, marshalErr := proto.Marshal(w)
	if marshalErr != nil {
		body = nil
	}
	if replyErr := r.Error(serve.Code(w.GetKind()), description, body); replyErr != nil {
		// Reaching here means the caller gets nothing, so it must be visible.
		s.log.Error("could not reply with the error", "id", id, "tool", e.tool, "error", replyErr)
	}
}

// correlationID is the token a caller quotes and an operator joins on: the trace
// id when a span is active, else sixteen random hex characters.
func correlationID(ctx context.Context) string {
	if sc := trace.SpanContextFromContext(ctx); sc.IsValid() {
		return sc.TraceID().String()
	}
	var b [8]byte
	if _, err := rand.Read(b[:]); err != nil {
		// Never observed; crypto/rand does not fail on supported platforms. An
		// empty id would silently remove the join, so say so instead.
		return "no-id-available"
	}
	return hex.EncodeToString(b[:])
}
