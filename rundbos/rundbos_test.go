package rundbos_test

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"

	"go.opentelemetry.io/otel/trace"

	"github.com/garm-ai/garm-ai/catalogue"
	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	"github.com/garm-ai/garm-ai/internal/fixtures"
	"github.com/garm-ai/garm-ai/observe/otlp/otlptest"
	"github.com/garm-ai/garm-ai/run"
	"github.com/garm-ai/garm-ai/rundbos"
	"github.com/garm-ai/garm-ai/serve"
)

// asyncTool is the example's async tool, which the Weather fixture declares.
const asyncTool = "weather.v1.schedule_report"

type call struct {
	tool  string
	input []byte
	h     run.Headers
	trace trace.TraceID
}

// fakeTools records every call and answers what it is told; it is run.Caller.
type fakeTools struct {
	mu    sync.Mutex
	calls []call
	reply []byte
	err   error
	block chan struct{}            // when non-nil, Call blocks until closed
	gates map[string]chan struct{} // per idempotency key: Call blocks until that one is closed
}

func (f *fakeTools) Call(ctx context.Context, tool string, input []byte, _ time.Duration, h run.Headers) ([]byte, error) {
	f.mu.Lock()
	f.calls = append(f.calls, call{tool, input, h, trace.SpanContextFromContext(ctx).TraceID()})
	block := f.block
	if g, ok := f.gates[h.Idempotency]; ok {
		block = g
	}
	f.mu.Unlock()
	if block != nil {
		select {
		case <-block:
		case <-ctx.Done():
			return nil, ctx.Err()
		}
	}
	return f.reply, f.err
}

func (f *fakeTools) n() int {
	f.mu.Lock()
	defer f.mu.Unlock()
	return len(f.calls)
}

func holder(t *testing.T) *catalogue.Holder {
	t.Helper()
	var h catalogue.Holder
	h.Set(fixtures.Weather(t).Catalogue)
	return &h
}

func openAs(t *testing.T, url, executor string, tools run.Caller) *rundbos.Store {
	t.Helper()
	return openWith(t, url, executor, 2, tools)
}

func openWith(t *testing.T, url, executor string, workers int, tools run.Caller) *rundbos.Store {
	t.Helper()
	return openOn(t, url, executor, workers, tools, holder(t))
}

func openOn(t *testing.T, url, executor string, workers int, tools run.Caller, cat *catalogue.Holder) *rundbos.Store {
	t.Helper()
	s, err := rundbos.Open(context.Background(), rundbos.Config{
		URL: url, AppName: "garm-test", Executor: executor, Workers: workers, Migrate: true,
		Logger: slog.New(slog.DiscardHandler),
	}, cat, tools)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = s.Close(context.Background()) })
	return s
}

func open(t *testing.T, url string, tools run.Caller) *rundbos.Store {
	t.Helper()
	return openAs(t, url, "test-a", tools)
}

// memory is a store private to this test: a SQLite FILE in the test's temp
// dir. NOT "sqlite::memory:": DBOS opens a pool of eight connections, and with
// the pure-Go driver each connection to ":memory:" is its own empty database
// -- the schema lands on one and the next query runs on another; a named
// shared-cache database is one database but locks table-wide under the pool.
// A file in WAL mode is what works, and it is what the recovery test needs
// anyway: two DBOS contexts on one database.
func memory(t *testing.T) string {
	return rundbos.FileURL(filepath.Join(t.TempDir(), "runs.db"))
}

func mustStart(t *testing.T, s *rundbos.Store, id string) {
	t.Helper()
	r := run.Run{ID: id, Tool: asyncTool, Input: []byte("in"), Fingerprint: run.Fingerprint(asyncTool, []byte("in")),
		Caller: "ACX", CallerName: "studio", Correlation: "c-" + id, Message: "m0"}
	if _, err := s.Start(context.Background(), r); err != nil {
		t.Fatal(err)
	}
}

func awaitTerminal(t *testing.T, s *rundbos.Store, id string, within time.Duration) run.State {
	t.Helper()
	deadline := time.Now().Add(within)
	for time.Now().Before(deadline) {
		st, err := s.Fetch(context.Background(), id, 0)
		if err != nil {
			t.Fatal(err)
		}
		if st.Status != run.StatusRunning {
			return st
		}
		time.Sleep(50 * time.Millisecond)
	}
	t.Fatalf("run %s did not finish within %v", id, within)
	return run.State{}
}

