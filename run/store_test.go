package run_test

import (
	"context"
	"strings"
	"testing"
	"time"

	"google.golang.org/protobuf/types/known/durationpb"

	"github.com/garm-ai/garm-ai/call"
	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
	"github.com/garm-ai/garm-ai/run"
)

const probeAsync = "probe.v1.schedule"

// Spec §6.1: inside a run, message ids are deterministic -- the same (run, step)
// yields the same id on a replay -- and causation chains from the caller's
// message through each step.
func TestStepHeadersAreDeterministicAndChain(t *testing.T) {
	r := run.Run{ID: "key-1", Correlation: "c1", Message: "m0", Traceparent: "00-aa-bb-01"}
	s0, s0again, s1 := run.StepHeaders(r, 0), run.StepHeaders(r, 0), run.StepHeaders(r, 1)
	if s0.Message == "" || s0.Message != s0again.Message {
		t.Fatalf("step 0's message id is not deterministic: %q vs %q", s0.Message, s0again.Message)
	}
	if s0.Causation != "m0" {
		t.Errorf("step 0's causation = %q, want the caller's message id m0", s0.Causation)
	}
	if s1.Causation != s0.Message || s1.Message == s0.Message {
		t.Errorf("step 1: causation %q message %q; want chained from step 0 (%q)", s1.Causation, s1.Message, s0.Message)
	}
	if s0.Idempotency != "key-1:0" || s1.Idempotency != "key-1:1" {
		t.Errorf("idempotency keys %q %q", s0.Idempotency, s1.Idempotency)
	}
	if s0.Correlation != "c1" || s0.Traceparent != "00-aa-bb-01" {
		t.Errorf("envelope not carried: %+v", s0)
	}
	if other := run.StepHeaders(run.Run{ID: "key-2", Message: "m0"}, 0); other.Message == s0.Message {
		t.Error("two runs share a step-0 message id")
	}
}

func TestFingerprintBindsToolAndInput(t *testing.T) {
	a := run.Fingerprint("t", []byte("x"))
	if a != run.Fingerprint("t", []byte("x")) {
		t.Fatal("not deterministic")
	}
	if a == run.Fingerprint("t", []byte("y")) || a == run.Fingerprint("u", []byte("x")) {
		t.Fatal("input or tool did not change the fingerprint")
	}
	if a == run.Fingerprint("tx", nil) { // the separator matters
		t.Fatal("tool‖input is ambiguous")
	}
}

// recorder is a Store that remembers what it was asked and answers what it is told.
type recorder struct {
	started []run.Run
	state   run.State
	err     error
	waits   []time.Duration
}

func (r *recorder) Start(_ context.Context, x run.Run) (run.Started, error) {
	r.started = append(r.started, x)
	return run.Started{ID: x.ID}, r.err
}

func (r *recorder) Fetch(_ context.Context, _ string, wait time.Duration) (run.State, error) {
	r.waits = append(r.waits, wait)
	if r.err != nil {
		return run.State{}, r.err
	}
	return r.state, nil
}

// engineWith is the two-tool catalogue -- one sync, one async -- over a store
// (nil = today's rund) and a tool caller that answers "answer".
func engineWith(t *testing.T, store run.Store) (*run.Engine, *caller) {
	t.Helper()
	h := catalogueOf(t, syncTool("probe.v1.read", time.Second), asyncTool(probeAsync))
	c := &caller{out: []byte("answer")}
	e := engine(h, c)
	if store != nil {
		e.Store = store
	}
	return e, c
}

// Property 6: an async invoke without an idempotency key is INVALID -- rund
// minting one would make a retry a second run.
func TestAnAsyncInvokeWithoutAKeyIsInvalid(t *testing.T) {
	e, c := engineWith(t, &recorder{})
	_, failure := e.Invoke(context.Background(), &runv1.InvokeRequest{Tool: probeAsync}, run.Headers{Message: "m0"})
	if failure == nil || failure.GetKind() != invokev1.ErrorKind_ERROR_KIND_INVALID {
		t.Fatalf("got %v, want INVALID", failure)
	}
	if len(c.calls) != 0 {
		t.Fatal("the tool was called")
	}
}

