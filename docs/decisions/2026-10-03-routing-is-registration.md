# Routing is registration, so there is no `mode` field

**Date:** 2026-10-03
**Status:** active — **retested by the transport step**, which is the first thing that could force a change

**Decision.** No `mode`, `type` or `kind` field saying which runner answers an
agent.

**Why.** It follows from an invariant the estate this replaces wrote down and then
broke — `garmd/CLAUDE.md:21`:

> garmd does not know about agents. An agent is a tool: a service at a NATS subject.

If a runner is a NATS micro service like any other, then **which** runner answers a
given agent is decided by which service registered the subject, discovered the same
way every other service is. The gateway routes by tool name and never learns that
runners or agent types exist.

**What was rejected, and why it is not a small loss.** A `mode: REACT_DURABLE` field
would hand the gateway that knowledge for nothing. And under this repository's own
rule it has no enforcer: nothing would read it, because routing is registration. A
declared field nothing acts on is exactly the shape of the five concepts the
previous estate shipped declared and unenforced.

**Consequence for the generator.** A method whose option carries `agent` produces no
generated Go at all — see
[the generator carries no policy opinion](2026-10-03-the-generator-carries-no-policy-opinion.md).
A runner answers it, so a handler method would be one nobody may implement, and
implementing it would put a second answerer on the subject.
