package run

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
)

// Store is the engine's view of durability (run-store spec §1). One
// implementation is DBOS (package rundbos); nil is none -- sync only, today's
// rund. The engine never imports an implementation, and a sync call never
// touches a store at all.
type Store interface {
	// Start makes the run durable and returns once it is. r.ID is the caller's
	// idempotency key; a second Start with the same key and the same fingerprint
	// returns the same run (Existing) and starts nothing; the same key with a
	// different fingerprint is refused.
	Start(ctx context.Context, r Run) (Started, error)
	// Fetch answers for a run. wait > 0 blocks until the state or the stage
	// changes or wait elapses; the engine clamps wait to MaxFetchWait first.
	// ErrNotFound for an id the store has never seen.
	Fetch(ctx context.Context, id string, wait time.Duration) (State, error)
}

// MaxFetchWait caps a Fetch's wait: a request must never outlive the bus's own
// timeouts, and a thousand front doors waiting are goroutines here, not pollers.
const MaxFetchWait = 30 * time.Second

// ErrNotFound: the store has never seen this id. The engine turns it -- and a
// run owned by another account -- into NOT_FOUND, indistinguishably.
var ErrNotFound = errors.New("run: no such run")

// Status is a run's state as the store reports it.
type Status int

const (
	StatusUnknown Status = iota
	// StatusRunning: pending in the queue, or executing. The caller's view is
	// one state; the stage says which.
	StatusRunning
	StatusSucceeded
	StatusFailed
	StatusCancelled
)

// Run is what Start makes durable: the request, and the ENVELOPE the caller
// sent, kept with the run because execution happens later, on another replica,
// when the request is long gone (spec §6.1).
type Run struct {
	ID          string // the idempotency key, required
	Tool        string
	Input       []byte
	Fingerprint string // Fingerprint(Tool, Input)
	Caller      string // the invoking account's public key
	CallerName  string // its label, if known
	Attributes  map[string]string
	Correlation string // the caller's, or the run id if it sent none
	Message     string // the caller's message id: the causation of step 0
	Traceparent string // continued by the step that executes
}

// Started is Start's answer.
type Started struct {
	ID       string
	Existing bool
}

// State is Fetch's answer.
type State struct {
	ID          string
	Tool        string
	Status      Status
	Stage       string
	Result      []byte
	Error       *invokev1.Error
	Caller      string
	CreatedAt   time.Time
	CompletedAt time.Time
}

// Fingerprint binds a key to the request it was used for: sha256 over the tool
// name, a NUL, and the input bytes -- the separator so "ab"+"c" and "a"+"bc" are
// not the same request.
func Fingerprint(tool string, input []byte) string {
	h := sha256.New()
	h.Write([]byte(tool))
	h.Write([]byte{0})
	h.Write(input)
	return hex.EncodeToString(h.Sum(nil))
}

// StepHeaders is the envelope a run's step i carries, DETERMINISTICALLY: a
// replayed step re-sends the same message id, so the trail shows one cause and
// the tool's idempotency check collapses the duplicate (spec §6.1). Step 0 is
// caused by the caller's message; step i by step i-1's.
func StepHeaders(r Run, i int) Headers {
	id := func(i int) string {
		sum := sha256.Sum256([]byte(fmt.Sprintf("%s:%d", r.ID, i)))
		return hex.EncodeToString(sum[:8])
	}
	causation := r.Message
	if i > 0 {
		causation = id(i - 1)
	}
	return Headers{
		Correlation: r.Correlation,
		Causation:   causation,
		Message:     id(i),
		Traceparent: r.Traceparent,
		Idempotency: fmt.Sprintf("%s:%d", r.ID, i),
	}
}
