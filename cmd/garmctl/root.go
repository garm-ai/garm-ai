package main

import "github.com/spf13/cobra"

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
	}
	cmd.AddCommand(composeCmd())
	cmd.AddCommand(callCmd())
	cmd.AddCommand(topologyCmd())
	return cmd
}
