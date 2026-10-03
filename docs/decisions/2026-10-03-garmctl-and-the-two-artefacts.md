# `garmctl`, and the two artefacts it tells apart

**Date:** 2026-10-03
**Status:** active

**Decision.** One command, `garmctl`, on cobra.

```
garmctl compose images.yaml -o build/catalogue.binpb
```

**Why not `garm`.** The estate this replaces publishes a `garm` binary. During any
migration both would be on `PATH`. The module paths differ so Go is untroubled — a
shell is not.

**Why cobra, and it was not "more commands are coming".** The hand-rolled parsing it
replaced swallowed unknown flags as positional arguments, did not support
`-o=value`, and answered `--help` with `open --help: no such file or directory` — it
tried to read `--help` as a manifest. That is not a thin tool, it is an unfinished
one.

A detail from the same step: `SilenceErrors: true` was set with a comment claiming
cobra had already printed the error. It had not, so `--nonsense` exited 1 in
silence. A comment asserting a behaviour is not the behaviour.

## Two artefacts, and the difference matters

| | built by | what it is |
|---|---|---|
| `build/image.binpb` | `buf build` | **one repository's** protos, compiled. What a team publishes |
| `build/catalogue.binpb` | `garmctl compose` | **the merged, verified namespace**. What a platform runs |

With one image the bytes are nearly identical, which makes the distinction easy to
miss — and it is the one that matters. An *image* is one team's output; a *catalogue*
is many images merged with every collision check passed.

It is also why the Go package is `declared` and the artefact is `catalogue`: one is
the view over descriptors, the other is the thing that was verified. `declared` is
deliberately **not** called `catalogue`, because in the previous estate that word
meant a built artefact with provenance, digests and a build pipeline, and borrowing
the name would import the concept.
