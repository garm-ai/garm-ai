// Package fixtures builds the catalogues the tests run against.
//
// Three consumers -- the test estate, the topology tests, the command tests --
// and before this package each had its own copy of the same descriptor walk.
// It imports `testing`, as the estate does, because its job is to fail a test.
package fixtures

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"os"
	"path/filepath"
	"testing"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protodesc"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/types/descriptorpb"

	"github.com/garm-ai/garm-ai/catalogue"
	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	"github.com/garm-ai/garm-ai/fetch"
	toolv1 "github.com/garm-ai/garm-ai/garm/tool/v1"
)

// SecondService is the proto service TwoServices adds beside the weather one.
const SecondService = "weather2.v1.WeatherService"

// SecondTool is the one tool SecondService declares. Its name carries the dash
// and underscore `declared` permits, so a subject built from it is checked literal.
const SecondTool = "weather-2.v1.get_forecast"

// Fixture is a loaded catalogue plus the facts a command's flags take for it.
type Fixture struct {
	*catalogue.Catalogue
	// Dir is what --catalogue-dir takes; URI and SHA what --catalogue and
	// --catalogue-sha256 take.
	Dir, URI, SHA string
}

// Weather is the examples namespace as shipped: one tool service, one agent.
func Weather(t testing.TB) Fixture {
	t.Helper()
	return Load(t, "weather.binpb", files(weatherv1.File_weather_v1_weather_proto))
}

// TwoServices is Weather plus a SECOND proto service cloned from the first into
// its own package, declaring SecondTool. Two services are what make "each may
// subscribe exactly its own tools" and "a revocation touches nobody else in the
// account" assertable at all.
func TwoServices(t testing.TB) Fixture {
	t.Helper()
	all := files(weatherv1.File_weather_v1_weather_proto)
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
	m.InputType = proto.String(".weather.v1.GetForecastRequest")
	m.OutputType = proto.String(".weather.v1.GetForecastResponse")
	tool := proto.Clone(proto.GetExtension(m.GetOptions(), toolv1.E_Tool).(*toolv1.Tool)).(*toolv1.Tool)
	tool.Name = SecondTool
	proto.SetExtension(m.Options, toolv1.E_Tool, tool)
	return Load(t, "two.binpb", append(all, clone))
}

// Empty has files but declares no tool: the catalogue after retiring everything.
func Empty(t testing.TB) Fixture {
	t.Helper()
	dep := weatherv1.File_weather_v1_weather_proto.Imports().Get(0).FileDescriptor
	return Load(t, "empty.binpb", files(dep))
}

// files is fd and everything it imports, as descriptor protos, each once.
func files(fd protoreflect.FileDescriptor) []*descriptorpb.FileDescriptorProto {
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
	add(fd)
	return all
}

// Load writes a real catalogue.binpb and loads it through the real resolver,
// digest and all -- a command is given a URI and a digest, so a test gives it the
// same thing a deployment does.
func Load(t testing.TB, name string, files []*descriptorpb.FileDescriptorProto) Fixture {
	t.Helper()
	raw, err := proto.Marshal(&descriptorpb.FileDescriptorSet{File: files})
	if err != nil {
		t.Fatal(err)
	}
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, name), raw, 0o600); err != nil {
		t.Fatal(err)
	}
	sum := sha256.Sum256(raw)
	uri, sha := "file://"+name, hex.EncodeToString(sum[:])
	c, err := catalogue.Load(context.Background(), &fetch.Resolver{Dir: dir}, fetch.Artefact{URI: uri, SHA256: sha})
	if err != nil {
		t.Fatal(err)
	}
	return Fixture{Catalogue: c, Dir: dir, URI: uri, SHA: sha}
}
