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
	"regexp"
	"sort"
	"strings"
	"time"

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

	// Agent is nil when a service answers this tool itself, and non-nil when rund
	// runs it, asking a decider what to do next. That is the whole of what "an
	// agent" is.
	Agent *toolv1.Agent

	// Sync and Async are the two arms of the delivery oneof, and exactly one
	// should be set. BOTH NIL IS A DECLARATION THAT FORGOT TO SAY, which
	// DeliveryProblems refuses -- silence must not quietly become either.
	Sync  *toolv1.Sync
	Async *toolv1.Async

	// Requires is every compartment a caller must hold, in declaration order.
	// Empty is a tool that asks nothing -- which is not the same as a tool
	// anyone may call: a grant must still admit it (authority spec §1.1).
	Requires []string
}

// IsAgent reports whether rund runs this tool with a decider, rather than a service
// answering it.
func (t Tool) IsAgent() bool { return t.Agent != nil }

// IsSync reports whether the answer comes back within the call.
func (t Tool) IsSync() bool { return t.Sync != nil }

// Budget is how long ONE CALL to this tool has: a sync tool's budget, which its
// caller waits out, or an async tool's limit, which rund applies when it calls
// the handler from the run's queue. Zero for an agent -- nothing calls an
// agent's handler -- which is why a caller checks IsSync rather than comparing
// to zero.
func (t Tool) Budget() time.Duration {
	switch {
	case t.Sync != nil:
		return t.Sync.GetBudget().AsDuration()
	case t.Async != nil && !t.IsAgent():
		return t.Async.GetLimit().AsDuration()
	}
	return 0
}

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
				// Validated before indexing, for the same reason duplicates are:
				// an index keyed on a name that cannot be used as one is not a
				// Set with a problem.
				if err := validateName(t); err != nil {
					return nil, err
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
	return Tool{
		Name:     tool.GetName(),
		Method:   md,
		Agent:    tool.GetAgent(),
		Sync:     tool.GetSync(),
		Async:    tool.GetAsync(),
		Requires: append([]string(nil), tool.GetRequires().GetCompartments()...),
	}, true
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

// InvalidName is a declared name that cannot be used as one.
//
// It carries the ADDRESS, because the name is the thing that is wrong and
// repeating it is not where a human has to go to fix it.
type InvalidName struct {
	Name   string
	Reason string
	Method protoreflect.MethodDescriptor
}

func (e *InvalidName) Error() string {
	return fmt.Sprintf("the tool name %q is not usable: %s (declared at %s)",
		e.Name, e.Reason, e.Method.FullName())
}

// nameToken is one dot-separated segment of a tool name.
//
// The charset is NOT derived from any transport, and that matters: a name is an
// identifier that ends up in a policy key, a log line, a metric label, a URL path
// and a subject on a message broker. Choosing the intersection of what those all
// accept, once, is cheaper than discovering each one separately -- and far cheaper
// than the alternative found while designing the NATS transport, below.
var nameToken = regexp.MustCompile(`^[A-Za-z0-9_-]+$`)

// validateName refuses a name that cannot safely be used as an identity.
//
// # Why this is a security rule and not a tidiness rule
//
// NATS treats `*` and `>` as subscription wildcards. A tool named `a.*.b` becomes
// a subject containing a wildcard, and the service mounting it would receive OTHER
// TOOLS' REQUESTS -- a confused-deputy hole opened by a name nobody checked.
//
// Nothing downstream catches it. NATS micro's own subject validation is
// `^[^ >]*[>]?$`, which rejects a space and a bare `>` and happily accepts `*`
// and an empty token. So micro is not the backstop, and a transport that trusted
// it would mount the wildcard without complaint.
//
// # Why it lives here rather than in the transport
//
// Because it fails at COMPOSE, in CI, with somebody to tell -- rather than at
// service start, which is the shape of failure this repository keeps choosing
// against. The rule is justified on its own terms (see nameToken) and the
// transport gets its safety as a consequence rather than owning the rule.
//
// What is still NOT enforced is the SHAPE. `<package>.<tool>` remains a
// convention; only the charset is a rule. Enforcing the shape needs a decision
// about what a package is that nobody has made.
func validateName(t Tool) error {
	reason := nameReason(t.Name)
	if reason == "" {
		return nil
	}
	return &InvalidName{Name: t.Name, Reason: reason, Method: t.Method}
}

// nameReason returns why a name is unusable, or "" when it is fine. Split out so
// the reason is a value a test can assert on rather than a substring of a
// formatted error.
func nameReason(name string) string {
	// An empty name is not reported here: ToolOf treats it as no declaration at
	// all, so it never reaches this function.
	for _, segment := range strings.Split(name, ".") {
		if segment == "" {
			return "it has an empty segment, so it would address nothing"
		}
		if segment == "*" || segment == ">" || strings.ContainsAny(segment, "*>") {
			// Named explicitly rather than folded into the charset message,
			// because this one is not a style complaint: it is the case that
			// silently intercepts other tools' traffic.
			return "it contains a message-broker wildcard, which would intercept other tools' calls"
		}
		if !nameToken.MatchString(segment) {
			return "each dot-separated segment must be one or more of A-Z a-z 0-9 _ -"
		}
	}
	return ""
}

// DeliveryProblem is a tool whose delivery declaration cannot be acted on.
//
// A finding rather than a hard error, the same shape as Unresolved: these are
// judgements about a composed namespace, and the caller holding the images is the
// one that can say which repository to open.
type DeliveryProblem struct {
	Tool   string
	Reason string
	Method protoreflect.MethodDescriptor
}

func (p DeliveryProblem) String() string {
	return fmt.Sprintf("%s: %s (declared at %s)", p.Tool, p.Reason, p.Method.FullName())
}

// DeliveryProblems returns every tool whose delivery cannot be acted on.
//
// # Three refusals, and each one can actually fire
//
// A fifth was specified and dropped before it was written: "an agent whose budget
// is below the largest in its allowlist". An agent may never be Sync and has no
// call limit of its own, so that check could never fire -- and a check that
// cannot fail is worse than no check, because it reads as a guarantee. It
// becomes real when a RUN limit arrives with a decider, and the spec says so
// there instead.
func (s *Set) DeliveryProblems() []DeliveryProblem {
	var out []DeliveryProblem
	for _, t := range s.Tools() {
		switch {
		// Silence must not become a default. A caller of a sync tool waits for an
		// answer; a caller of an async one holds a receipt. Guessing which, on
		// behalf of an author who said nothing, is how a caller ends up waiting
		// forever for an answer that was never coming.
		case t.Sync == nil && t.Async == nil:
			out = append(out, DeliveryProblem{t.Name, "declares no delivery: say sync or async", t.Method})

		// Both decider kinds are durable by definition, so an agent cannot
		// complete inside a call. This was a comment in an example until now.
		case t.IsAgent() && t.IsSync():
			out = append(out, DeliveryProblem{t.Name,
				"is an agent and declares sync: an agent is durable and cannot complete inside a call", t.Method})

		// A sync tool with no budget leaves a caller no deadline but one it
		// invented, which is the guessing this field exists to end.
		case t.IsSync() && t.Budget() <= 0:
			out = append(out, DeliveryProblem{t.Name,
				"declares sync with no positive budget: a caller would have to invent a deadline", t.Method})

		// An async tool is still one call to a handler, made by rund from the
		// queue; a limit rund invented would be retried into duplicate work.
		case !t.IsSync() && !t.IsAgent() && t.Budget() <= 0:
			out = append(out, DeliveryProblem{t.Name,
				"declares async with no positive limit: rund would have to invent how long a call to it may take", t.Method})
		}
	}
	return out
}
