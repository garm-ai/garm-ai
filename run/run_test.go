package run_test

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protodesc"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/types/descriptorpb"
	"google.golang.org/protobuf/types/known/durationpb"

	"github.com/garm-ai/garm-ai/catalogue"
	"github.com/garm-ai/garm-ai/fetch"
	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
	toolv1 "github.com/garm-ai/garm-ai/garm/tool/v1"
	"github.com/garm-ai/garm-ai/run"
	"github.com/garm-ai/garm-ai/serve"
)

// ---- a catalogue on disk, built from real MethodOptions ----

func fdp(fd protoreflect.FileDescriptor) *descriptorpb.FileDescriptorProto {
	return protodesc.ToFileDescriptorProto(fd)
}

func catalogueOf(t *testing.T, tools ...*toolv1.Tool) *catalogue.Holder {
	t.Helper()
	var methods []*descriptorpb.MethodDescriptorProto
	for i, tool := range tools {
		opts := &descriptorpb.MethodOptions{}
		proto.SetExtension(opts, toolv1.E_Tool, tool)
		methods = append(methods, &descriptorpb.MethodDescriptorProto{
			Name:       proto.String(fmt.Sprintf("M%d", i)),
			InputType:  proto.String(".probe.v1.Req"),
			OutputType: proto.String(".probe.v1.Res"),
			Options:    opts,
		})
	}
	own := &descriptorpb.FileDescriptorProto{
		Name: proto.String("probe/v1/probe.proto"), Package: proto.String("probe.v1"),
		Syntax: proto.String("proto3"), Dependency: []string{"garm/tool/v1/tool.proto"},
		MessageType: []*descriptorpb.DescriptorProto{
			{Name: proto.String("Req")}, {Name: proto.String("Res")}},
		Service: []*descriptorpb.ServiceDescriptorProto{
			{Name: proto.String("ProbeService"), Method: methods}},
	}
	tool := toolv1.File_garm_tool_v1_tool_proto
	var all []*descriptorpb.FileDescriptorProto
	for i := 0; i < tool.Imports().Len(); i++ {
		all = append(all, fdp(tool.Imports().Get(i).FileDescriptor))
	}
	all = append(all, fdp(tool), own)

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
		t.Fatalf("loading the catalogue: %v", err)
	}
	var h catalogue.Holder
	h.Set(c)
	return &h
}

func syncTool(name string, d time.Duration) *toolv1.Tool {
	return &toolv1.Tool{Name: name, Delivery: &toolv1.Tool_Sync{
		Sync: &toolv1.Sync{Budget: durationpb.New(d)}}}
}

// requiring is a tool with a requirement: the authority model's half of a
// declaration. The two builders below stay requirement-less, so a test that
// does not care about authority is unchanged.
func requiring(t *toolv1.Tool, compartments ...string) *toolv1.Tool {
	t.Requires = &toolv1.Requirement{Compartments: compartments}
	return t
}

func asyncTool(name string) *toolv1.Tool {
	return &toolv1.Tool{Name: name, Delivery: &toolv1.Tool_Async{Async: &toolv1.Async{Limit: durationpb.New(time.Minute)}}}
}
func agent(name string, allow ...string) *toolv1.Tool {
	refs := make([]*toolv1.ToolRef, 0, len(allow))
	for _, a := range allow {
		refs = append(refs, &toolv1.ToolRef{Name: a})
	}
	return &toolv1.Tool{Name: name, Delivery: &toolv1.Tool_Async{Async: &toolv1.Async{}},
		Agent: &toolv1.Agent{Tools: refs}}
}

// ---- a Caller that records what the engine asked of it ----

type callRecord struct {
	tool    string
	input   []byte
	budget  time.Duration
	headers run.Headers
}

type caller struct {
	mu    sync.Mutex
	calls []callRecord
	out   []byte
	err   error
}

func (c *caller) Call(_ context.Context, tool string, input []byte, budget time.Duration, h run.Headers) ([]byte, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.calls = append(c.calls, callRecord{tool, input, budget, h})
	return c.out, c.err
}

func quiet() *slog.Logger { return slog.New(slog.NewTextHandler(io.Discard, nil)) }

func engine(h *catalogue.Holder, c *caller) *run.Engine {
	n := 0
	return &run.Engine{Catalogue: h, Tools: c, Log: quiet(),
		NewID: func() string { n++; return fmt.Sprintf("id%d", n) }}
}

// ---------------------------------------------------------------------------

