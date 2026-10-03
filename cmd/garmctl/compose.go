package main

import (
	"errors"
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protodesc"

	"github.com/garm-ai/garm-ai/declared"
	"github.com/garm-ai/garm-ai/images"
)

func composeCmd() *cobra.Command {
	var out string
	cmd := &cobra.Command{
		Use:   "compose <images.yaml>",
		Short: "Merge built images into one namespace and check it holds together",
		Long: "compose resolves every image a manifest names, merges them into one\n" +
			"namespace, and refuses anything that does not hold together: two tools\n" +
			"claiming one name, an allowlist entry naming a tool nobody declares, or\n" +
			"a shared contract file carrying different bytes in two images.\n\n" +
			"THE MERGE HAPPENS HERE, at build time, and not in a gateway at startup.\n" +
			"Tool definitions live in different repositories built by different teams,\n" +
			"and nothing coordinates naming between them -- so two teams can each\n" +
			"declare the same tool name and neither will know. Discovering that in CI\n" +
			"means somebody gets told. Discovering it at boot means the plane is down.",
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return compose(cmd, args[0], out)
		},
	}
	cmd.Flags().StringVarP(&out, "out", "o", "",
		"write the merged artefact here; omit to check only")
	return cmd
}

// compose is orchestration and presentation. The checks themselves live in
// `images` and `declared`, so a gateway can reuse them without reusing this.
//
// When a second caller needs the load-fetch-merge-resolve sequence, it moves
// into `images` -- it stays here while there is one, because the previous
// estate's worst structural bug was one idea with two implementations, and the
// cure for that is not extracting everything in advance, it is extracting at the
// second consumer.
func compose(cmd *cobra.Command, manifestPath, out string) error {
	m, base, err := images.Load(manifestPath)
	if err != nil {
		return err
	}
	fetched, err := images.Fetch(m, base)
	if err != nil {
		return err
	}
	merged, err := images.Merge(fetched)
	if err != nil {
		return err
	}
	files, err := protodesc.NewFiles(merged.Set)
	if err != nil {
		return fmt.Errorf("the merged namespace does not resolve: %w", err)
	}

	set, err := declared.From(files)
	if err != nil {
		// A collision between two repositories is only actionable if the message
		// names the IMAGES. `declared` reports descriptors because it knows
		// nothing about images; the provenance that turns those into sources is
		// here, which is why that error is typed rather than a string.
		var dup *declared.DuplicateName
		if errors.As(err, &dup) {
			return fmt.Errorf("two tools declare the name %q:\n  %s\n    in %s\n  %s\n    in %s",
				dup.Name,
				dup.First.FullName(), merged.Source[dup.First.ParentFile().Path()],
				dup.Second.FullName(), merged.Source[dup.Second.ParentFile().Path()])
		}
		return err
	}

	if bad := set.Unresolved(); len(bad) > 0 {
		for _, u := range bad {
			fmt.Fprintf(cmd.ErrOrStderr(), "  %s\n    in %s\n",
				u, merged.Source[u.Method.ParentFile().Path()])
		}
		return fmt.Errorf("%d allowlist %s a tool nothing in this namespace declares",
			len(bad), plural(len(bad), "entry names", "entries name"))
	}

	agents := 0
	for _, t := range set.Tools() {
		if t.IsAgent() {
			agents++
		}
	}
	// Numbers, not just "ok". A green line that names nothing is
	// indistinguishable from a check that found nothing to do, and this estate
	// has produced several of those.
	fmt.Fprintf(cmd.OutOrStdout(),
		"ok: %d images, %d tools, %d of them agents, every allowlist entry resolves\n",
		len(fetched), len(set.Tools()), agents)

	if out == "" {
		return nil
	}
	raw, err := proto.Marshal(merged.Set)
	if err != nil {
		return err
	}
	if err := os.WriteFile(out, raw, 0o600); err != nil {
		return err
	}
	fmt.Fprintf(cmd.OutOrStdout(), "wrote %s (%d files)\n", out, len(merged.Set.File))
	return nil
}

func plural(n int, one, many string) string {
	if n == 1 {
		return one
	}
	return many
}
