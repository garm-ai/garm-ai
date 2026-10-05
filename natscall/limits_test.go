package natscall_test

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	natsserver "github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"google.golang.org/protobuf/proto"

	"github.com/garm-ai/garm-ai/call"
	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/natscall"
	"github.com/garm-ai/garm-ai/rundsvc"
	"github.com/garm-ai/garm-ai/serve"
)

// Review finding: an oversized REQUEST hit the server's payload limit and the
// caller got a transport error with no kind. Large artefacts do not cross this
// bus by rule; a request over the limit is INVALID, and the refusal says how big
// it was and what the limit is -- before anything is sent.
func TestAnOversizedRequestIsRefusedAsInvalidBeforeItIsSent(t *testing.T) {
	e := estate.New(t)
	nc := e.Connect(t, estate.RoleCaller)
	limit := int(nc.MaxPayload())
	if limit <= 0 {
		t.Fatal("the server advertises no payload limit")
	}
	big, _ := proto.Marshal(&weatherv1.GetForecastRequest{Place: strings.Repeat("x", limit+1)})

	_, err := (natscall.Client{NC: nc}).Invoke(context.Background(), "weather.v1.get_forecast", big, call.Options{})
	if err == nil {
		t.Fatal("an oversized request was accepted")
	}
	var se *serve.Error
	if !errors.As(err, &se) || se.Kind != invokev1.ErrorKind_ERROR_KIND_INVALID {
		t.Fatalf("got %v, want INVALID -- a caller that saw UNAVAILABLE would retry something that can never work", err)
	}
	if !strings.Contains(se.Message, "bytes") {
		t.Errorf("the refusal does not say the size or the limit: %q", se.Message)
	}
}

// Review finding: UNAVAILABLE exists so a caller can retry, and nothing did. One
// bounded retry, only on "no responders" -- the one failure that proves the
// request reached nobody and so cannot have executed -- after a short pause.
// Proved with a responder arriving 50ms after the first attempt -- inside the
// retry window, which is the window a deploy's new instance has to subscribe.
func TestOneRetryWhenNothingWasListeningYet(t *testing.T) {
	srv, err := natsserver.NewServer(&natsserver.Options{Host: "127.0.0.1", Port: -1, NoLog: true, NoSigs: true})
	if err != nil {
		t.Fatal(err)
	}
	go srv.Start()
	defer srv.Shutdown()
	srv.ReadyForConnections(10 * time.Second)
	caller, err := nats.Connect(srv.ClientURL())
	if err != nil {
		t.Fatal(err)
	}
	defer caller.Close()

	// Something answering as rund arrives LATE -- a raw responder on the flat
	// subject this open server delivers unrewritten -- 50ms after the caller's
	// first attempt has already been told there are no responders, and before the
	// single retry at 100ms.
	answered := make(chan struct{}, 1)
	go func() {
		time.Sleep(50 * time.Millisecond)
		late, err := nats.Connect(srv.ClientURL())
		if err != nil {
			return
		}
		_, _ = late.Subscribe(rundsvc.SubjectInvoke, func(m *nats.Msg) {
			out, _ := proto.Marshal(&runv1.InvokeResponse{Outcome: &runv1.InvokeResponse_Result{Result: []byte("late but here")}})
			_ = m.Respond(out)
			answered <- struct{}{}
		})
		_ = late.Flush()
	}()

	body, _ := proto.Marshal(&weatherv1.GetForecastRequest{Place: "Ghent"})
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	out, err := (natscall.Client{NC: caller}).Invoke(ctx, "weather.v1.get_forecast", body, call.Options{})
	if err != nil {
		var se *serve.Error
		if errors.As(err, &se) && se.Kind == invokev1.ErrorKind_ERROR_KIND_UNAVAILABLE {
			t.Fatalf("the single retry did not reach the late responder: %v", err)
		}
		t.Fatalf("Invoke: %v", err)
	}
	if string(out.GetResult()) != "late but here" {
		t.Fatalf("got %q", out.GetResult())
	}
	select {
	case <-answered:
	default:
		t.Fatal("the late responder never saw the request, yet the call succeeded")
	}
}

// A timeout is NOT retried: the request may have executed.
func TestATimeoutIsNotRetried(t *testing.T) {
	e := estate.New(t)
	nc := e.Connect(t, estate.RoleCaller)
	body, _ := proto.Marshal(&weatherv1.GetForecastRequest{Place: "Ghent"})
	ctx, cancel := context.WithTimeout(context.Background(), time.Nanosecond)
	defer cancel()
	start := time.Now()
	_, err := (natscall.Client{NC: nc}).Invoke(ctx, "weather.v1.get_forecast", body, call.Options{})
	if err == nil {
		t.Fatal("a call with an expired context succeeded")
	}
	if time.Since(start) > 500*time.Millisecond {
		t.Fatalf("an expired call took %v; it was retried", time.Since(start))
	}
}
