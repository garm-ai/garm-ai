# The authority model: a grant meets a requirement

**Date:** 2026-10-08
**Status:** active — built as step 12, in the order §12 gives. The five
amendments execution made are marked **built:** where they apply and listed in
§14.

**Spec for:** who may invoke what, and who may see which run. A tool declares
what a caller must hold; a deployment grants principals what they hold; `rund`
permits a call when the grant satisfies the requirement, records the decision on
the run, and refuses otherwise with a reason naming which half failed. The first
slice in which a caller's proved identity is *used* rather than only carried.

**Why now.** Identity has been proved on every hop since step 9f and gated by
nothing: any caller may invoke any tool. Everything still unbuilt waits on this
one — approval needs to know who may approve, `Cancel` needs to know who may
cancel, a decider's run needs to know what it may reach on whose behalf, a tool
service verifying its own caller needs a grant to verify *against*, and a task
list filtered by compartment needs compartments to exist.

**What this slice is:** one declared requirement on a tool, one grant object in
the deployment's reviewed inputs behind a source interface, one decision
function `rund` calls on `Invoke` and on every read of a run, and the audit of
what it decided. Not the grant store, not the per-call authorization token, not
bounds, verbs or clearance — §13, which names the two slices that follow and
what each needs from this one.

Decided in conversation on 2026-10-07 and 2026-10-08, one question at a time;
§10 records each decision and the alternative it beat.

---

## 0. One sentence per thing that changes

A tool may declare **`requires { compartments }`** — a property of the tool,
written by the only author who knows it. A deployment's reviewed inputs carry
**grants**: a principal, the tools it may invoke, the compartments it holds, an
expiry, and optionally **the subject it acts for**. `rund` decides **once, at
`Invoke`**, through one function over a **`GrantSource`**, and **records the
matched grant on the run**, so a replay never re-decides and the audit says what
was relied on. A refusal is **`DENIED`** naming the half that failed; a run
another principal may not see stays **`NOT_FOUND`**. With no `--grants`, `rund`
announces a reduced posture: a tool that requires nothing is open, a tool that
requires anything is refused. A principal is **typed** from the first line, and
accounts are the only kind this slice can prove.

---

## 1. Two objects, two authors

The decisive argument for two objects rather than one is **authorship**. A tool's
author knows "this moves money, so a caller needs the `payments` compartment";
they cannot know who should hold it. A team lead knows "this agent acts for me on
payments until Friday"; they cannot know every tool that implies. One object
would make one of those two people write something they do not know — which is
the shape of the identity page's gap 3, where caveats live on a grant and so
nothing can say "never above €1m, whoever asks".

### 1.1 The requirement: what a tool asks of any caller

```proto
// garm/tool/v1/tool.proto -- additive.

message Tool {
  string name = 1;
  Agent agent = 2;
  oneof delivery { Sync sync = 3; Async async = 4; }

  // WHAT A CALLER MUST HOLD, declared by the only party who knows: this tool's
  // author. A property of the TOOL -- "this moves money" -- never of a caller:
  // nothing here names a principal, a role or a team, because a tool's author
  // does not know who should hold what, and a declaration that named them would
  // be policy written by the wrong person.
  //
  // Absent means the tool asks nothing. It does NOT mean "open": with a grant
  // source configured, a principal still needs a grant admitting the tool
  // (authority spec §3).
  Requirement requires = 5;
}

// What a caller must hold to invoke a tool.
message Requirement {
  // Every compartment a caller must hold -- ALL of them, not any. A compartment
  // is a name a deployment owns (§6); a requirement naming one no grant source
  // declares is a tool nobody can call, and rund refuses to start rather than
  // refuse every call.
  repeated string compartments = 1;

  // A bound over the REQUEST -- "never above €1m, whoever asks" -- is the next
  // slice (§13). It belongs here rather than in a grant because it is a fact
  // about this tool, true of every caller; it is absent because nothing
  // evaluates it yet, and a declaration nothing enforces reads as a guarantee.
}
```

An agent declares requirements like any other tool: what a *run of it* may
reach is its allowlist (§7), and what a caller must hold to *start* it is this.

### 1.2 The grant: what a principal holds

