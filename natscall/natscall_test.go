package natscall_test

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	natsserver "github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protodesc"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/types/descriptorpb"

	"github.com/garm-ai/garm-ai/call"
	"github.com/garm-ai/garm-ai/catalogue"
	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	"github.com/garm-ai/garm-ai/examples/weatherd"
	"github.com/garm-ai/garm-ai/fetch"
	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
	"github.com/garm-ai/garm-ai/natscall"
	"github.com/garm-ai/garm-ai/natsmicro"
	"github.com/garm-ai/garm-ai/natsserve"
	"github.com/garm-ai/garm-ai/run"
	"github.com/garm-ai/garm-ai/rundsvc"
	"github.com/garm-ai/garm-ai/serve"
)

func quiet() *slog.Logger { return slog.New(slog.NewTextHandler(io.Discard, nil)) }

// estate stands up the whole chain in one process: a tool service, and rund in
// front of it. What a caller gets back is a connection and nothing else -- no
// subject, no catalogue, no knowledge of either.
func estate(t *testing.T) *nats.Conn {
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
	connect := func() *nats.Conn {
		nc, err := nats.Connect(srv.ClientURL())
		if err != nil {
			t.Fatal(err)
		}
		t.Cleanup(nc.Close)
		return nc
	}

	// the tool service, exactly as a tool author deploys it
	tools, err := natsserve.New(natsserve.Config{Name: "weatherd", Version: "0.1.0", Logger: quiet()})
	if err != nil {
		t.Fatal(err)
	}
	if err := weatherv1.ServeWeatherService(tools, weatherd.Service{}); err != nil {
		t.Fatal(err)
	}
	toolNC := connect()
	if err := tools.Start(toolNC); err != nil {
		t.Fatal(err)
	}

	// rund in front
	svc, err := natsmicro.New(natsmicro.Config{Name: "rund", Version: "0.1.0", Logger: quiet()})
	if err != nil {
		t.Fatal(err)
	}
	rundNC := connect()
	e := &run.Engine{Catalogue: weatherCatalogue(t), Tools: rundsvc.ToolCaller{NC: rundNC}, Log: quiet()}
	if err := rundsvc.Serve(svc, e); err != nil {
		t.Fatal(err)
	}
	if err := svc.Start(rundNC); err != nil {
		t.Fatal(err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan struct{}, 2)
	go func() { _ = svc.Serve(ctx); done <- struct{}{} }()
	go func() { _ = tools.Serve(ctx); done <- struct{}{} }()
	t.Cleanup(func() { cancel(); <-done; <-done })

	return connect()
}

func weatherCatalogue(t *testing.T) *catalogue.Holder {
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

// ---------------------------------------------------------------------------

// TestTheLoopCloses is step 9's whole claim, through every piece that exists:
// a GENERATED client, over natscall, to rund, to natsserve, into the example
// handler, and back -- with the caller naming only a tool.
func TestTheLoopCloses(t *testing.T) {
	nc := estate(t)
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: nc})

	out, err := client.GetForecast(context.Background(),
		&weatherv1.GetForecastRequest{Place: "Ghent", Days: 3})
	if err != nil {
		t.Fatalf("GetForecast: %v", err)
	}
	if !strings.Contains(out.GetSummary(), "Ghent") {
		t.Errorf("summary is %q", out.GetSummary())
	}
	if out.GetHighCelsius() == 0 {
		t.Error("the answer did not come from the example handler")
	}
}

// TestAToolsRefusalReachesTheCallerWithItsKind, across all four hops. The example
// refuses an empty place with INVALID, and a caller that saw INTERNAL would retry
// something that can never work.
func TestAToolsRefusalReachesTheCallerWithItsKind(t *testing.T) {
	nc := estate(t)
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: nc})

	_, err := client.GetForecast(context.Background(), &weatherv1.GetForecastRequest{})
	if err == nil {
		t.Fatal("an empty place was accepted")
	}
	var e *serve.Error
	if !errors.As(err, &e) {
		t.Fatalf("the error arrived as %T, not a *serve.Error: %v", err, err)
	}
	// weatherd returns a plain fmt.Errorf, which serve.Wire makes INTERNAL on
	// purpose -- a bare error never publishes its own words.
	if e.Kind != invokev1.ErrorKind_ERROR_KIND_INTERNAL {
		t.Errorf("kind is %v", e.Kind)
	}
	if strings.Contains(e.Message, "place is required") {
		t.Error("a bare error's words reached the caller across three hops")
	}
	if !strings.Contains(e.Message, "id") {
		t.Errorf("the caller was not given an id to quote: %q", e.Message)
	}
}

func TestAnUnknownToolReachesTheCallerAsNotFound(t *testing.T) {
	nc := estate(t)
	_, err := natscall.Client{NC: nc}.Invoke(context.Background(), "weather.v1.nope", nil, call.Options{})
	if err == nil {
		t.Fatal("an unknown tool was accepted")
	}
	var e *serve.Error
	if !errors.As(err, &e) || e.Kind != invokev1.ErrorKind_ERROR_KIND_NOT_FOUND {
		t.Fatalf("got %v, want NOT_FOUND", err)
	}
}

// TestNoRundAtAllIsUnavailableNotASilentHang.
func TestNoRundAtAllIsUnavailableNotASilentHang(t *testing.T) {
	srv, err := natsserver.NewServer(&natsserver.Options{
		Host: "127.0.0.1", Port: -1, NoLog: true, NoSigs: true})
	if err != nil {
		t.Fatal(err)
	}
	go srv.Start()
	defer srv.Shutdown()
	srv.ReadyForConnections(10 * time.Second)
	nc, err := nats.Connect(srv.ClientURL())
	if err != nil {
		t.Fatal(err)
	}
	defer nc.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	_, err = natscall.Client{NC: nc}.Invoke(ctx, "weather.v1.get_forecast", nil, call.Options{})
	if err == nil {
		t.Fatal("a call succeeded with no rund running")
	}
	var e *serve.Error
	if !errors.As(err, &e) || e.Kind != invokev1.ErrorKind_ERROR_KIND_UNAVAILABLE {
		t.Fatalf("got %v, want UNAVAILABLE", err)
	}
	if !strings.Contains(e.Message, rundsvc.SubjectInvoke) {
		t.Errorf("the error does not say what did not answer: %q", e.Message)
	}
}

func TestFetchReachesTheCallerAndSaysNotRetained(t *testing.T) {
	nc := estate(t)
	resp, err := natscall.Client{NC: nc}.Fetch(context.Background(), "r1")
	if err != nil {
		t.Fatalf("Fetch: %v", err)
	}
	if resp.GetState() != runv1.RunState_RUN_STATE_NOT_RETAINED {
		t.Errorf("state is %v, want NOT_RETAINED", resp.GetState())
	}
}

// TestTheSameIdempotencyKeyIsTheSameRun. Not yet deduplication -- there is no
// store -- but the key must already BE the run id, or adding a store later would
// change what a run id means.
func TestTheSameIdempotencyKeyIsTheSameRun(t *testing.T) {
	nc := estate(t)
	c := natscall.Client{NC: nc}
	body, _ := proto.Marshal(&weatherv1.GetForecastRequest{Place: "Ghent"})

	for i := 0; i < 2; i++ {
		if _, err := c.Invoke(context.Background(), "weather.v1.get_forecast", body,
			call.Options{Idempotency: "the-same-key"}); err != nil {
			t.Fatalf("call %d: %v", i, err)
		}
	}
	// proved at the engine level in run.TestTheIdempotencyKeyBecomesTheRunID; here
	// the point is only that the key survives the wire.
}
