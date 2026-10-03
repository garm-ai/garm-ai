package declared_test

import (
	"errors"
	"strings"
	"testing"

	"google.golang.org/protobuf/proto"

	"google.golang.org/protobuf/reflect/protodesc"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/reflect/protoregistry"
	"google.golang.org/protobuf/types/descriptorpb"

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

func registry(t *testing.T, files ...*descriptorpb.FileDescriptorProto) *protoregistry.Files {
	t.Helper()
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
