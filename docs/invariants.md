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
| Every file `docs/guide.md` names exists | `mise run guide-files`. The guide opens by promising it, and the first draft of step 9c named examples/cmd/trip, which did not exist |
| The examples in `docs/guide.md` still compose | `mise run examples` — the guide walks through those exact files |

### The transport

| invariant | kept true by |
|---|---|
| A tool author's build cannot reach a broker | `mise run no-broker`, which fails if `serve`, `declared`, `images` or any generated package reaches `nats-io`. `serve/serve.go` claims this in prose; one convenience import would have made every tool service resolve nats.go while the comment still read as a guarantee. Shape copied from the old estate's `no-daemon-dependency` job |
| A declared tool is reachable over NATS | `natsserve.TestADeclaredToolIsReachable` — through **generated** code and the real example handler, against a real in-process `nats-server`. If the generator and the transport disagreed about anything, this is where it shows |
| A subject comes from the **identity**, never the address | `natsserve.TestTheSubjectIsDerivedFromTheIdentityNotTheAddress`, which also asserts that **nothing answers** on the address subject |
| An endpoint name is legal for every legal tool name | `natsserve.TestEndpointNameIsAcceptedByMicroForEveryLegalToolName`. micro excludes the dot, so they are replaced; that is total only because of the charset rule, and this asserts the two rules meet with **micro itself as the judge** |
| `New` refuses exactly what `micro.AddService` refuses | `natsmicro.TestNewRefusesExactlyWhatMicroRefuses`, which runs both against real configs. `natsmicro.go` copies micro's unexported regexes, so a divergence is a failure rather than drift. It was cited here as `natsserve.…` against a `validate.go` that never existed — the test lived in a package it does not name |
| Two tools never share a subject | `natsserve.TestTwoToolsOnOneSubjectAreRefused`, over `natsmicro.TestTwoMountsOnOneSubjectAreRefused` which refuses it for any mount. Otherwise one of them silently never answers, and which one depends on registration order |
| `Serve` before `Start`, and `Start` twice, are refused | `natsmicro.TestServeBeforeStartIsRefused` and `TestStartTwiceIsRefused` at the source, `natsserve.TestServeBeforeStartIsRefused` and `TestStartTwiceIsRefused` through the forwarding |
| A service with no endpoints does not start | `natsmicro.TestStartWithNothingMountedIsRefused` and `natsserve.TestRunWithNoEndpointsIsRefused`. Discoverable and useless is worse than failing to start |
| A deliberate kind reaches the caller as its own code, with the id | `natsserve.TestADeliberateKindReachesTheCallerAsItsOwnCode`. The code is **derived** from the generated enum, so a new kind cannot be forgotten — a hand-written map would compile and answer the empty string, which micro turns into no reply at all |
| A bare error leaks nothing over the wire | `natsserve.TestABareErrorNeverReachesTheCallerOverTheWire` — the same claim `serve` tests, re-checked end to end on every surface a caller can read, so nothing on the transport path puts the cause back |
| Request bytes that do not unmarshal never reach the handler | `natsserve.TestUnreadableRequestBytesBecomeInvalid`, which also asserts the handler was not called |
| A response too large to send becomes an **error**, not silence | `natsserve.TestAnOversizedResponseBecomesAnErrorRatherThanSilence`, with a 2 KiB `max_payload` on a real server. Ignoring `Respond`'s error is the difference between a caller learning this and a caller hanging to its own deadline |
| A draining handler is **not** handed a cancelled context | `natsserve.TestAHandlerIsNotHandedACancelledContextDuringTheDrain`. Run's context is cancelled to ask the service to stop; passing it to handlers tells every accepted call to abort at the moment we commit to answering it. Found by re-reading, not by a failure — with the bug, the probe answers `UNAVAILABLE: shutting down` once per deploy, per queued call |
| `Run` does not return until queued calls are answered | `natsmicro.TestServeDrainsACallThatIsQueuedButNotYetDispatched`, where the drain lives, and `natsserve.TestRunDrainsCallsThatAreQueuedButNotYetDispatched` over the whole tool path. **Two** calls, because one proves nothing: the first version of this test passed with the `Barrier` deleted, since the in-flight counter already covers a handler that has started. See [the decision](decisions/2026-10-03-a-subject-is-derived-from-the-identity.md) |

### The transport, under operator mode

