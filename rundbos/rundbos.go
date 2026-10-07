// Package rundbos is rund's run store on DBOS: the ONLY importer of the DBOS SDK
// (mise run no-sdk). It implements run.Store behind the port the spec draws,
// and its one workflow is the engine's plan loop made durable.
//
// What DBOS gives and what we take from it is in
// docs/research/2026-10-05-dbos-go-sdk.md; the design in
// docs/specs/2026-10-05-run-store-design.md.
package rundbos

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net"
	"net/url"
	"os"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/dbos-inc/dbos-transact-golang/dbos"
	_ "github.com/dbos-inc/dbos-transact-golang/dbos/driver/sqlite" // sqlite: URLs, pure Go: the estate needs no Postgres
	"go.opentelemetry.io/otel/metric"

	"github.com/garm-ai/garm-ai/catalogue"
	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/run"
	"github.com/garm-ai/garm-ai/serve"
)

const (
	// QueueName is the one queue every replica works (spec §2).
	QueueName = "runs"
	// WorkflowName is the one workflow: invoke.
	WorkflowName = "invoke"
	// StepAttempts bounds the UNAVAILABLE retry of one tool-call step: the
	// first attempt plus the retries.
	StepAttempts = 3
	// StageKey is the event a run publishes about where it is.
	StageKey = "stage"
)

// Config is what rund's flags fill in.
type Config struct {
	// URL is postgres://… or sqlite:…; credentials in it are redacted in logs.
	URL string
	// AppName is DBOS's application name; one per estate.
	AppName string
	// Executor is the STABLE executor id recovery depends on (spec §2): a run
	// that was executing when a replica died is re-enqueued only when a process
	// with the same id launches again. "" means the hostname. DBOS__VMID in the
	// environment overrides it.
	Executor string
	// Workers is this replica's worker concurrency on the queue.
	Workers int
	// Migrate false verifies the schema and never creates it (SkipMigrations):
	// for a deployment that owns its migrations.
	Migrate bool
	Logger  *slog.Logger
	// Retry is the first interval between reconnection attempts while the
	// store is unreachable; it doubles up to RetryMax. 0 means a second.
	Retry time.Duration
	// RunLimit is the CEILING on one run: how long it may take from the moment
	// a replica starts executing it (a queued run does not burn it waiting)
	// until it is CANCELLED. The deployment's number, not the author's -- a
	// tool's own limit bounds one call to its handler; this bounds the whole
	// thing, so nothing can hang forever. 0 means none.
	RunLimit time.Duration
}

// RetryMax caps the reconnection interval.
const RetryMax = 30 * time.Second

// Store implements run.Store on DBOS.
//
// The DBOS runtime behind it is a SESSION that can be absent: when the
// database is unreachable at start or lost later, the store is degraded --
// Start and Fetch say UNAVAILABLE naming the store, a reconnection runs in the
// background with backoff, and rund keeps serving sync calls, which never
// touch this (spec §7). A deployment watches garm.run.store{state}.
type Store struct {
	cfg   Config
	cat   *catalogue.Holder
	tools run.Caller
	log   *slog.Logger

	live     atomic.Pointer[session]
	retrying atomic.Bool
	closed   chan struct{}
	wg       sync.WaitGroup
}

type session struct{ ctx dbos.Context }

var _ run.Store = (*Store)(nil)

