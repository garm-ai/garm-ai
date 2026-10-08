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

func denied(t *testing.T, err error) *serve.Error {
	t.Helper()
	var se *serve.Error
	if !errors.As(err, &se) {
		t.Fatalf("got %v, want a serve.Error", err)
	}
	if se.Kind != invokev1.ErrorKind_ERROR_KIND_DENIED {
		t.Fatalf("got %v, want DENIED", err)
	}
	return se
}

// Property 1 on the wire: the caller whose grant carries `weather` invokes the
// example's requiring tool; the one whose grant does not is DENIED with the
// compartment named. One estate, both halves of a decision.
func TestAGrantDecidesTheRequiringToolOnTheWire(t *testing.T) {
	e := estate.New(t, estate.WithStore())
	studio := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, estate.RoleCaller)})
	ref, err := studio.ScheduleReport(context.Background(), &weatherv1.ScheduleReportRequest{Place: "Ghent"}, call.Options{Idempotency: "k-granted"})
	if err != nil {
		t.Fatalf("studio holds weather and was refused: %v", err)
	}
	if out, _, err := studio.ScheduleReportResult(context.Background(), ref, 10*time.Second); err != nil || out.GetReportId() != "report-Ghent" {
		t.Fatalf("%v %v", out, err)
	}

	batch := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, estate.RoleCaller2)})
	_, err = batch.ScheduleReport(context.Background(), &weatherv1.ScheduleReportRequest{Place: "Ghent"}, call.Options{Idempotency: "k-denied"})
	se := denied(t, err)
	if !strings.Contains(se.Message, "weather") || !strings.Contains(se.Message, "weather.v1.schedule_report") {
		t.Fatalf("the refusal does not name the tool and the missing compartment: %q", se.Message)
	}
}

// The requirement-less tool beside it is unaffected: a grant admitting it is
// all it needs, and both callers hold `tools: ["*"]`.
func TestARequirementlessToolIsUnaffected(t *testing.T) {
	e := estate.New(t)
	for _, as := range []estate.Role{estate.RoleCaller, estate.RoleCaller2} {
		client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, as)})
		if out, err := client.GetForecast(context.Background(), &weatherv1.GetForecastRequest{Place: "Ghent"}); err != nil || out.GetSummary() == "" {
			t.Fatalf("%s: %v %v", as, out, err)
		}
	}
}

// Property 9 on the wire: with no grant source, the requiring tool is refused
// naming the flag and the requirement-less one still answers.
func TestWithoutGrantsTheRequiringToolNamesTheFlag(t *testing.T) {
	e := estate.New(t, estate.WithoutGrants())
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, estate.RoleCaller)})
	if _, err := client.GetForecast(context.Background(), &weatherv1.GetForecastRequest{Place: "Ghent"}); err != nil {
		t.Fatalf("the requirement-less tool was refused: %v", err)
	}
	_, err := client.ScheduleReport(context.Background(), &weatherv1.ScheduleReportRequest{Place: "Ghent"}, call.Options{Idempotency: "k"})
	se := denied(t, err)
	if !strings.Contains(se.Message, "--grants") {
		t.Fatalf("%q", se.Message)
	}
}

// Property 5 on the wire: a grant listing one tool admits that one and refuses
// its sibling by name, even though the compartments would satisfy it.
func TestAGrantListingOneToolRefusesItsSibling(t *testing.T) {
	e := estate.New(t, estate.WithGrant(estate.RoleCaller, []string{"weather.v1.get_forecast"}, []string{"weather"}))
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, estate.RoleCaller)})
	if _, err := client.GetForecast(context.Background(), &weatherv1.GetForecastRequest{Place: "Ghent"}); err != nil {
		t.Fatalf("the granted tool was refused: %v", err)
	}
	_, err := client.ScheduleReport(context.Background(), &weatherv1.ScheduleReportRequest{Place: "Ghent"}, call.Options{Idempotency: "k"})
	se := denied(t, err)
	if !strings.Contains(se.Message, "does not admit") || !strings.Contains(se.Message, "weather.v1.schedule_report") {
		t.Fatalf("%q", se.Message)
	}
}

// Property 16 and review focus 5: a grant's acts_for is recorded on the run,
// reaches rund's log line, and lets the SUBJECT read the run its agent made --
// while the live event feed stays per owner, because push's export is keyed by
// the account the server placed in the subject, not by a grant (push spec §2).
func TestTheSubjectReadsTheRunButDoesNotReceiveItsLiveEvents(t *testing.T) {
	const person = "p.laenen@example.com"
	e := estate.New(t, estate.WithStore(),
		estate.WithGrantActingFor(estate.RoleCaller, []string{"*"}, []string{"weather"}, "person", person))
	studio := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, estate.RoleCaller)})
	ref, err := studio.ScheduleReport(context.Background(), &weatherv1.ScheduleReportRequest{Place: "Ghent"}, call.Options{Idempotency: "k-behalf"})
	if err != nil {
		t.Fatal(err)
	}
	if _, _, err := studio.ScheduleReportResult(context.Background(), ref, 10*time.Second); err != nil {
		t.Fatal(err)
	}

	// The log says on whose behalf.
	if !strings.Contains(e.RundLog(), person) {
		t.Errorf("rund's log does not say whose authority was exercised:\n%s", e.RundLog())
	}

	// And the SPAN carries both halves (spec §8): an auditor opening the trace
	// for this call sees who connected and on whose behalf, not only the first.
	// Found in review: observe.KeyActsFor was declared, claimed by the spec, the
	// invariants table and property 16, and set by nothing.
	span, ok := awaitSpan(e.Recorder(), "garm.run.invoke")
	if !ok {
		t.Fatal("no garm.run.invoke span")
	}
	if got, ok := attr(span, "garm.acts_for"); !ok || got != "person:"+person {
		t.Errorf("garm.acts_for = %q (present %v), want %q", got, ok, "person:"+person)
	}
	if got, ok := attr(span, "garm.principal"); !ok || !strings.HasPrefix(got, "account:") {
		t.Errorf("garm.principal = %q (present %v), want the proved account", got, ok)
	}

	// The subject reads the run through all three verbs.
	asPerson := e.AsPrincipal(t, "person", person)
	if resp, failure := asPerson.Fetch(context.Background(), "k-behalf", 0); failure != nil || resp.GetState() != runv1.RunState_RUN_STATE_SUCCEEDED {
		t.Fatalf("the subject's Fetch: %v %v", resp, failure)
	}
	evs, failure := asPerson.Events(context.Background(), "k-behalf", 0, 0)
	if failure != nil || len(evs.GetEvents()) == 0 {
		t.Fatalf("the subject's Events: %v %v", evs, failure)
	}

	// A third principal reads nothing.
	if _, failure := e.AsPrincipal(t, "person", "someone.else@example.com").Fetch(context.Background(), "k-behalf", 0); failure == nil {
		t.Fatal("a third principal read the run")
	}

	// And the live feed is unchanged: batch's account cannot import studio's
	// events whatever any grant says, which is the second, independent half.
	batch := e.SubscribeEvents(t, estate.RoleCaller2, "k-behalf")
	select {
	case ev := <-batch:
		t.Fatalf("another account received the run's live events: %v", ev)
	case <-time.After(300 * time.Millisecond):
	}
}
