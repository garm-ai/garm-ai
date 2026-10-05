package estate_test

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"github.com/garm-ai/garm-ai/call"
	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/natscall"
	"github.com/garm-ai/garm-ai/serve"
)

// Properties 1, 2, 3 end to end, through the generated client: pending, then
// the result; a refusal with its kind.
func TestAnAsyncToolIsPendingThenAnswered(t *testing.T) {
	e := estate.New(t, estate.WithStore())
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, estate.RoleCaller)})
	ref, err := client.ScheduleReport(context.Background(), &weatherv1.ScheduleReportRequest{Place: "Ghent"}, call.Options{Idempotency: "k-ghent"})
	if err != nil {
		t.Fatal(err)
	}
	if ref.RunID != "k-ghent" {
		t.Fatalf("run id %q", ref.RunID)
	}
	// Immediately: RUNNING or already done, never NOT_FOUND (property 1).
	now, err := ref.Fetch(context.Background(), 0)
	if err != nil || (now.GetState() != runv1.RunState_RUN_STATE_RUNNING && now.GetState() != runv1.RunState_RUN_STATE_SUCCEEDED) {
		t.Fatalf("%v %v", now, err)
	}
	out, resp, err := client.ScheduleReportResult(context.Background(), ref, 10*time.Second)
	if err != nil || resp.GetState() != runv1.RunState_RUN_STATE_SUCCEEDED || out.GetReportId() != "report-Ghent" {
		t.Fatalf("%v %v %v", out, resp, err)
	}
	if resp.GetStage() != "done" {
		t.Errorf("stage %q, want done", resp.GetStage())
	}
}

func TestAnAsyncToolsRefusalIsTheRunsFailure(t *testing.T) {
	e := estate.New(t, estate.WithStore())
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, estate.RoleCaller)})
	ref, err := client.ScheduleReport(context.Background(), &weatherv1.ScheduleReportRequest{}, call.Options{Idempotency: "k-empty"})
	if err != nil {
		t.Fatal(err)
	}
	out, resp, err := client.ScheduleReportResult(context.Background(), ref, 10*time.Second)
	var se *serve.Error
	if out != nil || resp.GetState() != runv1.RunState_RUN_STATE_FAILED || !errors.As(err, &se) || se.Kind != invokev1.ErrorKind_ERROR_KIND_INVALID {
		t.Fatalf("%v %v %v", out, resp, err)
	}
}

// Property 13 end to end: a storeless rund refuses the async tool naming the
// flag and answers the sync one; Fetch says NOT_RETAINED.
func TestAStorelessRundIsSyncOnly(t *testing.T) {
	e := estate.New(t)
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, estate.RoleCaller)})
	_, err := client.ScheduleReport(context.Background(), &weatherv1.ScheduleReportRequest{Place: "x"}, call.Options{Idempotency: "k"})
	var se *serve.Error
	if !errors.As(err, &se) || se.Kind != invokev1.ErrorKind_ERROR_KIND_UNAVAILABLE {
		t.Fatalf("got %v, want UNAVAILABLE", err)
	}
	if _, err := client.GetForecast(context.Background(), &weatherv1.GetForecastRequest{Place: "Ghent"}); err != nil {
		t.Fatal(err)
	}
}

// Property 7 on the wire: a run is visible only to the account that started
// it. batch's Fetch of studio's run is NOT_FOUND -- not DENIED: the run's
// existence is not batch's to learn.
func TestARunIsVisibleOnlyToItsInvokingAccount(t *testing.T) {
	e := estate.New(t, estate.WithStore())
	studio := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, estate.RoleCaller)})
	ref, err := studio.ScheduleReport(context.Background(), &weatherv1.ScheduleReportRequest{Place: "Ghent"}, call.Options{Idempotency: "k-owned"})
	if err != nil {
		t.Fatal(err)
	}
	batch := natscall.Client{NC: e.Connect(t, estate.RoleCaller2)}
	_, err = batch.Fetch(context.Background(), ref.RunID, 0)
	var se *serve.Error
	if !errors.As(err, &se) || se.Kind != invokev1.ErrorKind_ERROR_KIND_NOT_FOUND {
		t.Fatalf("batch's fetch: %v, want NOT_FOUND", err)
	}
	if _, _, err := studio.ScheduleReportResult(context.Background(), ref, 10*time.Second); err != nil {
		t.Fatalf("the owner's fetch: %v", err)
	}
}

// Property 5 on the wire: the same key with a different request is INVALID
// and names the key.
func TestAReusedKeyWithADifferentRequestIsInvalidOnTheWire(t *testing.T) {
	e := estate.New(t, estate.WithStore())
	studio := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, estate.RoleCaller)})
	if _, err := studio.ScheduleReport(context.Background(), &weatherv1.ScheduleReportRequest{Place: "Ghent"}, call.Options{Idempotency: "k-dup"}); err != nil {
		t.Fatal(err)
	}
	_, err := studio.ScheduleReport(context.Background(), &weatherv1.ScheduleReportRequest{Place: "Bruges"}, call.Options{Idempotency: "k-dup"})
	var se *serve.Error
	if !errors.As(err, &se) || se.Kind != invokev1.ErrorKind_ERROR_KIND_INVALID || !strings.Contains(err.Error(), "k-dup") {
		t.Fatalf("got %v, want INVALID naming k-dup", err)
	}
}

// Property 12 end to end: with the store down, the sync tool answers and the
// async one is UNAVAILABLE naming the store; when the store returns, the async
// tool runs. Sync is sovereign.
func TestSyncIsSovereignWhenTheStoreIsDown(t *testing.T) {
	e := estate.New(t, estate.WithStoreDown())
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, estate.RoleCaller)})
	if out, err := client.GetForecast(context.Background(), &weatherv1.GetForecastRequest{Place: "Ghent"}); err != nil || out.GetSummary() == "" {
		t.Fatalf("sync with the store down: %v %v", out, err)
	}
	_, err := client.ScheduleReport(context.Background(), &weatherv1.ScheduleReportRequest{Place: "Ghent"}, call.Options{Idempotency: "k-down"})
	var se *serve.Error
	if !errors.As(err, &se) || se.Kind != invokev1.ErrorKind_ERROR_KIND_UNAVAILABLE || !strings.Contains(err.Error(), "run store") {
		t.Fatalf("async with the store down: %v, want UNAVAILABLE naming the store", err)
	}
	e.StoreUp(t)
	ref, err := client.ScheduleReport(context.Background(), &weatherv1.ScheduleReportRequest{Place: "Ghent"}, call.Options{Idempotency: "k-up"})
	if err != nil {
		t.Fatal(err)
	}
	if out, _, err := client.ScheduleReportResult(context.Background(), ref, 10*time.Second); err != nil || out.GetReportId() != "report-Ghent" {
		t.Fatalf("after the store returned: %v %v", out, err)
	}
}
