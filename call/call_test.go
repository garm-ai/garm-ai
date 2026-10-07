package call_test

import (
	"context"
	"errors"
	"iter"
	"reflect"
	"strings"
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

// ---- Follow: catch-up stitched to live by sequence number ----

// follower scripts a record and a live feed. Events answers from record for
// seq > after; Subscribe hands out live, a channel the test feeds.
type follower struct {
	fake
	record    []*runv1.Event
	grow      []*runv1.Event // appended to record after the FIRST Events call: the run moved on
	closed    bool
	live      chan *runv1.Event
	stopped   int
	eventsErr error
	calls     []uint64 // every after a call to Events carried
}

func ev(seq uint64, kind string) *runv1.Event {
	e := &runv1.Event{RunId: "k", Seq: seq}
	switch kind {
	case "done":
		e.Kind = &runv1.Event_Done{Done: &runv1.Done{State: runv1.RunState_RUN_STATE_SUCCEEDED}}
	default:
		e.Kind = &runv1.Event_Stage{Stage: &runv1.Stage{Stage: kind}}
	}
	return e
}

func (f *follower) Events(_ context.Context, _ string, after uint64, _ time.Duration) (*runv1.EventsResponse, error) {
	f.calls = append(f.calls, after)
	if f.eventsErr != nil {
		return nil, f.eventsErr
	}
	defer func() {
		if len(f.calls) == 1 && len(f.grow) > 0 {
			f.record = append(f.record, f.grow...)
		}
	}()
	var out []*runv1.Event
	for _, e := range f.record {
		if e.GetSeq() > after {
			out = append(out, e)
		}
	}
	return &runv1.EventsResponse{Events: out, Closed: f.closed}, nil
}

func (f *follower) Subscribe(context.Context, string) (<-chan *runv1.Event, func(), error) {
	return f.live, func() { f.stopped++ }, nil
}

func seqs(evs []*runv1.Event) []uint64 {
	var out []uint64
	for _, e := range evs {
		out = append(out, e.GetSeq())
	}
	return out
}

func drain(t *testing.T, it iter.Seq2[*runv1.Event, error], within time.Duration) ([]*runv1.Event, error) {
	t.Helper()
	type res struct {
		evs []*runv1.Event
		err error
	}
	done := make(chan res, 1)
	go func() {
		var evs []*runv1.Event
		for e, err := range it {
			if err != nil {
				done <- res{evs, err}
				return
			}
			evs = append(evs, e)
		}
		done <- res{evs, nil}
	}()
	select {
	case r := <-done:
		return r.evs, r.err
	case <-time.After(within):
		t.Fatal("Follow did not return")
		return nil, nil
	}
}

// Property 4 at the client: started mid-run, every event once, in order,
// across the catch-up/live boundary. The record holds 1..2 when Events is
// called; the live channel carries 2, 3 and 4 (done).
func TestFollowYieldsEveryEventOnceAcrossTheBoundary(t *testing.T) {
	f := &follower{record: []*runv1.Event{ev(1, "calling:0"), ev(2, "x")}, live: make(chan *runv1.Event, 8)}
	f.live <- ev(2, "x")
	f.live <- ev(3, "y")
	f.live <- ev(4, "done")
	got, err := drain(t, call.Ref{RunID: "k", Invoker: f}.Follow(context.Background(), 0), 5*time.Second)
	if err != nil || !reflect.DeepEqual(seqs(got), []uint64{1, 2, 3, 4}) {
		t.Fatalf("%v %v", seqs(got), err)
	}
	if f.stopped != 1 {
		t.Fatalf("the subscription was stopped %d times", f.stopped)
	}
}

// Property 5: a transport error on the live side resumes from the last
// sequence through Events -- no duplicate, no gap.
func TestFollowResumesFromTheLastSequence(t *testing.T) {
	f := &follower{record: []*runv1.Event{ev(1, "a"), ev(2, "b")}, live: make(chan *runv1.Event, 8),
		grow: []*runv1.Event{ev(3, "c"), ev(4, "done")}} // the run moves on while the live side is away
	f.live <- ev(2, "b")
	close(f.live) // the live side went away after 2
	got, err := drain(t, call.Ref{RunID: "k", Invoker: f}.Follow(context.Background(), 0), 5*time.Second)
	if err != nil || !reflect.DeepEqual(seqs(got), []uint64{1, 2, 3, 4}) {
		t.Fatalf("%v %v", seqs(got), err)
	}
	if len(f.calls) < 2 || f.calls[len(f.calls)-1] != 2 {
		t.Fatalf("Events was asked with cursors %v; the resume should ask after 2", f.calls)
	}
}

// Review focus 1: the cursor at the end of a closed run returns at once.
func TestFollowFromTheEndOfAClosedRunReturnsAtOnce(t *testing.T) {
	f := &follower{record: []*runv1.Event{ev(1, "a"), ev(2, "done")}, closed: true, live: make(chan *runv1.Event)}
	got, err := drain(t, call.Ref{RunID: "k", Invoker: f}.Follow(context.Background(), 2), time.Second)
	if err != nil || len(got) != 0 {
		t.Fatalf("%v %v", seqs(got), err)
	}
}

// Review focus 3: two live events already behind the catch-up stay in order,
// once each. The record has 1..3 when Events is called; the live buffer holds
// 2, 3, 4.
func TestFollowKeepsOrderAcrossTwoLiveEventsBehindTheCatchUp(t *testing.T) {
	f := &follower{record: []*runv1.Event{ev(1, "a"), ev(2, "b"), ev(3, "c")}, live: make(chan *runv1.Event, 8)}
	f.live <- ev(2, "b")
	f.live <- ev(3, "c")
	f.live <- ev(4, "done")
	got, err := drain(t, call.Ref{RunID: "k", Invoker: f}.Follow(context.Background(), 0), 5*time.Second)
	if err != nil || !reflect.DeepEqual(seqs(got), []uint64{1, 2, 3, 4}) {
		t.Fatalf("%v %v", seqs(got), err)
	}
}

// Follow ends after done and stops the subscription; a caller's ctx ends it too.
func TestFollowStopsWithTheCaller(t *testing.T) {
	f := &follower{record: []*runv1.Event{ev(1, "a")}, live: make(chan *runv1.Event)}
	ctx, cancel := context.WithCancel(context.Background())
	go func() { time.Sleep(200 * time.Millisecond); cancel() }()
	got, err := drain(t, call.Ref{RunID: "k", Invoker: f}.Follow(ctx, 0), 5*time.Second)
	if !errors.Is(err, context.Canceled) || !reflect.DeepEqual(seqs(got), []uint64{1}) {
		t.Fatalf("%v %v", seqs(got), err)
	}
	if f.stopped != 1 {
		t.Fatalf("stopped %d", f.stopped)
	}
}

// An Invoker that cannot follow says so at once.
func TestFollowNeedsAFollower(t *testing.T) {
	_, err := drain(t, call.Ref{RunID: "k", Invoker: &fake{}}.Follow(context.Background(), 0), time.Second)
	if err == nil || !strings.Contains(err.Error(), "Follow") {
		t.Fatalf("got %v", err)
	}
}
