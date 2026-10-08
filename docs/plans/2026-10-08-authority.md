# The authority model — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A tool declares `requires { compartments }`; a deployment's reviewed
inputs grant principals tools and compartments; `rund` decides once at `Invoke`
through one function, records the decision on the run, refuses with `DENIED`
naming the failing half, and gates every read of a run through the same model.
Without `--grants`, `rund` announces a reduced posture. With it, deny by default.

**Architecture:** A new `authority` package owns `Grant`, `Source`, `Allow` and
`CanSee` and imports no transport. `run.Engine` gains an `Authority` and calls
it; `run.Run` carries the recorded decision; `rundbos`'s workflow checks the
*recorded* compartments at each step, never a fresh lookup, so a replay decides
identically. The grant file is the only `Source` in this slice; the store is the
next one, against an unchanged interface.

**Tech Stack:** Go 1.26.6 (`mise exec -- go`) · protobuf (`tool.proto` is
additive) · `gopkg.in/yaml.v3` (already a dependency, `images/manifest.go`'s
precedent) · `buf`.

**Spec:** [docs/specs/2026-10-08-authority-design.md](../specs/2026-10-08-authority-design.md)
— §11 properties 1–19, §12 order, §10 decisions.

## Global Constraints

- **A property is not trusted until it has been proved to fail.** `git add` every
  new file BEFORE the first probe (an untracked file is not restorable), restore
  with `git checkout --`, and `git status` must be empty after each probe.
- **`authority` imports no transport and no DBOS**: not `nats.go`, not `rundsvc`,
  not `dbos-inc`. `mise run no-broker` gains the package (Task 1), and `no-sdk`
  already covers the boundary it must not cross.
- **One decision function.** `run.Engine` contains no compartment arithmetic and
  no grant parsing; it calls `Allow` and `CanSee` (property 18).
- **The decision is an input to a run, never re-taken inside it.** The workflow
  reads `Run.Compartments`; a grant lookup inside a step is the determinism bug
  this plan exists to avoid (property 13).
- **A refusal names the failing half and nothing else**: never another
  principal, never another grant, never how to obtain one (spec §5).
- **No payload anywhere new.** `acts_for` is an identity; compartments are names.
- **Wire changes are additive**; `buf breaking` stays green.
- **Docs move with the fact**, in the same commit.
- Run tests as `cmd > /tmp/x.out 2>&1; echo "exit=$?"` and read the file; never
  `| tail && git commit`.

## Review Focus

1. **A grant whose `tools` pattern is `*` in the middle** (`weather.*.forecast`)
   or a bare prefix without a dot (`weather*`). Expected: refused when the file
   is loaded, naming the pattern and the rule (one trailing `.*` or exactly
   `*`), not silently matching nothing or everything. Task 1
   (`TestAToolPatternMustBeExactOrATrailingStar`).
2. **A grant for a principal the `callers.json` does not know, with `--grants`
   given but `--callers` absent.** Expected: `rund` refuses to start naming both
   flags — a grant that can never match is a configuration error, and silently
   accepting it would deny every call with "no grant". Task 2
   (`TestGrantsWithoutCallersRefusesToStart`).
3. **An agent whose own requirement is empty reaching a tool that requires a
   compartment the run's principal does not hold.** Expected: the step is
   refused `DENIED`, the run fails, the tool was never called — the escalation
   path §7 exists to close. Task 3 (`TestAnAgentCannotReachBeyondItsRunsCompartments`).
   *(This slice has no decider, so the test drives `run.Plan`'s multi-action path
   directly through the store with a two-action plan; the plan step says how.)*
4. **`SIGHUP` with a file that now fails the vocabulary check.** Expected: the
   running authority stands, the log says the reload was refused and why, and the
   next call is decided by the old grants — never by an empty source. Task 5
   (`TestARefusedReloadKeepsTheRunningAuthority`).
5. **A run read by the subject it acted for, through all three verbs.** Expected:
   `Fetch`, `Events` and `Follow` agree; and the subject does **not** receive the
   live events, because push's export is per owner. Task 4
   (`TestTheSubjectReadsTheRunButDoesNotReceiveItsLiveEvents`).

