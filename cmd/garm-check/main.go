// garm-check refuses a descriptor set whose declarations do not hold together.
//
// It exists because a rule nobody runs is not a rule. The estate this replaces
// accumulated eight checks that were configured and never ran clean -- a buf lint
// that emitted eight violations on every build, a compatibility check that
// compared a tree against the tag just made from it, unit tests whose fixtures
// could not express the bug they covered. Each read as a guarantee and was not
// one. So the resolver in `declared` is wired to something that EXITS NON-ZERO,
// from the first step it exists.
//
// usage: garm-check <descriptor-set>
//
// The descriptor set comes from `buf build -o`. Compiling protos is buf's job and
// it does it better; this binary's job is to answer the questions protobuf cannot
// express -- which is all of them, where an allowlist is concerned.
package main

import (
	"fmt"
	"os"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protodesc"
	"google.golang.org/protobuf/types/descriptorpb"

	"github.com/garm-ai/garm-ai/declared"
)

func main() {
	if len(os.Args) != 2 {
		fmt.Fprintln(os.Stderr, "usage: garm-check <descriptor-set>")
		fmt.Fprintln(os.Stderr, "  produce one with: buf build -o image.binpb")
		os.Exit(2)
	}
	if err := run(os.Args[1]); err != nil {
		fmt.Fprintln(os.Stderr, "garm-check: "+err.Error())
		os.Exit(1)
	}
}

func run(path string) error {
	raw, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	var fds descriptorpb.FileDescriptorSet
	if err := proto.Unmarshal(raw, &fds); err != nil {
		return fmt.Errorf("%s is not a FileDescriptorSet: %w", path, err)
	}
	files, err := protodesc.NewFiles(&fds)
	if err != nil {
		return fmt.Errorf("%s does not resolve: %w", path, err)
	}

	set, err := declared.From(files)
	if err != nil {
		return err
	}

	bad := set.Unresolved()
	if len(bad) > 0 {
		for _, u := range bad {
			fmt.Fprintln(os.Stderr, "  "+u.String())
		}
		// "1 allowlist entry names" / "2 allowlist entries name" -- both halves
		// agree, because a diagnostic a reader stumbles over is one they trust
		// slightly less, and this one is delivering bad news already.
		return fmt.Errorf("%d allowlist %s a tool nothing declares", len(bad),
			plural(len(bad), "entry names", "entries name"))
	}

	// Say what was checked, not just that it passed. A green line that does not
	// name a number is indistinguishable from a check that found nothing to do,
	// and this estate has seen several of those.
	agents := 0
	for _, t := range set.Tools() {
		if t.IsAgent() {
			agents++
		}
	}
	fmt.Printf("ok: %d tools declared, %d of them agents, every allowlist entry resolves\n",
		len(set.Tools()), agents)
	return nil
}

func plural(n int, one, many string) string {
	if n == 1 {
		return one
	}
	return many
}
