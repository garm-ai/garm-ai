# Performance — the numbers, and how to get new ones

`mise run bench` runs `natscall.BenchmarkTheLoop`: the per-call cost of the whole
chain — generated client → `natscall` → the server's account rewrite → `rund` →
`natsserve` → the example handler → back — under operator mode, over TLS 1.3, in
one process. Not in CI, because a benchmark that gates a build is a flaky build.
Run it when something on the call path changes, and add a row.

| date | commit | serial, ns/op | parallel, ns/op | B/op | allocs/op | machine |
|---|---|---|---|---|---|---|
| 2026-10-04 | after `8e8d185` | 191k–221k (≈ 0.2 ms) | 127k–130k (≈ 0.13 ms) | ~19.5k | 229 | Apple Silicon, 10 cores, `go1.26.6`, `-benchtime 2s -count 3` |
| 2026-10-04 | step 9e, observability | 187k–189k (≈ 0.19 ms) | 130k–131k (≈ 0.13 ms) | ~48.5k | 339 | same machine. Three spans, a propagator on two hops and five counters per call: **+110 allocations and +29 KB per call, no measurable latency** — the estate records spans synchronously in memory, which is more work per call than a deployment's batch processor does |
| 2026-10-05 | step 10, the run store | 193k–251k (≈ 0.19–0.25 ms, noisy) | 141k–144k (≈ 0.14 ms) | ~48.5k | 348 | same machine. The sync path touches no store; what moved is the client: `Invoker.Invoke` now returns the decoded `InvokeResponse` (pending or result) instead of the result bytes, so the generated client reads one field more — **+9 allocations, ~+1 KB per call, latency within the noise** |

## How to read it

- **Two hops per call.** A caller's request crosses the bus to `rund`, which
  crosses it again to the tool. 0.2 ms for both, including two TLS-encrypted
  round trips on loopback and the server's subject rewrite, is the floor the
  design pays before any tool does work.
- **Parallel is cheaper per call** because the serial figure is dominated by
  round-trip latency, not CPU. A front door issuing many calls at once sees the
  lower number.
- **339 allocations is the next thing to look at** if this ever matters: a
  marshal, an unmarshal and a header map on each of four edges, and since step 9e
  three spans with their attribute sets. Nothing here has been tuned, on purpose —
  a number was needed before a target.

## What it does not measure

A real network, a clustered server, the run store, or a tool that does anything.
It is the overhead of the plane, not the cost of a call; the second is the
first plus the tool, and the tool's budget is the tool author's declaration.