func TestASyncToolIsCalledWithItsDeclaredBudget(t *testing.T) {
	h := catalogueOf(t, syncTool("probe.v1.read", 2*time.Second))
	c := &caller{out: []byte("answer")}
	e := engine(h, c)

	resp, failure := e.Invoke(context.Background(),
		&runv1.InvokeRequest{Tool: "probe.v1.read", Input: []byte("req")}, run.Headers{Message: "m0"})
	if failure != nil {
		t.Fatalf("Invoke failed: %v", failure)
	}
	if string(resp.GetResult()) != "answer" {
		t.Errorf("result is %q", resp.GetResult())
	}
	if len(c.calls) != 1 {
		t.Fatalf("made %d tool calls, want 1", len(c.calls))
	}
	got := c.calls[0]
	if got.tool != "probe.v1.read" || string(got.input) != "req" {
		t.Errorf("called %q with %q", got.tool, got.input)
	}
	// THE DECLARED budget, read from the catalogue rather than invented.
	if got.budget != 2*time.Second {
		t.Errorf("budget passed to the tool is %v, want 2s", got.budget)
	}
}

// TestTheIdempotencyKeyBecomesTheRunID: a retry must be the same run, which only
// works if the CALLER supplies the key. An id rund invents deduplicates nothing.
func TestTheIdempotencyKeyBecomesTheRunID(t *testing.T) {
	h := catalogueOf(t, syncTool("probe.v1.read", time.Second))
	c := &caller{out: []byte("x")}
	e := engine(h, c)

	resp, failure := e.Invoke(context.Background(),
		&runv1.InvokeRequest{Tool: "probe.v1.read"}, run.Headers{Idempotency: "caller-key-1"})
	if failure != nil {
		t.Fatal(failure)
	}
	if resp.GetRunId() != "caller-key-1" {
		t.Errorf("run id is %q, want the supplied key", resp.GetRunId())
	}
}

func TestWithNoKeyARunIDIsMinted(t *testing.T) {
	h := catalogueOf(t, syncTool("probe.v1.read", time.Second))
	e := engine(h, &caller{out: []byte("x")})
	resp, failure := e.Invoke(context.Background(), &runv1.InvokeRequest{Tool: "probe.v1.read"}, run.Headers{})
	if failure != nil {
		t.Fatal(failure)
	}
	if resp.GetRunId() == "" {
		t.Error("no run id was minted")
	}
}

// TestAToolCallGetsItsOwnKeyNotTheRunsOwn. One run may call tools several times,
// so a key per STEP is what makes a replay safe -- reusing the run's own key would
// make a second call look like a duplicate of the first.
func TestAToolCallGetsItsOwnKeyNotTheRunsOwn(t *testing.T) {
	h := catalogueOf(t, syncTool("probe.v1.read", time.Second))
	c := &caller{out: []byte("x")}
	e := engine(h, c)

	_, failure := e.Invoke(context.Background(),
		&runv1.InvokeRequest{Tool: "probe.v1.read"}, run.Headers{Idempotency: "r1", Message: "m0"})
	if failure != nil {
		t.Fatal(failure)
	}
	key := c.calls[0].headers.Idempotency
	if key == "r1" {
		t.Error("the tool call reused the run's own key, so a second call would look like a duplicate")
	}
	if !strings.HasPrefix(key, "r1:") {
		t.Errorf("the tool call key is %q, want it derived from the run id", key)
	}
}

// TestCausationChainsAndCorrelationSpans. A shared correlation id says these calls
// belong together; only causation says what caused what.
func TestCausationChainsAndCorrelationSpans(t *testing.T) {
	h := catalogueOf(t, syncTool("probe.v1.read", time.Second))
	c := &caller{out: []byte("x")}
	e := engine(h, c)

	_, failure := e.Invoke(context.Background(), &runv1.InvokeRequest{Tool: "probe.v1.read"},
		run.Headers{Correlation: "c1", Message: "m0", Traceparent: "00-abc-def-01"})
	if failure != nil {
		t.Fatal(failure)
	}
	h0 := c.calls[0].headers
	if h0.Correlation != "c1" {
		t.Errorf("correlation is %q, want it carried through", h0.Correlation)
	}
	if h0.Causation != "m0" {
		t.Errorf("causation is %q, want the caller's message id", h0.Causation)
	}
	if h0.Message == "m0" || h0.Message == "" {
		t.Errorf("the tool call reused the caller's message id (%q) instead of minting one", h0.Message)
	}
	if h0.Traceparent != "00-abc-def-01" {
		t.Errorf("traceparent is %q, want it carried verbatim", h0.Traceparent)
	}
}

func TestAMissingCorrelationIsMintedNotLeftEmpty(t *testing.T) {
	h := catalogueOf(t, syncTool("probe.v1.read", time.Second))
	c := &caller{out: []byte("x")}
	e := engine(h, c)
	_, failure := e.Invoke(context.Background(), &runv1.InvokeRequest{Tool: "probe.v1.read"}, run.Headers{})
	if failure != nil {
		t.Fatal(failure)
	}
	if c.calls[0].headers.Correlation == "" {
		t.Error("a call went out with no correlation id, so its log lines join to nothing")
	}
}

