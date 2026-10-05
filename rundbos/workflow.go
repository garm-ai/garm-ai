package rundbos

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/dbos-inc/dbos-transact-golang/dbos"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"

	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
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
	Error   *invokev1.Error
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
		return plan{Actions: actions}, nil
	}, dbos.WithStepName("plan"), dbos.WithStepMaxRetries(0))
	if err != nil {
		return outcome{}, err
	}
	if planned.Error != nil {
		return outcome{Error: planned.Error}, nil
	}

	var last []byte
	for i, a := range planned.Actions {
		if err := dbos.SetEvent(ctx, StageKey, fmt.Sprintf("calling:%d", i)); err != nil {
			return outcome{}, err
		}
		h := run.StepHeaders(r, i)
		out, err := dbos.RunAsStep(ctx, func(c context.Context) (stepOutcome, error) {
			return s.call(continueTrace(c, r.Traceparent), a, h, r.ID)
		}, dbos.WithStepName(h.Idempotency), dbos.WithStepMaxRetries(0))
		if err != nil {
			return outcome{}, err // cancelled, or DBOS itself
		}
		if out.Error != nil {
			return outcome{Error: out.Error}, nil
		}
		last = out.Result
	}
	if err := dbos.SetEvent(ctx, StageKey, "done"); err != nil {
		return outcome{}, err
	}
	return outcome{Result: last}, nil
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
