package natscall_test

import (
	"context"
	"strings"
	"testing"
	"time"

	natsserver "github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"

	"github.com/garm-ai/garm-ai/call"
	"github.com/garm-ai/garm-ai/natscall"
	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/observe/otlp/otlptest"
	"github.com/garm-ai/garm-ai/rundsvc"
)

// bare is an open server with nothing on it: these tests watch the WIRE, so they
// stand in for rund themselves.
func bare(t *testing.T) *nats.Conn {
	t.Helper()
	srv, err := natsserver.NewServer(&natsserver.Options{Host: "127.0.0.1", Port: -1, NoLog: true, NoSigs: true})
	if err != nil {
		t.Fatal(err)
	}
	go srv.Start()
	t.Cleanup(srv.Shutdown)
	if !srv.ReadyForConnections(5 * time.Second) {
		t.Fatal("server not ready")
	}
	nc, err := nats.Connect(srv.ClientURL())
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(nc.Close)
	return nc
}

// The request carries the CALLER's span, and the span is a child of whatever the
// caller's ctx already held.
func TestInvokeInjectsTheCallersSpanAndIsAChildOfTheCallersContext(t *testing.T) {
	rec := otlptest.Install(t)
	nc := bare(t)
	got := make(chan string, 1)
	sub, err := nc.Subscribe(rundsvc.SubjectInvoke, func(m *nats.Msg) {
		got <- m.Header.Get("traceparent")
		_ = m.Respond([]byte{}) // an empty InvokeResponse
	})
	if err != nil {
		t.Fatal(err)
	}
	defer sub.Unsubscribe()

	ctx, parent := observe.Tracer().Start(context.Background(), "the-callers-own-work")
	if _, err := (natscall.Client{NC: nc}).Invoke(ctx, "x", nil, call.Options{}); err != nil {
		t.Fatal(err)
	}
	parent.End()

	span, ok := rec.SpanNamed("garm.call")
	if !ok {
		t.Fatal("no garm.call span")
	}
	if span.Parent().SpanID() != parent.SpanContext().SpanID() {
		t.Fatal("garm.call is not a child of the caller's span")
	}
	onWire := <-got
	if !strings.Contains(onWire, span.SpanContext().TraceID().String()) {
		t.Fatalf("traceparent on the wire was %q, want the caller's trace %s", onWire, span.SpanContext().TraceID())
	}
}

// Property 15: the one retry is ONE span with one retry event.
func TestTheOneRetryIsOneSpanWithAnEvent(t *testing.T) {
	rec := otlptest.Install(t)
	nc := bare(t)
	// Nobody answers the first attempt; a responder appears at 50ms, before the
	// retry at 100ms.
	time.AfterFunc(50*time.Millisecond, func() {
		_, _ = nc.Subscribe(rundsvc.SubjectInvoke, func(m *nats.Msg) { _ = m.Respond([]byte{}) })
		_ = nc.Flush()
	})
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	if _, err := (natscall.Client{NC: nc}).Invoke(ctx, "x", nil, call.Options{}); err != nil {
		t.Fatalf("the retry did not succeed: %v", err)
	}
	var calls int
	for _, s := range rec.Spans() {
		if s.Name() != "garm.call" {
			continue
		}
		calls++
		var retries int
		for _, ev := range s.Events() {
			if ev.Name == "retry" {
				retries++
			}
		}
		if retries != 1 {
			t.Errorf("want 1 retry event, got %d", retries)
		}
	}
	if calls != 1 {
		t.Fatalf("want 1 garm.call span, got %d", calls)
	}
}
