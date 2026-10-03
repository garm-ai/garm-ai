// Package natsserve answers declared tools over NATS, as a micro service.
//
// It is the only package here that imports a broker. Generated code imports
// serve.Registrar and nothing else, so a tool author's module never resolves this
// one, and replacing the transport regenerates nothing.
//
// # A subject is derived from the tool's IDENTITY
//
//	garm.tool.<declared name>     garm.tool.weather.v1.get_forecast
//	                              garm.tool.trip-planner
//
// Not from the proto path. The estate this replaces routed on the ADDRESS --
// contracts/wire.Subject turned /calc.v1.Calculator/Add into calc.v1.Calculator.Add
// -- which throws away the whole point of separating the two: a tool re-homed to a
// different proto package, service or method keeps its subject here, because its
// name never changed. It also deletes a workaround, since that estate derived
// endpoint names from the full subject "because two proto services in one process
// would otherwise both offer an endpoint called Get". Names are unique, so that
// cannot happen.
//
// An agent is a tool, so a decider mounts one through this same interface. Nothing
// here knows which is which, which is what keeps routing-is-registration true.
package natsserve

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/micro"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protoreflect"

	"github.com/garm-ai/garm-ai/natsmicro"
	"github.com/garm-ai/garm-ai/serve"
)

// SubjectPrefix namespaces every tool call.
//
// A constant, not configuration. It keeps our traffic apart from everything else on
// a cluster and makes `garm.tool.>` a usable observation point; two deployments
// sharing one cluster are separated by NATS accounts, which is the mechanism that
// exists for it. A configurable prefix would be a knob nothing enforces.
const SubjectPrefix = "garm.tool."

// Subject is where a tool is answered. Exported because a caller needs the same
// derivation, and a caller computing it differently is the drift this prevents.
func Subject(toolName string) string { return SubjectPrefix + toolName }

// endpointName is what $SRV.INFO shows.
//
// micro's name charset is ^[A-Za-z0-9\-_]+$ -- it excludes the dot -- while a tool
// name is dot-separated segments of exactly that charset. So replacing the dots is
// total: declared.validateName already guarantees every other character is legal.
func endpointName(toolName string) string { return strings.ReplaceAll(toolName, ".", "_") }

// Config is what a deployment knows and generated code does not.
//
// Logger receives the cause chain of every error, keyed by the id the caller is
// given -- the other half of "the cause never crosses the wire", because without
// it the cause is not hidden, it is lost.
type Config = natsmicro.Config

type endpoint struct {
	tool    string
	method  protoreflect.FullName
	budget  time.Duration
	newReq  func() proto.Message
	handle  func(context.Context, proto.Message) (proto.Message, error)
	subject string
}

// Service answers declared tools. It implements serve.Registrar.
//
// The micro lifecycle -- mounting, the flush that makes Start's promise true, and
// the three-step drain -- is natsmicro's. What is here is the TOOL semantics:
// where a tool's subject comes from, how its budget becomes a deadline, and how an
// error reaches a caller.
type Service struct {
	svc *natsmicro.Service
	log *slog.Logger
	// subjects is every mount, so Start can check them against the credential
	// BEFORE announcing -- a refused subscription is otherwise asynchronous and
	// silent (gate.go).
	subjects []string
}

// New validates what micro would otherwise reject at Start.
func New(cfg Config) (*Service, error) {
	svc, err := natsmicro.New(cfg)
	if err != nil {
		return nil, err
	}
	return &Service{svc: svc, log: svc.Log()}, nil
}

// Start mounts every tool and returns once they are answering -- or refuses,
// before mounting anything, if this process's own credential does not cover a
// mount. That refusal names the tool; the alternative is a service that starts
// cleanly and never answers (spec §4.3).
func (s *Service) Start(nc *nats.Conn) error {
	if err := gate(nc, s.subjects); err != nil {
		return err
	}
	return s.svc.Start(nc)
}

// Serve answers until ctx is cancelled, then drains.
func (s *Service) Serve(ctx context.Context) error { return s.svc.Serve(ctx) }

// Run is Start then Serve.
func (s *Service) Run(ctx context.Context, nc *nats.Conn) error { return s.svc.Run(ctx, nc) }

