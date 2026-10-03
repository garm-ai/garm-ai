package generate_test

import (
	"context"
	"errors"
	"go/parser"
	"go/token"
	"reflect"
	"strconv"
	"strings"
	"testing"
	"time"

	"google.golang.org/protobuf/compiler/protogen"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protodesc"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/types/descriptorpb"
	"google.golang.org/protobuf/types/known/durationpb"
	"google.golang.org/protobuf/types/pluginpb"

	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	"github.com/garm-ai/garm-ai/examples/weatherd"
	toolv1 "github.com/garm-ai/garm-ai/garm/tool/v1"
	"github.com/garm-ai/garm-ai/internal/generate"
	"github.com/garm-ai/garm-ai/serve"
	testdatav1 "github.com/garm-ai/garm-ai/testdata/v1"
)

// ---------------------------------------------------------------------------
// The committed generated code, exercised as a consumer uses it.
//
// buf produced testdata/v1/tools_garm.pb.go and `mise run gen-check` proves it
// is what the protos compile to. So these tests do not re-run the generator and
// compare strings: they USE its output, which is a stronger claim than any
// golden file -- a golden test passes when the generator reliably emits code
// that does the wrong thing.
// ---------------------------------------------------------------------------

// accounts implements the generated interface. The assignment below is the
// real guard on the no-Unimplemented-embed property: delete GetCustomer from
// the generator and this FILE STOPS COMPILING, which is exactly what a tool
// author's build does.
type accounts struct {
	got  *testdatav1.GetCustomerRequest
	resp *testdatav1.GetCustomerResponse
	err  error
}

func (a *accounts) GetCustomer(_ context.Context, in *testdatav1.GetCustomerRequest) (*testdatav1.GetCustomerResponse, error) {
	a.got = in
	return a.resp, a.err
}

var _ testdatav1.AccountsServiceHandler = (*accounts)(nil)

// TestTheHandlerHasExactlyTheDeclaredTools closes the other direction. The
// compile-time assignment above proves no DECLARED tool is missing from the
// interface; nothing in it would notice an extra method the generator invented,
// which a tool author must then implement for no reason.
func TestTheHandlerHasExactlyTheDeclaredTools(t *testing.T) {
	iface := reflect.TypeOf((*testdatav1.AccountsServiceHandler)(nil)).Elem()
	if got := iface.NumMethod(); got != 1 {
		t.Fatalf("AccountsServiceHandler has %d methods, want 1 (the one tool tools.proto declares)", got)
	}
	if got := iface.Method(0).Name; got != "GetCustomer" {
		t.Fatalf("the method is %q, want GetCustomer", got)
	}
}

// mount is one recorded Endpoint call.
type mount struct {
	name   string
	method protoreflect.FullName
	budget time.Duration
	newReq func() proto.Message
	handle func(context.Context, proto.Message) (proto.Message, error)
}

// registrar is the fake. Its existence is the argument for serve.Registrar
// being an interface: there is no connection, no subject and no port anywhere in
// this file.
type registrar struct {
	mounts []mount
	fail   error // returned by the first Endpoint call, to prove Serve stops
}

func (r *registrar) Endpoint(
	name string,
	method protoreflect.FullName,
	budget time.Duration,
	newRequest func() proto.Message,
	handle func(context.Context, proto.Message) (proto.Message, error),
) error {
	r.mounts = append(r.mounts, mount{name, method, budget, newRequest, handle})
	return r.fail
}