| invariant | kept true by |
|---|---|
| A caller **cannot reach a tool** | `estate.TestACallerCannotReachAToolSubject`, which asserts the server's *Permissions Violation for Publish* — the caller's own credential is the first wall, in front of the account boundary; a timeout alone would not count, since a slow tool times out too. The second wall, isolation, is `topology.TestTOOLSExportsPrivatelyAndOnlyGARMImportsIt`. **Meaningful only beside the next row**: it passes trivially while nothing can reach the tool, and in the spike it did exactly that until the tool's reply permission was fixed |
| `rund` **reaches the tool it imports**, through the whole chain under operator mode | `estate.TestRundReachesTheToolItImports`. The pair above is why this is its own row |
| A tool service cannot answer a tool it does not declare | `estate.TestAToolServiceCannotAnswerAnUndeclaredTool` — a *Permissions Violation* from the server, and `topology.TestAToolServiceMaySubscribeExactlyItsDeclaredTools` on the credential itself |
| A tool service **can send its cross-account reply, and can publish nothing else** | `topology.TestAToolServiceMayPublishNothingButReplies` asserts publish **denied** (`>`) and NATS's allow-responses; removing the latter turns the row above into a **timeout**, not a refusal. The deny is what makes it mean anything — an empty allow-list is unrestricted, and a probe proved a tool with neither still replied. Not a test of its own: the estate's tool answers on a connection a test cannot watch |
| The server **refuses a connection that will not speak TLS** | `estate.TestPlainTextIsRefused`, speaking the protocol directly. Not through nats.go, which sees `tls_required` and upgrades on its own — a test written that way passed with TLS made optional, refused by its own certificate check rather than by the server |
| A service **refuses to start** when a mount is outside its own credential, naming the tool | `natsserve.TestAServiceRefusesToStartWhenAMountIsNotPermitted`, and `TestAServiceStartsWhenEveryMountIsPermitted` so the gate cannot refuse everything. The alternative is a subscription refused *asynchronously* after `Start` returns — a service that looks healthy and never answers. Checked against the process's own JWT, locally, with no round trip |
| `rund` reads the caller off **token 4**, and only a real account key counts | `rundsvc.TestTheCallerIsTokenFourAndMustBeAnAccountKey` — the flat subject, a user key, a stray token all carry no caller. `CallerFromSubject` is the only place identity enters `rund`, and it trusts the subject for one reason: a caller's account can import the run service only at its own key |
| `rund` is told **which account** called, and it is the caller's own | `rundsvc.TestRundLogsTheCallingAccount` — the key the server placed in the subject, which the caller never wrote. Logged and put on the context; **nothing decides anything with it yet**, by design (spec §0) |
| A caller publishing **today's** `garm.run.v1.invoke` still reaches `rund` | `rundsvc.TestACallerPublishingTodaysSubjectReachesRund`, through the real import mapping. `natscall` is untouched; only `rund`'s subscription moved |
| No data-path credential is in the **system account** | `garmctl.TestNoDataPathCredentialIsInTheSystemAccount`, over every credential `topology --dev` writes: only `ops` is issued by SYS |
| Every credential carries the **catalogue digest** it was issued from, and the manifest verifies | `topology.TestEveryCredentialCarriesItsCatalogueDigestAndGeneration` on the JWT tags; `garmctl.TestTheManifestCarriesTheCatalogueDigestAndVerifies` on the written manifest, under the operator that signed it |
| The generator **refuses to run without a manifest**, and `--first` cannot forget one | `garmctl.TestTopologyRefusesToRunWithoutAManifest` — the refusal names `--first`; `TestTheSecondIssuanceRevokesTheFirst` asserts `--first` against an existing manifest is refused, and that a second issuance revokes the first's credentials as *superseded* |
| A **command** connects with a credential file and a CA, and nothing else | `natsconn.TestACommandConnectsWithACredsFileAndACA`; without a credential the error names `--creds` (`TestWithoutACredentialTheErrorNamesTheFlag`). One package for four commands |
| A revocation pushed over `$SYS` **closes a live connection** holding the credential, refuses it on reconnect, and touches nobody else | `estate.TestARevocationPushedOverSYSClosesALiveConnection` — through the full resolver and `$SYS.REQ.ACCOUNT.<key>.CLAIMS.UPDATE` with the operations credential, not the server's update method called directly, which would prove the disconnect but not the path. The zombie of spec §4.2, retired by the generator against the estate's own manifest. "Nobody else" is `rund`, in another account; two users in one account is not a case this estate has |
| Every test in the repository runs against a server **configured as production is** — operator mode, TLS, the full resolver | `estate.New`, which every chain test uses, builds its topology with the same generator a deployment runs |

### rund

| invariant | kept true by |
|---|---|
| A caller reaches a tool knowing only its **name** | `rundsvc.TestACallerReachesAToolWithoutKnowingItsSubject` — a real NATS server, a real tool service, rund in front, and the answer comes from the example handler |
| A sync tool is called with its **declared** budget | `run.TestASyncToolIsCalledWithItsDeclaredBudget`, read from the catalogue rather than invented |
| The idempotency key **is** the run id | `run.TestTheIdempotencyKeyBecomesTheRunID`. A key rund invented would deduplicate nothing, so the caller must supply it |
| …and a tool call gets its **own** key, derived from the run's | `run.TestAToolCallGetsItsOwnKeyNotTheRunsOwn`, and end to end in `rundsvc.TestTheIdChainReachesTheToolAcrossTwoHops`. One run may call tools several times, so reusing the run's key would make a second call look like a duplicate |
| Correlation spans, causation chains, `traceparent` is carried verbatim | `run.TestCausationChainsAndCorrelationSpans` and the two-hop test. A shared correlation says calls belong together; only causation says what caused what |
| A missing correlation id is minted, not left empty | `run.TestAMissingCorrelationIsMintedNotLeftEmpty` — a call with none has log lines that join to nothing |
| An unknown tool is `NOT_FOUND` **naming the catalogue** | `run.TestAnUnknownToolIsNotFoundAndNamesTheCatalogue`. "Unknown tool" is unactionable when the real question is which namespace is loaded |
| Without a store, an async tool is refused as `UNAVAILABLE` **naming the flag**; an agent names the missing decider | `run.TestWithoutAStoreAsyncIsRefusedNamingTheFlag`, `run.TestAnAsyncToolIsRefusedWithTheReason`, `rundsvc.TestAnAsyncToolIsRefusedBecauseThereIsNoStore`. Not `NOT_FOUND`: the tool exists, and this rund cannot hold its run |
| A tool's error reaches the caller as **its own kind** | `run.TestAToolsErrorReachesTheCallerAsItsOwnKind`, not flattened to INTERNAL |
| Without a store, `Fetch` says `NOT_RETAINED` rather than lying | `run.TestFetchSaysNotRetainedRatherThanLying`, `run.TestWithoutAStoreFetchIsNotRetained`. The run may well have happened; `NOT_FOUND` would be a lie a caller could act on, and a fabricated result worse. With a store, an unknown id **is** `NOT_FOUND` — the store would have it |
| `Code` and `KindOf` round-trip over **every** kind | `serve.TestCodeAndKindRoundTripOverEveryKind`, which walks the enum's own descriptor so a new kind is covered without anybody remembering. Two inverse functions in two packages is how a mapping drifts: a tool reporting UNAVAILABLE would reach a caller as UNSPECIFIED, which `Wire` turns into INTERNAL — a transient outage reported as a broken tool |
| The catalogue is re-verified at boot, and that is the reload path | `catalogue.TestLoadReRunsTodaysRules` |
| A call takes **one** catalogue snapshot | `catalogue.TestTheHolderPublishesWholeValues`, `TestConcurrentReadersAndASwapRace` |

