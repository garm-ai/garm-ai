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

## Step 1 — what an agent is

An agent is a gRPC service carrying `(garm.agent.v1.agent)`. It declares a
`name` and the tools it may call. That is all, and the one enforced property is
that the allowlist is the only authority on what it may call.

**An agent's `name` is its one identity; its proto full name is an address.**
That sentence is the direct fix for the two most expensive bugs of 2026-10-02:
the old agent had both, both were used as identity, and twice a component passed
one where another expected the other.

## What is deliberately absent

No clearance, compartments, verbs, tool sets, principal ceiling, bounds, model,
prompts, graph, or consent. Every one of those is real and most will return. They
are absent because nothing enforces them yet, and in the old estate the
authority model is where all four of 2026-10-02's bugs lived.

`mise run ci` — lint, a check that the committed generated Go matches the protos,
and the tests.
