// Package run is rund's engine: the thing that turns one Invoke into one answer.
//
// It holds no NATS types in its signatures and no transport decisions. What it
// knows is the catalogue, the plan, and the ids.
package run

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log/slog"
	"time"

	"github.com/garm-ai/garm-ai/catalogue"
	"github.com/garm-ai/garm-ai/declared"
	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
	"github.com/garm-ai/garm-ai/serve"
)

// Headers are the ids that travel with every call.
//
// They are HEADERS and not fields of InvokeRequest, and that is structural rather
// than stylistic: a model's output reaches only InvokeRequest.input, so nothing a
// model produces can set an id, a budget or an idempotency key. The envelope
// belongs to the runtime.
type Headers struct {
	// Correlation spans one caller's whole flow, which may start several runs.
	// Minted here if the caller did not supply one.
	Correlation string
	// Causation is the message id of whatever caused this call. Empty at a root.
	Causation string
	// Message identifies this call. Always minted by the sender.
	Message string
	// Traceparent is the W3C trace context as it ARRIVED, recorded for the audit
	// trail. It is not what the transport forwards: rundsvc propagates its own
	// span from ctx, so the tool is this hop's child. A latency trace and a
	// correlation id are different things: a trace may be sampled, and an audit
	// trail with a sampling rate is not one.
	Traceparent string
	// Idempotency, when supplied, becomes the run id so that a retry is the same
	// run rather than a second one.
	Idempotency string
}

// Caller is how the engine reaches a tool. An interface so the engine is testable
// without a broker, and so the transport can change without the engine moving.
type Caller interface {
	// Call makes one tool call and returns its reply, or the error the tool gave.
	Call(ctx context.Context, tool string, input []byte, budget time.Duration, h Headers) ([]byte, error)
}

// Engine answers Invoke and Fetch.
type Engine struct {
	Catalogue *catalogue.Holder
	Tools     Caller
	Log       *slog.Logger

	// NewID mints run and message ids. A field so a test can make them
	// predictable; nil means crypto/rand.
	NewID func() string
}

func (e *Engine) id() string {
	if e.NewID != nil {
		return e.NewID()
	}
	var b [8]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "no-id-available"
	}
	return hex.EncodeToString(b[:])
}

func (e *Engine) log() *slog.Logger {
	if e.Log != nil {
		return e.Log
	}
	return slog.Default()
}

// action is one thing the engine does for an invocation.
//
// A slice of these is what plan returns, and the loop in Invoke executes them in
// order. Today every plan has exactly one.
type action struct {
	tool   string
	input  []byte
	budget time.Duration
}

// plan says what an invocation does.
//
// THE SEAM, and deliberately not an interface. A single-step plan exercises none
// of what a decider interface is for -- no state threading, no events, no
// multi-step, no partial completion -- so an interface designed against it would
// be designed blind. What this establishes is only that the engine EXECUTES A
// PLAN rather than calling a tool directly, which is the part that would be a
// rewrite to retrofit. The interface gets extracted from two real deciders.
func plan(t declared.Tool, input []byte) ([]action, error) {
	if t.IsAgent() {
		// An agent is answered by a decider, and a decider needs a run that
		// outlives its call. Both decider kinds are durable by definition.
		return nil, serve.Unavailable(
			"%s is an agent; this build has no run store, so no decider can run it", t.Name)
	}
	if !t.IsSync() {
		return nil, serve.Unavailable(
			"%s is declared async; this build has no run store, so it cannot be invoked", t.Name)
	}
	return []action{{tool: t.Name, input: input, budget: t.Budget()}}, nil
}

// Invoke runs one invocation to an answer.
func (e *Engine) Invoke(ctx context.Context, req *runv1.InvokeRequest, h Headers) (*runv1.InvokeResponse, *invokev1.Error) {
	// ONE snapshot, used for this call's whole life. Taking it twice would invite
	// resolving a name against one catalogue and reading a budget from the next.
	cat := e.Catalogue.Current()

	// The idempotency key IS the run id, so a retry is the same run rather than a
	// second one. Minted when absent, which means a caller that wants idempotency
	// must supply one -- an id we invent cannot deduplicate anything.
	runID := h.Idempotency
	if runID == "" {
		runID = e.id()
	}
	if h.Correlation == "" {
		h.Correlation = runID
	}

	tool, ok := cat.Tool(req.GetTool())
	if !ok {
		// NOT_FOUND names the catalogue, because "unknown tool" is unactionable
		// when the question is really which namespace is loaded.
		return nil, e.fail(runID, h, req.GetTool(), serve.NotFound(
			"no tool named %q in the catalogue loaded from %s", req.GetTool(), cat.Source))
	}

	actions, err := plan(tool, req.GetInput())
	if err != nil {
		return nil, e.fail(runID, h, tool.Name, err)
	}

	var last []byte
	for i, a := range actions {
		// Each action gets its own message id, and causation chains to the
		// previous one -- so the record says what caused what, which a shared
		// correlation id alone cannot.
		step := h
		step.Causation = h.Message
		step.Message = e.id()
		// A tool call's idempotency key is NOT the run's: one run may call tools
		// several times, so a key per step is what makes a replay safe.
		step.Idempotency = fmt.Sprintf("%s:%d", runID, i)

		out, callErr := e.Tools.Call(ctx, a.tool, a.input, a.budget, step)
		if callErr != nil {
			return nil, e.fail(runID, h, a.tool, callErr)
		}
		last = out
	}

	e.log().Info("invoked",
		"run", runID, "tool", tool.Name,
		"correlation", h.Correlation, "causation", h.Causation,
		"catalogue", cat.SHA256)

	return &runv1.InvokeResponse{
		RunId:   runID,
		Outcome: &runv1.InvokeResponse_Result{Result: last},
	}, nil
}

// fail logs the cause and returns what the caller is told. The cause chain is
// recorded here and nowhere else; the wire gets a kind, a chosen message and an id.
func (e *Engine) fail(runID string, h Headers, tool string, err error) *invokev1.Error {
	w := serve.Wire(err, runID)
	e.log().Error("invoke failed",
		"run", runID, "tool", tool, "kind", w.GetKind().String(),
		"correlation", h.Correlation, "error", err)
	return w
}

// Fetch says what happened. With no run store it says so, rather than lying.
func (e *Engine) Fetch(_ context.Context, req *runv1.FetchRequest) (*runv1.FetchResponse, *invokev1.Error) {
	if req.GetRunId() == "" {
		return nil, serve.Wire(serve.Invalid("run_id is required"), "")
	}
	// NOT_RETAINED, never NOT_FOUND: the run may well have happened, and claiming
	// it never existed would be a lie a caller could act on. Nor is a result
	// fabricated.
	return &runv1.FetchResponse{State: runv1.RunState_RUN_STATE_NOT_RETAINED}, nil
}
