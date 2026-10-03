package serve_test

import (
	"errors"
	"fmt"
	"strings"
	"testing"

	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	"github.com/garm-ai/garm-ai/serve"
)

// secret stands for everything a cause chain actually carries: a connection
// target, a SQL fragment, the value that violated a constraint, a path.
const secret = "dial tcp 10.0.0.4:5432: password=hunter2"

// TestABareErrorNeverReachesTheCaller is the most important test in this package.
//
// The estate this replaces answered a bare error with "500" plus that error's own
// words, so the ordinary fmt.Errorf a handler writes without thinking about any of
// this published its cause. That is the default being inverted here.
func TestABareErrorNeverReachesTheCaller(t *testing.T) {
	err := fmt.Errorf("query customers: %w", errors.New(secret))

	w := serve.Wire(err, "7f3a9c")

	if w.GetKind() != invokev1.ErrorKind_ERROR_KIND_INTERNAL {
		t.Errorf("kind is %v, want INTERNAL", w.GetKind())
	}
	if strings.Contains(w.GetMessage(), secret) || strings.Contains(w.GetMessage(), "query customers") {
		t.Errorf("the wire message carries the cause: %q", w.GetMessage())
	}
	if w.GetId() != "7f3a9c" {
		t.Errorf("id is %q, want 7f3a9c", w.GetId())
	}
	// The whole point of the id: the operator can still get there.
	if !strings.Contains(err.Error(), secret) {
		t.Error("the local error lost the cause, so nothing could be logged")
	}
}

// TestOnlyAnExplicitKindPublishesAMessage closes the struct-literal path. A handler
// that builds an Error by hand and forgets Kind must not publish its Message
// either, or "safe by default" has one hole big enough to walk through.
func TestOnlyAnExplicitKindPublishesAMessage(t *testing.T) {
	w := serve.Wire(&serve.Error{Message: secret}, "id")
	if w.GetKind() != invokev1.ErrorKind_ERROR_KIND_INTERNAL {
		t.Errorf("kind is %v, want INTERNAL for an unset kind", w.GetKind())
	}
	if strings.Contains(w.GetMessage(), secret) {
		t.Errorf("an Error with no Kind published its Message: %q", w.GetMessage())
	}
}

func TestInternalNeverPublishesItsCause(t *testing.T) {
	w := serve.Wire(serve.Internal(errors.New(secret)), "id")
	if strings.Contains(w.GetMessage(), secret) {
		t.Errorf("Internal published its cause: %q", w.GetMessage())
	}
	// Not merely non-empty: the caller must be told the one thing it can act on,
	// which is to quote the id. An earlier revision fell through to the enum's
	// own name here -- "ERROR_KIND_INTERNAL" -- which is safe, non-empty and
	// useless, and no test noticed until the empty-message guard was removed on
	// purpose.
	if !strings.Contains(w.GetMessage(), "id") {
		t.Errorf("the message does not tell the caller to quote the id: %q", w.GetMessage())
	}
}

// TestAnInternalKindNeverPublishesAMessageEvenADeliberateOne closes the last way
// round the rule. Internal() has no message parameter because an internal error's
// text is the most likely to leak -- but a struct literal can set both fields, and
// if Wire read Message for this kind the constructor's protection would be a
// suggestion.
func TestAnInternalKindNeverPublishesAMessageEvenADeliberateOne(t *testing.T) {
	w := serve.Wire(&serve.Error{
		Kind:    invokev1.ErrorKind_ERROR_KIND_INTERNAL,
		Message: secret,
	}, "id")
	if strings.Contains(w.GetMessage(), secret) {
		t.Errorf("an INTERNAL Error published its Message: %q", w.GetMessage())
	}
}

