// Package authority decides who may invoke what, and who may see which run.
//
// It is the one place that reasons about grants and compartments: rund's engine
// calls Allow and CanSee and contains no policy, and the run store calls
// CheckStep and contains none either. It imports no transport and no durable
// framework -- a decision is a pure function of a principal, a tool and the
// grants a source holds (authority spec §3).
package authority

import (
	"context"
	"errors"
	"slices"
	"strings"
	"sync/atomic"
	"time"

	"github.com/garm-ai/garm-ai/declared"
	"github.com/garm-ai/garm-ai/run"
	"github.com/garm-ai/garm-ai/serve"
)

// Grant is what a principal holds: which tools it may invoke, which
// compartments it carries, until when, and -- for an agent assigned to a person
// -- whose authority it is exercising.
//
// Held by the ACTING principal rather than by the person, so a call's decision
// is one lookup on the principal the transport proved; the subject is what the
// audit answers with, and what lets a person read the runs their agent made
// (spec §8).
type Grant struct {
	// ID says which grant a decision relied on, for the run's record and the
	// audit. The file's is "<name>#<index>"; the store's will be its row id.
	ID           string
	Principal    run.Principal
	ActsFor      *run.Principal
	Tools        []string // exact names, or one trailing ".*", or exactly "*"
	Compartments []string
	Expires      time.Time // zero = no expiry
}

// Admits reports whether this grant's tool list covers the tool.
//
// A pattern is an exact name, a prefix with one trailing ".*", or exactly "*".
// Nothing else is accepted when a grant is loaded, so this never has to decide
// what a half-pattern meant.
func (g Grant) Admits(tool string) bool {
	for _, p := range g.Tools {
		switch {
		case p == "*":
			return true
		case strings.HasSuffix(p, ".*"):
			if strings.HasPrefix(tool, strings.TrimSuffix(p, "*")) {
				return true
			}
		case p == tool:
			return true
		}
	}
	return false
}

// Satisfies returns the compartments the tool requires and this grant lacks.
// ALL of them are required, not any: a requirement is a list of things that
// must be true together.
func (g Grant) Satisfies(requires []string) (missing []string) {
	for _, need := range requires {
		if !slices.Contains(g.Compartments, need) {
			missing = append(missing, need)
		}
	}
	return missing
}

// Live reports whether the grant has not expired at t.
func (g Grant) Live(t time.Time) bool { return g.Expires.IsZero() || g.Expires.After(t) }

// Source is where grants come from. One implementation in this build -- the
// deployment's reviewed file -- and the grant store is the next, against this
// unchanged interface (spec §13).
type Source interface {
	// For returns every grant held by this principal, live at now.
	For(ctx context.Context, p run.Principal, now time.Time) ([]Grant, error)
}

// Authority decides. rund holds one; nothing else does.
//
// The source is swappable while running (Set, used by a SIGHUP reload) because
// a grant change that needed a restart of the component every call goes through
// is a change a deployment would avoid making.
type Authority struct {
	source atomic.Pointer[Source]
	// Now is the clock a decision reads; nil means time.Now.
	Now func() time.Time
}

// Set installs a source, atomically. A nil source is never installed: a reload
// that failed must leave the running authority standing, not empty it.
func (a *Authority) Set(s Source) {
	if s == nil {
		return
	}
	a.source.Store(&s)
}

// Source is what is currently installed, or nil.
func (a *Authority) Loaded() Source {
	if p := a.source.Load(); p != nil {
		return *p
	}
	return nil
}

func (a *Authority) now() time.Time {
	if a.Now != nil {
		return a.Now()
	}
	return time.Now()
}