func TestServeMountsTheDeclaredNameNotTheMethodName(t *testing.T) {
	var r registrar
	if err := testdatav1.ServeAccountsService(&r, &accounts{}); err != nil {
		t.Fatalf("ServeAccountsService: %v", err)
	}
	if len(r.mounts) != 1 {
		t.Fatalf("mounted %d endpoints, want 1", len(r.mounts))
	}
	m := r.mounts[0]
	// The whole identity-versus-address rule, in one assertion. The declared name
	// is "accounts.v1.get_customer"; the method is called GetCustomer and lives at
	// testdata.v1.AccountsService.GetCustomer. A generator that derived the name
	// from the method -- or the address from the name -- passes neither line.
	if m.name != "accounts.v1.get_customer" {
		t.Errorf("mounted under %q, want the declared name %q", m.name, "accounts.v1.get_customer")
	}
	if m.method != "testdata.v1.AccountsService.GetCustomer" {
		t.Errorf("address is %q, want testdata.v1.AccountsService.GetCustomer", m.method)
	}
	if _, ok := m.newReq().(*testdatav1.GetCustomerRequest); !ok {
		t.Errorf("newRequest built %T, want *GetCustomerRequest", m.newReq())
	}
}

func TestServeStopsOnTheFirstRegistrarFailure(t *testing.T) {
	boom := errors.New("subject already claimed")
	r := registrar{fail: boom}
	err := testdatav1.ServePaymentsService(&r, &payments{})
	if !errors.Is(err, boom) {
		t.Fatalf("Serve returned %v, want the registrar's own error", err)
	}
}

type payments struct{}

func (payments) GetPaymentStatus(context.Context, *testdatav1.GetPaymentStatusRequest) (*testdatav1.GetPaymentStatusResponse, error) {
	return &testdatav1.GetPaymentStatusResponse{}, nil
}

var _ testdatav1.PaymentsServiceHandler = payments{}

func TestTheMountedHandlerDispatchesToTheAuthorsMethod(t *testing.T) {
	h := &accounts{resp: &testdatav1.GetCustomerResponse{DisplayName: "ACME Ltd"}}
	var r registrar
	if err := testdatav1.ServeAccountsService(&r, h); err != nil {
		t.Fatalf("ServeAccountsService: %v", err)
	}
	out, err := r.mounts[0].handle(context.Background(), &testdatav1.GetCustomerRequest{CustomerId: "c-1"})
	if err != nil {
		t.Fatalf("handle: %v", err)
	}
	if h.got.GetCustomerId() != "c-1" {
		t.Errorf("the handler received %q, want c-1", h.got.GetCustomerId())
	}
	if got := out.(*testdatav1.GetCustomerResponse).GetDisplayName(); got != "ACME Ltd" {
		t.Errorf("handle returned display_name %q, want ACME Ltd", got)
	}
}

func TestTheMountedHandlerRefusesTheWrongRequestType(t *testing.T) {
	var r registrar
	if err := testdatav1.ServeAccountsService(&r, &accounts{}); err != nil {
		t.Fatalf("ServeAccountsService: %v", err)
	}
	// A transport that unmarshalled into the wrong message, which is a real bug
	// when two tools share one subject. It must not reach the author's method.
	_, err := r.mounts[0].handle(context.Background(), &testdatav1.GetPaymentStatusRequest{})
	if err == nil {
		t.Fatal("handle accepted a GetPaymentStatusRequest for accounts.v1.get_customer")
	}
	if !strings.Contains(err.Error(), "accounts.v1.get_customer") {
		t.Errorf("the error does not name the tool: %v", err)
	}
}

func TestTheMountedHandlerRefusesANilResponseWithNoError(t *testing.T) {
	// The failure this catches: marshalling a nil message yields an EMPTY one,
	// which reaches the caller as a successful answer to a call nobody answered.
	var r registrar
	if err := testdatav1.ServeAccountsService(&r, &accounts{resp: nil, err: nil}); err != nil {
		t.Fatalf("ServeAccountsService: %v", err)
	}
	out, err := r.mounts[0].handle(context.Background(), &testdatav1.GetCustomerRequest{})
	if err == nil {
		t.Fatalf("handle returned (%v, nil) for a handler that answered nothing", out)
	}
	if !strings.Contains(err.Error(), "no response and no error") {
		t.Errorf("the error does not say what happened: %v", err)
	}
}

