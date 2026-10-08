package rundbos

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/dbos-inc/dbos-transact-golang/dbos"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/propagation"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/timestamppb"

	"github.com/garm-ai/garm-ai/authority"
	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/run"
	"github.com/garm-ai/garm-ai/serve"
)

// outcome is what the invoke workflow returns: the tool's answer OR the tool's
// error, as a value. A Go error from the workflow means the RUN could not be
// executed; a tool saying INVALID is an answer, and it is recorded as one.
//
// Why a value and not a returned error: DBOS serialises a returned error to its
// text, and the kind would have to be smuggled through it. The caller sees the
// same FAILED with the tool's kind either way.
type outcome struct {
	Result []byte
	Error  *invokev1.Error
}

// plan is step 0's checkpoint: the actions the run will take, or the refusal
// planning produced.
type plan struct {
	Actions []run.Action
	// Allowlist is an agent's, pinned at plan time: what a run of it may call,
	// and the half of a step's decision the grant cannot widen (authority spec
	// §7). nil for a plain tool, whose own step is its only one.
	Allowlist []string
	Error     *invokev1.Error
}

// stepOutcome is a tool-call step's checkpoint: the tool's bytes, or the
// tool's error with its kind. A VALUE, never a returned error: DBOS flattens a
// returned error to its text, and a replay would read the tool's INVALID back
// as INTERNAL. Only a cancellation is returned as a Go error.
type stepOutcome struct {
	Result []byte
	Error  *invokev1.Error
}

// StepBackoff is the pause between attempts of one tool call that answered
// UNAVAILABLE without having timed out.
const StepBackoff = 200 * time.Millisecond

// invoke is the engine's plan loop made durable: one step per action, each
// under deterministic headers (run.StepHeaders), the stage set before each.
//
// DETERMINISM: everything between two steps depends only on the input and on
// earlier step outputs. The catalogue is read inside step 0 and never again,
// so a replay after a catalogue change follows the plan the run was started
// with, not whatever the catalogue says now.
func (s *Store) invoke(ctx dbos.Context, r run.Run) (outcome, error) {
	planned, err := dbos.RunAsStep(ctx, func(context.Context) (plan, error) {
		tool, ok := s.cat.Current().Tool(r.Tool)
		if !ok {
			return plan{Error: wireOf(serve.NotFound("no tool named %q in the catalogue", r.Tool), r.ID)}, nil
		}
		actions, err := run.Plan(tool, r.Input)
		if err != nil {
			return plan{Error: wireOf(err, r.ID)}, nil
		}
		var allowlist []string
		if tool.IsAgent() {
			for _, ref := range tool.Agent.GetTools() {
				allowlist = append(allowlist, ref.GetName())
			}
		}
		return plan{Actions: actions, Allowlist: allowlist}, nil
	}, dbos.WithStepName("plan"), dbos.WithStepMaxRetries(0))
	if err != nil {
		return outcome{}, err
	}
	if planned.Error != nil {
		return outcome{Error: planned.Error}, nil
	}

	// The record (push spec §1, §5): every event written to the run's stream,
	// numbered by a counter replay rebuilds, published live best effort.
	em := &emitter{s: s, r: r}
	var last []byte
	for i, a := range planned.Actions {
		if err := dbos.SetEvent(ctx, StageKey, fmt.Sprintf("calling:%d", i)); err != nil {
			return outcome{}, err
		}
		if err := em.emit(ctx, &runv1.Event_Stage{Stage: &runv1.Stage{Stage: fmt.Sprintf("calling:%d", i)}}); err != nil {
			return outcome{}, err
		}
		// The authority decision, from the RECORD: the run's compartments and the
		// plan's pinned requirement and allowlist -- the intersection, never a
		// fresh lookup, so a replay decides as the run was decided (spec §7).
		if err := authority.CheckStep(r.Compartments, planned.Allowlist, a.Tool, a.Requires); err != nil {
			if err := em.emit(ctx, &runv1.Event_Step{Step: &runv1.Step{Key: run.StepHeaders(r, i).Idempotency,
				Tool: a.Tool, Kind: invokev1.ErrorKind_ERROR_KIND_DENIED}}); err != nil {
				return outcome{}, err
			}
			if err := em.finish(ctx, runv1.RunState_RUN_STATE_FAILED); err != nil {
				return outcome{}, err
			}
			return outcome{Error: wireOf(err, r.ID)}, nil
		}
		h := run.StepHeaders(r, i)
		out, err := dbos.RunAsStep(ctx, func(c context.Context) (stepOutcome, error) {
			return s.call(continueTrace(c, r.Traceparent), a, h, r.ID)
		}, dbos.WithStepName(h.Idempotency), dbos.WithStepMaxRetries(0))
		if err != nil {
			return outcome{}, err // cancelled, or DBOS itself
		}
		step := &runv1.Step{Key: h.Idempotency, Tool: a.Tool}
		if out.Error != nil {
			step.Kind = out.Error.GetKind()
		}
		if err := em.emit(ctx, &runv1.Event_Step{Step: step}); err != nil {
			return outcome{}, err
		}
		if out.Error != nil {
			if err := em.finish(ctx, runv1.RunState_RUN_STATE_FAILED); err != nil {
				return outcome{}, err
			}
			return outcome{Error: out.Error}, nil
		}
		last = out.Result
	}
	if err := em.finish(ctx, runv1.RunState_RUN_STATE_SUCCEEDED); err != nil {
		return outcome{}, err
	}
	return outcome{Result: last}, nil
}

