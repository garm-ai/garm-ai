package declared_test

import (
	"errors"
	"strings"
	"testing"
	"time"

	"google.golang.org/protobuf/proto"

	"google.golang.org/protobuf/reflect/protodesc"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/reflect/protoregistry"
	"google.golang.org/protobuf/types/descriptorpb"
	"google.golang.org/protobuf/types/known/durationpb"

	"github.com/garm-ai/garm-ai/declared"
	toolv1 "github.com/garm-ai/garm-ai/garm/tool/v1"
	testdatav1 "github.com/garm-ai/garm-ai/testdata/v1"
)

// Every fixture here is built from COMPILED descriptors, never from a
// hand-filled declared.Set. Four tests in the previous estate passed while the
// behaviour they covered was broken, and every one had a fixture that could not
// express the failure.
func fdp(fd protoreflect.FileDescriptor) *descriptorpb.FileDescriptorProto {
	return protodesc.ToFileDescriptorProto(fd)
}

// registry builds a Files from the given descriptors, adding any WELL-KNOWN TYPE
// the set imports but does not carry.
//
// Automatic because a caller should not have to track what garm/tool/v1 happens to
// import this month: adding `google.protobuf.Duration` to the contract broke every
// test here at once, and none of them is about duration.
func registry(t *testing.T, files ...*descriptorpb.FileDescriptorProto) *protoregistry.Files {
	t.Helper()
	have := map[string]bool{}
	for _, f := range files {
		have[f.GetName()] = true
	}
	var wkt []*descriptorpb.FileDescriptorProto
	for _, fd := range []protoreflect.FileDescriptor{
		durationpb.File_google_protobuf_duration_proto,
	} {
		if !have[fd.Path()] {
			wkt = append(wkt, protodesc.ToFileDescriptorProto(fd))
		}
	}
	files = append(wkt, files...)
	reg, err := protodesc.NewFiles(&descriptorpb.FileDescriptorSet{File: files})
	if err != nil {
		t.Fatalf("building the registry: %v", err)
	}
	return reg
}

// contract is garm/tool/v1/tool.proto and its own dependency, which every
// fixture needs because the option lives there.
func contract() []*descriptorpb.FileDescriptorProto {
	tool := toolv1.File_garm_tool_v1_tool_proto
	return []*descriptorpb.FileDescriptorProto{
		fdp(tool.Imports().Get(0).FileDescriptor), // descriptor.proto
		fdp(tool),
	}
}

// whole is the committed tree: the contract, the plain tools, and the agent.
// Its allowlist resolves, which is why `mise run check` passes on this repo.
func whole(t *testing.T) *protoregistry.Files {
	t.Helper()
	return registry(t, append(contract(),
		fdp(testdatav1.File_testdata_v1_tools_proto),
		fdp(testdatav1.File_testdata_v1_agent_proto))...)
}

// partial is the agent WITHOUT the tools it names -- a registry a caller can
// build by accident, because an allowlist cites names and so creates no proto
// dependency to drag the tools in. The previous estate shipped a CLI flag that
// did exactly this and then reported the valid tree as broken.
func partial(t *testing.T) *protoregistry.Files {
	t.Helper()
	return registry(t, append(contract(),
		fdp(testdatav1.File_testdata_v1_agent_proto))...)
}

func TestFromIndexesBothAPlainToolAndAnAgent(t *testing.T) {
	set, err := declared.From(whole(t))
	if err != nil {
		t.Fatalf("From: %v", err)
	}
	plain, ok := set.Tool("accounts.v1.get_customer")
	if !ok {
		t.Fatal("the plain tool was not indexed")
	}
	if plain.IsAgent() {
		t.Error("a plain tool reported itself as an agent")
	}
	agent, ok := set.Tool("support-assistant")
	if !ok {
		t.Fatal("the agent was not indexed")
	}
	if !agent.IsAgent() {
		t.Error("the agent did not report itself as one")
	}
	if got, want := len(set.Tools()), 3; got != want {
		t.Errorf("Tools() = %d, want %d", got, want)
	}
}

