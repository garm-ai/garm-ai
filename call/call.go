// Package call is the one interface generated CLIENT code is written against.
//
// The mirror of `serve`: nothing here imports NATS, so a caller's module does not
// inherit a broker's dependency tree and the transport can be replaced without
// regenerating a single client.
package call

import (
	"context"
	"errors"
	"iter"
	"time"

	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
)

// Overhead is added to a tool's declared budget when a generated client sets its
// deadline.
//
// Without it the three deadlines -- the client's, rund's request to the tool, and
// the tool's own handler -- all expire at the same instant, so a tool that uses its
// whole budget races rund's reply. The caller then sees a bare transport timeout
// instead of the UNAVAILABLE that rund was in the middle of sending, which is the
// difference between "the tool was slow" and "something went wrong, unclear what".
//
// A fixed amount rather than a fraction: what it pays for is HOPS -- rund receiving,
// resolving, dispatching and replying -- and those do not get slower because a tool
// declared a longer budget.
const Overhead = time.Second

// Invoker is what a transport offers to generated client code.
//
// Deliberately NOT symmetric with serve.Registrar's argument list: a server mounts
// many tools once, a client calls one tool many times. What they share is that
// neither names a broker.
//
// Only sync tools got a method before the run store; an async tool now gets two
// -- one that starts and returns a reference, one that reads the reference --
// and the generated signatures are what makes flipping a tool's delivery a
// compile error for every caller.
type Invoker interface {
	// Invoke calls one tool by NAME and returns rund's answer: the result for a
	// sync tool, or pending with the run id for an async one.
	//
	// The deadline comes from ctx, which a generated client sets from the tool's
	// declared budget -- so no caller has to invent a number. An error carries the
	// tool's own kind: see serve.Error.
	Invoke(ctx context.Context, tool string, input []byte, o Options) (*runv1.InvokeResponse, error)

	// Fetch asks what happened to a run. wait > 0 asks rund to hold the request
	// until the run changes or wait elapses (rund caps it at MaxWait); the
	// transport sets the request's deadline from it. Only the invoking account
	// sees its runs: another's is NOT_FOUND.
	Fetch(ctx context.Context, runID string, wait time.Duration) (*runv1.FetchResponse, error)
}

// MaxWait is the most a single Fetch asks rund to hold: rund's own cap, mirrored
// here because this package imports no engine (run.MaxFetchWait; a test pins
// the two equal).
const MaxWait = 30 * time.Second

// Ref is an async run a caller started: the id, and the transport to read it
// through. What a generated async method returns.
type Ref struct {
	RunID   string
	Invoker Invoker
}

// Fetch asks once, holding for up to wait. The deadline is wait plus the hops,
// unless the caller's ctx is shorter.
func (r Ref) Fetch(ctx context.Context, wait time.Duration) (*runv1.FetchResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, Deadline(wait))
	defer cancel()
	return r.Invoker.Fetch(ctx, r.RunID, wait)
}

// Await fetches, MaxWait at a time, until the run is terminal or ctx is done.
// One request in flight at a time, never a tight loop: each waits on rund.
func (r Ref) Await(ctx context.Context) (*runv1.FetchResponse, error) {
	for {
		if err := ctx.Err(); err != nil {
			return nil, err
		}
		resp, err := r.Fetch(ctx, MaxWait)
		if err != nil {
			return nil, err
		}
		switch resp.GetState() {
		case runv1.RunState_RUN_STATE_RUNNING, runv1.RunState_RUN_STATE_UNSPECIFIED:
			continue
		}
		return resp, nil
	}
}

