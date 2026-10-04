# Specs

**Every spec for this repository lives in this repository.** Not in the private
`spec` repo beside it, which holds the design record for the *previous* estate.

That estate split code from design across repositories because its specs were one
interlinked corpus citing each other by section, and because much of it was not
publishable. Neither applies here: this repository is self-contained and public,
and a spec that travels with the code it specifies cannot drift out of sight of a
reviewer reading the diff.

Naming is `YYYY-MM-DD-<topic>-design.md`, with `**Date:**` and `**Status:**` on
lines 3 and 4 — the same shape as [../decisions/](../decisions/), deliberately.

## Spec, decision, invariant — three different jobs

| | answers | read when |
|---|---|---|
| `docs/specs/` | how a component works, with numbered call stacks | you are about to build or change it |
| [`docs/decisions/`](../decisions/) | why a choice was made, and what was rejected | somebody questions the choice |
| [`docs/invariants.md`](../invariants.md) | what holds, and the test that keeps it | you want to know what is actually enforced |

A spec may design further ahead than the code is built — `rund`'s does, by six
operations. That is only safe with a table saying what each unbuilt piece waits
on, and the rule that none of it may be *declared* before its condition holds.
Without that a spec becomes a list of promises, which is how the previous estate
shipped five concepts enforced by nothing.

Three drawings are the visual index:
[../architecture.html](../architecture.html) for the logical flow,
[../deployment.html](../deployment.html) for the topology and two traced calls, and
[../identity.html](../identity.html) for the identity model and the transport
security it rests on. They use the same built / next / designed-only distinction. **Change one and check the
others** — the deployment page already carries a correction the spec had to be
amended to match (§7.3).

| spec | status |
|---|---|
| [rund — the run manager](2026-10-03-rund-design.md) | active — step 9 builds §9.1 only |
| [identity and transport security](2026-10-04-identity-and-transport-security-design.md) | active — §2–§10 built as step 9d, bar the deployment step; §11 sketches what follows |
