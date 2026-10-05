package natsserve_test

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"go.opentelemetry.io/otel/trace"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/emptypb"

	"github.com/garm-ai/garm-ai/natsserve"
	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/observe/otlp/otlptest"
)

// Property 11: the handler's ctx carries the span.
func TestAHandlerCanReachTheSpan(t *testing.T) {
	otlptest.Install(t)
	nc := conn(t, 0)
	seen := make(chan trace.SpanContext, 1)
	s := service(t, "probe.span", func(ctx context.Context, _ proto.Message) (proto.Message, error) {
		seen <- trace.SpanContextFromContext(ctx)
		return &emptypb.Empty{}, nil
	})
	run(t, s, nc)
	call(t, nc, natsserve.Subject("probe.span"), &emptypb.Empty{})
	if sc := <-seen; !sc.IsValid() {
		t.Fatal("the handler's ctx carried no span")
	}
}

// Property 2: the id a caller is told to quote IS the trace id.
func TestTheErrorIDIsTheTraceID(t *testing.T) {
	rec := otlptest.Install(t)
	nc := conn(t, 0)
	s := service(t, "probe.fail", func(context.Context, proto.Message) (proto.Message, error) {
		return nil, errors.New("a bare error: INTERNAL with an id")
	})
	run(t, s, nc)
	_, _, typed := wireError(t, call(t, nc, natsserve.Subject("probe.fail"), &emptypb.Empty{}))
	span, ok := rec.SpanNamed("garm.tool")
	if !ok {
		t.Fatal("no garm.tool span")
	}
	if typed.GetId() != span.SpanContext().TraceID().String() {
		t.Fatalf("error id %q, trace id %s", typed.GetId(), span.SpanContext().TraceID())
	}
}

// Without a tracer the id falls back to a random one -- never empty, never the
// invalid all-zero trace id. The regression guard for the fallback.
func TestWithoutATracerTheIDIsStillSomething(t *testing.T) {
	nc := conn(t, 0)
	s := service(t, "probe.fail2", func(context.Context, proto.Message) (proto.Message, error) {
		return nil, errors.New("bare")
	})
	run(t, s, nc)
	_, _, typed := wireError(t, call(t, nc, natsserve.Subject("probe.fail2"), &emptypb.Empty{}))
	if typed.GetId() == "" || strings.Trim(typed.GetId(), "0") == "" {
		t.Fatalf("id is %q", typed.GetId())
	}
}

// garm.tool.calls counts by kind, and inflight returns to zero once both calls
// are answered.
func TestToolCountersCountWhatHappened(t *testing.T) {
	rec := otlptest.Install(t)
	nc := conn(t, 0)
	s := service(t, "probe.count", func(context.Context, proto.Message) (proto.Message, error) {
		return &emptypb.Empty{}, nil
	})
	run(t, s, nc)
	call(t, nc, natsserve.Subject("probe.count"), &emptypb.Empty{})
	call(t, nc, natsserve.Subject("probe.count"), &emptypb.Empty{})
	// The counting is the handler's DEFER, which runs after the reply has gone
	// out -- so a caller can hold its answer a moment before the counters say
	// so. Read them until they settle, briefly; a wrong count stays wrong.
	ctx := context.Background()
	calls := func() int64 {
		return rec.Counter(ctx, "garm.tool.calls", observe.KeyTool.String("probe.count"), observe.KeyKind.String("OK"))
	}
	inflight := func() int64 { return rec.Counter(ctx, "garm.tool.inflight", observe.KeyTool.String("probe.count")) }
	for deadline := time.Now().Add(2 * time.Second); (calls() != 2 || inflight() != 0) && time.Now().Before(deadline); {
		time.Sleep(10 * time.Millisecond)
	}
	if n := calls(); n != 2 {
		t.Errorf("calls{OK} = %d, want 2", n)
	}
	if n := inflight(); n != 0 {
		t.Errorf("inflight = %d after both answered, want 0", n)
	}
}
