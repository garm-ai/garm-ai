// Package images turns a list of built proto images into one verified artefact.
//
// Why an artefact at all, rather than a gateway merging images at startup: the
// merge is where a cross-repo name collision is discovered, and discovery should
// happen in CI with somebody to tell. Tool definitions live in different
// repositories, built by different teams at different times, and nothing
// coordinates naming between them -- so two teams can each declare
// `accounts.v1.get_customer` and neither will know. If the gateway merges at
// boot, that collision takes the plane down in production. The previous estate
// had a descriptor mismatch do exactly that, and its own catalogue manifest
// records the date.
//
// So: one merge, at build time, into one artefact a gateway loads whole.
package images

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v3"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/descriptorpb"
)

// Manifest is images.yaml: which built images compose into one namespace.
type Manifest struct {
	Schema string  `yaml:"schema"`
	Images []Image `yaml:"images"`
}

// Schema is the only value Manifest.Schema may hold.
const Schema = "v1"

// Image is one place to get a built descriptor set.
type Image struct {
	// URI is where the bytes are. Only `file://` resolves today.
	//
	// A URI rather than per-scheme fields (`file:`, `s3:`, `git:`) so that a new
	// source is a new fetcher and not a schema change. `s3://` and `https://`
	// are the next two, and a git tag arrives as an `https://` release asset --
	// which already encodes the tag, needs no git client, and works for anything
	// on a forge.
	URI string `yaml:"uri"`

	// SHA256 is not read yet and is therefore not declared. When a remote
	// fetcher lands it becomes REQUIRED for remote schemes and optional for
	// local ones, because an s3 object or a release asset can be replaced in
	// place -- so without it, "resolve from tag v1.2.0" means "whatever is there
	// today" -- while a local file is already in your tree and under review.
	//
	// Deliberately absent until then: this repository's rule is that a field
	// arrives with the thing that enforces it, and a digest nothing verifies is
	// a promise that reads like a guarantee.
}

// Load reads a manifest. Paths inside it resolve against the manifest's own
// directory, so a manifest is movable as a unit.
func Load(path string) (*Manifest, string, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, "", err
	}
	var m Manifest
	if err := yaml.Unmarshal(raw, &m); err != nil {
		return nil, "", fmt.Errorf("%s: %w", path, err)
	}
	if m.Schema != Schema {
		return nil, "", fmt.Errorf("%s: schema is %q, want %q", path, m.Schema, Schema)
	}
	if len(m.Images) == 0 {
		return nil, "", fmt.Errorf("%s: declares no images, so there is nothing to compose", path)
	}
	return &m, filepath.Dir(path), nil
}

// Fetched is one image's bytes and where they came from, so a later diagnostic
// can name a SOURCE rather than a file path. When tool definitions come from
// different repositories, "two tools declare this name" is only actionable if it
// says which two images -- and therefore which two teams.
type Fetched struct {
	URI string
	Set *descriptorpb.FileDescriptorSet
}

// Fetch resolves every image in the manifest, relative to dir.
func Fetch(m *Manifest, dir string) ([]Fetched, error) {
	out := make([]Fetched, 0, len(m.Images))
	for _, img := range m.Images {
		set, err := fetchOne(img.URI, dir)
		if err != nil {
			return nil, err
		}
		out = append(out, Fetched{URI: img.URI, Set: set})
	}
	return out, nil
}

func fetchOne(uri, dir string) (*descriptorpb.FileDescriptorSet, error) {
	rest, ok := strings.CutPrefix(uri, "file://")
	if !ok {
		// Named schemes rather than a generic "unsupported": a reader who wrote
		// `s3://` deserves to know it is coming rather than that it is wrong.
		return nil, fmt.Errorf("%s: only file:// resolves today; s3:// and https:// are next", uri)
	}
	path := rest
	if !filepath.IsAbs(path) {
		path = filepath.Join(dir, rest)
	}
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", uri, err)
	}
	var set descriptorpb.FileDescriptorSet
	if err := proto.Unmarshal(raw, &set); err != nil {
		return nil, fmt.Errorf("%s is not a FileDescriptorSet: %w", uri, err)
	}
	return &set, nil
}