func TestAnUnknownToolIsNotFoundAndNamesTheCatalogue(t *testing.T) {
	h := catalogueOf(t, syncTool("probe.v1.read", time.Second))
	e := engine(h, &caller{})

	_, failure := e.Invoke(context.Background(), &runv1.InvokeRequest{Tool: "probe.v1.nope"}, run.Headers{})
	if failure == nil {
		t.Fatal("an unknown tool was accepted")
	}
	if failure.GetKind() != invokev1.ErrorKind_ERROR_KIND_NOT_FOUND {
		t.Errorf("kind is %v, want NOT_FOUND", failure.GetKind())
	}
	// "unknown tool" is unactionable when the real question is which namespace is
	// loaded.
	if !strings.Contains(failure.GetMessage(), "c.binpb") {
		t.Errorf("the message does not name the catalogue: %q", failure.GetMessage())
	}
}

// TestAnAsyncToolIsRefusedWithTheReason. 9b has no run store, so it cannot hold a
// run -- and it says that rather than pretending the tool does not exist.
func TestAnAsyncToolIsRefusedWithTheReason(t *testing.T) {
	for name, tc := range map[string]struct {
		tool *toolv1.Tool
		why  string
	}{
		"a plain async tool": {asyncTool("probe.v1.freeze"), "run store"},
		"an agent":           {agent("probe.v1.assistant", "probe.v1.read"), "decider"},
	} {
		tool := tc.tool
		h := catalogueOf(t, syncTool("probe.v1.read", time.Second), tool)
		c := &caller{}
		e := engine(h, c)

		_, failure := e.Invoke(context.Background(),
			&runv1.InvokeRequest{Tool: tool.GetName()}, run.Headers{})
		if failure == nil {
			t.Errorf("%s was invoked on a build with no run store", name)
			continue
		}
		if failure.GetKind() != invokev1.ErrorKind_ERROR_KIND_UNAVAILABLE {
			t.Errorf("%s: kind is %v, want UNAVAILABLE", name, failure.GetKind())
		}
		if !strings.Contains(failure.GetMessage(), tc.why) {
			t.Errorf("%s: the message does not say why: %q", name, failure.GetMessage())
		}
		if len(c.calls) != 0 {
			t.Errorf("%s: a tool was called anyway", name)
		}
	}
}

// TestAToolsErrorReachesTheCallerAsItsOwnKind, rather than being flattened.
func TestAToolsErrorReachesTheCallerAsItsOwnKind(t *testing.T) {
	h := catalogueOf(t, syncTool("probe.v1.read", time.Second))
	c := &caller{err: serve.NotFound("no customer %q", "c-1")}
	e := engine(h, c)

	_, failure := e.Invoke(context.Background(), &runv1.InvokeRequest{Tool: "probe.v1.read"}, run.Headers{})
	if failure == nil {
		t.Fatal("the tool's error did not reach the caller")
	}
	if failure.GetKind() != invokev1.ErrorKind_ERROR_KIND_NOT_FOUND {
		t.Errorf("kind is %v, want the tool's own NOT_FOUND", failure.GetKind())
	}
	if !strings.Contains(failure.GetMessage(), "c-1") {
		t.Errorf("the tool's words were lost: %q", failure.GetMessage())
	}
}

// TestFetchSaysNotRetainedRatherThanLying. The run may well have happened; saying
// NOT_FOUND would be a lie a caller could act on, and a fabricated result worse.
func TestFetchSaysNotRetainedRatherThanLying(t *testing.T) {
	e := engine(catalogueOf(t, syncTool("probe.v1.read", time.Second)), &caller{})
	resp, failure := e.Fetch(context.Background(), &runv1.FetchRequest{RunId: "r1"}, run.Headers{})
	if failure != nil {
		t.Fatalf("Fetch failed: %v", failure)
	}
	if resp.GetState() != runv1.RunState_RUN_STATE_NOT_RETAINED {
		t.Errorf("state is %v, want NOT_RETAINED", resp.GetState())
	}
	if resp.GetResult() != nil {
		t.Error("Fetch fabricated a result")
	}
}

func TestFetchWithNoRunIDIsInvalid(t *testing.T) {
	e := engine(catalogueOf(t, syncTool("probe.v1.read", time.Second)), &caller{})
	_, failure := e.Fetch(context.Background(), &runv1.FetchRequest{}, run.Headers{})
	if failure == nil || failure.GetKind() != invokev1.ErrorKind_ERROR_KIND_INVALID {
		t.Errorf("an empty run id gave %v, want INVALID", failure)
	}
}