// Properties 1 and 2: Start returns once durable; the run completes without
// the caller; Fetch returns the tool's bytes, the caller, the tool, the times.
func TestARunCompletesWithoutTheCaller(t *testing.T) {
	tools := &fakeTools{reply: []byte("report-1")}
	s := open(t, memory(t), tools)
	started, err := s.Start(context.Background(), run.Run{ID: "k1", Tool: asyncTool, Input: []byte("in"),
		Fingerprint: run.Fingerprint(asyncTool, []byte("in")), Caller: "ACX", Message: "m0", Correlation: "c1"})
	if err != nil || started.ID != "k1" || started.Existing {
		t.Fatalf("%+v %v", started, err)
	}
	st := awaitTerminal(t, s, "k1", 5*time.Second)
	if st.Status != run.StatusSucceeded || string(st.Result) != "report-1" || st.Caller != "ACX" || st.Tool != asyncTool {
		t.Fatalf("state %+v", st)
	}
	if st.CreatedAt.IsZero() || st.CompletedAt.Before(st.CreatedAt) {
		t.Errorf("times %v %v", st.CreatedAt, st.CompletedAt)
	}
	if tools.n() != 1 || string(tools.calls[0].input) != "in" || tools.calls[0].tool != asyncTool {
		t.Fatalf("calls %+v", tools.calls)
	}
}

// Property 3: a tool's refusal is the run's failure, with its kind -- and a
// deliberate kind is not retried.
func TestAToolsRefusalFailsTheRunWithItsKind(t *testing.T) {
	tools := &fakeTools{err: serve.Invalid("place is required")}
	s := open(t, memory(t), tools)
	mustStart(t, s, "k2")
	st := awaitTerminal(t, s, "k2", 5*time.Second)
	if st.Status != run.StatusFailed || st.Error.GetKind() != invokev1.ErrorKind_ERROR_KIND_INVALID || !strings.Contains(st.Error.GetMessage(), "place") {
		t.Fatalf("state %+v", st)
	}
	if st.Error.GetId() != "k2" {
		t.Errorf("the error's id is %q, want the run id", st.Error.GetId())
	}
	if tools.n() != 1 {
		t.Fatalf("INVALID was retried: %d calls", tools.n())
	}
}

// UNAVAILABLE is retried a bounded number of times, then fails the run.
func TestUnavailableIsRetriedThenFailsTheRun(t *testing.T) {
	tools := &fakeTools{err: serve.Unavailable("down")}
	s := open(t, memory(t), tools)
	mustStart(t, s, "k3")
	st := awaitTerminal(t, s, "k3", 20*time.Second)
	if st.Status != run.StatusFailed || st.Error.GetKind() != invokev1.ErrorKind_ERROR_KIND_UNAVAILABLE {
		t.Fatalf("%+v", st)
	}
	if n := tools.n(); n != rundbos.StepAttempts {
		t.Fatalf("%d attempts, want %d", n, rundbos.StepAttempts)
	}
}

// Property 17: the tool receives the stored envelope and deterministic ids.
func TestTheToolReceivesTheEnvelope(t *testing.T) {
	tools := &fakeTools{reply: []byte("ok")}
	s := open(t, memory(t), tools)
	r := run.Run{ID: "k4", Tool: asyncTool, Fingerprint: run.Fingerprint(asyncTool, nil), Caller: "ACX",
		Correlation: "c1", Message: "m0", Traceparent: "00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01"}
	if _, err := s.Start(context.Background(), r); err != nil {
		t.Fatal(err)
	}
	awaitTerminal(t, s, "k4", 5*time.Second)
	got := tools.calls[0].h
	want := run.StepHeaders(r, 0)
	if got != want {
		t.Fatalf("headers %+v, want %+v", got, want)
	}
}

// Review focus 3: a reply the bus refuses is INTERNAL once, not retried forever.
func TestAnOversizedToolReplyFailsTheRunOnce(t *testing.T) {
	tools := &fakeTools{err: serve.Internal(errors.New("sending the response: nats: maximum payload exceeded"))}
	s := open(t, memory(t), tools)
	mustStart(t, s, "k5")
	st := awaitTerminal(t, s, "k5", 5*time.Second)
	if st.Status != run.StatusFailed || st.Error.GetKind() != invokev1.ErrorKind_ERROR_KIND_INTERNAL || tools.n() != 1 {
		t.Fatalf("%+v calls=%d", st, tools.n())
	}
}

