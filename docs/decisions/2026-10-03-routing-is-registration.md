# Routing is registration, so there is no `mode` field

**Date:** 2026-10-03
**Status:** **substantially superseded** by
[docs/specs/2026-10-03-rund-design.md](../specs/2026-10-03-rund-design.md) §7.0-§7.2,
on the same day. What survives: a tool author never names somebody else's
deployment, so *which instance* answers is still settled by registration. What does
not: rund **must** know an agent is an agent, because driving a decider loop and
making a call are different acts — and a decider is addressed by TYPE
(`garm.runner.react`), not at the agent's own subject. The reasoning below was
sound for a dumb router. rund owns runs, trees, retries and budgets, and is not
one. — **retested by the transport step**, which is the first thing that could force a change

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