// Endpoint implements serve.Registrar. Generated code calls it once per tool,
// before Start.
func (s *Service) Endpoint(
	name string,
	method protoreflect.FullName,
	budget time.Duration,
	newRequest func() proto.Message,
	handle func(context.Context, proto.Message) (proto.Message, error),
) error {
	if name == "" || newRequest == nil || handle == nil {
		return fmt.Errorf("endpoint %q: a name, a request constructor and a handler are all required", name)
	}
	e := endpoint{
		tool: name, method: method, budget: budget,
		newReq: newRequest, handle: handle, subject: Subject(name),
	}
	if err := s.svc.Mount(endpointName(name), e.subject,
		micro.HandlerFunc(func(r micro.Request) { s.svc.Track(func() { s.answer(e, r) }) })); err != nil {
		return err
	}
	s.subjects = append(s.subjects, e.subject)
	return nil
}

// A call's context is NOT derived from the one that stops the service.
//
// Shutdown cancels that context, and the whole point of Serve's drain is that a call
// already accepted still gets answered -- so handing that call a cancelled context
// tells it to abort at the exact moment we have committed to finishing it. A
// ctx-aware handler would fail one call per deploy, per queued call, while the drain
// politely waited for it to.
//
// context.Background() rather than the process's values, because a call's context
// belongs to the CALL. Per-request values -- a trace id, a deadline -- arrive from
// the request, and that is a later step.
func (s *Service) answer(e endpoint, r micro.Request) {
	ctx := context.Background()
	// The budget the tool's own .proto declared becomes the handler's deadline.
	//
	// Step 8 deliberately imposed none, on the grounds that "a hung tool is the
	// caller's own deadline to enforce, and imposing one here would be a policy
	// with no stated reason". THE DECLARATION IS NOW THAT REASON -- and it is the
	// tool's own, read from the generated binding rather than from a header a
	// caller could assert.
	//
	// Past it the caller has already given up, so the work is unread; for a tool
	// with side effects, worse than wasted.
	if e.budget > 0 {
		var cancel context.CancelFunc
		ctx, cancel = context.WithTimeout(ctx, e.budget)
		defer cancel()
	}
	in := e.newReq()
	if err := proto.Unmarshal(r.Data(), in); err != nil {
		// The caller sent bytes this tool cannot read. That is INVALID and the
		// unmarshal error is a LOCAL detail -- it can quote field numbers and
		// lengths from whatever was actually sent.
		s.fail(e, r, serve.Invalid("the request could not be read as %s", e.method).Because(err))
		return
	}

	out, err := e.handle(ctx, in)
	if err != nil {
		s.fail(e, r, err)
		return
	}

	body, err := proto.Marshal(out)
	if err != nil {
		s.fail(e, r, serve.Internal(fmt.Errorf("marshalling the response: %w", err)))
		return
	}
	if err := r.Respond(body); err != nil {
		// The reply did not go out -- most often because the response exceeds the
		// server's max_payload. Replying with an error is the difference between a
		// caller learning this and a caller hanging to its own deadline, and the
		// error reply is small enough to fit where the response did not.
		s.fail(e, r, serve.Internal(fmt.Errorf("sending the response: %w", err)))
	}
}

// fail is the single exit for every error, so no path can forget to reply.
func (s *Service) fail(e endpoint, r micro.Request, err error) {
	id := correlationID()
	w := serve.Wire(err, id)

	// The other half of "the cause never crosses the wire". err here still carries
	// the full chain; this is the only place it is recorded, and the id is the join.
	s.log.Error("tool call failed",
		"id", id,
		"tool", e.tool,
		"kind", w.GetKind().String(),
		"error", err,
	)

	description := w.GetMessage()
	if id != "" {
		// Appended so a client reading only the micro headers still has the token
		// the fixed INTERNAL message tells it to quote. The typed body carries it
		// as a field; both come from one invokev1.Error.
		description = fmt.Sprintf("%s (id: %s)", description, id)
	}
	body, marshalErr := proto.Marshal(w)
	if marshalErr != nil {
		body = nil
	}
	if replyErr := r.Error(serve.Code(w.GetKind()), description, body); replyErr != nil {
		// Reaching here means the caller gets nothing, so it must be visible.
		s.log.Error("could not reply with the error", "id", id, "tool", e.tool, "error", replyErr)
	}
}

// correlationID is the token a caller quotes and an operator joins on.
func correlationID() string {
	var b [8]byte
	if _, err := rand.Read(b[:]); err != nil {
		// Never observed; crypto/rand does not fail on supported platforms. An
		// empty id would silently remove the join, so say so instead.
		return "no-id-available"
	}
	return hex.EncodeToString(b[:])
}
