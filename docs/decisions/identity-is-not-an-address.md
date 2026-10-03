# A tool's name is its identity; its proto path is an address

**Decision.** The declared `name` is the one identity. Policy keys on it,
allowlists cite it, logs name it, a caller asks for it. The method's proto full
name is an **address** — where the declaration lives — and is never used as
identity.

The types say which is which, so a reader reaching for the wrong one has to ignore
the field name to do it:

```go
type Tool struct {
	Name   string                        // identity
	Method protoreflect.MethodDescriptor // ADDRESS, never identity
	Agent  *toolv1.Agent
}
```

**Why.** Two of the most expensive bugs in the estate this replaces were a thing
having both a declared name and a proto full name, both used as identity in
different places, with one passed where the other was expected. Both happened on
2026-10-02.

**How it is held.** The test fixture's identity and address **disagree on purpose**:
`support-assistant` is declared at `testdata.v1.SupportAssistantService.Invoke`. A
generator or resolver that derived one from the other fails a test rather than
failing in production three services away. `generate.TestServeMountsTheDeclaredNameNotTheMethodName`
is the same fixture discipline applied to emitted code.

**Consequence.** An agent's method name is free to say what the call does. The
examples use `rpc PlanTrip`, not `rpc Invoke` — the estate this replaces required
`Invoke` because its runner looked the method up by name, which made the address
load-bearing. Here nothing reads it.