// Property 14 at this level: the step's ctx carries the run's trace -- the one
// the caller started, continued from the stored traceparent.
func TestTheStepContinuesTheRunsTrace(t *testing.T) {
	otlptest.Install(t)
	tools := &fakeTools{reply: []byte("ok")}
	s := open(t, memory(t), tools)
	r := run.Run{ID: "k-trace", Tool: asyncTool, Fingerprint: run.Fingerprint(asyncTool, nil), Caller: "ACX", Message: "m0",
		Traceparent: "00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01"}
	if _, err := s.Start(context.Background(), r); err != nil {
		t.Fatal(err)
	}
	awaitTerminal(t, s, "k-trace", 5*time.Second)
	if got := tools.calls[0].trace.String(); got != "0af7651916cd43dd8448eb211c80319c" {
		t.Fatalf("the step ran under trace %q, want the caller's", got)
	}
}

// The plan is a checkpoint: step 0 of every run is "plan" and holds the action
// list; the tool call is step 1 under its idempotency key. Read back through
// DBOS's own step log, so the audit shows what the run decided before it acted.
func TestThePlanIsStepZero(t *testing.T) {
	tools := &fakeTools{reply: []byte("ok")}
	s := open(t, memory(t), tools)
	mustStart(t, s, "k6")
	awaitTerminal(t, s, "k6", 5*time.Second)
	steps, err := s.Steps(context.Background(), "k6")
	if err != nil {
		t.Fatal(err)
	}
	if len(steps) != 2 || steps[0].Name != "plan" || steps[1].Name != "k6:0" {
		t.Fatalf("steps %+v, want [plan, k6:0]", steps)
	}
	var p struct{ Actions []run.Action }
	if err := json.Unmarshal(steps[0].Output, &p); err != nil || len(p.Actions) != 1 || p.Actions[0].Tool != asyncTool {
		t.Fatalf("step 0's checkpoint %s: %v", steps[0].Output, err)
	}
}

// A tool missing from the catalogue is planning's refusal, recorded as the
// run's failure with NOT_FOUND -- and no tool was called.
func TestAnUnknownToolFailsAtPlanning(t *testing.T) {
	tools := &fakeTools{reply: []byte("never")}
	s := open(t, memory(t), tools)
	if _, err := s.Start(context.Background(), run.Run{ID: "k7", Tool: "nope.v1.gone", Caller: "ACX", Message: "m0"}); err != nil {
		t.Fatal(err)
	}
	st := awaitTerminal(t, s, "k7", 5*time.Second)
	if st.Status != run.StatusFailed || st.Error.GetKind() != invokev1.ErrorKind_ERROR_KIND_NOT_FOUND || tools.n() != 0 {
		t.Fatalf("%+v calls=%d", st, tools.n())
	}
}

// An unknown id is ErrNotFound, which the engine turns into NOT_FOUND.
func TestAnUnknownRunIsNotFound(t *testing.T) {
	s := open(t, memory(t), &fakeTools{})
	if _, err := s.Fetch(context.Background(), "never-started", 0); !errors.Is(err, run.ErrNotFound) {
		t.Fatalf("got %v, want ErrNotFound", err)
	}
}

// A Start without a key is refused: the key is the run id.
func TestAStartWithoutAKeyIsRefused(t *testing.T) {
	s := open(t, memory(t), &fakeTools{})
	_, err := s.Start(context.Background(), run.Run{Tool: asyncTool})
	var se *serve.Error
	if !errors.As(err, &se) || se.Kind != invokev1.ErrorKind_ERROR_KIND_INVALID {
		t.Fatalf("got %v", err)
	}
}

// Property 8 (the completion half): a Fetch with a wait returns when the run
// completes, not when the wait elapses.
func TestFetchWaitReturnsWhenTheRunCompletes(t *testing.T) {
	tools := &fakeTools{reply: []byte("late"), block: make(chan struct{})}
	s := open(t, memory(t), tools)
	mustStart(t, s, "k-wait")
	waitUntil(t, "the tool to be called", func() bool { return tools.n() == 1 }) // past the queued→calling change
	go func() { time.Sleep(300 * time.Millisecond); close(tools.block) }()
	began := time.Now()
	st, err := s.Fetch(context.Background(), "k-wait", 10*time.Second)
	if err != nil || st.Status != run.StatusSucceeded {
		t.Fatalf("%+v %v", st, err)
	}
	if took := time.Since(began); took > 3*time.Second {
		t.Fatalf("Fetch held for %v on a run that finished in 300ms", took)
	}
}

