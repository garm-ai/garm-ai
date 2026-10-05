# garm-ai

A second attempt at the garm platform core, built thin and proven one step at a
time.

Declare a tool as an RPC method carrying one option. Compose many repositories'
declarations into one verified namespace. Generate the transport glue, so a tool
author implements an interface and writes nothing else. Put it on a NATS bus in
operator mode, where every process holds a credential derived from the catalogue
and the caller's identity is placed in the subject by the server. Trace every
call end to end.

## Getting started

Seven commands, on a laptop. Every one of them is run by `mise run ci` in some
form, so if this block is wrong the build is red.

```bash
mise install                                                   # the toolchain, pinned in mise.toml
mise run ci                                                    # lint · breaking · vuln · generated Go current · no broker / no SDK in a tool author's build · examples composed · tests with -race against a real nats-server

garmctl compose examples/images.yaml -o build/catalogue.binpb  # two repositories' declarations -> one verified namespace
garmctl topology --dev --catalogue file://build/catalogue.binpb --callers forecast -o build/topo
                                                               # a THROWAWAY operator, accounts, one credential per process, a server config -- never for a deployment
nats-server -c build/topo/nats-server.conf &                   # operator mode, TLS, every account preloaded
go run ./examples/cmd/weatherd --creds build/topo/creds/weather.v1.WeatherService.creds --tls-ca build/topo/ca.pem --health 127.0.0.1:8081
go run ./cmd/rund              --creds build/topo/creds/rund.creds --tls-ca build/topo/ca.pem --catalogue file://build/catalogue.binpb --callers build/topo/callers.json --health 127.0.0.1:8080
go run ./examples/cmd/forecast --creds build/topo/creds/forecast.creds --tls-ca build/topo/ca.pem
```

Or all of it in one go, with the answer checked: `mise run e2e`.

**With Docker** — the bus and the telemetry backend as containers, from
[compose.yaml](compose.yaml): after the `topology --dev` line,

```bash
docker compose up -d                                           # garm-nats, booted from build/topo's config (operator mode, TLS); OpenObserve on :5080
mise run e2e-compose                                           # the quick start against both -- and the forecast's trace looked up in OpenObserve
open http://localhost:5080                                     # root@example.com / Complexpass#123; Traces -> one trace, three spans, three services
```

`docker compose up` replaces the `nats-server` line; the three `go run` lines
then need `OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:5080/api/default` and
`OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic $(printf 'root@example.com:Complexpass#123' | base64)"`
to ship there. Ports clash with something on your laptop? `NATS_PORT=14222
O2_PORT=15080 docker compose up -d`, and the same two variables for `e2e-compose`.

`forecast` names a tool and nothing else; it reaches `rund`, which reaches
`weatherd`, and the answer comes back through three accounts the caller cannot
cross by itself. Set `OTEL_EXPORTER_OTLP_ENDPOINT` (and `_HEADERS`) and every one
of those processes ships one trace per call to whatever is listening; unset,
each says `observability exporter=none` and ships nothing. `curl
127.0.0.1:8080/readyz` is 200 exactly while `rund` answers `$SRV.PING` — after
`Start`, until it begins to drain — and a test holds the two to that.

A deployment replaces `--dev` with a root ceremony run offline once
(`garmctl operator init`) and an issuance environment that holds the signing
keys; [docs/guide.md](docs/guide.md) §4 walks through both, and the rotation
that follows.

**To write a tool**, read [docs/guide.md](docs/guide.md) from the top: one
`.proto` option, one Go interface, and the process is forty lines. **To
understand the shape**, start with [docs/concepts.md](docs/concepts.md) and the
three drawings below.

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
  Temporal as two implementations of one declared kind, a synchronous call traced
  frame by frame into a core banking system, and what each box holds to prove who
  it is. <https://claude.ai/artifact/1wsUsYKhDPumcWYNdFNoeK>
- **[docs/identity.html](docs/identity.html)** — the identity model: accounts,
  credentials, the caller placed in the subject by the server, the three keys and
  who holds each, and what is built versus designed.
  <https://claude.ai/artifact/9yks2uHDSptE3nAe8MocK1>
- **[docs/specs/](docs/specs/)** — how a component works, with numbered call
  stacks and the properties stated as tests: `rund`, identity and transport
  security, observability, signing keys. **Specs for this repository live in this
  repository**, not in the private design record beside it.
