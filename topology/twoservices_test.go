package topology_test

import (
	"sort"
	"testing"
	"time"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protodesc"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/types/descriptorpb"

	"github.com/garm-ai/garm-ai/catalogue"
	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	toolv1 "github.com/garm-ai/garm-ai/garm/tool/v1"
	"github.com/garm-ai/garm-ai/topology"
)

// twoServiceCatalogue is the weather namespace plus a SECOND proto service,
// cloned from the first into package weather2.v1 and declaring one tool named
// "weather-2.v1.get_forecast" -- a name with the dash and underscore `declared`
// permits, so that the subject the generator emits for it is checked literal.
//
// Review Focus 2 was waived in the plan's self-review on the grounds that property
// 9's exact list "would show a second service's tools". With one service in the
// fixture there was no second service whose tools could appear, so nothing could
// fail. This is the fixture that makes it able to.
func twoServiceCatalogue(t *testing.T) *catalogue.Catalogue {
	t.Helper()
	var all []*descriptorpb.FileDescriptorProto
	seen := map[string]bool{}
	var add func(protoreflect.FileDescriptor)
	add = func(fd protoreflect.FileDescriptor) {
		if seen[fd.Path()] {
			return
		}
		seen[fd.Path()] = true
		for i := 0; i < fd.Imports().Len(); i++ {
			add(fd.Imports().Get(i).FileDescriptor)
		}
		all = append(all, protodesc.ToFileDescriptorProto(fd))
	}
	add(weatherv1.File_weather_v1_weather_proto)

	// The clone: same service shape, its own package and file, its messages
	// borrowed from weather.v1 by import, its one tool renamed.
	orig := protodesc.ToFileDescriptorProto(weatherv1.File_weather_v1_weather_proto)
	clone := proto.Clone(orig).(*descriptorpb.FileDescriptorProto)
	clone.Name = proto.String("weather2/v1/weather2.proto")
	clone.Package = proto.String("weather2.v1")
	clone.MessageType = nil
	clone.Dependency = append(clone.Dependency, orig.GetName())
	if len(clone.Service) != 1 || len(clone.Service[0].Method) != 1 {
		t.Fatalf("the weather example changed shape: %d services, %d methods", len(clone.Service), len(clone.Service[0].Method))
	}
	m := clone.Service[0].Method[0]
	m.InputType = proto.String(".weather.v1." + nameOf(orig.GetMessageType(), "GetForecastRequest"))
	m.OutputType = proto.String(".weather.v1." + nameOf(orig.GetMessageType(), "GetForecastResponse"))
	tool := proto.Clone(proto.GetExtension(m.GetOptions(), toolv1.E_Tool).(*toolv1.Tool)).(*toolv1.Tool)
	tool.Name = "weather-2.v1.get_forecast"
	proto.SetExtension(m.Options, toolv1.E_Tool, tool)
	all = append(all, clone)
	return load(t, "two.binpb", all)
}

func nameOf(msgs []*descriptorpb.DescriptorProto, want string) string {
	for _, m := range msgs {
		if m.GetName() == want {
			return want
		}
	}
	return want
}

// Review Focus 2: two services, two users, each with exactly its own subjects.
// Review Focus 5: a name with the charset `declared` permits yields a literal
// subject -- no wildcard, no escaping, no re-validation.
func TestTwoServicesGetTwoCredentialsWithDisjointSubjects(t *testing.T) {
	out, err := topology.Generate(topology.Input{
		Catalogue: twoServiceCatalogue(t), Callers: []string{"studio"},
		Previous: topology.Empty(), Keys: topology.FreshKeys([]string{"studio"}), Now: time.Now(),
	})
	if err != nil {
		t.Fatalf("Generate: %v", err)
	}
	a := credential(t, out, "weather.v1.WeatherService")
	b := credential(t, out, "weather2.v1.WeatherService")

	subs := func(allow []string) []string {
		s := append([]string(nil), allow...)
		sort.Strings(s)
		return s
	}
	wantA := []string{"$SRV.>", "garm.tool.weather.v1.get_forecast"}
	wantB := []string{"$SRV.>", "garm.tool.weather-2.v1.get_forecast"}
	if got := subs(a.Permissions.Sub.Allow); len(got) != 2 || got[0] != wantA[0] || got[1] != wantA[1] {
		t.Errorf("weather.v1.WeatherService may subscribe %v, want %v", got, wantA)
	}
	if got := subs(b.Permissions.Sub.Allow); len(got) != 2 || got[0] != wantB[0] || got[1] != wantB[1] {
		t.Errorf("weather2.v1.WeatherService may subscribe %v, want %v", got, wantB)
	}
	for _, s := range a.Permissions.Sub.Allow {
		if s == "garm.tool.weather-2.v1.get_forecast" {
			t.Error("the first service may subscribe to the second's tool")
		}
	}
}
