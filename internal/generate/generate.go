// Package generate emits the transport glue for every tool a proto declares.
//
// # What it emits, and the one rule about what it may not
//
// Per service with at least one tool: a handler interface, a Serve function, and
// the list of names that service answers. Nothing else, ever.
//
// The estate this replaces had a generator that started here and did not stop.
// Cards arrived later and were welded in, so one tool's generated file reached
// 230 lines of which the tool was about 25: an optional override interface, a
// package-level sync.Map, a reflective descriptor lookup, two default card
// implementations and two extra mounted endpoints. Every consumer repository
// carried all of it, regenerated, forever.
//
// So the rule, and it is not a preference: THE GENERATOR CARRIES NO POLICY
// OPINION. It marshals, type-asserts, dispatches and registers. Anything that
// decides something is a library a handler calls, and the decision to put it in
// generated text instead is the decision to put it in every repository.
//
// # What it deliberately does not do
//
// It does not check that a name is unique across a composed set, because it
// cannot see one. buf invokes a plugin per module, so a run holds one compile
// unit; a name resolving once across every image is `garmctl compose`'s
// question, and only it has the provenance to say which image a collision came
// from. What this does check is what is in front of it -- two methods in one run
// claiming one name -- which is the same rule, read through the same code, over
// a smaller set.
//
// It does not emit anything for an agent. A tool whose option carries `agent` is
// answered by rund driving a decider, not by the author of the proto, so a method here
// would be one nobody may implement.
package generate

import (
	"fmt"
	"time"

	"google.golang.org/protobuf/compiler/protogen"
	"google.golang.org/protobuf/types/pluginpb"
	"google.golang.org/protobuf/reflect/protoreflect"

	"github.com/garm-ai/garm-ai/declared"
)

// servePackage is this module's serve package, named here because generated code
// imports it. A generator writing an import path is the normal shape -- the text
// is emitted for a build that happens elsewhere, and is not a dependency of this
// package.
const (
	servePackage protogen.GoImportPath = "github.com/garm-ai/garm-ai/serve"
	callPackage  protogen.GoImportPath = "github.com/garm-ai/garm-ai/call"
	runv1Package protogen.GoImportPath = "github.com/garm-ai/garm-ai/garm/run/v1"
)

const (
	timePackage    protogen.GoImportPath = "time"
	contextPackage protogen.GoImportPath = "context"
	fmtPackage     protogen.GoImportPath = "fmt"
	protoPackage   protogen.GoImportPath = "google.golang.org/protobuf/proto"
)

// Run is the whole plugin.
func Run(gen *protogen.Plugin) error {
	// proto3 `optional` (a presence-tracked scalar) is used by garm.run.v1.Progress;
	// a plugin that does not say it understands it is refused by protoc.
	gen.SupportedFeatures = uint64(pluginpb.CodeGeneratorResponse_FEATURE_PROTO3_OPTIONAL)
	// Every file in the request, not only the ones to generate: a dependency
	// declaring a name this module also declares is a real collision inside one
	// compile unit, and the point of checking here is to catch it at build time
	// rather than at compose.
	fds := make([]protoreflect.FileDescriptor, 0, len(gen.Files))
	for _, f := range gen.Files {
		fds = append(fds, f.Desc)
	}
	if _, err := declared.FromFiles(fds); err != nil {
		return err
	}
	for _, f := range gen.Files {
		if !f.Generate {
			continue
		}
		if err := file(gen, f); err != nil {
			return err
		}
	}
	return nil
}

// tool pairs a declared identity with the method that answers it.
type tool struct {
	name   string
	budget time.Duration // a sync tool's budget or an async tool's call limit; zero for an agent
	sync   bool
	method *protogen.Method
}

// service is one service and the tools it answers itself.
type service struct {
	svc   *protogen.Service
	tools []tool
}

