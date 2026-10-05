package rundbos_test

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"path/filepath"
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
	block chan struct{} // when non-nil, Call blocks until closed
}

func (f *fakeTools) Call(ctx context.Context, tool string, input []byte, _ time.Duration, h run.Headers) ([]byte, error) {
	f.mu.Lock()
	f.calls = append(f.calls, call{tool, input, h, trace.SpanContextFromContext(ctx).TraceID()})
	block := f.block
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
	s, err := rundbos.Open(context.Background(), rundbos.Config{
		URL: url, AppName: "garm-test", Executor: executor, Workers: 2, Migrate: true,
		Logger: slog.New(slog.DiscardHandler),
	}, holder(t), tools)
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
	began := time.Now()
	st, err := s.Fetch(context.Background(), "k-bound", 300*time.Millisecond)
	if err != nil || st.Status != run.StatusRunning {
		t.Fatalf("%+v %v", st, err)
	}
	if took := time.Since(began); took < 250*time.Millisecond || took > 3*time.Second {
		t.Fatalf("Fetch held for %v, want about 300ms", took)
	}
}
