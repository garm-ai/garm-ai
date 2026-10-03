package natsserve_test

import (
	"context"
	"errors"
	"io"
	"log/slog"
	"strings"
	"sync"
	"testing"
	"time"

	natsserver "github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/micro"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protoreflect"

	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	"github.com/garm-ai/garm-ai/examples/weatherd"
	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	"github.com/garm-ai/garm-ai/natsserve"
	"github.com/garm-ai/garm-ai/serve"
)

// ---------------------------------------------------------------------------
// A real nats-server, in process. Not a mock: a fake Registrar already exists
// from the generator step and proves nothing about a transport -- it cannot have
// an opinion about wildcards, max_payload, or a drain.
// ---------------------------------------------------------------------------

func serverURL(t *testing.T, maxPayload int32) string {
	t.Helper()
	opts := &natsserver.Options{Host: "127.0.0.1", Port: -1, NoLog: true, NoSigs: true}
	if maxPayload > 0 {
		opts.MaxPayload = maxPayload
	}
	srv, err := natsserver.NewServer(opts)
	if err != nil {
		t.Fatalf("starting nats-server: %v", err)
	}
	go srv.Start()
	t.Cleanup(srv.Shutdown)
	if !srv.ReadyForConnections(5 * time.Second) {
		t.Fatal("nats-server did not become ready")
	}
	return srv.ClientURL()
}

func connect(t *testing.T, url string) *nats.Conn {
	t.Helper()
	nc, err := nats.Connect(url)
	if err != nil {
		t.Fatalf("connecting: %v", err)
	}
	t.Cleanup(nc.Close)
	return nc
}

// conn is one connection for tests where the caller and the service may share one.
// The drain test deliberately does not use it: closing a shared connection kills the
// CALLER's own wait for its reply, which looks exactly like a dropped answer and is
// not what shutting a service down does.
func conn(t *testing.T, maxPayload int32) *nats.Conn {
	t.Helper()
	return connect(t, serverURL(t, maxPayload))
}

// quiet keeps the cause chain out of the test log while still exercising the path
// that writes it -- a nil logger would take a different branch.
func quiet() *slog.Logger {
	return slog.New(slog.NewTextHandler(io.Discard, nil))
}

// run mounts s and returns once every endpoint is answering. The returned function
// cancels and waits for Serve to return, so a test can assert on the drain.
//
// Start is called SYNCHRONOUSLY, which is the whole reason it exists apart from
// Serve. An earlier version started Run in a goroutine and flushed the connection
// here, which synchronises with nothing: the flush could complete before Run had
// mounted anything, and a request then got "no responders available". It passed
// locally and failed under load.
func run(t *testing.T, s *natsserve.Service, nc *nats.Conn) (stop func() error) {
	t.Helper()
	if err := s.Start(nc); err != nil {
		t.Fatalf("Start: %v", err)
	}
	ctx, cancel := context.WithCancel(context.Background())
	errc := make(chan error, 1)
	go func() { errc <- s.Serve(ctx) }()
	stopped := false
	t.Cleanup(func() {
		if !stopped {
			cancel()
			<-errc
		}
	})
	return func() error {
		stopped = true
		cancel()
		return <-errc
	}
}

// service builds a Service with one ad-hoc endpoint, for the error paths. The
// end-to-end claim is made separately, through generated code.
func service(t *testing.T, tool string, handle func(context.Context, proto.Message) (proto.Message, error)) *natsserve.Service {
	t.Helper()
	s, err := natsserve.New(natsserve.Config{Name: "probed", Version: "0.1.0", Logger: quiet()})
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	err = s.Endpoint(tool,
		protoreflect.FullName("weather.v1.WeatherService.GetForecast"),
		func() proto.Message { return new(weatherv1.GetForecastRequest) },
		handle)
	if err != nil {
		t.Fatalf("Endpoint: %v", err)
	}
	return s
}

func call(t *testing.T, nc *nats.Conn, subject string, in proto.Message) *nats.Msg {
	t.Helper()
	body, err := proto.Marshal(in)
	if err != nil {
		t.Fatalf("marshalling the request: %v", err)
	}
	msg, err := nc.Request(subject, body, 3*time.Second)
	if err != nil {
		t.Fatalf("calling %s: %v", subject, err)
	}
	return msg
}