// And it returns RUNNING when the wait elapses first -- the cap is the
// engine's; here only that a bounded wait is bounded.
func TestFetchWaitIsBounded(t *testing.T) {
	tools := &fakeTools{reply: []byte("never"), block: make(chan struct{})}
	s := open(t, memory(t), tools)
	defer close(tools.block)
	mustStart(t, s, "k-bound")
	// Settled at calling:0 first: a stage change would return earlier, rightly.
	waitUntil(t, "the tool to be called", func() bool { return tools.n() == 1 })
	began := time.Now()
	st, err := s.Fetch(context.Background(), "k-bound", 300*time.Millisecond)
	if err != nil || st.Status != run.StatusRunning {
		t.Fatalf("%+v %v", st, err)
	}
	if took := time.Since(began); took < 250*time.Millisecond || took > 3*time.Second {
		t.Fatalf("Fetch held for %v, want about 300ms", took)
	}
}

// Property 5: a reused key with a different request is refused BEFORE DBOS --
// which would otherwise answer from the recording and ignore the new input.
func TestAReusedKeyWithDifferentInputIsRefusedBeforeDBOS(t *testing.T) {
	tools := &fakeTools{reply: []byte("a")}
	s := open(t, memory(t), tools)
	mustStart(t, s, "k-fp")
	awaitTerminal(t, s, "k-fp", 5*time.Second)
	_, err := s.Start(context.Background(), run.Run{ID: "k-fp", Tool: asyncTool, Input: []byte("other"),
		Fingerprint: run.Fingerprint(asyncTool, []byte("other")), Caller: "ACX", Message: "m0"})
	var se *serve.Error
	if !errors.As(err, &se) || se.Kind != invokev1.ErrorKind_ERROR_KIND_INVALID || !strings.Contains(err.Error(), "k-fp") {
		t.Fatalf("got %v, want INVALID naming the key", err)
	}
	if tools.n() != 1 {
		t.Fatalf("a second run was started: %d calls", tools.n())
	}
	st, _ := s.Fetch(context.Background(), "k-fp", 0)
	if string(st.Result) != "a" {
		t.Fatalf("the first run's answer changed: %+v", st)
	}
}

// Property 4: the same key with the same request is the same run.
func TestAReusedKeyWithTheSameInputIsTheSameRun(t *testing.T) {
	tools := &fakeTools{reply: []byte("a")}
	s := open(t, memory(t), tools)
	mustStart(t, s, "k-same")
	awaitTerminal(t, s, "k-same", 5*time.Second)
	started, err := s.Start(context.Background(), run.Run{ID: "k-same", Tool: asyncTool, Input: []byte("in"),
		Fingerprint: run.Fingerprint(asyncTool, []byte("in")), Caller: "ACX", Message: "m-retry"})
	if err != nil || !started.Existing || started.ID != "k-same" {
		t.Fatalf("%+v %v", started, err)
	}
	time.Sleep(200 * time.Millisecond)
	if tools.n() != 1 {
		t.Fatalf("the retry started a second run: %d calls", tools.n())
	}
}

// Review focus 1: a reused key while the first run is still RUNNING is the
// same run -- the fingerprint check must not depend on completion.
func TestAReusedKeyOnARunningRunIsTheSameRun(t *testing.T) {
	tools := &fakeTools{reply: []byte("a"), block: make(chan struct{})}
	s := open(t, memory(t), tools)
	mustStart(t, s, "k-live")
	deadline := time.Now().Add(5 * time.Second)
	for tools.n() == 0 && time.Now().Before(deadline) {
		time.Sleep(20 * time.Millisecond)
	}
	started, err := s.Start(context.Background(), run.Run{ID: "k-live", Tool: asyncTool, Input: []byte("in"),
		Fingerprint: run.Fingerprint(asyncTool, []byte("in")), Caller: "ACX", Message: "m-retry"})
	if err != nil || !started.Existing {
		t.Fatalf("%+v %v", started, err)
	}
	_, err = s.Start(context.Background(), run.Run{ID: "k-live", Tool: asyncTool, Input: []byte("else"),
		Fingerprint: run.Fingerprint(asyncTool, []byte("else")), Caller: "ACX", Message: "m-retry"})
	var se *serve.Error
	if !errors.As(err, &se) || se.Kind != invokev1.ErrorKind_ERROR_KIND_INVALID {
		t.Fatalf("a different request on a live key: %v", err)
	}
	close(tools.block)
	awaitTerminal(t, s, "k-live", 5*time.Second)
	if tools.n() != 1 {
		t.Fatalf("%d calls", tools.n())
	}
}