```yaml
# grants.yaml -- a deployment input, reviewed in the same committed place as
# images.yaml, the caller list and the issuance manifest. YAML because people
# read and review it; one document, schema-versioned like images.yaml.
schema: v1
compartments: [payments, weather, support]   # the vocabulary this deployment owns (§6)
grants:
  - principal: { kind: account, id: CALLER-studio }   # id is a name here; see §2
    tools: ["weather.v1.*"]
    compartments: [weather]
    expires: 2027-10-08T00:00:00Z

  - principal: { kind: account, id: CALLER-batch }
    tools: ["*"]                 # every tool whose requirements these compartments meet
    compartments: [weather, support]

  # An agent assigned to a person: the grant is held by the ACTING principal,
  # with the person recorded as the subject it acts for (§8). One lookup on the
  # acting principal decides a call; the subject is what the audit answers with.
  - principal: { kind: account, id: CALLER-studio-agent }
    acts_for: { kind: person, id: p.laenen@example.com }
    tools: ["payments.v1.get_balance", "weather.v1.*"]
    compartments: [payments, weather]
    expires: 2026-10-10T00:00:00Z
```

- **`tools`** is an allowlist of tool names, each either exact or a single
  trailing `*` over a dot-separated prefix. `"*"` is every tool. It is the
  deny-by-default half: a grant that does not admit a tool refuses it whatever
  the compartments say.
- **`compartments`** is what the principal holds, and what a requirement is
  checked against.
- **`expires`** is optional and absolute. A grant past it is no grant.
- **`acts_for`** is recorded, not decided on: in this slice the acting
  principal's own compartments decide, and the subject is carried into the run,
  the audit and the span. It becomes load-bearing when consent arrives and the
  subject's own grant has to be intersected.

---

## 2. The principal

```go
// Package run.
type PrincipalKind string

const (
	// KindAccount: a NATS account, proved by the server placing its key in the
	// subject (identity spec §3). The only kind this slice can prove.
	KindAccount PrincipalKind = "account"
	// KindPerson and KindService arrive with auth callout (identity spec §11,
	// slice 2): a connection identified at connect, not a header anyone can set.
	KindPerson  PrincipalKind = "person"
	KindService PrincipalKind = "service"
)

type Principal struct {
	Kind PrincipalKind
	ID   string
}
```

**Typed from the first line, with one kind.** A grant is a durable record: grants
written now will still exist when people can connect, and a grant keyed by a bare
string could not be told apart from a person's once both were strings. The
alternative — a string today, a type later — is a migration of the one kind of
record that must never be ambiguous.

The principal is **derived, never stored twice**: `run.PrincipalOf(h Headers)`
returns `Principal{KindAccount, h.Caller}`, where `h.Caller` is what the server
placed in the subject. `Headers` grows no second spelling of the same fact, for
the reason `tool.proto`'s `name` comment gives: two identities for one thing is
the most expensive bug this repository has had.

**In the grant file a principal's `id` is a NAME** (`CALLER-studio`), not an
account key, because a human writes and reviews the file and the keys are 56
random characters. `rund` resolves names to keys through the same `callers.json`
it already takes for span labels, and refuses to start on a grant naming a
principal that file does not know — a grant that can never match is a
configuration error, not a per-call refusal.

---

## 3. The decision

```go
// Package authority.

// Source is where grants come from. One implementation in this slice: the
// deployment's reviewed file. The second is the grant store (§13), and the
// decision function does not change when it arrives -- only its sources.
type Source interface {
	// For returns every unexpired grant held by this principal.
	For(ctx context.Context, p run.Principal, now time.Time) ([]Grant, error)
}

// Authority decides. One implementation; rund holds it; nothing else does.
type Authority struct {
	Source Source
	Now    func() time.Time
}

// Allow says whether this principal may invoke this tool, and WHAT IT RELIED ON:
// the matched grant, which the caller records on the run so that the audit says
// what was decided and a replay never re-decides (§4).
//
// Deny by default: no grant admitting the tool is a refusal. A tool that
// requires nothing still needs a grant admitting it -- "requires nothing" is a
// statement about the tool, not permission for everyone.
func (a *Authority) Allow(ctx context.Context, p run.Principal, t declared.Tool) (Grant, error)

// CanSee says whether this principal may read a run: the principal that started
// it, or a principal the run was started ON BEHALF OF (§8). It replaces
// run.Engine.visible, whose body the run-store spec §4 said this model would
// take over; its callers -- Fetch, Events, Follow -- do not change.
func (a *Authority) CanSee(ctx context.Context, p run.Principal, r run.Seen) bool
```

**The order of checks, and therefore of refusals.** A grant is matched first,
then the tool, then the compartments, because that is the order in which a
message can be most useful:

