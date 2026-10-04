// weatherd serves the weather tools.
//
// The whole process. Everything that knows about NATS is in these forty lines;
// everything that knows about weather is in examples/weatherd, and the two meet
// through generated code that knows about neither.
package main

import (
	"context"
	"flag"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/nats-io/nats.go"

	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	"github.com/garm-ai/garm-ai/examples/weatherd"
	"github.com/garm-ai/garm-ai/natsconn"
	"github.com/garm-ai/garm-ai/natsserve"
	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/observe/otlp"
)

func main() {
	url := flag.String("nats", nats.DefaultURL, "NATS URL")
	creds := flag.String("creds", "", "this service's credentials file, as `garmctl topology` wrote it")
	ca := flag.String("tls-ca", "", "PEM the server's certificate chains to; empty means the system roots")
	name := flag.String("name", "weatherd", "this service's name, as $SRV.INFO reports it")
	version := flag.String("version", "0.1.0", "this service's version (semver)")
	health := flag.String("health", "", "address for /livez and /readyz, e.g. 127.0.0.1:8080; empty means no listener")
	flag.Parse()

	// The whole of this process's observability setup, and the same two lines in
	// every process: a handler that joins each log line to its trace, and the SDK
	// from OTEL_* -- or, with no endpoint, nothing shipped and a line that says so.
	log := slog.New(observe.Handler(slog.NewTextHandler(os.Stderr, nil)))
	stop, err := otlp.Start(context.Background(), *name, log)
	if err != nil {
		log.Error("observability", "error", err)
		os.Exit(1)
	}
	defer stop(context.Background())
	// Every value, defaults included, so nobody has to guess which one is in force.
	log.Info("starting", "nats", *url, "creds", *creds, "tls_ca", *ca, "name", *name, "version", *version, "health", *health)

	if err := run(*url, natsconn.Options{Creds: *creds, CA: *ca}, *name, *version, *health, log); err != nil {
		log.Error("stopped", "error", err)
		os.Exit(1)
	}
	log.Info("stopped cleanly")
}

func run(url string, conn natsconn.Options, name, version, health string, log *slog.Logger) error {
	svc, err := natsserve.New(natsserve.Config{Name: name, Version: version, Logger: log})
	if err != nil {
		return err
	}

	// The only line that mentions this service's tools, and it is generated. Adding
	// a tool to weather.proto makes this fail to compile until weatherd.Service
	// answers it.
	if err := weatherv1.ServeWeatherService(svc, weatherd.Service{}); err != nil {
		return err
	}

	nc, err := natsconn.Connect(url, conn)
	if err != nil {
		return err
	}
	// Closed only after Run returns, which it does not do until every in-flight
	// call has been answered. Closing earlier is what turns a deploy into a
	// handful of caller timeouts.
	defer nc.Close()

	// The listener is up BEFORE Start, so a scheduler probing early gets 503 rather
	// than connection refused; /readyz follows svc.Ready, which is true only once
	// the tools are answering and false again the moment the drain begins.
	ctx := context.Background()
	if health != "" {
		bound, stopHealth, err := observe.ServeHealth(ctx, health, svc.Ready)
		if err != nil {
			return err
		}
		defer stopHealth(context.Background())
		log.Info("health", "addr", bound, "livez", "/livez", "readyz", "/readyz")
	}

	// Start before Serve, rather than Run, so that "ready" is a thing this process
	// can say truthfully. Start returns only once the tools are answering -- and
	// /readyz turns 200 on exactly this line, not on the process having been created.
	if err := svc.Start(nc); err != nil {
		return err
	}
	log.Info("ready")

	// SIGTERM is what an orchestrator sends, so it is the one that has to drain.
	ctx, stop := signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)
	defer stop()

	return svc.Serve(ctx)
}