func waitUntil(t *testing.T, what string, cond func() bool) {
	t.Helper()
	deadline := time.Now().Add(5 * time.Second)
	for !cond() {
		if time.Now().After(deadline) {
			t.Fatalf("waited 5s for %s", what)
		}
		time.Sleep(20 * time.Millisecond)
	}
}

// Property 9: stage is the run's own word -- calling:<i> while the tool is in
// flight, done after -- a word and a reference, never a payload.
func TestStageIsTheRunsWord(t *testing.T) {
	tools := &fakeTools{reply: []byte("ok"), block: make(chan struct{})}
	s := open(t, memory(t), tools)
	mustStart(t, s, "k-stage")
	waitUntil(t, "the tool to be called", func() bool { return tools.n() == 1 })
	st, err := s.Fetch(context.Background(), "k-stage", 0)
	if err != nil || st.Status != run.StatusRunning || st.Stage != "calling:0" {
		t.Fatalf("%+v %v", st, err)
	}
	close(tools.block)
	if st := awaitTerminal(t, s, "k-stage", 5*time.Second); st.Stage != "done" {
		t.Fatalf("after completion the stage is %q, want done", st.Stage)
	}
}

// Review focus 2: a run that is in the queue but not yet dequeued says
// queued -- not an error, not a hang beyond wait.
func TestFetchOnAQueuedRunSaysQueued(t *testing.T) {
	tools := &fakeTools{reply: []byte("ok"), gates: map[string]chan struct{}{"k-first:0": make(chan struct{})}}
	s := openWith(t, memory(t), "test-a", 1, tools) // ONE worker: the second run waits in the queue
	mustStart(t, s, "k-first")
	waitUntil(t, "the first run to occupy the worker", func() bool { return tools.n() == 1 })
	mustStart(t, s, "k-second")
	began := time.Now()
	st, err := s.Fetch(context.Background(), "k-second", 300*time.Millisecond)
	if err != nil || st.Status != run.StatusRunning || st.Stage != "queued" {
		t.Fatalf("%+v %v", st, err)
	}
	if time.Since(began) > 3*time.Second {
		t.Fatal("Fetch on a queued run hung")
	}
	close(tools.gates["k-first:0"])
	awaitTerminal(t, s, "k-second", 10*time.Second)
}

// Property 10: a Fetch with a wait returns on a STAGE change, not only on
// completion -- queued becomes calling:0 when a worker frees up.
func TestFetchWaitReturnsOnAStageChange(t *testing.T) {
	tools := &fakeTools{reply: []byte("ok"), gates: map[string]chan struct{}{
		"k-a:0": make(chan struct{}), "k-b:0": make(chan struct{})}}
	s := openWith(t, memory(t), "test-a", 1, tools)
	mustStart(t, s, "k-a")
	waitUntil(t, "k-a to occupy the worker", func() bool { return tools.n() == 1 })
	mustStart(t, s, "k-b")
	if st, _ := s.Fetch(context.Background(), "k-b", 0); st.Stage != "queued" {
		t.Fatalf("k-b is %+v, want queued", st)
	}
	type reading struct {
		st  run.State
		err error
	}
	got := make(chan reading, 1)
	go func() {
		st, err := s.Fetch(context.Background(), "k-b", 10*time.Second)
		got <- reading{st, err}
	}()
	time.Sleep(200 * time.Millisecond)
	close(tools.gates["k-a:0"]) // k-a finishes; k-b is dequeued and blocks in its tool
	select {
	case r := <-got:
		if r.err != nil || r.st.Status != run.StatusRunning || r.st.Stage != "calling:0" {
			t.Fatalf("%+v %v, want RUNNING at calling:0", r.st, r.err)
		}
	case <-time.After(8 * time.Second):
		t.Fatal("Fetch did not return on the stage change")
	}
	close(tools.gates["k-b:0"])
	awaitTerminal(t, s, "k-b", 5*time.Second)
}