func TestIdentityAndAddressAreSeparateFields(t *testing.T) {
	// The type keeps them apart so a reader reaching for the wrong one has to
	// ignore the label. Two of the previous estate's most expensive bugs were
	// exactly this confusion, in two different components.
	set, _ := declared.From(whole(t))
	agent, _ := set.Tool("support-assistant")
	if got, want := agent.Name, "support-assistant"; got != want {
		t.Errorf("Name = %q, want %q", got, want)
	}
	if got, want := string(agent.Method.FullName()), "testdata.v1.SupportAssistantService.Invoke"; got != want {
		t.Errorf("Method.FullName = %q, want %q", got, want)
	}
	if agent.Name == string(agent.Method.FullName()) {
		t.Fatal("identity and address are equal in the fixture, so this test " +
			"cannot detect code that confuses them")
	}
}

func TestTheCommittedTreeResolves(t *testing.T) {
	// The repository's own check runs this. If it ever fails, the fixture has
	// drifted and `mise run check` is about to go red for a real reason.
	set, err := declared.From(whole(t))
	if err != nil {
		t.Fatalf("From: %v", err)
	}
	if bad := set.Unresolved(); len(bad) != 0 {
		t.Errorf("the committed tree does not resolve: %v", bad)
	}
}

func TestAPartialTreeLeavesTheAllowlistUnresolved(t *testing.T) {
	// Not a contrived case. An allowlist cites tools by name, so nothing in
	// protobuf drags them into a registry -- which means a caller compiling one
	// directory gets exactly this, and the previous estate's `--proto` flag did.
	set, err := declared.From(partial(t))
	if err != nil {
		t.Fatalf("From: %v", err)
	}
	bad := set.Unresolved()
	if len(bad) != 2 {
		t.Fatalf("Unresolved = %v, want both entries", bad)
	}
	for _, u := range bad {
		if u.Agent != "support-assistant" {
			t.Errorf("blamed %q, want support-assistant", u.Agent)
		}
		// A diagnostic that cannot name a file is one somebody has to grep for.
		// It carries the address even though the address is never identity.
		if !strings.Contains(u.String(), "testdata.v1.SupportAssistantService.Invoke") {
			t.Errorf("the diagnostic does not name the address: %s", u)
		}
	}
}

func TestFromRefusesTwoToolsWithOneName(t *testing.T) {
	// Not a lint rule -- a precondition. A name resolving to one thing is what
	// allowlists, policy keys and ledger rows all rest on, so an ambiguous index
	// is not a Set with a problem, it is not a Set.
	//
	// The clash is a second FILE declaring a different service whose method
	// claims the SAME tool name, derived from the real fixture so the option
	// bytes are the ones buf produced.
	clash := fdp(testdatav1.File_testdata_v1_agent_proto)
	clash.Name = strPtr("testdata/v1/agent_clash.proto")
	for _, svc := range clash.Service {
		if svc.GetName() == "SupportAssistantService" {
			svc.Name = strPtr("SecondAssistantService")
			clash.Service = []*descriptorpb.ServiceDescriptorProto{svc}
			break
		}
	}
	clash.MessageType = nil // the messages live in the original file...
	// ...which it must therefore IMPORT: proto requires an explicit import for a
	// cross-file reference even inside one package.
	clash.Dependency = append(clash.Dependency, testdatav1.File_testdata_v1_agent_proto.Path())

	set, err := declared.From(registry(t, append(contract(),
		fdp(testdatav1.File_testdata_v1_tools_proto),
		fdp(testdatav1.File_testdata_v1_agent_proto),
		clash)...))
	if err == nil {
		t.Fatalf("From accepted two tools with one name; got %d tools", len(set.Tools()))
	}
	// The message must name BOTH addresses: a human fixing this needs to know
	// which two files to open, and the name alone says neither.
	for _, want := range []string{"support-assistant", "SupportAssistantService", "SecondAssistantService"} {
		if !strings.Contains(err.Error(), want) {
			t.Errorf("the error does not mention %q: %v", want, err)
		}
	}
}

func strPtr(s string) *string { return &s }

