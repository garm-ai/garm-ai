package serve

import (
	"errors"
	"fmt"
	"strings"

	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
)

// Error is how a tool says why it could not answer.
//
// Three fields, and the third one never leaves the process.
//
//	return nil, serve.NotFound("no customer %q", id)
//	return nil, serve.Invalid("start date is not a date").Because(parseErr)
//	return nil, serve.Internal(err)
//
// A POINTER with a pointer receiver, because it implements Unwrap and so takes
// part in a chain: `var e *serve.Error; errors.As(err, &e)` finds one whether it
// was returned bare or wrapped with %w. The estate this replaces used a value type
// with a value receiver to get the same reach, which was a workaround for having
// no Unwrap at all.
type Error struct {
	// Kind is what a caller acts on. The zero value is UNSPECIFIED, which Wire
	// treats as INTERNAL -- see Wire for why that also suppresses Message.
	Kind invokev1.ErrorKind

	// Message is published to the caller VERBATIM, so it must contain nothing the
	// caller is not entitled to see. This side of the hop does no redaction.
	Message string

	// Cause NEVER crosses the wire. It is logged by the answering service and
	// correlated by the id the transport generates.
	//
	// That is not caution, it is where the unsafe things actually are: a wrapped
	// pgx error carries the connection target, a constraint violation carries the
	// value that violated it, and a file error carries a path.
	Cause error
}

func (e *Error) Error() string {
	if e.Cause == nil {
		return e.Message
	}
	// The cause appears in THIS string, which is what a service logs. Wire never
	// calls it.
	return e.Message + ": " + e.Cause.Error()
}

// Unwrap exposes the cause to errors.Is and errors.As, so a handler's own code can
// inspect what went wrong without the wire seeing it.
func (e *Error) Unwrap() error { return e.Cause }

// Because attaches a local cause, for the log and for errors.Is.
//
// Fluent rather than a parameter on every constructor, so that the common case
// reads as one call and attaching a cause is visibly a second decision.
func (e *Error) Because(cause error) *Error {
	e.Cause = cause
	return e
}

// The four kinds a tool author chooses deliberately, each taking the words the
// caller will see.

// Invalid: the arguments will never be acceptable.
func Invalid(format string, a ...any) *Error {
	return &Error{Kind: invokev1.ErrorKind_ERROR_KIND_INVALID, Message: fmt.Sprintf(format, a...)}
}

// NotFound: the thing asked about does not exist.
func NotFound(format string, a ...any) *Error {
	return &Error{Kind: invokev1.ErrorKind_ERROR_KIND_NOT_FOUND, Message: fmt.Sprintf(format, a...)}
}

// Denied: the caller is not permitted, by this tool's own rules.
func Denied(format string, a ...any) *Error {
	return &Error{Kind: invokev1.ErrorKind_ERROR_KIND_DENIED, Message: fmt.Sprintf(format, a...)}
}

// Unavailable: transient. The one kind worth retrying.
func Unavailable(format string, a ...any) *Error {
	return &Error{Kind: invokev1.ErrorKind_ERROR_KIND_UNAVAILABLE, Message: fmt.Sprintf(format, a...)}
}

// Internal: the tool broke.
//
// It takes a CAUSE AND NO MESSAGE, and that asymmetry is the point. An internal
// error's text is the one most likely to carry something a caller must not see, so
// there is no parameter through which a well-meaning author can publish it. The
// cause is logged; the caller gets internalMessage and the id.
func Internal(cause error) *Error {
	return &Error{Kind: invokev1.ErrorKind_ERROR_KIND_INTERNAL, Cause: cause}
}

// internalMessage is what a caller is told when the answer is "the tool broke".
//
// Fixed text. It says to quote the id, because that is the only action available to
// somebody holding it.
const internalMessage = "internal error — quote the id when reporting this"

// Code is what a generic NATS client reads in a transport's error header.
//
// DERIVED from the generated enum rather than a map, so a kind added to
// garm/invoke/v1 cannot be forgotten. A hand-written table would compile
// perfectly while answering a new kind as the empty string -- which NATS micro
// turns into no reply at all.
func Code(kind invokev1.ErrorKind) string {
	return strings.TrimPrefix(kind.String(), "ERROR_KIND_")
}

// KindOf is Code's inverse, for a caller reading an error off the wire.
//
// It lives BESIDE Code, and a test asserts they round-trip over every kind the
// enum declares. Two inverse functions in two packages is how a mapping drifts:
// one side learns a new kind and the other answers UNSPECIFIED, which Wire then
// turns into INTERNAL -- a transient tool outage reported as a broken tool.
func KindOf(code string) invokev1.ErrorKind {
	if v, ok := invokev1.ErrorKind_value["ERROR_KIND_"+code]; ok {
		return invokev1.ErrorKind(v)
	}
	return invokev1.ErrorKind_ERROR_KIND_UNSPECIFIED
}

// Wire is the ONLY path from a handler's error to what a caller sees.
//
// Total: a non-nil error always produces a non-nil Error with a kind that is never
// UNSPECIFIED. That is not tidiness. NATS micro's request.Error returns an error and
// NEVER REPLIES when given an empty code or description, so a mapping that could
// produce either would not send a bad reply, it would send NO reply -- leaving the
// caller to hang until its own deadline.
//
// # Safe by default, unsafe only on purpose
//
// Any error that is not an *Error -- including the ordinary
// fmt.Errorf("query customers: %w", err) a handler writes without thinking about
// this file -- becomes INTERNAL with the fixed message. Its own words go nowhere
// near the wire.
//
// So does an *Error whose Kind was never set, which is the struct-literal path. The
// rule is one sentence: ONLY AN EXPLICIT KIND PUBLISHES A MESSAGE. A tool author
// cannot leak by being lazy, only by being deliberate -- which inverts the default
// in the estate this replaces, where a bare error reached the caller as "500" plus
// that error's own text.
//
// The caller is also never given the cause, whatever the kind. Wire does not read
// it, and there is no field on invokev1.Error to put it in.
func Wire(err error, id string) *invokev1.Error {
	if err == nil {
		return nil
	}
	internal := &invokev1.Error{
		Kind:    invokev1.ErrorKind_ERROR_KIND_INTERNAL,
		Message: internalMessage,
		Id:      id,
	}
	var e *Error
	if !errors.As(err, &e) {
		return internal
	}
	switch e.Kind {
	case invokev1.ErrorKind_ERROR_KIND_UNSPECIFIED:
		// The struct-literal path: a kind nobody set means a message nobody
		// decided to publish.
		return internal
	case invokev1.ErrorKind_ERROR_KIND_INTERNAL:
		// INTERNAL NEVER publishes an author message, even one set deliberately.
		// Internal() takes no message parameter precisely because an internal
		// error's text is the most likely to carry something a caller must not
		// see -- and a struct literal setting Kind and Message would walk straight
		// round that if this case read e.Message.
		return internal
	}
	message := e.Message
	if message == "" {
		// micro refuses an empty description exactly as it refuses an empty code,
		// so this would be no reply rather than a terse one.
		message = e.Kind.String()
	}
	return &invokev1.Error{Kind: e.Kind, Message: message, Id: id}
}
