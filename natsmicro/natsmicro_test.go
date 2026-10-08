package natsmicro_test

import (
	"context"
	"io"
	"log/slog"
	"strings"
	"sync"
	"testing"
	"time"

	natsserver "github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/micro"

	"github.com/garm-ai/garm-ai/natsmicro"
)

// natsmicro is tested DIRECTLY here, with raw micro handlers and no protobuf.
//
// Its lifecycle was previously only reached through natsserve, which meant every
// assertion about it travelled through a layer with opinions of its own -- and the
// one test that is purely about this package's validation lived over there, against
// a package it does not name.
//
// Two things need natsmicro and neither owns it, so it has to hold up on its own.

func quiet() *slog.Logger { return slog.New(slog.NewTextHandler(io.Discard, nil)) }

func serverURL(t *testing.T) string {
	t.Helper()
	srv, err := natsserver.NewServer(&natsserver.Options{
		Host: "127.0.0.1", Port: -1, NoLog: true, NoSigs: true})
	if err != nil {
		t.Fatal(err)
	}
	go srv.Start()
	t.Cleanup(srv.Shutdown)
	if !srv.ReadyForConnections(10 * time.Second) {
		t.Fatal("nats-server not ready")
	}
	return srv.ClientURL()
}

func connect(t *testing.T, url string) *nats.Conn {
	t.Helper()
	nc, err := nats.Connect(url)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(nc.Close)
	return nc
}

func conn(t *testing.T) *nats.Conn { return connect(t, serverURL(t)) }

func newService(t *testing.T) *natsmicro.Service {
	t.Helper()
	s, err := natsmicro.New(natsmicro.Config{Name: "probed", Version: "0.1.0", Logger: quiet()})
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	return s
}

// echo is the smallest handler that proves a subject answers.
func echo(s *natsmicro.Service) micro.HandlerFunc {
	return func(r micro.Request) { s.Track(func() { _ = r.Respond(r.Data()) }) }
}

// serve starts the service and returns a stop that waits for Serve to return, so a
// test observes the drain rather than racing it.
func serve(t *testing.T, s *natsmicro.Service, nc *nats.Conn) (stop func() error) {
	t.Helper()
	if err := s.Start(nc); err != nil {
		t.Fatalf("Start: %v", err)
	}
	ctx, cancel := context.WithCancel(context.Background())
	errc := make(chan error, 1)
	go func() { errc <- s.Serve(ctx) }()
	stopped := false
	stop = func() error {
		if stopped {
			return nil
		}
		stopped = true
		cancel()
		return <-errc
	}
	t.Cleanup(func() { _ = stop() })
	return stop
}

// ---------------------------------------------------------------------------

func TestAMountedSubjectAnswers(t *testing.T) {
	nc := conn(t)
	s := newService(t)
	if err := s.Mount("probe", "probe.subject", echo(s)); err != nil {
		t.Fatalf("Mount: %v", err)
	}
	serve(t, s, nc)

	msg, err := nc.Request("probe.subject", []byte("ping"), 2*time.Second)
	if err != nil {
		t.Fatalf("Request: %v", err)
	}
	if string(msg.Data) != "ping" {
		t.Errorf("got %q", msg.Data)
	}
}