---

## File structure

| path | responsibility |
|---|---|
| `proto/garm/tool/v1/tool.proto` | `Requirement`, `Tool.requires = 5` |
| `declared/declared.go` | `Tool.Requires []string`; `Compartments()`; the delivery/agent problems unchanged |
| `authority/authority.go` (new) | `Grant`, `Source`, `Authority`, `Allow`, `CanSee`, `ErrNoGrant` and the refusal texts |
| `authority/file.go` (new) | the YAML file source: parse, validate, `For`; `Vocabulary()`; `Principals()` |
| `authority/authority_test.go`, `file_test.go` (new) | properties 3–8, 19, review focus 1 |
| `run/run.go` | `Engine.Authority`; `Allow` at `Invoke`; `visible` → `CanSee`; `Run` gains `Principal`, `ActsFor`, `Compartments`, `GrantID`; `PrincipalOf` |
| `run/principal.go` (new) | `Principal`, `PrincipalKind`, `PrincipalOf`, `Seen` |
| `rundbos/workflow.go` | the step checks `r.Compartments` against the called tool's requirement and the allowlist |
| `rundbos/rundbos.go` | the recorded decision in the run's attributes, for the audit |
| `cmd/rund/main.go` | `--grants`, the boot checks, the startup line, `SIGHUP` |
| `internal/estate/estate.go` | grants for `studio` and `batch`; `WithoutGrants()`; `WithGrant(...)` |
| `examples/proto/weather/v1/weather.proto` | `weather.v1.schedule_report` requires `weather` |
| `scripts/e2e.sh`, `build/topo` inputs | a `grants.yaml` the quick start writes and `rund` loads |
| `cmd/garmctl/grants.go` (new) | `garmctl grants --check` |
| docs | concepts, guide §4, invariants, roadmap, the identity page's gaps, the operations page |

---

### Task 1: The objects — a requirement, a grant, a decision

**Files:**
- Create: `authority/authority.go`, `authority/file.go`, `authority/authority_test.go`, `authority/file_test.go`, `run/principal.go`
- Modify: `proto/garm/tool/v1/tool.proto` (+ `mise run gen`), `declared/declared.go`, `declared/declared_test.go`, `mise.toml` (`no-broker`)

**Interfaces:**
- Produces:
  ```go
  // run (principal.go)
  type PrincipalKind string
  const (KindAccount PrincipalKind = "account"; KindPerson = "person"; KindService = "service")
  type Principal struct{ Kind PrincipalKind; ID string }
  func (p Principal) String() string        // "account:ACX…" -- what a refusal and a log line carry
  func (p Principal) Zero() bool
  func PrincipalOf(h Headers) Principal     // {KindAccount, h.Caller}; Zero when the transport proved none
  // Seen is what CanSee needs of a run, so authority imports no store type.
  type Seen struct{ Principal Principal; ActsFor *Principal }

  // declared
  // Tool gains: Requires []string  (the compartments, in declaration order)

  // authority
  type Grant struct {
      ID           string        // "<principal>#<index>" from the file; the store's will be its row id
      Principal    run.Principal
      ActsFor      *run.Principal
      Tools        []string      // exact names, or one trailing ".*", or exactly "*"
      Compartments []string
      Expires      time.Time     // zero = no expiry
  }
  func (g Grant) Admits(tool string) bool
  func (g Grant) Satisfies(requires []string) (missing []string)

  type Source interface {
      For(ctx context.Context, p run.Principal, now time.Time) ([]Grant, error)
  }

  type Authority struct{ Source Source; Now func() time.Time }
  func (a *Authority) Allow(ctx context.Context, p run.Principal, t declared.Tool) (Grant, error)
  func (a *Authority) CanSee(ctx context.Context, p run.Principal, r run.Seen) bool

  // authority/file.go
  type File struct{ ... }
  func LoadFile(path string, resolve func(name string) (key string, ok bool)) (*File, error)
  func (f *File) For(ctx, p, now) ([]Grant, error)
  func (f *File) Vocabulary() []string           // the declared compartments
  func (f *File) Generation() string             // the file's digest, for the reload log line
  ```