func file(gen *protogen.Plugin, f *protogen.File) error {
	var services []service
	for _, s := range f.Services {
		var tools []tool
		for _, m := range s.Methods {
			t, ok := declared.ToolOf(m.Desc)
			if !ok || t.IsAgent() {
				continue
			}
			// A tool is one request and one answer. Refused rather than emitted
			// badly: a streaming method would produce a handler signature that
			// fails to compile, and the author would read a type error about
			// proto.Message instead of the sentence that explains it.
			if m.Desc.IsStreamingClient() || m.Desc.IsStreamingServer() {
				return fmt.Errorf("%s declares the tool %q and streams: a tool is one request and one response",
					m.Desc.FullName(), t.Name)
			}
			tools = append(tools, tool{name: t.Name, budget: t.Budget(), sync: t.IsSync(), method: m})
		}
		if len(tools) > 0 {
			services = append(services, service{svc: s, tools: tools})
		}
	}
	// No file at all rather than an empty one. A proto holding only agents
	// produces no Go, which is what makes "a decider chooses this one's steps" visible in the
	// tree instead of only in a comment.
	if len(services) == 0 {
		return nil
	}

	g := gen.NewGeneratedFile(f.GeneratedFilenamePrefix+"_garm.pb.go", f.GoImportPath)
	g.P("// Code generated by protoc-gen-garm-go. DO NOT EDIT.")
	g.P("// source: ", f.Desc.Path())
	g.P("//")
	// Said once per file, not once per service. A rationale repeated per service
	// is how a generator's output grows without anybody deciding that it should:
	// the text is cheap to add and lands in every consumer repository forever.
	g.P("// Each Handler interface below has NO Unimplemented embed, and that is the")
	g.P("// feature. Add a tool to the .proto, forget to implement it, and the build FAILS")
	g.P("// TO COMPILE -- rather than mounting and answering Unimplemented to a real")
	g.P("// caller at run time. The embed grpc-go emits buys source compatibility and")
	g.P("// pays for it with half-implemented services that start cleanly.")
	g.P("//")
	g.P("// A tool whose option carries `agent` appears nowhere here: rund runs it with a decider,")
	g.P("// so a handler method would be one nobody may implement.")
	g.P()
	g.P("package ", f.GoPackageName)
	g.P()
	for _, s := range services {
		handler(g, s)
		names(g, s)
		serve(g, s)
		client(g, s)
	}
	return nil
}

