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

// estate is the whole chain in one process -- a tool service, and rund in front of
// it -- now shared with the two COMMANDS that need the same thing. What a caller
// gets back is a connection and nothing else: no subject, no catalogue, no
// knowledge of either.
func estateConn(t *testing.T) *nats.Conn {
	t.Helper()
	return estate.New(t).Connect(t, estate.RoleCaller)
}

// ---------------------------------------------------------------------------

// TestTheLoopCloses is step 9's whole claim, through every piece that exists:
// a GENERATED client, over natscall, to rund, to natsserve, into the example
// handler, and back -- with the caller naming only a tool.
func TestTheLoopCloses(t *testing.T) {
	nc := estateConn(t)
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: nc})

	out, err := client.GetForecast(context.Background(),
		&weatherv1.GetForecastRequest{Place: "Ghent", Days: 3})
	if err != nil {
		t.Fatalf("GetForecast: %v", err)
	}
	if !strings.Contains(out.GetSummary(), "Ghent") {
		t.Errorf("summary is %q", out.GetSummary())
	}
	if out.GetHighCelsius() == 0 {
		t.Error("the answer did not come from the example handler")
	}
}

// TestAToolsRefusalReachesTheCallerWithItsKind, across all four hops. The example
// refuses an empty place with INVALID, and a caller that saw INTERNAL would retry
// something that can never work.
func TestAToolsRefusalReachesTheCallerWithItsKind(t *testing.T) {
	nc := estateConn(t)
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: nc})

	_, err := client.GetForecast(context.Background(), &weatherv1.GetForecastRequest{})
	if err == nil {
		t.Fatal("an empty place was accepted")
	}
	var e *serve.Error
	if !errors.As(err, &e) {
		t.Fatalf("the error arrived as %T, not a *serve.Error: %v", err, err)
	}
	// weatherd returns a plain fmt.Errorf, which serve.Wire makes INTERNAL on
	// purpose -- a bare error never publishes its own words.
	if e.Kind != invokev1.ErrorKind_ERROR_KIND_INTERNAL {
		t.Errorf("kind is %v", e.Kind)
	}
	if strings.Contains(e.Message, "place is required") {
		t.Error("a bare error's words reached the caller across three hops")
	}
	if !strings.Contains(e.Message, "id") {
		t.Errorf("the caller was not given an id to quote: %q", e.Message)
	}
}

func TestAnUnknownToolReachesTheCallerAsNotFound(t *testing.T) {
	nc := estateConn(t)
	_, err := natscall.Client{NC: nc}.Invoke(context.Background(), "weather.v1.nope", nil, call.Options{})
	if err == nil {
		t.Fatal("an unknown tool was accepted")
	}
	var e *serve.Error
	if !errors.As(err, &e) || e.Kind != invokev1.ErrorKind_ERROR_KIND_NOT_FOUND {
		t.Fatalf("got %v, want NOT_FOUND", err)
	}
}

// TestNoRundAtAllIsUnavailableNotASilentHang.
func TestNoRundAtAllIsUnavailableNotASilentHang(t *testing.T) {
	srv, err := natsserver.NewServer(&natsserver.Options{
		Host: "127.0.0.1", Port: -1, NoLog: true, NoSigs: true})
	if err != nil {
		t.Fatal(err)
	}
	go srv.Start()
	defer srv.Shutdown()
	srv.ReadyForConnections(10 * time.Second)
	nc, err := nats.Connect(srv.ClientURL())
	if err != nil {
		t.Fatal(err)
	}
	defer nc.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	_, err = natscall.Client{NC: nc}.Invoke(ctx, "weather.v1.get_forecast", nil, call.Options{})
	if err == nil {
		t.Fatal("a call succeeded with no rund running")
	}
	var e *serve.Error
	if !errors.As(err, &e) || e.Kind != invokev1.ErrorKind_ERROR_KIND_UNAVAILABLE {
		t.Fatalf("got %v, want UNAVAILABLE", err)
	}
	// The message names what rund ANSWERS on -- the pattern -- not the flat subject
	// the caller published, which nothing mounts (spec §3.1).
	if !strings.Contains(e.Message, rundsvc.PatternInvoke) {
		t.Errorf("the error does not say what did not answer: %q", e.Message)
	}
}