- [ ] **Step 1: Failing tests** — `authority/authority_test.go`:

```go
package authority_test

func grant(p string, tools, comps []string, exp time.Time) authority.Grant {
	return authority.Grant{ID: p + "#0", Principal: run.Principal{Kind: run.KindAccount, ID: p},
		Tools: tools, Compartments: comps, Expires: exp}
}

// fixed is a Source over a slice, so the decision is tested without a file.
type fixed []authority.Grant

func (f fixed) For(_ context.Context, p run.Principal, now time.Time) ([]authority.Grant, error) {
	var out []authority.Grant
	for _, g := range f {
		if g.Principal == p && (g.Expires.IsZero() || g.Expires.After(now)) {
			out = append(out, g)
		}
	}
	return out, nil
}

func tool(name string, requires ...string) declared.Tool {
	return declared.Tool{Name: name, Requires: requires}
}

func authorityOver(src authority.Source) *authority.Authority {
	return &authority.Authority{Source: src, Now: func() time.Time { return time.Date(2026, 10, 8, 12, 0, 0, 0, time.UTC) }}
}

// Property 2: a tool whose requirement the grant carries is permitted, and the
// decision says WHAT IT RELIED ON -- the grant, for the run's record and the audit.
func TestAGrantThatSatisfiesTheRequirementPermitsAndSaysWhatItRelliedOn(t *testing.T) {
	a := authorityOver(fixed{grant("ACX", []string{"payments.v1.*"}, []string{"payments"}, time.Time{})})
	g, err := a.Allow(context.Background(), run.Principal{Kind: run.KindAccount, ID: "ACX"}, tool("payments.v1.get_balance", "payments"))
	if err != nil || g.ID != "ACX#0" || !reflect.DeepEqual(g.Compartments, []string{"payments"}) {
		t.Fatalf("%+v %v", g, err)
	}
}

// Property 3: the missing compartment is named, and nothing else is.
func TestAMissingCompartmentIsDeniedNamingIt(t *testing.T) {
	a := authorityOver(fixed{grant("ACX", []string{"*"}, []string{"weather"}, time.Time{})})
	_, err := a.Allow(context.Background(), run.Principal{Kind: run.KindAccount, ID: "ACX"}, tool("payments.v1.get_balance", "payments"))
	var se *serve.Error
	if !errors.As(err, &se) || se.Kind != invokev1.ErrorKind_ERROR_KIND_DENIED {
		t.Fatalf("got %v, want DENIED", err)
	}
	if !strings.Contains(se.Message, "payments") || !strings.Contains(se.Message, "payments.v1.get_balance") {
		t.Fatalf("the refusal does not name the tool and the missing compartment: %q", se.Message)
	}
	// and it names nothing it should not
	for _, leak := range []string{"ACY", "ask ", "Alice", "#0"} {
		if strings.Contains(se.Message, leak) {
			t.Errorf("the refusal leaks %q: %q", leak, se.Message)
		}
	}
}

// Property 4: no grant at all is DENIED naming the principal, not the tool's
// requirements -- the caller's problem is that it holds nothing.
func TestNoGrantIsDeniedNamingThePrincipal(t *testing.T)

// Property 5: a grant that does not admit the tool is DENIED even when the
// compartments would satisfy it.
func TestAGrantThatDoesNotAdmitTheToolIsDenied(t *testing.T)

// Property 6: a prefix admits what it covers and nothing more.
func TestAPrefixGrantAdmitsItsPrefixOnly(t *testing.T) {
	g := grant("ACX", []string{"weather.v1.*"}, nil, time.Time{})
	for name, want := range map[string]bool{
		"weather.v1.get_forecast": true, "weather.v1.a.b": true,
		"weather2.v1.get_forecast": false, "weather.v2.get_forecast": false, "weather.v1": false,
	} {
		if g.Admits(name) != want {
			t.Errorf("Admits(%q) = %v", name, !want)
		}
	}
	if !grant("ACX", []string{"*"}, nil, time.Time{}).Admits("anything.v1.at_all") {
		t.Error(`"*" must admit every tool`)
	}
}

// Property 7: an expired grant is no grant, and the refusal says so rather than
// "no grant" -- the two are different problems for whoever reads it.
func TestAnExpiredGrantIsRefusedAsExpired(t *testing.T)

// Property 8: two half-grants do not combine -- one carrying the tool, another
// the compartment. A call permitted by two halves is a call nobody granted.
func TestTwoHalfGrantsDoNotCombine(t *testing.T) {
	a := authorityOver(fixed{
		grant("ACX", []string{"payments.v1.get_balance"}, []string{"weather"}, time.Time{}),
		grant("ACX", []string{"weather.v1.*"}, []string{"payments"}, time.Time{}),
	})
	if _, err := a.Allow(context.Background(), run.Principal{Kind: run.KindAccount, ID: "ACX"}, tool("payments.v1.get_balance", "payments")); err == nil {
		t.Fatal("two half-grants combined into a permission")
	}
}

// A tool that requires nothing still needs a grant admitting it: "requires
// nothing" is a statement about the tool, not permission for everyone.
func TestARequirementlessToolStillNeedsAGrantAdmittingIt(t *testing.T)

// CanSee: the starting principal, and the subject it acted for; nobody else.
func TestCanSeeAdmitsTheStarterAndTheSubjectOnly(t *testing.T)
```

