package estate_test

import (
	"bytes"
	"context"
	"reflect"
	"strings"
	"testing"
	"time"

	"github.com/nats-io/nats.go"
	"google.golang.org/protobuf/proto"

	"github.com/garm-ai/garm-ai/call"
	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/natscall"
)

func describe(evs []*runv1.Event) []string {
	var out []string
	for _, ev := range evs {
		switch k := ev.GetKind().(type) {
		case *runv1.Event_Stage:
			out = append(out, "stage:"+k.Stage.GetStage())
		case *runv1.Event_Step:
			kind := "OK"
			if k.Step.GetKind() != invokev1.ErrorKind_ERROR_KIND_UNSPECIFIED {
				kind = strings.TrimPrefix(k.Step.GetKind().String(), "ERROR_KIND_")
			}
			out = append(out, "step:"+k.Step.GetKey()+":"+kind)
		case *runv1.Event_Done:
			out = append(out, "done:"+strings.TrimPrefix(k.Done.GetState().String(), "RUN_STATE_"))
		}
	}
	return out
}

func collect(t *testing.T, ch <-chan *runv1.Event, n int, within time.Duration) []*runv1.Event {
	t.Helper()
	var got []*runv1.Event
	deadline := time.After(within)
	for len(got) < n {
		select {
		case ev := <-ch:
			got = append(got, ev)
		case <-deadline:
			t.Fatalf("received %d of %d events within %v: %v", len(got), n, within, describe(got))
		}
	}
	return got
}

func schedule(t *testing.T, e *estate.Estate, as estate.Role, key, place string) call.Ref {
	t.Helper()
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, as)})
	ref, err := client.ScheduleReport(context.Background(), &weatherv1.ScheduleReportRequest{Place: place}, call.Options{Idempotency: key})
	if err != nil {
		t.Fatal(err)
	}
	return ref
}

// Property 2: a live subscriber receives the run's events as they happen, with
// the record's sequence numbers, on the real bus through the real import.
func TestALiveSubscriberSeesTheRunsEvents(t *testing.T) {
	e := estate.New(t, estate.WithStore())
	events := e.SubscribeEvents(t, estate.RoleCaller, "k-live")
	schedule(t, e, estate.RoleCaller, "k-live", "Ghent")
	got := collect(t, events, 4, 10*time.Second)
	if d := describe(got); !reflect.DeepEqual(d, []string{"stage:calling:0", "step:k-live:0:OK", "stage:done", "done:SUCCEEDED"}) {
		t.Fatalf("%v", d)
	}
	for i, ev := range got {
		if ev.GetSeq() != uint64(i+1) || ev.GetRunId() != "k-live" {
			t.Fatalf("event %d: seq %d run %s", i, ev.GetSeq(), ev.GetRunId())
		}
	}
}

// Property 6: another account subscribing to the run's subject receives
// nothing -- the subject it would need carries a key it cannot import.
func TestAnotherAccountReceivesNothingOnTheBus(t *testing.T) {
	e := estate.New(t, estate.WithStore())
	batch := e.SubscribeEvents(t, estate.RoleCaller2, "k-mine")
	studio := e.SubscribeEvents(t, estate.RoleCaller, "k-mine")
	schedule(t, e, estate.RoleCaller, "k-mine", "Ghent")
	collect(t, studio, 4, 10*time.Second)
	select {
	case ev := <-batch:
		t.Fatalf("batch received studio's event %v", ev)
	case <-time.After(500 * time.Millisecond):
	}
}

// Property 15: the live feed carries no payload for the sentinel input, and
// neither does the record read back over the wire.
func TestTheLiveFeedCarriesNoPayload(t *testing.T) {
	e := estate.New(t, estate.WithStore())
	const sentinel = "PAYLOAD-SENTINEL-7f3a"
	events := e.SubscribeEvents(t, estate.RoleCaller, "k-sent")
	schedule(t, e, estate.RoleCaller, "k-sent", sentinel)
	got := collect(t, events, 4, 10*time.Second)
	for _, ev := range got {
		if b, _ := proto.Marshal(ev); bytes.Contains(b, []byte(sentinel)) {
			t.Fatalf("a live event carries the payload: %v", ev)
		}
	}
	resp, err := natscall.Client{NC: e.Connect(t, estate.RoleCaller)}.Events(context.Background(), "k-sent", 0, 0)
	if err != nil {
		t.Fatal(err)
	}
	for _, ev := range resp.GetEvents() {
		if b, _ := proto.Marshal(ev); bytes.Contains(b, []byte(sentinel)) {
			t.Fatalf("a recorded event carries the payload: %v", ev)
		}
	}
}

// The caller may invoke, fetch and read events, and may not publish on the
// event prefix it only receives: its permissions are the three verbs.
func TestACallerMayNotPublishOnTheEventPrefix(t *testing.T) {
	e := estate.New(t, estate.WithStore())
	nc := e.Connect(t, estate.RoleCaller)
	violations := make(chan error, 2)
	nc.SetErrorHandler(func(_ *nats.Conn, _ *nats.Subscription, err error) { violations <- err })
	if err := nc.Publish("garm.run.v1.out.k.1", []byte("forged")); err != nil {
		t.Fatal(err)
	}
	_ = nc.Flush()
	select {
	case err := <-violations:
		if !strings.Contains(err.Error(), "Permissions Violation") {
			t.Fatalf("got %v", err)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("a caller published on the event prefix without a violation")
	}
}