### The client

| invariant | kept true by |
|---|---|
| The loop closes: generated client → rund → tool → back | `natscall.TestTheLoopCloses`, against a real server with every piece that exists |
| A generated client sets the **declared** budget as its deadline | `generate.TestTheGeneratedClientSetsTheDeclaredBudgetAsItsDeadline` and `TestTheGeneratedClientTypeChecksEndToEnd`. `call.Deadline` adds the hops, so a client does not expire at the same instant rund does and see a bare transport timeout instead of the error rund was sending |
| An **async** tool gets two methods — one returning a `call.Ref`, one reading it — never the sync shape | `generate.TestAnAsyncToolGetsAReferenceAndAResultMethod` and the compile-time assignments beside it. Flipping a tool's delivery changes the signature, so every caller fails to compile: that is what declaring delivery is for |
| An async client refuses a missing idempotency key **before the wire** | `generate.TestTheAsyncClientRefusesAMissingKeyBeforeTheWire`. rund would refuse it too; failing early is kinder |
| A typed `Result` method waits for an **answer** within its wait, not for the next stage change | `generate.TestTheResultMethodWaitsForAnAnswerNotAStageChange`. A held fetch returns on any change; a stage is not an answer |
| A `Ref`'s fetch deadline is the wait plus the hops; `Await` stops with the caller | `call.TestARefsFetchDeadlineIsTheWaitPlusTheHops`, `call.TestAwaitStopsWithTheCaller` |
| A tool's kind survives all four hops | `natscall.TestAToolsRefusalReachesTheCallerWithItsKind`, which also asserts a bare error's words did **not** survive them |
| No rund at all is `UNAVAILABLE`, not a silent hang | `natscall.TestNoRundAtAllIsUnavailableNotASilentHang`, naming the subject that did not answer |
| Generated **client** code imports no broker | `mise run no-broker`, extended to `./call` |

### The run store

| invariant | kept true by |
|---|---|
| An async invoke is `pending{run_id}` once durable, and the run finishes without the caller | `estate.TestAnAsyncToolIsPendingThenAnswered`, `rundbos.TestARunCompletesWithoutTheCaller`, `natscall.TestAnAsyncInvokeAnswersPendingAndFetchTheResult` |
| An async invoke **without a key** is `INVALID`; the key is the run id | `run.TestAnAsyncInvokeWithoutAKeyIsInvalid`, `rundbos.TestAStartWithoutAKeyIsRefused`. rund minting one would make a retry a second run |
| The engine never calls the tool on the invoking path of an async run | `run.TestAnAsyncInvokeStartsARunAndAnswersPending` — `Start` is called with the envelope and the fingerprint, the caller is not |
| A reused key with a **different request** is `INVALID` before DBOS can answer from the recording; the same request is the same run — completed **or still running** | `rundbos.TestAReusedKeyWithDifferentInputIsRefusedBeforeDBOS`, `TestAReusedKeyWithTheSameInputIsTheSameRun`, `TestAReusedKeyOnARunningRunIsTheSameRun`, and on the wire `estate.TestAReusedKeyWithADifferentRequestIsInvalidOnTheWire` |
| A run is visible **only to the account that started it**; a foreign fetch is `NOT_FOUND`, not `DENIED` | `run.TestFetchFromAnotherAccountIsNotFound`, `estate.TestARunIsVisibleOnlyToItsInvokingAccount`. The run's existence is not the other account's to learn |
| The plan is **step 0**, checkpointed; a replay follows it after a catalogue change | `rundbos.TestThePlanIsStepZero`, `rundbos.TestAReplayFollowsThePlanRecordedAtStart` — DBOS's determinism rule applied to our one source of non-determinism |
| The tool receives the stored envelope and **deterministic** ids: a replayed step re-sends the same message id and the same `run_id:i` key | `run.TestStepHeadersAreDeterministicAndChain`, `rundbos.TestTheToolReceivesTheEnvelope`, and both requests in `rundbos.TestAStoppedReplicasRunIsFinishedByItsSuccessorWithTheSameIdentity` |
| A tool's refusal is the run's failure **with its kind**, not retried; `UNAVAILABLE` is retried three times, then fails; an oversized reply fails once | `rundbos.TestAToolsRefusalFailsTheRunWithItsKind`, `TestUnavailableIsRetriedThenFailsTheRun`, `TestAnOversizedToolReplyFailsTheRunOnce`, `estate.TestAnAsyncToolsRefusalIsTheRunsFailure` |
| A call that **timed out** is never retried — the work may be in flight, and retrying multiplies it | `rundbos.TestATimedOutCallIsNotRetried` |
| The step's checkpoint carries the tool's kind as a **value**, never as a step error (which DBOS flattens to text and a replay would read back as `INTERNAL`) | `rundbos.TestTheStepRecordsTheToolsKindAsAValue` |
| An async tool declares a **limit** — how long one call to its handler may take — required and positive; it reaches the handler's own deadline and rund's request, as a sync budget does; an agent declares none | `declared.TestAsyncWithoutALimitIsRefused`, `declared.TestBudgetIsTheLimitForAsyncAndZeroForAnAgent`, `generate.TestTheBudgetReachesTheRegistrar`, `rundbos.TestThePlanCarriesTheDeclaredLimit` |
| Two racing `Start`s with one key and two requests never **both** succeed; the recorded fingerprint decides | `rundbos.TestConcurrentStartsWithOneKeyAndTwoRequestsNeverBothSucceed` |
| A held `Fetch` leaves no goroutine behind when it returns early | `rundbos.TestAHeldFetchLeavesNoGoroutineBehind` |
| `--run-store-migrate=false` with no usable schema **refuses to start** naming the flag; only an unreachable database degrades | `rundbos.TestAnAbsentSchemaWithMigrateFalseRefusesToStart` beside `TestAnUnreachableStoreDegradesRatherThanFails` |
| A run past the replica's **run ceiling** is `CANCELLED` — the clock starts when execution starts, so a queued run does not burn it | `rundbos.TestARunPastTheRunLimitIsCancelled`; `--run-store-run-limit`, 24h by default, DBOS's durable deadline underneath |
| The step continues the **caller's trace** | `rundbos.TestTheStepContinuesTheRunsTrace`, and `mise run e2e-compose` finds the queued tool span in OpenObserve under the caller's trace id |
| `Fetch --wait` returns on completion **or a stage change**, within the cap; `stage` is `queued` → `calling:<i>` → `done` | `rundbos.TestFetchWaitReturnsWhenTheRunCompletes`, `TestFetchWaitReturnsOnAStageChange`, `TestFetchWaitIsBounded`, `TestStageIsTheRunsWord`, `TestFetchOnAQueuedRunSaysQueued`; the cap in `run.TestFetchClampsWait`, mirrored by `run.TestTheClientsMaxWaitIsTheEnginesCap` |
| A stopped replica's run is finished by its successor **with the same executor id**; a different id does not take it | `rundbos.TestAStoppedReplicasRunIsFinishedByItsSuccessorWithTheSameIdentity`. The SDK treats a shutdown as "not a cancellation request", so the row stays `PENDING` on the executor's name |
| Two live replicas with one identity re-execute each other's runs — the misconfiguration the guide warns about — and the step key still collapses the duplicate | `rundbos.TestTwoLiveReplicasWithOneIdentityIsTheMisconfigurationTheGuideWarnsAbout` |
| An unreachable store **degrades**, never kills: sync answers, async is `UNAVAILABLE` naming the store, the store reconnects on its own, `garm.run.store{state}` counts it | `rundbos.TestAnUnreachableStoreDegradesRatherThanFails`, `TestTheStoreRecoversWhenTheDatabaseReturns`, `estate.TestSyncIsSovereignWhenTheStoreIsDown`; `run.TestWithoutAStoreAsyncIsRefusedNamingTheFlag` for the sync half |
| A URL that is not a store is a **configuration error**, not "degraded" | `rundbos.TestABadStoreURLRefusesToStart`, naming `--run-store` |
| The store's credential never reaches a log line | `rundbos.TestTheStartupLineRedactsTheCredential` |

