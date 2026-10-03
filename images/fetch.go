package images

import (
	"context"
	"fmt"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/descriptorpb"

	"github.com/garm-ai/garm-ai/fetch"
)

// Fetched is one image's bytes and where they came from, so a later diagnostic
// can name a SOURCE rather than a file path. When tool definitions come from
// different repositories, "two tools declare this name" is only actionable if it
// says which two images -- and therefore which two teams.
type Fetched struct {
	URI string
	Set *descriptorpb.FileDescriptorSet
}

// Fetch resolves every image in the manifest, relative to dir, using the real
// clients. The common case.
func Fetch(m *Manifest, dir string) ([]Fetched, error) {
	return FetchWith(context.Background(), &fetch.Resolver{Dir: dir}, m)
}

// FetchWith resolves every image the manifest names, using the given resolver.
//
// The resolver is a parameter rather than a field so that `images` holds no
// transport configuration of its own: what a manifest MEANS is this package's
// business, and where bytes come from is fetch's.
func FetchWith(ctx context.Context, r *fetch.Resolver, m *Manifest) ([]Fetched, error) {
	out := make([]Fetched, 0, len(m.Images))
	for _, img := range m.Images {
		raw, err := r.Get(ctx, fetch.Artefact{URI: img.URI, SHA256: img.SHA256})
		if err != nil {
			return nil, err
		}
		var set descriptorpb.FileDescriptorSet
		if err := proto.Unmarshal(raw, &set); err != nil {
			return nil, fmt.Errorf("%s is not a FileDescriptorSet: %w", img.URI, err)
		}
		out = append(out, Fetched{URI: img.URI, Set: &set})
	}
	return out, nil
}
