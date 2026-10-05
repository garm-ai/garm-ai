package rundsvc_test

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"

	natsserver "github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/micro"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protodesc"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/types/descriptorpb"

	"github.com/garm-ai/garm-ai/catalogue"
	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	"github.com/garm-ai/garm-ai/examples/weatherd"
	"github.com/garm-ai/garm-ai/fetch"
	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
	toolv1 "github.com/garm-ai/garm-ai/garm/tool/v1"
	"github.com/garm-ai/garm-ai/natsmicro"
	"github.com/garm-ai/garm-ai/natsserve"
	"github.com/garm-ai/garm-ai/run"
	"github.com/garm-ai/garm-ai/observe/otlp/otlptest"
	"github.com/garm-ai/garm-ai/rundsvc"
	"github.com/garm-ai/garm-ai/serve"
)

// asRewritten is what the server delivers to rund after a caller's account import
// inserts its key at token 4. These tests run on a bare server with no accounts,
// so the test does the rewrite the import would -- the estate tests cover the
// real mapping.
func asRewritten(subject string) string {
	return strings.Replace(subject, "garm.run.v1.", "garm.run.v1.ATESTACCOUNT.", 1)
}

func quiet() *slog.Logger { return slog.New(slog.NewTextHandler(io.Discard, nil)) }

func server(t *testing.T) string {
	t.Helper()
	srv, err := natsserver.NewServer(&natsserver.Options{
		Host: "127.0.0.1", Port: -1, NoLog: true, NoSigs: true})
	if err != nil {
		t.Fatal(err)
	}
	go srv.Start()
	t.Cleanup(srv.Shutdown)
	if !srv.ReadyForConnections(10 * time.Second) {
		t.Fatal("nats-server not ready")
	}
	return srv.ClientURL()
}

func connect(t *testing.T, url string) *nats.Conn {
	t.Helper()
	nc, err := nats.Connect(url)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(nc.Close)
	return nc
}

// theCatalogue is the real examples namespace: the weather tool, plus an agent and
// an async tool so the refusal paths are exercised against real declarations.
func theCatalogue(t *testing.T) *catalogue.Holder {
	t.Helper()
	weather := weatherv1.File_weather_v1_weather_proto
	var all []*descriptorpb.FileDescriptorProto
	seen := map[string]bool{}
	var add func(fd protoreflect.FileDescriptor)
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
	add(weather)

	// an async tool and an agent, declared the way a real proto would
	opts := func(tool *toolv1.Tool) *descriptorpb.MethodOptions {
		o := &descriptorpb.MethodOptions{}
		proto.SetExtension(o, toolv1.E_Tool, tool)
		return o
	}
	extra := &descriptorpb.FileDescriptorProto{
		Name: proto.String("extra/v1/extra.proto"), Package: proto.String("extra.v1"),
		Syntax: proto.String("proto3"), Dependency: []string{"garm/tool/v1/tool.proto"},
		MessageType: []*descriptorpb.DescriptorProto{
			{Name: proto.String("Req")}, {Name: proto.String("Res")}},
		Service: []*descriptorpb.ServiceDescriptorProto{{
			Name: proto.String("ExtraService"),
			Method: []*descriptorpb.MethodDescriptorProto{
				{Name: proto.String("Freeze"), InputType: proto.String(".extra.v1.Req"),
					OutputType: proto.String(".extra.v1.Res"),
					Options: opts(&toolv1.Tool{Name: "extra.v1.freeze",
						Delivery: &toolv1.Tool_Async{Async: &toolv1.Async{}}})},
				{Name: proto.String("Plan"), InputType: proto.String(".extra.v1.Req"),
					OutputType: proto.String(".extra.v1.Res"),
					Options: opts(&toolv1.Tool{Name: "extra.v1.planner",
						Delivery: &toolv1.Tool_Async{Async: &toolv1.Async{}},
						Agent: &toolv1.Agent{Tools: []*toolv1.ToolRef{
							{Name: "weather.v1.get_forecast"}}}})},
			}}},
	}
	all = append(all, extra)

	raw, err := proto.Marshal(&descriptorpb.FileDescriptorSet{File: all})
	if err != nil {
		t.Fatal(err)
	}
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "c.binpb"), raw, 0o600); err != nil {
		t.Fatal(err)
	}
	sum := sha256.Sum256(raw)
	c, err := catalogue.Load(context.Background(), &fetch.Resolver{Dir: dir},
		fetch.Artefact{URI: "file://c.binpb", SHA256: hex.EncodeToString(sum[:])})
	if err != nil {
		t.Fatalf("loading: %v", err)
	}
	var h catalogue.Holder
	h.Set(c)
	return &h
}

