// Package run is rund's engine: the thing that turns one Invoke into one answer.
//
// It holds no NATS types in its signatures and no transport decisions. What it
// knows is the catalogue, the plan, and the ids.
package run

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"google.golang.org/protobuf/types/known/timestamppb"

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

	// Caller is the invoking account's public key, placed in the subject by the
	// server and read by rundsvc; CallerName its label from --callers, if any.
	// Neither is a header on the wire: they are what the transport PROVED, and
	// a run is visible only to the account that started it.
	Caller, CallerName string
}

// Decider is the authority model, as the engine needs it. An interface here so
// `run` does not import `authority` -- which imports `run` for the principal --
// and so a test can decide without a grant file.
type Decider interface {
	// Allow permits this principal to invoke this tool, returning what it
	// relied on, or an error that is the refusal a caller receives.
	Allow(ctx context.Context, p Principal, t declared.Tool) (Allowed, error)
	// CanSee says whether this principal may read this run.
	CanSee(ctx context.Context, p Principal, r Seen) bool
}

// Allowed is what a permission relied on: the engine records it on the run so
// the audit says what was decided, and the workflow checks against it rather
// than deciding again.
type Allowed struct {
	GrantID      string
	Compartments []string
	ActsFor      *Principal
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

	// Store holds async runs. nil is today's rund: sync only, and an async tool
	// is refused per call naming the flag that would enable it. A sync call
	// never touches the store, so the store being down never touches sync.
	Store Store

	// Authority decides who may invoke what and who may see which run. nil is
	// the REDUCED POSTURE (authority spec §9): a tool that requires nothing is
	// open, a tool with a requirement is refused naming --grants. The engine
	// holds no policy of its own -- it asks, records what it was told, and
	// reports the refusal it was given.
	Authority Decider

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

// Action is one thing the engine does for an invocation.
//
// A slice of these is what Plan returns, and the loop in Invoke -- or the run
// store's workflow, for an async run -- executes them in order. Today every plan
// has exactly one. Exported fields because the store checkpoints the plan.
type Action struct {
	Tool   string
	Input  []byte
	Budget time.Duration
	// Requires is the tool's compartments AS THEY WERE WHEN THE PLAN WAS MADE.
	// Pinned here for the same reason the budget is: the step checks against
	// this, so a replay after a declaration changed decides as the run was
	// decided, not as the catalogue reads now (authority spec §4, §7).
	Requires []string
}

// Plan says what an invocation does.
//
// THE SEAM, and deliberately not an interface. A single-step plan exercises none
// of what a decider interface is for -- no state threading, no events, no
// multi-step, no partial completion -- so an interface designed against it would
// be designed blind. What this establishes is only that the engine EXECUTES A
// PLAN rather than calling a tool directly, which is the part that would be a
// rewrite to retrofit. The interface gets extracted from two real deciders.
//
// Plan does not decide delivery: a sync plan runs in Invoke, an async plan runs
// in the store, and both are this one function.
func Plan(t declared.Tool, input []byte) ([]Action, error) {
	if t.IsAgent() {
		// An agent is answered by a decider, and a decider needs a run that
		// outlives its call. Both decider kinds are durable by definition.
		return nil, serve.Unavailable(
			"%s is an agent; this build has no decider to run it", t.Name)
	}
	return []Action{{Tool: t.Name, Input: input, Budget: t.Budget(), Requires: t.Requires}}, nil
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
		return nil, e.fail(ctx, runID, h, req.GetTool(), serve.NotFound(
			"no tool named %q in the catalogue loaded from %s", req.GetTool(), cat.Source))
	}

	allowed, err := e.permit(ctx, tool, h)
	if err != nil {
		return nil, e.fail(ctx, runID, h, tool.Name, err)
	}

	if !tool.IsSync() && !tool.IsAgent() {
		return e.startAsync(ctx, tool, req, h, allowed)
	}

	actions, err := Plan(tool, req.GetInput())
	if err != nil {
		return nil, e.fail(ctx, runID, h, tool.Name, err)
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

		out, callErr := e.Tools.Call(ctx, a.Tool, a.Input, a.Budget, step)
		if callErr != nil {
			return nil, e.fail(ctx, runID, h, a.Tool, callErr)
		}
		last = out
	}

	// The *Context forms: ctx carries the call's span, and the handler the
	// process installed stamps the trace id onto this line -- the one with the
	// run id, the correlation id and the catalogue, which is the one an operator
	// reads. The engine itself imports nothing of OTel.
	e.log().InfoContext(ctx, "invoked",
		"run", runID, "tool", tool.Name,
		"correlation", h.Correlation, "causation", h.Causation,
		"catalogue", cat.SHA256)

	return &runv1.InvokeResponse{
		RunId:   runID,
		Outcome: &runv1.InvokeResponse_Result{Result: last},
	}, nil
}

