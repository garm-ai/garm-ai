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
)

func main() {
	url := flag.String("nats", nats.DefaultURL, "NATS URL")
	creds := flag.String("creds", "", "this service's credentials file, as `garmctl topology` wrote it")
	ca := flag.String("tls-ca", "", "PEM the server's certificate chains to; empty means the system roots")
	name := flag.String("name", "weatherd", "this service's name, as $SRV.INFO reports it")
	version := flag.String("version", "0.1.0", "this service's version (semver)")
	flag.Parse()

	log := slog.New(slog.NewTextHandler(os.Stderr, nil))
	// Every value, defaults included, so nobody has to guess which one is in force.
	log.Info("starting", "nats", *url, "creds", *creds, "tls_ca", *ca, "name", *name, "version", *version)

	if err := run(*url, natsconn.Options{Creds: *creds, CA: *ca}, *name, *version, log); err != nil {
		log.Error("stopped", "error", err)
		os.Exit(1)
	}
	log.Info("stopped cleanly")
}

func run(url string, conn natsconn.Options, name, version string, log *slog.Logger) error {
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

	// Start before Serve, rather than Run, so that "ready" is a thing this process
	// can say truthfully. Start returns only once the tools are answering -- a
	// readiness probe or a deployment gate hangs off this line, not off the process
	// having been created.
	if err := svc.Start(nc); err != nil {
		return err
	}
	log.Info("ready")

	// SIGTERM is what an orchestrator sends, so it is the one that has to drain.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	return svc.Serve(ctx)
}
