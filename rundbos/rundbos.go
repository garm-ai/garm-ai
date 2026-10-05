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
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/dbos-inc/dbos-transact-golang/dbos"
	_ "github.com/dbos-inc/dbos-transact-golang/dbos/driver/sqlite" // sqlite: URLs, pure Go: the estate needs no Postgres

	"github.com/garm-ai/garm-ai/catalogue"
	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
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
}

// Store implements run.Store on DBOS.
type Store struct {
	cfg   Config
	cat   *catalogue.Holder
	tools run.Caller
	log   *slog.Logger
	ctx   dbos.Context
}

var _ run.Store = (*Store)(nil)

// Open connects, registers the workflow and the queue, and launches -- which
// recovers this executor's PENDING runs. An unreachable store is an error here.
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
	if !strings.HasPrefix(cfg.URL, "postgres://") && !strings.HasPrefix(cfg.URL, "postgresql://") && !strings.HasPrefix(cfg.URL, "sqlite:") {
		return nil, fmt.Errorf("rundbos: --run-store must be postgres://… or sqlite:…, not %q", Redact(cfg.URL))
	}
	s := &Store{cfg: cfg, cat: cat, tools: tools, log: cfg.Logger}
	dctx, err := dbos.NewContext(ctx, dbos.Config{
		AppName:        cfg.AppName,
		DatabaseURL:    cfg.URL,
		ExecutorID:     cfg.Executor,
		Logger:         cfg.Logger,
		SkipMigrations: !cfg.Migrate,
	})
	if err != nil {
		return nil, fmt.Errorf("rundbos: %w", err)
	}
	dbos.RegisterWorkflow(dctx, s.invoke, dbos.WithWorkflowName(WorkflowName))
	if _, err := dbos.RegisterQueue(dctx, QueueName, dbos.WithWorkerConcurrency(cfg.Workers)); err != nil {
		return nil, fmt.Errorf("rundbos: %w", err)
	}
	if err := dbos.Launch(dctx); err != nil {
		return nil, fmt.Errorf("rundbos: launch: %w", err)
	}
	s.ctx = dctx
	s.log.Info("run store", "url", Redact(cfg.URL), "executor", cfg.Executor, "workers", cfg.Workers, "migrate", cfg.Migrate)
	return s, nil
}

// Close shuts the DBOS runtime down, waiting briefly for in-flight steps.
func (s *Store) Close(ctx context.Context) error {
	return dbos.Shutdown(s.ctx, 5*time.Second)
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
	if h, err := dbos.RetrieveWorkflow[outcome](s.ctx, r.ID); err == nil {
		st, err := h.GetStatus()
		if err != nil {
			return run.Started{}, storeErr(err)
		}
		if fp, _ := st.Attributes["fingerprint"].(string); fp != r.Fingerprint {
			return run.Started{}, serve.Invalid("the idempotency key %s was used for a different request", r.ID)
		}
		return run.Started{ID: r.ID, Existing: true}, nil
	} else if !errors.Is(err, dbos.ErrNonExistentWorkflow) {
		return run.Started{}, storeErr(err)
	}
	attrs := map[string]any{
		"tool": r.Tool, "caller": r.Caller, "caller_name": r.CallerName, "fingerprint": r.Fingerprint,
		"correlation": r.Correlation,
	}
	for k, v := range r.Attributes {
		attrs[k] = v
	}
	_, err := dbos.Enqueue[outcome, run.Run](s.ctx, QueueName, WorkflowName, r,
		dbos.WithEnqueueWorkflowID(r.ID),
		dbos.WithEnqueueAttributes(attrs),
		dbos.WithEnqueueAuthenticatedUser(r.Caller))
	if err != nil {
		if errors.Is(err, dbos.ErrConflictingWorkflowID) {
			// Raced with another Start of the same key between the lookup and
			// the enqueue: the first one won, and this is the same run.
			return run.Started{ID: r.ID, Existing: true}, nil
		}
		return run.Started{}, storeErr(err)
	}
	return run.Started{ID: r.ID}, nil
}

// Fetch answers for a run. With wait > 0 and the run still running, it blocks
// on DBOS's own completion read for up to wait -- one request held, not a
// poller -- and answers with whatever state the run is in then.
func (s *Store) Fetch(ctx context.Context, id string, wait time.Duration) (run.State, error) {
	h, err := dbos.RetrieveWorkflow[outcome](s.ctx, id)
	if errors.Is(err, dbos.ErrNonExistentWorkflow) {
		return run.State{}, run.ErrNotFound
	}
	if err != nil {
		return run.State{}, storeErr(err)
	}
	first, err := s.state(h)
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
			return s.state(h)
		case <-ctx.Done():
			return first, nil
		case <-tick.C:
			cur, err := s.state(h)
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
func (s *Store) state(h dbos.WorkflowHandle[outcome]) (run.State, error) {
	st, err := h.GetStatus()
	if err != nil {
		return run.State{}, storeErr(err)
	}
	out := run.State{ID: st.ID, Caller: st.AuthenticatedUser, CreatedAt: st.CreatedAt, CompletedAt: st.CompletedAt}
	out.Tool, _ = st.Attributes["tool"].(string)
	out.Stage = s.stage(st)
	switch st.Status {
	case dbos.WorkflowStatusSuccess:
		// SUCCESS means the run REACHED AN ANSWER -- the tool's result or the
		// tool's own refusal, both values of the outcome. Completed, so this
		// returns at once.
		res, err := h.GetResult(dbos.WithHandleTimeout(5 * time.Second))
		if err != nil {
			return run.State{}, storeErr(err)
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
func (s *Store) stage(st dbos.WorkflowStatus) string {
	v, err := dbos.GetEvent[string](s.ctx, st.ID, StageKey, 0)
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
	infos, err := dbos.GetWorkflowSteps(s.ctx, id, dbos.WithStepsLoadOutput(true))
	if err != nil {
		return nil, storeErr(err)
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
// the cause stays in the log.
func storeErr(err error) error {
	return serve.Unavailable("the run store did not answer").Because(err)
}

// wireOf turns a tool's error into what the wire carries, with the run id.
func wireOf(err error, id string) *invokev1.Error { return serve.Wire(err, id) }
