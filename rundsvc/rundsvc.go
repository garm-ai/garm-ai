// Package rundsvc puts the run engine on NATS.
//
// It is the only part of rund that knows about a broker: the engine takes a
// Caller interface and returns protos, and everything here is the translation --
// subjects, headers, marshalling, and the error reply.
package rundsvc

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/micro"
	"github.com/nats-io/nkeys"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"google.golang.org/protobuf/proto"

	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
	"github.com/garm-ai/garm-ai/natsmicro"
	"github.com/garm-ai/garm-ai/natsserve"
	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/run"
	"github.com/garm-ai/garm-ai/serve"
)

// Subjects a CALLER publishes on.
//
// NOT under garm.tool. -- rund is not a tool, and the subject says so. If `invoke`
// were a tool, invoking it would create a run that invoked it.
//
// These are not what rund subscribes to. A caller's account imports the run
// service with its own account key at token 4, and the server rewrites
// garm.run.v1.invoke to garm.run.v1.<ACCOUNT>.invoke on the way in -- so the
// caller publishes the plain subject, unchanged, and rund receives the rewritten
// one (spec §3). Keeping both names is what lets natscall stay untouched.
const (
	SubjectInvoke = "garm.run.v1.invoke"
	SubjectFetch  = "garm.run.v1.fetch"
)

// Patterns rund ANSWERS on. Token 4 is the caller's account, placed by the server.
const (
	PatternInvoke = "garm.run.v1.*.invoke"
	PatternFetch  = "garm.run.v1.*.fetch"
)

// CallerKey is the context key under which a handler finds the calling account.
type CallerKey struct{}

// CallerFromSubject reads the caller's account key off a subject the server
// rewrote on the way in. It is the ONLY place identity enters rund, and it trusts
// the subject for one reason: a caller's account can import the run service only
// at its own key, so token 4 is the importing account's or the message does not
// arrive (spec §3). Nothing a caller writes can put another key there.
//
// A subject whose token 4 is not a public ACCOUNT key carries no caller -- the flat
// subject a bare server delivers, or a user key -- and is reported as such rather
// than as an empty caller, which would read as a guarantee.
func CallerFromSubject(subject string) (account string, ok bool) {
	parts := strings.Split(subject, ".")
	if len(parts) != 5 || !nkeys.IsValidPublicAccountKey(parts[3]) {
		return "", false
	}
	return parts[3], true
}

// withCaller is what every handler does first: continue the caller's trace, learn
// who called, say so, and put it where the engine can reach it. Nothing decides
// anything with the identity yet; this slice establishes it (identity spec §0).
//
// The trace is CONTINUED -- the span opened here is a child of whatever the
// envelope carried -- and that is correlation, never attribution: the caller
// chose that id. Attribution is the account key, and it comes from the subject
// the server rewrote (observability spec §1.2). A malformed traceparent is
// rejected by the propagator and a fresh trace begins, with the caller set as
// always.
func withCaller(e *run.Engine, r micro.Request, op string) (context.Context, trace.Span) {
	ctx := otel.GetTextMapPropagator().Extract(context.Background(), observe.HeaderCarrier(r.Headers()))
	ctx, span := observe.Tracer().Start(ctx, "garm.run."+op, trace.WithSpanKind(trace.SpanKindServer))
	acc, ok := CallerFromSubject(r.Subject())
	if !ok {
		e.Log.WarnContext(ctx, "a call arrived without a caller account in its subject", "op", op, "subject", r.Subject())
		return ctx, span
	}
	span.SetAttributes(observe.KeyCaller.String(acc))
	e.Log.InfoContext(ctx, op, "caller", acc)
	return context.WithValue(ctx, CallerKey{}, acc), span
}

// record closes out an invocation on the span and the counter. The caller
// attribute is read back off the context so the counter and the span agree, and
// it is ABSENT -- not empty -- when there is none.
func record(ctx context.Context, span trace.Span, tool string, err error) {
	kind := observe.Kind(err)
	attrs := []attribute.KeyValue{observe.KeyTool.String(tool), observe.KeyKind.String(kind)}
	if acc, ok := ctx.Value(CallerKey{}).(string); ok && acc != "" {
		attrs = append(attrs, observe.KeyCaller.String(acc))
	}
	span.SetAttributes(observe.KeyKind.String(kind))
	if err != nil {
		span.SetStatus(codes.Error, kind)
	}
	observe.Instruments().RunInvocations.Add(ctx, 1, metric.WithAttributes(attrs...))
}

// Headers carrying the envelope.
//
// The ENVELOPE, never the payload: a model's output reaches only
// InvokeRequest.input, so nothing a model produces can set an id, a budget or an
// idempotency key. That is structural rather than a rule to remember.
const (
	HeaderCorrelation = "Garm-Correlation-Id"
	HeaderCausation   = "Garm-Causation-Id"
	HeaderMessage     = "Garm-Message-Id"
	HeaderIdempotency = "Garm-Idempotency-Key"
	HeaderTraceparent = "traceparent"
)

// Serve mounts the run interface on svc.
func Serve(svc *natsmicro.Service, e *run.Engine) error {
	if err := svc.Mount("invoke", PatternInvoke, micro.HandlerFunc(func(r micro.Request) {
		svc.Track(func() { invoke(e, r) })
	})); err != nil {
		return err
	}
	return svc.Mount("fetch", PatternFetch, micro.HandlerFunc(func(r micro.Request) {
		svc.Track(func() { fetch(e, r) })
	}))
}

