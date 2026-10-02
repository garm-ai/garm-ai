// Step 1's proof: the agent option is readable off a real descriptor, and an
// agent's identity is its declared name rather than the address it lives at.
package garmai_test

import (
	"testing"

	"google.golang.org/protobuf/proto"

	agentv1 "github.com/garm-ai/garm-ai/garm/agent/v1"
	testdatav1 "github.com/garm-ai/garm-ai/testdata/v1"
)

func TestTheAgentOptionIsReadableOffACompiledDescriptor(t *testing.T) {
	sd := testdatav1.File_testdata_v1_testdata_proto.Services().ByName("SupportAssistantService")
	if sd == nil {
		t.Fatal("the fixture declares no SupportAssistant service")
	}
	ext := proto.GetExtension(sd.Options(), agentv1.E_Agent)
	a, ok := ext.(*agentv1.Agent)
	if !ok || a == nil {
		t.Fatalf("the agent option did not come back as an Agent: %T", ext)
	}
	if got, want := a.GetName(), "support-assistant"; got != want {
		t.Errorf("name = %q, want %q", got, want)
	}
	if got, want := len(a.GetTools()), 2; got != want {
		t.Fatalf("tools = %d, want %d", got, want)
	}
	if got, want := a.GetTools()[0].GetName(), "accounts.v1.get_customer"; got != want {
		t.Errorf("tools[0].name = %q, want %q", got, want)
	}
}

func TestAnAgentsIdentityIsItsNameAndNotItsAddress(t *testing.T) {
	// The direct regression guard for the two most expensive bugs in the estate
	// this replaces: an agent had a declared name AND a proto full name, both
	// were used as identity, and twice one was passed where the other was
	// expected. This asserts the two are distinguishable, so any future code
	// that treats the address as the identity has a failing test rather than a
	// refusal three services away.
	sd := testdatav1.File_testdata_v1_testdata_proto.Services().ByName("SupportAssistantService")
	a := proto.GetExtension(sd.Options(), agentv1.E_Agent).(*agentv1.Agent)

	if string(sd.FullName()) == a.GetName() {
		t.Fatal("the fixture's address and identity are equal, so this test cannot " +
			"detect code that confuses them -- make them differ")
	}
	if got, want := string(sd.FullName()), "testdata.v1.SupportAssistantService"; got != want {
		t.Errorf("address = %q, want %q", got, want)
	}
	if got, want := a.GetName(), "support-assistant"; got != want {
		t.Errorf("identity = %q, want %q", got, want)
	}
}
