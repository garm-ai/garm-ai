package topology_test

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"os"
	"path/filepath"
	"sort"
	"testing"
	"time"

	"github.com/nats-io/jwt/v2"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protodesc"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/types/descriptorpb"

	"github.com/garm-ai/garm-ai/catalogue"
	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	"github.com/garm-ai/garm-ai/fetch"
	"github.com/garm-ai/garm-ai/topology"
)

// weatherCatalogue is the examples namespace: two tools and one agent. The same
// construction internal/estate uses; duplicated here because topology must not
// import the estate (the estate imports topology).
func weatherCatalogue(t *testing.T) *catalogue.Catalogue {
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
	return load(t, "c.binpb", all)
}

// emptyCatalogue has files but declares nothing -- every service is retired.
func emptyCatalogue(t *testing.T) *catalogue.Catalogue {
	t.Helper()
	dep := weatherv1.File_weather_v1_weather_proto.Imports().Get(0).FileDescriptor
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
	add(dep)
	return load(t, "e.binpb", all)
}

func load(t *testing.T, name string, files []*descriptorpb.FileDescriptorProto) *catalogue.Catalogue {
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
	c, err := catalogue.Load(context.Background(), &fetch.Resolver{Dir: dir},
		fetch.Artefact{URI: "file://" + name, SHA256: hex.EncodeToString(sum[:])})
	if err != nil {
		t.Fatal(err)
	}
	return c
}