// An async invoke with a key becomes a durable run: Start is called with the
// envelope and the fingerprint, and the caller gets pending{run_id}. The tool
// is NOT called here -- a replica calls it from the queue.
func TestAnAsyncInvokeStartsARunAndAnswersPending(t *testing.T) {
	rec := &recorder{}
	e, c := engineWith(t, rec)
	resp, failure := e.Invoke(context.Background(), &runv1.InvokeRequest{Tool: probeAsync, Input: []byte("in")},
		run.Headers{Idempotency: "key-1", Correlation: "c1", Message: "m0", Traceparent: "tp", Caller: "ACX", CallerName: "studio"})
	if failure != nil {
		t.Fatal(failure)
	}
	if resp.GetRunId() != "key-1" || resp.GetPending() == nil {
		t.Fatalf("got %v, want pending for key-1", resp)
	}
	if len(rec.started) != 1 {
		t.Fatalf("Start called %d times", len(rec.started))
	}
	r := rec.started[0]
	if r.ID != "key-1" || r.Tool != probeAsync || string(r.Input) != "in" || r.Fingerprint != run.Fingerprint(probeAsync, []byte("in")) ||
		r.Caller != "ACX" || r.CallerName != "studio" || r.Correlation != "c1" || r.Message != "m0" || r.Traceparent != "tp" {
		t.Fatalf("the run was started with %+v", r)
	}
	if len(c.calls) != 0 {
		t.Fatal("the engine called the tool on the invoking path")
	}
}

// With no correlation from the caller, the run id is the correlation (as for sync).
func TestAnAsyncRunWithoutACorrelationUsesItsID(t *testing.T) {
	rec := &recorder{}
	e, _ := engineWith(t, rec)
	if _, failure := e.Invoke(context.Background(), &runv1.InvokeRequest{Tool: probeAsync}, run.Headers{Idempotency: "key-9", Caller: "ACX"}); failure != nil {
		t.Fatal(failure)
	}
	if rec.started[0].Correlation != "key-9" {
		t.Fatalf("correlation %q, want the run id", rec.started[0].Correlation)
	}
}

// Property 13: with no store, an async tool is refused per call, naming the flag;
// a sync call is untouched.
func TestWithoutAStoreAsyncIsRefusedNamingTheFlag(t *testing.T) {
	e, c := engineWith(t, nil)
	_, failure := e.Invoke(context.Background(), &runv1.InvokeRequest{Tool: probeAsync}, run.Headers{Idempotency: "k"})
	if failure == nil || failure.GetKind() != invokev1.ErrorKind_ERROR_KIND_UNAVAILABLE || !strings.Contains(failure.GetMessage(), "--run-store") {
		t.Fatalf("got %v, want UNAVAILABLE naming --run-store", failure)
	}
	resp, failure := e.Invoke(context.Background(), &runv1.InvokeRequest{Tool: "probe.v1.read"}, run.Headers{})
	if failure != nil || string(resp.GetResult()) != "answer" || len(c.calls) != 1 {
		t.Fatalf("the sync call: %v %v", resp, failure)
	}
}

// A store that fails to Start is UNAVAILABLE to the caller, with the run id.
func TestAStoreThatCannotStartIsUnavailable(t *testing.T) {
	rec := &recorder{err: context.DeadlineExceeded}
	e, _ := engineWith(t, rec)
	_, failure := e.Invoke(context.Background(), &runv1.InvokeRequest{Tool: probeAsync}, run.Headers{Idempotency: "key-2"})
	if failure == nil || failure.GetId() != "key-2" {
		t.Fatalf("got %v, want a failure carrying key-2", failure)
	}
}

// Property 7 at the engine: a run is visible only to its invoking account.
func TestFetchFromAnotherAccountIsNotFound(t *testing.T) {
	rec := &recorder{state: run.State{ID: "key-1", Status: run.StatusSucceeded, Caller: "ACX", Result: []byte("r"), Stage: "done",
		CreatedAt: time.Unix(100, 0), CompletedAt: time.Unix(101, 0)}}
	e, _ := engineWith(t, rec)
	resp, failure := e.Fetch(context.Background(), &runv1.FetchRequest{RunId: "key-1"}, run.Headers{Caller: "ACX"})
	if failure != nil || resp.GetState() != runv1.RunState_RUN_STATE_SUCCEEDED || string(resp.GetResult()) != "r" {
		t.Fatalf("the owner's fetch: %v %v", resp, failure)
	}
	if resp.GetStage() != "done" || resp.GetCreatedAt().AsTime().Unix() != 100 || resp.GetCompletedAt().AsTime().Unix() != 101 {
		t.Errorf("stage/timestamps not carried: %v", resp)
	}
	_, failure = e.Fetch(context.Background(), &runv1.FetchRequest{RunId: "key-1"}, run.Headers{Caller: "ACY"})
	if failure == nil || failure.GetKind() != invokev1.ErrorKind_ERROR_KIND_NOT_FOUND {
		t.Fatalf("a foreign fetch: %v, want NOT_FOUND", failure)
	}
	_, failure = e.Fetch(context.Background(), &runv1.FetchRequest{RunId: "key-1"}, run.Headers{})
	if failure == nil || failure.GetKind() != invokev1.ErrorKind_ERROR_KIND_NOT_FOUND {
		t.Fatalf("an anonymous fetch: %v, want NOT_FOUND", failure)
	}
	rec.err = run.ErrNotFound
	_, failure = e.Fetch(context.Background(), &runv1.FetchRequest{RunId: "nope"}, run.Headers{Caller: "ACX"})
	if failure == nil || failure.GetKind() != invokev1.ErrorKind_ERROR_KIND_NOT_FOUND {
		t.Fatalf("an unknown id: %v, want NOT_FOUND", failure)
	}
}

