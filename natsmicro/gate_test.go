package natsmicro_test

import (
	"strings"
	"testing"

	"github.com/nats-io/nats.go/micro"

	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/natsmicro"
)

// Deferred from review: the startup gate lived in natsserve, and rund mounts
// through natsmicro directly -- so rund was ungated. The gate belongs where every
// mount's subject already is. A raw mount outside the credential refuses to
// start here, naming the subject, with no tool layer in between.
func TestAMountOutsideTheCredentialRefusesToStart(t *testing.T) {
	e := estate.New(t)
	nc := e.Connect(t, estate.RoleTool) // permits weather tools and nothing else

	s, err := natsmicro.New(natsmicro.Config{Name: "probed", Version: "0.1.0", Logger: estate.Quiet()})
	if err != nil {
		t.Fatal(err)
	}
	if err := s.Mount("transfer", "garm.tool.payments.v1.transfer", micro.HandlerFunc(func(micro.Request) {})); err != nil {
		t.Fatal(err)
	}
	err = s.Start(nc)
	if err == nil {
		t.Fatal("Start succeeded with a mount the credential does not permit; it would never answer")
	}
	if !strings.Contains(err.Error(), "garm.tool.payments.v1.transfer") {
		t.Errorf("the refusal does not name the subject: %v", err)
	}
}

func TestAPermittedMountStarts(t *testing.T) {
	e := estate.New(t)
	nc := e.Connect(t, estate.RoleTool)
	s, err := natsmicro.New(natsmicro.Config{Name: "probed", Version: "0.1.0", Logger: estate.Quiet()})
	if err != nil {
		t.Fatal(err)
	}
	if err := s.Mount("forecast", "garm.tool.weather.v1.get_forecast", micro.HandlerFunc(func(micro.Request) {})); err != nil {
		t.Fatal(err)
	}
	if err := s.Start(nc); err != nil {
		t.Fatalf("a permitted mount was refused: %v", err)
	}
}
