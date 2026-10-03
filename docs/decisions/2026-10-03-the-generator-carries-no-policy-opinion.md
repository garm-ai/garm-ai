# The generator carries no policy opinion

**Date:** 2026-10-03
**Status:** active

**Decision.** `protoc-gen-garm-go`, invoked by `buf generate`, emits per service
with at least one tool: a handler interface, a `Serve<Service>` function, and the
list of names that service answers. **Nothing else, ever.** Its output imports an
**exact** set of four packages, enforced by a test.

**Why a rule rather than a preference.** The estate this replaces had a generator
that started here and did not stop. Cards arrived later and were welded in, so one
tool's generated file reached 230 lines of which the tool was about 25: an optional
override interface, a package-level `sync.Map`, a reflective descriptor lookup, two
default card implementations and two extra mounted endpoints. Every consumer
repository carried all of it, regenerated, forever.

This repository emits 102 lines for two tools. Each addition to that was defensible
on its own, which is why the guard is an exact import set and not a denylist:
widening it is the decision to add a dependency to every consumer repository, and it
takes a failing test to make.

Anything that *decides* something is a library a handler calls. Putting it in
generated text instead is the decision to put it in every repository.

## Why a protoc plugin and not a `garmctl generate` subcommand

`buf generate` is already the one way Go is produced in a tree, and `gen-check`
already proves the committed output is current. A plugin reads the descriptors buf
has already parsed, including our extension, since options parse against the
reader's extension type. A subcommand would be a second resolver, covered by
nothing.

## The handler interface has no `Unimplemented` embed

Add a tool to the `.proto`, forget to implement it, and the build **fails to
compile** — rather than mounting and answering `Unimplemented` to a real caller at
run time. The grpc-go generator embeds one: that buys source compatibility and pays
for it with half-implemented services that start cleanly.

What holds it is not the comment. It is the `var _ <Service>Handler = …` assignments
in the tests and in `examples/weatherd` — delete an emitted method and those files
stop building, which is exactly what a tool author's build does.

## `serve.Registrar` is an interface, so generated code imports no broker

Three things follow, each a real cost in the previous estate:

- A tool module does not inherit a transport's dependency tree. That estate had an
  S3 client and a CLI framework reaching a ledger drainer that ran neither.
- The generator is testable with a fake and no port.
- The transport can be replaced without regenerating a single tool.

Its four arguments are the four facts that cannot be derived from each other. The
previous estate passed a six-field struct of which four were derived from the other
two, and every one of those four was a place for the generator and the runtime to
compute the same thing differently.

## What it refuses, and what it is not

**Not the uniqueness gate, and it cannot be.** buf invokes a plugin per module, so a
run holds one compile unit. A name resolving once across every image is
`garmctl compose`'s question — only it has the provenance to name which two
**images** a collision came from. What the generator checks is what is in front of
it, through the same `declared.FromFiles` compose uses: one implementation, two set
sizes.

**A streaming tool is refused with a sentence.** Emitted, it would produce a handler
signature that fails to compile, and the author would read a type error about
`proto.Message` instead of the reason.

**An RPC carrying no tool option gets no glue**, because generating it would publish
it under a name nobody declared.

## Deliberately deferred

No `DescriptorHash` and no `ContractVersion` constant. The old generator stamped
both. The hash is worth having and needs its own definition of wire shape plus a
golden test proving it moves on a field change and holds on a comment change. That
is a step, not a side effect of this one.
