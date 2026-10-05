package natscall_test

import (
	"context"
	"testing"

	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/natscall"
)

// BenchmarkTheLoop is the per-call cost of the whole chain under operator mode:
// generated client -> natscall -> the server's account rewrite -> rund ->
// natsserve -> the example handler -> back, over TLS, in one process.
//
// Review finding: nothing was measured, and a durability decision had been made
// partly on cost-per-call grounds with the cost per call of what exists unknown.
// `mise run bench` runs this; docs/performance.md carries the number it last gave
// and the machine it gave it on. It is NOT in CI: a benchmark that gates a build
// is a flaky build.
func BenchmarkTheLoop(b *testing.B) {
	e := estate.New(b)
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(b, estate.RoleCaller)})
	req := &weatherv1.GetForecastRequest{Place: "Ghent", Days: 1}
	ctx := context.Background()
	if _, err := client.GetForecast(ctx, req); err != nil {
		b.Fatal(err)
	}
	b.ReportAllocs()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		if _, err := client.GetForecast(ctx, req); err != nil {
			b.Fatal(err)
		}
	}
}

// BenchmarkTheLoopParallel is the same call from many callers at once, which is
// what a front door does.
func BenchmarkTheLoopParallel(b *testing.B) {
	e := estate.New(b)
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: e.Connect(b, estate.RoleCaller)})
	req := &weatherv1.GetForecastRequest{Place: "Ghent", Days: 1}
	b.ReportAllocs()
	b.ResetTimer()
	b.RunParallel(func(pb *testing.PB) {
		for pb.Next() {
			if _, err := client.GetForecast(context.Background(), req); err != nil {
				b.Fatal(err)
			}
		}
	})
}
