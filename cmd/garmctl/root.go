package main

import (
	"context"
	"io"
	"log/slog"
	"os"
	"strings"

	"github.com/spf13/cobra"

	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/observe/otlp"
)

// root builds the command and returns, beside it, the function that flushes
// what a subcommand recorded; main calls it after Execute. A no-op until a
// subcommand actually runs, so `garmctl --help` sets nothing up.
func root() (*cobra.Command, func(context.Context) error) {
	stop := func(context.Context) error { return nil }
	// Every parent's persistent hook runs, not only the closest: a subcommand
	// that one day adds its own PersistentPreRunE must not silently switch
	// telemetry off for itself.
	cobra.EnableTraverseRunHooks = true
	cmd := &cobra.Command{
		Use:   "garmctl",
		Short: "Compose and check the declarations a governed tool plane runs on",
		Long: "garmctl works on PROTO DECLARATIONS: which tools exist, what an\n" +
			"agent may call, and whether a namespace assembled from several\n" +
			"repositories holds together.\n\n" +
			"It does not compile protos -- that is buf's job and buf does it\n" +
			"better. It answers the questions protobuf cannot express: an\n" +
			"allowlist cites tools by NAME, so there is no import, no type\n" +
			"reference and no compile error when a name is wrong.",
		SilenceUsage:  true, // a usage dump after a real failure buries the cause
		SilenceErrors: true, // main prints it once
		// The same two lines every process opens with -- here, once a subcommand is
		// about to run, so --help and a usage error print no observability line.
		// And a CLI in a pipeline gets no startup line at all unless an endpoint
		// is set: "log effective configuration" is a daemon's rule, and stderr
		// noise on every `garmctl call` is the wrong trade.
		PersistentPreRunE: func(cmd *cobra.Command, _ []string) error {
			var w io.Writer = io.Discard
			if endpointConfigured() {
				w = cmd.ErrOrStderr()
			}
			log := slog.New(observe.Handler(slog.NewTextHandler(w, nil)))
			s, err := otlp.Start(cmd.Context(), "garmctl", log)
			if err != nil {
				return err
			}
			stop = s
			return nil
		},
	}
	cmd.AddCommand(composeCmd())
	cmd.AddCommand(callCmd())
	cmd.AddCommand(fetchCmd())
	cmd.AddCommand(topologyCmd())
	cmd.AddCommand(operatorCmd())
	return cmd, func(ctx context.Context) error { return stop(ctx) }
}

// endpointConfigured is whether any OTLP endpoint variable is set, generic or
// per signal -- the same question otlp.Start answers with exporter=otlp.
func endpointConfigured() bool {
	for _, kv := range os.Environ() {
		if strings.HasPrefix(kv, "OTEL_EXPORTER_OTLP_") && strings.HasSuffix(strings.SplitN(kv, "=", 2)[0], "_ENDPOINT") && !strings.HasSuffix(kv, "=") {
			return true
		}
	}
	return false
}