func TestADeliberateKindPublishesItsMessage(t *testing.T) {
	for _, tc := range []struct {
		err  *serve.Error
		kind invokev1.ErrorKind
		msg  string
	}{
		{serve.Invalid("start date %q is not a date", "yesterday"), invokev1.ErrorKind_ERROR_KIND_INVALID, `start date "yesterday" is not a date`},
		{serve.NotFound("no customer %q", "c-1"), invokev1.ErrorKind_ERROR_KIND_NOT_FOUND, `no customer "c-1"`},
		{serve.Denied("this account is frozen"), invokev1.ErrorKind_ERROR_KIND_DENIED, "this account is frozen"},
		{serve.Unavailable("upstream is draining"), invokev1.ErrorKind_ERROR_KIND_UNAVAILABLE, "upstream is draining"},
	} {
		w := serve.Wire(tc.err, "id")
		if w.GetKind() != tc.kind {
			t.Errorf("%v: kind is %v", tc.kind, w.GetKind())
		}
		if w.GetMessage() != tc.msg {
			t.Errorf("%v: message is %q, want %q", tc.kind, w.GetMessage(), tc.msg)
		}
	}
}

// TestADeliberateKindStillHidesItsCause: Because() is for the log, not the wire.
func TestADeliberateKindStillHidesItsCause(t *testing.T) {
	err := serve.NotFound("no customer %q", "c-1").Because(errors.New(secret))

	w := serve.Wire(err, "id")
	if w.GetMessage() != `no customer "c-1"` {
		t.Errorf("message is %q", w.GetMessage())
	}
	if strings.Contains(w.GetMessage(), secret) {
		t.Errorf("Because() leaked to the wire: %q", w.GetMessage())
	}
	// And it is still reachable locally, both as text and through the chain.
	if !strings.Contains(err.Error(), secret) {
		t.Errorf("the cause is not in the local error text: %v", err)
	}
}

// TestTheCauseIsReachableThroughTheChain is why Error is a pointer with Unwrap: a
// handler's own code inspects what went wrong without the wire seeing it.
func TestTheCauseIsReachableThroughTheChain(t *testing.T) {
	sentinel := errors.New("row not found")
	err := serve.NotFound("no customer").Because(sentinel)

	if !errors.Is(err, sentinel) {
		t.Error("errors.Is cannot reach the cause through Unwrap")
	}
}

// TestErrorsAsFindsItBareAndWrapped is the trap the previous estate hit: a code
// that survived only the bare form works for the half of the handlers nobody
// writes, since wrapping is the ordinary way a handler adds context for its logs.
func TestErrorsAsFindsItBareAndWrapped(t *testing.T) {
	bare := serve.Invalid("bad")
	wrapped := fmt.Errorf("handling the request: %w", serve.Invalid("bad"))

	for name, err := range map[string]error{"bare": bare, "wrapped": wrapped} {
		var e *serve.Error
		if !errors.As(err, &e) {
			t.Errorf("%s: errors.As did not find the *serve.Error", name)
			continue
		}
		if serve.Wire(err, "id").GetKind() != invokev1.ErrorKind_ERROR_KIND_INVALID {
			t.Errorf("%s: Wire lost the kind", name)
		}
	}
}

// TestWireNeverProducesSomethingMicroRefuses. NATS micro's request.Error returns an
// error and never calls RespondMsg when the code or description is empty -- so this
// is not a cosmetic property. An empty either way is NO REPLY, and the caller hangs
// until its own deadline.
func TestWireNeverProducesSomethingMicroRefuses(t *testing.T) {
	for name, err := range map[string]error{
		"bare":            errors.New("x"),
		"no kind":         &serve.Error{},
		"no message":      &serve.Error{Kind: invokev1.ErrorKind_ERROR_KIND_INVALID},
		"internal":        serve.Internal(nil),
		"kind no message": serve.Invalid(""),
	} {
		w := serve.Wire(err, "id")
		if w == nil {
			t.Errorf("%s: Wire returned nil for a non-nil error", name)
			continue
		}
		if w.GetKind() == invokev1.ErrorKind_ERROR_KIND_UNSPECIFIED {
			t.Errorf("%s: kind is UNSPECIFIED, which has no wire code", name)
		}
		if w.GetMessage() == "" {
			t.Errorf("%s: message is empty, so micro would send no reply at all", name)
		}
	}
}

func TestWireOfNilIsNil(t *testing.T) {
	if w := serve.Wire(nil, "id"); w != nil {
		t.Errorf("Wire(nil) = %v, want nil", w)
	}
}
