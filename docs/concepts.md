# Concepts

Definitions, not descriptions. Everything here is true of the code today; nothing
describes a component that does not exist yet.

## A tool is an RPC method that declares itself

```proto
rpc GetForecast(GetForecastRequest) returns (GetForecastResponse) {
  option (garm.tool.v1.tool) = { name: "weather.v1.get_forecast" };
}
```

There is no registry, no manifest of tools, no list to keep in step. The
declaration lives on the thing it describes, so the two cannot disagree.

## An agent is a tool a runner answers

```proto
option (garm.tool.v1.tool) = {
  name: "trip-planner"
  agent: { tools: [ { name: "weather.v1.get_forecast" } ] }
};
```

The `agent` block's **presence** is the whole of what makes something an agent.
Absent, a service answers the call itself. Present, a runner answers it, and the
block says what that run may call in turn.

So the distinction is not tool-versus-agent. It is **who answers this call** — a
service, or the platform. One optional field, not two kinds of thing.

Which means an agent appearing in another agent's allowlist needs no special
case: it is an ordinary entry, because an agent is an ordinary tool.

## Identity is the `name`. The proto path is an address

A tool's identity is its declared `name`. The method's proto full name —
`weather.v1.WeatherService.GetForecast` — is **where the declaration lives**, and
is never used to identify anything.

This is the most load-bearing rule here, and it is a scar. The previous estate
gave an agent both a short declared name and a proto full name, used both as
identity in different places, and twice a component passed one where another
expected the other. Each time the symptom was a refusal with a plausible message
and a cause three services away.

If you are holding a dotted proto path and something wants a tool, you are holding
an address and need to look up the name.

One consequence worth knowing: because identity lives in the option, **method
names are free to read naturally.** An agent's method can be `PlanTrip` rather
than `Invoke`, since nothing reads it.

## The allowlist is the only authority

An agent's `agent.tools` is the complete set of tools a run may call. Nothing
widens it — not a prompt, not a graph, not a runtime decision.

It cites tools **by name**, which means there is no proto import and no compile
error when an entry is wrong. The relationship between an agent and what it may
call **cannot be expressed in protobuf.** That is why `garmctl compose` exists.

## An image is one repository's output. A catalogue is what runs

| | produced by | what it is |
|---|---|---|
| **image** | `buf build` | one repository's protos, compiled |
| **catalogue** | `garmctl compose` | many images merged, with every check passed |

Tool definitions live in different repositories, built by different teams at
different times. An image is what one team publishes. A catalogue is the one
namespace they compose into — and composing is where a collision between two
teams is found.

**The merge happens at build time, not at startup.** Nothing coordinates naming
between repositories, so two teams can each declare `weather.v1.get_forecast` and
neither will know. In CI that is a failure with somebody to tell. At boot it is a
plane that will not start.