// die stops a replica the way a deploy does: Close. The SDK treats a shutdown
// as "not a cancellation request" -- the in-flight run's row stays PENDING on
// this executor's name, which is exactly what recovery looks for.
func die(t *testing.T, s *rundbos.Store) {
	t.Helper()
	if err := s.Close(context.Background()); err != nil {
		t.Logf("close: %v", err)
	}
}

// Property 11: a run that was executing when its replica stopped is finished
// by a successor with the SAME executor id; a replica with a different id does
// not take it (spec §2's limit: distribution is the queue's, recovery is the
// identity's). The tool sees the same step key and message id both times.
func TestAStoppedReplicasRunIsFinishedByItsSuccessorWithTheSameIdentity(t *testing.T) {
	file := memory(t)
	tools := &fakeTools{reply: []byte("done"), block: make(chan struct{})}
	a := openAs(t, file, "test-a", tools)
	mustStart(t, a, "k-rec")
	waitUntil(t, "the step to be in flight", func() bool { return tools.n() == 1 })
	die(t, a)

	// A replica with a DIFFERENT identity does not take the run.
	other := openAs(t, file, "test-b", tools)
	time.Sleep(1500 * time.Millisecond)
	if st, err := other.Fetch(context.Background(), "k-rec", 0); err != nil || st.Status != run.StatusRunning {
		t.Fatalf("a different executor took the run: %+v %v", st, err)
	}
	if tools.n() != 1 {
		t.Fatalf("%d tool calls before the successor", tools.n())
	}

	// The successor with the SAME identity recovers it; the tool is released;
	// the run finishes.
	close(tools.block)
	successor := openAs(t, file, "test-a", tools)
	st := awaitTerminal(t, successor, "k-rec", 15*time.Second)
	if st.Status != run.StatusSucceeded || string(st.Result) != "done" {
		t.Fatalf("%+v", st)
	}
	tools.mu.Lock()
	defer tools.mu.Unlock()
	if len(tools.calls) < 1 || len(tools.calls) > 2 {
		t.Fatalf("%d tool calls", len(tools.calls))
	}
	for _, c := range tools.calls {
		if c.h.Idempotency != "k-rec:0" || c.h.Message != tools.calls[0].h.Message {
			t.Fatalf("a replayed step changed its ids: %+v", c.h)
		}
	}
}

// Property 18: the replay follows the plan recorded at start, not the
// catalogue at replay time -- here the successor's catalogue has no tools at all.
func TestAReplayFollowsThePlanRecordedAtStart(t *testing.T) {
	file := memory(t)
	tools := &fakeTools{reply: []byte("done"), block: make(chan struct{})}
	a := openAs(t, file, "test-a", tools)
	mustStart(t, a, "k-pin")
	waitUntil(t, "the step to be in flight", func() bool { return tools.n() == 1 })
	die(t, a)
	close(tools.block)
	var empty catalogue.Holder
	empty.Set(fixtures.Empty(t).Catalogue)
	successor := openOn(t, file, "test-a", 2, tools, &empty)
	st := awaitTerminal(t, successor, "k-pin", 15*time.Second)
	if st.Status != run.StatusSucceeded || string(st.Result) != "done" {
		t.Fatalf("the replay re-planned against the new catalogue: %+v", st)
	}
}

// Review focus 5: two LIVE replicas sharing an identity is the
// misconfiguration the guide warns about. The second's Launch re-enqueues the
// first's in-flight run and both may execute it; the step key collapses the
// duplicate at the tool, and the run succeeds once. The outcome is asserted,
// not endorsed.
func TestTwoLiveReplicasWithOneIdentityIsTheMisconfigurationTheGuideWarnsAbout(t *testing.T) {
	file := memory(t)
	tools := &fakeTools{reply: []byte("done"), block: make(chan struct{})}
	first := openAs(t, file, "test-a", tools)
	mustStart(t, first, "k-twin")
	waitUntil(t, "the step to be in flight", func() bool { return tools.n() == 1 })
	second := openAs(t, file, "test-a", tools) // same identity, first still alive
	time.Sleep(500 * time.Millisecond)
	close(tools.block)
	st := awaitTerminal(t, second, "k-twin", 15*time.Second)
	if st.Status != run.StatusSucceeded {
		t.Fatalf("%+v", st)
	}
	tools.mu.Lock()
	defer tools.mu.Unlock()
	if n := len(tools.calls); n < 1 || n > 2 {
		t.Fatalf("%d tool calls", n)
	}
	for _, c := range tools.calls {
		if c.h.Idempotency != "k-twin:0" {
			t.Fatalf("a duplicate execution changed the step key: %+v", c.h)
		}
	}
}

