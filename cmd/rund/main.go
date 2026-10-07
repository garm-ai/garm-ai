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
	"time"

	"github.com/nats-io/nats.go"

	"github.com/garm-ai/garm-ai/catalogue"
	"github.com/garm-ai/garm-ai/fetch"
	"github.com/garm-ai/garm-ai/natsconn"
	"github.com/garm-ai/garm-ai/natsmicro"
	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/observe/otlp"
	"github.com/garm-ai/garm-ai/run"
	"github.com/garm-ai/garm-ai/rundbos"
	"github.com/garm-ai/garm-ai/rundsvc"
)

func main() {
	var (
		natsURL = flag.String("nats", nats.DefaultURL, "NATS URL")
		creds   = flag.String("creds", "", "this process's credentials file, as `garmctl topology` wrote it")
		tlsCA   = flag.String("tls-ca", "", "PEM the server's certificate chains to; empty means the system roots")
		catURI  = flag.String("catalogue", "", "catalogue URI: file://, s3:// or https://")
		catSHA  = flag.String("catalogue-sha256", "", "hex digest the catalogue must have; REQUIRED for remote")
		catDir  = flag.String("catalogue-dir", ".", "what a relative file:// catalogue resolves against")
		name    = flag.String("name", "rund", "this service's name, as $SRV.INFO reports it")
		version = flag.String("version", "0.1.0", "this service's version (semver)")
		callers = flag.String("callers", "", "callers.json as `garmctl topology` wrote it; names callers on spans and metrics")
		health  = flag.String("health", "", "address for /livez and /readyz, e.g. 127.0.0.1:8080; empty means no listener")
		store   = flag.String("run-store", "", "the run store: postgres://user:pass@host/db or sqlite:/path/runs.db; empty means sync tools only")
		storeEx = flag.String("run-store-executor", "", "this replica's STABLE executor id; a run executing when a replica dies is recovered only by a relaunch with the same id (a StatefulSet ordinal, a hostname); empty means the hostname; DBOS__VMID overrides")
		storeWk = flag.Int("run-store-workers", 4, "runs this replica executes at once")
		storeMg = flag.Bool("run-store-migrate", true, "create and migrate the store's schema at start; false verifies it and refuses to start if it is absent")
		storeRL = flag.Duration("run-store-run-limit", 24*time.Hour, "the ceiling on one run, from the moment a replica starts executing it until it is CANCELLED; a tool's own limit bounds one call, this bounds the whole run; 0 means none")
	)
	flag.Parse()

	// The whole of this process's observability setup: a handler that stamps
	// trace ids onto every line and ships it, and the SDK from OTEL_* -- or, with
	// no endpoint, nothing shipped and a startup line that says so.
	log := slog.New(observe.Handler(slog.NewTextHandler(os.Stderr, nil)))
	stop, err := otlp.Start(context.Background(), *name, log)
	if err != nil {
		log.Error("observability", "error", err)
		os.Exit(1)
	}
	// Flushed before EVERY exit, the failing ones included: "no catalogue" and
	// "stopped: <error>" are exactly the lines an operator wants shipped, and a
	// deferred stop does not run through os.Exit.
	code := func() int {
		// Every value, defaults included, so nobody has to guess which one is in force.
		log.Info("starting", "nats", *natsURL, "creds", *creds, "tls_ca", *tlsCA, "catalogue", *catURI, "catalogue_dir", *catDir,
			"name", *name, "version", *version, "callers", *callers, "health", *health,
			"run_store", storeLabel(*store), "run_store_executor", *storeEx, "run_store_workers", *storeWk, "run_store_migrate", *storeMg, "run_store_run_limit", *storeRL)
		if *catURI == "" {
			log.Error("no catalogue", "hint", "pass -catalogue file://build/catalogue.binpb")
			return 2
		}
		logCredentialExpiry(log, *creds)
		storeCfg := rundbos.Config{URL: *store, AppName: "garm", Executor: *storeEx, Workers: *storeWk, Migrate: *storeMg, RunLimit: *storeRL, Logger: log}
		if err := serveRund(*natsURL, natsconn.Options{Creds: *creds, CA: *tlsCA}, *catURI, *catSHA, *catDir, *name, *version, *callers, *health, storeCfg, log); err != nil {
			log.Error("stopped", "error", err)
			return 1
		}
		log.Info("stopped cleanly")
		return 0
	}()
	_ = stop(context.Background())
	os.Exit(code)
}

