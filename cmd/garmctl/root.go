package main

import (
	"context"
	"log/slog"
	"os"

	"github.com/spf13/cobra"

	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/observe/otlp"
)

// stopTelemetry flushes what a subcommand recorded; main calls it after Execute.
// A no-op until a subcommand actually runs, so `garmctl --help` sets nothing up.
var stopTelemetry = func(context.Context) error { return nil }

func root() *cobra.Command {
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
		PersistentPreRunE: func(cmd *cobra.Command, _ []string) error {
			log := slog.New(observe.Handler(slog.NewTextHandler(os.Stderr, nil)))
			stop, err := otlp.Start(cmd.Context(), "garmctl", log)
			if err != nil {
				return err
			}
			stopTelemetry = stop
			return nil
		},
	}
	cmd.AddCommand(composeCmd())
	cmd.AddCommand(callCmd())
	cmd.AddCommand(topologyCmd())
	return cmd
}