### Push

| invariant | kept true by |
|---|---|
| A run's events are recorded in order, numbered from 1, readable after the fact from a cursor; the stream is closed when the run is done | `rundbos.TestARunsEventsAreRecordedInOrder` |
| A live subscriber receives the same events with the same numbers, on the real bus through the real import | `estate.TestALiveSubscriberSeesTheRunsEvents` |
| A late subscriber gets what it missed: `Follow` after the run yields the record and returns on `done` | `estate.TestFollowAfterTheRunYieldsTheRecord` |
| `Follow` started mid-run yields every event exactly once across the catch-up/live boundary, and subscribes **before** catching up so nothing published meanwhile is lost | `estate.TestFollowMidRunYieldsEveryEventOnce`, `call.TestFollowYieldsEveryEventOnceAcrossTheBoundary`, `call.TestFollowSubscribesBeforeCatchingUp`, `call.TestFollowKeepsOrderAcrossTwoLiveEventsBehindTheCatchUp` |
| A lost live feed resumes from the last sequence, no duplicate, no gap | `call.TestFollowResumesFromTheLastSequence` |
| Another account receives nothing on the bus and `NOT_FOUND` from `Events`; a caller may not publish on the event prefix | `estate.TestAnotherAccountReceivesNothingOnTheBus`, `run.TestEventsFromAnotherAccountIsNotFound`, `estate.TestACallerMayNotPublishOnTheEventPrefix` |
| A tool's refusal is a `step` with its kind and a `done FAILED`; a cancelled run's record ends `done CANCELLED` | `rundbos.TestAToolsRefusalIsAStepWithItsKindAndDoneFailed`, `TestACancelledRunEmitsDoneCancelled` |
| `Events` with a wait returns when an event arrives, on the cap when none does; a cursor past the end is empty, not an error | `rundbos.TestEventsWaitReturnsOnArrival`, `TestEventsPastTheEndIsEmptyNotAnError` |
| A bus that cannot be published to drops the live copy, counts it (`garm.run.events{outcome}`), and the run finishes with its record complete | `rundbos.TestAnUnreachableBusDropsTheLiveCopyAndTheRunFinishes` |
| A replayed run does not publish twice; every event is published once to its owner; a run with no owner is published to nobody | `rundbos.TestAReplayDoesNotRepublish`, `TestEveryEventIsPublishedOnceToItsOwner`, `TestARunWithNoOwnerIsPublishedToNobody` |
| A chunk over 4 KB is refused at write; no event carries input or result bytes, on the bus or in the record | `rundbos.TestAChunkOverTheCapIsRefused`, `TestNoEventCarriesThePayload`, `estate.TestTheLiveFeedCarriesNoPayload` |
| GARM exports the event stream with the owner's account at position four; every caller imports it privately; a caller publishes only the three verbs; the change reissues every caller once and nothing else | `topology.TestTheRunAccountExportsTheEventStreamAndEveryCallerImportsIt`, `TestTheEventImportReissuesEveryCallerOnceAndNothingElse` |

### Authority