// wireError reads what a caller actually gets: the micro headers a generic client
// sees, and the typed body a garm client unmarshals.
func wireError(t *testing.T, msg *nats.Msg) (code, description string, typed *invokev1.Error) {
	t.Helper()
	code = msg.Header.Get(micro.ErrorCodeHeader)
	description = msg.Header.Get(micro.ErrorHeader)
	if code == "" {
		t.Fatalf("the reply carries no error code; it is not an error reply. data=%q", msg.Data)
	}
	typed = new(invokev1.Error)
	if err := proto.Unmarshal(msg.Data, typed); err != nil {
		t.Fatalf("the error body does not unmarshal as invokev1.Error: %v", err)
	}
	return code, description, typed
}

// ---------------------------------------------------------------------------

// TestADeclaredToolIsReachable is step 8's whole property, and it goes through
// GENERATED code and the real example handler -- not an ad-hoc closure. If the
// generator and the transport disagreed about anything, this is where it shows.
func TestADeclaredToolIsReachable(t *testing.T) {
	nc := conn(t, 0)
	s, err := natsserve.New(natsserve.Config{Name: "weatherd", Version: "0.1.0", Logger: quiet()})
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	if err := weatherv1.ServeWeatherService(s, weatherd.Service{}); err != nil {
		t.Fatalf("ServeWeatherService: %v", err)
	}
	run(t, s, nc)

	msg := call(t, nc, "garm.tool.weather.v1.get_forecast",
		&weatherv1.GetForecastRequest{Place: "Ghent", Days: 3})

	if code := msg.Header.Get(micro.ErrorCodeHeader); code != "" {
		t.Fatalf("the call failed with %s: %s", code, msg.Header.Get(micro.ErrorHeader))
	}
	var out weatherv1.GetForecastResponse
	if err := proto.Unmarshal(msg.Data, &out); err != nil {
		t.Fatalf("unmarshalling the response: %v", err)
	}
	if !strings.Contains(out.GetSummary(), "Ghent") || out.GetHighCelsius() == 0 {
		t.Fatalf("the response did not come from the example handler: %v", &out)
	}
}

// TestTheSubjectIsDerivedFromTheIdentityNotTheAddress is the decision this step
// exists to test. The declared name is weather.v1.get_forecast; the method lives at
// weather.v1.WeatherService.GetForecast. The estate this replaces routed on the
// second one.
func TestTheSubjectIsDerivedFromTheIdentityNotTheAddress(t *testing.T) {
	if got, want := natsserve.Subject("weather.v1.get_forecast"), "garm.tool.weather.v1.get_forecast"; got != want {
		t.Errorf("Subject = %q, want %q", got, want)
	}

	nc := conn(t, 0)
	s := service(t, "weather.v1.get_forecast", func(context.Context, proto.Message) (proto.Message, error) {
		return &weatherv1.GetForecastResponse{Summary: "answered", HighCelsius: 1}, nil
	})
	run(t, s, nc)

	// Nothing answers on the address.
	if _, err := nc.Request("garm.tool.weather.v1.WeatherService.GetForecast", nil, 300*time.Millisecond); !errors.Is(err, nats.ErrNoResponders) {
		t.Errorf("something answered on the address subject: err = %v", err)
	}
	// The identity does.
	call(t, nc, "garm.tool.weather.v1.get_forecast", &weatherv1.GetForecastRequest{Place: "x"})
}

func TestADeliberateKindReachesTheCallerAsItsOwnCode(t *testing.T) {
	for _, tc := range []struct {
		err      error
		code     string
		kind     invokev1.ErrorKind
		inReason string
	}{
		{serve.Invalid("place is required"), "INVALID", invokev1.ErrorKind_ERROR_KIND_INVALID, "place is required"},
		{serve.NotFound("no such place %q", "Atlantis"), "NOT_FOUND", invokev1.ErrorKind_ERROR_KIND_NOT_FOUND, "Atlantis"},
		{serve.Denied("this region is embargoed"), "DENIED", invokev1.ErrorKind_ERROR_KIND_DENIED, "embargoed"},
		{serve.Unavailable("upstream is draining"), "UNAVAILABLE", invokev1.ErrorKind_ERROR_KIND_UNAVAILABLE, "draining"},
	} {
		nc := conn(t, 0)
		s := service(t, "probe.tool", func(context.Context, proto.Message) (proto.Message, error) {
			return nil, tc.err
		})
		run(t, s, nc)

		msg := call(t, nc, "garm.tool.probe.tool", &weatherv1.GetForecastRequest{})
		code, description, typed := wireError(t, msg)

		if code != tc.code {
			t.Errorf("%v: code is %q, want %q", tc.kind, code, tc.code)
		}
		if typed.GetKind() != tc.kind {
			t.Errorf("%v: typed kind is %v", tc.kind, typed.GetKind())
		}
		if !strings.Contains(description, tc.inReason) {
			t.Errorf("%v: description %q does not contain %q", tc.kind, description, tc.inReason)
		}
		// The id reaches a header-only client too, which is what the fixed INTERNAL
		// message tells a caller to quote.
		if typed.GetId() == "" || !strings.Contains(description, typed.GetId()) {
			t.Errorf("%v: the id %q is not in the description %q", tc.kind, typed.GetId(), description)
		}
	}
}

