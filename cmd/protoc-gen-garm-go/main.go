// protoc-gen-garm-go emits the transport glue for every tool a proto declares.
//
// Named by protoc's convention so that `buf generate` can invoke it as a local
// plugin, which is the whole reason it is a plugin rather than a garmctl
// subcommand: `buf generate` is already the one way Go is produced in a tree, and
// `gen-check` already proves the committed output is current. A second command
// would be a second resolver, covered by nothing.
//
// It decides nothing. internal/generate does; this reads stdin and writes stdout.
package main

import (
	"google.golang.org/protobuf/compiler/protogen"

	"github.com/garm-ai/garm-ai/internal/generate"
)

func main() {
	protogen.Options{}.Run(generate.Run)
}
