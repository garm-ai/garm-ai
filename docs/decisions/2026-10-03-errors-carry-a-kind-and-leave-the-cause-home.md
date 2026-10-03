# Errors carry a kind, and leave the cause at home

**Date:** 2026-10-03
**Status:** active

**Decision.** A tool returns `*serve.Error` with a **kind** from a closed proto
enum, a message it chose, and a cause that **never crosses the wire**. Any other
error becomes `INTERNAL` with a fixed message and a correlation id.

```go
return nil, serve.NotFound("no customer %q", id)
return nil, serve.Invalid("start date is not a date").Because(parseErr)
return nil, serve.Internal(err)                     // no message parameter
```

## What was rejected: the estate's `CodedError`

```go
type CodedError struct { Code string; Message string }   // "404", "400"
```

Three things wrong with it, and the first explains the other two.

**`Code string` derives the type from the encoding.** Its own comment says so:
*"they are strings because NATS micro's error code header is a string."* The wire
needs a string; the API does not. Everything downstream then type-checks nothing —
`"4O4"` compiles.

**The strings are HTTP's.** What is `404` for a tool? "no customer with that id"
and "no such tool" are unrelated events — one is the tool answering, one is routing
failing — and `404` collapses them. It borrows a vocabulary from a protocol this
platform does not speak.

**It leaked by default.** `Message` was published verbatim, and a bare error got
*"'500' plus that error's own words."* So the ordinary
`fmt.Errorf("query customers: %w", err)` a handler writes without thinking about
any of this shipped the connection target to the caller.

## Five kinds, and the test for a sixth

`INVALID`, `NOT_FOUND`, `DENIED`, `UNAVAILABLE`, `INTERNAL`.

A member is admitted on one test: **does a caller act differently, or does a human
diagnose differently?** `UNAVAILABLE` is the only kind worth retrying — that is a
caller action. `NOT_FOUND` leads to the same caller action as `INVALID` and is
still separate, because it is the most common honest answer a tool gives and a
human reading logs needs to see it. A sixth needs one of those to point at, or it
is a taxonomy, and this platform has shipped a taxonomy nothing read before.

`DENIED` is **this tool's own rules about its own data** — an account is frozen.
Platform authorisation refusing a call before a tool is reached is a different
event and is not this, because the tool never ran.

## The vocabulary is proto, in its own package

`garm/invoke/v1/error.proto`, not `garm/tool/v1`. That one is **declaration**, read
at compose time by a linter to decide what exists. This is **invocation**, read at
call time by a transport to decide what a caller is told. Different lifecycles and
different readers, and folding them together would make every tool author's compile
depend on the invocation surface evolving.

Proto rather than a Go enum because the kinds are part of what a tool contract
promises its callers. A Go-only vocabulary is the list a Python SDK transcribes
slightly differently — the one-idea-implemented-twice bug this repository exists to
avoid.

## Safe by default, unsafe only on purpose

**`serve.Wire` is the only path from a handler's error to the wire**, and the rule
is one sentence: **only an explicit kind publishes a message.**

| what a handler returns | what the caller sees |
|---|---|
| `fmt.Errorf("query customers: %w", err)` | `INTERNAL` · fixed message · id |
| `&serve.Error{Message: "…"}` — kind unset | `INTERNAL` · fixed message · id |
| `&serve.Error{Kind: INTERNAL, Message: "…"}` | `INTERNAL` · **fixed message** · id |
| `serve.NotFound("no customer %q", id)` | `NOT_FOUND` · those words · id |
| `serve.NotFound(…).Because(dbErr)` | `NOT_FOUND` · those words · id. **The cause is logged, never sent** |

So a tool author **cannot leak by being lazy, only by being deliberate** — the
inverse of the default being replaced.

`Internal` takes a cause and **no message**, and `Wire` refuses to read `Message`
for that kind at all. Otherwise the constructor's protection would be a suggestion:
a struct literal setting both fields walks straight round it.

## The cause stays home because that is where the unsafe things are

Not caution. A wrapped pgx error carries the connection target, a constraint
violation carries the value that violated it, a file error carries a path. So
`invokev1.Error` **has no cause field** — the absence is the design, and there is
nowhere for a future well-meaning change to put one.

The chain stays reachable locally: `*serve.Error` is a pointer implementing
`Unwrap`, so `errors.Is` and `errors.As` see through it, and `Error()` includes the
cause for the log. The estate this replaces used a value type with a value receiver
to get the same reach, which was a workaround for having no `Unwrap` at all.

## The trap that makes totality non-negotiable

`micro.Request.Error` **returns an error and never calls `RespondMsg`** when given
an empty code or description — read from nats.go v1.54.0. So a mapping that could
produce either does not send a bad reply, it sends **no** reply, and the caller
hangs until its own deadline.

`Wire` is therefore total: a non-nil error always yields a non-nil `Error` with a
kind that is never `UNSPECIFIED` and a message that is never empty, and
`TestWireNeverProducesSomethingMicroRefuses` pins every path through it.

## One defect this found in its own first draft

`Internal(cause)` leaves `Message` empty, and the first revision fell through to
`e.Kind.String()` — publishing `"ERROR_KIND_INTERNAL"`. Safe, non-empty, and
useless: it does not tell the caller the one thing it can act on, which is to quote
the id. No test noticed until the empty-message guard was removed on purpose to
check that it bit. The assertion is now `strings.Contains(message, "id")`.
