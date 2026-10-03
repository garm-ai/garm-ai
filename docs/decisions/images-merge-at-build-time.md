# Images merge at build time, never at boot

**Decision.** `images.yaml` lists the built images that compose into one namespace.
`garmctl compose` resolves, merges, checks, and emits one artefact — in CI.

**Why not at boot.** Nothing coordinates naming between repositories, so two teams
can each declare `accounts.v1.get_customer` and neither will know. In CI that is a
failure with somebody to tell. At boot it is a plane that will not start — which
the estate this replaces experienced, and its own manifest records the date.

**So a collision error names both images, not two file paths.** That is the only
form a stranger in another repository can act on. `declared` returns a typed error
carrying descriptors because it knows nothing about images; the provenance that
turns those into sources lives in `garmctl compose`.

## Three things established by experiment rather than assumed

**A naive merge always fails.** Every image carries its own copy of the shared
dependencies, and `protodesc.NewFiles` refuses a repeated path outright. So
deduplication by file path is not an optimisation, it is a precondition.

**Cross-version tool definitions compose for free.** An image built against a
`tool.proto` the platform has never seen — carrying an extra field 99 the team set —
was read correctly, because options parse against *the reader's* extension type.
Protobuf's evolution rules already solve declaration drift.

This retired a strict-refusal design that had been written for divergent contract
copies before the probe was run. What needs *bytes* to agree is a separate concern:
a gateway marshalling a request a tool must unmarshal, which is what that estate's
descriptor hash protected. Two different problems, easily conflated.

**A shared file with different bytes in two images is refused.** Taking either copy
silently means one team's tools are read against a contract they never compiled
against.