`authority/file_test.go`:

```go
// Property 19: an unknown schema is refused naming the version understood.
func TestAnUnknownSchemaIsRefused(t *testing.T)

// Review focus 1: a tool pattern is exact, one trailing ".*", or exactly "*".
func TestAToolPatternMustBeExactOrATrailingStar(t *testing.T) {
	for _, bad := range []string{"weather.*.forecast", "weather*", "*.v1.get", "**", "weather.v1.*.*"} {
		if _, err := loadGrants(t, grantsYAML(bad)); err == nil || !strings.Contains(err.Error(), bad) {
			t.Errorf("pattern %q was accepted or unnamed: %v", bad, err)
		}
	}
	for _, ok := range []string{"weather.v1.get_forecast", "weather.v1.*", "*"} {
		if _, err := loadGrants(t, grantsYAML(ok)); err != nil {
			t.Errorf("pattern %q: %v", ok, err)
		}
	}
}

// A grant naming an undeclared compartment is refused when the file loads --
// a typo that would otherwise grant nothing, silently.
func TestAGrantNamingAnUndeclaredCompartmentIsRefused(t *testing.T)

// A grant naming a principal the caller table does not know is refused, naming it.
func TestAGrantForAnUnknownPrincipalIsRefused(t *testing.T)

// The file resolves NAMES to account keys: a grant is written for CALLER-studio
// and matches the principal whose ID is that account's key.
func TestAGrantIsWrittenByNameAndMatchesByKey(t *testing.T)

// acts_for is parsed, typed, and carried onto the grant.
func TestActsForIsParsedAndCarried(t *testing.T)
```

- [ ] **Step 2: Run** — `mise exec -- go test ./authority/ ./declared/ > /tmp/t1.out 2>&1; echo "exit=$?"`. Expected: compile FAIL (no package `authority`, `declared.Tool.Requires` undefined).

- [ ] **Step 3: The proto and `declared`** — `Requirement` and `Tool.requires = 5` exactly as spec §1.1, with its comments; `mise run gen`; `mise run breaking` (Expected: green). `declared.Tool` gains `Requires []string` from `tool.GetRequires().GetCompartments()`. `DeliveryProblems` is untouched: a requirement naming an undeclared compartment is not compose's to judge (spec §6), and compose sees no deployment input.

- [ ] **Step 4: `run/principal.go`** — the type, `PrincipalOf`, `String` (`"account:ACX…"`, the ID truncated to 12 characters in the string form so a refusal is readable; the full ID stays in the struct), `Seen`.

