// Package declared answers questions about what a set of protos declares.
//
// It exists as ONE package, importable by anything, because the single most
// expensive structural bug in the estate this replaces was two implementations
// of one idea. A CEL dialect lived in the runner's `internal/celenv` and the
// CLI's compiler carried its own copy; they resolved protobuf types by
// different mechanisms, nothing tested that they agreed, and a guard could lint
// clean at publish and fail at load. A linter and a gateway must answer "is
// this allowlist entry valid?" identically, so there is one place that answers.
//
// Deliberately NOT called `catalogue`: in the previous estate that word meant a
// built artefact with provenance, digests and a build pipeline. This is a view
// over descriptors, and borrowing the name would import the concept.
package declared

import (
	"fmt"
	"sort"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/reflect/protoregistry"

	toolv1 "github.com/garm-ai/garm-ai/garm/tool/v1"
)

// DuplicateName is two tools claiming one name.
//
// It carries both ADDRESSES because the name alone says neither, and a human
// fixing this has to know which two declarations to open. A caller that knows
// which image each file came from can turn those into two repositories.
type DuplicateName struct {
	Name          string
	First, Second protoreflect.MethodDescriptor
}

func (e *DuplicateName) Error() string {
	return fmt.Sprintf("two tools declare the name %q: %s and %s",
		e.Name, e.First.FullName(), e.Second.FullName())
}

// Tool is one declaration, with its identity and its address kept distinct by
// the type itself.
//
// That separation is not decoration. Two of the most expensive bugs in the
// previous estate were a thing having both a declared name and a proto full
// name, both used as identity in different places, and a component passing one
// where another expected the other. Here the field names say which is which, so
// a reader reaching for the wrong one has to ignore the label to do it.
type Tool struct {
	// Name is the identity. Policy keys on it, allowlists cite it, logs name it.
	Name string

	// Method is the ADDRESS -- where the declaration lives. Useful for a
	// diagnostic that has to tell a human which file to open, and never an
	// identity.
	Method protoreflect.MethodDescriptor

	// Agent is nil when a service answers this tool itself, and non-nil when a
	// runner answers it. That is the whole of what "an agent" is.
	Agent *toolv1.Agent
}

// IsAgent reports whether a runner answers this tool rather than a service.
func (t Tool) IsAgent() bool { return t.Agent != nil }

// Set is every tool a descriptor set declares, indexed by name.
type Set struct {
	byName map[string]Tool
}

// From indexes every tool declaration reachable from files.
//
// It FAILS on a duplicate name rather than reporting it as a finding, because a
// name resolving to one thing is the premise everything else rests on: an
// allowlist entry, a policy key, a ledger row. An ambiguous index is not a Set
// with a problem, it is not a Set.
//
// This is also where the uniqueness rule lands. An earlier step recorded it as
// "needs a lint rule"; it is not a rule, it is a precondition for indexing, and
// putting it here means no separate check can be forgotten or skipped.
func From(files *protoregistry.Files) (*Set, error) {
	var fds []protoreflect.FileDescriptor
	files.RangeFiles(func(fd protoreflect.FileDescriptor) bool {
		fds = append(fds, fd)
		return true
	})
	// Sorted because RangeFiles does not promise an order, and a DuplicateName
	// names a First and a Second. Without this, which of two colliding
	// declarations is called "first" varies between runs of the same check --
	// and a diagnostic that moves is one nobody trusts.
	sort.Slice(fds, func(i, j int) bool { return fds[i].Path() < fds[j].Path() })
	return FromFiles(fds)
}

