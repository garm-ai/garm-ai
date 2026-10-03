package estate_test

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/nats-io/nats.go"
	"google.golang.org/protobuf/proto"

	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/natscall"
)

// Property 1: a caller cannot reach a tool.
//
// Two walls stand between a caller and garm.tool.>, and this test meets the FIRST:
// the caller's own credential may publish only garm.run.v1.>, so the server
// refuses the publish outright -- a Permissions Violation, reported asynchronously,
// while the request itself just waits. The spike's caller was unrestricted and so
// met the second wall instead, account isolation, as "no responders"; that wall is
// still there (topology.TestTOOLSExportsPrivatelyAndOnlyGARMImportsIt) and is what
// would hold if a caller's permission were ever widened.
//
// A timeout alone is not evidence -- a slow tool times out too. The violation is.
//
// Meaningful ONLY beside property 2 below: this passes trivially while nothing can
// reach the tool, and in the spike it did exactly that until the tool's reply
// permission was fixed.
func TestACallerCannotReachAToolSubject(t *testing.T) {
	e := estate.New(t)
	studio := e.Connect(t, estate.RoleCaller)
	violations := make(chan error, 2)
	studio.SetErrorHandler(func(_ *nats.Conn, _ *nats.Subscription, err error) { violations <- err })

	body, _ := proto.Marshal(&weatherv1.GetForecastRequest{Place: "Ghent"})
	if _, err := studio.Request("garm.tool.weather.v1.get_forecast", body, 500*time.Millisecond); err == nil {
		t.Fatal("a caller reached a tool directly")
	}
	select {
	case err := <-violations:
		if !strings.Contains(err.Error(), "Permissions Violation for Publish") {
			t.Fatalf("refused with %v; want the server's publish violation", err)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("the request failed but the server reported no violation -- a timeout is not a refusal")
	}
}

// Property 2: rund reaches the tool it imports. WITHOUT THIS, property 1 proves
// only that nothing works.
func TestRundReachesTheToolItImports(t *testing.T) {
	e := estate.New(t)
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(t, estate.RoleCaller)})
	out, err := client.GetForecast(context.Background(), &weatherv1.GetForecastRequest{Place: "Ghent", Days: 2})
	if err != nil {
		t.Fatalf("the whole chain, under operator mode: %v", err)
	}
	if !strings.Contains(out.GetSummary(), "Ghent") {
		t.Errorf("summary %q", out.GetSummary())
	}
}

// Property 6: a tool service cannot subscribe to a tool it does not declare.
func TestAToolServiceCannotAnswerAnUndeclaredTool(t *testing.T) {
	e := estate.New(t)
	tool := e.Connect(t, estate.RoleTool)
	errc := make(chan error, 1)
	tool.SetErrorHandler(func(_ *nats.Conn, _ *nats.Subscription, err error) { errc <- err })
	if _, err := tool.SubscribeSync("garm.tool.payments.v1.transfer"); err != nil {
		return // refused synchronously: also a refusal
	}
	_ = tool.Flush()
	select {
	case err := <-errc:
		if !strings.Contains(err.Error(), "Permissions Violation") {
			t.Fatalf("got %v", err)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("a tool subscribed to a subject it does not declare, with no error")
	}
}

// Property 7 -- a tool CAN send its cross-account reply, because _R_.> is in its
// publish allow -- has no test of its own here, on purpose. The estate's tool
// answers on a connection a test cannot attach an error handler to, so a test
// written that way watched a connection that did nothing and could never fail.
// The property is held by three things together: property 2 above passing,
// topology.TestAToolServiceMayPublishTheCrossAccountReply asserting the permission,
// and the probe recorded in the ledger -- remove _R_.> and property 2 fails as a
// TIMEOUT, which is the exact failure the permission exists to prevent.
