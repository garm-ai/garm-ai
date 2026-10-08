package authority_test

import (
	"context"
	"errors"
	"reflect"
	"strings"
	"testing"
	"time"

	"github.com/garm-ai/garm-ai/authority"
	"github.com/garm-ai/garm-ai/declared"
	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	"github.com/garm-ai/garm-ai/run"
	"github.com/garm-ai/garm-ai/serve"
)

var now = time.Date(2026, 10, 8, 12, 0, 0, 0, time.UTC)

func acct(id string) run.Principal { return run.Principal{Kind: run.KindAccount, ID: id} }

func grant(p string, tools, comps []string, exp time.Time) authority.Grant {
	return authority.Grant{ID: p + "#0", Principal: acct(p), Tools: tools, Compartments: comps, Expires: exp}
}

// fixed is a Source over a slice, so the decision is tested without a file.
type fixed []authority.Grant

func (f fixed) For(_ context.Context, p run.Principal, at time.Time) ([]authority.Grant, error) {
	var out []authority.Grant
	for _, g := range f {
		if g.Principal == p {
			out = append(out, g)
		}
	}
	return out, nil
}

func tool(name string, requires ...string) declared.Tool {
	return declared.Tool{Name: name, Requires: requires}
}

func authorityOver(src authority.Source) *authority.Authority {
	a := &authority.Authority{Now: func() time.Time { return now }}
	a.Set(src)
	return a
}

func denial(t *testing.T, err error) *serve.Error {
	t.Helper()
	var se *serve.Error
	if !errors.As(err, &se) {
		t.Fatalf("got %v, want a serve.Error", err)
	}
	if se.Kind != invokev1.ErrorKind_ERROR_KIND_DENIED {
		t.Fatalf("got kind %v, want DENIED: %v", se.Kind, err)
	}
	return se
}

// Property 2: a tool whose requirement the grant carries is permitted, and the
// decision says WHAT IT RELIED ON -- the grant, for the run's record and the audit.
func TestAGrantThatSatisfiesTheRequirementPermitsAndSaysWhatItReliedOn(t *testing.T) {
	a := authorityOver(fixed{grant("ACX", []string{"payments.v1.*"}, []string{"payments"}, time.Time{})})
	g, err := a.Allow(context.Background(), acct("ACX"), tool("payments.v1.get_balance", "payments"))
	if err != nil {
		t.Fatal(err)
	}
	if g.GrantID != "ACX#0" || !reflect.DeepEqual(g.Compartments, []string{"payments"}) {
		t.Fatalf("relied on %+v", g)
	}
}

// Property 3: the missing compartment is named, and nothing else is.
func TestAMissingCompartmentIsDeniedNamingIt(t *testing.T) {
	a := authorityOver(fixed{grant("ACX", []string{"*"}, []string{"weather"}, time.Time{})})
	_, err := a.Allow(context.Background(), acct("ACX"), tool("payments.v1.get_balance", "payments", "audited"))
	se := denial(t, err)
	for _, want := range []string{"payments.v1.get_balance", "payments", "audited"} {
		if !strings.Contains(se.Message, want) {
			t.Errorf("the refusal does not name %q: %q", want, se.Message)
		}
	}
	// It names nothing it must not: another principal, another grant, or how to
	// obtain one (spec §5).
	for _, leak := range []string{"ACY", "ask ", "#0"} {
		if strings.Contains(se.Message, leak) {
			t.Errorf("the refusal leaks %q: %q", leak, se.Message)
		}
	}
}

// Property 4: no grant at all is DENIED naming the principal, not the tool's
// requirements -- the caller's problem is that it holds nothing.
func TestNoGrantIsDeniedNamingThePrincipal(t *testing.T) {
	a := authorityOver(fixed{})
	se := denial(t, mustDeny(t, a, acct("ACX"), tool("payments.v1.get_balance", "payments")))
	if !strings.Contains(se.Message, "ACX") || !strings.Contains(se.Message, "no grant") {
		t.Fatalf("%q", se.Message)
	}
	if strings.Contains(se.Message, "payments") {
		t.Errorf("the refusal names the requirement of a tool the caller may not even know about: %q", se.Message)
	}
}

