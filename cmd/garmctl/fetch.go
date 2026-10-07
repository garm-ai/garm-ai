package main

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/spf13/cobra"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/dynamicpb"

	"github.com/garm-ai/garm-ai/call"
	"github.com/garm-ai/garm-ai/catalogue"
	"github.com/garm-ai/garm-ai/fetch"
	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
	"github.com/garm-ai/garm-ai/natscall"
	"github.com/garm-ai/garm-ai/natsconn"
)

func fetchCmd() *cobra.Command {
	var (
		natsURL string
		creds   string
		tlsCA   string
		catURI  string
		catSHA  string
		catDir  string
		wait    time.Duration
		follow  bool
		after   uint64
	)
	cmd := &cobra.Command{
		Use:   "fetch <run-id>",
		Short: "Read a run: its state, where it is, and its answer once there is one",
		Long: "fetch asks rund what happened to a run -- the id `call` printed as\n" +
			"`pending <id>`, which is the idempotency key the call was made with.\n\n" +
			"--wait holds the request on rund until the run changes or the wait\n" +
			"elapses (rund caps it at 30s), so a person waits on one request rather\n" +
			"than polling. The answer is decoded against the catalogue's own\n" +
			"descriptors for the tool the run invoked, so what is printed is exactly\n" +
			"what the tool declared.\n\n" +
			"Only the account that started a run can read it; another's is NOT_FOUND.",
		Args: cobra.ExactArgs(1),
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
			if wait > call.MaxWait {
				wait = call.MaxWait
			}
			nc, err := natsconn.Connect(natsURL, natsconn.Options{Creds: creds, CA: tlsCA})
			if err != nil {
				return err
			}
			defer nc.Close()

			out := cmd.OutOrStdout()
			if follow {
				// One line per event, as it arrives: the record first, then live,
				// stitched by sequence; returns on done.
				for ev, err := range (call.Ref{RunID: args[0], Invoker: natscall.Client{NC: nc}}).Follow(ctx, after) {
					if err != nil {
						return err
					}
					fmt.Fprintln(out, eventLine(ev))
				}
				return nil
			}
			resp, err := (call.Ref{RunID: args[0], Invoker: natscall.Client{NC: nc}}).Fetch(ctx, wait)
			if err != nil {
				return err
			}
			state := strings.TrimPrefix(resp.GetState().String(), "RUN_STATE_")
			fmt.Fprintf(out, "%s", state)
			if resp.GetStage() != "" {
				fmt.Fprintf(out, " stage=%s", resp.GetStage())
			}
			if resp.GetTool() != "" {
				fmt.Fprintf(out, " tool=%s", resp.GetTool())
			}
			fmt.Fprintln(out)
			switch resp.GetState() {
			case runv1.RunState_RUN_STATE_FAILED:
				fmt.Fprintf(out, "%s: %s\n", strings.TrimPrefix(resp.GetError().GetKind().String(), "ERROR_KIND_"), resp.GetError().GetMessage())
			case runv1.RunState_RUN_STATE_SUCCEEDED:
				tool, ok := cat.Tool(resp.GetTool())
				if !ok {
					return fmt.Errorf("the run invoked %q, which the catalogue loaded from %s does not declare; its result cannot be decoded here",
						resp.GetTool(), cat.Source)
				}
				msg := dynamicpb.NewMessage(tool.Method.Output())
				if err := proto.Unmarshal(resp.GetResult(), msg); err != nil {
					return fmt.Errorf("the answer is not a %s: %w", tool.Method.Output().FullName(), err)
				}
				text, err := protojson.MarshalOptions{Multiline: true, Indent: "  "}.Marshal(msg)
				if err != nil {
					return err
				}
				fmt.Fprintln(out, string(text))
			}
			return nil
		},
	}
	cmd.Flags().StringVar(&natsURL, "nats", nats.DefaultURL, "NATS URL")
	cmd.Flags().StringVar(&creds, "creds", "", "this caller's credentials file, as `garmctl topology` wrote it")
	cmd.Flags().StringVar(&tlsCA, "tls-ca", "", "PEM the server's certificate chains to; empty means the system roots")
	cmd.Flags().StringVar(&catURI, "catalogue", "", "catalogue URI: file://, s3:// or https://")
	cmd.Flags().StringVar(&catSHA, "catalogue-sha256", "", "hex digest the catalogue must have; REQUIRED for remote")
	cmd.Flags().StringVar(&catDir, "catalogue-dir", ".", "what a relative file:// catalogue resolves against")
	cmd.Flags().DurationVar(&wait, "wait", 0, "how long rund may hold the request for the run to change; 0 answers at once, 30s is the most")
	cmd.Flags().BoolVar(&follow, "follow", false, "print the run's events as they arrive -- the record first, then live -- and return on done")
	cmd.Flags().Uint64Var(&after, "after", 0, "with --follow: start after this sequence number; 0 is the start")
	return cmd
}

// eventLine renders one event for a person: the sequence, the kind, its word.
func eventLine(ev *runv1.Event) string {
	switch k := ev.GetKind().(type) {
	case *runv1.Event_Stage:
		return fmt.Sprintf("%d stage %s", ev.GetSeq(), k.Stage.GetStage())
	case *runv1.Event_Step:
		kind := "OK"
		if k.Step.GetKind() != invokev1.ErrorKind_ERROR_KIND_UNSPECIFIED {
			kind = strings.TrimPrefix(k.Step.GetKind().String(), "ERROR_KIND_")
		}
		return fmt.Sprintf("%d step %s %s", ev.GetSeq(), k.Step.GetKey(), kind)
	case *runv1.Event_Progress:
		return fmt.Sprintf("%d progress %s", ev.GetSeq(), k.Progress.GetText())
	case *runv1.Event_Question:
		return fmt.Sprintf("%d question %s: %s", ev.GetSeq(), k.Question.GetId(), k.Question.GetText())
	case *runv1.Event_Chunk:
		return fmt.Sprintf("%d chunk %s", ev.GetSeq(), k.Chunk.GetText())
	case *runv1.Event_Done:
		return fmt.Sprintf("%d done %s", ev.GetSeq(), strings.TrimPrefix(k.Done.GetState().String(), "RUN_STATE_"))
	}
	return fmt.Sprintf("%d ?", ev.GetSeq())
}
