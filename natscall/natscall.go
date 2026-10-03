// Package natscall reaches rund over NATS. It implements call.Invoker.
//
// The mirror of natsserve: everything that knows about a broker is here, and
// generated client code imports only `call`.
package natscall

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/micro"
	"google.golang.org/protobuf/proto"

	"github.com/garm-ai/garm-ai/call"
	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
	"github.com/garm-ai/garm-ai/rundsvc"
	"github.com/garm-ai/garm-ai/serve"
)

// Client calls rund. The connection belongs to the caller.
type Client struct{ NC *nats.Conn }

var _ call.Invoker = Client{}

// Invoke sends one InvokeRequest to rund and returns the tool's response bytes.
func (c Client) Invoke(ctx context.Context, tool string, input []byte, o call.Options) ([]byte, error) {
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
	set(m, rundsvc.HeaderTraceparent, o.Traceparent)

	reply, err := c.NC.RequestMsgWithContext(ctx, m)
	if err != nil {
		return nil, serve.Unavailable("nothing is answering %s -- is rund running?", rundsvc.PatternInvoke).Because(err)
	}
	if code := reply.Header.Get(micro.ErrorCodeHeader); code != "" {
		return nil, wireError(code, reply)
	}
	var resp runv1.InvokeResponse
	if err := proto.Unmarshal(reply.Data, &resp); err != nil {
		return nil, serve.Internal(fmt.Errorf("the reply is not an InvokeResponse: %w", err))
	}
	return resp.GetResult(), nil
}

// Fetch asks what happened to a run.
func (c Client) Fetch(ctx context.Context, runID string) (*runv1.FetchResponse, error) {
	body, err := proto.Marshal(&runv1.FetchRequest{RunId: runID})
	if err != nil {
		return nil, serve.Internal(err)
	}
	m := nats.NewMsg(rundsvc.SubjectFetch)
	m.Data = body
	set(m, rundsvc.HeaderMessage, newID())

	reply, err := c.NC.RequestMsgWithContext(ctx, m)
	if err != nil {
		return nil, serve.Unavailable("nothing is answering %s -- is rund running?", rundsvc.PatternFetch).Because(err)
	}
	if code := reply.Header.Get(micro.ErrorCodeHeader); code != "" {
		return nil, wireError(code, reply)
	}
	var resp runv1.FetchResponse
	if err := proto.Unmarshal(reply.Data, &resp); err != nil {
		return nil, serve.Internal(err)
	}
	return &resp, nil
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