// ---------------------------------------------------------------------------
// The generator itself, for the three things it must REFUSE or OMIT -- none of
// which a committed artefact can show, because a correct generator produces no
// artefact for any of them.
// ---------------------------------------------------------------------------

// dep returns a registered file as a descriptor proto, for the request's
// dependency list.
func dep(t *testing.T, fd protoreflect.FileDescriptor) *descriptorpb.FileDescriptorProto {
	t.Helper()
	return protodesc.ToFileDescriptorProto(fd)
}

// protoFiles is every file the request needs: tool.proto, EVERY import tool.proto
// has, and the probe file itself. Derived rather than listed, because listing them
// means this breaks at a distance the next time the contract imports something.
func protoFiles(t *testing.T, own *descriptorpb.FileDescriptorProto) []*descriptorpb.FileDescriptorProto {
	t.Helper()
	tool := toolv1.File_garm_tool_v1_tool_proto
	var out []*descriptorpb.FileDescriptorProto
	for i := 0; i < tool.Imports().Len(); i++ {
		out = append(out, dep(t, tool.Imports().Get(i).FileDescriptor))
	}
	return append(out, dep(t, tool), own)
}

// toolMethod builds a method declaring name, so that the option under test is
// the real extension on real MethodOptions rather than a struct a helper filled.
func toolMethod(t *testing.T, method string, tool *toolv1.Tool, streaming bool) *descriptorpb.MethodDescriptorProto {
	t.Helper()
	opts := &descriptorpb.MethodOptions{}
	proto.SetExtension(opts, toolv1.E_Tool, tool)
	m := &descriptorpb.MethodDescriptorProto{
		Name:       proto.String(method),
		InputType:  proto.String(".probe.v1.Req"),
		OutputType: proto.String(".probe.v1.Res"),
		Options:    opts,
	}
	if streaming {
		m.ServerStreaming = proto.Bool(true)
	}
	return m
}

// probe assembles a one-file proto declaring the given methods and runs the
// generator over it, returning the files it chose to emit.
func probe(t *testing.T, methods ...*descriptorpb.MethodDescriptorProto) (*pluginpb.CodeGeneratorResponse, error) {
	t.Helper()
	file := &descriptorpb.FileDescriptorProto{
		Name:    proto.String("probe/v1/probe.proto"),
		Package: proto.String("probe.v1"),
		Syntax:  proto.String("proto3"),
		Options: &descriptorpb.FileOptions{
			GoPackage: proto.String("github.com/garm-ai/garm-ai/probe/v1;probev1"),
		},
		Dependency: []string{"garm/tool/v1/tool.proto"},
		MessageType: []*descriptorpb.DescriptorProto{
			{Name: proto.String("Req")},
			{Name: proto.String("Res")},
		},
		Service: []*descriptorpb.ServiceDescriptorProto{
			{Name: proto.String("ProbeService"), Method: methods},
		},
	}
	req := &pluginpb.CodeGeneratorRequest{
		FileToGenerate: []string{"probe/v1/probe.proto"},
		Parameter:      proto.String("paths=source_relative"),
		ProtoFile:      protoFiles(t, file),
	}
	gen, err := protogen.Options{}.New(req)
	if err != nil {
		t.Fatalf("building the plugin request: %v", err)
	}
	runErr := generate.Run(gen)
	return gen.Response(), runErr
}

func TestAnAgentProducesNoGoAtAll(t *testing.T) {
	// A tool rund runs with a decider. If the generator emitted a handler for it, a tool
	// author would see a method they must never implement -- and implementing it
	// would put a second answerer on the subject.
	resp, err := probe(t, toolMethod(t, "PlanTrip", &toolv1.Tool{
		Name:  "trips.planner",
		Agent: &toolv1.Agent{Tools: []*toolv1.ToolRef{{Name: "weather.v1.get_forecast"}}},
	}, false))
	if err != nil {
		t.Fatalf("Run: %v", err)
	}
	if n := len(resp.GetFile()); n != 0 {
		t.Fatalf("emitted %d files for a proto holding only an agent, want 0: %s",
			n, resp.GetFile()[0].GetName())
	}
}