// Open validates the configuration -- a URL that is not a store is an error,
// never "degraded" -- and connects. An unreachable database degrades the store
// rather than failing Open: rund starts, serves sync, and reconnects on its own.
func Open(ctx context.Context, cfg Config, cat *catalogue.Holder, tools run.Caller) (*Store, error) {
	if cfg.Logger == nil {
		cfg.Logger = slog.Default()
	}
	if cfg.Executor == "" {
		cfg.Executor, _ = os.Hostname()
	}
	if cfg.Workers <= 0 {
		cfg.Workers = 4
	}
	if cfg.AppName == "" {
		cfg.AppName = "garm"
	}
	if cfg.Retry <= 0 {
		cfg.Retry = time.Second
	}
	if !strings.HasPrefix(cfg.URL, "postgres://") && !strings.HasPrefix(cfg.URL, "postgresql://") && !strings.HasPrefix(cfg.URL, "sqlite:") {
		return nil, fmt.Errorf("rundbos: --run-store must be postgres://… or sqlite:…, not %q", Redact(cfg.URL))
	}
	s := &Store{cfg: cfg, cat: cat, tools: tools, log: cfg.Logger, closed: make(chan struct{})}
	if err := s.connect(ctx); err != nil {
		if !cfg.Migrate && !IsConnectionError(err) {
			// The deployment said it owns the migrations and the schema is not
			// there (or not current): configuration, not weather. Refuse to
			// start, as the flag promises, rather than degrade behind one warning.
			return nil, fmt.Errorf("rundbos: --run-store-migrate=false and the store's schema is not usable: %w", err)
		}
		s.log.Warn("run store unreachable; serving sync only until it returns",
			"url", Redact(cfg.URL), "error", err, "retry", cfg.Retry)
		s.record("down")
		s.retry()
	}
	return s, nil
}

// connect builds a DBOS session: context, workflow, queue, Launch (which
// recovers this executor's in-flight runs).
func (s *Store) connect(ctx context.Context) error {
	dctx, err := dbos.NewContext(ctx, dbos.Config{
		AppName:                s.cfg.AppName,
		DatabaseURL:            s.cfg.URL,
		ExecutorID:             s.cfg.Executor,
		Logger:                 s.cfg.Logger,
		SkipMigrations:         !s.cfg.Migrate,
		SystemDBStartupTimeout: 10 * time.Second,
	})
	if err != nil {
		return err
	}
	dbos.RegisterWorkflow(dctx, s.invoke, dbos.WithWorkflowName(WorkflowName))
	if _, err := dbos.RegisterQueue(dctx, QueueName, dbos.WithWorkerConcurrency(s.cfg.Workers)); err != nil {
		_ = dbos.Shutdown(dctx, 5*time.Second) // NewContext opened a pool: a failed session must not leak it
		return err
	}
	if err := dbos.Launch(dctx); err != nil {
		_ = dbos.Shutdown(dctx, 5*time.Second)
		return err
	}
	s.live.Store(&session{ctx: dctx})
	s.record("up")
	s.log.Info("run store", "url", Redact(s.cfg.URL), "executor", s.cfg.Executor, "workers", s.cfg.Workers, "migrate", s.cfg.Migrate, "run_limit", s.cfg.RunLimit)
	return nil
}

// retry reconnects in the background, doubling the interval up to RetryMax,
// until the store is back or Close. One retrier at a time.
func (s *Store) retry() {
	if !s.retrying.CompareAndSwap(false, true) {
		return
	}
	s.wg.Add(1)
	go func() {
		defer s.wg.Done()
		defer s.retrying.Store(false)
		interval := s.cfg.Retry
		for {
			select {
			case <-s.closed:
				return
			case <-time.After(interval):
			}
			if err := s.connect(context.Background()); err == nil {
				s.log.Info("run store back", "url", Redact(s.cfg.URL))
				return
			} else {
				s.log.Warn("run store still unreachable", "url", Redact(s.cfg.URL), "error", err, "retry", min(interval*2, RetryMax))
			}
			interval = min(interval*2, RetryMax)
		}
	}()
}

// session is the live session, or the UNAVAILABLE the caller gets without one.
func (s *Store) session() (*session, error) {
	if sess := s.live.Load(); sess != nil {
		return sess, nil
	}
	return nil, serve.Unavailable("the run store is unreachable (--run-store %s); sync tools are unaffected", Redact(s.cfg.URL))
}

// lost marks a session down after an error that says the database went away,
// and starts the retry. Only a connection failure degrades: a tool's refusal
// and the port's own errors are answers.
func (s *Store) lost(sess *session, err error) {
	if !IsConnectionError(err) || !s.live.CompareAndSwap(sess, nil) {
		return
	}
	s.log.Warn("run store lost; serving sync only until it returns", "url", Redact(s.cfg.URL), "error", err)
	s.record("down")
	go func() { _ = dbos.Shutdown(sess.ctx, 5*time.Second) }()
	s.retry()
}