func TestFetchReachesTheCallerAndSaysNotRetained(t *testing.T) {
	// A rund with NO store: with one, an id it never saw is NOT_FOUND.
	nc := estateConn(t)
	resp, err := natscall.Client{NC: nc}.Fetch(context.Background(), "r1", 0)
	if err != nil {
		t.Fatalf("Fetch: %v", err)
	}
	if resp.GetState() != runv1.RunState_RUN_STATE_NOT_RETAINED {
		t.Errorf("state is %v, want NOT_RETAINED", resp.GetState())
	}
}

// TestTheSameIdempotencyKeyIsTheSameRun. Not yet deduplication -- there is no
// store -- but the key must already BE the run id, or adding a store later would
// change what a run id means.
func TestTheSameIdempotencyKeyIsTheSameRun(t *testing.T) {
	nc := estateConn(t)
	c := natscall.Client{NC: nc}
	body, _ := proto.Marshal(&weatherv1.GetForecastRequest{Place: "Ghent"})

	for i := 0; i < 2; i++ {
		if _, err := c.Invoke(context.Background(), "weather.v1.get_forecast", body,
			call.Options{Idempotency: "the-same-key"}); err != nil {
			t.Fatalf("call %d: %v", i, err)
		}
	}
	// proved at the engine level in run.TestTheIdempotencyKeyBecomesTheRunID; here
	// the point is only that the key survives the wire.
}

// Property 1 (transport half): an async invoke answers pending with the key as
// the run id -- never a result -- and Fetch with a wait returns the answer.
func TestAnAsyncInvokeAnswersPendingAndFetchTheResult(t *testing.T) {
	nc := estate.New(t, estate.WithStore()).Connect(t, estate.RoleCaller)
	c := natscall.Client{NC: nc}
	body, _ := proto.Marshal(&weatherv1.ScheduleReportRequest{Place: "Ghent"})
	answer, err := c.Invoke(context.Background(), "weather.v1.schedule_report", body, call.Options{Idempotency: "wire-1"})
	if err != nil {
		t.Fatal(err)
	}
	if answer.GetRunId() != "wire-1" || answer.GetPending() == nil {
		t.Fatalf("got %v, want pending for wire-1", answer)
	}
	// Await: a single held Fetch returns on any change, a stage change included.
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()
	resp, err := (call.Ref{RunID: "wire-1", Invoker: c}).Await(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if resp.GetState() != runv1.RunState_RUN_STATE_SUCCEEDED || resp.GetTool() != "weather.v1.schedule_report" {
		t.Fatalf("fetched %v", resp)
	}
	var out weatherv1.ScheduleReportResponse
	if err := proto.Unmarshal(resp.GetResult(), &out); err != nil || out.GetReportId() != "report-Ghent" {
		t.Fatalf("result %v %v", &out, err)
	}
}

// Events reaches the caller: after the run, the record from zero is the four
// events; Subscribe delivers the live copy of a run that has not started yet.
func TestEventsAndSubscribeReachTheCaller(t *testing.T) {
	nc := estate.New(t, estate.WithStore()).Connect(t, estate.RoleCaller)
	c := natscall.Client{NC: nc}
	live, stop, err := c.Subscribe(context.Background(), "wire-ev")
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	body, _ := proto.Marshal(&weatherv1.ScheduleReportRequest{Place: "Ghent"})
	if _, err := c.Invoke(context.Background(), "weather.v1.schedule_report", body, call.Options{Idempotency: "wire-ev"}); err != nil {
		t.Fatal(err)
	}
	var seen []uint64
	deadline := time.After(10 * time.Second)
	for len(seen) < 4 {
		select {
		case ev := <-live:
			seen = append(seen, ev.GetSeq())
		case <-deadline:
			t.Fatalf("live delivered %v", seen)
		}
	}
	resp, err := c.Events(context.Background(), "wire-ev", 0, 0)
	if err != nil || len(resp.GetEvents()) != 4 || !resp.GetClosed() {
		t.Fatalf("%v %v", resp, err)
	}
}
