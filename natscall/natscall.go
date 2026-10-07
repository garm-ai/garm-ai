// Package natscall reaches rund over NATS. It implements call.Invoker.
//
// The mirror of natsserve: everything that knows about a broker is here, and
// generated client code imports only `call`.
package natscall

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/micro"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/durationpb"

	"github.com/garm-ai/garm-ai/call"
	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/rundsvc"
	"github.com/garm-ai/garm-ai/serve"
)

// Client calls rund. The connection belongs to the caller.
type Client struct{ NC *nats.Conn }

var _ call.Invoker = Client{}

// retryAfter is the pause before the ONE retry a call gets, and only for "no
// responders" -- the one failure that proves the request reached nobody and so
// cannot have executed. Long enough for a deploy's new instance to have
// subscribed; short enough that a caller's budget is not spent waiting.
const retryAfter = 100 * time.Millisecond

// request sends m and answers for the two things the transport gets wrong on its
// own (review findings):
//
// A request over the server's payload limit used to surface as a transport error
// with no kind, which a caller reads as UNAVAILABLE and retries forever. It is
// INVALID -- large artefacts do not cross this bus by rule -- and is refused
// here, before anything is sent, saying how big it was and what the limit is.
//
// "No responders" is retried exactly once. It is the one error that proves the
// request was delivered to nobody, so a retry cannot double-execute anything; it
// is also exactly what a caller sees in the seconds a deploy is swapping
// instances. A timeout is NOT retried: the request may have executed.
func (c Client) request(ctx context.Context, m *nats.Msg, pattern string) (*nats.Msg, error) {
	if limit := c.NC.MaxPayload(); limit > 0 && int64(len(m.Data)) > limit {
		return nil, serve.Invalid("the request is %d bytes and this bus accepts at most %d; large inputs go to the artefact store and a reference travels",
			len(m.Data), limit)
	}
	reply, err := c.NC.RequestMsgWithContext(ctx, m)
	if errors.Is(err, nats.ErrNoResponders) {
		select {
		case <-ctx.Done():
			return nil, serve.Unavailable("nothing is answering %s -- is rund running?", pattern).Because(err)
		case <-time.After(retryAfter):
		}
		// ONE span: a caller made one call. The retry is an event on it.
		trace.SpanFromContext(ctx).AddEvent("retry", trace.WithAttributes(attribute.String("reason", "no responders")))
		reply, err = c.NC.RequestMsgWithContext(ctx, m)
	}
	switch {
	case err == nil:
		return reply, nil
	case errors.Is(err, nats.ErrMaxPayload):
		// The size check above should have caught it; this is the backstop if a
		// server's limit is lower than the one it advertised at connect.
		return nil, serve.Invalid("the request exceeds the bus's payload limit").Because(err)
	default:
		return nil, serve.Unavailable("nothing is answering %s -- is rund running?", pattern).Because(err)
	}
}

// Invoke sends one InvokeRequest to rund and returns rund's answer.
//
// It opens the call's span -- the ROOT of the trace unless the caller's ctx is
// already inside one, in which case this call is a child of the caller's own
// work. Generated client code stays OTel-free: the span lives here, on the
// transport, and the propagator puts it on the wire.
func (c Client) Invoke(ctx context.Context, tool string, input []byte, o call.Options) (resp *runv1.InvokeResponse, err error) {
	ctx, span := observe.Tracer().Start(ctx, "garm.call", trace.WithSpanKind(trace.SpanKindClient),
		trace.WithAttributes(observe.KeyTool.String(tool), observe.KeyRequestBytes.Int(len(input))))
	defer func() { finish(span, err, len(resp.GetResult())) }()

	body, err := proto.Marshal(&runv1.InvokeRequest{Tool: tool, Input: input})
	if err != nil {
		return nil, serve.Internal(fmt.Errorf("marshalling the request: %w", err))
	}
	m := nats.NewMsg(rundsvc.SubjectInvoke)
	m.Data = body
	correlation := o.Correlation
	if correlation == "" {
		correlation = newID()
	}
	set(m, rundsvc.HeaderCorrelation, correlation)
	// A client mints its own message id and sets NO causation: it is the root of
	// the chain, and claiming a cause it does not have would invent a parent.
	set(m, rundsvc.HeaderMessage, newID())
	set(m, rundsvc.HeaderIdempotency, o.Idempotency)
	// The span on ctx wins; o.Traceparent is for a caller with no tracer that
	// still wants to pass a context through verbatim.
	set(m, rundsvc.HeaderTraceparent, o.Traceparent)
	otel.GetTextMapPropagator().Inject(ctx, observe.HeaderCarrier(m.Header))

	reply, err := c.request(ctx, m, rundsvc.PatternInvoke)
	if err != nil {
		return nil, err
	}
	if code := reply.Header.Get(micro.ErrorCodeHeader); code != "" {
		return nil, wireError(code, reply)
	}
	resp = &runv1.InvokeResponse{}
	if err := proto.Unmarshal(reply.Data, resp); err != nil {
		return nil, serve.Internal(fmt.Errorf("the reply is not an InvokeResponse: %w", err))
	}
	span.SetAttributes(observe.KeyRunID.String(resp.GetRunId()))
	return resp, nil
}