// ---------------------------------------------------------------------------
// A declared name must be usable as one.
//
// This arrived with the NATS transport, and the case that forced it is not a
// style complaint: NATS treats `*` and `>` as subscription wildcards, so a tool
// named `a.*.b` would mount a WILDCARD SUBSCRIPTION and receive other tools'
// requests. micro's own subject check is `^[^ >]*[>]?$`, which accepts `*`
// happily -- so nothing downstream catches it.
// ---------------------------------------------------------------------------

// named builds a one-tool file declaring name, through real MethodOptions, so the
// test exercises the path every consumer uses rather than a struct literal.
func named(t *testing.T, name string) *descriptorpb.FileDescriptorProto {
	t.Helper()
	opts := &descriptorpb.MethodOptions{}
	proto.SetExtension(opts, toolv1.E_Tool, &toolv1.Tool{Name: name})
	return &descriptorpb.FileDescriptorProto{
		Name:       proto.String("probe/v1/probe.proto"),
		Package:    proto.String("probe.v1"),
		Syntax:     proto.String("proto3"),
		Dependency: []string{"garm/tool/v1/tool.proto"},
		MessageType: []*descriptorpb.DescriptorProto{
			{Name: proto.String("Req")}, {Name: proto.String("Res")},
		},
		Service: []*descriptorpb.ServiceDescriptorProto{{
			Name: proto.String("ProbeService"),
			Method: []*descriptorpb.MethodDescriptorProto{{
				Name:       proto.String("Do"),
				InputType:  proto.String(".probe.v1.Req"),
				OutputType: proto.String(".probe.v1.Res"),
				Options:    opts,
			}},
		}},
	}
}

func setWithName(t *testing.T, name string) (*declared.Set, error) {
	t.Helper()
	return declared.From(registry(t,
		fdp((*descriptorpb.FileDescriptorProto)(nil).ProtoReflect().Descriptor().ParentFile()),
		fdp(toolv1.File_garm_tool_v1_tool_proto),
		named(t, name),
	))
}

func TestAUsableNameIsAccepted(t *testing.T) {
	for _, name := range []string{
		"weather.v1.get_forecast", // the convention
		"trip-planner",            // a bare name with a hyphen
		"support_assistant",
		"a",
		"A1.b2.C3",
		"accounts.v1.get_customer",
	} {
		if _, err := setWithName(t, name); err != nil {
			t.Errorf("the name %q was refused: %v", name, err)
		}
	}
}

func TestAnUnusableNameIsRefusedWithAReason(t *testing.T) {
	for _, tc := range []struct{ name, wants string }{
		// The two that matter. Neither is caught by NATS micro.
		{"a.*.b", "wildcard"},
		{"a.>.b", "wildcard"},
		{"everything.*", "wildcard"},
		// An empty segment addresses nothing, and NATS collapses it silently.
		{"a..b", "empty segment"},
		{".leading", "empty segment"},
		{"trailing.", "empty segment"},
		// Outside the charset.
		{"get forecast", "segment must be"},
		{"café.v1.order", "segment must be"},
		{"a/b", "segment must be"},
		{"a:b", "segment must be"},
	} {
		_, err := setWithName(t, tc.name)
		if err == nil {
			t.Errorf("the name %q was accepted", tc.name)
			continue
		}
		var bad *declared.InvalidName
		if !errors.As(err, &bad) {
			t.Errorf("the name %q was refused with %T, want *declared.InvalidName", tc.name, err)
			continue
		}
		if bad.Name != tc.name {
			t.Errorf("the error names %q, want %q", bad.Name, tc.name)
		}
		if !strings.Contains(bad.Reason, tc.wants) {
			t.Errorf("the reason for %q is %q, want it to mention %q", tc.name, bad.Reason, tc.wants)
		}
		// The address, so a human knows which file to open. The name is what is
		// wrong; the address is where to go.
		if !strings.Contains(bad.Error(), "probe.v1.ProbeService.Do") {
			t.Errorf("the error for %q does not name the declaration site: %v", tc.name, bad)
		}
	}
}