// TestABareErrorNeverReachesTheCallerOverTheWire is the leak test, end to end.
// serve.Wire has its own; this proves nothing on the transport path puts it back.
func TestABareErrorNeverReachesTheCallerOverTheWire(t *testing.T) {
	const secret = "dial tcp 10.0.0.4:5432: password=hunter2"
	nc := conn(t, 0)
	s := service(t, "probe.tool", func(context.Context, proto.Message) (proto.Message, error) {
		return nil, errors.New(secret)
	})
	run(t, s, nc)

	msg := call(t, nc, "garm.tool.probe.tool", &weatherv1.GetForecastRequest{})
	code, description, typed := wireError(t, msg)

	if code != "INTERNAL" {
		t.Errorf("code is %q, want INTERNAL", code)
	}
	// Every surface a caller can read.
	for what, text := range map[string]string{"description": description, "typed message": typed.GetMessage()} {
		if strings.Contains(text, secret) || strings.Contains(text, "hunter2") {
			t.Errorf("the %s carries the cause: %q", what, text)
		}
	}
	if typed.GetId() == "" {
		t.Error("no id, so nothing joins the caller's report to the log that has the cause")
	}
}

// TestAnOversizedResponseBecomesAnErrorRatherThanSilence.
//
// The failure mode this prevents is not a wrong answer, it is NO answer: Respond
// fails, and a handler that returned at that point leaves the caller waiting for
// its own deadline. The error reply is small enough to fit where the response did
// not.
func TestAnOversizedResponseBecomesAnErrorRatherThanSilence(t *testing.T) {
	const maxPayload = 2048
	nc := conn(t, maxPayload)
	s := service(t, "probe.tool", func(context.Context, proto.Message) (proto.Message, error) {
		return &weatherv1.GetForecastResponse{Summary: strings.Repeat("x", maxPayload*4)}, nil
	})
	run(t, s, nc)

	msg := call(t, nc, "garm.tool.probe.tool", &weatherv1.GetForecastRequest{})
	code, _, typed := wireError(t, msg)
	if code != "INTERNAL" {
		t.Errorf("code is %q, want INTERNAL", code)
	}
	if typed.GetId() == "" {
		t.Error("no id on the error that explains an oversized response")
	}
}

func TestUnreadableRequestBytesBecomeInvalid(t *testing.T) {
	nc := conn(t, 0)
	reached := false
	s := service(t, "probe.tool", func(context.Context, proto.Message) (proto.Message, error) {
		reached = true
		return &weatherv1.GetForecastResponse{Summary: "x", HighCelsius: 1}, nil
	})
	run(t, s, nc)

	// Bytes that are not a GetForecastRequest. Field 1 declared as a length-delimited
	// string with a length running past the end of the buffer.
	msg, err := nc.Request("garm.tool.probe.tool", []byte{0x0a, 0x7f, 0x01}, 3*time.Second)
	if err != nil {
		t.Fatalf("calling: %v", err)
	}
	code, _, _ := wireError(t, msg)
	if code != "INVALID" {
		t.Errorf("code is %q, want INVALID", code)
	}
	if reached {
		t.Error("the handler was called with a request that did not unmarshal")
	}
}

