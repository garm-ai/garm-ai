# Decisions

One file per decision, titled by the decision. Not numbered: these ten were written
on 2026-10-03 from seven steps' worth of commits, and numbering them would assert a
decision sequence that did not happen — `service-naming-deferred` spans two steps
and is still open. The short handle numbering buys is covered by linking files by
name, which reads better than "ADR-6" anyway.

**Naming is `YYYY-MM-DD-<topic>.md`, with `**Date:**` and `**Status:**` on lines 3
and 4.** Same shape as `spec/docs/superpowers/decisions/` in the private design
record, deliberately — one convention across the estate, not two.

Today the date prefix does nothing: every commit in this repository landed on
2026-10-03, so every file carries the same one. Its value is entirely forward.
**A decision that is superseded must coexist with the one superseding it**, because
a stale decision reads as current and is the single most dangerous kind of
document. A flat filename cannot hold both.

`Status` is the index, from the vocabulary `active · parked · superseded by <file>`.
Grep it before trusting a file.

**The history is `git log`.** Every commit message carries its own reasoning, and it
is the one record that cannot drift from the code, because it is attached to the
diff. Nothing here restates it.

Each file states the decision, why, and **what was rejected** — a record that only
gives the outcome gets re-litigated by somebody who cannot tell whether the
alternative was considered.

| decision | status | |
|---|---|---|
| [Everything is a tool, and an agent is a tool a runner answers](2026-10-03-everything-is-a-tool.md) | active | one option, one optional field |
| [A tool's name is its identity; its proto path is an address](2026-10-03-identity-is-not-an-address.md) | active | the two most expensive bugs of 2026-10-02 |
| [The allowlist is enforced, not asserted](2026-10-03-the-allowlist-is-enforced.md) | active | why `declared` is a package and not code in a command |
| [Images merge at build time, never at boot](2026-10-03-images-merge-at-build-time.md) | active | and why a collision names both images |
| [Images resolve from a file, an S3 bucket, or a release asset](2026-10-03-images-resolve-from-three-schemes.md) | active | and why remote requires a digest |
| [There is no config file of our own](2026-10-03-there-is-no-garm-yaml.md) | active | and the path-style choice that proved the rule |
| [`garmctl`, and the two artefacts it tells apart](2026-10-03-garmctl-and-the-two-artefacts.md) | active | an image is one team's; a catalogue is verified |
| [Routing is registration, so there is no `mode` field](2026-10-03-routing-is-registration.md) | **substantially superseded** by the rund spec §7 | survives only as: a tool author never names somebody else's deployment |
| [The generator carries no policy opinion](2026-10-03-the-generator-carries-no-policy-opinion.md) | active | 230 lines became 102, and an exact import set |
| [A subject is derived from the identity, not the address](2026-10-03-a-subject-is-derived-from-the-identity.md) | active | and the three-step drain whose first test was vacuous |
| [Errors carry a kind, and leave the cause at home](2026-10-03-errors-carry-a-kind-and-leave-the-cause-home.md) | active | five kinds, not HTTP codes; safe by default |
| [rund's durability is a framework's job, not ours](2026-10-03-durability-is-a-framework-not-ours.md) | active | DBOS behind a port; NATS-only was built, probed and rejected on evidence |
| [A tool name must be routable, and that is a security rule](2026-10-03-a-tool-name-must-be-routable.md) | active | `a.*.b` would be a broker wildcard receiving other tools' calls |
| [Service naming, deliberately deferred](2026-10-03-service-naming-deferred.md) | **parked** | buf's STANDARD lint against the domain, twice |

## Why not "ADR"

The term is widely recognised and the tooling around it (`adr-tools`, log4brains)
is real, but none of it is used here. What `docs/adr/` costs is that a newcomer has
to know the acronym, where `docs/decisions/` says what it holds. The estate already
uses the word for 24 files in the design record, so matching it was the cheaper
call than renaming both.

What the ADR convention is right about, and what was missing from the first draft
of these files, is **Status**. That is adopted above.
