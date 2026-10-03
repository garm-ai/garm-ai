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
	"sync"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/micro"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protoreflect"

	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
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

// errorCode is what a generic NATS client reads in Nats-Service-Error-Code.
//
// DERIVED from the generated enum rather than a map, so a kind added to
// garm/invoke/v1 cannot be forgotten here. A hand-written table would compile
// perfectly while answering a new kind as the empty string -- which micro refuses
// by never replying at all.
func errorCode(kind invokev1.ErrorKind) string {
	return strings.TrimPrefix(kind.String(), "ERROR_KIND_")
}

// Config is what a deployment knows and generated code does not.
type Config struct {
	// Name is this deployment's service name, e.g. "weatherd". NATS micro requires
	// ^[A-Za-z0-9\-_]+$.
	Name string

	// Version must be semver: micro validates it and refuses anything else.
	Version string

	// Logger receives the cause chain of every error, keyed by the id the caller
	// is given. This is the other half of "the cause never crosses the wire" --
	// without it the cause is not hidden, it is lost. nil means slog.Default().
	Logger *slog.Logger
}

type endpoint struct {
	tool    string
	method  protoreflect.FullName
	budget  time.Duration
	newReq  func() proto.Message
	handle  func(context.Context, proto.Message) (proto.Message, error)
	subject string
}

// Service collects endpoints, then answers them. It implements serve.Registrar.
type Service struct {
	cfg Config
	log *slog.Logger

	mu    sync.Mutex
	eps   []endpoint
	taken map[string]string // subject -> tool that claimed it
	svc   micro.Service     // nil until Start
	nc    *nats.Conn        // the caller's, held only so Serve can Barrier on it

	inFlight sync.WaitGroup
}

// New validates what micro would otherwise reject at Run, so a misconfigured
// process fails at construction rather than after it has started doing work.
func New(cfg Config) (*Service, error) {
	if !microName.MatchString(cfg.Name) {
		return nil, fmt.Errorf("service name %q: must be one or more of A-Z a-z 0-9 - _", cfg.Name)
	}
	if !semver.MatchString(cfg.Version) {
		return nil, fmt.Errorf("service version %q: must be semver, e.g. 0.1.0", cfg.Version)
	}
	log := cfg.Logger
	if log == nil {
		log = slog.Default()
	}
	return &Service{cfg: cfg, log: log, taken: map[string]string{}}, nil
}

// Endpoint implements serve.Registrar. Generated code calls it once per tool,
// before Run.
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
	subject := Subject(name)
	s.mu.Lock()
	defer s.mu.Unlock()
	// Two tools on one subject means one of them silently never answers, and which
	// one depends on registration order. Refused here rather than discovered in
	// production. declared refuses duplicate NAMES; this catches the same thing
	// arriving from two Serve calls a process made itself.
	if prev, dup := s.taken[subject]; dup {
		return fmt.Errorf("%q and %q both answer on %s", prev, name, subject)
	}
	s.taken[subject] = name
	s.eps = append(s.eps, endpoint{
		tool: name, method: method, budget: budget,
		newReq: newRequest, handle: handle, subject: subject,
	})
	return nil
}

// Start mounts every endpoint and returns once they are ANSWERING.
//
// Separate from Serve because "mounted" and "serving" are different facts and a
// process needs the first one on its own: it should not report itself ready, or
// announce anything, until mounting has actually succeeded.
//
// The Flush at the end is what makes the promise true. A subscription is sent
// asynchronously, so without it this returns while the server has not yet been told
// what we answer -- and a caller gets "no responders available" for a service that
// is, by then, perfectly fine. That is also exactly how the first version of this
// package's own tests became flaky.
//
// The connection belongs to the caller: a process may serve tools, publish and
// subscribe on one connection, and owning it here would make that impossible.
func (s *Service) Start(nc *nats.Conn) error {
	s.mu.Lock()
	if s.svc != nil {
		s.mu.Unlock()
		return fmt.Errorf("%s: already started", s.cfg.Name)
	}
	eps := append([]endpoint(nil), s.eps...)
	s.mu.Unlock()

	if len(eps) == 0 {
		return fmt.Errorf("%s: no endpoints registered, so there is nothing to answer", s.cfg.Name)
	}

	svc, err := micro.AddService(nc, micro.Config{Name: s.cfg.Name, Version: s.cfg.Version})
	if err != nil {
		return fmt.Errorf("adding the micro service %q: %w", s.cfg.Name, err)
	}

	for _, e := range eps {
		ep := e
		// No queue group set, so micro's default applies and every instance
		// answering this subject shares it. That is what request/reply wants --
		// exactly one responder per call, whoever is serving. The old estate used
		// the proto service name, which tied load balancing back to the address.
		if err := svc.AddEndpoint(
			endpointName(ep.tool),
			micro.HandlerFunc(func(r micro.Request) { s.answer(ep, r) }),
			micro.WithEndpointSubject(ep.subject),
		); err != nil {
			_ = svc.Stop()
			return fmt.Errorf("mounting %q on %s: %w", ep.tool, ep.subject, err)
		}
		s.log.Info("tool mounted", "tool", ep.tool, "subject", ep.subject, "declared_at", string(ep.method))
	}

	if err := nc.Flush(); err != nil {
		_ = svc.Stop()
		return fmt.Errorf("%s: flushing subscriptions: %w", s.cfg.Name, err)
	}

	s.mu.Lock()
	s.svc, s.nc = svc, nc
	s.mu.Unlock()
	return nil
}

// Serve answers until ctx is cancelled, then drains.
//
// Shutdown is graceful, and the three steps are in this order for a reason. Stop()
// DRAINS each subscription rather than unsubscribing, so a call already queued is
// still delivered -- but Drain returns before that finishes, so a bare wait on
// in-flight work would see zero and return while a queued call was being answered.
// Barrier closes that window: it fires only once every pending callback has been
// dispatched, at which point every handler that will run has registered itself.
func (s *Service) Serve(ctx context.Context) error {
	s.mu.Lock()
	svc, nc := s.svc, s.nc
	s.mu.Unlock()
	if svc == nil {
		return fmt.Errorf("%s: Serve called before Start", s.cfg.Name)
	}

	<-ctx.Done()

	if err := svc.Stop(); err != nil {
		return fmt.Errorf("stopping the micro service %q: %w", s.cfg.Name, err)
	}
	dispatched := make(chan struct{})
	if err := nc.Barrier(func() { close(dispatched) }); err != nil {
		// A closed connection means nothing further will be dispatched, so there
		// is nothing left to wait for.
		close(dispatched)
	}
	<-dispatched
	s.inFlight.Wait()
	// A cancelled context is how a caller asks this to stop, not a failure.
	return nil
}

// Run is Start then Serve, for a process that wants neither separately.
func (s *Service) Run(ctx context.Context, nc *nats.Conn) error {
	if err := s.Start(nc); err != nil {
		return err
	}
	return s.Serve(ctx)
}

// answer handles one call. It always replies: a path that returns without
// responding leaves the caller hanging until its own deadline.
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
	s.inFlight.Add(1)
	defer s.inFlight.Done()

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
	if replyErr := r.Error(errorCode(w.GetKind()), description, body); replyErr != nil {
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