// TestRunDrainsCallsThatAreQueuedButNotYetDispatched.
//
// Two calls, because ONE PROVES NOTHING. A subscription's messages are dispatched
// serially, so while the first handler runs the second call sits in the client's
// pending queue, not yet handed to any handler. That queued call is the case the
// Barrier exists for, and an earlier version of this test -- one slow call,
// cancelled while it ran -- passed with the Barrier deleted, because the in-flight
// counter already covered a handler that had started.
//
// Stop() DRAINS rather than unsubscribes, so the queued call is still delivered.
// But Drain returns immediately, so waiting only on the in-flight counter sees it
// reach zero when the first handler finishes and lets Run return while the second
// has not begun. A process then does what any main does -- closes its connection --
// and the second caller waits for its own deadline instead of getting an answer.
//
// Barrier fires only once every pending callback has been dispatched, which is
// exactly the guarantee missing above.
func TestRunDrainsCallsThatAreQueuedButNotYetDispatched(t *testing.T) {
	// TWO connections, as two processes. The service's connection is the one that
	// closes at shutdown; the caller keeps its own, so a missing answer means the
	// answer was really missing.
	url := serverURL(t, 0)
	nc := connect(t, url)
	caller := connect(t, url)

	const work = 300 * time.Millisecond
	var (
		mu        sync.Mutex
		completed int
		entered   = make(chan struct{}, 2)
	)
	s := service(t, "probe.tool", func(context.Context, proto.Message) (proto.Message, error) {
		entered <- struct{}{}
		time.Sleep(work)
		mu.Lock()
		completed++
		mu.Unlock()
		return &weatherv1.GetForecastResponse{Summary: "slow", HighCelsius: 1}, nil
	})
	stop := run(t, s, nc)

	const calls = 2
	replies := make(chan error, calls)
	for i := 0; i < calls; i++ {
		go func() {
			body, _ := proto.Marshal(&weatherv1.GetForecastRequest{Place: "x"})
			_, err := caller.Request("garm.tool.probe.tool", body, 5*time.Second)
			replies <- err
		}()
	}

	// The first handler is running; the second call is now queued behind it.
	<-entered
	if err := stop(); err != nil {
		t.Fatalf("Run returned %v", err)
	}

	// What a main does next: the SERVICE's connection closes. Without the drain
	// guarantee the second handler is still to come, and it loses its connection
	// here before it can answer.
	if err := nc.Flush(); err != nil {
		t.Fatalf("flush: %v", err)
	}
	nc.Close()

	mu.Lock()
	done := completed
	mu.Unlock()
	if done != calls {
		t.Errorf("Run returned with %d of %d calls answered", done, calls)
	}
	for i := 0; i < calls; i++ {
		if err := <-replies; err != nil {
			t.Errorf("call %d was never answered: %v", i+1, err)
		}
	}
}

func TestTwoToolsOnOneSubjectAreRefused(t *testing.T) {
	s, err := natsserve.New(natsserve.Config{Name: "probed", Version: "0.1.0", Logger: quiet()})
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	add := func(name string) error {
		return s.Endpoint(name, "a.b.C.D",
			func() proto.Message { return new(weatherv1.GetForecastRequest) },
			func(context.Context, proto.Message) (proto.Message, error) { return nil, nil })
	}
	if err := add("probe.tool"); err != nil {
		t.Fatalf("the first registration failed: %v", err)
	}
	err = add("probe.tool")
	if err == nil {
		t.Fatal("the same subject was claimed twice; one of the two would silently never answer")
	}
	if !strings.Contains(err.Error(), "garm.tool.probe.tool") {
		t.Errorf("the refusal does not name the subject: %v", err)
	}
}

func TestRunWithNoEndpointsIsRefused(t *testing.T) {
	nc := conn(t, 0)
	s, err := natsserve.New(natsserve.Config{Name: "probed", Version: "0.1.0", Logger: quiet()})
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	// A service that announces itself and answers nothing is discoverable and
	// useless, which is worse than failing to start.
	if err := s.Run(context.Background(), nc); err == nil {
		t.Fatal("Run started with no endpoints")
	}
}

// TestNewRefusesExactlyWhatMicroRefuses is why validate.go copies micro's regexes
// rather than approximating them. New exists so a misconfigured process fails at
// construction; a looser pattern here would let it start and fail at AddService,
// and a stricter one would refuse a config that works.
func TestNewRefusesExactlyWhatMicroRefuses(t *testing.T) {
	nc := conn(t, 0)
	for _, tc := range []struct{ name, version string }{
		{"weatherd", "0.1.0"},        // fine
		{"weather-d_2", "1.0.0-rc1"}, // fine
		{"weather.d", "0.1.0"},       // a dot in the name
		{"weather d", "0.1.0"},       // a space
		{"", "0.1.0"},                // empty
		{"weatherd", "v0.1.0"},       // not semver: the v
		{"weatherd", "0.1"},          // not semver: two parts
		{"weatherd", ""},             // empty
	} {
		_, ourErr := natsserve.New(natsserve.Config{Name: tc.name, Version: tc.version, Logger: quiet()})

		svc, microErr := micro.AddService(nc, micro.Config{Name: tc.name, Version: tc.version})
		if microErr == nil {
			_ = svc.Stop()
		}

		if (ourErr == nil) != (microErr == nil) {
			t.Errorf("Config{%q, %q}: New says %v, micro says %v — the copied patterns have diverged",
				tc.name, tc.version, ourErr, microErr)
		}
	}
}

