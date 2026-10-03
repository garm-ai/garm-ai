# The allowlist is enforced, not asserted

**Decision.** `declared/` resolves every allowlist entry against every declaration,
and `garmctl compose` exits non-zero on an entry that names nothing. Wired into
`mise run ci` from the step it was written.

**Why.** An allowlist entry is a **string**. Protobuf cannot tell you whether any
tool has that name: there is no import, no type reference, and no compile error if
it is wrong. buf confirmed this directly by rejecting the agent file's import of
the tools it names as *unused* — the relationship between an agent and the tools it
may call is one the proto system cannot express. So something else has to.

**Why `declared` is a package and not code inside the command.** A gateway needs the
same answer at run time that a linter needs at publish. The estate this replaces had
its worst structural bug here: a CEL dialect lived in the runner's `internal/celenv`
*and* in the CLI's compiler, the two copies resolved protobuf types by different
mechanisms, nothing tested that they agreed, and a guard could lint clean and then
fail at load.

**Why refusing a duplicate name is not a lint rule.** `From` cannot build an index
at all when two tools claim one name. A name resolving to one thing is the premise
allowlists, policy keys and ledger rows rest on, so an ambiguous index is not a Set
with a problem — it is not a Set. Putting it in the constructor means no separate
check can be forgotten or skipped.

**Why a rule nobody runs was not acceptable.** The estate this replaces accumulated
eight checks that were configured and never ran clean. Each read as a guarantee.

**Why the fixture splits the agent from the tools it names.** So a test can load a
**partial** tree and watch the allowlist fail to resolve. Not contrived: that estate
shipped a `--proto` flag which compiled one directory and then ran the full rule set
over it, so an agent naming an adopted tool was refused for naming a tool it could
not see — a valid tree reported broken, with no proto error to explain it.