func TestTheWildcardReasonSaysWhatWouldHappen(t *testing.T) {
	// Not a charset complaint. A reader of this message has to understand that the
	// consequence is intercepting other tools' traffic, or they will "fix" it by
	// relaxing the rule.
	_, err := setWithName(t, "a.*.b")
	var bad *declared.InvalidName
	if !errors.As(err, &bad) {
		t.Fatalf("want *declared.InvalidName, got %T", err)
	}
	if !strings.Contains(bad.Reason, "intercept other tools") {
		t.Errorf("the reason does not say what would happen: %q", bad.Reason)
	}
}

// ---------------------------------------------------------------------------
// Delivery. A caller of a sync tool waits for an answer; a caller of an async one
// holds a receipt. Those are different programs, so the declaration must say which
// and compose must refuse one that does not.
// ---------------------------------------------------------------------------

// withTool builds a one-tool file carrying tool verbatim, so every case below goes
// through real MethodOptions rather than a struct a helper filled in.
func withTool(t *testing.T, tool *toolv1.Tool) (*declared.Set, error) {
	t.Helper()
	opts := &descriptorpb.MethodOptions{}
	proto.SetExtension(opts, toolv1.E_Tool, tool)
	file := &descriptorpb.FileDescriptorProto{
		Name:       proto.String("probe/v1/probe.proto"),
		Package:    proto.String("probe.v1"),
		Syntax:     proto.String("proto3"),
		Dependency: []string{"garm/tool/v1/tool.proto"},
		MessageType: []*descriptorpb.DescriptorProto{
			{Name: proto.String("Req")}, {Name: proto.String("Res")},
		},
		Service: []*descriptorpb.ServiceDescriptorProto{{
			Name: proto.String("ProbeService"),
			Method: []*descriptorpb.MethodDescriptorProto{{
				Name:       proto.String("Do"),
				InputType:  proto.String(".probe.v1.Req"),
				OutputType: proto.String(".probe.v1.Res"),
				Options:    opts,
			}},
		}},
	}
	return declared.From(registry(t,
		fdp((*descriptorpb.FileDescriptorProto)(nil).ProtoReflect().Descriptor().ParentFile()),
		fdp(toolv1.File_garm_tool_v1_tool_proto),
		file,
	))
}

// A oneof generates wrapper types, so delivery is set through them rather than on
// the message. Helpers, because the noise would otherwise bury what each case is
// actually about.
func syncD(d time.Duration) *toolv1.Tool_Sync {
	return &toolv1.Tool_Sync{Sync: &toolv1.Sync{Budget: durationpb.New(d)}}
}
func syncRaw(s *toolv1.Sync) *toolv1.Tool_Sync { return &toolv1.Tool_Sync{Sync: s} }
func asyncD() *toolv1.Tool_Async               { return &toolv1.Tool_Async{Async: &toolv1.Async{}} }

func problems(t *testing.T, tool *toolv1.Tool) []declared.DeliveryProblem {
	t.Helper()
	set, err := withTool(t, tool)
	if err != nil {
		t.Fatalf("building the set: %v", err)
	}
	return set.DeliveryProblems()
}

func TestADeclaredDeliveryIsAccepted(t *testing.T) {
	for name, tool := range map[string]*toolv1.Tool{
		"a sync tool":   {Name: "probe.v1.read", Delivery: syncD(2 * time.Second)},
		"an async tool": {Name: "probe.v1.freeze", Delivery: asyncD()},
		"an async agent": {Name: "probe.v1.assistant", Delivery: asyncD(),
			Agent: &toolv1.Agent{Tools: []*toolv1.ToolRef{{Name: "probe.v1.read"}}}},
	} {
		if p := problems(t, tool); len(p) != 0 {
			t.Errorf("%s was refused: %v", name, p)
		}
	}
}

// TestSilenceIsNotADefault. A tool whose author said nothing must not be guessed
// at: guessing sync makes a caller wait forever for an answer that is a receipt,
// and guessing async makes it hold a receipt it will never redeem.
func TestSilenceIsNotADefault(t *testing.T) {
	p := problems(t, &toolv1.Tool{Name: "probe.v1.quiet"})
	if len(p) != 1 {
		t.Fatalf("a tool declaring no delivery produced %d problems, want 1: %v", len(p), p)
	}
	if !strings.Contains(p[0].Reason, "no delivery") {
		t.Errorf("the reason is %q", p[0].Reason)
	}
	if !strings.Contains(p[0].String(), "probe.v1.ProbeService.Do") {
		t.Errorf("the finding does not name where to look: %v", p[0])
	}
}