1. no unexpired grant for this principal → `DENIED`, "no grant for <principal>";
2. grants exist, none admits the tool → `DENIED`, "<principal>'s grant does not
   admit <tool>";
3. a grant admits the tool, compartments missing → `DENIED`, "<tool> requires
   <missing>; <principal> holds <held>".

**Multiple grants union.** A principal may hold several; the first that admits
the tool *and* satisfies the requirement permits the call, and that grant is what
is recorded. Compartments are not unioned across grants: a call permitted by two
half-grants would be a call nobody granted.

---

## 4. Where it is decided, and what a run carries

**At `Invoke`, once, for sync and async alike**, after the tool resolves and
before the plan. A sync call proceeds or is refused. An async call records the
decision:

```go
// run.Run gains, recorded at Start and carried in the plan's checkpoint:
	Principal    Principal   // who asked
	ActsFor      *Principal  // on whose behalf, from the matched grant (§8)
	Compartments []string    // what the decision relied on
	GrantID      string      // which grant, for the audit
```

**The workflow never re-decides, and this is a determinism requirement rather
than an optimisation.** The run store's replay guarantee is that nothing between
steps varies; a fresh grant lookup inside the workflow would make a replay take a
different path when a grant changed meanwhile — exactly the hazard the pinned
plan closed for the catalogue (run-store spec §1). So the decision is an input to
the run, checkpointed with the plan, and every tool-call step is checked against
the **recorded** compartments.

**A grant revoked while a run is queued does not stop it.** The run is the
platform's commitment to work a principal was authorized to ask for. Stopping it
is a `Cancel`, an explicit command the store already has and which this model now
gates — not a silent re-check whose timing nobody could reason about. Stated as a
decision in §10 because a reasonable person could want the opposite, and because
the opposite is unimplementable without breaking replay.

**Reads.** `Fetch`, `Events` and `Follow` call `CanSee`. The bus half of push's
ownership (an account-token stream export, push spec §2) is unchanged and still
independent: a principal that may `Fetch` a run it did not start does not thereby
receive its live events, and the spec says so rather than pretending the two
mechanisms are one. Making them one is part of the slice that gives a *team*
visibility (§13).

---

## 5. Refusals, and what they may say

**`DENIED` for a tool, with the reason.** A tool's existence is not a secret from
a caller: it holds the catalogue, which is how it builds the request. So naming
the tool and the missing compartment leaks nothing it did not already have, and
an unactionable refusal is the failure this repository's error rules exist to
prevent.

**`NOT_FOUND` for a run, still.** A run's existence *is* not the caller's to
learn (run-store spec §4), and `CanSee` returning false is indistinguishable from
an id that never existed.

**What a refusal never names:** another principal, another grant, or what the
caller would need to do to obtain one. "You lack `payments`" is actionable;
"ask Alice, who has it" is an information leak dressed as help.

---

## 6. The compartment vocabulary

A compartment is a name, and a name is only authority if everyone spells it the
same. A tool requiring `payments` and a grant carrying `payment` is a refusal
nobody can debug.

So the deployment **declares its vocabulary** in the same file as the grants, and
two checks make it mean something:

- **`rund` refuses to start** when a tool in its catalogue requires a compartment
  the vocabulary does not declare: a requirement nothing can satisfy is a tool
  nobody can call, and that is a configuration error, not a refusal per call.
  Named at boot, once, like the unservable-tools line it sits beside.
- **`rund` refuses to start** when a grant carries a compartment the vocabulary
  does not declare, which is how a typo in the grant is caught rather than
  silently granting nothing.

`garmctl compose` does **not** check this: it reads images and knows nothing of a
deployment's inputs, and giving it the grant file would make the catalogue's
build depend on one deployment's policy. The check belongs where both documents
are in hand, which is `rund`'s boot. **built:** `garmctl grants check` does the
same without starting `rund`, over the same `File.CheckCatalogue` the boot calls,
and prints what each principal may invoke by asking the same `Allow` a call asks.

---

## 7. An agent's run: the allowlist and the grant intersect

The allowlist is **the only authority on what a run may call** (decision
2026-10-03). That stands, and the grant is a second, independent gate:

- a tool call inside a run is permitted when the agent's allowlist cites it
  **and** the run's recorded compartments satisfy that tool's requirement;
- the intersection, never the union: an allowlist cannot widen a grant, and a
  grant cannot widen an allowlist.

