# Invariants, and what keeps each one true

An invariant in a document is a wish. This table exists because the estate this
replaces wrote `garmd does not know about agents` into its own guide and then
built a component that did — and nothing noticed, because nothing checked.

**Every row names the thing that would fail.** A row that cannot is marked
unenforced, in the same table, deliberately.

## Enforced

| invariant | kept true by |
|---|---|
| A tool's identity is its `name`; the proto path is an address | `declared.TestIdentityAndAddressAreSeparateFields` — and the fixture's identity and address differ on purpose, so the test refuses to run if they are ever made equal |
| No two tools share a name | `declared.TestFromRefusesTwoToolsWithOneName`. Not a lint rule but a precondition: `From` cannot build an index at all |
| An allowlist entry names a declared tool | `declared.TestAPartialTreeLeavesTheAllowlistUnresolved`, `TestTheCommittedTreeResolves`, and `mise run examples` in CI |
| A plain tool has no agent block; an agent has one | `declared.TestFromIndexesBothAPlainToolAndAnAgent` |
| Images merge by deduplicating file paths | `images.TestTwoImagesMergeIntoOneNamespace` |
| A shared file differing between two images is refused | `images.TestADivergentSharedFileIsRefused` |
| A remote image without a digest is refused | `images.TestARemoteImageWithoutADigestIsRefusedAtLoad` |
| A local image needs no digest | `images.TestALocalImageNeedsNoDigest` |
| A digest is verified *before* unmarshalling | `images.TestAWrongDigestIsRefusedBeforeUnmarshalling`, which asserts the error does **not** mention `FileDescriptorSet` |
| An unsupported scheme names the ones that work | `images.TestAnUnsupportedSchemeNamesTheOnesThatWork` |
| The S3 path-style choice is derived, not hardcoded | `images.TestPathStyleIsDerivedFromAnEndpointOverrideAndNotHardcoded`, proved failing in **both** directions because either hardcoded value is wrong for somebody |
| The committed generated Go matches the protos | `mise run gen-check` |
| The examples in `docs/guide.md` still compose | `mise run examples` — the guide walks through those exact files |

## Not enforced, and said so

| claim | why nothing checks it |
|---|---|
| A tool name should be `<package>.<tool>` | A convention in the examples only. Nothing validates the shape — only that names are unique. Enforcing it would need a decision about what a legal name is, which nobody has made |
| An agent's method name is never read | True by construction today: `declared` reads the option off any method. No test asserts that *nothing else* reads it, because there is nothing else yet. When a runner arrives, this needs a real test |
| A service name should end in `Service` | buf's `SERVICE_SUFFIX`, which `mise run lint` does enforce — but whether an **agent** should be named that way is undecided. An agent is a named actor rather than an RPC service. The fixture and examples comply rather than waive the rule, and the decision is still open |

## How to add a row

Add the invariant and the test in the same commit. If you cannot name a test, put
it in the second table — that is not a failure, it is the honest state, and the
second table is what makes the first one worth reading.