// A call that TIMED OUT is not retried: the work may well be in flight, and
// retrying is what multiplies it. The run fails UNAVAILABLE after one call.
func TestATimedOutCallIsNotRetried(t *testing.T) {
	tools := &fakeTools{err: serve.Unavailable("weather.v1.schedule_report did not answer within 1m0s").Because(context.DeadlineExceeded)}
	s := open(t, memory(t), tools)
	mustStart(t, s, "k-timeout")
	st := awaitTerminal(t, s, "k-timeout", 10*time.Second)
	if st.Status != run.StatusFailed || st.Error.GetKind() != invokev1.ErrorKind_ERROR_KIND_UNAVAILABLE {
		t.Fatalf("%+v", st)
	}
	if tools.n() != 1 {
		t.Fatalf("a timed-out call was retried: %d calls", tools.n())
	}
}

// The plan carries the tool's DECLARED limit as the step's budget -- the
// example declares 60s -- so rund never invents a deadline for an async call.
func TestThePlanCarriesTheDeclaredLimit(t *testing.T) {
	tools := &fakeTools{reply: []byte("ok")}
	s := open(t, memory(t), tools)
	mustStart(t, s, "k-limit")
	awaitTerminal(t, s, "k-limit", 5*time.Second)
	steps, err := s.Steps(context.Background(), "k-limit")
	if err != nil || len(steps) < 1 {
		t.Fatal(err)
	}
	var p struct{ Actions []run.Action }
	if err := json.Unmarshal(steps[0].Output, &p); err != nil || len(p.Actions) != 1 || p.Actions[0].Budget != 60*time.Second {
		t.Fatalf("the plan's budget: %s (%v), want 60s", steps[0].Output, err)
	}
}

// A tool's refusal is recorded in the step's checkpoint as a VALUE carrying the
// kind -- never as a step error, which DBOS flattens to text and which a replay
// would read back as INTERNAL. The step log shows no error and the kind.
func TestTheStepRecordsTheToolsKindAsAValue(t *testing.T) {
	tools := &fakeTools{err: serve.Invalid("place is required")}
	s := open(t, memory(t), tools)
	mustStart(t, s, "k-value")
	awaitTerminal(t, s, "k-value", 5*time.Second)
	steps, err := s.Steps(context.Background(), "k-value")
	if err != nil || len(steps) != 2 {
		t.Fatalf("%v %+v", err, steps)
	}
	if steps[1].Error != "" {
		t.Fatalf("the tool's refusal was recorded as a step ERROR (%q): a replay reads that back as text", steps[1].Error)
	}
	var o struct{ Error *invokev1.Error }
	if err := json.Unmarshal(steps[1].Output, &o); err != nil || o.Error.GetKind() != invokev1.ErrorKind_ERROR_KIND_INVALID {
		t.Fatalf("the step's checkpoint does not carry the kind: %s (%v)", steps[1].Output, err)
	}
}

// A held Fetch that returns early -- on a stage change -- leaves no goroutine
// behind polling the store for the rest of its wait.
func TestAHeldFetchLeavesNoGoroutineBehind(t *testing.T) {
	tools := &fakeTools{reply: []byte("ok"), gates: map[string]chan struct{}{"k-a:0": make(chan struct{}), "k-b:0": make(chan struct{})}}
	s := openWith(t, memory(t), "test-a", 1, tools)
	mustStart(t, s, "k-a")
	waitUntil(t, "k-a to occupy the worker", func() bool { return tools.n() == 1 })
	mustStart(t, s, "k-b")
	done := make(chan struct{})
	go func() { defer close(done); _, _ = s.Fetch(context.Background(), "k-b", 20*time.Second) }()
	time.Sleep(200 * time.Millisecond)
	close(tools.gates["k-a:0"]) // k-b moves queued → calling:0; the held Fetch returns
	<-done
	// The SDK's result poll sleeps a fixed second between reads, so a cancelled
	// wait ends within that second -- bounded by the SDK's interval, not by wait.
	time.Sleep(1500 * time.Millisecond)
	if n := goroutinesIn("rundbos.(*Store).Fetch"); n != 0 {
		t.Fatalf("%d goroutine(s) still inside Fetch after it returned: the completion wait outlived it", n)
	}
	close(tools.gates["k-b:0"])
	awaitTerminal(t, s, "k-b", 5*time.Second)
}