func (s *Store) record(state string) {
	observe.Instruments().RunStore.Add(context.Background(), 1, metric.WithAttributes(observe.KeyState.String(state)))
}

// IsConnectionError says whether err is the database being unreachable, as
// opposed to an answer: a dial failure, a closed pool, a lost connection.
func IsConnectionError(err error) bool {
	if err == nil {
		return false
	}
	var se *serve.Error
	if errors.As(err, &se) && se.Cause == nil {
		return false
	}
	var op *net.OpError
	if errors.As(err, &op) {
		return true
	}
	msg := strings.ToLower(err.Error())
	for _, sign := range []string{"connection refused", "failed to connect", "connection reset", "broken pipe",
		"database is closed", "closed pool", "unexpected eof", "no such host", "not a directory", "unable to open database"} {
		if strings.Contains(msg, sign) {
			return true
		}
	}
	return false
}

// Close stops the retry and shuts the live session down, waiting briefly for
// in-flight steps. An in-flight run stays PENDING on this executor's name --
// the SDK treats a shutdown as "not a cancellation request" -- and a relaunch
// with the same id recovers it.
func (s *Store) Close(ctx context.Context) error {
	select {
	case <-s.closed:
	default:
		close(s.closed)
	}
	s.wg.Wait()
	if sess := s.live.Swap(nil); sess != nil {
		return dbos.Shutdown(sess.ctx, 5*time.Second)
	}
	return nil
}

// FileURL is a SQLite store at path, for a laptop and the estate. Not
// "sqlite::memory:": DBOS pools connections, and with the pure-Go driver each
// connection to ":memory:" is its own empty database, while a shared-cache
// memory database locks table-wide under the pool. A file is one database.
func FileURL(path string) string { return "sqlite:" + path }

// Redact returns the URL with any password replaced, for logs.
func Redact(raw string) string {
	u, err := url.Parse(raw)
	if err != nil || u.User == nil {
		return raw
	}
	if _, has := u.User.Password(); has {
		u.User = url.UserPassword(u.User.Username(), "redacted")
	}
	return u.String()
}

// Start makes the run durable. A known key is answered from the record when the
// fingerprint matches, refused when it does not -- before DBOS's own "new input
// is ignored" can bite (spec §6).
func (s *Store) Start(ctx context.Context, r run.Run) (run.Started, error) {
	if r.ID == "" {
		return run.Started{}, serve.Invalid("a run needs an idempotency key: it is the run id")
	}
	sess, err := s.session()
	if err != nil {
		return run.Started{}, err
	}
	if _, err := dbos.RetrieveWorkflow[outcome](sess.ctx, r.ID); err == nil {
		if _, err := s.fingerprintMatches(sess, r); err != nil {
			return run.Started{}, err
		}
		return run.Started{ID: r.ID, Existing: true}, nil
	} else if !errors.Is(err, dbos.ErrNonExistentWorkflow) {
		return run.Started{}, s.storeErr(sess, err)
	}
	attrs := map[string]any{
		"tool": r.Tool, "caller": r.Caller, "caller_name": r.CallerName, "fingerprint": r.Fingerprint,
		"correlation": r.Correlation,
	}
	for k, v := range r.Attributes {
		attrs[k] = v
	}
	enqueue := []dbos.EnqueueOption{
		dbos.WithEnqueueWorkflowID(r.ID),
		dbos.WithEnqueueAttributes(attrs),
		dbos.WithEnqueueAuthenticatedUser(r.Caller),
	}
	if s.cfg.RunLimit > 0 {
		// DBOS's durable deadline: computed at dequeue, survives a restart, and
		// cancels the run -- the step's ctx ends and the row reads CANCELLED.
		enqueue = append(enqueue, dbos.WithEnqueueTimeout(s.cfg.RunLimit))
	}
	_, err = dbos.Enqueue[outcome, run.Run](sess.ctx, QueueName, WorkflowName, r, enqueue...)
	conflict := errors.Is(err, dbos.ErrConflictingWorkflowID)
	if err != nil && !conflict {
		return run.Started{}, s.storeErr(sess, err)
	}
	// Two Starts with one key can both pass the lookup above; whichever won the
	// enqueue owns the key, and DBOS answers the other from its record. So the
	// RECORDED fingerprint decides, for every Start: a different request under
	// an existing key is refused even when it lost the race by a microsecond.
	if _, err := s.fingerprintMatches(sess, r); err != nil {
		return run.Started{}, err
	}
	return run.Started{ID: r.ID, Existing: conflict}, nil
}

