# garm-ai

A second attempt, built thin and proven one step at a time.

## The rule this repository exists to keep

**A field arrives when the thing that enforces it arrives. Never before.**

The estate this replaces declared eleven fields on its agent options and fifteen
on its tool options. An audit on 2026-10-03 traced every one to its enforcer and
found five declared and enforced by nothing: `output_rules` (whose own comment
admitted it was "parsed by lint, not evaluated"), `Fga` and `ListFilter` (a
complete instance-authorization vocabulary with no implementation), and
`FieldPolicy.source` (enforced in the runner only, while a comment claimed the
gateway did it). A sixth, `Audience`, filtered a listing while reading like a
gate.

None of that was carelessness. Each was added in good faith slightly ahead of its
enforcer, and nothing ever checked the gap. So the gap is the thing this
repository refuses to open.

## How a step works

1. One property, stated as a sentence somebody could disagree with.
2. The declaration it needs, and nothing more.
3. A test that reads a **real compiled descriptor**, never a hand-built struct.
4. Proof the test can fail — break it, watch it fail, restore it.
5. Stop. Review. Next step.

Point 3 is not style. Four tests in the old estate passed while the behaviour
they covered was broken, and all four had fixtures that could not express the
failure.

## Steps so far

**Step 1 — an agent declares a name and the tools it may call.** Superseded in
shape by step 2; its two properties survive.

**Step 2 — everything is a tool, and an agent is a tool a runner answers.**

A tool is an RPC method carrying `(garm.tool.v1.tool)`. It declares a `name`, and
optionally an `agent` block. **Absent: a service answers the call itself.
Present: a runner answers it, and the block says what that run may call.**

The distinction is not tool-versus-agent. It is **who answers this call** — a
service, or the platform. That is one optional field, not two option types at two
attachment levels, which is what the previous estate had and what cost it a lint
rule (`lintAgentDoorParity`) existing for no other purpose.

Three properties, each with a test proved able to fail:

1. **A tool's `name` is its one identity; its method's proto full name is an
   address.** Direct fix for the two most expensive bugs of 2026-10-02, where a
   thing had both and twice one was passed where the other was expected.
2. **A plain tool declares no agent block**, and an agent declares one.
3. **One namespace.** An allowlist entry names a tool by the same spelling the
   tool declares. So an agent in another agent's allowlist needs no special case,
   and "the allowlist is the only authority" became checkable: an entry either
   resolves to a declared tool or it does not. Breaking this test by citing an
   *address* in the allowlist reproduces the old bug exactly, and it fails.

**Step 3 — the allowlist is enforced, not asserted.**

An allowlist entry is a **string**. Protobuf cannot tell you whether any tool has
that name: there is no import, no type reference, no compile error if it is wrong.
buf confirmed this directly by rejecting the agent file's import of the tools it
names as *unused* — the relationship is not expressible in proto.

So `declared/` answers what protobuf cannot:

- `From(files)` indexes every declaration by name, and **refuses two tools
  claiming one name** — not a lint rule but a precondition, since a name
  resolving to one thing is what allowlists, policy keys and ledger rows rest on.
- `Unresolved()` returns every allowlist entry naming a tool nobody declared.

`cmd/garm-check` runs it and **exits non-zero**, wired into `mise run ci` from the
step it was written. A rule nobody runs is not a rule: the estate this replaces
accumulated eight checks that were configured and never ran clean, each reading as
a guarantee.

It is a package rather than code inside the command because a gateway needs the
same answer at run time that a linter needs at publish — and the previous estate's
worst structural bug was two implementations of one idea, where a CEL dialect
existed twice and the copies resolved types differently, so a guard could pass
lint and fail at load.

The fixture puts the agent in a different file from the tools it names, so a test
can load a **partial** tree and watch the allowlist fail to resolve. That is not
contrived: the previous estate shipped a `--proto` flag that compiled one
directory and then judged it as the whole, reporting valid trees as broken.

**Step 4 — many images become one namespace, at build time.**

Tool definitions will live in different repositories, built by different teams at
different times. `images.yaml` lists the built images that compose into one
namespace; `garm-compose` resolves, merges, checks, and emits one artefact.

Three things were established by experiment rather than assumed:

1. **A naive merge always fails.** Every image carries its own copy of the shared
   dependencies, and `protodesc.NewFiles` refuses a repeated path outright. So
   deduplication by file path is not an optimisation, it is a precondition.
