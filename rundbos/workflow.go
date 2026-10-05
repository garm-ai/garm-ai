package rundbos

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

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
		out, err := dbos.RunAsStep(ctx, func(c context.Context) ([]byte, error) {
			return s.tools.Call(continueTrace(c, r.Traceparent), a.Tool, a.Input, a.Budget, h)
		},
			dbos.WithStepName(h.Idempotency),
			dbos.WithStepMaxRetries(StepAttempts-1),
			dbos.WithStepRetryPredicate(func(err error) bool { return observe.Kind(err) == "UNAVAILABLE" }))
		if err != nil {
			if toolErr := unwrapStep(err); toolErr != nil {
				// The tool's own kind -- after bounded retries for UNAVAILABLE.
				return outcome{Error: wireOf(toolErr, r.ID)}, nil
			}
			return outcome{}, err // cancelled, or DBOS itself
		}
		last = out
	}
	if err := dbos.SetEvent(ctx, StageKey, "done"); err != nil {
		return outcome{}, err
	}
	return outcome{Result: last}, nil
}

// unwrapStep finds the tool's *serve.Error inside DBOS's wrapping -- a step
// error, or the retries-exhausted error whose cause is the last attempt's.
func unwrapStep(err error) *serve.Error {
	var se *serve.Error
	if errors.As(err, &se) {
		return se
	}
	return nil
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