// client emits the typed caller.
//
// A SYNC tool gets one method that answers. An ASYNC tool gets two: one that
// starts the run and returns a call.Ref, one that reads the reference and
// decodes the result once there is one. Flipping a tool's delivery changes the
// signature and every caller FAILS TO COMPILE, which is the whole point of
// declaring delivery at all.
func client(g *protogen.GeneratedFile, s service) {
	if len(s.tools) == 0 {
		return
	}
	name := s.svc.GoName + "Client"
	invoker := g.QualifiedGoIdent(callPackage.Ident("Invoker"))
	options := g.QualifiedGoIdent(callPackage.Ident("Options"))
	deadline := g.QualifiedGoIdent(callPackage.Ident("Deadline"))
	ctxType := g.QualifiedGoIdent(contextPackage.Ident("Context"))
	marshal := g.QualifiedGoIdent(protoPackage.Ident("Marshal"))
	unmarshal := g.QualifiedGoIdent(protoPackage.Ident("Unmarshal"))
	errorf := g.QualifiedGoIdent(fmtPackage.Ident("Errorf"))

	g.P("// ", name, " calls the tools ", s.svc.GoName, " declares, by NAME.")
	g.P("//")
	g.P("// It knows no subject and no broker: it holds a call.Invoker, and which")
	g.P("// transport that is remains the process's business.")
	g.P("type ", name, " struct{ Invoker ", invoker, " }")
	g.P()
	g.P("// New", name, " builds a client over any transport.")
	g.P("func New", name, "(i ", invoker, ") ", name, " { return ", name, "{Invoker: i} }")
	g.P()
	for _, t := range s.tools {
		in := g.QualifiedGoIdent(t.method.Input.GoIdent)
		out := g.QualifiedGoIdent(t.method.Output.GoIdent)
		if t.sync {
			g.P("// ", t.method.GoName, " calls the tool ", strconv(t.name), ".")
			g.P("//")
			g.P("// The deadline is ", t.budget.String(), " -- the budget this tool DECLARED --")
			g.P("// plus the hops. No caller invents a number. A shorter deadline already on")
			g.P("// ctx still wins, because a caller's own patience is its own business.")
			g.P("//")
			g.P("// Only the first Options is used.")
			g.P("func (c ", name, ") ", t.method.GoName, "(ctx ", ctxType, ", in *", in,
				", opts ...", options, ") (*", out, ", error) {")
			g.P("body, err := ", marshal, "(in)")
			g.P("if err != nil {")
			g.P("return nil, ", errorf, "(", strconv(t.name+": marshalling the request: %w"), ", err)")
			g.P("}")
			g.P("var o ", options)
			g.P("if len(opts) > 0 {")
			g.P("o = opts[0]")
			g.P("}")
			g.P("ctx, cancel := ", g.QualifiedGoIdent(contextPackage.Ident("WithTimeout")),
				"(ctx, ", deadline, "(", budgetLiteral(g, t.budget), "))")
			g.P("defer cancel()")
			g.P("answer, err := c.Invoker.Invoke(ctx, ", strconv(t.name), ", body, o)")
			g.P("if err != nil {")
			// The tool's own error, carried through rather than wrapped: wrapping would
			// bury the kind a caller is meant to act on.
			g.P("return nil, err")
			g.P("}")
			g.P("var resp ", out)
			g.P("if err := ", unmarshal, "(answer.GetResult(), &resp); err != nil {")
			g.P("return nil, ", errorf, "(", strconv(t.name+": the answer is not a %T: %w"), ", &resp, err)")
			g.P("}")
			g.P("return &resp, nil")
			g.P("}")
			g.P()
			continue
		}
		ref := g.QualifiedGoIdent(callPackage.Ident("Ref"))
		fetchResp := g.QualifiedGoIdent(runv1Package.Ident("FetchResponse"))
		g.P("// ", t.method.GoName, " starts the async tool ", strconv(t.name), " and returns the run.")
		g.P("//")
		g.P("// An idempotency key is REQUIRED (Options.Idempotency): it becomes the run id,")
		g.P("// so a retry of this call is the same run rather than a second one. Refused")
		g.P("// here, before the wire, when it is missing. The deadline covers only the")
		g.P("// start: the run itself outlives this call. Read it with ", t.method.GoName, "Result.")
		g.P("func (c ", name, ") ", t.method.GoName, "(ctx ", ctxType, ", in *", in,
			", opts ...", options, ") (", ref, ", error) {")
		g.P("var o ", options)
		g.P("if len(opts) > 0 {")
		g.P("o = opts[0]")
		g.P("}")
		g.P("if o.Idempotency == \"\" {")
		g.P("return ", ref, "{}, ", g.QualifiedGoIdent(servePackage.Ident("Invalid")),
			"(", strconv(t.name+" is async: Options.Idempotency is required, and it becomes the run id"), ")")
		g.P("}")
		g.P("body, err := ", marshal, "(in)")
		g.P("if err != nil {")
		g.P("return ", ref, "{}, ", errorf, "(", strconv(t.name+": marshalling the request: %w"), ", err)")
		g.P("}")
		g.P("ctx, cancel := ", g.QualifiedGoIdent(contextPackage.Ident("WithTimeout")),
			"(ctx, ", deadline, "(", g.QualifiedGoIdent(callPackage.Ident("MaxWait")), "))")
		g.P("defer cancel()")
		g.P("answer, err := c.Invoker.Invoke(ctx, ", strconv(t.name), ", body, o)")
		g.P("if err != nil {")
		g.P("return ", ref, "{}, err")
		g.P("}")
		g.P("return ", ref, "{RunID: answer.GetRunId(), Invoker: c.Invoker}, nil")
		g.P("}")
		g.P()
		g.P("// ", t.method.GoName, "Result reads a run ", t.method.GoName, " started, waiting up to wait for an")
		g.P("// ANSWER. A held fetch returns whenever the run changes, a stage change")
		g.P("// included, and a stage is not an answer: the method keeps asking (each ask")
		g.P("// capped by rund) until the run is terminal or wait is spent. While still")
		g.P("// RUNNING the typed result is nil and the response says where the run is;")
		g.P("// once FAILED the error is the tool's own, with its kind; once SUCCEEDED the")
		g.P("// result is decoded.")
		g.P("func (c ", name, ") ", t.method.GoName, "Result(ctx ", ctxType, ", ref ", ref,
			", wait ", g.QualifiedGoIdent(timePackage.Ident("Duration")), ") (*", out, ", *", fetchResp, ", error) {")
		g.P("until := ", g.QualifiedGoIdent(timePackage.Ident("Now")), "().Add(wait)")
		g.P("fetched, err := ref.Fetch(ctx, min(wait, ", g.QualifiedGoIdent(callPackage.Ident("MaxWait")), "))")
		g.P("if err != nil {")
		g.P("return nil, nil, err")
		g.P("}")
		g.P("for fetched.GetState() == ", g.QualifiedGoIdent(runv1Package.Ident("RunState_RUN_STATE_RUNNING")), " && ctx.Err() == nil {")
		g.P("left := ", g.QualifiedGoIdent(timePackage.Ident("Until")), "(until)")
		g.P("if left <= 0 {")
		g.P("break")
		g.P("}")
		g.P("if fetched, err = ref.Fetch(ctx, min(left, ", g.QualifiedGoIdent(callPackage.Ident("MaxWait")), ")); err != nil {")
		g.P("return nil, nil, err")
		g.P("}")
		g.P("}")
		g.P("switch fetched.GetState() {")
		g.P("case ", g.QualifiedGoIdent(runv1Package.Ident("RunState_RUN_STATE_SUCCEEDED")), ":")
		g.P("var resp ", out)
		g.P("if err := ", unmarshal, "(fetched.GetResult(), &resp); err != nil {")
		g.P("return nil, fetched, ", errorf, "(", strconv(t.name+": the answer is not a %T: %w"), ", &resp, err)")
		g.P("}")
		g.P("return &resp, fetched, nil")
		g.P("case ", g.QualifiedGoIdent(runv1Package.Ident("RunState_RUN_STATE_FAILED")), ":")
		g.P("return nil, fetched, ", g.QualifiedGoIdent(servePackage.Ident("FromWire")), "(fetched.GetError())")
		g.P("}")
		g.P("return nil, fetched, nil")
		g.P("}")
		g.P()
	}
}