| invariant | kept true by |
|---|---|
| **Deny by default**: a tool that requires nothing still needs a grant admitting it | `authority.TestARequirementlessToolStillNeedsAGrantAdmittingIt` |
| A permitted call needs **both** halves: the grant admits the tool, and that same grant holds every compartment it requires | `authority.TestAGrantThatSatisfiesTheRequirementPermitsAndSaysWhatItReliedOn`, `TestAMissingCompartmentIsDeniedNamingIt`, `TestAGrantThatDoesNotAdmitTheToolIsDenied` |
| A requirement is **every** compartment, not any of them | `authority.TestARequirementIsEveryCompartmentNotAnyOfThem` — written after a probe showed the first test passed whether the code meant all or any |
| **Compartments are never pooled across grants**: a call two half-grants would permit is refused | `authority.TestTwoHalfGrantsDoNotCombine` |
| A refusal names the half that failed, and nothing else the principal holds | `authority.TestAMissingCompartmentIsDeniedNamingIt` (the only one with the non-disclosure assertion), `TestNoGrantIsDeniedNamingThePrincipal`, `TestAnExpiredGrantIsRefusedAsExpired` |
| …and it names the CLOSEST grant's shortfall, not the first in file order | `authority.TestTheRefusalNamesTheClosestGrantsShortfall` — found in review: the comment claimed "closest" and the code took the first, so a caller holding a compartment under a second grant was told it lacked it |
| An unidentified caller is refused, and an unidentified caller may see no run | `authority.TestAnUnidentifiedCallerIsDenied`, `TestCanSeeAdmitsTheStarterAndTheSubjectOnly`'s zero-pair case — both found passing **blind** in review and rewritten to bite: the first needed a grant held by the zero principal, the second needed both halves zero at once |
| A tool pattern is a name, one trailing `.*`, or exactly `*`; anything else is refused at load | `authority.TestAToolPatternMustBeExactOrATrailingStar`, `TestAPrefixGrantAdmitsItsPrefixOnly` |
| A grant file is one document, and a pattern that could match nothing is refused | `authority.TestASecondYAMLDocumentIsRefusedRatherThanDropped`, `TestAPrefixPatternNeedsSomethingBeforeTheStar` — a `---` separator dropped every later grant silently, and `".*"` passed the pattern rule and matched nothing |
| Every grant-file error is caught at **load**, not per call: unknown schema, a compartment outside the vocabulary, a principal no caller table knows, a principal kind nothing can prove, no tools at all | `authority.TestAnUnknownSchemaIsRefused`, `TestAGrantNamingAnUndeclaredCompartmentIsRefused`, `TestAGrantForAnUnknownPrincipalIsRefused`, `TestAPrincipalKindThisBuildCannotProveIsRefused`, `TestAMalformedFileIsRefusedNamingThePath` |
| A grant is **written by name and matched by key**; an expired one is not even returned by the source | `authority.TestAGrantIsWrittenByNameAndMatchesByKey`, `TestTheSourceFiltersExpiredGrants` |
| The decision is taken at `Invoke` and recorded on the run; a refused call starts no run and never reaches the tool | `run.TestAPermittedAsyncInvokeRecordsTheDecision`, `run.TestADeniedInvokeStartsNoRun`, `run.TestADeniedSyncInvokeNeverReachesTheTool` |
| …and it is taken ONCE: a replay decides from the record, never from the file as it now stands | `rundbos.TestAReplayDecidesFromTheRecordedDecision`, which reads the plan's checkpoint back and finds the requirement pinned at plan time |
| A multi-action plan cannot run on the sync path, where only the named tool was decided | `run.TestASyncPlanBeyondTheDecidedActionIsRefused` — the store's loop decides every step from the record and this one cannot, so it refuses rather than running half of it undecided |
| An agent that allows nothing reaches nothing | `authority.TestAnAgentThatAllowsNothingReachesNothing`; `authority.Allowlist` carries agent-ness as a **field**, because a nil slice cannot tell "no agent" from "an agent with an empty list" — and a checkpoint turns an empty slice back into nil (`rundbos.TestAReplayDecidesFromTheRecordedDecision` asserts the field survives) |
| Only the engine and the test estate may write `Headers.AsPrincipal`, the one field that outranks the proved account | `run.TestOnlyTheEngineAndTheTestEstateMayWriteAsPrincipal` reads every non-test file; a transport filling it from a header would be an authentication bypass |
| `acts_for` reaches the run's record, `rund`'s log **and** the span | `estate.TestTheSubjectReadsTheRunButDoesNotReceiveItsLiveEvents` asserts all three. The span half was declared (`observe.KeyActsFor`), claimed here, and set by nothing until review found it |
| Inside a run, a step needs the pinned allowlist **and** the recorded compartments | `authority.TestCheckStepIsTheIntersectionOfTheAllowlistAndTheCompartments`, `rundbos.TestAStepBeyondTheRunsCompartmentsIsDenied`, `TestAStepWithinTheRunsCompartmentsProceeds` |
| A run is readable by the principal that started it **and** the one it `acts_for`, and nobody else | `authority.TestCanSeeAdmitsTheStarterAndTheSubjectOnly`, `estate.TestTheSubjectReadsTheRunButDoesNotReceiveItsLiveEvents`, `estate.TestARunIsVisibleOnlyToItsInvokingAccount` |
| Without `--grants`, a tool with a requirement is refused **naming the flag**; a requirement-less tool is unaffected | `run.TestWithoutAnAuthorityARequirementIsRefusedNamingTheFlag`, `estate.TestWithoutGrantsTheRequiringToolNamesTheFlag`, `estate.TestARequirementlessToolIsUnaffected` |
| `rund` refuses to start when `--grants` has no `--callers`, or when the catalogue requires a compartment the file does not declare | `rund.TestGrantsWithoutCallersRefusesToStart`, `rund.TestAnUndeclaredCompartmentInTheCatalogueRefusesToStart` |
| `SIGHUP` reloads the grants; a file that fails those checks **leaves the running grants standing** | `rund.TestReloadRereadsTheGrants`, `rund.TestARefusedReloadKeepsTheRunningAuthority`, `authority.TestAReloadThatFailsKeepsTheRunningSource` |
| The whole decision is made on the real bus, not only in a unit | `estate.TestAGrantDecidesTheRequiringToolOnTheWire`, `estate.TestAGrantListingOneToolRefusesItsSibling`; `scripts/e2e.sh` takes a compartment away, `SIGHUP`s, and asserts the same call is `DENIED` |
| `garmctl grants check` makes every refusal the boot makes, and its report asks the **same decider** a call asks | `garmctl.TestGrantsCheckRefusals`, `TestGrantsCheckRefusesACatalogueRequirementTheFileDoesNotDeclare`, `TestGrantsCheckAgainstTheCatalogueNamesTheToolsEachPrincipalMayInvoke` (probed: a report that used `Admits` alone failed it), `TestGrantsCheckWithoutCallersIsRefused` |
| One implementation of the §6 cross-check and of the `CALLER-` prefix, shared by `rund`'s boot and `garmctl` | `authority.TestCheckCatalogueRefusesARequirementTheFileDoesNotDeclare`, `topology.TestCallerKeysResolvesAGrantsPrincipalNameToItsAccount`, `TestCallerKeysRefusesABrokenTable` |

