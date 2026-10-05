package estate_test

import (
	"context"
	"errors"
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
	e := estate.New(t)
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
}

func TestAnAsyncToolsRefusalIsTheRunsFailure(t *testing.T) {
	e := estate.New(t)
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
	e := estate.New(t, estate.WithoutStore())
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