// handler emits the interface the author implements.
func handler(g *protogen.GeneratedFile, s service) {
	name := s.svc.GoName + "Handler"
	g.P("// ", name, " implements every tool ", s.svc.GoName, " declares, in plain proto")
	g.P("// signatures with no transport wrapper.")
	g.P("type ", name, " interface {")
	for _, t := range s.tools {
		g.P("// ", t.method.GoName, " answers the tool ", strconv(t.name), ".")
		g.P(t.method.GoName, "(", g.QualifiedGoIdent(contextPackage.Ident("Context")), ", *",
			g.QualifiedGoIdent(t.method.Input.GoIdent), ") (*",
			g.QualifiedGoIdent(t.method.Output.GoIdent), ", error)")
	}
	g.P("}")
	g.P()
}

// names emits the identities the service answers.
//
// Identities, not addresses: this is the list a deployment reads to say what it
// serves, and a proto full name would make it the list of where the
// declarations live, which answers a different question.
func names(g *protogen.GeneratedFile, s service) {
	g.P("// ", s.svc.GoName, "Tools is every tool NAME ", s.svc.GoName, " answers, in")
	g.P("// declaration order: identities, never addresses.")
	g.P("var ", s.svc.GoName, "Tools = []string{")
	for _, t := range s.tools {
		g.P(strconv(t.name), ",")
	}
	g.P("}")
	g.P()
}

