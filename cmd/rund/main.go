// rund is the run manager: the only way a caller reaches a tool.
//
// It loads a catalogue, answers garm.run.v1, and calls tools on garm.tool.<name>.
// What it does NOT do in this build is keep a run: there is no store, so only
// synchronous tools can be invoked and Fetch says so rather than lying.
package main

import (
	"context"
	"flag"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/nats-io/nats.go"

	"github.com/garm-ai/garm-ai/catalogue"
	"github.com/garm-ai/garm-ai/fetch"
	"github.com/garm-ai/garm-ai/natsmicro"
	"github.com/garm-ai/garm-ai/run"
	"github.com/garm-ai/garm-ai/rundsvc"
)

func main() {
	var (
		natsURL = flag.String("nats", nats.DefaultURL, "NATS URL")
		catURI  = flag.String("catalogue", "", "catalogue URI: file://, s3:// or https://")
		catSHA  = flag.String("catalogue-sha256", "", "hex digest the catalogue must have; REQUIRED for remote")
		catDir  = flag.String("catalogue-dir", ".", "what a relative file:// catalogue resolves against")
		name    = flag.String("name", "rund", "this service's name, as $SRV.INFO reports it")
		version = flag.String("version", "0.1.0", "this service's version (semver)")
	)
	flag.Parse()

	log := slog.New(slog.NewTextHandler(os.Stderr, nil))
	// Every value, defaults included, so nobody has to guess which one is in force.
	log.Info("starting", "nats", *natsURL, "catalogue", *catURI, "catalogue_dir", *catDir,
		"name", *name, "version", *version, "run_store", "none")

	if *catURI == "" {
		log.Error("no catalogue", "hint", "pass -catalogue file://build/catalogue.binpb")
		os.Exit(2)
	}
	if err := serveRund(*natsURL, *catURI, *catSHA, *catDir, *name, *version, log); err != nil {
		log.Error("stopped", "error", err)
		os.Exit(1)
	}
	log.Info("stopped cleanly")
}

func serveRund(natsURL, catURI, catSHA, catDir, name, version string, log *slog.Logger) error {
	ctx := context.Background()

	// Loaded and RE-VERIFIED before anything is mounted. compose may have run with
	// an older binary that lacked a rule added since, so a catalogue valid when it
	// was built may not be valid now.
	cat, err := catalogue.Load(ctx, &fetch.Resolver{Dir: catDir},
		fetch.Artefact{URI: catURI, SHA256: catSHA})
	if err != nil {
		return err
	}
	var holder catalogue.Holder
	holder.Set(cat)

	tools, agents := 0, 0
	var unservable []string
	for _, t := range cat.Tools.Tools() {
		tools++
		if t.IsAgent() {
			agents++
		}
		if !t.IsSync() {
			unservable = append(unservable, t.Name)
		}
	}
	log.Info("catalogue loaded",
		"source", cat.Source, "sha256", cat.SHA256, "tools", tools, "agents", agents)

	// Named at boot, once, rather than discovered one failed call at a time. They
	// are refused per call rather than refusing to start, so everything servable
	// still works.
	if len(unservable) > 0 {
		log.Warn("declared tools this build cannot serve",
			"count", len(unservable), "tools", unservable,
			"why", "declared async, and this build has no run store")
	}

	svc, err := natsmicro.New(natsmicro.Config{Name: name, Version: version, Logger: log})
	if err != nil {
		return err
	}
	nc, err := nats.Connect(natsURL)
	if err != nil {
		return err
	}
	// Closed only after Serve returns, which it does not do until every in-flight
	// call has been answered. Closing earlier turns a deploy into caller timeouts.
	defer nc.Close()

	engine := &run.Engine{Catalogue: &holder, Tools: rundsvc.ToolCaller{NC: nc}, Log: log}
	if err := rundsvc.Serve(svc, engine); err != nil {
		return err
	}
	if err := svc.Start(nc); err != nil {
		return err
	}
	log.Info("ready", "invoke", rundsvc.SubjectInvoke, "fetch", rundsvc.SubjectFetch)

	ctx, stop := signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)
	defer stop()
	return svc.Serve(ctx)
}
