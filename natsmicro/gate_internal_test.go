package natsmicro

import (
	"strings"
	"testing"

	"github.com/nats-io/jwt/v2"
)

// Deferred from review: the gate read the allow list and ignored Sub.Deny, so a
// credential that explicitly denied a subject would have let a mount on it start
// -- and the server would have refused the subscription asynchronously, which is
// the silent failure the gate exists to prevent. check is the pure core of the
// gate, so a deny can be tested without a credential that carries one.
func TestCheckRefusesAMountOnADeniedSubject(t *testing.T) {
	perms := jwt.Permissions{
		Sub: jwt.Permission{
			Allow: []string{"garm.tool.>"},
			Deny:  []string{"garm.tool.payments.>"},
		},
	}
	if err := check(perms, []string{"garm.tool.weather.v1.get_forecast"}); err != nil {
		t.Fatalf("an allowed, undenied subject was refused: %v", err)
	}
	err := check(perms, []string{"garm.tool.payments.v1.transfer"})
	if err == nil {
		t.Fatal("a denied subject was accepted; the server would refuse it after Start returned")
	}
	if !strings.Contains(err.Error(), "garm.tool.payments.v1.transfer") || !strings.Contains(err.Error(), "den") {
		t.Errorf("the refusal does not say which subject is denied: %v", err)
	}
}

func TestCheckMatchesNATSWildcards(t *testing.T) {
	allow := jwt.Permissions{Sub: jwt.Permission{Allow: []string{"a.*.c", "x.>"}}}
	for subject, ok := range map[string]bool{
		"a.b.c":   true,
		"a.b.c.d": false, // * is one token
		"a.c":     false,
		"x.y":     true,
		"x.y.z":   true, // > is one or more
		"x":       false,
		"q.r":     false,
	} {
		err := check(allow, []string{subject})
		if (err == nil) != ok {
			t.Errorf("%s: covered=%v, want %v", subject, err == nil, ok)
		}
	}
}

// An unrestricted credential -- no allow list -- is not gated: nothing to check
// against. A test estate running an OPEN server relies on this.
func TestCheckPassesAnUnrestrictedCredential(t *testing.T) {
	if err := check(jwt.Permissions{}, []string{"anything.at.all"}); err != nil {
		t.Fatalf("an unrestricted credential was gated: %v", err)
	}
}