// Fetch asks what happened to a run. wait rides in the body; the request's
// deadline is wait plus the hops unless ctx is already shorter -- a blocking
// Fetch must not time out on the transport before rund has answered.
func (c Client) Fetch(ctx context.Context, runID string, wait time.Duration) (resp *runv1.FetchResponse, err error) {
	ctx, span := observe.Tracer().Start(ctx, "garm.fetch", trace.WithSpanKind(trace.SpanKindClient),
		trace.WithAttributes(observe.KeyRunID.String(runID)))
	defer func() { finish(span, err, 0) }()

	req := &runv1.FetchRequest{RunId: runID}
	if wait > 0 {
		req.Wait = durationpb.New(wait)
		if _, has := ctx.Deadline(); !has {
			var cancel context.CancelFunc
			ctx, cancel = context.WithTimeout(ctx, call.Deadline(wait))
			defer cancel()
		}
	}
	body, err := proto.Marshal(req)
	if err != nil {
		return nil, serve.Internal(err)
	}
	m := nats.NewMsg(rundsvc.SubjectFetch)
	m.Data = body
	set(m, rundsvc.HeaderMessage, newID())
	otel.GetTextMapPropagator().Inject(ctx, observe.HeaderCarrier(m.Header))

	reply, err := c.request(ctx, m, rundsvc.PatternFetch)
	if err != nil {
		return nil, err
	}
	if code := reply.Header.Get(micro.ErrorCodeHeader); code != "" {
		return nil, wireError(code, reply)
	}
	var out runv1.FetchResponse
	if err := proto.Unmarshal(reply.Data, &out); err != nil {
		return nil, serve.Internal(err)
	}
	return &out, nil
}

// Events asks for a run's record after a cursor. wait rides in the body and
// sets the request's deadline, as Fetch's does.
func (c Client) Events(ctx context.Context, runID string, after uint64, wait time.Duration) (resp *runv1.EventsResponse, err error) {
	ctx, span := observe.Tracer().Start(ctx, "garm.events", trace.WithSpanKind(trace.SpanKindClient),
		trace.WithAttributes(observe.KeyRunID.String(runID)))
	defer func() { finish(span, err, 0) }()

	req := &runv1.EventsRequest{RunId: runID, After: after}
	if wait > 0 {
		req.Wait = durationpb.New(wait)
		if _, has := ctx.Deadline(); !has {
			var cancel context.CancelFunc
			ctx, cancel = context.WithTimeout(ctx, call.Deadline(wait))
			defer cancel()
		}
	}
	body, err := proto.Marshal(req)
	if err != nil {
		return nil, serve.Internal(err)
	}
	m := nats.NewMsg(rundsvc.SubjectEvents)
	m.Data = body
	set(m, rundsvc.HeaderMessage, newID())
	otel.GetTextMapPropagator().Inject(ctx, observe.HeaderCarrier(m.Header))

	reply, err := c.request(ctx, m, rundsvc.PatternEvents)
	if err != nil {
		return nil, err
	}
	if code := reply.Header.Get(micro.ErrorCodeHeader); code != "" {
		return nil, wireError(code, reply)
	}
	resp = &runv1.EventsResponse{}
	if err := proto.Unmarshal(reply.Data, resp); err != nil {
		return nil, serve.Internal(err)
	}
	return resp, nil
}

// finish records the outcome on the span: the kind as an attribute always, an
// error status only when there was one.
func finish(span trace.Span, err error, responseBytes int) {
	span.SetAttributes(observe.KeyKind.String(observe.Kind(err)), observe.KeyResponseBytes.Int(responseBytes))
	if err != nil {
		span.SetStatus(codes.Error, observe.Kind(err))
	}
	span.End()
}

// wireError rebuilds the error a caller should see.
//
// The typed body first, because it carries the id a caller is told to quote; the
// headers are the fallback for a peer that sent none.
func wireError(code string, reply *nats.Msg) error {
	var e invokev1.Error
	if err := proto.Unmarshal(reply.Data, &e); err == nil && e.GetMessage() != "" {
		return &serve.Error{Kind: e.GetKind(), Message: withID(e.GetMessage(), e.GetId())}
	}
	return &serve.Error{Kind: serve.KindOf(code), Message: reply.Header.Get(micro.ErrorHeader)}
}

func withID(msg, id string) string {
	if id == "" {
		return msg
	}
	return fmt.Sprintf("%s (id: %s)", msg, id)
}

func set(m *nats.Msg, k, v string) {
	if v != "" {
		m.Header.Set(k, v)
	}
}

func newID() string {
	var b [8]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "no-id-available"
	}
	return hex.EncodeToString(b[:])
}

// Deadline applies a tool's declared budget plus the hops, for a caller not using
// a generated client.
func Deadline(ctx context.Context, budget time.Duration) (context.Context, context.CancelFunc) {
	return context.WithTimeout(ctx, call.Deadline(budget))
}
