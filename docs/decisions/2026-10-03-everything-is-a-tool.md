# Everything is a tool, and an agent is a tool a runner answers

**Date:** 2026-10-03
**Status:** active

**Decision.** A tool is an RPC method carrying `(garm.tool.v1.tool)`. The option
declares a `name`, and optionally an `agent` block. **Absent: a service answers the
call itself. Present: a runner answers it, and the block says what that run may
call.**

```proto
message Tool {
  string name = 1;
  Agent agent = 2;
}
```

**Why.** The distinction worth modelling is not tool-versus-agent. It is **who
answers this call** — a service, or the platform. That is one optional field.

**What was rejected.** Two option types at two attachment levels, which is what the
estate this replaces had. It cost that estate a lint rule, `lintAgentDoorParity`,
which existed for no other purpose than to keep the two declarations consistent
with each other. A rule whose only job is to reconcile a split you chose is the
split telling you it was wrong.

**Consequence worth keeping straight.** An agent appearing in another agent's
allowlist needs no special case, because both are tools in one namespace and an
entry either resolves to a declared tool or it does not. See
[the allowlist is enforced](2026-10-03-the-allowlist-is-enforced.md).

**Also rejected: a `tools` field that is a bare repeated string.** It is
`repeated ToolRef`, a message, so an entry can gain fields — a version floor, a
caveat — without the option changing shape. A repeated scalar cannot grow.