func TestTwoToolsInOneRunClaimingOneNameAreRefused(t *testing.T) {
	// The same rule garmctl compose enforces across images, read through the same
	// code, over the set a plugin run can see. The generator is NOT the uniqueness
	// gate -- it cannot be, it sees one module -- but a collision it can see is one
	// it must not emit two mounts for.
	_, err := probe(t,
		toolMethod(t, "First", &toolv1.Tool{Name: "probe.v1.thing"}, false),
		toolMethod(t, "Second", &toolv1.Tool{Name: "probe.v1.thing"}, false),
	)
	if err == nil {
		t.Fatal("the generator emitted two mounts for one name")
	}
	for _, want := range []string{"probe.v1.thing", "ProbeService.First", "ProbeService.Second"} {
		if !strings.Contains(err.Error(), want) {
			t.Errorf("the refusal does not name %s: %v", want, err)
		}
	}
}

func TestAStreamingToolIsRefusedWithASentence(t *testing.T) {
	// Not emitted badly. A streaming method would produce a handler signature
	// that fails to compile, and the author would read a type error about
	// proto.Message instead of the reason.
	_, err := probe(t, toolMethod(t, "Watch", &toolv1.Tool{Name: "probe.v1.watch"}, true))
	if err == nil {
		t.Fatal("the generator accepted a streaming tool")
	}
	if !strings.Contains(err.Error(), "one request and one response") {
		t.Errorf("the refusal does not say why: %v", err)
	}
}

func TestAMethodWithNoToolOptionProducesNothing(t *testing.T) {
	// An ordinary RPC in a tool service's proto is not a tool. Generating glue for
	// it would publish it under a name nobody declared.
	resp, err := probe(t, &descriptorpb.MethodDescriptorProto{
		Name:       proto.String("Healthz"),
		InputType:  proto.String(".probe.v1.Req"),
		OutputType: proto.String(".probe.v1.Res"),
	})
	if err != nil {
		t.Fatalf("Run: %v", err)
	}
	if n := len(resp.GetFile()); n != 0 {
		t.Fatalf("emitted %d files for a service declaring no tools, want 0", n)
	}
}

// compile-time proof that the fake satisfies the interface generated code is
// written against, rather than a parallel method set that happens to match.
var _ serve.Registrar = (*registrar)(nil)

// TestGeneratedCodeImportsOnlyWhatItNeeds is the guard on the rule this package's
// doc comment states: the generator carries no policy opinion.
//
// It is an EXACT set, not a denylist. A denylist stops the dependency somebody
// thought of; the previous estate's generator grew a card renderer, a contracts
// package and a sync.Map one commit at a time, each defensible on its own, and
// every consumer repository inherited all of them. Widening this set is the
// decision to put something in every repository forever, so it should take a
// failing test to make.
func TestGeneratedCodeImportsOnlyWhatItNeeds(t *testing.T) {
	resp, err := probe(t, toolMethod(t, "Do", &toolv1.Tool{
		Name:     "probe.v1.do",
		Delivery: &toolv1.Tool_Sync{Sync: &toolv1.Sync{Budget: durationpb.New(5 * time.Second)}},
	}, false))
	if err != nil {
		t.Fatalf("Run: %v", err)
	}
	if len(resp.GetFile()) != 1 {
		t.Fatalf("emitted %d files, want 1", len(resp.GetFile()))
	}
	f, err := parser.ParseFile(token.NewFileSet(), "probe_garm.pb.go", resp.GetFile()[0].GetContent(), parser.ImportsOnly)
	if err != nil {
		t.Fatalf("parsing the generated file: %v", err)
	}
	got := map[string]bool{}
	for _, imp := range f.Imports {
		path, err := strconv.Unquote(imp.Path.Value)
		if err != nil {
			t.Fatalf("import path %s: %v", imp.Path.Value, err)
		}
		got[path] = true
	}
	want := map[string]bool{
		"context":                          true, // the handler's first parameter
		"fmt":                              true, // the two refusals in the dispatch closure
		"google.golang.org/protobuf/proto": true, // proto.Message, the transport's currency
		"github.com/garm-ai/garm-ai/serve": true, // Registrar, and deliberately nothing else
		// ADDED DELIBERATELY, and this test is why it was a decision rather than a
		// drift: the declared budget is emitted as `5 * time.Second` so a reader can
		// check it against the .proto without dividing. stdlib, zero cost, present
		// everywhere -- and the fifth entry anybody adds should have to argue here.
		"time": true,
	}
	for path := range got {
		if !want[path] {
			t.Errorf("generated code imports %q. Adding a dependency to emitted text adds it to EVERY consumer repository -- is that the decision?", path)
		}
	}
	for path := range want {
		if !got[path] {
			t.Errorf("generated code no longer imports %q", path)
		}
	}
}

