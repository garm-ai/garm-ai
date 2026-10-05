package call_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/garm-ai/garm-ai/call"
	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
)

// fake is an Invoker that records the deadline each Fetch arrived with and
// answers a scripted sequence of states.
type fake struct {
	deadlines []time.Duration
	waits     []time.Duration
	states    []runv1.RunState
	err       error
}

func (f *fake) Invoke(context.Context, string, []byte, call.Options) (*runv1.InvokeResponse, error) {
	return nil, errors.New("not used")
}

func (f *fake) Fetch(ctx context.Context, _ string, wait time.Duration) (*runv1.FetchResponse, error) {
	if dl, ok := ctx.Deadline(); ok {
		f.deadlines = append(f.deadlines, time.Until(dl).Round(100*time.Millisecond))
	} else {
		f.deadlines = append(f.deadlines, -1)
	}
	f.waits = append(f.waits, wait)
	if f.err != nil {
		return nil, f.err
	}
	st := f.states[0]
	if len(f.states) > 1 {
		f.states = f.states[1:]
	}
	return &runv1.FetchResponse{State: st}, nil
}

// A Ref's Fetch sets its deadline from the wait it asked for, plus the hops --
// the same rule as a sync call's budget. A caller never invents the number.
func TestARefsFetchDeadlineIsTheWaitPlusTheHops(t *testing.T) {
	f := &fake{states: []runv1.RunState{runv1.RunState_RUN_STATE_RUNNING}}
	ref := call.Ref{RunID: "k", Invoker: f}
	if _, err := ref.Fetch(context.Background(), 3*time.Second); err != nil {
		t.Fatal(err)
	}
	if f.waits[0] != 3*time.Second || f.deadlines[0] != 3*time.Second+call.Overhead {
		t.Fatalf("wait %v deadline %v, want 3s and 3s+overhead", f.waits[0], f.deadlines[0])
	}
	// A shorter deadline already on ctx wins.
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	_, _ = ref.Fetch(ctx, 3*time.Second)
	if f.deadlines[1] > time.Second {
		t.Fatalf("the caller's own deadline was extended to %v", f.deadlines[1])
	}
}

// Await asks for MaxWait at a time until the run is terminal.
func TestAwaitLoopsUntilTerminal(t *testing.T) {
	f := &fake{states: []runv1.RunState{runv1.RunState_RUN_STATE_RUNNING, runv1.RunState_RUN_STATE_RUNNING, runv1.RunState_RUN_STATE_FAILED}}
	resp, err := call.Ref{RunID: "k", Invoker: f}.Await(context.Background())
	if err != nil || resp.GetState() != runv1.RunState_RUN_STATE_FAILED {
		t.Fatalf("%v %v", resp, err)
	}
	if len(f.waits) != 3 || f.waits[0] != call.MaxWait {
		t.Fatalf("waits %v", f.waits)
	}
}

// Await stops when the caller's context does, rather than looping forever on a
// run that never finishes.
func TestAwaitStopsWithTheCaller(t *testing.T) {
	f := &fake{states: []runv1.RunState{runv1.RunState_RUN_STATE_RUNNING}}
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if _, err := (call.Ref{RunID: "k", Invoker: f}).Await(ctx); !errors.Is(err, context.Canceled) {
		t.Fatalf("got %v, want the caller's cancellation", err)
	}
}