- [ ] **Step 5: `authority/authority.go` and `file.go`** — as the Interfaces block. The refusal texts, in one place:
  ```go
  // The four refusals, in the order the checks run, because that is the order in
  // which a message can be most useful. Each names the failing half and nothing
  // else: never another principal, never another grant, never how to get one.
  func noGrant(p run.Principal) error { return serve.Denied("%s holds no grant", p) }
  func expired(p run.Principal, at time.Time) error { return serve.Denied("%s's grant expired on %s", p, at.UTC().Format(time.DateOnly)) }
  func notAdmitted(p run.Principal, tool string) error { return serve.Denied("%s's grant does not admit %s", p, tool) }
  func missing(p run.Principal, tool string, missing, held []string) error {
      return serve.Denied("%s requires %v; %s holds %v", tool, missing, p, held)
  }
  ```
  Both pieces already exist and were checked while writing this plan:
  `serve.Denied` (`serve/error.go:78`) and `ERROR_KIND_DENIED = 3`
  (`proto/garm/invoke/v1/error.proto:39`), so nothing is added to the error wire.
  The file source: `yaml.Unmarshal` into a schema-versioned struct, validate (schema, patterns, vocabulary, principals), resolve names through the injected `resolve`, and keep grants indexed by principal ID. `Generation()` is the file's sha256, first 12 hex.

- [ ] **Step 6: `mise.toml`** — add `./authority` to `no-broker`'s package list. Prove it bites: `import _ "github.com/nats-io/nats.go"` in `authority/authority.go` → `mise run no-broker` FAIL → remove. Ledger.

- [ ] **Step 7: Run; commit; probes** — Expected PASS. Commit `proto garm declared authority run/principal.go mise.toml`: "authority: a requirement on a tool, a grant in a file, one decision function". Probes: make `Satisfies` return no missing when any compartment matches → property 3 and 8 FAIL; accept any pattern in the file → review focus 1 FAILS. Restore each.

---

### Task 2: The decision in `rund`

**Files:**
- Modify: `run/run.go`, `run/store.go`, `run/store_test.go`, `run/run_test.go`, `rundsvc/rundsvc.go`, `cmd/rund/main.go`, `cmd/rund/main_test.go`, `internal/estate/estate.go`, `internal/estate/authority_test.go` (new)

**Interfaces:**
- Produces:
  ```go
  // run.Engine gains:
  //   Authority *authority.Authority  // nil = no grant source: the reduced posture (spec §9)
  // run.Run gains: Principal, ActsFor *Principal, Compartments []string, GrantID string
  // Engine.Invoke decides before planning; Engine.Fetch/Events use CanSee.
  // estate: WithoutGrants(), WithGrant(principal string, tools, compartments []string)
  ```

- [ ] **Step 1: Failing tests** — `run/store_test.go` (the engine fixture gains an authority; `engineWith` grows a variant `engineWithAuthority(t, store, src)`):

