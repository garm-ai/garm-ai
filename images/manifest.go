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

	// SHA256 is the hex digest the fetched bytes must have.
	//
	// REQUIRED for remote schemes, optional for `file://`, and the asymmetry
	// matches where the trust boundary is. An s3 object and a release asset can
	// both be replaced in place, so without a digest "resolve from tag v1.2.0"
	// means "whatever is at that URL today" -- which is not a pin, it is a hope.
	// A local file is already in your tree and under the same review as the code.
	//
	// One rule everywhere would be tidier and worse: a digest to update on every
	// local rebuild is friction people route around, and a rule people route
	// around is weaker than one scoped to where it matters.
	SHA256 string `yaml:"sha256"`
}

// remote reports whether this image comes from somewhere the repository does not
// control, and therefore needs a digest.
func (i Image) remote() bool {
	return strings.HasPrefix(i.URI, "s3://") || strings.HasPrefix(i.URI, "https://")
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
	for _, img := range m.Images {
		if img.remote() && img.SHA256 == "" {
			return nil, "", fmt.Errorf("%s: %s needs a sha256 -- a remote object can be "+
				"replaced in place, so without one this pins a location and not bytes",
				path, img.URI)
		}
		if img.SHA256 != "" && !isHex64(img.SHA256) {
			return nil, "", fmt.Errorf("%s: %s has sha256 %q, which is not 64 hex characters",
				path, img.URI, img.SHA256)
		}
	}
	return &m, filepath.Dir(path), nil
}

// isHex64 reports whether s is exactly 64 lowercase hex characters -- the shape
// of a sha256. Checked at load rather than at fetch, so a typo is caught before
// anything is downloaded.
func isHex64(s string) bool {
	if len(s) != 64 {
		return false
	}
	for _, c := range s {
		if (c < '0' || c > '9') && (c < 'a' || c > 'f') {
			return false
		}
	}
	return true
}
