# A tool name must be routable, and that is a security rule

**Date:** 2026-10-03
**Status:** active

**Decision.** `declared` refuses a tool name that is not a dot-separated sequence
of `[A-Za-z0-9_-]+` segments. It fails at compose, in CI, before anything is
deployed.

```
accepted:  weather.v1.get_forecast   trip-planner   support_assistant   A1.b2.C3
refused:   a.*.b   a.>.b   a..b   .leading   trailing.   "get forecast"   café.v1.order
```

## Why it is not a tidiness rule

NATS treats `*` and `>` as subscription wildcards. A tool named `a.*.b` becomes a
subject containing a wildcard, so the service mounting it **receives other tools'
requests** — a confused deputy opened by a name nobody checked.

**Nothing downstream catches it.** NATS micro's own subject validation is
`^[^ >]*[>]?$`: it rejects a space and a bare `>`, and accepts `*` without
complaint. Read from the source while designing the transport, not assumed. So
micro is not the backstop, and a transport that trusted it would mount the
wildcard silently.

An empty segment is the same class of problem, quieter: `a..b` addresses nothing
and a broker collapses it without saying so.

## Why the charset is not justified by NATS

Deliberately. A name ends up in a policy key, a log line, a metric label, a URL
path and a broker subject. The charset is the intersection of what all of those
accept, chosen once — which is cheaper than discovering each separately, and
cheaper still than the alternative above.

So the rule stands on its own terms and the transport gets its safety as a
consequence. **The contract does not name a broker**, which is what keeps
[transport as a port](2026-10-03-routing-is-registration.md) true.

## Why in `declared` rather than the transport

It fails in CI with somebody to tell, rather than at service start. That is the
same reasoning as
[images merge at build time](2026-10-03-images-merge-at-build-time.md): a naming
failure found at boot is a plane that will not start.

It also sits beside the duplicate-name rule in `FromFiles` for the same reason
that one is there — an index keyed on a name that cannot be used as one is not a
Set with a problem, it is not a Set.

## Two refusals where one would do, and why

The charset check alone would already reject `*`, since it is not in
`[A-Za-z0-9_-]`. The wildcard branch exists **only so the message names the
consequence**, and a test asserts that it does.

Without it a reader sees *"each dot-separated segment must be one or more of
A-Z a-z 0-9 _ -"* and concludes the rule is fussy, and the obvious fix is to
relax the charset. With it they read that the name *would intercept other tools'
calls*. A refusal that does not explain itself gets argued with.

## What is still not enforced

**The shape.** `<package>.<tool>` remains a convention. Enforcing it needs a
decision about what a package is that nobody has made, and the charset closes the
hole without it.