func invoke(e *run.Engine, r micro.Request) {
	ctx, span := withCaller(e, r, "invoke")
	defer span.End()
	var req runv1.InvokeRequest
	if err := proto.Unmarshal(r.Data(), &req); err != nil {
		unreadable := serve.Invalid("the request could not be read as garm.run.v1.InvokeRequest")
		reply(r, serve.Wire(unreadable, ""))
		record(ctx, span, "", unreadable)
		return
	}
	h := headersOf(r)
	span.SetAttributes(observe.KeyTool.String(req.GetTool()), observe.KeyIdempotencyKey.String(h.Idempotency))
	resp, failure := e.Invoke(ctx, &req, h)
	if failure != nil {
		reply(r, failure)
		// The run id is the error's id (run.Engine.fail), so it is known here.
		span.SetAttributes(observe.KeyRunID.String(failure.GetId()))
		record(ctx, span, req.GetTool(), &serve.Error{Kind: failure.GetKind()})
		return
	}
	span.SetAttributes(observe.KeyRunID.String(resp.GetRunId()))
	record(ctx, span, req.GetTool(), nil)
	respond(r, resp)
}

func fetch(e *run.Engine, r micro.Request) {
	ctx, span := withCaller(e, r, "fetch")
	defer span.End()
	var req runv1.FetchRequest
	if err := proto.Unmarshal(r.Data(), &req); err != nil {
		reply(r, serve.Wire(serve.Invalid("the request could not be read as garm.run.v1.FetchRequest"), ""))
		return
	}
	span.SetAttributes(observe.KeyRunID.String(req.GetRunId()))
	resp, failure := e.Fetch(ctx, &req)
	if failure != nil {
		reply(r, failure)
		return
	}
	respond(r, resp)
}

func headersOf(r micro.Request) run.Headers {
	h := r.Headers()
	return run.Headers{
		Correlation: h.Get(HeaderCorrelation),
		Causation:   h.Get(HeaderCausation),
		Message:     h.Get(HeaderMessage),
		Idempotency: h.Get(HeaderIdempotency),
		Traceparent: h.Get(HeaderTraceparent),
	}
}

func respond(r micro.Request, m proto.Message) {
	body, err := proto.Marshal(m)
	if err != nil {
		reply(r, serve.Wire(serve.Internal(fmt.Errorf("marshalling the response: %w", err)), ""))
		return
	}
	if err := r.Respond(body); err != nil {
		// The reply did not go out, most often because it exceeds max_payload. An
		// error reply is small enough to fit where the response was not, and is
		// the difference between a caller learning this and a caller hanging.
		reply(r, serve.Wire(serve.Internal(fmt.Errorf("sending the response: %w", err)), ""))
	}
}

// reply sends an error, never nothing. micro's Error returns an error and NEVER
// REPLIES when given an empty code or description, so serve.Wire being total is
// what stops a caller hanging to its own deadline.
func reply(r micro.Request, w *invokev1.Error) {
	description := w.GetMessage()
	if id := w.GetId(); id != "" {
		description = fmt.Sprintf("%s (id: %s)", description, id)
	}
	body, _ := proto.Marshal(w)
	_ = r.Error(serve.Code(w.GetKind()), description, body)
}

// ToolCaller reaches tools over NATS. It is run.Caller.
type ToolCaller struct{ NC *nats.Conn }

// Call makes one tool call on the internal subject.
//
// The budget is the request timeout, read from the catalogue. The TOOL applies the
// same number as its handler's deadline, from its own generated binding -- two
// enforcers, one declaration, nothing trusted across the hop.
func (t ToolCaller) Call(ctx context.Context, tool string, input []byte, budget time.Duration, h run.Headers) ([]byte, error) {
	m := nats.NewMsg(natsserve.Subject(tool))
	m.Data = input
	set(m, HeaderCorrelation, h.Correlation)
	set(m, HeaderCausation, h.Causation)
	set(m, HeaderMessage, h.Message)
	set(m, HeaderIdempotency, h.Idempotency)
	// RUND's span context, not the caller's forwarded header: the tool is a child
	// of this hop. With no span on ctx the propagator injects nothing, and a
	// header the propagator rejected is not passed on either.
	otel.GetTextMapPropagator().Inject(ctx, observe.HeaderCarrier(m.Header))

	timeout := budget
	if timeout <= 0 {
		timeout = 30 * time.Second // only reachable for a tool with no budget
	}
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	reply, err := t.NC.RequestMsgWithContext(ctx, m)
	if err != nil {
		// No responder, or no answer inside the budget. UNAVAILABLE: the caller
		// should not change its request, and retrying may well work.
		return nil, serve.Unavailable("%s did not answer within %s", tool, timeout).Because(err)
	}
	if code := reply.Header.Get(micro.ErrorCodeHeader); code != "" {
		// The tool's OWN kind and words, carried through rather than flattened.
		var e invokev1.Error
		if err := proto.Unmarshal(reply.Data, &e); err == nil && e.GetMessage() != "" {
			return nil, &serve.Error{Kind: e.GetKind(), Message: e.GetMessage()}
		}
		return nil, &serve.Error{Kind: serve.KindOf(code), Message: reply.Header.Get(micro.ErrorHeader)}
	}
	return reply.Data, nil
}

func set(m *nats.Msg, k, v string) {
	if v != "" {
		m.Header.Set(k, v)
	}
}
