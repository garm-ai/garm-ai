// Step 2's proof: an agent and a plain tool share one declaration and one
// namespace, and a tool's identity is not its address.
package garmai_test

import (
	"testing"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protoreflect"

	toolv1 "github.com/garm-ai/garm-ai/garm/tool/v1"
	testdatav1 "github.com/garm-ai/garm-ai/testdata/v1"
)

// toolOn reads the option the way every real consumer must: off a method
// descriptor, through the extension. If this is ever replaced by a hand-built
// toolv1.Tool, the test using it has stopped proving anything.
func toolOn(t *testing.T, service, method string) *toolv1.Tool {
	t.Helper()
	sd := testdatav1.File_testdata_v1_testdata_proto.Services().ByName(protoreflect.Name(service))
	if sd == nil {
		t.Fatalf("the fixture declares no %s", service)
	}
	md := sd.Methods().ByName(protoreflect.Name(method))
	if md == nil {
		t.Fatalf("%s declares no %s", service, method)
	}
	ext := proto.GetExtension(md.Options(), toolv1.E_Tool)
	tool, ok := ext.(*toolv1.Tool)
	if !ok || tool == nil || tool.GetName() == "" {
		t.Fatalf("%s.%s carries no tool option: %T", service, method, ext)
	}
	return tool
}

func TestAPlainToolDeclaresNoAgent(t *testing.T) {
	// A tool a service answers itself. The absence of the agent block is the
	// declaration that nobody runs this on anyone's behalf.
	tool := toolOn(t, "AccountsService", "GetCustomer")
	if got, want := tool.GetName(), "accounts.v1.get_customer"; got != want {
		t.Errorf("name = %q, want %q", got, want)
	}
	if tool.GetAgent() != nil {
		t.Errorf("a plain tool declared an agent block: %v", tool.GetAgent())
	}
}

func TestAnAgentIsAToolWithAnAgentBlock(t *testing.T) {
	tool := toolOn(t, "SupportAssistantService", "Invoke")
	if got, want := tool.GetName(), "support-assistant"; got != want {
		t.Errorf("name = %q, want %q", got, want)
	}
	if tool.GetAgent() == nil {
		t.Fatal("the agent declared no agent block, so nothing says a runner answers it")
	}
	if got, want := len(tool.GetAgent().GetTools()), 2; got != want {
		t.Fatalf("allowlist = %d entries, want %d", got, want)
	}
}

func TestAnAgentAndAPlainToolShareOneNamespace(t *testing.T) {
	// The point of folding agent into tool. An allowlist entry is resolved
	// against tools declared elsewhere by the SAME spelling -- so an agent in
	// another agent's allowlist needs no special case, because an agent is an
	// ordinary tool.
	//
	// This also makes "the allowlist is the only authority" checkable for the
	// first time: an entry either names a declared tool or it does not.
	declared := map[string]bool{}
	fds := testdatav1.File_testdata_v1_testdata_proto
	for i := 0; i < fds.Services().Len(); i++ {
		sd := fds.Services().Get(i)
		for j := 0; j < sd.Methods().Len(); j++ {
			ext := proto.GetExtension(sd.Methods().Get(j).Options(), toolv1.E_Tool)
			if tool, ok := ext.(*toolv1.Tool); ok && tool.GetName() != "" {
				declared[tool.GetName()] = true
			}
		}
	}
	if !declared["accounts.v1.get_customer"] || !declared["support-assistant"] {
		t.Fatalf("the fixture should declare both a plain tool and an agent; got %v", declared)
	}

	agent := toolOn(t, "SupportAssistantService", "Invoke").GetAgent()
	var resolved, unresolved []string
	for _, ref := range agent.GetTools() {
		if declared[ref.GetName()] {
			resolved = append(resolved, ref.GetName())
		} else {
			unresolved = append(unresolved, ref.GetName())
		}
	}
	// accounts.v1.get_customer is declared in this fixture and must resolve.
	if len(resolved) != 1 || resolved[0] != "accounts.v1.get_customer" {
		t.Errorf("resolved = %v, want exactly [accounts.v1.get_customer]", resolved)
	}
	// payments.v1.get_payment_status is NOT declared here, and must not resolve.
	// An allowlist naming a tool nothing declares is the error a resolver has to
	// catch; this asserts the two cases are distinguishable at all.
	if len(unresolved) != 1 || unresolved[0] != "payments.v1.get_payment_status" {
		t.Errorf("unresolved = %v, want exactly [payments.v1.get_payment_status]", unresolved)
	}
}

func TestAToolsIdentityIsItsNameAndNotItsAddress(t *testing.T) {
	// The direct regression guard for the two most expensive bugs in the estate
	// this replaces: a thing had a declared name AND a proto full name, both were
	// used as identity, and twice one was passed where the other was expected.
	sd := testdatav1.File_testdata_v1_testdata_proto.Services().ByName("SupportAssistantService")
	md := sd.Methods().ByName("Invoke")
	tool := toolOn(t, "SupportAssistantService", "Invoke")

	if string(md.FullName()) == tool.GetName() {
		t.Fatal("the fixture's address and identity are equal, so this test cannot " +
			"detect code that confuses them -- make them differ")
	}
	if got, want := string(md.FullName()), "testdata.v1.SupportAssistantService.Invoke"; got != want {
		t.Errorf("address = %q, want %q", got, want)
	}
	if got, want := tool.GetName(), "support-assistant"; got != want {
		t.Errorf("identity = %q, want %q", got, want)
	}
}