// TestServeDrainsACallThatIsQueuedButNotYetDispatched is the drain's whole point,
// and the ordering inside Serve took a vacuous test to find.
//
// Stop() DRAINS each subscription rather than unsubscribing, so a call already
// queued is still delivered -- but Drain returns before that delivery happens, so a
// bare wait on the in-flight counter sees zero when the FIRST handler finishes and
// lets Serve return while the second has not begun. Barrier closes that window.
//
// Two calls, not one: a single slow call is covered by the counter alone, which is
// why the first version of this test passed with the Barrier deleted.
func TestServeDrainsACallThatIsQueuedButNotYetDispatched(t *testing.T) {
	// Two connections, as two processes. The service's is the one that closes at
	// shutdown; the caller keeps its own, so a missing answer is really missing.
	url := serverURL(t)
	nc := connect(t, url)
	caller := connect(t, url)

	const work = 300 * time.Millisecond
	var (
		mu        sync.Mutex
		completed int
		entered   = make(chan struct{}, 2)
	)
	s := newService(t)
	if err := s.Mount("probe", "probe.subject", func(r micro.Request) {
		s.Track(func() {
			entered <- struct{}{}
			time.Sleep(work)
			mu.Lock()
			completed++
			mu.Unlock()
			_ = r.Respond([]byte("done"))
		})
	}); err != nil {
		t.Fatal(err)
	}
	stop := serve(t, s, nc)

	const calls = 2
	// The first call occupies the handler. It waits in a goroutine because its
	// answer only comes after the drain.
	replies := make(chan error, calls)
	go func() {
		_, err := caller.Request("probe.subject", []byte("ping"), 5*time.Second)
		replies <- err
	}()
	<-entered // its handler is running

	// The second call is sent BY HAND, and the flush is the point: it returns
	// only once the server has the request, so the request is queued before the
	// drain begins. Found in review of this branch's CI, which failed here on a
	// loaded runner -- two goroutines racing to publish meant the second
	// sometimes published AFTER the unsubscribe and came back "no responders",
	// which is a race in the test and says nothing about the drain.
	inbox := nats.NewInbox()
	answer, err := caller.SubscribeSync(inbox)
	if err != nil {
		t.Fatal(err)
	}
	if err := caller.PublishRequest("probe.subject", inbox, []byte("ping")); err != nil {
		t.Fatal(err)
	}
	if err := caller.Flush(); err != nil {
		t.Fatalf("flush the queued call to the server: %v", err)
	}
	go func() {
		_, err := answer.NextMsg(5 * time.Second)
		replies <- err
	}()

	if err := stop(); err != nil {
		t.Fatalf("Serve returned %v", err)
	}

	// What a main does next: the SERVICE's connection closes. Without the drain
	// guarantee the second handler is still to come and loses its connection here.
	if err := nc.Flush(); err != nil {
		t.Fatalf("flush: %v", err)
	}
	nc.Close()

	mu.Lock()
	done := completed
	mu.Unlock()
	if done != calls {
		t.Errorf("Serve returned with %d of %d calls answered", done, calls)
	}
	for i := 0; i < calls; i++ {
		if err := <-replies; err != nil {
			t.Errorf("call %d was never answered: %v", i+1, err)
		}
	}
}

// TestAnUntrackedHandlerIsNotWaitedFor states the cost of forgetting Track, because
// Track is exported precisely so a caller can forget it. This is not a wish: it
// records that the drain counts what it is told about and nothing else.
func TestAnUntrackedHandlerIsNotWaitedFor(t *testing.T) {
	url := serverURL(t)
	nc := connect(t, url)
	caller := connect(t, url)

	started := make(chan struct{})
	finished := make(chan struct{})
	s := newService(t)
	if err := s.Mount("probe", "probe.subject", func(r micro.Request) {
		// deliberately NOT wrapped in s.Track
		go func() {
			close(started)
			time.Sleep(300 * time.Millisecond)
			_ = r.Respond([]byte("late"))
			close(finished)
		}()
	}); err != nil {
		t.Fatal(err)
	}
	stop := serve(t, s, nc)

	go func() { _, _ = caller.Request("probe.subject", []byte("ping"), 5*time.Second) }()
	<-started
	if err := stop(); err != nil {
		t.Fatal(err)
	}
	select {
	case <-finished:
		t.Error("the untracked handler finished before Serve returned; " +
			"if the drain now waits for untracked work, Track is no longer load-bearing " +
			"and its documentation is wrong")
	default: // the expected case: Serve did not wait
	}
}

func TestTwoMountsOnOneSubjectAreRefused(t *testing.T) {
	s := newService(t)
	if err := s.Mount("first", "probe.subject", echo(s)); err != nil {
		t.Fatalf("the first mount failed: %v", err)
	}
	err := s.Mount("second", "probe.subject", echo(s))
	if err == nil {
		t.Fatal("one subject was claimed twice; one of the two would silently never answer")
	}
	// Both names and the subject, or an operator cannot find either claimant.
	for _, want := range []string{"first", "second", "probe.subject"} {
		if !strings.Contains(err.Error(), want) {
			t.Errorf("the refusal does not name %q: %v", want, err)
		}
	}
}

