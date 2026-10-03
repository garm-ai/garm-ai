package images

import (
	"bytes"
	"fmt"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/descriptorpb"
)

// Merged is one namespace assembled from several images, plus where every file
// came from.
type Merged struct {
	Set *descriptorpb.FileDescriptorSet

	// Source maps a file's proto path to the URI of the image it was taken from.
	// This is what lets a name collision be reported as two REPOSITORIES rather
	// than two file paths -- the only form of that message a stranger can act on.
	Source map[string]string

	// Shared records files that appeared in more than one image with IDENTICAL
	// bytes. Normal and uninteresting: every image carries its own copy of
	// descriptor.proto and of the garm contract, because buf includes
	// dependencies.
	Shared []string
}

// Divergent is one file path carrying different bytes in two images.
type Divergent struct {
	Path     string
	URIs     [2]string
}

func (d Divergent) Error() string {
	return fmt.Sprintf("%s differs between %s and %s", d.Path, d.URIs[0], d.URIs[1])
}

// Merge assembles several images into one descriptor set.
//
// Deduplication by file path is not optional: protodesc.NewFiles refuses a set
// containing a path twice, and every image carries its own copy of the shared
// dependencies, so a naive concatenation of two images always fails.
//
// A file appearing twice with DIFFERENT bytes is refused. That is version skew
// between two teams on one shared contract file, and taking either copy silently
// would mean one team's tools get read against a contract they never compiled
// against. Note what this does NOT refuse: a team on a different version of the
// contract whose own copy is self-consistent. Protobuf's extension rules already
// handle that -- a field the reader does not know lands in unknown fields, a
// field it expects and does not get reads as zero -- so cross-version tool
// DEFINITIONS compose without ceremony. What needs the bytes to agree is a later
// concern: a gateway marshalling a request a tool must unmarshal.
func Merge(fetched []Fetched) (*Merged, error) {
	m := &Merged{
		Set:    &descriptorpb.FileDescriptorSet{},
		Source: map[string]string{},
	}
	raw := map[string][]byte{}
	for _, f := range fetched {
		for _, fd := range f.Set.File {
			path := fd.GetName()
			encoded, err := proto.Marshal(fd)
			if err != nil {
				return nil, fmt.Errorf("%s: re-encoding %s: %w", f.URI, path, err)
			}
			prev, seen := raw[path]
			if !seen {
				raw[path] = encoded
				m.Source[path] = f.URI
				m.Set.File = append(m.Set.File, fd)
				continue
			}
			if !bytes.Equal(prev, encoded) {
				return nil, Divergent{Path: path, URIs: [2]string{m.Source[path], f.URI}}
			}
			m.Shared = append(m.Shared, path)
		}
	}
	return m, nil
}