// TestTheDeclaredBudgetIsEmittedReadably. The tool enforces its OWN number, so it
// has to be in the generated binding -- and a reader comparing it to the .proto
// should not have to divide.
func TestTheDeclaredBudgetIsEmittedReadably(t *testing.T) {
	for _, tc := range []struct {
		d    time.Duration
		want string
	}{
		// as gofmt leaves them -- it tightens the spaces around *, and the
		// assertion is on the whole argument line so "time.Second" cannot match
		// inside "5*time.Second".
		{5 * time.Second, "5*time.Second"},
		{time.Second, "time.Second"},
		{2 * time.Minute, "2*time.Minute"},
		{1500 * time.Millisecond, "1500*time.Millisecond"},
	} {
		resp, err := probe(t, toolMethod(t, "Do", &toolv1.Tool{
			Name:     "probe.v1.do",
			Delivery: &toolv1.Tool_Sync{Sync: &toolv1.Sync{Budget: durationpb.New(tc.d)}},
		}, false))
		if err != nil {
			t.Fatalf("Run: %v", err)
		}
		got := resp.GetFile()[0].GetContent()
		if !strings.Contains(got, "\n\t\t"+tc.want+",\n") {
			t.Errorf("%v is not emitted as the argument %q", tc.d, tc.want)
		}
	}
}

// TestAnAsyncToolGetsNoDeadline: a budget is a Sync concept, and emitting one for
// an async tool would cut off a call that was never promised to finish in time.
func TestAnAsyncToolGetsNoDeadline(t *testing.T) {
	resp, err := probe(t, toolMethod(t, "Do", &toolv1.Tool{
		Name:     "probe.v1.freeze",
		Delivery: &toolv1.Tool_Async{Async: &toolv1.Async{}},
	}, false))
	if err != nil {
		t.Fatalf("Run: %v", err)
	}
	got := resp.GetFile()[0].GetContent()
	if strings.Contains(got, "time.Second") || strings.Contains(got, "time.Duration") {
		t.Errorf("an async tool was given a deadline:\n%s", got)
	}
}

// TestTheBudgetReachesTheRegistrar, through the real generated binding rather than
// through the generator's output as text.
func TestTheBudgetReachesTheRegistrar(t *testing.T) {
	var r registrar
	if err := weatherv1.ServeWeatherService(&r, weatherd.Service{}); err != nil {
		t.Fatalf("Serve: %v", err)
	}
	if len(r.mounts) != 1 {
		t.Fatalf("mounted %d", len(r.mounts))
	}
	// weather.proto declares sync: { budget: { seconds: 5 } }
	if r.mounts[0].budget != 5*time.Second {
		t.Errorf("budget reached the registrar as %v, want 5s", r.mounts[0].budget)
	}
}