// Property 5: a grant that does not admit the tool is DENIED even when the
// compartments would satisfy it.
func TestAGrantThatDoesNotAdmitTheToolIsDenied(t *testing.T) {
	a := authorityOver(fixed{grant("ACX", []string{"weather.v1.*"}, []string{"payments"}, time.Time{})})
	se := denial(t, mustDeny(t, a, acct("ACX"), tool("payments.v1.get_balance", "payments")))
	if !strings.Contains(se.Message, "does not admit") || !strings.Contains(se.Message, "payments.v1.get_balance") {
		t.Fatalf("%q", se.Message)
	}
}

// Property 6: a prefix admits what it covers and nothing more.
func TestAPrefixGrantAdmitsItsPrefixOnly(t *testing.T) {
	g := grant("ACX", []string{"weather.v1.*"}, nil, time.Time{})
	for name, want := range map[string]bool{
		"weather.v1.get_forecast": true, "weather.v1.a.b": true,
		"weather2.v1.get_forecast": false, "weather.v2.get_forecast": false,
		"weather.v1": false, "weather.v1x.y": false,
	} {
		if g.Admits(name) != want {
			t.Errorf("Admits(%q) = %v, want %v", name, !want, want)
		}
	}
	if !grant("ACX", []string{"*"}, nil, time.Time{}).Admits("anything.v1.at_all") {
		t.Error(`"*" must admit every tool`)
	}
	if grant("ACX", nil, nil, time.Time{}).Admits("weather.v1.get_forecast") {
		t.Error("a grant with no tools admits none")
	}
}

// Property 7: an expired grant is no grant, and the refusal says EXPIRED rather
// than "no grant" -- the two are different problems for whoever reads it.
func TestAnExpiredGrantIsRefusedAsExpired(t *testing.T) {
	a := authorityOver(fixed{grant("ACX", []string{"*"}, []string{"payments"}, now.Add(-time.Hour))})
	se := denial(t, mustDeny(t, a, acct("ACX"), tool("payments.v1.get_balance", "payments")))
	if !strings.Contains(se.Message, "expired") || !strings.Contains(se.Message, "2026-10-08") {
		t.Fatalf("%q", se.Message)
	}
}

// Property 8: two half-grants do not combine -- one carrying the tool, another
// the compartment. A call permitted by two halves is a call nobody granted.
func TestTwoHalfGrantsDoNotCombine(t *testing.T) {
	a := authorityOver(fixed{
		grant("ACX", []string{"payments.v1.get_balance"}, []string{"weather"}, time.Time{}),
		grant("ACX", []string{"weather.v1.*"}, []string{"payments"}, time.Time{}),
	})
	denial(t, mustDeny(t, a, acct("ACX"), tool("payments.v1.get_balance", "payments")))
}

// A tool that requires nothing still needs a grant admitting it: "requires
// nothing" is a statement about the tool, not permission for everyone.
func TestARequirementlessToolStillNeedsAGrantAdmittingIt(t *testing.T) {
	a := authorityOver(fixed{grant("ACX", []string{"weather.v1.*"}, nil, time.Time{})})
	if _, err := a.Allow(context.Background(), acct("ACX"), tool("weather.v1.get_forecast")); err != nil {
		t.Fatalf("an admitted requirement-less tool: %v", err)
	}
	denial(t, mustDeny(t, a, acct("ACX"), tool("payments.v1.get_balance")))
}

// An unidentified caller holds nothing: the transport proved nobody, so there
// is nothing to look a grant up by.
func TestAnUnidentifiedCallerIsDenied(t *testing.T) {
	a := authorityOver(fixed{grant("", []string{"*"}, []string{"payments"}, time.Time{})})
	denial(t, mustDeny(t, a, run.Principal{}, tool("payments.v1.get_balance", "payments")))
}

// Property 14's half at the decision: CanSee admits the starting principal and
// the subject it acted for, and nobody else.
func TestCanSeeAdmitsTheStarterAndTheSubjectOnly(t *testing.T) {
	a := authorityOver(fixed{})
	person := run.Principal{Kind: run.KindPerson, ID: "p@example.com"}
	seen := run.Seen{Principal: acct("ACX"), ActsFor: &person}
	if !a.CanSee(context.Background(), acct("ACX"), seen) {
		t.Error("the starting principal cannot see its own run")
	}
	if !a.CanSee(context.Background(), person, seen) {
		t.Error("the subject cannot see the run made on its behalf")
	}
	if a.CanSee(context.Background(), acct("ACY"), seen) {
		t.Error("a third principal can see the run")
	}
	if a.CanSee(context.Background(), run.Principal{}, seen) {
		t.Error("an unidentified caller can see the run")
	}
	// A run with no owner is nobody's to see.
	if a.CanSee(context.Background(), acct("ACX"), run.Seen{}) {
		t.Error("a run with no principal is visible")
	}
}