### Revocation is permanent

| invariant | kept true by |
|---|---|
| A revocation made at generation N is in every account JWT at N+1, N+2, … | `topology.TestARevocationIsCarriedAcrossGenerations`; the walk's "revoked stays revoked" step shows the zombie refused an issuance later |
| A revocation leaves the record only once its credential has expired, when the server refuses it regardless | `topology.TestARevocationIsPrunedOnceTheCredentialHasExpired` |
| A caller that left keeps a tombstone account JWT, re-emitted while its revocation lives | `topology.TestATombstoneIsReemittedWhileItsRevocationLives` |

### Operating the topology at scale

| invariant | kept true by |
|---|---|
| An issuance and `--status` warn when an account holds more credentials than the threshold, naming it; silent at or under | `topology.TestAnAccountPastTheCredentialThresholdIsWarned`, `garmctl.TestAnIssuanceWarnsPastTheAccountThreshold` |
| They warn about credentials expiring inside the window, naming the earliest with its date; an expired one is said plainly; one with no recorded expiry is named, never treated as living forever | `topology.TestCredentialsExpiringInsideTheWindowAreWarnedNamingTheEarliest`, `TestAnExpiredCredentialIsSaidPlainly`, `TestAnEntryWithoutARecordedExpiryIsNamed`, `garmctl.TestStatusWarnsOnExpiryInsideTheWindow` |
| The manifest records each credential's expiry | `topology.TestTheManifestRecordsEachCredentialsExpiry` |
| A process says at startup when its own credential dies | `natsconn.TestCredentialExpiryIsReadFromTheFile`; `scripts/e2e.sh` asserts the line in `rund`'s and `weatherd`'s logs |
| Only `rundbos` imports the DBOS SDK | `mise run no-sdk`, proved to fail with a `rundbos` import in `run` |

### The commands a person types

| invariant | kept true by |
|---|---|
| `garmctl call` reaches a tool naming only its **name** | `TestCallReachesTheToolAndPrintsItsAnswerAsJSON`, against a real estate, parsing the output rather than matching a substring — the claim is that the answer is JSON of the **declared** response shape |
| An unknown field in the typed JSON is **refused**, not dropped | `TestCallRefusesAnUnknownFieldRatherThanDroppingIt`, and the refusal names both the field and the request type. The command's own help text makes this promise, and it is one `UnmarshalOptions` field away from being false — proved by setting `DiscardUnknown: true` and watching the test fail |
| JSON of the wrong type is refused | `TestCallRefusesJSONOfTheWrongType`, a string for an `int32` |
| An unknown tool names the **catalogue** that was searched | `TestAnUnknownToolNamesTheCatalogue`. "unknown tool" is unactionable when the real question is which namespace is loaded |
| A catalogue whose digest does not match is not used | `TestADigestMismatchStopsTheCall` |
| An error reaches a person **kind first** | `serve.Describe`, applied once in `main` for every subcommand; `TestAToolsRefusalArrivesWithItsKindForAPerson` and `forecast.TestTheExampleCallerShowsTheKindAndExitsNonZero`. `call` used to print this itself and call `os.Exit(1)` from inside a function holding two defers, which skipped both and made the path untestable |
| The forecast example is **run**, not just built | `forecast.TestTheExampleCallerGetsAForecastNamingOnlyTheTool`. It was compiled by CI and never executed, which made "the only two lines that matter" a claim nothing checked |
| A refused call prints no forecast and exits non-zero | `forecast.TestTheExampleCallerShowsTheKindAndExitsNonZero`. An example that printed anyway would be a worked example of ignoring an error |

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

### Observability

