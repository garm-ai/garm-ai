package main

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/spf13/cobra"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/dynamicpb"

	"github.com/garm-ai/garm-ai/call"
	"github.com/garm-ai/garm-ai/catalogue"
	"github.com/garm-ai/garm-ai/fetch"
	"github.com/garm-ai/garm-ai/natscall"
)

func callCmd() *cobra.Command {
	var (
		natsURL     string
		catURI      string
		catSHA      string
		catDir      string
		idempotency string
	)
	cmd := &cobra.Command{
		Use:   "call <tool> [json]",
		Short: "Invoke a tool by name through rund",
		Long: "call sends one invocation to rund and prints the answer.\n\n" +
			"IT ADDRESSES NO SUBJECT. A caller knows a tool's NAME; where that tool\n" +
			"is answered is rund's business, and a tool re-homed to another proto\n" +
			"package keeps the same name and so the same call.\n\n" +
			"The request and the answer are JSON here because a person is typing\n" +
			"them. The shapes come from the catalogue's own descriptors, so what you\n" +
			"may type is exactly what the tool declared -- an unknown field is a typo\n" +
			"the command refuses rather than a value the tool silently ignores.",
		Args: cobra.RangeArgs(1, 2),
		RunE: func(cmd *cobra.Command, args []string) error {
			ctx := cmd.Context()
			if ctx == nil {
				ctx = context.Background()
			}
			if catURI == "" {
				return errors.New("no catalogue: pass --catalogue file://build/catalogue.binpb")
			}
			cat, err := catalogue.Load(ctx, &fetch.Resolver{Dir: catDir},
				fetch.Artefact{URI: catURI, SHA256: catSHA})
			if err != nil {
				return err
			}
			tool, ok := cat.Tool(args[0])
			if !ok {
				// Name the catalogue: "unknown tool" is unactionable when the real
				// question is which namespace is loaded.
				return fmt.Errorf("no tool named %q in the catalogue loaded from %s",
					args[0], cat.Source)
			}

			body := "{}"
			if len(args) == 2 {
				body = args[1]
			}
			in := dynamicpb.NewMessage(tool.Method.Input())
			// DiscardUnknown stays false: a mistyped field is a typo somebody wants
			// told about, not a value quietly dropped on the way to a tool.
			if err := protojson.Unmarshal([]byte(body), in); err != nil {
				return fmt.Errorf("the request is not a %s: %w", tool.Method.Input().FullName(), err)
			}
			raw, err := proto.Marshal(in)
			if err != nil {
				return err
			}

			nc, err := nats.Connect(natsURL)
			if err != nil {
				return err
			}
			defer nc.Close()

			// The DECLARED budget plus the hops, so nobody types a timeout.
			budget := tool.Budget()
			if budget <= 0 {
				budget = 30 * time.Second // an async tool, which rund will refuse anyway
			}
			ctx, cancel := context.WithTimeout(ctx, call.Deadline(budget))
			defer cancel()

			out, err := natscall.Client{NC: nc}.Invoke(ctx, tool.Name, raw,
				call.Options{Idempotency: idempotency})
			if err != nil {
				// RETURNED, not printed-and-exited. An earlier revision called
				// os.Exit(1) here to get the kind in front of the person, which
				// jumped over this function's own deferred Close and cancel, and
				// made the one interesting path in this command untestable. main
				// renders the kind now, through serve.Describe, for every
				// subcommand rather than this one.
				return err
			}

			resp := dynamicpb.NewMessage(tool.Method.Output())
			if err := proto.Unmarshal(out, resp); err != nil {
				return fmt.Errorf("the answer is not a %s: %w", tool.Method.Output().FullName(), err)
			}
			text, err := protojson.MarshalOptions{Multiline: true, Indent: "  "}.Marshal(resp)
			if err != nil {
				return err
			}
			fmt.Fprintln(cmd.OutOrStdout(), string(text))
			return nil
		},
	}
	cmd.Flags().StringVar(&natsURL, "nats", nats.DefaultURL, "NATS URL")
	cmd.Flags().StringVar(&catURI, "catalogue", "", "catalogue URI: file://, s3:// or https://")
	cmd.Flags().StringVar(&catSHA, "catalogue-sha256", "", "hex digest the catalogue must have; REQUIRED for remote")
	cmd.Flags().StringVar(&catDir, "catalogue-dir", ".", "what a relative file:// catalogue resolves against")
	cmd.Flags().StringVar(&idempotency, "idempotency-key", "",
		"becomes the run id, so re-running with the same key is the same run rather than a second one")
	return cmd
}