func generate(t *testing.T, callers ...string) *topology.Output {
	t.Helper()
	out, err := topology.Generate(topology.Input{
		Catalogue: weatherCatalogue(t),
		Callers:   callers,
		Previous:  topology.Empty(),
		Keys:      topology.FreshKeys(callers),
		Now:       time.Date(2026, 10, 4, 12, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatalf("Generate: %v", err)
	}
	return out
}

func credential(t *testing.T, out *topology.Output, name string) *jwt.UserClaims {
	t.Helper()
	for _, c := range out.Credentials {
		if c.Name == name {
			uc, err := jwt.DecodeUserClaims(c.JWT)
			if err != nil {
				t.Fatal(err)
			}
			return uc
		}
	}
	t.Fatalf("no credential named %q; have %v", name, names(out))
	return nil
}

func names(out *topology.Output) []string {
	var ns []string
	for _, c := range out.Credentials {
		ns = append(ns, c.Name)
	}
	sort.Strings(ns)
	return ns
}

// Property 9: exactly one subscribe permission per DECLARED tool, and no others.
func TestAToolServiceMaySubscribeExactlyItsDeclaredTools(t *testing.T) {
	out := generate(t, "studio")
	uc := credential(t, out, "weather.v1.WeatherService")

	got := append([]string(nil), uc.Permissions.Sub.Allow...)
	sort.Strings(got)
	want := []string{
		"$SRV.>", // micro's discovery subjects, or AddService fails
		"garm.tool.weather.v1.get_forecast",
	}
	if len(got) != len(want) {
		t.Fatalf("subscribe allow is %v, want %v", got, want)
	}
	for i := range want {
		if got[i] != want[i] {
			t.Errorf("subscribe allow[%d] = %q, want %q", i, got[i], want[i])
		}
	}
	if uc.Permissions.Sub.Deny != nil {
		t.Errorf("deny list present: %v -- an allow list is the whole policy", uc.Permissions.Sub.Deny)
	}
}

// Spec §4.1: _R_.> or the tool receives the call and is silently refused the reply.
func TestAToolServiceMayPublishTheCrossAccountReply(t *testing.T) {
	out := generate(t, "studio")
	uc := credential(t, out, "weather.v1.WeatherService")
	pub := map[string]bool{}
	for _, s := range uc.Permissions.Pub.Allow {
		pub[s] = true
	}
	if !pub["_R_.>"] {
		t.Fatalf("publish allow %v lacks _R_.> -- every reply would be refused and every caller would time out",
			uc.Permissions.Pub.Allow)
	}
	if !pub["_INBOX.>"] {
		t.Errorf("publish allow lacks _INBOX.> -- micro's $SRV replies would be refused")
	}
	if pub["garm.tool.>"] || pub[">"] {
		t.Errorf("a tool service may publish on tool subjects: %v", uc.Permissions.Pub.Allow)
	}
}

// Review Focus 1: a service whose only methods are agents gets NO user.
//
// Asserted as the EXACT set, not the absence of one name: the first version
// looked for "trips.v1.TripService", a service that does not exist, and passed
// vacuously. The agent-only service is trips.v1.TripPlannerService.
func TestAnAgentOnlyServiceGetsNoCredential(t *testing.T) {
	out := generate(t, "studio")
	got := names(out)
	want := []string{"ops", "rund", "studio", "weather.v1.WeatherService"}
	if len(got) != len(want) {
		t.Fatalf("credentials issued: %v, want exactly %v", got, want)
	}
	for i := range want {
		if got[i] != want[i] {
			t.Fatalf("credentials issued: %v, want exactly %v", got, want)
		}
	}
}

// Property 12: every credential carries the catalogue digest and generation.
func TestEveryCredentialCarriesItsCatalogueDigestAndGeneration(t *testing.T) {
	out := generate(t, "studio")
	cat := weatherCatalogue(t)
	for _, c := range out.Credentials {
		uc, err := jwt.DecodeUserClaims(c.JWT)
		if err != nil {
			t.Fatal(err)
		}
		var sawDigest, sawGen bool
		for _, tag := range uc.Tags {
			if tag == "catalogue:"+cat.SHA256 {
				sawDigest = true
			}
			if tag == "generation:1" {
				sawGen = true
			}
		}
		if !sawDigest || !sawGen {
			t.Errorf("%s: tags %v lack the digest or generation", c.Name, uc.Tags)
		}
	}
}

// Review Focus 4: a caller may not shadow an account name.
func TestACallerNamedLikeAnAccountIsRefused(t *testing.T) {
	for _, bad := range []string{"SYS", "GARM", "TOOLS", "sys"} {
		_, err := topology.Generate(topology.Input{
			Catalogue: weatherCatalogue(t), Callers: []string{bad},
			Previous: topology.Empty(), Keys: topology.FreshKeys([]string{bad}),
			Now: time.Now(),
		})
		if err == nil {
			t.Errorf("caller %q was accepted", bad)
		}
	}
}

// rund's own permissions (§4.5): the wildcard import, both run patterns, and the
// cross-account reply it owes callers.
func TestRundMayPublishEveryToolAndAnswerEveryCaller(t *testing.T) {
	out := generate(t, "studio")
	uc := credential(t, out, "rund")
	pub, sub := map[string]bool{}, map[string]bool{}
	for _, s := range uc.Permissions.Pub.Allow {
		pub[s] = true
	}
	for _, s := range uc.Permissions.Sub.Allow {
		sub[s] = true
	}
	for _, want := range []string{"garm.tool.>", "_R_.>", "_INBOX.>"} {
		if !pub[want] {
			t.Errorf("rund cannot publish %s: %v", want, uc.Permissions.Pub.Allow)
		}
	}
	for _, want := range []string{"garm.run.v1.*.>", "_INBOX.>", "$SRV.>"} {
		if !sub[want] {
			t.Errorf("rund cannot subscribe %s: %v", want, uc.Permissions.Sub.Allow)
		}
	}
}

// The export that the whole design rests on, as the account JWT actually encodes it.
func TestGARMExportsTheRunServiceWithTheAccountTokenAtPositionFour(t *testing.T) {
	out := generate(t, "studio")
	ac, err := jwt.DecodeAccountClaims(out.Accounts[topology.AccountGARM])
	if err != nil {
		t.Fatal(err)
	}
	var found bool
	for _, e := range ac.Exports {
		if e.Subject == "garm.run.v1.*.>" {
			found = true
			if e.AccountTokenPosition != 4 {
				t.Errorf("token position is %d, want 4", e.AccountTokenPosition)
			}
			if e.Type != jwt.Service {
				t.Errorf("export is %v, want a service", e.Type)
			}
		}
	}
	if !found {
		t.Fatalf("GARM does not export garm.run.v1.*.>: %v", ac.Exports)
	}
}

func TestTOOLSExportsPrivatelyAndOnlyGARMImportsIt(t *testing.T) {
	out := generate(t, "studio")
	tools, err := jwt.DecodeAccountClaims(out.Accounts[topology.AccountTOOLS])
	if err != nil {
		t.Fatal(err)
	}
	if len(tools.Exports) != 1 || tools.Exports[0].Subject != "garm.tool.>" || !tools.Exports[0].TokenReq {
		t.Fatalf("TOOLS exports %v; want one private service export of garm.tool.>", tools.Exports)
	}
	for name, encoded := range out.Accounts {
		ac, err := jwt.DecodeAccountClaims(encoded)
		if err != nil {
			t.Fatal(err)
		}
		for _, im := range ac.Imports {
			if im.Subject == "garm.tool.>" && name != topology.AccountGARM {
				t.Errorf("%s imports garm.tool.>; only GARM may", name)
			}
		}
	}
}