The compartments are the **run's recorded** ones (§4), so a replay decides
identically. A step refused this way fails the run with `DENIED` and the tool's
name, as a tool's own refusal would.

This is also what stops the obvious escalation: an agent whose own requirement is
empty cannot reach a tool requiring `payments` unless the principal that started
the run held `payments` at that moment.

---

## 8. Acting for a person

`acts_for` on a grant records whose authority an agent is exercising. In this
slice it is carried, not computed with:

- the matched grant's `acts_for` lands on the run (`Run.ActsFor`), in `rund`'s
  log line, on the `garm.run.invoke` span as `garm.acts_for`, and in the step
  log through the envelope;
- `CanSee` returns true for the subject, so **a person can read the runs their
  agent made** — the one place in this slice where `acts_for` changes an outcome,
  and the reason the grant is held by the acting principal rather than by the
  person: the call's decision stays one lookup, and the person's visibility falls
  out of the same record;
- it is **not** intersected with the subject's own grant, because a person has no
  grant until person identity exists. When it does, the rule is stated now so the
  shape does not surprise anyone: a call will need both the actor's grant and the
  subject's, and the narrower wins.

Never a payload, never a secret: `acts_for` is an identity, and it goes where
identities already go.

---

## 9. Configuration

- **`rund --grants <path>`**: the grant file. Absent means **no grant source**,
  and `rund` says so at startup in the line that already carries every other
  effective value: every principal satisfies a tool that requires nothing, and a
  tool with a requirement is refused `DENIED` naming the flag. Exactly the shape
  `--run-store` has, for the same reason — a laptop runs the quick start, a
  deployment passes the flag and gets deny-by-default.
- **Loaded at boot, re-read on `SIGHUP`**: a grant change is an operation, and
  an operation that needs a restart of the component every call goes through is
  one a deployment will avoid making. `SIGHUP` re-reads and swaps the source
  atomically, logs the generation, and refuses to swap in a file that fails the
  checks in §6 — the running authority stays rather than widening or emptying.
- **`--callers`** gains a second reader: the name-to-key resolution of §2. It is
  already required for span labels in a deployment; it becomes required when
  `--grants` is given, and `rund` says which name failed.
- No new credential, no new account, no new subject. The decision is `rund`'s and
  reaches the bus nowhere in this slice.

---

## 10. Decisions settled in conversation

| decision | chosen | beat |
|---|---|---|
| where authority lives | two objects: the catalogue carries what a tool requires, grants carry what a principal holds | one object: a grant per principal (nowhere to say "never above €1m, whoever asks"), or a policy per tool (a tool author writing about principals) |
| what a principal is | typed from the first line (`Kind`, `ID`), accounts the only provable kind | a bare account string renamed later — a migration of durable records; or a caller-asserted header, which the bus decision already rejected for identity |
| what a tool may require | named compartments only; bounds over the request next; never a predicate over the principal | CEL in the declaration, which lets a tool author write policy about callers |
| where grants live | the deployment's reviewed inputs, behind a `Source` interface | a store now: a second kind of database for `rund`, a migration, and the recursive "who may grant" answered before the model is proved. **Corrected in conversation:** the store is the *next* slice rather than a distant one, because assigning an agent to a person is a runtime grant write and needs no person identity |
| who holds an assignment grant | the acting principal, with the person recorded as `acts_for` | the person, with the agent named as a permitted actor: one write revokes everything, but every call becomes a two-step lookup |
| when the decision is made | once, at `Invoke`, recorded on the run; steps check the recorded compartments | per step, re-read: a revoked grant would change a replay's path, which the run store's determinism forbids |
| what a refusal says | `DENIED` naming the failing half for a tool; `NOT_FOUND` for a run | a uniform `NOT_FOUND`, which hides nothing the caller lacks and makes every misconfiguration unactionable |
| no `--grants` | a reduced, announced posture (requirement-less tools open, requiring tools refused) | deny everything (the quick start stops working) or allow everything (a security posture chosen by omission) |
| whether a subject keeps reading a run after its grant is gone | **yes**: `CanSee` compares against the `acts_for` RECORDED on the run, never the source as it now stands | re-checking at read time, which would make the run's own record a lie and make a person's history disappear when an assignment ends. **Named in review** rather than left emergent: revoking an assignment stops an agent acting, it does not unmake what it already did, and a deployment that needs the history hidden needs a retention decision, not a visibility one |

---

## 11. Properties, stated as tests