- **[docs/plans/](docs/plans/)** — the implementation plan each spec was built
  from, task by task; read one to see how a property was proved to fail first.
- **[docs/decisions/](docs/decisions/)** — one file per decision, titled by the
  decision, each recording what was rejected and why. Each carries a `**Status:**`
  line from `active · parked · superseded by <file>` — grep it before trusting a
  file, because a stale decision reads as current.
- **[docs/reviews/](docs/reviews/)** — dated gradings of the whole repository
  against a stated bar, with an action list and a progress table that says what
  each finding became.
- **[docs/performance.md](docs/performance.md)** — the per-call cost of the whole
  chain, one row per measurement, and what the number does not include.

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
| `serve/` | the seam a generated **server** is written against, plus the error kinds | so generated code imports no broker |
| `call/` | the seam a generated **client** is written against | and `call.Deadline`, which adds the hops to a declared budget |
| `catalogue/` | the verified namespace rund serves | immutable, digest-identified, behind an atomic pointer |
| `run/` | rund's engine | no NATS type in any signature |
| `rundsvc/`, `natscall/` | rund on NATS, and reaching it | `rund` reads the caller's account off the subject the server rewrote; `natscall` opens the call's span and never changes what it publishes |
| `cmd/rund` | the run manager | the only way a caller reaches a tool; `--callers` names them, `--health` answers a scheduler |
| `natsserve/` | the transport | mounts a tool at `garm.tool.<name>`, continues the caller's trace into the handler, drains on shutdown |
| `natsmicro/` | one NATS micro service, shared by `natsserve` and `rund` | the startup gate (a credential that does not cover a mount refuses to start), the drain that drops no work, `Ready()` held to agree with `$SRV.PING` |
| `natsconn/` | how a command connects | a credential file and a CA; the ten lines four commands share |
| `topology/` | the NATS operator-mode topology, generated from the catalogue | accounts, one credential per process with permissions derived from its declared tools, a signed issuance manifest, revocation by delta, signing keys and their rotation. **Keys are an input**: the root never enters it |
| `cmd/garmctl topology` / `operator` | the generator on disk, and the root ceremony | `--dev` for a laptop; `--keys`, `--keys-out`, `--rotate-signing`, `--verify-live` for a deployment |
| `observe/`, `observe/otlp/` | OpenTelemetry: the API side, and the only importer of the SDK | one trace per call, the quoted error id is the trace id, counters, `/livez` `/readyz`; everything over OTLP from the standard `OTEL_*` variables |
| `internal/estate/` | the whole chain in one process, for tests | operator mode, TLS, the full resolver, an in-memory telemetry recorder — the configuration that is tested is the one that is deployed |
| `proto/garm/invoke/v1/` | what a tool says when it cannot answer | five kinds. No cause field, deliberately |
| `examples/` | the guide, executable | two buf modules, as two repositories |

```
mise install        the toolchain, from mise.toml and nowhere else
mise run ci         lint and vet · buf breaking against main · govulncheck ·
                    generated Go matches the protos · no broker and no OTel SDK
                    in a tool author's build · the guide names only files that
                    exist · go.mod tidy · the declaration check · the examples
                    composed · tests with -race against a real nats-server
mise run bench      the per-call cost of the whole chain; not in CI, by design
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

**Nothing authorizes anything.** A caller's identity is proved — placed in the
subject by the server, carried on every trace — and then not used: any caller may
invoke any tool through `rund`. The order the last review set, and the roadmap
keeps: the run store (async delivery, `Fetch` with a result, audit) → **the
authority model** → person identity. [docs/roadmap.md](docs/roadmap.md) has every
unbuilt thing beside what it waits on.

## What is deliberately absent

No clearance, compartments, verbs, tool sets, principal ceiling, bounds, model,
prompts, graph, or consent — and a dozen other things, each listed in
**[docs/roadmap.md](docs/roadmap.md)** beside what it waits on.

They are absent because nothing enforces them yet, and in the old estate the
authority model is where all four of 2026-10-02's bugs lived.

## Working on this

Every slice is designed before it is built — a spec with its properties stated as
tests, reviewed one question at a time, then a plan — and built on a branch with
every property **proved to fail** before it is trusted: break the mechanism, watch
the test fail, restore. One fresh-context review of the whole branch at the end;
its Critical and Important findings are fixed test-first before the pull request
merges, and its minors are listed, not forgotten. Nothing is in production, so the
standing rule is break fast and fix forward, with zero technical debt carried.