func TestMountRefusesAnIncompleteOrIllegalMount(t *testing.T) {
	s := newService(t)
	for _, tc := range []struct {
		why           string
		name, subject string
		handle        micro.HandlerFunc
	}{
		{"no name", "", "probe.subject", echo(s)},
		{"no subject", "probe", "", echo(s)},
		{"no handler", "probe", "probe.subject", nil},
		{"a dot in the endpoint name", "probe.tool", "probe.subject", echo(s)},
		{"a space in the endpoint name", "probe tool", "probe.subject", echo(s)},
	} {
		if err := s.Mount(tc.name, tc.subject, tc.handle); err == nil {
			t.Errorf("%s was accepted", tc.why)
		}
	}
}

func TestStartWithNothingMountedIsRefused(t *testing.T) {
	// A service that announces itself and answers nothing is discoverable and
	// useless, which is worse than failing to start.
	if err := newService(t).Start(conn(t)); err == nil {
		t.Fatal("Start succeeded with nothing mounted")
	}
}

func TestStartTwiceIsRefused(t *testing.T) {
	nc := conn(t)
	s := newService(t)
	if err := s.Mount("probe", "probe.subject", echo(s)); err != nil {
		t.Fatal(err)
	}
	if err := s.Start(nc); err != nil {
		t.Fatalf("the first Start failed: %v", err)
	}
	if err := s.Start(nc); err == nil {
		t.Fatal("Start twice was accepted, which would leave two services answering one subject")
	}
}

func TestServeBeforeStartIsRefused(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	// Not a hang and not a silent return: Serve with no service is a programming
	// error, and a silent nil here would look like a clean shutdown.
	if err := newService(t).Serve(ctx); err == nil {
		t.Fatal("Serve before Start returned nil")
	}
}

// TestNewRefusesExactlyWhatMicroRefuses is why this package copies micro's regexes
// rather than approximating them. New exists so a misconfigured process fails at
// construction; a looser pattern here would let it start and fail at AddService,
// and a stricter one would refuse a config that works.
//
// It lived in natsserve, testing a package it does not name -- which also left its
// comment pointing at a `validate.go` that does not exist.
func TestNewRefusesExactlyWhatMicroRefuses(t *testing.T) {
	nc := conn(t)
	for _, tc := range []struct{ name, version string }{
		{"weatherd", "0.1.0"},        // fine
		{"weather-d_2", "1.0.0-rc1"}, // fine
		{"weather.d", "0.1.0"},       // a dot in the name
		{"weather d", "0.1.0"},       // a space
		{"", "0.1.0"},                // empty
		{"weatherd", "v0.1.0"},       // not semver: the v
		{"weatherd", "0.1"},          // not semver: two parts
		{"weatherd", ""},             // empty
	} {
		_, ourErr := natsmicro.New(natsmicro.Config{Name: tc.name, Version: tc.version, Logger: quiet()})

		svc, microErr := micro.AddService(nc, micro.Config{Name: tc.name, Version: tc.version})
		if microErr == nil {
			_ = svc.Stop()
		}

		if (ourErr == nil) != (microErr == nil) {
			t.Errorf("Config{%q, %q}: New says %v, micro says %v — the copied patterns have diverged",
				tc.name, tc.version, ourErr, microErr)
		}
	}
}

// TestLogIsTheConfiguredLogger, because a caller builds handlers that log to the
// same place and a nil would panic on the first error.
func TestLogIsTheConfiguredLogger(t *testing.T) {
	want := quiet()
	s, err := natsmicro.New(natsmicro.Config{Name: "probed", Version: "0.1.0", Logger: want})
	if err != nil {
		t.Fatal(err)
	}
	if s.Log() != want {
		t.Error("Log() is not the configured logger")
	}
	s, err = natsmicro.New(natsmicro.Config{Name: "probed", Version: "0.1.0"})
	if err != nil {
		t.Fatal(err)
	}
	if s.Log() == nil {
		t.Error("Log() is nil with no logger configured; every error path would panic")
	}
}