```go
// Property 1 and 2 at the engine: a permitted async invoke records the decision
// on the run -- the principal, what it relied on, and which grant.
func TestAPermittedAsyncInvokeRecordsTheDecision(t *testing.T) {
	rec := &recorder{}
	e := engineWithAuthority(t, rec, fixedSource("ACX", []string{"*"}, []string{"weather"}))
	_, failure := e.Invoke(context.Background(), &runv1.InvokeRequest{Tool: probeAsyncRequiring},
		run.Headers{Idempotency: "k", Caller: "ACX", Message: "m0"})
	if failure != nil {
		t.Fatal(failure)
	}
	r := rec.started[0]
	if r.Principal != (run.Principal{Kind: run.KindAccount, ID: "ACX"}) || !reflect.DeepEqual(r.Compartments, []string{"weather"}) || r.GrantID == "" {
		t.Fatalf("the run recorded %+v", r)
	}
}

// Property 3 through the engine: DENIED, named, and the run was never started.
func TestADeniedInvokeStartsNoRun(t *testing.T) {
	rec := &recorder{}
	e := engineWithAuthority(t, rec, fixedSource("ACX", []string{"*"}, nil))
	_, failure := e.Invoke(context.Background(), &runv1.InvokeRequest{Tool: probeAsyncRequiring}, run.Headers{Idempotency: "k", Caller: "ACX"})
	if failure == nil || failure.GetKind() != invokev1.ErrorKind_ERROR_KIND_DENIED {
		t.Fatalf("got %v, want DENIED", failure)
	}
	if len(rec.started) != 0 {
		t.Fatal("a denied invoke started a run")
	}
}

// Property 9: with no authority, a requirement-less tool is invoked and a
// requiring one is DENIED naming the flag.
func TestWithoutAnAuthorityARequirementIsRefusedNamingTheFlag(t *testing.T) {
	e, c := engineWith(t, nil) // no Authority
	if _, failure := e.Invoke(context.Background(), &runv1.InvokeRequest{Tool: "probe.v1.read"}, run.Headers{}); failure != nil {
		t.Fatalf("a requirement-less sync tool was refused: %v", failure)
	}
	_, failure := e.Invoke(context.Background(), &runv1.InvokeRequest{Tool: probeSyncRequiring}, run.Headers{Caller: "ACX"})
	if failure == nil || failure.GetKind() != invokev1.ErrorKind_ERROR_KIND_DENIED || !strings.Contains(failure.GetMessage(), "--grants") {
		t.Fatalf("got %v, want DENIED naming --grants", failure)
	}
	_ = c
}

// Property 14: Fetch and Events admit the starter and the subject, nobody else.
func TestFetchAndEventsAdmitTheStarterAndTheSubject(t *testing.T)
```

`cmd/rund/main_test.go`: `TestGrantsWithoutCallersRefusesToStart` (review focus 2) and `TestAnUndeclaredCompartmentInTheCatalogueRefusesToStart` (property 10) through `serveRund`, which already takes its inputs as arguments.

`internal/estate/authority_test.go`: property 1 and 3 on the wire — `studio` holds `weather`, invokes `weather.v1.schedule_report` (which Task 6 makes require `weather`) and succeeds; `batch` holds nothing for it and is `DENIED` with the compartment named.

- [ ] **Step 2: Run** — RED.
- [ ] **Step 3: Implement** — `Engine.Authority`; in `Invoke`, after the tool resolves and before `Plan`:
  ```go
  g, err := e.permit(ctx, tool, h)   // nil Authority: the reduced posture, spec §9
  if err != nil { return nil, e.fail(ctx, runID, h, tool.Name, err) }
  ```
  with `permit` returning the matched grant (zero in the reduced posture), and `startAsync` copying `g` onto the `Run`. `visible` becomes `e.canSee(h, st)` delegating to the authority, and keeping today's behaviour when `Authority` is nil (the invoking account only). `rundsvc` is unchanged: the principal is derived from `Headers`.
  `cmd/rund`: `--grants`, the boot checks of spec §6 (both directions), `--callers` required with `--grants`, and the startup line gaining `grants=<path|none>` and `grant_generation=<digest>`.
  The estate: a grants file written to its temp dir with `studio` holding `weather` and `batch` holding `support`, `WithoutGrants()` for the reduced posture, `WithGrant(...)` for a test that needs its own.
- [ ] **Step 4: `mise run ci`; commit; probes** — Commit: "authority: rund decides at Invoke and records it on the run; CanSee gates every read; --grants, the boot checks, the startup line". Probes: skip the `permit` call → the DENIED tests FAIL; make `canSee` return true → property 14 FAILS. Restore.

---

### Task 3: Inside a run — the recorded decision and the allowlist

**Files:**
- Modify: `rundbos/workflow.go`, `rundbos/rundbos.go`, `rundbos/rundbos_test.go`

**Interfaces:**
- Produces: the workflow's step check; `run.Run`'s decision in the DBOS attributes (`compartments`, `acts_for`, `grant`) so a `ListWorkflows` filter can find them later.

- [ ] **Step 1: Failing tests** (`rundbos/rundbos_test.go`):