// serve emits the registration function.
func serve(g *protogen.GeneratedFile, s service) {
	g.P("// Serve", s.svc.GoName, " mounts every tool ", s.svc.GoName, " declares on r. It")
	g.P("// returns on the first failure, having mounted the tools before it, so a")
	g.P("// transport should not announce itself until this has returned nil.")
	g.P("func Serve", s.svc.GoName, "(r ", g.QualifiedGoIdent(servePackage.Ident("Registrar")),
		", h ", s.svc.GoName, "Handler) error {")
	for _, t := range s.tools {
		in := g.QualifiedGoIdent(t.method.Input.GoIdent)
		msg := g.QualifiedGoIdent(protoPackage.Ident("Message"))
		g.P("if err := r.Endpoint(")
		// The declared name, verbatim. Not derived from the method name, not
		// lower-cased, not prefixed with the package: whatever the author wrote
		// is the identity, and a generator that normalised it would make the
		// .proto disagree with the wire.
		g.P(strconv(t.name), ",")
		g.P(strconv(string(t.method.Desc.FullName())), ",")
		// The budget the .proto declared, so the tool enforces its own number
		// rather than one a caller asserted. Zero for anything not Sync.
		g.P(budgetLiteral(g, t.budget), ",")
		g.P("func() ", msg, " { return new(", in, ") },")
		g.P("func(ctx ", g.QualifiedGoIdent(contextPackage.Ident("Context")), ", m ", msg, ") (", msg, ", error) {")
		g.P("in, ok := m.(*", in, ")")
		g.P("if !ok {")
		g.P("return nil, ", g.QualifiedGoIdent(fmtPackage.Ident("Errorf")),
			"(", strconv(t.name+": request is %T, want %T"), ", m, (*", in, ")(nil))")
		g.P("}")
		g.P("out, err := h.", t.method.GoName, "(ctx, in)")
		g.P("if err != nil {")
		g.P("return nil, err")
		g.P("}")
		// A nil response with a nil error, caught here rather than at the
		// transport. Marshalling a nil message yields an empty one, which reaches
		// the caller as a successful answer to a call nobody answered.
		g.P("if out == nil {")
		g.P("return nil, ", g.QualifiedGoIdent(fmtPackage.Ident("Errorf")),
			"(", strconv(t.name+": handler returned no response and no error"), ")")
		g.P("}")
		g.P("return out, nil")
		g.P("},")
		g.P("); err != nil {")
		g.P("return err")
		g.P("}")
	}
	g.P("return nil")
	g.P("}")
	g.P()
}

// budgetLiteral writes a Duration a human can check against the .proto.
//
// `5 * time.Second`, not 5000000000: generated code is read, and a reader
// comparing it to a declaration should not have to divide.
func budgetLiteral(g *protogen.GeneratedFile, d time.Duration) string {
	if d == 0 {
		return "0"
	}
	for _, u := range []struct {
		d    time.Duration
		name string
	}{
		{time.Hour, "Hour"}, {time.Minute, "Minute"},
		{time.Second, "Second"}, {time.Millisecond, "Millisecond"},
	} {
		if d%u.d == 0 {
			unit := g.QualifiedGoIdent(timePackage.Ident(u.name))
			if n := int64(d / u.d); n == 1 {
				return unit
			} else {
				return fmt.Sprintf("%d * %s", n, unit)
			}
		}
	}
	// Nothing divides evenly, so say it exactly rather than approximately.
	return fmt.Sprintf("%s(%d)", g.QualifiedGoIdent(timePackage.Ident("Duration")), int64(d))
}

// strconv quotes a Go string literal. Named for what it does rather than
// imported, so that a reader of the emit functions sees a quoted literal and not
// a package call in the middle of generated text.
func strconv(s string) string { return fmt.Sprintf("%q", s) }