// fingerprintMatches reads the run's recorded fingerprint and compares it to
// the request's: true when they agree (the same request), the INVALID refusal
// when they do not. A run that cannot be read is the store's failure.
func (s *Store) fingerprintMatches(sess *session, r run.Run) (bool, error) {
	h, err := dbos.RetrieveWorkflow[outcome](sess.ctx, r.ID)
	if err != nil {
		return false, s.storeErr(sess, err)
	}
	st, err := h.GetStatus()
	if err != nil {
		return false, s.storeErr(sess, err)
	}
	if fp, _ := st.Attributes["fingerprint"].(string); fp != r.Fingerprint {
		return false, serve.Invalid("the idempotency key %s was used for a different request", r.ID)
	}
	return true, nil
}

// Fetch answers for a run. With wait > 0 and the run still running, it blocks
// on DBOS's own completion read for up to wait -- one request held, not a
// poller -- and answers with whatever state the run is in then.
func (s *Store) Fetch(ctx context.Context, id string, wait time.Duration) (run.State, error) {
	sess, err := s.session()
	if err != nil {
		return run.State{}, err
	}
	// The handle lives on a child of the session that ENDS WITH THIS FETCH, so
	// the completion wait below cannot outlive an early return on a stage change.
	wctx, cancel := dbos.WithCancel(sess.ctx)
	defer cancel()
	h, err := dbos.RetrieveWorkflow[outcome](wctx, id)
	if errors.Is(err, dbos.ErrNonExistentWorkflow) {
		return run.State{}, run.ErrNotFound
	}
	if err != nil {
		return run.State{}, s.storeErr(sess, err)
	}
	first, err := s.state(sess, h)
	if err != nil || wait <= 0 || first.Status != run.StatusRunning {
		return first, err
	}
	// Completion is DBOS's blocking read. A STAGE change has no blocking
	// primitive in the SDK (GetEvent returns at once when the key exists), so it
	// is a cheap poll inside rund -- the caller's contract is unchanged: one
	// request, held. Whichever comes first, within wait.
	done := make(chan struct{})
	go func() {
		defer close(done)
		if _, err := h.GetResult(dbos.WithHandleTimeout(wait)); err != nil && !errors.Is(err, dbos.ErrTimeout) && ctx.Err() == nil {
			// A completed-with-error run is a state, not a Fetch failure; only
			// an infrastructure error is. The re-read tells them apart.
			s.log.Debug("waiting on a run", "run", id, "error", err)
		}
	}()
	deadline := time.Now().Add(wait)
	tick := time.NewTicker(StagePoll)
	defer tick.Stop()
	for {
		select {
		case <-done:
			return s.state(sess, h)
		case <-ctx.Done():
			return first, nil
		case <-tick.C:
			cur, err := s.state(sess, h)
			if err != nil {
				return run.State{}, err
			}
			if cur.Stage != first.Stage || cur.Status != run.StatusRunning || time.Now().After(deadline) {
				return cur, nil
			}
		}
	}
}

// StagePoll is how often a held Fetch re-reads the stage.
const StagePoll = 200 * time.Millisecond

