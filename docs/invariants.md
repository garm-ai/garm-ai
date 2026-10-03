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
| A tool declares a **delivery**, and silence is not a default | `declared.TestSilenceIsNotADefault`. Guessing on an author's behalf makes a caller either wait forever for an answer that was a receipt, or hold a receipt it will never redeem |
| An **agent** may never declare `sync` | `declared.TestAnAgentDeclaringSyncIsRefused`. Both decider kinds are durable by definition, so an agent cannot complete inside a call. This was a comment in an example until the declaration could carry it |
| A `sync` tool declares a **positive budget** | `declared.TestSyncWithoutABudgetIsRefused`, over no budget, zero and negative. The number exists so no caller invents one; omitting it leaves exactly the guessing it ends |
| …and `Budget()` is zero for anything not sync | `declared.TestBudgetIsZeroForAnythingNotSync`, which is why a caller asks `IsSync` rather than comparing to zero |
| The committed fixtures obey the delivery rules too | `declared.TestTheCommittedTreeDeclaresDeliveryEverywhere`, and `mise run check` / `mise run examples` in CI. A rule the fixtures are exempt from is untested against anything a human wrote |
| A tool name is **routable**: dot-separated `[A-Za-z0-9_-]+` segments | `declared.TestAUsableNameIsAccepted` and `TestAnUnusableNameIsRefusedWithAReason`. A security rule, not a style one: `a.*.b` would be a **broker wildcard subscription receiving other tools' requests**, and NATS micro's own subject check accepts `*`. See [the decision](decisions/2026-10-03-a-tool-name-must-be-routable.md) |
| …and the refusal says what *would have happened* | `declared.TestTheWildcardReasonSaysWhatWouldHappen`. The charset check alone already rejects `*`; the wildcard branch exists only so the message names the consequence, because a refusal that reads as fussy gets argued with |
| An allowlist entry names a declared tool | `declared.TestAPartialTreeLeavesTheAllowlistUnresolved`, `TestTheCommittedTreeResolves`, and `mise run examples` in CI |
| A plain tool has no agent block; an agent has one | `declared.TestFromIndexesBothAPlainToolAndAnAgent` |
| Images merge by deduplicating file paths | `images.TestTwoImagesMergeIntoOneNamespace` |
| A shared file differing between two images is refused | `images.TestADivergentSharedFileIsRefused` |
| A remote image without a digest is refused | `images.TestARemoteImageWithoutADigestIsRefusedAtLoad` |
| A local image needs no digest | `images.TestALocalImageNeedsNoDigest` |
| A digest is verified *before* unmarshalling | `images.TestAWrongDigestIsRefusedBeforeUnmarshalling` — kept in `images` deliberately, because its subject is the **order across two packages**: `fetch` verifies, `images` parses, which asserts the error does **not** mention `FileDescriptorSet` |
| An unsupported scheme names the ones that work | `fetch.TestAnUnsupportedSchemeNamesTheOnesThatWork` |
| An artefact is fetched over `https://` with its digest verified | `fetch.TestAnHTTPSArtefactIsFetchedAndItsDigestVerified` — and a git tag resolves as exactly this, the URL already encoding the tag |
| An `s3://` URI splits into bucket and key, slashes and all | `fetch.TestAnS3ArtefactIsFetchedThroughTheGetterWithBucketAndKeySplit`, through an interface so the path is exercised without a bucket |
| A wrong digest says what the bytes **actually** hash to | `fetch.TestAWrongDigestIsRefusedAndSaysBothSides`. "Mismatch" alone leaves an operator unable to tell whether the artefact moved or the pin is stale |
| The S3 path-style choice is derived, not hardcoded | `fetch.TestPathStyleIsDerivedFromAnEndpointOverrideAndNotHardcoded`, proved failing in **both** directions because either hardcoded value is wrong for somebody |
| The committed generated Go matches the protos | `mise run gen-check`, which compares `git status --porcelain`. It used `git diff --exit-code`, which cannot see an **untracked** file — so it passed vacuously for generated code that was new, which is exactly the case it exists to catch |
| The examples in `docs/guide.md` still compose | `mise run examples` — the guide walks through those exact files |

### The transport

