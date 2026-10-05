package natsserve_test

import (
	"context"
	"strings"
	"testing"

	"google.golang.org/protobuf/proto"

	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/natsserve"
)

// Property 8b: a service whose mount is not covered by its own credential refuses
// to start, naming the tool -- instead of starting cleanly and never answering.
//
// The subscription a server does not permit is refused ASYNCHRONOUSLY, after Start
// has returned; the service then looks healthy and answers nothing, the same
// silent shape as a missing _R_.> permission. The credential is in the process's
// own hands, so the check is local and deterministic (spec §4.3).
func TestAServiceRefusesToStartWhenAMountIsNotPermitted(t *testing.T) {
	e := estate.New(t)
	// The weather service's real credential: it permits weather tools and nothing else.
	nc := e.Connect(t, estate.RoleTool)

	s, err := natsserve.New(natsserve.Config{Name: "probed", Version: "0.1.0", Logger: quiet()})
	if err != nil {
		t.Fatal(err)
	}
	// A tool this credential does not cover.
	if err := s.Endpoint("payments.v1.transfer", "p.v1.P.T", 0,
		func() proto.Message { return new(weatherv1.GetForecastRequest) },
		func(context.Context, proto.Message) (proto.Message, error) { return nil, nil }); err != nil {
		t.Fatal(err)
	}
	err = s.Start(nc)
	if err == nil {
		t.Fatal("Start succeeded with a mount the credential does not permit; it would never answer")
	}
	if !strings.Contains(err.Error(), "payments.v1.transfer") {
		t.Errorf("the refusal does not name the tool: %v", err)
	}
}

// And the gate must not refuse what the credential DOES cover, or every service
// would fail to start -- the estate's own weatherd is that proof, since estate.New
// starts it through the same Start. This pins it explicitly.
func TestAServiceStartsWhenEveryMountIsPermitted(t *testing.T) {
	e := estate.New(t)
	nc := e.Connect(t, estate.RoleTool)
	s, err := natsserve.New(natsserve.Config{Name: "probed", Version: "0.1.0", Logger: quiet()})
	if err != nil {
		t.Fatal(err)
	}
	if err := s.Endpoint("weather.v1.get_forecast", "w.v1.W.G", 0,
		func() proto.Message { return new(weatherv1.GetForecastRequest) },
		func(context.Context, proto.Message) (proto.Message, error) { return nil, nil }); err != nil {
		t.Fatal(err)
	}
	if err := s.Start(nc); err != nil {
		t.Fatalf("a permitted mount was refused: %v", err)
	}
}
