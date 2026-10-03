# A subject is derived from the identity, not the address

**Date:** 2026-10-03
**Status:** active

**Decision.** A tool is answered at `garm.tool.` + its declared name.

```
garm.tool.weather.v1.get_forecast     declared as weather.v1.get_forecast
garm.tool.trip-planner                declared as trip-planner
```

## What was rejected: routing on the proto path

The estate this replaces did exactly that — `contracts/wire.Subject` turned
`/calc.v1.Calculator/Add` into `calc.v1.Calculator.Add`.

That throws away the entire point of
[separating identity from address](2026-10-03-identity-is-not-an-address.md). A tool
re-homed to a different proto package, service or method keeps its subject here,
because its *name* never changed; routing on the address means every caller has to
be updated for a refactor that changed nothing a caller cares about.

Nothing is lost in exchange. A caller asks for a tool **by name** — that is what a
name is — so it can always compute the subject.

It also **deletes a workaround**. That estate derived endpoint names from the whole
subject, with a comment explaining why: *"two proto services in one process would
otherwise both offer an endpoint called Get — and it is the SECOND registration
that fails, long after the first looked fine."* Names are unique across a composed
namespace, so the collision cannot happen.

**An agent is a tool**, so a runner mounts one through this same interface and
nothing in the transport knows which is which. That is what keeps
[routing is registration](2026-10-03-routing-is-registration.md) true rather than
aspirational.

## The prefix is a constant, not configuration

It keeps our traffic apart from everything else on a cluster and makes
`garm.tool.>` a usable observation point. Two deployments sharing a cluster are
separated by NATS **accounts**, which is the mechanism that exists for it. A
configurable prefix would be a knob nothing enforces.

## The endpoint name, and why replacing dots is total

micro's name charset is `^[A-Za-z0-9\-_]+$` — it excludes the dot — while a subject
may contain them. So `$SRV.INFO` shows `weather_v1_get_forecast`.

That substitution is **total only because of**
[the tool-name charset rule](2026-10-03-a-tool-name-must-be-routable.md): every
character other than the dot is already guaranteed legal. The two rules meeting is
asserted with micro itself as the judge, not by reading both regexes and agreeing
they look compatible.

## No queue group is set

micro's default applies, so every instance answering a subject shares one group —
which is what request/reply wants: exactly one responder per call, whoever is
serving.

The old estate used the **proto service name** as the queue group, which tied load
balancing back to the address. Two deployments of one tool whose protos were
organised differently would not have balanced against each other.

## New validates what micro would reject

`natsserve.New` refuses a name or version `micro.AddService` would refuse, so a
misconfigured process fails at construction rather than after it has started doing
work. `natsserve/validate.go` therefore **copies micro's two regexes**, which that
package does not export.

Copied rather than approximated, and the copy is checked: a test builds real
`micro.Config` values and asserts `New` and `micro.AddService` agree on every one.
A looser pattern would let a process start and fail later; a stricter one would
refuse a config that works. A divergence shows up as a failure rather than as drift.

## Start and Serve are separate, and the Flush is the point

```go
svc.Start(nc)        // mounts, and returns only once the tools are ANSWERING
log.Info("ready")    // a readiness probe can hang off this line
svc.Serve(ctx)       // until SIGTERM, then drains
```

`Run` is both, for a process that wants neither separately.

They are separate because *mounted* and *serving* are different facts, and a process
needs the first on its own: it must not report itself ready before mounting has
actually succeeded.

**`Start` ends with `nc.Flush()`, and that is what makes its promise true.** A
subscription is sent asynchronously, so without it `Start` returns while the server
has not been told what we answer — and a caller gets *"no responders available"* for
a service that is, by then, perfectly fine.

That is not hypothetical: this package's own first tests started `Run` in a goroutine
and flushed from the test goroutine, which synchronises with nothing. The flush could
complete before `Run` had mounted anything. They passed locally and **failed in CI**,
which is how the split was found.

## Shutdown: three steps, and the order is the whole of it

```go
svc.Stop()                 // DRAINS each subscription — a queued call is still delivered
nc.Barrier(…)              // fires once every pending callback has been DISPATCHED
s.inFlight.Wait()          // every handler that will run has registered by now
```

`Stop()` drains rather than unsubscribes, so a call already queued still arrives.
But `Subscription.Drain` returns immediately, so **waiting only on the in-flight
counter is wrong**: it reaches zero when the first handler finishes, Run returns,
the process closes its connection, and a call that was queued behind that handler
never gets an answer. Its caller waits for its own deadline — once per deploy, per
queued call.

`Conn.Barrier` is the documented primitive for exactly this: it fires only after
every pending callback has been dispatched.

**The first version of the test for this was vacuous**, and it took deleting the
Barrier to find out. One slow call, cancelled while it ran, passes without the
Barrier — because the in-flight counter already covers a handler that has *started*.
The case the Barrier exists for is a call **queued and not yet dispatched**, which
needs two calls, since a subscription's messages are dispatched serially. The test
also has to give the caller its **own connection**: closing a shared one kills the
caller's wait for its own reply, which looks identical to a dropped answer.

## Handlers get the values of Run's context and none of its cancellation

`context.WithoutCancel`, not `ctx`. Shutdown cancels `ctx`, and the point of the
drain above is that an accepted call still gets answered — so handing that call a
cancelled context tells it to abort at the exact moment we have committed to
finishing it. A ctx-aware handler would fail one call per deploy, per queued call,
while the drain politely waited for it to.

Found by re-reading the code rather than by a failure, which is why it has a test.
With `ctx` passed straight through, that test's handler sees `context canceled` and
answers `UNAVAILABLE: shutting down`.

The **caller's own request deadline** stays the authority on how long a call may
take, which is where that authority belongs.

## Every path replies

A handler that returns without responding leaves its caller waiting for its own
deadline, so there is one exit for errors and it is always taken. Three cases are
easy to miss:

| | |
|---|---|
| the request does not unmarshal | `INVALID`. The unmarshal error is local — it quotes field numbers and lengths from whatever was actually sent |
| the response does not marshal | `INTERNAL` |
| `Respond` fails | `INTERNAL` — most often the response exceeds `max_payload`, and the error reply is small enough to fit where the response was not |

That last one is the difference between a caller learning something and a caller
hanging, and it has a test with a 2 KiB `max_payload` on a real server.

## What step 8 does not do

No generated client, no `$SRV.INFO` consumption, no descriptor hash, no runner, no
gateway, and **no per-call timeout** — a hung tool is the caller's own deadline to
enforce, and imposing one here would be a policy with no stated reason.
