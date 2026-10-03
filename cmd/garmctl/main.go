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
	"fmt"
	"os"
)

func main() {
	if err := root().Execute(); err != nil {
		// SilenceErrors is set on the root, so cobra prints NOTHING and this is
		// the only place an error reaches the user. An earlier revision of this
		// function carried a comment claiming cobra had already printed it, and
		// printed a bare newline instead -- so `garmctl compose x --nonsense`
		// exited 1 in silence. The config contradicted its own comment, which is
		// the exact failure mode this repository was started to stop repeating.
		fmt.Fprintln(os.Stderr, "garmctl: "+err.Error())
		os.Exit(1)
	}
}
