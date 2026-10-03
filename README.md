# garm-ai

A second attempt at the garm platform core, built thin and proven one step at a
time.

Declare a tool as an RPC method carrying one option. Compose many repositories'
declarations into one verified namespace. Generate the transport glue, so a tool
author implements an interface and writes nothing else.

## Documentation

- **[docs/concepts.md](docs/concepts.md)** — what a tool, an agent, an image and a
  catalogue are. Definitions, not descriptions.
- **[docs/guide.md](docs/guide.md)** — building a tool and an agent, walking through
  `examples/`, which `mise run ci` composes and compiles. Rename a field and the
  guide breaks in CI rather than misleading somebody next month.
- **[docs/invariants.md](docs/invariants.md)** — every invariant with the test that
  keeps it true, and a second table for the ones nothing checks yet.
- **[docs/roadmap.md](docs/roadmap.md)** — the single list of what is built, what is
  next, and **what each unbuilt thing waits on**. That third column is the rule
  below, made checkable.
- **[docs/architecture.html](docs/architecture.html)** — the map. Four bands, from a
  `.proto` to a running call, with built / next / designed-only filterable.
  <https://claude.ai/artifact/8WincMNCabDf7nUJ944SLJ>
- **[docs/deployment.html](docs/deployment.html)** — the deployment view: DBOS and
  Temporal as two implementations of one declared kind, and a synchronous call traced
  frame by frame into a core banking system.
  <https://claude.ai/artifact/1wsUsYKhDPumcWYNdFNoeK>
- **[docs/specs/](docs/specs/)** — how a component works, with numbered call
  stacks. **Specs for this repository live in this repository**, not in the private
  design record beside it.
- **[docs/decisions/](docs/decisions/)** — one file per decision, titled by the
  decision, each recording what was rejected and why. Each carries a `**Status:**`
  line from `active · parked · superseded by <file>` — grep it before trusting a
  file, because a stale decision reads as current.

The step-by-step history is **`git log`**. Every commit message carries its own
reasoning, and it is the one record that cannot drift from the code, because it is
attached to the diff. This README says what exists; it is not a changelog.

The old estate had **273,768 lines of markdown** and still shipped five concepts
declared and enforced by nothing, a runbook whose tool counts read 10/3/4 where the
plane measured 14/8/5, and a README asserting artefacts were byte-identical when
they were not. Volume was never the problem. Prose stating a fact nothing checks
was. So: definitions are written, invariants name their test, and **numbers are
generated** — `garmctl compose` prints the count, no document transcribes it.

## What exists

| | | |
|---|---|---|
| `proto/garm/tool/v1/tool.proto` | the whole contract | four fields. A tool declares a `name` and optionally an `agent` block |
| `declared/` | what protobuf cannot express | indexes declarations by name, refuses a duplicate, resolves every allowlist entry |
| `fetch/` | bytes from a URI, verified | `file://` `s3://` `https://`, digest required for remote. **One fetcher, two artefacts** — an image and a catalogue are fetched alike and are not the same thing |
| `images/` | many repositories, one namespace | what a manifest means: merge, dedup, refuse divergence |
| `cmd/garmctl` | the command people type | `garmctl compose images.yaml -o build/catalogue.binpb` |
| `cmd/protoc-gen-garm-go` | the generator | a handler interface, `Serve<Service>`, and the names it answers. No `Unimplemented` embed |
| `serve/` | the interface generated code is written against, and the error kinds | so generated code imports no broker |
| `natsserve/` | the transport | mounts a tool at `garm.tool.<name>`, drains on shutdown. **The only package that imports a broker** |
| `proto/garm/invoke/v1/` | what a tool says when it cannot answer | five kinds. No cause field, deliberately |
| `examples/` | the guide, executable | two buf modules, as two repositories |

```
mise install        the toolchain, from mise.toml and nowhere else
mise run ci         lint and vet · generated Go matches the protos · no broker in a
                    tool author's build · the declaration check · the examples
                    composed · tests with -race against a real nats-server
```

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

## Two fixture trees, and why both

Asked, reasonably, on the step that generated code from both. They are not two
copies of one idea.

| | `proto/testdata/` → `testdata/v1/` | `examples/` |
|---|---|---|
| exists to express | **failures** | **the guide** |
| so its names are | deliberately **ugly** | deliberately **exemplary** |
| buf modules | one, inside this repo's own image | **two**, modelling two repositories |
| read by | `declared` and `internal/generate` tests | a human following `docs/guide.md` |
| in `go build ./...` | no — Go excludes `testdata/` | yes |

The fixture's value is precisely that it does what the guide forbids: its agent's
identity is `support-assistant` while its address is
`testdata.v1.SupportAssistantService.Invoke` — mismatched on purpose, so code that
confuses one for the other fails a test rather than failing in production three
services away — and its RPC is called `Invoke` with an `InvokeRequest`, which is
the naming the examples argue against. A tree cannot be both the bad example and
the good one, and the examples cannot be one module, because being two is the
thing they demonstrate.

Honest caveat: they now have the same *shape* — a tool service plus an agent. If a
third fixture shape appears, that is the moment to check whether one can go.

## What is next

**Nothing calls a tool for you.** A caller marshals a request and does
`nc.Request(natsserve.Subject(name), body, timeout)` itself. A generated client, and
whether discovery (`$SRV.INFO`) or a composed catalogue is how a caller learns what
exists, is the next step.

## What is deliberately absent

No clearance, compartments, verbs, tool sets, principal ceiling, bounds, model,
prompts, graph, or consent — and a dozen other things, each listed in
**[docs/roadmap.md](docs/roadmap.md)** beside what it waits on.

They are absent because nothing enforces them yet, and in the old estate the
authority model is where all four of 2026-10-02's bugs lived.

## Working on this

One person, committing to `main`, with every step gated by review in conversation
before the code exists — which is a tighter gate than a pull request, and consistent
with this estate's standing rule that nothing is in production and we fix forward.

Branches and pull requests start at the first of: a second committer, or the first
consumer repository pinning a tag of this one. That is when breaking `main` starts
costing somebody else.