| invariant | kept true by |
|---|---|
| One call is one trace, with `rund` between caller and tool | `estate.TestOneCallIsOneTraceWithRundBetweenCallerAndTool` — three spans, one trace id, the tool's parent is `rund`'s span. Proved to fail by injecting from `context.Background()` in `ToolCaller` |
| The tool receives **`rund`'s** span, not the caller's forwarded header | `rundsvc.TestTheToolCallCarriesRundsOwnSpanNotTheCallers`, on the wire; `TestWithNoSpanRundForwardsNoTraceparent` — a garbage header is not passed on. Today's code forwarded it verbatim, and that test failed on it |
| The caller's `traceparent` is correlation, never attribution | `estate.TestAMalformedTraceparentStillYieldsAnAttributedTrace` — a fresh root trace, the tool its child, `garm.caller` the server-placed account |
| The id a tool's `INTERNAL` error carries **is the trace id** | `natsserve.TestTheErrorIDIsTheTraceID`; `TestWithoutATracerTheIDIsStillSomething` keeps the fallback honest. End to end, `estate.TestTheIDACallerQuotesOpensTheTrace`: `rund`'s id is the run id, which is `garm.run_id` on the same trace |
| A log line inside a span carries its trace id — the engine's own `invoked` line included | `observe.TestALogLineInsideASpanCarriesItsTraceID`; `estate.TestRundsLogLineCarriesTheTraceID` on `rund`'s real log, asserting the line that carries the run id, not only the transport's. The first version checked only the thin `invoke caller=` line and the engine's diagnosis line was unstamped — found in review |
| **No span attribute, log attribute or envelope-written log body carries a payload** | `estate.TestNoSpanAttributeCarriesThePayload` — a sentinel in the input, checked against every attribute of every span and every shipped log record; refuses to run if fewer than three spans exist. Proved to fail by adding the input as an attribute. A tool author's own error text is outside it, and the guide says so |
| Counters count what happened, with the kind | `natsserve.TestToolCountersCountWhatHappened`, `rundsvc.TestAnInvocationIsCounted`, `estate.TestCountersCountOneCall`; a lying deadline in `natsserve.TestAHandlerPastItsBudgetIsCancelled` |
| A caller is named when known and **never dropped** when not | `estate.TestAKnownCallerIsNamedAndAnUnknownOneIsStillCounted` — the estate's table names `studio` and deliberately not `batch`. Proved to fail by skipping the counter for an unnamed caller; a first "probe" that returned early after the key was already set dropped nothing and was not one |
| `/readyz` is 200 **exactly when** `$SRV.PING` answers | `natsmicro.TestReadyAgreesWithPingThroughTheLifecycle` — before `Start`, after it, after the drain; `TestReadyGoesFalseBeforeTheLastCallIsAnswered` with a blocked handler; `TestReadyIsFalseWhileDisconnected`. Proved to fail both ways |
| The one retry is one span | `natscall.TestTheOneRetryIsOneSpanWithAnEvent` |
| No endpoint, no exporter, and the line says so; the standard variables — generic and per-signal — reach the backend in OpenObserve's shape; **header values are never logged**; `OTEL_SDK_DISABLED` installs nothing; the final flush is bounded | `otlp.TestNoEndpointMeansNoExporterAndSaysSo`, `TestTheStandardVariablesReachTheBackendAndTheValueIsNotLogged` against a fake receiver at `/api/garm/v1/traces`, `TestASignalSpecificEndpointIsHonoured`, `TestDisabledMeansNoSDKAtAll` (no id, nothing on the wire), `TestStopIsBoundedAgainstADeadBackend` (a receiver that never answers; the first version hung the suite) |
| Only `observe/otlp` imports the OTel SDK; `serve`, `call`, `run` and generated code import no OTel at all | `mise run no-sdk` and the extended `mise run no-broker`, each proved to fail with one blank import |
| `callers.json` is every caller and nothing else; a broken file — unparseable, two names for one key, or a key that is not an account key — refuses to start, naming the file | `topology.TestCallerNamesIsEveryCallerAndNothingElse`, `observe.TestABrokenCallersFileRefuses`, `observe.TestAKeyThatIsNotAnAccountKeyRefuses`, `rund.TestABrokenCallersTableRefusesToStartBeforeAnythingElse` (before the catalogue or the bus), `garmctl.TestDevEmitsAThrowawayTopologyAndSaysSo` parses the file it wrote |
| The health listener honours its context | `observe.TestCancellingTheContextStopsTheHealthListener`. The first version used `ctx` only as the requests' base context and nothing took the listener down but `stop` — found in review |
| A failed `fetch` is marked on its span like a failed `invoke` | `rundsvc.TestAFailedFetchIsMarkedOnItsSpan` |
| The test estate propagates what production propagates — trace context and baggage | `otlp.TestTheRecorderPropagatesBaggageLikeProduction` |
| `garmctl` prints no observability line unless an endpoint is set | `garmctl.TestGarmctlIsQuietAboutObservabilityUnlessAnEndpointIsSet`, through `root()` so the persistent hook runs |

### Signing keys