// ValidKey says whether a key may be a run id: it becomes one token of a NATS
// subject, so no whitespace, no separator, no wildcard, no control character.
func ValidKey(key string) bool {
	if key == "" {
		return false
	}
	for _, r := range key {
		if r <= ' ' || r == '.' || r == '*' || r == '>' || r == 0x7f {
			return false
		}
	}
	return true
}

// permit is the authority decision, taken ONCE per invocation (authority spec
// §4). With no Authority the posture is reduced and announced: a tool that
// requires nothing proceeds, and a tool with a requirement is refused naming
// the flag that would decide it -- a security posture is never chosen by
// omission, and never silently widened either.
func (e *Engine) permit(ctx context.Context, tool declared.Tool, h Headers) (Allowed, error) {
	if e.Authority == nil {
		if len(tool.Requires) == 0 {
			return Allowed{}, nil
		}
		return Allowed{}, serve.Denied(
			"%s requires %s and this rund has no grants to decide with; start it with --grants",
			tool.Name, strings.Join(tool.Requires, ", "))
	}
	return e.Authority.Allow(ctx, PrincipalOf(h), tool)
}

// startAsync is the async path: nothing executes here. The run is made durable
// and the caller gets its id; a replica executes it from the queue (spec §2).
func (e *Engine) startAsync(ctx context.Context, tool declared.Tool, req *runv1.InvokeRequest, h Headers, allowed Allowed) (*runv1.InvokeResponse, *invokev1.Error) {
	if e.Store == nil {
		// Said before the key check: no key the caller adds would help here.
		return nil, e.fail(ctx, h.Idempotency, h, tool.Name, serve.Unavailable(
			"%s is declared async and this rund has no run store; start it with --run-store", tool.Name))
	}
	if h.Idempotency == "" {
		// rund minting the key would make a retry a second run -- the opposite
		// of idempotent (spec §6). A model never sets one; the decider does.
		return nil, e.fail(ctx, "", h, tool.Name, serve.Invalid(
			"%s is async: an idempotency key is required (Garm-Idempotency-Key), and it becomes the run id", tool.Name))
	}
	if !ValidKey(h.Idempotency) {
		// The key becomes a subject token -- garm.run.v1.<owner>.out.<key>.<seq>
		// (push spec §2) -- so a key the bus would reject is refused here, with
		// the rule, rather than failing silently on every publish.
		return nil, e.fail(ctx, h.Idempotency, h, tool.Name, serve.Invalid(
			"the idempotency key %q is not a subject token: no whitespace, no '.', '*' or '>', no control characters", h.Idempotency))
	}
	r := Run{
		ID: h.Idempotency, Tool: tool.Name, Input: req.GetInput(),
		Fingerprint: Fingerprint(tool.Name, req.GetInput()),
		Caller:      h.Caller, CallerName: h.CallerName,
		Correlation: h.Correlation, Message: h.Message, Traceparent: h.Traceparent,
		// The decision, recorded: the workflow checks against THIS and never
		// decides again (authority spec §4).
		Principal: PrincipalOf(h), ActsFor: allowed.ActsFor,
		Compartments: allowed.Compartments, GrantID: allowed.GrantID,
	}
	started, err := e.Store.Start(ctx, r)
	if err != nil {
		return nil, e.fail(ctx, r.ID, h, tool.Name, err)
	}
	e.log().InfoContext(ctx, "run started",
		"run", started.ID, "tool", tool.Name, "existing", started.Existing,
		"correlation", r.Correlation, "caller", h.Caller)
	return &runv1.InvokeResponse{
		RunId:   started.ID,
		Outcome: &runv1.InvokeResponse_Pending{Pending: &runv1.Pending{}},
	}, nil
}

// fail logs the cause and returns what the caller is told. The cause chain is
// recorded here and nowhere else; the wire gets a kind, a chosen message and an id.
func (e *Engine) fail(ctx context.Context, runID string, h Headers, tool string, err error) *invokev1.Error {
	w := serve.Wire(err, runID)
	e.log().ErrorContext(ctx, "invoke failed",
		"run", runID, "tool", tool, "kind", w.GetKind().String(),
		"correlation", h.Correlation, "error", err)
	return w
}

