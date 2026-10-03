// Package serve is the one interface generated code is written against.
//
// Nothing here imports NATS, and that is the point. A tool author's repository
// compiles against this package and a generated `Serve<Service>` function; the
// transport arrives at run time as whatever the process hands in. Three things
// follow from that, each of which was a real cost in the estate this replaces:
//
//   - A tool module does not inherit a broker's dependency tree. The previous
//     estate had an S3 client and a CLI framework reaching a ledger drainer that
//     ran neither, because the shared package everything imported carried them.
//   - The generator is testable without a server. A fake Registrar in a unit test
//     proves what the generated code registers, with no connection and no port.
//   - The transport can be replaced without regenerating a single tool. The
//     generated text names no subject and no broker.
package serve

import (
	"context"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protoreflect"
)

// Registrar is what a transport offers to generated code: a way to say "this
// tool is answered here".
//
// The four arguments are the four facts that cannot be derived from each other.
// Everything else a transport wants -- a subject, a queue group, a service
// version -- it derives or holds itself, and deliberately does NOT receive here.
//
// The previous estate passed a six-field struct of which four fields were
// derived from the other two, and every one of those four was a place for the
// generator and the runtime to compute the same thing differently.
type Registrar interface {
	// Endpoint mounts one tool.
	//
	// name is the tool's IDENTITY -- the declared name, the string an agent's
	// allowlist cites and a policy keys on. It is what a caller asks for.
	//
	// method is the ADDRESS the declaration lives at. It is for diagnostics and
	// for a transport that wants to derive a subject from the proto name. It is
	// never an identity, and a Registrar that keys its mount table on it has
	// reintroduced the bug the two types exist to prevent.
	//
	// newRequest constructs an empty request message to unmarshal into. The
	// generated closure, not this interface, owns knowing the concrete type.
	//
	// handle dispatches to the author's method. It receives the unmarshalled
	// request and returns the response to marshal. A nil response with a nil
	// error is an error, and the generated closure is what says so -- a
	// transport marshalling a nil message produces an empty one, which reaches
	// a caller as a successful answer to a call nobody answered.
	Endpoint(
		name string,
		method protoreflect.FullName,
		newRequest func() proto.Message,
		handle func(context.Context, proto.Message) (proto.Message, error),
	) error
}