// logCredentialExpiry says when this process's credential dies. Nothing renews
// a credential, so the date in the log is the notice; inside thirty days it is
// a warning, because that is a reissue somebody has to schedule.
func logCredentialExpiry(log *slog.Logger, creds string) {
	if creds == "" {
		return
	}
	exp, err := natsconn.CredentialExpiry(creds)
	if err != nil || exp.IsZero() {
		return // Connect says what is wrong with the file, once, naming the flag
	}
	left := time.Until(exp).Round(time.Hour)
	if left < 30*24*time.Hour {
		log.Warn("credential", "expires", exp.Format(time.RFC3339), "in", left, "hint", "reissue with garmctl topology and roll it out before then")
		return
	}
	log.Info("credential", "expires", exp.Format(time.RFC3339), "in", left)
}

// storeLabel is the --run-store value as the startup line shows it: redacted,
// or "none".
func storeLabel(url string) string {
	if url == "" {
		return "none"
	}
	return rundbos.Redact(url)
}

func serveRund(natsURL string, conn natsconn.Options, catURI, catSHA, catDir, name, version, callersPath, health string, storeCfg rundbos.Config, log *slog.Logger) error {
	ctx := context.Background()

	// A broken table refuses to start rather than labelling half the callers.
	names, err := observe.LoadCallerNames(callersPath)
	if err != nil {
		return err
	}

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
	if len(unservable) > 0 && storeCfg.URL == "" {
		log.Warn("declared tools this rund cannot serve",
			"count", len(unservable), "tools", unservable,
			"why", "declared async, and this rund has no run store (--run-store)")
	}

	svc, err := natsmicro.New(natsmicro.Config{Name: name, Version: version, Logger: log})
	if err != nil {
		return err
	}
	nc, err := natsconn.Connect(natsURL, conn)
	if err != nil {
		return err
	}
	// Closed only after Serve returns, which it does not do until every in-flight
	// call has been answered. Closing earlier turns a deploy into caller timeouts.
	defer nc.Close()

	engine := &run.Engine{Catalogue: &holder, Tools: rundsvc.ToolCaller{NC: nc}, Log: log}
	if storeCfg.URL != "" {
		// Opened BEFORE anything is mounted: Launch recovers this executor's
		// in-flight runs, and a run started on a store that is not yet up
		// would be a run nobody holds.
		store, err := rundbos.Open(ctx, storeCfg, &holder, engine.Tools, rundsvc.NewLivePublisher(nc, log))
		if err != nil {
			return err
		}
		defer store.Close(context.Background())
		engine.Store = store
	}
	if err := rundsvc.Serve(svc, engine, names); err != nil {
		return err
	}
	// The listener is up BEFORE Start, so a scheduler probing early gets 503
	// rather than connection refused; readiness itself follows svc.Ready.
	if health != "" {
		bound, stopHealth, err := observe.ServeHealth(ctx, health, svc.Ready)
		if err != nil {
			return err
		}
		defer stopHealth(context.Background())
		log.Info("health", "addr", bound, "livez", "/livez", "readyz", "/readyz")
	}
	if err := svc.Start(nc); err != nil {
		return err
	}
	// What rund ANSWERS on. A caller publishes the flat subject; the server inserts
	// the caller's account key on the way in (spec §3).
	log.Info("ready", "invoke", rundsvc.PatternInvoke, "fetch", rundsvc.PatternFetch)

	ctx, stop := signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)
	defer stop()
	return svc.Serve(ctx)
}