// Allow says whether this principal may invoke this tool, and WHAT IT RELIED
// ON -- the grant's id, its compartments and its subject -- which the caller
// records on a run so the audit says what was decided and a replay never
// re-decides (spec §4). It returns run.Allowed rather than the Grant: a
// decision is not a disclosure of everything the principal holds.
//
// Deny by default. The checks run in the order in which a refusal can be most
// useful: no grant at all, then an expired one, then one that does not admit
// the tool, then a missing compartment. Compartments are never unioned across
// grants: a call permitted by two half-grants is a call nobody granted.
func (a *Authority) Allow(ctx context.Context, p run.Principal, t declared.Tool) (run.Allowed, error) {
	if p.Zero() {
		return run.Allowed{}, noGrant(p)
	}
	src := a.Loaded()
	if src == nil {
		return run.Allowed{}, errors.New("authority: no grant source")
	}
	now := a.now()
	grants, err := src.For(ctx, p, now)
	if err != nil {
		return run.Allowed{}, err
	}
	if len(grants) == 0 {
		return run.Allowed{}, noGrant(p)
	}
	var (
		live        []Grant
		lastExpiry  time.Time
		anyAdmitted bool
		held        []string
		missing     []string
		forTool     string
	)
	for _, g := range grants {
		if !g.Live(now) {
			if g.Expires.After(lastExpiry) {
				lastExpiry = g.Expires
			}
			continue
		}
		live = append(live, g)
	}
	if len(live) == 0 {
		return run.Allowed{}, expired(p, lastExpiry)
	}
	for _, g := range live {
		if !g.Admits(t.Name) {
			continue
		}
		anyAdmitted = true
		if m := g.Satisfies(t.Requires); len(m) == 0 {
			// What the permission relied on -- never the grant itself, so a
			// caller cannot read a principal's whole authority off one decision.
			return run.Allowed{GrantID: g.ID, Compartments: g.Compartments, ActsFor: g.ActsFor}, nil
		} else if missing == nil {
			// The first admitting grant's shortfall is the one reported: it is
			// the closest the caller came.
			missing, held, forTool = m, g.Compartments, t.Name
		}
	}
	if !anyAdmitted {
		return run.Allowed{}, notAdmitted(p, t.Name)
	}
	return run.Allowed{}, missingCompartments(p, forTool, missing, held)
}

// CanSee says whether this principal may read a run: the principal that started
// it, or the principal it was started on behalf of (spec §8). It replaces the
// run engine's own visibility function, whose callers -- Fetch, Events, Follow
// -- do not change.
func (a *Authority) CanSee(_ context.Context, p run.Principal, r run.Seen) bool {
	if p.Zero() || r.Principal.Zero() {
		return false
	}
	if p == r.Principal {
		return true
	}
	return r.ActsFor != nil && p == *r.ActsFor
}

// CheckStep is the decision a run makes before each tool call: the agent's
// allowlist and the run's RECORDED compartments must both admit it -- the
// intersection, never the union. An allowlist cannot widen a grant, and a grant
// cannot widen an allowlist (spec §7).
//
// compartments are the run's recorded ones, so a replay decides identically; a
// nil allowlist is a plain tool's own step rather than an agent's, and only the
// compartments apply.
func CheckStep(compartments, allowlist []string, t declared.Tool) error {
	if allowlist != nil && !slices.Contains(allowlist, t.Name) {
		return serve.Denied("%s is not in this run's allowlist", t.Name)
	}
	g := Grant{Compartments: compartments}
	if m := g.Satisfies(t.Requires); len(m) > 0 {
		return serve.Denied("%s requires %s, which this run does not carry", t.Name, strings.Join(m, ", "))
	}
	return nil
}

// The refusals, in the order the checks run, because that is the order in which
// a message can be most useful. Each names the failing half AND NOTHING ELSE:
// never another principal, never another grant, never how to obtain one. "You
// lack payments" is actionable; "ask Alice, who has it" is a leak dressed as
// help (spec §5).

func noGrant(p run.Principal) error {
	return serve.Denied("%s holds no grant", p)
}

func expired(p run.Principal, at time.Time) error {
	return serve.Denied("%s's grant expired on %s", p, at.UTC().Format(time.DateOnly))
}

func notAdmitted(p run.Principal, tool string) error {
	return serve.Denied("%s's grant does not admit %s", p, tool)
}

func missingCompartments(p run.Principal, tool string, missing, held []string) error {
	what := "nothing"
	if len(held) > 0 {
		what = strings.Join(held, ", ")
	}
	return serve.Denied("%s requires %s; %s holds %s", tool, strings.Join(missing, ", "), p, what)
}