1. **A tool requiring nothing is invoked by a principal whose grant admits it**,
   sync and async.
2. **A tool requiring a compartment the grant carries is invoked**; the decision
   is recorded on the run with the grant's id and compartments.
3. **A tool requiring a compartment the grant lacks is `DENIED`**, naming the
   tool and the missing compartment and nothing else.
4. **A principal with no grant is `DENIED`** naming the principal, not the tool's
   requirements.
5. **A grant that does not admit the tool is `DENIED`** even when the
   compartments would satisfy it.
6. **A prefix grant (`weather.v1.*`) admits what it covers and nothing more** —
   `weather.v1.get_forecast` yes, `weather2.v1.get_forecast` no.
7. **An expired grant is no grant**, and the refusal says so rather than "no
   grant".
8. **Two half-grants do not combine**: one carrying the tool, another carrying
   the compartment, is `DENIED`.
9. **With no `--grants`, a requirement-less tool is invoked and a requiring tool
   is `DENIED` naming the flag**; the startup line says which posture is in force.
10. **`rund` refuses to start** when a catalogue tool requires an undeclared
    compartment, naming the tool and the compartment; and when a grant names an
    undeclared compartment or an unknown principal.
11. **A step inside an agent's run is refused** when the run's recorded
    compartments do not satisfy the called tool's requirement, even though the
    allowlist cites it; the run fails `DENIED` naming the tool.
12. **The allowlist still binds**: a tool the grant admits but the allowlist does
    not is refused inside a run.
13. **A replay decides identically**: a run whose grant was removed from the file
    and whose replica relaunched still completes, from the recorded decision.
14. **`CanSee` admits the starting principal and the subject it acted for, and
    nobody else**: `Fetch`, `Events` and `Follow` agree, and a third principal
    gets `NOT_FOUND` from all three.
