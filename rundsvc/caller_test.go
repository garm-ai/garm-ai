package rundsvc_test

import (
	"context"
	"strings"
	"testing"

	"github.com/nats-io/jwt/v2"
	"google.golang.org/protobuf/proto"

	"github.com/garm-ai/garm-ai/call"
	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/natscall"
	"github.com/garm-ai/garm-ai/rundsvc"
	"github.com/garm-ai/garm-ai/topology"
)

// Property 3: the caller's account key is token 4 of the subject, and only a real
// account key counts -- a subject with something else there is not a caller.
func TestTheCallerIsTokenFourAndMustBeAnAccountKey(t *testing.T) {
	const acc = "ACD2WO5GOEDHJNWS72L2O5XUKC5ZOBUVMNQUP3XVFDKCEGRGPQ5QQBEW"
	got, ok := rundsvc.CallerFromSubject("garm.run.v1." + acc + ".invoke")
	if !ok || got != acc {
		t.Fatalf("got %q %v", got, ok)
	}
	for _, bad := range []string{
		"garm.run.v1.invoke",         // the flat subject: nothing at token 4
		"garm.run.v1.x.y.invoke",     // too many tokens
		"garm.run.v1.notakey.invoke", // token 4 is not an account key
		"garm.run.v1.UDBPPFYK5GLWHM4BOIPR3YJLYUYPUJ4GXE5EASQ52SYGZLRGS56VIPX6.invoke", // a USER key, not an account
	} {
		if c, ok := rundsvc.CallerFromSubject(bad); ok {
			t.Errorf("%s was accepted as carrying caller %q", bad, c)
		}
	}
}

// Property 5: a caller publishing TODAY's subject still reaches rund -- through
// the estate, which is the real import mapping. natscall is unchanged.
func TestACallerPublishingTodaysSubjectReachesRund(t *testing.T) {
	e := estate.New(t)
	nc := e.Connect(t, estate.RoleCaller)
	body, _ := proto.Marshal(&weatherv1.GetForecastRequest{Place: "Ghent"})
	if _, err := (natscall.Client{NC: nc}).Invoke(context.Background(), "weather.v1.get_forecast", body, call.Options{}); err != nil {
		t.Fatalf("garm.run.v1.invoke no longer reaches rund: %v", err)
	}
}

// Property 4: two callers are DISTINGUISHABLE at rund -- each call is logged with
// its own caller's account key, the key the server placed in the subject, which
// neither caller wrote. Two, because one caller proves only that a key was logged.
func TestTwoCallersAreDistinguishableAtRund(t *testing.T) {
	e := estate.New(t)
	body, _ := proto.Marshal(&weatherv1.GetForecastRequest{Place: "Ghent"})
	accountOf := func(r estate.Role) string {
		ac, err := jwt.DecodeAccountClaims(e.Topology().Accounts[topology.CallerPrefix+string(r)])
		if err != nil {
			t.Fatal(err)
		}
		return ac.Subject
	}
	studio, batch := accountOf(estate.RoleCaller), accountOf(estate.RoleCaller2)
	if studio == batch {
		t.Fatal("the two callers share an account; nothing could tell them apart")
	}

	for _, r := range []estate.Role{estate.RoleCaller, estate.RoleCaller2} {
		nc := e.Connect(t, r)
		if _, err := (natscall.Client{NC: nc}).Invoke(context.Background(), "weather.v1.get_forecast", body, call.Options{}); err != nil {
			t.Fatalf("%s: %v", r, err)
		}
	}
	log := e.RundLog()
	for _, acc := range []string{studio, batch} {
		if !strings.Contains(log, "caller="+acc) {
			t.Fatalf("rund did not log the calling account %s; log:\n%s", acc, log)
		}
	}
}
