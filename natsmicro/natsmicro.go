// Package natsmicro is one NATS micro service with a shutdown that does not drop
// work.
//
// It exists because two things need it -- `natsserve`, which mounts declared
// tools, and `rund`, which serves the run interface -- and the shutdown is the
// part that is easy to get subtly wrong. Writing it twice would be the failure
// this estate was restarted to avoid: one idea implemented twice, diverging
// quietly.
//
// It knows nothing about tools, runs, protobuf or the catalogue. A caller mounts
// subjects and handles raw micro requests.
package natsmicro

import (
	"context"
	"fmt"
	"log/slog"
	"regexp"
	"sync"
	"sync/atomic"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/micro"
	"go.opentelemetry.io/otel/metric"

	"github.com/garm-ai/garm-ai/observe"
)

// Copied from nats.go's micro package, which does not export them.
//
// Copied deliberately rather than approximated: New exists to refuse a Config
// micro would reject, and a looser pattern here would let a process start and fail
// at AddService instead. A test asserts micro agrees, so a change on their side
// shows up as a failure rather than as a divergence nobody notices.
var (
	nameRe   = regexp.MustCompile(`^[A-Za-z0-9\-_]+$`)
	semverRe = regexp.MustCompile(`^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$`)
)

// Config is what a deployment knows.
type Config struct {
	// Name is the service name, e.g. "weatherd" or "rund". micro requires
	// ^[A-Za-z0-9\-_]+$.
	Name string
	// Version must be semver: micro validates it and refuses anything else.
	Version string
	// Logger is used for the one line per mount. nil means slog.Default().
	Logger *slog.Logger
}

type mount struct {
	name    string // what $SRV.INFO shows; micro's charset, so no dots
	subject string
	handle  micro.HandlerFunc
}

// Service collects mounts, then answers them.
type Service struct {
	cfg Config
	log *slog.Logger

	mu     sync.Mutex
	mounts []mount
	taken  map[string]string // subject -> the name that claimed it
	svc    micro.Service     // nil until Start
	nc     *nats.Conn

	inFlight sync.WaitGroup
	// inFlightN mirrors inFlight as a number, for the drain line and the metric;
	// a WaitGroup cannot be read.
	inFlightN atomic.Int64
	// draining is set the moment Serve begins to stop, before Stop() has drained
	// anything, so readiness goes false BEFORE the last call is answered rather
	// than after -- a scheduler must stop routing here first.
	draining atomic.Bool
}

// New validates what micro would otherwise reject at Start, so a misconfigured
// process fails at construction rather than after it has started doing work.
func New(cfg Config) (*Service, error) {
	if !nameRe.MatchString(cfg.Name) {
		return nil, fmt.Errorf("service name %q: must be one or more of A-Z a-z 0-9 - _", cfg.Name)
	}
	if !semverRe.MatchString(cfg.Version) {
		return nil, fmt.Errorf("service version %q: must be semver, e.g. 0.1.0", cfg.Version)
	}
	log := cfg.Logger
	if log == nil {
		log = slog.Default()
	}
	return &Service{cfg: cfg, log: log, taken: map[string]string{}}, nil
}

// Log is the logger this service was configured with, so a caller building
// handlers logs to the same place.
func (s *Service) Log() *slog.Logger { return s.log }