// state is one reading of a run.
func (s *Store) state(sess *session, h dbos.WorkflowHandle[outcome]) (run.State, error) {
	st, err := h.GetStatus()
	if err != nil {
		return run.State{}, s.storeErr(sess, err)
	}
	out := run.State{ID: st.ID, Caller: st.AuthenticatedUser, CreatedAt: st.CreatedAt, CompletedAt: st.CompletedAt}
	out.Tool, _ = st.Attributes["tool"].(string)
	out.Stage = s.stage(sess, st)
	switch st.Status {
	case dbos.WorkflowStatusSuccess:
		// SUCCESS means the run REACHED AN ANSWER -- the tool's result or the
		// tool's own refusal, both values of the outcome. Completed, so this
		// returns at once.
		res, err := h.GetResult(dbos.WithHandleTimeout(5 * time.Second))
		if err != nil {
			return run.State{}, s.storeErr(sess, err)
		}
		if res.Error != nil {
			out.Status, out.Error = run.StatusFailed, res.Error
		} else {
			out.Status, out.Result = run.StatusSucceeded, res.Result
		}
	case dbos.WorkflowStatusError, dbos.WorkflowStatusMaxRecoveryAttemptsExceeded:
		// The run could NOT be executed: a panic, or DBOS itself. INTERNAL,
		// with the id; the cause is in rund's log.
		out.Status = run.StatusFailed
		out.Error = serve.Wire(serve.Internal(st.Error), st.ID)
	case dbos.WorkflowStatusCancelled:
		out.Status = run.StatusCancelled
	default:
		out.Status = run.StatusRunning
	}
	return out, nil
}

// stage is the run's latest word about itself: the stage event, or "queued"
// for a run no workflow has started yet -- there is nobody to set an event
// for it, so the queue's own status says it.
func (s *Store) stage(sess *session, st dbos.WorkflowStatus) string {
	v, err := dbos.GetEvent[string](sess.ctx, st.ID, StageKey, 0)
	if err == nil && v != "" {
		return v
	}
	switch st.Status {
	case dbos.WorkflowStatusEnqueued, dbos.WorkflowStatusDelayed, dbos.WorkflowStatusPending:
		return "queued"
	}
	return ""
}

// Step is one recorded step of a run, in our vocabulary: GetWorkflowSteps
// without the SDK type. The audit, and what a detail Fetch will show.
type Step struct {
	Name   string
	Output []byte // the checkpoint, as JSON
	Error  string
}

// Steps reads a run's step log.
func (s *Store) Steps(ctx context.Context, id string) ([]Step, error) {
	sess, err := s.session()
	if err != nil {
		return nil, err
	}
	infos, err := dbos.GetWorkflowSteps(sess.ctx, id, dbos.WithStepsLoadOutput(true))
	if err != nil {
		return nil, s.storeErr(sess, err)
	}
	out := make([]Step, 0, len(infos))
	for _, i := range infos {
		if strings.HasPrefix(i.StepName, "DBOS.") {
			// DBOS's own bookkeeping (a SetEvent is a step): not the run's audit.
			continue
		}
		st := Step{Name: i.StepName}
		switch o := i.Output.(type) {
		case nil:
		case string:
			st.Output = []byte(o) // the checkpoint as DBOS serialised it: JSON
		default:
			st.Output, _ = marshalJSON(o)
		}
		if i.Error != nil {
			st.Error = i.Error.Error()
		}
		out = append(out, st)
	}
	return out, nil
}

// storeErr: DBOS's own errors reach the caller as UNAVAILABLE naming the store;
// the cause stays in the log. A connection failure also degrades the store.
func (s *Store) storeErr(sess *session, err error) error {
	s.lost(sess, err)
	return serve.Unavailable("the run store did not answer (--run-store %s)", Redact(s.cfg.URL)).Because(err)
}

// wireOf turns a tool's error into what the wire carries, with the run id.
func wireOf(err error, id string) *invokev1.Error { return serve.Wire(err, id) }

// Events is the run's record after a cursor. The record arrives with the next
// step of the push plan; until then the store has none to read.
func (s *Store) Events(ctx context.Context, id string, after uint64, wait time.Duration) ([]*runv1.Event, bool, error) {
	return nil, false, errors.New("rundbos: the event record is not recorded yet")
}
