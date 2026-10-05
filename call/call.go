// Package call is the one interface generated CLIENT code is written against.
//
// The mirror of `serve`: nothing here imports NATS, so a caller's module does not
// inherit a broker's dependency tree and the transport can be replaced without
// regenerating a single client.
package call

import (
	"context"
	"time"
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
type Invoker interface {
	// Invoke calls one tool by NAME and returns its response bytes.
	//
	// The deadline comes from ctx, which a generated client sets from the tool's
	// declared budget -- so no caller has to invent a number. An error carries the
	// tool's own kind: see serve.Error.
	Invoke(ctx context.Context, tool string, input []byte, o Options) ([]byte, error)
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