| invariant | kept true by |
|---|---|
| A tool author's build cannot reach a broker | `mise run no-broker`, which fails if `serve`, `declared`, `images` or any generated package reaches `nats-io`. `serve/serve.go` claims this in prose; one convenience import would have made every tool service resolve nats.go while the comment still read as a guarantee. Shape copied from the old estate's `no-daemon-dependency` job |
| A declared tool is reachable over NATS | `natsserve.TestADeclaredToolIsReachable` — through **generated** code and the real example handler, against a real in-process `nats-server`. If the generator and the transport disagreed about anything, this is where it shows |
| A subject comes from the **identity**, never the address | `natsserve.TestTheSubjectIsDerivedFromTheIdentityNotTheAddress`, which also asserts that **nothing answers** on the address subject |
| An endpoint name is legal for every legal tool name | `natsserve.TestEndpointNameIsAcceptedByMicroForEveryLegalToolName`. micro excludes the dot, so they are replaced; that is total only because of the charset rule, and this asserts the two rules meet with **micro itself as the judge** |
| `New` refuses exactly what `micro.AddService` refuses | `natsserve.TestNewRefusesExactlyWhatMicroRefuses`, which runs both against real configs. `validate.go` copies micro's unexported regexes, so a divergence is a failure rather than drift |
| Two tools never share a subject | `natsserve.TestTwoToolsOnOneSubjectAreRefused`. Otherwise one of them silently never answers, and which one depends on registration order |
| `Start` returns only once the tools are **answering** | Every other test in the package, all of which call immediately after it. `Start` ends with `nc.Flush()`; without it a caller gets "no responders available" for a healthy service, which is exactly how this package's first tests became flaky — green locally, red in CI |
| `Serve` before `Start`, and `Start` twice, are refused | `natsserve.TestServeBeforeStartIsRefused`, `TestStartTwiceIsRefused` |
| A service with no endpoints does not start | `natsserve.TestRunWithNoEndpointsIsRefused`. Discoverable and useless is worse than failing to start |
| A deliberate kind reaches the caller as its own code, with the id | `natsserve.TestADeliberateKindReachesTheCallerAsItsOwnCode`. The code is **derived** from the generated enum, so a new kind cannot be forgotten — a hand-written map would compile and answer the empty string, which micro turns into no reply at all |
| A bare error leaks nothing over the wire | `natsserve.TestABareErrorNeverReachesTheCallerOverTheWire` — the same claim `serve` tests, re-checked end to end on every surface a caller can read, so nothing on the transport path puts the cause back |
| Request bytes that do not unmarshal never reach the handler | `natsserve.TestUnreadableRequestBytesBecomeInvalid`, which also asserts the handler was not called |
| A response too large to send becomes an **error**, not silence | `natsserve.TestAnOversizedResponseBecomesAnErrorRatherThanSilence`, with a 2 KiB `max_payload` on a real server. Ignoring `Respond`'s error is the difference between a caller learning this and a caller hanging to its own deadline |
| A draining handler is **not** handed a cancelled context | `natsserve.TestAHandlerIsNotHandedACancelledContextDuringTheDrain`. Run's context is cancelled to ask the service to stop; passing it to handlers tells every accepted call to abort at the moment we commit to answering it. Found by re-reading, not by a failure — with the bug, the probe answers `UNAVAILABLE: shutting down` once per deploy, per queued call |
| `Run` does not return until queued calls are answered | `natsserve.TestRunDrainsCallsThatAreQueuedButNotYetDispatched`. **Two** calls, because one proves nothing: the first version of this test passed with the `Barrier` deleted, since the in-flight counter already covers a handler that has started. See [the decision](decisions/2026-10-03-a-subject-is-derived-from-the-identity.md) |

### Errors

| invariant | kept true by |
|---|---|
| A bare `error` never reaches the caller | `serve.TestABareErrorNeverReachesTheCaller`, whose fixture wraps a cause containing a connection target and a password, and asserts neither appears on the wire — while the LOCAL error still carries both, so something can be logged |
| Only an **explicit kind** publishes a message | `serve.TestOnlyAnExplicitKindPublishesAMessage`. Closes the struct-literal path: an `Error` with no `Kind` publishes nothing either |
| `INTERNAL` never publishes a message, even a deliberate one | `serve.TestAnInternalKindNeverPublishesAMessageEvenADeliberateOne`. `Internal()` has no message parameter; this is what stops a struct literal walking round it |
| A deliberate kind publishes its own words, and still hides its cause | `serve.TestADeliberateKindPublishesItsMessage` and `TestADeliberateKindStillHidesItsCause` — `Because()` is for the log |
| The cause is reachable locally, bare or wrapped | `serve.TestTheCauseIsReachableThroughTheChain`, `TestErrorsAsFindsItBareAndWrapped`. Wrapping with `%w` is how a handler adds context for its own logs; a kind that survived only the bare form would work for the half of handlers nobody writes |
| `Wire` never produces something micro refuses | `serve.TestWireNeverProducesSomethingMicroRefuses`. Not cosmetic: `micro.Request.Error` returns an error and **never replies** on an empty code or description, so the caller would hang to its own deadline |
| There is nowhere on the wire to put a cause | `invokev1.Error` has three fields and no cause field. Held by the proto's shape, not by a check — a field added later would need a reviewer to catch it, and the decision record says why |