// goroutinesIn counts goroutines whose stack mentions fn.
func goroutinesIn(fn string) int {
	buf := make([]byte, 1<<20)
	n := runtime.Stack(buf, true)
	return strings.Count(string(buf[:n]), fn)
}

// Two Starts with one key and DIFFERENT requests, racing: at most one is
// accepted, and the run's recorded fingerprint is the accepted request's. The
// loser must be INVALID -- never pending for a run that is somebody else's.
func TestConcurrentStartsWithOneKeyAndTwoRequestsNeverBothSucceed(t *testing.T) {
	tools := &fakeTools{reply: []byte("ok")}
	s := open(t, memory(t), tools)
	for i := 0; i < 40; i++ {
		key := "k-race-" + strconv.Itoa(i)
		a := run.Run{ID: key, Tool: asyncTool, Input: []byte("a"), Fingerprint: run.Fingerprint(asyncTool, []byte("a")), Caller: "ACX", Message: "m0"}
		b := run.Run{ID: key, Tool: asyncTool, Input: []byte("b"), Fingerprint: run.Fingerprint(asyncTool, []byte("b")), Caller: "ACX", Message: "m0"}
		var wg sync.WaitGroup
		var errA, errB error
		wg.Add(2)
		go func() { defer wg.Done(); _, errA = s.Start(context.Background(), a) }()
		go func() { defer wg.Done(); _, errB = s.Start(context.Background(), b) }()
		wg.Wait()
		if errA == nil && errB == nil {
			t.Fatalf("%s: both requests were accepted under one key", key)
		}
		if errA != nil && errB != nil {
			t.Fatalf("%s: both refused: %v / %v", key, errA, errB)
		}
	}
}

// --run-store-migrate=false with no schema is a CONFIGURATION error -- the
// deployment said it owns the migrations and did not run them -- so rund
// refuses to start, naming the flag, rather than degrading quietly.
func TestAnAbsentSchemaWithMigrateFalseRefusesToStart(t *testing.T) {
	_, err := rundbos.Open(context.Background(), rundbos.Config{
		URL: memory(t), AppName: "garm-test", Executor: "test-a", Migrate: false, Logger: slog.New(slog.DiscardHandler),
	}, holder(t), &fakeTools{})
	if err == nil || !strings.Contains(err.Error(), "--run-store-migrate") {
		t.Fatalf("got %v, want a refusal naming --run-store-migrate", err)
	}
}

// A run that outlives the replica's run ceiling is CANCELLED: the ceiling is
// rund's (--run-store-run-limit), applied as the run's durable deadline from
// the moment it starts executing -- a queued run does not burn it waiting.
// Here the tool never answers; the run is cancelled in under the ceiling plus
// the SDK's cancel latency, and the tool saw its context end.
func TestARunPastTheRunLimitIsCancelled(t *testing.T) {
	tools := &fakeTools{reply: []byte("never"), block: make(chan struct{})}
	defer close(tools.block)
	s, err := rundbos.Open(context.Background(), rundbos.Config{
		URL: memory(t), AppName: "garm-test", Executor: "test-a", Workers: 1, Migrate: true,
		Logger: slog.New(slog.DiscardHandler), RunLimit: 500 * time.Millisecond,
	}, holder(t), tools)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = s.Close(context.Background()) })
	mustStart(t, s, "k-ceiling")
	began := time.Now()
	st := awaitTerminal(t, s, "k-ceiling", 10*time.Second)
	if st.Status != run.StatusCancelled {
		t.Fatalf("%+v, want CANCELLED", st)
	}
	if took := time.Since(began); took > 5*time.Second {
		t.Fatalf("cancelled after %v, want about the 500ms ceiling", took)
	}
	if st.CompletedAt.IsZero() {
		t.Error("a cancelled run has no completed_at")
	}
}
