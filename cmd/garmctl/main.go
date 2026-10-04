// garmctl is the one command.
//
// Named garmctl rather than garm because the estate this replaces publishes a
// `garm` binary, and during any migration both would be on PATH. The module
// paths differ so Go is untroubled; a shell is not.
//
// Cobra rather than hand-rolled parsing, and the reason is worth recording
// because it is not "more commands are coming". The hand-rolled version this
// replaces silently swallowed unknown flags as positional arguments, did not
// support `-o=value`, and answered `--help` with:
//
//	garm-compose: open --help: no such file or directory
//
// It tried to read `--help` as a manifest. That is not a thin tool, it is an
// unfinished one, and the small hostilities are what make a tool feel that way.
package main

import (
	"context"
	"fmt"
	"os"

	"github.com/garm-ai/garm-ai/serve"
)

func main() {
	err := root().Execute()
	// Flush before deciding the exit code: a `garmctl call` that failed is exactly
	// the span somebody wants to see.
	_ = stopTelemetry(context.Background())
	if err != nil {
		// SilenceErrors is set on the root, so cobra prints NOTHING and this is
		// the only place an error reaches the user. An earlier revision of this
		// function carried a comment claiming cobra had already printed it, and
		// printed a bare newline instead -- so `garmctl compose x --nonsense`
		// exited 1 in silence. The config contradicted its own comment, which is
		// the exact failure mode this repository was started to stop repeating.
		//
		// serve.Describe puts the KIND first when there is one, which is what a
		// person decides on: retry, fix what was typed, or go and deploy
		// something. Here rather than in `call` because every subcommand that
		// reaches a service wants it, and `call` had its own copy that reached it
		// by calling os.Exit from inside a function holding two defers.
		fmt.Fprintln(os.Stderr, "garmctl: "+serve.Describe(err))
		os.Exit(1)
	}
}