// Options are the parts of the envelope a caller may legitimately set.
//
// A struct rather than variadic functional options, because the list is short,
// closed, and a caller should see at a glance what it is allowed to influence. The
// ids a caller does NOT set -- the message id, and the causation of a nested call --
// belong to the runtime.
type Options struct {
	// Idempotency becomes the run id, so a retry is the same run rather than a
	// second one. A caller that wants idempotency must supply this: a key the
	// platform invents deduplicates nothing.
	//
	// A MODEL NEVER SETS THIS. A model's output reaches only the request message;
	// this is envelope, and the runtime making the call fills it in.
	Idempotency string

	// Correlation ties this call to a caller's wider flow. Minted if empty.
	Correlation string

	// Traceparent is W3C trace context, carried verbatim and never interpreted.
	// For a process that never installed a tracer: once one is installed, the
	// span on ctx is injected on the wire and takes precedence over this.
	Traceparent string
}

// Deadline is the budget a generated client applies, including the hops.
func Deadline(budget time.Duration) time.Duration { return budget + Overhead }

// Follower is what a transport offers beyond Invoke and Fetch when it can carry
// a run's event feed (push spec §4): the record after a cursor, and the live
// copy. natscall.Client is one.
type Follower interface {
	// Events is the run's record with Seq > after, at most 256; wait holds the
	// request on rund when nothing is past the cursor yet (rund caps it).
	Events(ctx context.Context, runID string, after uint64, wait time.Duration) (*runv1.EventsResponse, error)
	// Subscribe delivers the run's live events until stop is called. The
	// transport decides the subject; what arrives is what the bus delivers to
	// this caller's account, and only that.
	Subscribe(ctx context.Context, runID string) (events <-chan *runv1.Event, stop func(), err error)
}

// ErrCannotFollow: the Ref's Invoker is not a Follower.
var ErrCannotFollow = errors.New("call: this transport cannot Follow a run (it is not a call.Follower)")

// Follow yields the run's events from after onward, exactly once each, in
// order, until done -- stitching the record to the live feed so no caller
// writes that twice:
//
//  1. subscribe to the live feed FIRST, so nothing published during the
//     catch-up is missed: it is either in the batch or in the subscription;
//  2. catch up from the cursor through Events, paging while a batch is full;
//  3. switch to the live feed, dropping any event at or below the last yielded;
//  4. on the live side going away, go to 2 with the last sequence as the cursor;
//  5. return after done, or when ctx ends.
//
// A caller that wants history only calls Events itself; the bus is not touched.
func (r Ref) Follow(ctx context.Context, after uint64) iter.Seq2[*runv1.Event, error] {
	return func(yield func(*runv1.Event, error) bool) {
		f, ok := r.Invoker.(Follower)
		if !ok {
			yield(nil, ErrCannotFollow)
			return
		}
		live, stop, err := f.Subscribe(ctx, r.RunID)
		if err != nil {
			yield(nil, err)
			return
		}
		defer stop()
		last := after
		for {
			// catch up from the record
			for {
				if err := ctx.Err(); err != nil {
					yield(nil, err)
					return
				}
				resp, err := f.Events(ctx, r.RunID, last, 0)
				if err != nil {
					yield(nil, err)
					return
				}
				for _, ev := range resp.GetEvents() {
					if ev.GetSeq() <= last {
						continue
					}
					last = ev.GetSeq()
					if !yield(ev, nil) {
						return
					}
					if ev.GetDone() != nil {
						return
					}
				}
				if resp.GetClosed() {
					return
				}
				if len(resp.GetEvents()) < 256 {
					break
				}
			}
			// then live, until it ends; then back to the record from last
			liveEnded := false
			for !liveEnded {
				select {
				case <-ctx.Done():
					yield(nil, ctx.Err())
					return
				case ev, open := <-live:
					if !open {
						liveEnded = true
						break
					}
					if ev.GetSeq() <= last {
						continue
					}
					last = ev.GetSeq()
					if !yield(ev, nil) {
						return
					}
					if ev.GetDone() != nil {
						return
					}
				}
			}
			// the live side went away: resume from the record; it will say closed
			// if the run is over, and the loop will subscribe again otherwise
			live, stop2, err := f.Subscribe(ctx, r.RunID)
			if err != nil {
				yield(nil, err)
				return
			}
			stop()
			stop = stop2
			_ = live
		}
	}
}