15. **The bus half is unchanged**: a principal that may `Fetch` another's run by
    `acts_for` does not receive its live events (push's export is per owner).
16. **`acts_for` reaches the log, the span and the run's record**, and no payload
    does.
17. **`SIGHUP` re-reads the grants**: a grant added takes effect without a
    restart; a file that fails §6's checks is refused and the running authority
    stands, said in the log.
18. **The decision is one function**: `run.Engine` calls `Allow` and `CanSee` and
    contains no compartment logic; `authority` imports no transport.
19. **A grant file with an unknown `schema`** is refused at boot, naming the
    version it understands.

---

## 12. Migration order

1. **The vocabulary and the objects.** `Requirement` in `tool.proto`;
   `run.Principal`, `PrincipalOf`; the `authority` package with `Grant`, `Source`,
   the file source, and `Allow`/`CanSee` as pure functions over a loaded source.
   Properties 3–8, 19.
2. **The decision in `rund`.** `Engine.Allow` at `Invoke`; the recorded decision
   on `run.Run`; `visible` replaced by `CanSee`; `--grants`, `--callers` resolution,
   the boot checks, the startup line. Properties 1, 2, 4, 9, 10, 14, 18.
3. **Inside a run.** The step's check against the recorded compartments; the
   allowlist intersection; the replay property. Properties 11, 12, 13.
4. **`acts_for`.** Carried into the run, the log, the span; `CanSee` for the
   subject; the bus half stated and tested as unchanged. Properties 15, 16.
5. **`SIGHUP`.** Property 17.
6. **The estate, the quick start and the docs.** The estate gains grants for its
   two callers and a `WithoutGrants` option for the reduced posture; the example
   declares one requirement on `weather.v1.schedule_report` so the quick start
   exercises a real one; `garmctl grants check`; concepts, guide, invariants,
   roadmap, the identity page's gaps 1 and 3 answered or re-stated.

Every step is inside the repository and needs no container.

---

## 13. What this does not do

- **The grant store — the next slice.** A `Grant` verb on `rund`, grants in our
  own table beside the run store's schema, a `Source` implementation reading it,
  and the one question this slice defers: **who may write a grant**. The answer
  that keeps it from being recursive: a *bootstrap* grant in the file carries the
  right to grant, every later granter holds a granted one, and the file remains
  the root of trust the way the manifest is for credentials. Everything in §3's
  interface is already shaped for it.
- **The signed per-call authorization — the slice after.** `rund` attaches a
  short-lived, operator-signed statement to each tool call — this principal, this
  tool, this run, these compartments, expiring in seconds — and the generated
  binding verifies it, so a tool service stops trusting *position* (the message
  came from `rund`'s account) and starts trusting a statement it can check. It
  needs this slice's principal and grant to have anything to assert, and it is
  what lets a tool service answer "who asked" in its own audit with something it
  verified. The identity page's gap 1 (the presenter binding never implemented)
  is closed there, not here.
- **Bounds over a request.** `Requirement.bound`, evaluated by `rund` against
  the catalogue's descriptors: the identity page's gap 3. Declared in §1.1's
  comment, built when the evaluator is.
- **Verbs, clearance, tool sets, a principal ceiling.** Each returns with its own
  enforcer, as the roadmap's block says; none is needed to decide this slice's
  question.
- **Consent, and a person's own grant.** Needs person identity (auth callout,
  identity spec §11 slice 2). §8 states the rule that will apply so the shape is
  not a surprise.
- **A team watching a run it did not start.** Needs a verb (`watch`) and makes
  push's per-owner export insufficient; §4 states why the two mechanisms are
  deliberately separate until then.
- **Rate limiting, and anything a service enforces from its own declaration.**
  Discussed and deferred: input size and concurrency are honest guardrails a
  service can enforce; a per-replica rate limit misleads unless its scope is
  written down; a required compartment belongs in the grant, not the declaration.
- **Hot reload of the catalogue.** Unchanged: boot only. `SIGHUP` in §9 reloads
  grants, not the catalogue.

---

## 14. Amendments execution made

Five, each with what it cost.

1. **`garmctl grants check`, not `garmctl grants --check`** (§6, §12.6). A bool
   flag with exactly one meaningful value is debt, `operator init` is the
   binary's precedent for a noun with verb subcommands, and the grant store's
   slice needs `grants list` and `grants add` beside it. The command's refusals
   and its report are what the spec asked for, under a different path.

2. **Property 12's end-to-end half is a unit test** (§7). "A replay follows the
   compartments the run recorded, not the file's current ones" cannot be staged
   through a real multi-step run until a decider exists — one tool call is one
   step. `authority.CheckStep` is tested directly against a recorded run's
   compartments, and `rundbos.TestAStepBeyondTheRunsCompartmentsIsDenied` makes
   the same check inside a real workflow. The gap closes with the decider.

3. **`SIGHUP` is tested as the wired function plus one signal test** (§9).
   Signalling the test process itself to assert a reload would make every other
   test in the package share a signal handler. `reloadAuthority` is called
   directly, and the handler's wiring is asserted separately;
   `scripts/e2e.sh` sends the real `SIGHUP` to a real `rund`.

4. **The example's requirement landed in step 2, not step 6** (§12.1, §12.6).
   The boot check in §6 cannot be tested without a catalogue tool that requires
   something, so `weather.v1.schedule_report` gained `requires:
   { compartments: ["weather"] }` as soon as the check did.

5. **The quick start's refusal is made by a reload** (§12.6). The example
   declares exactly one gated tool by design, and the async path needs that tool
   to succeed. So `scripts/e2e.sh` runs the async call under a grant that holds
   `weather`, then takes the compartment away, `SIGHUP`s, and asserts the same
   call is `DENIED` — which proves §9's reload end to end as well, where it had
   been unit-tested only.

6. **The live-feed half of property 15 substitutes a third account for the
   subject** (§8). "The subject does not receive the live events" cannot be
   staged as written: a person has no connection in this build, so nothing can
   subscribe as one. The test subscribes as a second ACCOUNT, which proves the
   export is keyed by the account the server placed in the subject and not by a
   grant — the mechanism the property is about. `Follow` is not asserted
   separately either: it is client-side over `Events` plus the live feed, both
   of which are.

7. **The grant generation is on the `grants` line, not the `starting` line**
   (§9). The startup line is this process's effective configuration, logged
   before anything is read; a file's content digest is not configuration. The
   `grants` line at boot carries the path, the generation and the vocabulary,
   and a reload logs the new generation beside the old one — which is the
   question a person editing the file actually has.

8. **Five guards were found passing blind, and one declaration honoured by
   nothing** (review, 2026-10-08). The deny-by-default guard in `Allow`, the
   two-unknowns guard in `CanSee`, the refused reload's log line, the subject's
   read in `run`, and the `--listen`/`--monitor` refusal each had a test that
   passed with the mechanism removed; `observe.KeyActsFor` was declared and
   claimed in three documents and set nowhere. Each is now proved to fail. The
   project's rule that a check passing blind is worse than none made this a
   fix-now rather than a note.