// bareServer stands up the whole chain on an OPEN server -- no accounts, no TLS.
// The subject rewrite an account import does is done by hand here (asRewritten);
// internal/estate is where the real topology is exercised.
func bareServer(t *testing.T) (caller *nats.Conn, stop func()) {
	t.Helper()
	url := server(t)

	// the tool service, exactly as a tool author deploys it
	toolNC := connect(t, url)
	tools, err := natsserve.New(natsserve.Config{Name: "weatherd", Version: "0.1.0", Logger: quiet()})
	if err != nil {
		t.Fatal(err)
	}
	if err := weatherv1.ServeWeatherService(tools, weatherd.Service{}); err != nil {
		t.Fatal(err)
	}
	if err := tools.Start(toolNC); err != nil {
		t.Fatal(err)
	}

	// rund in front
	rundNC := connect(t, url)
	svc, err := natsmicro.New(natsmicro.Config{Name: "rund", Version: "0.1.0", Logger: quiet()})
	if err != nil {
		t.Fatal(err)
	}
	e := &run.Engine{Catalogue: theCatalogue(t), Tools: rundsvc.ToolCaller{NC: rundNC}, Log: quiet()}
	if err := rundsvc.Serve(svc, e, nil); err != nil {
		t.Fatal(err)
	}
	if err := svc.Start(rundNC); err != nil {
		t.Fatal(err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan struct{}, 2)
	go func() { _ = svc.Serve(ctx); done <- struct{}{} }()
	go func() { _ = tools.Serve(ctx); done <- struct{}{} }()
	stopped := false
	stop = func() {
		if stopped {
			return
		}
		stopped = true
		cancel()
		<-done
		<-done
	}
	t.Cleanup(stop)
	return connect(t, url), stop
}

func invoke(t *testing.T, nc *nats.Conn, tool string, in proto.Message, hdr map[string]string) *nats.Msg {
	t.Helper()
	body, err := proto.Marshal(in)
	if err != nil {
		t.Fatal(err)
	}
	req, err := proto.Marshal(&runv1.InvokeRequest{Tool: tool, Input: body})
	if err != nil {
		t.Fatal(err)
	}
	m := nats.NewMsg(asRewritten(rundsvc.SubjectInvoke))
	m.Data = req
	for k, v := range hdr {
		m.Header.Set(k, v)
	}
	reply, err := nc.RequestMsg(m, 10*time.Second)
	if err != nil {
		t.Fatalf("invoking %s: %v", tool, err)
	}
	return reply
}

// ---------------------------------------------------------------------------

// TestACallerReachesAToolWithoutKnowingItsSubject is step 9b's whole property:
// garm.run.v1.invoke with a NAME, and the answer comes back from a tool service the
// caller never addressed.
func TestACallerReachesAToolWithoutKnowingItsSubject(t *testing.T) {
	nc, _ := bareServer(t)

	reply := invoke(t, nc, "weather.v1.get_forecast",
		&weatherv1.GetForecastRequest{Place: "Ghent", Days: 3}, nil)

	if code := reply.Header.Get(micro.ErrorCodeHeader); code != "" {
		t.Fatalf("invoke failed with %s: %s", code, reply.Header.Get(micro.ErrorHeader))
	}
	var resp runv1.InvokeResponse
	if err := proto.Unmarshal(reply.Data, &resp); err != nil {
		t.Fatal(err)
	}
	if resp.GetRunId() == "" {
		t.Error("no run id came back")
	}
	var out weatherv1.GetForecastResponse
	if err := proto.Unmarshal(resp.GetResult(), &out); err != nil {
		t.Fatalf("the result is not a GetForecastResponse: %v", err)
	}
	if !strings.Contains(out.GetSummary(), "Ghent") || out.GetHighCelsius() == 0 {
		t.Fatalf("the answer did not come from the example handler: %v", &out)
	}
}

// TestTheIdChainReachesTheToolAcrossTwoHops. Correlation spans; causation chains.
func TestTheIdChainReachesTheToolAcrossTwoHops(t *testing.T) {
	otlptest.Install(t) // a real propagator, so the trace crosses the hop
	url := server(t)

	// a bare subscriber standing in for a tool, so the headers rund SENT are
	// observable rather than inferred
	toolNC := connect(t, url)
	var (
		mu   sync.Mutex
		seen nats.Header
	)
	sub, err := toolNC.Subscribe(natsserve.Subject("weather.v1.get_forecast"), func(m *nats.Msg) {
		mu.Lock()
		seen = m.Header
		mu.Unlock()
		out, _ := proto.Marshal(&weatherv1.GetForecastResponse{Summary: "x", HighCelsius: 1})
		_ = m.Respond(out)
	})
	if err != nil {
		t.Fatal(err)
	}
	defer sub.Unsubscribe()

	rundNC := connect(t, url)
	svc, _ := natsmicro.New(natsmicro.Config{Name: "rund", Version: "0.1.0", Logger: quiet()})
	e := &run.Engine{Catalogue: theCatalogue(t), Tools: rundsvc.ToolCaller{NC: rundNC}, Log: quiet()}
	if err := rundsvc.Serve(svc, e, nil); err != nil {
		t.Fatal(err)
	}
	if err := svc.Start(rundNC); err != nil {
		t.Fatal(err)
	}
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go func() { _ = svc.Serve(ctx) }()

	nc := connect(t, url)
	invoke(t, nc, "weather.v1.get_forecast", &weatherv1.GetForecastRequest{Place: "x"},
		map[string]string{
			rundsvc.HeaderCorrelation: "c1",
			rundsvc.HeaderMessage:     "m0",
			// A VALID W3C header: the propagator rejects anything else, and the
			// claim here is that a trace is CONTINUED, not copied.
			rundsvc.HeaderTraceparent: "00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01",
			rundsvc.HeaderIdempotency: "key-1",
		})

	mu.Lock()
	defer mu.Unlock()
	if got := seen.Get(rundsvc.HeaderCorrelation); got != "c1" {
		t.Errorf("correlation reached the tool as %q, want c1", got)
	}
	if got := seen.Get(rundsvc.HeaderCausation); got != "m0" {
		t.Errorf("causation reached the tool as %q, want the caller's message id", got)
	}
	if got := seen.Get(rundsvc.HeaderMessage); got == "m0" || got == "" {
		t.Errorf("rund reused the caller's message id (%q) instead of minting one", got)
	}
	// The trace is the caller's; the parent span is RUND's, not the caller's --
	// the tool is this hop's child (observability spec §1.2).
	if got := seen.Get(rundsvc.HeaderTraceparent); !strings.Contains(got, "0af7651916cd43dd8448eb211c80319c") || strings.Contains(got, "b7ad6b7169203331") {
		t.Errorf("traceparent reached the tool as %q; want the caller's trace under rund's own span", got)
	}
	// the run's key is key-1; a tool call's key must be derived from it, not equal
	if got := seen.Get(rundsvc.HeaderIdempotency); got == "key-1" || !strings.HasPrefix(got, "key-1:") {
		t.Errorf("the tool call's idempotency key is %q, want it derived from the run id", got)
	}
}

func TestAnUnknownToolIsNotFound(t *testing.T) {
	nc, _ := bareServer(t)
	reply := invoke(t, nc, "weather.v1.nope", &weatherv1.GetForecastRequest{}, nil)

	code := reply.Header.Get(micro.ErrorCodeHeader)
	if code != serve.Code(invokev1.ErrorKind_ERROR_KIND_NOT_FOUND) {
		t.Fatalf("code is %q, want NOT_FOUND", code)
	}
}

// TestAnAsyncToolIsRefusedBecauseThereIsNoStore, and says so -- rather than
// pretending the tool does not exist, which a caller would act on wrongly.
func TestAnAsyncToolIsRefusedBecauseThereIsNoStore(t *testing.T) {
	nc, _ := bareServer(t)
	// An async tool needs the store; an agent needs a decider, which no build
	// has yet. Each refusal names its own missing piece.
	for tool, why := range map[string]string{"extra.v1.freeze": "run store", "extra.v1.planner": "decider"} {
		reply := invoke(t, nc, tool, &weatherv1.GetForecastRequest{}, nil)
		code := reply.Header.Get(micro.ErrorCodeHeader)
		if code != serve.Code(invokev1.ErrorKind_ERROR_KIND_UNAVAILABLE) {
			t.Errorf("%s: code is %q, want UNAVAILABLE", tool, code)
		}
		if msg := reply.Header.Get(micro.ErrorHeader); !strings.Contains(msg, why) {
			t.Errorf("%s: the message does not say why: %q", tool, msg)
		}
	}
}

func TestFetchSaysNotRetained(t *testing.T) {
	nc, _ := bareServer(t)
	body, _ := proto.Marshal(&runv1.FetchRequest{RunId: "r1"})
	m := nats.NewMsg(asRewritten(rundsvc.SubjectFetch))
	m.Data = body
	reply, err := nc.RequestMsg(m, 5*time.Second)
	if err != nil {
		t.Fatal(err)
	}
	var resp runv1.FetchResponse
	if err := proto.Unmarshal(reply.Data, &resp); err != nil {
		t.Fatal(err)
	}
	if resp.GetState() != runv1.RunState_RUN_STATE_NOT_RETAINED {
		t.Errorf("state is %v, want NOT_RETAINED", resp.GetState())
	}
}

// There is deliberately NO test that a caller cannot address garm.tool.<name>
// directly, because it can.
//
// The first attempt at one sent an InvokeRequest to a tool subject expecting it to
// be rejected. It was accepted: InvokeRequest's field 1 is a string and
// GetForecastRequest's field 1 is a string, so the bytes are wire-compatible and
// the tool cheerfully forecast the weather for a place called
// "weather.v1.get_forecast". Protobuf cannot tell two compatible messages apart,
// and no test here can either.
//
// The two-layer separation is therefore a CONVENTION today, not an enforced
// property. What would enforce it is NATS account permissions -- only rund's
// credential allowed to publish on garm.tool.> -- which is recorded in
// docs/invariants.md's unenforced table rather than asserted here.
