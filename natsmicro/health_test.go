package natsmicro_test

import (
	"context"
	"net/http"
	"testing"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/micro"

	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/observe/otlp/otlptest"
)

func get(t *testing.T, url string) int {
	t.Helper()
	resp, err := http.Get(url)
	if err != nil {
		t.Fatalf("GET %s: %v", url, err)
	}
	resp.Body.Close()
	return resp.StatusCode
}

func pingAnswers(nc *nats.Conn, name string) bool {
	_, err := nc.Request("$SRV.PING."+name, nil, 300*time.Millisecond)
	return err == nil
}

// Properties 6 and 12 together: /readyz is 200 exactly when $SRV.PING answers --
// before Start neither, after Start both, once Serve drains neither -- and /livez
// is 200 throughout. A readiness flag that disagreed with the bus would be the
// vacuous check this repository exists to catch.
func TestReadyAgreesWithPingThroughTheLifecycle(t *testing.T) {
	rec := otlptest.Install(t)
	url := serverURL(t)
	nc := connect(t, url)
	probe := connect(t, url)
	s := newService(t)
	if err := s.Mount("echo", "probe.echo", echo(s)); err != nil {
		t.Fatal(err)
	}
	bound, stopHealth, err := observe.ServeHealth(context.Background(), "127.0.0.1:0", s.Ready)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = stopHealth(context.Background()) })
	live, ready := "http://"+bound+"/livez", "http://"+bound+"/readyz"

	if get(t, live) != 200 || get(t, ready) != 503 || pingAnswers(probe, "probed") {
		t.Fatal("before Start: want livez 200, readyz 503, no PING")
	}
	stop := serve(t, s, nc)
	if get(t, live) != 200 || get(t, ready) != 200 || !pingAnswers(probe, "probed") {
		t.Fatal("after Start: want livez 200, readyz 200, PING answers")
	}
	if err := stop(); err != nil {
		t.Fatal(err)
	}
	// readyz is deterministic here: the flag flips before Stop. PING is not --
	// Stop DRAINS, and a drain's unsubscribe reaches the server asynchronously,
	// so a PING published in that window is still routed to the draining
	// connection and answered. The property is that it STOPS, with readyz 503
	// throughout; a drain that never unsubscribed still fails this.
	if get(t, live) != 200 || get(t, ready) != 503 {
		t.Fatal("after drain: want livez 200, readyz 503")
	}
	var settled bool
	for deadline := time.Now().Add(3 * time.Second); time.Now().Before(deadline); {
		if !pingAnswers(probe, "probed") {
			settled = true
			break
		}
		if get(t, ready) != 503 {
			t.Fatal("readyz went back to 200 while the drain was finishing")
		}
	}
	if !settled {
		t.Fatal("after drain: $SRV.PING still answers")
	}
	// A clean drain counts once, with queued=false -- a BOOL, so the series is
	// bounded: the question is whether anything was waiting, not how many.
	if n := rec.Counter(context.Background(), "garm.service.drain", observe.KeyService.String("probed"), observe.KeyQueued.Bool(false)); n != 1 {
		t.Errorf("garm.service.drain{probed,queued=false} = %d, want 1", n)
	}
}

// Readiness goes false the moment the drain BEGINS, not when it ends: a scheduler
// must stop routing here before the last accepted call is answered, or it routes
// to a process that is about to refuse. A blocked handler holds the drain open
// while Ready is read.
func TestReadyGoesFalseBeforeTheLastCallIsAnswered(t *testing.T) {
	rec := otlptest.Install(t)
	url := serverURL(t)
	nc := connect(t, url)
	caller := connect(t, url)
	s := newService(t)
	entered, release := make(chan struct{}), make(chan struct{})
	if err := s.Mount("slow", "probe.slow", micro.HandlerFunc(func(r micro.Request) {
		s.Track(func() {
			close(entered)
			<-release
			_ = r.Respond(nil)
		})
	})); err != nil {
		t.Fatal(err)
	}
	if err := s.Start(nc); err != nil {
		t.Fatal(err)
	}
	ctx, cancel := context.WithCancel(context.Background())
	served := make(chan error, 1)
	go func() { served <- s.Serve(ctx) }()

	go func() { _, _ = caller.Request("probe.slow", nil, 5*time.Second) }()
	<-entered
	cancel() // the drain begins; the handler is still blocked
	deadline := time.Now().Add(2 * time.Second)
	for s.Ready() && time.Now().Before(deadline) {
		time.Sleep(5 * time.Millisecond)
	}
	stillReady := s.Ready()
	close(release)
	<-served
	if stillReady {
		t.Fatal("Ready stayed true while the drain was waiting on a call")
	}
	if n := rec.Counter(context.Background(), "garm.service.drain", observe.KeyService.String("probed"), observe.KeyQueued.Bool(true)); n != 1 {
		t.Errorf("garm.service.drain{probed,queued=true} = %d, want 1", n)
	}
}

// Review focus 4: a started service whose connection is not CONNECTED is not ready.
func TestReadyIsFalseWhileDisconnected(t *testing.T) {
	url := serverURL(t)
	nc := connect(t, url)
	s := newService(t)
	if err := s.Mount("echo", "probe.echo", echo(s)); err != nil {
		t.Fatal(err)
	}
	serve(t, s, nc)
	if !s.Ready() {
		t.Fatal("ready should be true after Start")
	}
	nc.Close() // a closed connection is the sharpest "not connected"
	if s.Ready() {
		t.Fatal("ready while the connection is closed")
	}
}
