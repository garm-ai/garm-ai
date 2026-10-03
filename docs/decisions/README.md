# Decisions

One file per decision, titled by the decision. Not by step number: "step 6" means
nothing in six months, and these are read when somebody questions a choice rather
than when they want the history.

**The history is `git log`.** Every commit message carries its own reasoning, and
it is the one record that cannot drift from the code, because it is attached to the
diff. Nothing here restates it.

Each file states the decision, why, and **what was rejected** — a record that only
gives the outcome gets re-litigated by somebody who cannot tell whether the
alternative was considered.

| decision | |
|---|---|
| [Everything is a tool, and an agent is a tool a runner answers](everything-is-a-tool.md) | one option, one optional field |
| [A tool's name is its identity; its proto path is an address](identity-is-not-an-address.md) | the two most expensive bugs of 2026-10-02 |
| [The allowlist is enforced, not asserted](the-allowlist-is-enforced.md) | why `declared` is a package and not code in a command |
| [Images merge at build time, never at boot](images-merge-at-build-time.md) | and why a collision names both images |
| [Images resolve from a file, an S3 bucket, or a release asset](images-resolve-from-three-schemes.md) | and why remote requires a digest |
| [There is no config file of our own](there-is-no-garm-yaml.md) | and the path-style choice that proved the rule |
| [`garmctl`, and the two artefacts it tells apart](garmctl-and-the-two-artefacts.md) | an image is one team's; a catalogue is verified |
| [Routing is registration, so there is no `mode` field](routing-is-registration.md) | the gateway never learns that agents exist |
| [The generator carries no policy opinion](the-generator-carries-no-policy-opinion.md) | 230 lines became 102, and an exact import set |
| [Service naming, deliberately deferred](service-naming-deferred.md) | buf's STANDARD lint against the domain, twice |
