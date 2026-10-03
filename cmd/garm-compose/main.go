// garm-compose turns a manifest of built proto images into one verified namespace.
//
// It exists because a rule nobody runs is not a rule. The estate this replaces
// accumulated eight checks that were configured and never ran clean -- a buf lint
// emitting eight violations on every build, a compatibility check comparing a tree
// against the tag just made from it, tests whose fixtures could not express the
// bug they covered. Each read as a guarantee and was not one. So every check in
// `declared` and `images` is wired to something that EXITS NON-ZERO, from the
// step it was written.
//
//	garm-compose images.yaml            # resolve, merge, check
//	garm-compose images.yaml -o out.binpb   # ...and emit the artefact
//
// The merge happens HERE, at build time, and not in a gateway at startup. Tool
// definitions live in different repositories built by different teams, and
// nothing coordinates naming between them -- so two teams can each declare
// `accounts.v1.get_customer` and neither will know. Discovering that in CI means
// somebody gets told. Discovering it at boot means the plane is down.
package main

import (
	"errors"
	"fmt"
	"os"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protodesc"

	"github.com/garm-ai/garm-ai/declared"
	"github.com/garm-ai/garm-ai/images"
)

func main() {
	args, out := parse(os.Args[1:])
	if len(args) != 1 {
		fmt.Fprintln(os.Stderr, "usage: garm-compose <images.yaml> [-o <artefact.binpb>]")
		os.Exit(2)
	}
	if err := run(args[0], out); err != nil {
		fmt.Fprintln(os.Stderr, "garm-compose: "+err.Error())
		os.Exit(1)
	}
}

func parse(argv []string) (args []string, out string) {
	for i := 0; i < len(argv); i++ {
		if argv[i] == "-o" && i+1 < len(argv) {
			out = argv[i+1]
			i++
			continue
		}
		args = append(args, argv[i])
	}
	return args, out
}

func run(manifestPath, out string) error {
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
		// nothing about images; the provenance to turn those into sources lives
		// here, which is why the error is typed rather than a string.
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
			fmt.Fprintf(os.Stderr, "  %s\n    in %s\n", u, merged.Source[u.Method.ParentFile().Path()])
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
	// Say what was checked, with numbers. A green line that names nothing is
	// indistinguishable from a check that found nothing to do, and this estate
	// has produced several of those.
	fmt.Printf("ok: %d images, %d tools, %d of them agents, every allowlist entry resolves\n",
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
	fmt.Printf("wrote %s (%d files)\n", out, len(merged.Set.File))
	return nil
}

func plural(n int, one, many string) string {
	if n == 1 {
		return one
	}
	return many
}