// TestAnAgentDeclaringSyncIsRefused. Both decider kinds are durable by definition,
// so an agent cannot complete inside a call. This was only a comment in an example
// until the declaration could carry it.
func TestAnAgentDeclaringSyncIsRefused(t *testing.T) {
	p := problems(t, &toolv1.Tool{
		Name:     "probe.v1.assistant",
		Delivery: syncD(5 * time.Second),
		Agent:    &toolv1.Agent{Tools: []*toolv1.ToolRef{{Name: "probe.v1.read"}}},
	})
	if len(p) != 1 {
		t.Fatalf("a sync agent produced %d problems, want 1: %v", len(p), p)
	}
	if !strings.Contains(p[0].Reason, "cannot complete inside a call") {
		t.Errorf("the reason does not say WHY an agent cannot be sync: %q", p[0].Reason)
	}
}

// TestSyncWithoutABudgetIsRefused: the number exists so that no caller invents one.
// Declaring sync and omitting it leaves exactly the guessing it was added to end.
func TestSyncWithoutABudgetIsRefused(t *testing.T) {
	for name, s := range map[string]*toolv1.Sync{
		"no budget at all":  {},
		"a zero budget":     {Budget: durationpb.New(0)},
		"a negative budget": {Budget: durationpb.New(-time.Second)},
	} {
		p := problems(t, &toolv1.Tool{Name: "probe.v1.read", Delivery: syncRaw(s)})
		if len(p) != 1 {
			t.Errorf("%s produced %d problems, want 1: %v", name, len(p), p)
			continue
		}
		if !strings.Contains(p[0].Reason, "invent a deadline") {
			t.Errorf("%s: the reason does not say what goes wrong: %q", name, p[0].Reason)
		}
	}
}

// TestBudgetIsZeroForAnythingNotSync is why a caller must ask IsSync rather than
// compare Budget to zero -- the two would otherwise be indistinguishable from a
// sync tool whose budget nobody set, which is a thing compose refuses anyway.
func TestBudgetIsZeroForAnythingNotSync(t *testing.T) {
	set, err := withTool(t, &toolv1.Tool{Name: "probe.v1.freeze", Delivery: asyncD()})
	if err != nil {
		t.Fatal(err)
	}
	tool, _ := set.Tool("probe.v1.freeze")
	if tool.IsSync() {
		t.Error("an async tool reports IsSync")
	}
	if tool.Budget() != 0 {
		t.Errorf("Budget is %v for an async tool, want 0", tool.Budget())
	}
}

// TestTheCommittedTreeDeclaresDeliveryEverywhere. The fixtures are not exempt from
// a rule the namespace enforces; if they were, the rule would be untested against
// anything a human actually wrote.
func TestTheCommittedTreeDeclaresDeliveryEverywhere(t *testing.T) {
	set, err := declared.From(registry(t,
		fdp((*descriptorpb.FileDescriptorProto)(nil).ProtoReflect().Descriptor().ParentFile()),
		fdp(toolv1.File_garm_tool_v1_tool_proto),
		fdp(testdatav1.File_testdata_v1_tools_proto),
		fdp(testdatav1.File_testdata_v1_agent_proto),
	))
	if err != nil {
		t.Fatal(err)
	}
	if p := set.DeliveryProblems(); len(p) != 0 {
		t.Fatalf("the committed fixtures have delivery problems: %v", p)
	}
	// and the shapes are the ones the fixture means to show
	if a, _ := set.Tool("accounts.v1.get_customer"); !a.IsSync() || a.Budget() != 2*time.Second {
		t.Errorf("accounts.v1.get_customer: sync=%v budget=%v, want sync 2s", a.IsSync(), a.Budget())
	}
	if ag, _ := set.Tool("support-assistant"); ag.IsSync() || !ag.IsAgent() {
		t.Errorf("support-assistant should be an async agent, got sync=%v agent=%v", ag.IsSync(), ag.IsAgent())
	}
}