// Fetch says what happened. With no run store it says so, rather than lying.
func (e *Engine) Fetch(ctx context.Context, req *runv1.FetchRequest, h Headers) (*runv1.FetchResponse, *invokev1.Error) {
	if req.GetRunId() == "" {
		return nil, serve.Wire(serve.Invalid("run_id is required"), "")
	}
	if e.Store == nil {
		// NOT_RETAINED, never NOT_FOUND: the run may well have happened, and
		// claiming it never existed would be a lie a caller could act on. Nor
		// is a result fabricated.
		return &runv1.FetchResponse{State: runv1.RunState_RUN_STATE_NOT_RETAINED}, nil
	}
	wait := req.GetWait().AsDuration()
	if wait > MaxFetchWait {
		wait = MaxFetchWait
	}
	st, err := e.Store.Fetch(ctx, req.GetRunId(), wait)
	switch {
	case errors.Is(err, ErrNotFound):
		return nil, serve.Wire(serve.NotFound("no run %s", req.GetRunId()), "")
	case err != nil:
		return nil, e.fail(ctx, req.GetRunId(), h, "", err)
	}
	// Visibility (spec §4): the first body of the function the authority model
	// will replace. A foreign run is NOT_FOUND, not DENIED -- its existence is
	// not the caller's to learn, and the answer is the same as for an id that
	// never existed.
	if !e.visible(h, st) {
		return nil, serve.Wire(serve.NotFound("no run %s", req.GetRunId()), "")
	}
	resp := &runv1.FetchResponse{State: wireState(st.Status), Stage: st.Stage, Tool: st.Tool}
	if !st.CreatedAt.IsZero() {
		resp.CreatedAt = timestamppb.New(st.CreatedAt)
	}
	if !st.CompletedAt.IsZero() {
		resp.CompletedAt = timestamppb.New(st.CompletedAt)
	}
	switch {
	case st.Error != nil:
		resp.Outcome = &runv1.FetchResponse_Error{Error: st.Error}
	case st.Status == StatusSucceeded:
		resp.Outcome = &runv1.FetchResponse_Result{Result: st.Result}
	}
	return resp, nil
}

// Events is the run's record after a cursor. The same ownership as Fetch: the
// run's state is read first, and a foreign or unknown run is NOT_FOUND, so the
// stream of a run the caller may not see is never read.
func (e *Engine) Events(ctx context.Context, req *runv1.EventsRequest, h Headers) (*runv1.EventsResponse, *invokev1.Error) {
	if req.GetRunId() == "" {
		return nil, serve.Wire(serve.Invalid("run_id is required"), "")
	}
	if e.Store == nil {
		// No record was kept. Empty and closed: not an error, and not a claim
		// that the run never existed.
		return &runv1.EventsResponse{Closed: true}, nil
	}
	st, err := e.Store.Fetch(ctx, req.GetRunId(), 0)
	switch {
	case errors.Is(err, ErrNotFound):
		return nil, serve.Wire(serve.NotFound("no run %s", req.GetRunId()), "")
	case err != nil:
		return nil, e.fail(ctx, req.GetRunId(), h, "", err)
	}
	if !e.visible(h, st) {
		return nil, serve.Wire(serve.NotFound("no run %s", req.GetRunId()), "")
	}
	wait := req.GetWait().AsDuration()
	if wait > MaxFetchWait {
		wait = MaxFetchWait
	}
	events, closed, err := e.Store.Events(ctx, req.GetRunId(), req.GetAfter(), wait)
	if err != nil {
		return nil, e.fail(ctx, req.GetRunId(), h, "", err)
	}
	return &runv1.EventsResponse{Events: events, Closed: closed}, nil
}

// visible: may this principal see this run? The authority model decides when
// there is one -- the starting principal, or the subject it acted for; with
// none, the invoking account and nobody else, which is what this was before.
// Its callers -- Fetch, Events -- do not change.
func (e *Engine) visible(h Headers, st State) bool {
	if e.Authority != nil {
		seen := Seen{Principal: st.Principal, ActsFor: st.ActsFor}
		if seen.Principal.Zero() {
			// A run recorded before there was an authority: fall back to the
			// account, so an upgrade does not hide every run already started.
			seen.Principal = Principal{Kind: KindAccount, ID: st.Caller}
		}
		return e.Authority.CanSee(context.Background(), PrincipalOf(h), seen)
	}
	return h.Caller != "" && h.Caller == st.Caller
}

func wireState(s Status) runv1.RunState {
	switch s {
	case StatusRunning:
		return runv1.RunState_RUN_STATE_RUNNING
	case StatusSucceeded:
		return runv1.RunState_RUN_STATE_SUCCEEDED
	case StatusFailed:
		return runv1.RunState_RUN_STATE_FAILED
	case StatusCancelled:
		return runv1.RunState_RUN_STATE_CANCELLED
	}
	return runv1.RunState_RUN_STATE_UNSPECIFIED
}
