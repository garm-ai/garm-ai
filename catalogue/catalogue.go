// Package catalogue loads the verified namespace a rund serves, and holds it as
// an IMMUTABLE value.
//
// # Why immutable, before anything needs it to be
//
// A catalogue will one day be swapped while calls are in flight. Everything that
// makes that safe is a property of how it is held, not of the swapping code:
//
//   - the value is never mutated in place, so a reader cannot observe a half-made
//     one;
//   - a call takes ONE snapshot at entry and uses it for its whole life, so it
//     cannot resolve a name against one version and read a budget from the next;
//   - the digest is carried on the value, so "which catalogue is this replica
//     serving" is an answerable question rather than a hope.
//
// None of that costs anything today. Retrofitting it would mean auditing every
// read, which is the kind of change nobody finishes.
//
// One earlier choice is what makes any of this possible and is worth protecting:
// `declared.From` takes a *protoregistry.Files PARAMETER and never touches
// protoregistry.GlobalFiles. The global is process-wide and effectively
// unswappable; reaching for it would have closed this door permanently.
package catalogue

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sync/atomic"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protodesc"
	"google.golang.org/protobuf/reflect/protoregistry"
	"google.golang.org/protobuf/types/descriptorpb"

	"github.com/garm-ai/garm-ai/declared"
	"github.com/garm-ai/garm-ai/fetch"
)

// Catalogue is one verified namespace. Treat every field as read-only.
type Catalogue struct {
	// Files resolves the descriptors, and is this catalogue's OWN registry rather
	// than the process-global one.
	Files *protoregistry.Files

	// Tools is what the namespace declares, indexed by name.
	Tools *declared.Set

	// SHA256 is the digest of the bytes loaded. It is the VERSION IDENTIFIER as
	// much as an integrity check: a run that outlives a reload has to be resolved
	// against the catalogue it started under, and this is how that is said.
	SHA256 string

	// Source is where the bytes came from, for the line logged at startup.
	Source string
}

// Tool resolves a declared NAME. The one lookup rund does per call, so it is here
// rather than making every caller reach through to the Set.
func (c *Catalogue) Tool(name string) (declared.Tool, bool) { return c.Tools.Tool(name) }

// Load fetches, verifies and checks one catalogue.
//
// # It re-runs the checks compose already ran, deliberately
//
// Not paranoia about the artefact: compose may have run with an OLDER BINARY that
// lacked a rule added since. Running today's rules over the bytes catches a
// catalogue that was valid when it was built and is not now -- which is the class
// the estate this replaces took a plane down with.
//
// It costs nothing: the same `declared` code, over a set already in memory.
//
// This is also THE RELOAD PATH. A future hot reload calls exactly this and swaps
// the pointer only if it returns nil -- so a bad catalogue leaves the old one
// serving, and there is one implementation of "is this loadable" rather than two.
func Load(ctx context.Context, r *fetch.Resolver, a fetch.Artefact) (*Catalogue, error) {
	raw, err := r.Get(ctx, a)
	if err != nil {
		return nil, fmt.Errorf("fetching the catalogue: %w", err)
	}
	sum := sha256.Sum256(raw)

	var set descriptorpb.FileDescriptorSet
	if err := proto.Unmarshal(raw, &set); err != nil {
		return nil, fmt.Errorf("%s is not a FileDescriptorSet: %w", a.URI, err)
	}
	files, err := protodesc.NewFiles(&set)
	if err != nil {
		return nil, fmt.Errorf("%s does not resolve: %w", a.URI, err)
	}
	tools, err := declared.From(files)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", a.URI, err)
	}
	if bad := tools.DeliveryProblems(); len(bad) > 0 {
		return nil, fmt.Errorf("%s: %s", a.URI, bad[0])
	}
	if bad := tools.Unresolved(); len(bad) > 0 {
		return nil, fmt.Errorf("%s: %s", a.URI, bad[0])
	}
	return &Catalogue{
		Files:  files,
		Tools:  tools,
		SHA256: hex.EncodeToString(sum[:]),
		Source: a.URI,
	}, nil
}

// Holder is the swappable slot a server reads from.
//
// An atomic pointer rather than a mutex: a reader takes a snapshot and never
// blocks, and a writer publishes a wholly-built value. The swap itself does not
// exist yet -- Set is called once at boot -- but every read in rund already goes
// through Current(), so adding a trigger later changes one function rather than
// every call site.
type Holder struct{ p atomic.Pointer[Catalogue] }

// Current returns the catalogue to use for one call, start to finish.
//
// CALL IT ONCE PER CALL. Calling it twice invites resolving a name against one
// version and reading a budget from the next -- the exact tear this type exists
// to prevent.
func (h *Holder) Current() *Catalogue { return h.p.Load() }

// Set publishes a catalogue. The previous one stays valid for any call already
// holding it, which is what makes an in-flight swap safe.
func (h *Holder) Set(c *Catalogue) { h.p.Store(c) }
