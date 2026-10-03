// Package rundsvc puts the run engine on NATS.
//
// It is the only part of rund that knows about a broker: the engine takes a
// Caller interface and returns protos, and everything here is the translation --
// subjects, headers, marshalling, and the error reply.
package rundsvc

import (
	"context"
	"fmt"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/micro"
	"google.golang.org/protobuf/proto"

	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
	"github.com/garm-ai/garm-ai/natsmicro"
	"github.com/garm-ai/garm-ai/natsserve"
	"github.com/garm-ai/garm-ai/run"
	"github.com/garm-ai/garm-ai/serve"
)

// Subjects the run interface answers on.
//
// NOT under garm.tool. -- rund is not a tool, and the subject says so. If `invoke`
// were a tool, invoking it would create a run that invoked it.
const (
	SubjectInvoke = "garm.run.v1.invoke"
	SubjectFetch  = "garm.run.v1.fetch"
)

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
	if err := svc.Mount("invoke", SubjectInvoke, micro.HandlerFunc(func(r micro.Request) {
		svc.Track(func() { invoke(e, r) })
	})); err != nil {
		return err
	}
	return svc.Mount("fetch", SubjectFetch, micro.HandlerFunc(func(r micro.Request) {
		svc.Track(func() { fetch(e, r) })
	}))
}

func invoke(e *run.Engine, r micro.Request) {
	var req runv1.InvokeRequest
	if err := proto.Unmarshal(r.Data(), &req); err != nil {
		reply(r, serve.Wire(serve.Invalid("the request could not be read as garm.run.v1.InvokeRequest"), ""))
		return
	}
	resp, failure := e.Invoke(context.Background(), &req, headersOf(r))
	if failure != nil {
		reply(r, failure)
		return
	}
	respond(r, resp)
}

func fetch(e *run.Engine, r micro.Request) {
	var req runv1.FetchRequest
	if err := proto.Unmarshal(r.Data(), &req); err != nil {
		reply(r, serve.Wire(serve.Invalid("the request could not be read as garm.run.v1.FetchRequest"), ""))
		return
	}
	resp, failure := e.Fetch(context.Background(), &req)
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
	set(m, HeaderTraceparent, h.Traceparent)

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