2. **Cross-version tool definitions compose for free.** An image built against a
   `tool.proto` the platform has never seen — carrying an extra field 99 the team
   set — was read correctly, because options parse against *the reader's*
   extension type. Protobuf's evolution rules already solve declaration drift.
   What needs bytes to agree is a later concern: a gateway marshalling a request
   a tool must unmarshal, which is what the previous estate's descriptor hash
   protected. Two different problems, easily conflated.
3. **A shared file with different bytes in two images is refused**, because taking
   either copy silently means one team's tools are read against a contract they
   never compiled against.

**The merge happens at build time, not in a gateway at startup.** Nothing
coordinates naming between repositories, so two teams can each declare
`accounts.v1.get_customer` and neither will know. In CI that is a failure with
somebody to tell; at boot it is a plane that will not start — which the previous
estate experienced, and its own manifest records the date.

So the collision error names **both images**, not just two file paths, since that
is the only form a stranger in another repository can act on. `declared` reports a
typed error carrying descriptors because it knows nothing about images; the
provenance that turns those into sources lives in `garm-compose`.

Remote fetchers (`s3://`, and git tags as `https://` release assets) are step 5,
and the digest that makes them reproducible arrives with them — because a digest
nothing verifies is a promise that reads like a guarantee.

**Step 5 — one command, `garmctl`.**

```
garmctl compose images.yaml -o build/catalogue.binpb
```

Named `garmctl` rather than `garm` because the estate this replaces publishes a
`garm` binary; during any migration both would be on `PATH`. The module paths
differ so Go is untroubled — a shell is not.

Cobra, and the reason was not "more commands are coming". The hand-rolled parsing
it replaced swallowed unknown flags as positional arguments, did not support
`-o=value`, and answered `--help` with `open --help: no such file or directory` —
it tried to read `--help` as a manifest. That is not a thin tool, it is an
unfinished one.

### Two artefacts, and the difference matters

| | built by | what it is |
|---|---|---|
| `build/image.binpb` | `buf build` | **one repository's** protos, compiled. What a team publishes |
| `build/catalogue.binpb` | `garmctl compose` | **the merged, verified namespace**. What a platform runs |

With one image the bytes are nearly identical, which makes the distinction easy to
miss — and it is the one that matters. An *image* is one team's output; a
*catalogue* is many images merged with every collision check passed. It is also
why the package is `declared` and the artefact is `catalogue`: one is the view
over descriptors, the other is the thing that was verified.

### What is deliberately absent, and why `mode` never arrives

There is no `mode`, `type` or `kind` saying which runner answers an agent. That
follows from an invariant the previous estate wrote down and then broke —
`garmd/CLAUDE.md:21`: *"garmd does not know about agents. An agent is a tool: a
service at a NATS subject."*

If a runner is a NATS micro service like any other, which runner answers a given
agent is decided by **which service registered the subject**, discovered the same
way every other service is. The gateway routes by tool name and never learns that
runners or agent types exist. A `mode` field would hand it that knowledge for
nothing — and under the rule above it has no enforcer, because nothing reads it
if routing is registration.

## What is deliberately absent

No clearance, compartments, verbs, tool sets, principal ceiling, bounds, model,
prompts, graph, or consent. Every one is real and most will return. They are
absent because nothing enforces them yet, and in the old estate the authority
model is where all four of 2026-10-02's bugs lived.

## A convention decision deliberately deferred

buf's `STANDARD` lint has now fought the domain twice in two steps:
`SERVICE_SUFFIX` wants `SupportAssistantService` where an agent is a named actor;
`RPC_RESPONSE_STANDARD_NAME` wants `InvokeResponse` where one shared `RunRef`
across every agent is better design, and `RPC_REQUEST_RESPONSE_UNIQUE` would
object to the sharing too.

The previous estate hit all three, configured `STANDARD` anyway, and **never ran
it clean** — `examples/bank` emits eight violations today. So the config claimed
one thing and the tree did another, and nothing noticed.

The decision is not being dodged; it is deferred to the step that writes a real
proto, with a reason, in the config. Until then **the fixture bends, not the
ruleset** — because a lint nobody honours is worse than no lint, since it reads
as a guarantee.

`mise run ci` — lint, a check that the committed generated Go matches the protos,
and the tests.