// Mount adds one subject. Call before Start.
//
// name is what $SRV.INFO shows and must match micro's charset; subject is where
// requests arrive. Two mounts on one subject are refused here rather than
// discovered in production, where one of them would silently never answer and
// which one would depend on registration order.
func (s *Service) Mount(name, subject string, handle micro.HandlerFunc) error {
	if name == "" || subject == "" || handle == nil {
		return fmt.Errorf("mount %q: a name, a subject and a handler are all required", name)
	}
	if !nameRe.MatchString(name) {
		return fmt.Errorf("endpoint name %q: must be one or more of A-Z a-z 0-9 - _", name)
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if prev, dup := s.taken[subject]; dup {
		return fmt.Errorf("%q and %q both answer on %s", prev, name, subject)
	}
	s.taken[subject] = name
	s.mounts = append(s.mounts, mount{name: name, subject: subject, handle: handle})
	return nil
}

// Track wraps a handler so Serve's drain waits for it.
//
// Exported because a caller that dispatches work itself still has to be counted,
// and a caller that forgets is the bug the drain exists to prevent.
func (s *Service) Track(f func()) {
	s.inFlight.Add(1)
	s.inFlightN.Add(1)
	defer func() { s.inFlightN.Add(-1); s.inFlight.Done() }()
	f()
}

// Ready is what /readyz reports: Start has returned, Serve has not begun to
// drain, and the connection is connected -- which is also exactly when micro's
// $SRV.PING answers, and a test holds the two to that (spec §5).
func (s *Service) Ready() bool {
	s.mu.Lock()
	svc, nc := s.svc, s.nc
	s.mu.Unlock()
	return svc != nil && !s.draining.Load() && nc != nil && nc.Status() == nats.CONNECTED
}

// Start mounts everything and returns once the subjects are ANSWERING.
//
// The Flush at the end is what makes that promise true. A subscription is sent
// asynchronously, so without it Start returns while the server has not been told
// what we answer -- and a caller gets "no responders available" for a service that
// is, by then, perfectly fine.
func (s *Service) Start(nc *nats.Conn) error {
	s.mu.Lock()
	if s.svc != nil {
		s.mu.Unlock()
		return fmt.Errorf("%s: already started", s.cfg.Name)
	}
	ms := append([]mount(nil), s.mounts...)
	s.mu.Unlock()

	if len(ms) == 0 {
		return fmt.Errorf("%s: nothing mounted, so there is nothing to answer", s.cfg.Name)
	}
	// Before mounting anything: can this credential subscribe to all of it? A
	// refused subscription is otherwise asynchronous and silent (gate.go).
	subjects := make([]string, 0, len(ms))
	for _, m := range ms {
		subjects = append(subjects, m.subject)
	}
	if err := gate(nc, subjects); err != nil {
		return fmt.Errorf("%s: %w", s.cfg.Name, err)
	}
	svc, err := micro.AddService(nc, micro.Config{Name: s.cfg.Name, Version: s.cfg.Version})
	if err != nil {
		return fmt.Errorf("adding the micro service %q: %w", s.cfg.Name, err)
	}
	for _, m := range ms {
		// No queue group set, so micro's default applies and every instance
		// answering a subject shares it -- which is what request/reply wants:
		// exactly one responder per call, whoever is serving.
		if err := svc.AddEndpoint(m.name, m.handle, micro.WithEndpointSubject(m.subject)); err != nil {
			_ = svc.Stop()
			return fmt.Errorf("mounting %q on %s: %w", m.name, m.subject, err)
		}
		s.log.Info("mounted", "service", s.cfg.Name, "endpoint", m.name, "subject", m.subject)
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
// The three steps are in this order for a reason, and it took a vacuous test to
// find it. Stop() DRAINS each subscription rather than unsubscribing, so a call
// already queued is still delivered -- but Drain returns before that finishes, so
// a bare wait on in-flight work sees zero and returns while a queued call is being
// answered. Barrier closes that window: it fires only once every pending callback
// has been dispatched, at which point every handler that will run has registered.
func (s *Service) Serve(ctx context.Context) error {
	s.mu.Lock()
	svc, nc := s.svc, s.nc
	s.mu.Unlock()
	if svc == nil {
		return fmt.Errorf("%s: Serve called before Start", s.cfg.Name)
	}

	<-ctx.Done()

	s.draining.Store(true)
	queued := s.inFlightN.Load()
	observe.Instruments().ServiceDrain.Add(context.Background(), 1,
		metric.WithAttributes(observe.KeyService.String(s.cfg.Name), observe.KeyQueued.Int64(queued)))
	s.log.Info("draining", "service", s.cfg.Name, "in_flight", queued)

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