// emitter numbers a run's events. The counter lives in the workflow's locals,
// which a replay rebuilds by the same path, so the number is deterministic and
// equals the stream offset plus one.
type emitter struct {
	s *Store
	r run.Run
	n uint64
}

// emit records one event, then offers it live. Two acts of different standing:
// WriteStream at workflow level is DBOS's own durable, checkpointed write -- a
// replay does not write again -- and a failure fails the run, because a run
// with no record of what it did is not a run this platform keeps. The publish
// is a step of its own, best effort: a failure is counted and logged and never
// returned, and a replay skips the step, because live means now.
func (e *emitter) emit(ctx dbos.Context, kind any) error {
	e.n++
	ev := &runv1.Event{RunId: e.r.ID, Seq: e.n, At: timestamppb.Now()}
	switch k := kind.(type) {
	case *runv1.Event_Stage:
		ev.Kind = k
	case *runv1.Event_Step:
		ev.Kind = k
	case *runv1.Event_Done:
		ev.Kind = k
	case *runv1.Event_Progress:
		ev.Kind = k
	case *runv1.Event_Question:
		ev.Kind = k
	case *runv1.Event_Chunk:
		ev.Kind = k
	}
	if err := CheckEvent(ev); err != nil {
		return err
	}
	b, err := proto.Marshal(ev)
	if err != nil {
		return err
	}
	if err := dbos.WriteStream(ctx, StreamKey, b); err != nil {
		return err
	}
	seq := e.n
	_, _ = dbos.RunAsStep(ctx, func(context.Context) (bool, error) {
		return e.s.publish(e.r, seq, b), nil
	}, dbos.WithStepName(fmt.Sprintf("publish:%d", seq)), dbos.WithStepMaxRetries(0))
	return nil
}

// finish is the run's last two words: stage done, done <state>, and the
// stream closed so a reader can tell "no more" from "not yet".
func (e *emitter) finish(ctx dbos.Context, state runv1.RunState) error {
	if err := dbos.SetEvent(ctx, StageKey, "done"); err != nil {
		return err
	}
	if err := e.emit(ctx, &runv1.Event_Stage{Stage: &runv1.Stage{Stage: "done"}}); err != nil {
		return err
	}
	if err := e.emit(ctx, &runv1.Event_Done{Done: &runv1.Done{State: state}}); err != nil {
		return err
	}
	return dbos.CloseStream(ctx, StreamKey)
}

// publish offers one event live. A run with no proven owner has no subject
// that can carry it: nothing is published, once said.
func (s *Store) publish(r run.Run, seq uint64, b []byte) bool {
	if s.out == nil {
		return false
	}
	if r.Caller == "" {
		if seq == 1 {
			s.log.Warn("run has no owner; its events are recorded and published to nobody", "run", r.ID)
		}
		return false
	}
	if err := s.out.Publish(r.Caller, r.ID, seq, b); err != nil {
		s.log.Warn("live event not delivered", "run", r.ID, "seq", seq, "error", err)
		s.recordEvent("dropped")
		return false
	}
	s.recordEvent("delivered")
	return true
}

func (s *Store) recordEvent(outcome string) {
	observe.Instruments().RunEvents.Add(context.Background(), 1, metric.WithAttributes(observe.KeyOutcome.String(outcome)))
}

// call is one tool-call step's body: up to StepAttempts calls, retried only
// when the tool was UNAVAILABLE and the call did NOT time out. A timed-out call
// may well be in flight -- retrying it is what multiplies the work -- so it
// fails the run after one attempt, with the declared limit in the message.
// Every answer, the tool's refusal included, is returned as a value.
func (s *Store) call(ctx context.Context, a run.Action, h run.Headers, runID string) (stepOutcome, error) {
	for attempt := 1; ; attempt++ {
		out, err := s.tools.Call(ctx, a.Tool, a.Input, a.Budget, h)
		if err == nil {
			return stepOutcome{Result: out}, nil
		}
		if ctx.Err() != nil {
			return stepOutcome{}, ctx.Err() // the workflow was cancelled: not an answer
		}
		retryable := observe.Kind(err) == "UNAVAILABLE" && !errors.Is(err, context.DeadlineExceeded)
		if !retryable || attempt >= StepAttempts {
			return stepOutcome{Error: wireOf(err, runID)}, nil
		}
		s.log.Warn("tool unavailable; retrying", "run", runID, "tool", a.Tool, "attempt", attempt, "error", err)
		select {
		case <-time.After(StepBackoff):
		case <-ctx.Done():
			return stepOutcome{}, ctx.Err()
		}
	}
}

// continueTrace puts the run's stored trace context on the step's ctx, so the
// tool caller's span is a child of the trace the caller started. No span is
// started here: the tool call's own span is the step's record.
func continueTrace(ctx context.Context, traceparent string) context.Context {
	if traceparent == "" {
		return ctx
	}
	return otel.GetTextMapPropagator().Extract(ctx, propagation.MapCarrier{"traceparent": traceparent})
}

func marshalJSON(v any) ([]byte, error) { return json.Marshal(v) }