// TestEndpointNameIsAcceptedByMicroForEveryLegalToolName.
//
// micro's name charset excludes the dot, so the endpoint name replaces them. That
// is only total because declared already guarantees every other character is legal
// -- this asserts the two rules actually meet, using micro itself as the judge.
func TestEndpointNameIsAcceptedByMicroForEveryLegalToolName(t *testing.T) {
	nc := conn(t, 0)
	for _, tool := range []string{
		"weather.v1.get_forecast",
		"trip-planner",
		"support_assistant",
		"a",
		"A1.b2.C3",
	} {
		s := service(t, tool, func(context.Context, proto.Message) (proto.Message, error) {
			return &weatherv1.GetForecastResponse{Summary: "x", HighCelsius: 1}, nil
		})
		stop := run(t, s, nc)
		call(t, nc, natsserve.Subject(tool), &weatherv1.GetForecastRequest{Place: "x"})
		if err := stop(); err != nil {
			t.Errorf("tool %q: Serve returned %v", tool, err)
		}
	}
}

// TestAHandlerIsNotHandedACancelledContextDuringTheDrain.
//
// Found by re-reading the code rather than by a failure, which is why it has a test
// now. Run's context is cancelled to ask the service to stop, and the drain then
// waits for accepted calls to finish -- so passing that same context to handlers
// tells every in-flight call to abort at the exact moment we have committed to
// answering it. A ctx-aware handler would fail one call per deploy, per queued
// call, while the drain politely waited for it to.
func TestAHandlerIsNotHandedACancelledContextDuringTheDrain(t *testing.T) {
	url := serverURL(t, 0)
	nc := connect(t, url)
	caller := connect(t, url)

	var (
		mu       sync.Mutex
		errAtEnd error
		entered  = make(chan struct{}, 1)
	)
	s := service(t, "probe.tool", func(ctx context.Context, _ proto.Message) (proto.Message, error) {
		entered <- struct{}{}
		// Long enough that shutdown is certainly under way by the time this reads
		// the context.
		time.Sleep(250 * time.Millisecond)
		mu.Lock()
		errAtEnd = ctx.Err()
		mu.Unlock()
		if err := ctx.Err(); err != nil {
			// What a real handler does: give up, having been told to.
			return nil, serve.Unavailable("shutting down").Because(err)
		}
		return &weatherv1.GetForecastResponse{Summary: "finished", HighCelsius: 1}, nil
	})
	stop := run(t, s, nc)

	reply := make(chan *nats.Msg, 1)
	go func() {
		body, _ := proto.Marshal(&weatherv1.GetForecastRequest{Place: "x"})
		msg, err := caller.Request("garm.tool.probe.tool", body, 5*time.Second)
		if err == nil {
			reply <- msg
		} else {
			close(reply)
		}
	}()

	<-entered
	if err := stop(); err != nil {
		t.Fatalf("Run returned %v", err)
	}

	mu.Lock()
	seen := errAtEnd
	mu.Unlock()
	if seen != nil {
		t.Errorf("the handler saw ctx.Err() = %v while the service was draining it", seen)
	}

	msg, ok := <-reply
	if !ok {
		t.Fatal("the call was never answered")
	}
	if code := msg.Header.Get(micro.ErrorCodeHeader); code != "" {
		t.Errorf("the drained call was answered with %s: %s", code, msg.Header.Get(micro.ErrorHeader))
	}
}

func TestServeBeforeStartIsRefused(t *testing.T) {
	s := service(t, "probe.tool", func(context.Context, proto.Message) (proto.Message, error) {
		return nil, nil
	})
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if err := s.Serve(ctx); err == nil {
		t.Fatal("Serve returned nil having mounted nothing")
	}
}

func TestStartTwiceIsRefused(t *testing.T) {
	nc := conn(t, 0)
	s := service(t, "probe.tool", func(context.Context, proto.Message) (proto.Message, error) {
		return &weatherv1.GetForecastResponse{Summary: "x", HighCelsius: 1}, nil
	})
	if err := s.Start(nc); err != nil {
		t.Fatalf("Start: %v", err)
	}
	// Two micro services with one name and one set of subjects, where only the
	// second is ever stopped.
	if err := s.Start(nc); err == nil {
		t.Fatal("Start mounted the same endpoints twice")
	}
}