```go
// Property 11 and review focus 3: a step is refused when the run's RECORDED
// compartments do not satisfy the called tool's requirement, even though the
// plan reached it -- and the tool was never called.
func TestAStepBeyondTheRunsCompartmentsIsDenied(t *testing.T) {
	tools := &fakeTools{reply: []byte("never")}
	s := open(t, memory(t), tools)           // the fixture catalogue's async tool requires "weather"
	r := run.Run{ID: "k-deny", Tool: asyncTool, Fingerprint: run.Fingerprint(asyncTool, nil),
		Caller: "ACX", Principal: run.Principal{Kind: run.KindAccount, ID: "ACX"},
		Compartments: []string{"support"},   // not weather
		Message:      "m0"}
	if _, err := s.Start(context.Background(), r); err != nil { t.Fatal(err) }
	st := awaitTerminal(t, s, "k-deny", 5*time.Second)
	if st.Status != run.StatusFailed || st.Error.GetKind() != invokev1.ErrorKind_ERROR_KIND_DENIED || tools.n() != 0 {
		t.Fatalf("%+v calls=%d", st, tools.n())
	}
	evs, _, _ := s.Events(context.Background(), "k-deny", 0, 0)
	if d := describeEvents(evs); d[len(d)-1] != "done:FAILED" {
		t.Fatalf("%v", d)
	}
}

// Property 12: the allowlist still binds -- a tool the compartments admit but
// an agent's allowlist does not is refused inside the run.
//   This slice has no decider, so the plan is driven directly: Plan returns one
//   action today, so the test calls the store with a Run whose Tool is an AGENT
//   in the fixture catalogue and asserts the refusal names the decider (today's
//   behaviour) -- and the allowlist intersection is proved at the unit level in
//   authority_test (Allow over an agent's allowlist), with a note that the
//   end-to-end case arrives with the first decider. Ledger this narrowing.
func TestTheAllowlistStillBindsInsideARun(t *testing.T)

// Property 13: a replay decides identically -- the grant is gone from the
// source, and the recovered run still completes from its recorded decision.
func TestAReplayDecidesFromTheRecordedDecision(t *testing.T) {
	// as TestAStoppedReplicasRunIsFinishedByItsSuccessorWithTheSameIdentity:
	// the successor's store is opened with an authority that would refuse, and
	// the run finishes anyway, because the workflow reads r.Compartments.
}
```

- [ ] **Step 2: Run** — RED.
- [ ] **Step 3: Implement** — in `invoke`, inside step 0's plan or just after it, check each action against the recorded compartments and the agent's allowlist, before any call; a refusal is `outcome{Error: wireOf(serve.Denied(...), r.ID)}`, which the existing `done FAILED` path already records. The check is a pure function in `authority` (`CheckStep(compartments []string, agent *toolv1.Agent, t declared.Tool) error`) so `rundbos` holds no policy.
- [ ] **Step 4: Run; `mise run ci`; commit; probe** — probe: have the step look the grant up through the authority instead of reading `r.Compartments` → property 13 FAILS. Restore. Commit.

---

### Task 4: `acts_for`

**Files:**
- Modify: `run/run.go`, `rundbos/rundbos.go`, `rundbos/workflow.go`, `internal/estate/authority_test.go`, `internal/estate/push_test.go`

- [ ] **Step 1: Failing tests** — property 16 (`acts_for` on the run's record, in `rund`'s log line, on the `garm.run.invoke` span as `garm.acts_for`, and no payload anywhere) and review focus 5 (`TestTheSubjectReadsTheRunButDoesNotReceiveItsLiveEvents`: the subject's principal gets `Fetch`, `Events` and `Follow`, and its `SubscribeEvents` channel stays empty because push's export is per owner).
- [ ] **Step 2: Run** — RED.
- [ ] **Step 3: Implement** — the grant's `ActsFor` onto `Run`, into the DBOS attributes, the log line and the span; `CanSee` already admits it from Task 1.
- [ ] **Step 4: Run; commit; probe** — probe: drop `ActsFor` from `CanSee` → review focus 5's read half FAILS. Restore.

---

### Task 5: `SIGHUP`

**Files:**
- Modify: `cmd/rund/main.go`, `cmd/rund/main_test.go`, `authority/authority.go` (a swappable source)