| invariant | kept true by |
|---|---|
| **The server refuses an account signed by the root** | `estate.TestTheServerRefusesAnAccountSignedByTheRoot` — strict signing-key usage on the operator JWT, enforced by the resolver on a `$SYS` push. Proved to fail with strict off *and* the generator's own check removed, so the refusal observed is the server's |
| **The server refuses a user signed by an account's identity key** | `estate.TestTheServerRefusesAUserSignedByAnIdentityKey` — the same user signed by the signing key connects |
| The generator cannot create an operator key, and refuses without one | `topology.TestTheOnlyCreateOperatorIsInOperatorGo` reads every non-test file; `TestGenerateRefusesWithoutAnOperatorSigningKey` |
| The operator JWT must list the signing key handed in, and be strict | `topology.TestGenerateRefusesAnOperatorJWTThatDoesNotListItsSigningKey`, `TestAnOperatorJWTWithoutStrictSigningIsRefused`, `TestInitOperatorWritesAStrictRootSignedOperator` |
| Nothing is signed by an identity key: accounts by the operator signing key, users and activations by the account signing key | `topology.TestEverythingIsSignedByASigningKeyAndNothingByAnIdentity`; `Keys.Accounts[].Identity` is a `string`, so the type forbids it |
| `topology` refuses a `--keys` holding the root | `garmctl.TestTopologyRefusesAKeysDirectoryHoldingTheRoot`, before anything is read |
| A new account's keys are born once, written to `--keys-out`, never to `--keys`; the archive is never read | `topology.TestANewCallersKeysAreBornOnce`; `garmctl.TestAccountKeysAreBornOnceAndTheArchiveIsNeverRead` (archive deleted, `--keys` fingerprinted); an unwritable `--keys-out` fails before the manifest or a credential is written (`TestAnUnwritableKeysOutFailsBeforeAnythingIsWritten`) |
| A key that disagrees with the manifest is refused — identity **and signing** | `topology.TestAKeysIdentityThatDisagreesWithTheManifestIsRefused`, `TestAKeysSigningKeyThatDisagreesWithTheManifestIsRefused` — a key swapped under a running estate is the attack, not a typo. The signing half was missing and found in review: a swapped seed listed only the new key and left every carried-forward credential dead on the push |
| `--rotate` and `--rotate-signing` together are refused; revocations carry a typed kind | `topology.TestRotateAndRotateSigningTogetherAreRefused`, `TestRevocationsCarryATypedKind` — the step-one filter matched a sentence before |
| A retirement is recorded, announced, and needs an explicit decision | `topology.TestStepTwoRecordsTheRetirement`; `garmctl.TestRetirementNeedsAnExplicitDecisionAndIsAnnounced` — an issuance that would drop a key refuses without `--verify-live` or `--no-verify-live` |
| Step one archives the superseded signing seed; seeds are written atomically | `garmctl.TestRotationArchivesTheOldSigningSeed` |
| `--verify-live` fails closed: pages every server's connections; fewer servers than `--servers` is no evidence | `garmctl.TestLiveSignersPagesThroughConnz` (page size 1), `TestVerifyLiveRefusesWhenFewerServersAnswerThanExpected` |
| A credential file missing from `--out` is reissued and announced | `garmctl.TestAMissingCredentialFileIsReissued`; `topology.TestANamedCredentialIsReissuedOnRequest` |
| A manifest signed by a replaced operator signing key still loads while listed; `replace-signing-key` refuses an existing `--out` and prints the adoption sequence | `topology.TestLoadAcceptsAnySignerTheOperatorLists`, `garmctl.TestAManifestSignedByTheReplacedKeyStillLoads`, `TestReplaceSigningKeyRefusesAnExistingOutAndPrintsTheSequence` |
| Rotation step one lists both keys, reissues only that account, revokes nothing | `topology.TestRotationStepOneListsBothKeysAndReissuesOnlyThatAccount`; `estate.TestRotationKeepsTheOldCredentialAliveUntilStepTwo` — the first build revoked the superseded credentials and step one's push cut the old connection |
| Step two retires the key; the old credential's live connection closes and it is refused on reconnect; a straggler or a second rotation while retiring is refused | `topology.TestRotationStepTwoRetiresTheOldKey`, `TestStepTwoRefusesAStraggler`, `TestRotatingAnAlreadyRetiringAccountIsRefused`; `estate.TestRotationKeepsTheOldCredentialAliveUntilStepTwo` |
| **`--verify-live` refuses to retire a key any live connection still uses, by name** | `garmctl.TestVerifyLiveRefusesWhileTheOldKeyIsStillOnTheWire` over the real `$SYS` `CONNZ`; `TestLiveSignersSeesTheIssuerKey` pins the field; `TestVerifyLiveIsInertWhenNothingIsRetiring` (no connection made) |
| `operator init` writes the root apart and refuses to repeat | `garmctl.TestOperatorInitWritesTheRootApartAndRefusesToRepeat`; `TestReplaceSigningKeyListsBothKeys` for the operator-level first half |
| `--status` reports a retiring key and issues nothing | `garmctl.TestStatusReportsARetiringKeyAndIssuesNothing` |
| The manifest is signed by the operator signing key, never the root | `garmctl.TestTheManifestCarriesTheCatalogueDigestAndVerifies` asserts the root does *not* verify it |

## Not enforced, and said so

| claim | why nothing checks it |
|---|---|
| A principal other than an **account** can be proved | Only `kind: account` is provable today — the bus authenticated it — so a grant may name nothing else, and `authority.TestAPrincipalKindThisBuildCannotProveIsRefused` enforces that. A person or a service principal needs auth callout, which is a later slice; `acts_for` records a subject without claiming anyone authenticated as it |
| A **run limit** must be at least the largest call limit in an allowlist | Specified, then dropped on implementation: an agent is always async and has no call limit of its own, making the check unfireable. `Async.limit` is a CALL limit (built, step 10); a RUN limit arrives with a decider. Recorded rather than silently removed, because a check that cannot fire reads as a guarantee |
| A tool name should have the *shape* `<package>.<tool>` | Only the **charset** is enforced (see the row above). The shape is a convention in the examples; enforcing it needs a decision about what a package is that nobody has made, and the charset closes the security hole without it |
| An agent's method name is never read | Closer than it was: the generator emits nothing for an agent, proved by `generate.TestAnAgentProducesNoGoAtAll`. Still unenforced in the direction that matters — no test asserts that *nothing anywhere* resolves an agent by method name, because the decider that would is the next step |
| The tool option is read in exactly one place | `declared.ToolOf` is that place, and the generator calls it rather than reaching for `proto.GetExtension` itself. Nothing *checks* that a second reader does not appear. A grep test would, and is worth writing once there are three readers rather than two — the old estate's single most expensive structural bug was one idea implemented twice |
| Generated code never grows a transport dependency | The import-set test above is the enforcement for what is emitted. What it cannot say is that `serve` itself stays transport-free: today it imports only `context` and two protobuf packages, and nothing fails if a broker is added to it |
| `Start` returns only once the subjects are **answering** | `Start` ends with `nc.Flush()` and micro never flushes on its own, so the guarantee is real — but **no test can lose the race it closes**. This table claimed "every other test in the package" enforced it; deleting the `Flush` and re-running them was green, because nats.go's flusher reaches the server long before a caller's request travels back. The test written to guard it was deleted rather than left reading as a guard |
| `Track` is what the drain waits for | `natsmicro.TestAnUntrackedHandlerIsNotWaitedFor` records the **cost** of forgetting it, which is the opposite of enforcing it. `Track` is exported precisely so a caller can forget to call it, and nothing detects a handler that does |
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
