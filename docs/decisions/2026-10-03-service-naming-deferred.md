# Service naming, deliberately deferred

**Date:** 2026-10-03
**Status:** **parked** — deliberately undecided until a step writes a real proto

**Decision.** `buf lint` runs `STANDARD`, the fixtures and examples **comply rather
than waive**, and the naming question stays open until a step writes a real proto.

**The tension.** `STANDARD` has now fought the domain twice:

- `SERVICE_SUFFIX` wants `SupportAssistantService`, where an agent is a named actor
  and reads better without the suffix.
- `RPC_RESPONSE_STANDARD_NAME` wants `InvokeResponse`, where every agent's `Invoke`
  returning one shared `RunRef` is better design — and `RPC_REQUEST_RESPONSE_UNIQUE`
  would then object to the sharing too.

**Why not configure around it.** The estate this replaces hit all three, configured
`STANDARD` anyway, and **never ran it clean** — its `examples/bank` emits eight
violations today. The config claimed one thing and the tree did another, and nothing
noticed. A lint nobody honours is worse than no lint, because it reads as a
guarantee.

**One of the three dissolved rather than needing a ruling.** The option carries the
tool's identity, so a method name is an address and nothing reads it. Naming the
agent's method for the act it performs gives `PlanTrip`, `PlanTripRequest` and a
clean lint at once. The rule and the domain only disagreed while the method was
forced to be called `Invoke`.

**Until the rest is decided, the fixture bends, not the ruleset.**