- [ ] **Step 1: Failing tests** — property 17 and review focus 4:
```go
// A grant added to the file takes effect on SIGHUP, without a restart.
func TestSIGHUPRereadsTheGrants(t *testing.T)
// Review focus 4: a reload that fails the checks keeps the RUNNING authority --
// never an empty source -- and says so.
func TestARefusedReloadKeepsTheRunningAuthority(t *testing.T)
```
Driven through `serveRund` in-process with a real signal (`syscall.Kill(syscall.Getpid(), syscall.SIGHUP)` is process-wide: instead the reload is a function `serveRund` wires to the signal and the test calls directly, with one small test that the signal is wired at all — ledger this split).
- [ ] **Step 2–4:** an `atomic.Pointer[Source]` behind `Authority`, `Reload(path)` validating before swapping, the log line with the old and new generation; the signal registered beside `SIGTERM`.

---

### Task 6: The estate, the quick start, `garmctl grants --check`, the docs

**Files:**
- Modify: `examples/proto/weather/v1/weather.proto` (+ regenerate), `internal/estate/estate.go`, `scripts/e2e.sh`, `cmd/garmctl/root.go`; Create: `cmd/garmctl/grants.go`, `cmd/garmctl/grants_test.go`
- Docs: `docs/concepts.md`, `docs/guide.md` §4, `docs/invariants.md`, `docs/roadmap.md`, `docs/specs/README.md`, `docs/specs/2026-10-08-authority-design.md` (status + amendments), `docs/operating-the-topology.md` (the grant file as a reviewed input), `docs/identity.html` (gaps 1 and 3 re-stated with what this slice did and did not close)

- [ ] **Step 1:** `weather.v1.schedule_report` requires `weather`; the example's other tools require nothing, so the quick start exercises both halves. Regenerate; `mise run examples`.
- [ ] **Step 2:** `garmctl grants --check --grants grants.yaml --callers callers.json [--catalogue …]`: the file's own checks, plus the catalogue cross-check when given, printing what each principal may invoke. A test for a good file and for each refusal.
- [ ] **Step 3:** the quick start writes `build/topo/grants.yaml` (forecast holds `weather`), passes `--grants` to `rund`, asserts the startup line names it, asserts the async call succeeds, and asserts a second call for a tool whose compartment the caller lacks is refused `DENIED` — the first end-to-end refusal the script has ever made. Run native and compose.
- [ ] **Step 4:** docs. `mise run guide-files`; `mise run ci`; commit.

---

## Self-review

**Spec coverage.** §1.1 requirement (T1) · §1.2 grant file (T1) · §2 principal (T1) · §3 decision and refusal order (T1, T2) · §4 where decided, recorded, reads (T2, T3) · §5 refusals (T1, T2) · §6 vocabulary and boot checks (T1, T2, T6) · §7 allowlist intersection (T3) · §8 acts_for (T4) · §9 config and SIGHUP (T2, T5) · §11 properties: 1 T2 · 2 T1,T2 · 3 T1,T2 · 4 T1 · 5 T1 · 6 T1 · 7 T1 · 8 T1 · 9 T2 · 10 T2 · 11 T3 · 12 T3 · 13 T3 · 14 T2 · 15 T4 · 16 T4 · 17 T5 · 18 T2 · 19 T1 · §12 order followed · §13 nothing built that it excludes.

**Spec amendments this plan anticipates** (Task 6): property 12's end-to-end
half is narrowed to a unit test until a decider exists (Task 3 ledgers it);
`SIGHUP` is tested as a wired function plus one signal test rather than by
signalling the test process.

**Placeholder scan.** Task 1 Step 5 names one fact to find out (`ERROR_KIND_DENIED`)
with the action for either outcome. Task 3 Step 1 states the narrowing in place.
No TBDs.

**Type consistency.** `run.Principal`/`Seen` (T1–T4) · `authority.Grant`/`Source`/
`Authority` (T1–T5) · `declared.Tool.Requires` (T1, T2, T3) · `run.Run`'s four new
fields (T2, T3, T4) · `authority.CheckStep` (T3).

**Review Focus.** 1 → T1 · 2 → T2 · 3 → T3 · 4 → T5 · 5 → T4.