// A failed run carries the tool's error; a running one carries neither arm.
func TestFetchCarriesTheOutcome(t *testing.T) {
	rec := &recorder{state: run.State{ID: "k", Status: run.StatusFailed, Caller: "ACX",
		Error: &invokev1.Error{Kind: invokev1.ErrorKind_ERROR_KIND_INVALID, Message: "place is required"}}}
	e, _ := engineWith(t, rec)
	resp, failure := e.Fetch(context.Background(), &runv1.FetchRequest{RunId: "k"}, run.Headers{Caller: "ACX"})
	if failure != nil || resp.GetState() != runv1.RunState_RUN_STATE_FAILED || resp.GetError().GetKind() != invokev1.ErrorKind_ERROR_KIND_INVALID {
		t.Fatalf("%v %v", resp, failure)
	}
	rec.state = run.State{ID: "k", Status: run.StatusRunning, Caller: "ACX", Stage: "queued"}
	resp, _ = e.Fetch(context.Background(), &runv1.FetchRequest{RunId: "k"}, run.Headers{Caller: "ACX"})
	if resp.GetState() != runv1.RunState_RUN_STATE_RUNNING || resp.GetOutcome() != nil || resp.GetStage() != "queued" {
		t.Fatalf("%v", resp)
	}
	rec.state = run.State{ID: "k", Status: run.StatusCancelled, Caller: "ACX"}
	if resp, _ = e.Fetch(context.Background(), &runv1.FetchRequest{RunId: "k"}, run.Headers{Caller: "ACX"}); resp.GetState() != runv1.RunState_RUN_STATE_CANCELLED {
		t.Fatalf("%v", resp)
	}
}

// Fetch clamps wait to MaxFetchWait before asking the store.
func TestFetchClampsWait(t *testing.T) {
	rec := &recorder{state: run.State{ID: "k", Status: run.StatusRunning, Caller: "ACX"}}
	e, _ := engineWith(t, rec)
	_, _ = e.Fetch(context.Background(), &runv1.FetchRequest{RunId: "k", Wait: durationpb.New(time.Hour)}, run.Headers{Caller: "ACX"})
	_, _ = e.Fetch(context.Background(), &runv1.FetchRequest{RunId: "k", Wait: durationpb.New(time.Second)}, run.Headers{Caller: "ACX"})
	if len(rec.waits) != 2 || rec.waits[0] != run.MaxFetchWait || rec.waits[1] != time.Second {
		t.Fatalf("store asked to wait %v, want [%v 1s]", rec.waits, run.MaxFetchWait)
	}
}

// Without a store, Fetch stays NOT_RETAINED: nothing was kept, and that is said.
func TestWithoutAStoreFetchIsNotRetained(t *testing.T) {
	e, _ := engineWith(t, nil)
	resp, failure := e.Fetch(context.Background(), &runv1.FetchRequest{RunId: "k"}, run.Headers{Caller: "ACX"})
	if failure != nil || resp.GetState() != runv1.RunState_RUN_STATE_NOT_RETAINED {
		t.Fatalf("%v %v", resp, failure)
	}
}

// call.MaxWait is what a generated client asks for per Fetch; the engine's cap
// is what it gets. `call` imports no engine, so the two are pinned equal here.
func TestTheClientsMaxWaitIsTheEnginesCap(t *testing.T) {
	if call.MaxWait != run.MaxFetchWait {
		t.Fatalf("call.MaxWait %v != run.MaxFetchWait %v", call.MaxWait, run.MaxFetchWait)
	}
}