### The generator

| invariant | kept true by |
|---|---|
| A tool author implements an interface, and an unimplemented tool fails to **compile** | The `var _ <Service>Handler = …` assignments in `internal/generate/generate_test.go` and `examples/weatherd/weatherd.go`. The assignment *is* the check: stop emitting a method and those files stop building, which is what a tool author's build does |
| …and the interface holds no method no tool declares | `generate.TestTheHandlerHasExactlyTheDeclaredTools`. The assignments above prove nothing is missing; only this notices a method the generator invented, which an author would then implement for no reason |
| `Serve` mounts the declared **name**; the proto full name is passed only as an address | `generate.TestServeMountsTheDeclaredNameNotTheMethodName`, whose fixture's name and method deliberately disagree |
| An agent produces no generated Go at all | `generate.TestAnAgentProducesNoGoAtAll` — and visibly in the tree: `examples/gen/trips/v1/` holds `trips.pb.go` and no `_garm.pb.go` |
| Generated code imports an **exact** set of four packages | `generate.TestGeneratedCodeImportsOnlyWhatItNeeds`. An exact set, not a denylist: the old estate's generator grew a card renderer, a contracts package and a `sync.Map` one defensible commit at a time, and every consumer inherited all of it |
| Two tools in one plugin run claiming one name are refused | `generate.TestTwoToolsInOneRunClaimingOneNameAreRefused`, through the same `declared.FromFiles` that `garmctl compose` uses — one implementation, two set sizes |
| A streaming tool is refused with a reason | `generate.TestAStreamingToolIsRefusedWithASentence` |
| An RPC carrying no tool option gets no glue | `generate.TestAMethodWithNoToolOptionProducesNothing` |
| A nil response with a nil error never reaches a caller as success | `generate.TestTheMountedHandlerRefusesANilResponseWithNoError`. Marshalling a nil message yields an **empty** one, which is indistinguishable from an answer |
| A mounted handler refuses a request of the wrong type, naming the tool | `generate.TestTheMountedHandlerRefusesTheWrongRequestType` |
| `Serve` returns on the registrar's first failure | `generate.TestServeStopsOnTheFirstRegistrarFailure` |

Things not built at all are not here — they are in
[docs/roadmap.md](roadmap.md), beside what each one waits on. This table is only
for claims the code makes today that nothing checks.

## Not enforced, and said so

| claim | why nothing checks it |
|---|---|
| A **run limit** must be at least the largest budget in an allowlist | Specified, then dropped on implementation: an agent is always async and so has no budget, making the check unfireable. It becomes real when `Async` grows a run limit. Recorded rather than silently removed, because a check that cannot fire reads as a guarantee |
| A tool name should have the *shape* `<package>.<tool>` | Only the **charset** is enforced (see the row above). The shape is a convention in the examples; enforcing it needs a decision about what a package is that nobody has made, and the charset closes the security hole without it |
| An agent's method name is never read | Closer than it was: the generator emits nothing for an agent, proved by `generate.TestAnAgentProducesNoGoAtAll`. Still unenforced in the direction that matters — no test asserts that *nothing anywhere* resolves an agent by method name, because the decider that would is the next step |
| The tool option is read in exactly one place | `declared.ToolOf` is that place, and the generator calls it rather than reaching for `proto.GetExtension` itself. Nothing *checks* that a second reader does not appear. A grep test would, and is worth writing once there are three readers rather than two — the old estate's single most expensive structural bug was one idea implemented twice |
| Generated code never grows a transport dependency | The import-set test above is the enforcement for what is emitted. What it cannot say is that `serve` itself stays transport-free: today it imports only `context` and two protobuf packages, and nothing fails if a broker is added to it |
| No per-call timeout | A hung handler holds a goroutine until its caller gives up. Deliberate: the caller's own deadline is the authority, and a timeout here would be a policy with no stated reason. Revisit when something actually suffers from it |

| A service name should end in `Service` | buf's `SERVICE_SUFFIX`, which `mise run lint` does enforce — but whether an **agent** should be named that way is undecided. An agent is a named actor rather than an RPC service. The fixture and examples comply rather than waive the rule, and the decision is still open |

## A note on the two fixture trees

Rows naming `declared.*` and `generate.*` tests run against `testdata/`, which is
deliberately **ugly** — its agent's identity and address disagree, and its RPC is
called `Invoke`. Rows naming `mise run examples` run against `examples/`, which is
deliberately **exemplary** and is two buf modules rather than one. Neither can
replace the other; the README says why.

## How to add a row

Add the invariant and the test in the same commit. If you cannot name a test, put
it in the second table — that is not a failure, it is the honest state, and the
second table is what makes the first one worth reading.