// FromFiles indexes every tool declaration in fds, in the order given.
//
// This is the entry point for a caller that already holds descriptors and no
// registry -- a protoc plugin, which is handed exactly the files of one compile
// unit. It is the SAME indexing From performs, rather than a second
// implementation of it, because the duplicate-name rule has to mean the same
// thing to the generator and to compose. The estate this replaces had one idea
// implemented twice and a tree that linted clean then failed at load.
//
// What it CANNOT do is see beyond fds. A plugin run over one directory does not
// know what the rest of a composed set declares, so a Set built here answers
// "do these files hold a collision?" and never "is this name unique?". That
// second question belongs to whatever holds every image, and only there.
func FromFiles(fds []protoreflect.FileDescriptor) (*Set, error) {
	s := &Set{byName: map[string]Tool{}}
	for _, fd := range fds {
		for i := 0; i < fd.Services().Len(); i++ {
			sd := fd.Services().Get(i)
			for j := 0; j < sd.Methods().Len(); j++ {
				md := sd.Methods().Get(j)
				t, ok := ToolOf(md)
				if !ok {
					continue
				}
				if prev, clash := s.byName[t.Name]; clash {
					// A TYPED error carrying both descriptors, not a formatted
					// string. When tool definitions come from different
					// repositories the useful message names two IMAGES -- and
					// therefore two teams -- which only a caller holding the
					// merge's provenance can say. Structured here, presented at
					// the edge.
					return nil, &DuplicateName{Name: t.Name, First: prev.Method, Second: t.Method}
				}
				s.byName[t.Name] = t
			}
		}
	}
	return s, nil
}

// ToolOf reads the option off a method descriptor -- the way every real consumer
// must, rather than from a struct a caller filled in.
//
// Exported because it is the ONLY place the option is read. A generator, a
// linter and a gateway each need the answer, and the moment a second one reaches
// for proto.GetExtension itself they can disagree about what counts as a
// declaration. They disagree here or not at all.
//
// A tool with an empty name is treated as no declaration at all: a name is the
// one thing a tool cannot be useful without, and silently indexing "" would make
// every such tool collide with every other.
func ToolOf(md protoreflect.MethodDescriptor) (Tool, bool) {
	ext := proto.GetExtension(md.Options(), toolv1.E_Tool)
	tool, ok := ext.(*toolv1.Tool)
	if !ok || tool == nil || tool.GetName() == "" {
		return Tool{}, false
	}
	return Tool{Name: tool.GetName(), Method: md, Agent: tool.GetAgent()}, true
}

// Tool returns the declaration for name.
func (s *Set) Tool(name string) (Tool, bool) {
	t, ok := s.byName[name]
	return t, ok
}

// Tools returns every declaration, ordered by name so that two runs over the
// same input produce the same output. A diagnostic whose order depends on map
// iteration is a diagnostic nobody can diff.
func (s *Set) Tools() []Tool {
	out := make([]Tool, 0, len(s.byName))
	for _, t := range s.byName {
		out = append(out, t)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
	return out
}

// Unresolved is an allowlist entry naming a tool nothing declares.
type Unresolved struct {
	// Agent is the name of the agent whose allowlist carries the entry.
	Agent string
	// Tool is the entry that resolves to nothing.
	Tool string
	// Method is the agent's address, so a diagnostic can name a file.
	Method protoreflect.MethodDescriptor
}

func (u Unresolved) String() string {
	return fmt.Sprintf("%s: allowlist names %q, which no tool declares (%s)",
		u.Agent, u.Tool, u.Method.FullName())
}

// Unresolved returns every allowlist entry that names a tool this Set does not
// declare.
//
// This is the first enforcement of the property the contract asserts: the
// allowlist is the only authority on what a run may call. An entry naming
// nothing is not a smaller authority -- it is an agent that will fail at the
// first call, found at publish instead.
func (s *Set) Unresolved() []Unresolved {
	var out []Unresolved
	for _, t := range s.Tools() {
		if !t.IsAgent() {
			continue
		}
		for _, ref := range t.Agent.GetTools() {
			if _, ok := s.byName[ref.GetName()]; !ok {
				out = append(out, Unresolved{Agent: t.Name, Tool: ref.GetName(), Method: t.Method})
			}
		}
	}
	return out
}