// Property 11's policy half, which rundbos must not hold: a step is permitted
// when the run's RECORDED compartments satisfy the tool and the agent's
// allowlist cites it -- the intersection, never the union.
func TestCheckStepIsTheIntersectionOfTheAllowlistAndTheCompartments(t *testing.T) {
	target := tool("payments.v1.get_balance", "payments")
	allowed := []string{"payments.v1.get_balance", "weather.v1.get_forecast"}
	if err := authority.CheckStep([]string{"payments"}, allowed, target.Name, target.Requires); err != nil {
		t.Fatalf("both halves satisfied: %v", err)
	}
	se := denial(t, authority.CheckStep([]string{"weather"}, allowed, target.Name, target.Requires))
	if !strings.Contains(se.Message, "payments") {
		t.Errorf("%q", se.Message)
	}
	se = denial(t, authority.CheckStep([]string{"payments"}, []string{"weather.v1.get_forecast"}, target.Name, target.Requires))
	if !strings.Contains(se.Message, "allowlist") {
		t.Errorf("the allowlist refusal does not say so: %q", se.Message)
	}
	// No allowlist at all is not an agent: a plain tool's own step, permitted by
	// the compartments alone.
	if err := authority.CheckStep([]string{"payments"}, nil, target.Name, target.Requires); err != nil {
		t.Fatalf("a plain tool's step: %v", err)
	}
}

func mustDeny(t *testing.T, a *authority.Authority, p run.Principal, tl declared.Tool) error {
	t.Helper()
	g, err := a.Allow(context.Background(), p, tl)
	if err == nil {
		t.Fatalf("permitted, relying on %+v", g)
	}
	return err
}

// A requirement is ALL of its compartments, not any of them: a grant holding
// one of two is refused, and only the missing one is named. Found by a probe:
// "any" semantics passed every other test in this file.
func TestARequirementIsEveryCompartmentNotAnyOfThem(t *testing.T) {
	a := authorityOver(fixed{grant("ACX", []string{"*"}, []string{"payments"}, time.Time{})})
	se := denial(t, mustDeny(t, a, acct("ACX"), tool("payments.v1.transfer", "payments", "dual-control")))
	if !strings.Contains(se.Message, "dual-control") {
		t.Fatalf("the refusal does not name the one missing compartment: %q", se.Message)
	}
	if strings.Contains(se.Message, "requires payments,") || strings.Contains(se.Message, "requires payments ") {
		t.Errorf("the refusal names a compartment the grant DOES hold as missing: %q", se.Message)
	}
	// And the same at the step check, which is the half a run uses.
	se = denial(t, authority.CheckStep([]string{"payments"}, nil, "payments.v1.transfer", []string{"payments", "dual-control"}))
	if !strings.Contains(se.Message, "dual-control") {
		t.Fatalf("%q", se.Message)
	}
}

// Property 17's core: a reload swaps the source atomically, and a refused one
// LEAVES THE RUNNING AUTHORITY STANDING -- never an empty source, which would
// deny every call, and never a widened one.
func TestAReloadThatFailsKeepsTheRunningSource(t *testing.T) {
	a := authorityOver(fixed{grant("ACX", []string{"*"}, []string{"payments"}, time.Time{})})
	permitted := func() bool {
		_, err := a.Allow(context.Background(), acct("ACX"), tool("payments.v1.get_balance", "payments"))
		return err == nil
	}
	if !permitted() {
		t.Fatal("the starting source does not permit")
	}
	// A refused reload: Set never installs nil.
	a.Set(nil)
	if a.Loaded() == nil || !permitted() {
		t.Fatal("a nil source was installed, denying every call")
	}
	// A successful one takes effect at once.
	a.Set(fixed{grant("ACX", []string{"*"}, []string{"weather"}, time.Time{})})
	if permitted() {
		t.Fatal("the replaced source still permits what only the old one did")
	}
}
