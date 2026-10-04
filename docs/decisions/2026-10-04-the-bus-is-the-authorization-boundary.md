# The bus is the authorization boundary

**Date:** 2026-10-04
**Status:** active

**Decision.** NATS runs in **operator mode**. Accounts are the isolation boundary;
a tool service's permissions are **derived from the catalogue** by one generator
that serves both the test estate and deployment; `rund` learns which account
called from the subject **the server rewrote**, and decides nothing with it yet.
TLS is required. Keys are an input the generator never produces.

Spec: [identity and transport security](../specs/2026-10-04-identity-and-transport-security-design.md).
Drawn: [the identity page](../identity.html).

## What was rejected, and why

**Server-config accounts.** Simpler to read and to run, and the slice after this
one — auth callout — issues signed user JWTs regardless, needing an issuer account
key that operator mode already supplies. Starting config-based meant building the
account topology once now and again when callout landed. The heavier option was
chosen because the lighter one was debt with a date on it.

**Adapting the previous estate's authorization server.** 4,281 lines, most of them
features whose enforcers do not exist here — OpenFGA, approval grants, two exchange
flows, discovery metadata — and missing both of the things this slice needed:
transport authentication and the presenter binding. Thin was chosen with one rule:
few features, never hand-rolled crypto. JWTs and keys come from the libraries the
server itself uses.

**Identity in a header.** Worth exactly what the right to publish on that subject
is worth; a header is trustworthy precisely when a subject permission makes it so,
and never on its own. The subject rewrite gives the same property with nothing to
forge and nothing to verify.

**Enumerating tools in `rund`'s own permission.** Every catalogue change would then
reissue `rund`'s credential, and hot reload would be pointless — the permission
would lag the catalogue it exists to track. `rund` holds the wildcard import; what
bounds it is the catalogue it loads, which is why its credential is the one worth
protecting most.

## Two things narrowed, stated

**Transport swappability.** The claim that "`natsserve` is the only package that
imports a broker, so replacing the transport regenerates nothing" remains true of
generated code and is no longer true of identity, which is NATS-shaped to the core:
operator mode, token position, account isolation. Replacing the bus now means
redesigning this slice. That is the right trade for the chosen bus; the older claim
no longer stands unqualified.

**One account per caller.** Chosen over one per tenant because the mechanism —
`AccountTokenPosition` — yields the account either way, so coarsening later is a
topology change the generator absorbs, while the reverse would lose information
already recorded. The cost is real and recorded in the spec: a caller is an
account, auth callout creates none, and every integration partner is a provisioning
action until issuance has an API.

## What the build taught the spec

Four corrections, each made in the commit that found it:

- **§10's order was wrong.** "The estate switches to operator mode" could not be
  green before "`rund`'s subscription moves": the caller's import rewrites the
  subject, so an `rund` still on the flat subject receives nothing. The
  subscription moved with the estate; reading the caller stayed where it was.
- **Property 1 meets a different wall than the spike did.** The spike's caller was
  unrestricted and met account isolation as *no responders*. A real caller's
  credential may publish only `garm.run.v1.>`, so the server refuses the publish
  first — a *Permissions Violation*, reported asynchronously while the request
  waits. Both walls stand; the test asserts the one it reaches, and a timeout alone
  does not count.
- **Property 7 cannot be its own test.** The estate's tool answers on a connection
  a test cannot attach a handler to; a test written that way could never fail. It
  is held by property 2, the generator's permission test, and the probe that
  removing `_R_.>` turns property 2 into a timeout.
- **Property 11's planned test was vacuous.** nats.go sees `tls_required` and
  upgrades to TLS on its own, then fails on the untrusted certificate — a client
  refused by its own check, not by the server. The test speaks the protocol
  directly now, and failed on cue when TLS was made optional.

## What this does not decide

Who a *person* is; what any caller may *do*; where the issuance environment lives;
whether TOOLS is ever partitioned by sensitivity; anything about more than one
cluster. Each is in the spec's §12 or §13 by name.
