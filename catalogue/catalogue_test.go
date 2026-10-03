package catalogue_test

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protodesc"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/types/descriptorpb"
	"google.golang.org/protobuf/types/known/durationpb"

	"github.com/garm-ai/garm-ai/catalogue"
	"github.com/garm-ai/garm-ai/fetch"
	toolv1 "github.com/garm-ai/garm-ai/garm/tool/v1"
)

func fdp(fd protoreflect.FileDescriptor) *descriptorpb.FileDescriptorProto {
	return protodesc.ToFileDescriptorProto(fd)
}

// write builds a catalogue on disk from one tool declaration, through real
// MethodOptions, and returns its path and digest.
func write(t *testing.T, dir string, tools ...*toolv1.Tool) (string, string) {
	t.Helper()
	var methods []*descriptorpb.MethodDescriptorProto
	for i, tool := range tools {
		opts := &descriptorpb.MethodOptions{}
		proto.SetExtension(opts, toolv1.E_Tool, tool)
		methods = append(methods, &descriptorpb.MethodDescriptorProto{
			Name:       proto.String(string(rune('A' + i))),
			InputType:  proto.String(".probe.v1.Req"),
			OutputType: proto.String(".probe.v1.Res"),
			Options:    opts,
		})
	}
	own := &descriptorpb.FileDescriptorProto{
		Name:       proto.String("probe/v1/probe.proto"),
		Package:    proto.String("probe.v1"),
		Syntax:     proto.String("proto3"),
		Dependency: []string{"garm/tool/v1/tool.proto"},
		MessageType: []*descriptorpb.DescriptorProto{
			{Name: proto.String("Req")}, {Name: proto.String("Res")},
		},
		Service: []*descriptorpb.ServiceDescriptorProto{
			{Name: proto.String("ProbeService"), Method: methods},
		},
	}
	// every import the contract has, derived rather than listed
	tool := toolv1.File_garm_tool_v1_tool_proto
	var all []*descriptorpb.FileDescriptorProto
	for i := 0; i < tool.Imports().Len(); i++ {
		all = append(all, fdp(tool.Imports().Get(i).FileDescriptor))
	}
	all = append(all, fdp(tool), own)

	raw, err := proto.Marshal(&descriptorpb.FileDescriptorSet{File: all})
	if err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(dir, "catalogue.binpb")
	if err := os.WriteFile(path, raw, 0o600); err != nil {
		t.Fatal(err)
	}
	sum := sha256.Sum256(raw)
	return path, hex.EncodeToString(sum[:])
}

func syncTool(name string, secs int64) *toolv1.Tool {
	return &toolv1.Tool{Name: name, Delivery: &toolv1.Tool_Sync{
		Sync: &toolv1.Sync{Budget: durationpb.New(durationSeconds(secs))}}}
}

func load(t *testing.T, dir, path, sha string) (*catalogue.Catalogue, error) {
	t.Helper()
	return catalogue.Load(context.Background(), &fetch.Resolver{Dir: dir},
		fetch.Artefact{URI: "file://" + filepath.Base(path), SHA256: sha})
}

func TestLoadingACatalogueGivesItsToolsAndItsDigest(t *testing.T) {
	dir := t.TempDir()
	path, sha := write(t, dir, syncTool("probe.v1.read", 2))

	c, err := load(t, dir, path, sha)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if c.SHA256 != sha {
		t.Errorf("SHA256 = %s, want %s", c.SHA256, sha)
	}
	tool, ok := c.Tools.Tool("probe.v1.read")
	if !ok {
		t.Fatal("probe.v1.read is not in the catalogue")
	}
	if !tool.IsSync() || tool.Budget() != durationSeconds(2) {
		t.Errorf("sync=%v budget=%v", tool.IsSync(), tool.Budget())
	}
	// Its OWN registry, not the process global -- which is what makes a later
	// swap possible at all.
	if c.Files == nil {
		t.Fatal("no registry")
	}
	if _, err := c.Files.FindFileByPath("probe/v1/probe.proto"); err != nil {
		t.Errorf("the catalogue's registry does not resolve its own file: %v", err)
	}
}

// TestAWrongDigestIsRefusedAndNothingIsLoaded: the digest is a version identifier
// as well as an integrity check, so a mismatch must not produce a usable value.
func TestAWrongDigestIsRefusedAndNothingIsLoaded(t *testing.T) {
	dir := t.TempDir()
	path, _ := write(t, dir, syncTool("probe.v1.read", 2))

	c, err := load(t, dir, path, strings.Repeat("ab", 32))
	if err == nil {
		t.Fatal("a catalogue with a wrong digest was loaded")
	}
	if c != nil {
		t.Error("a catalogue was returned alongside the error")
	}
}

// TestLoadReRunsTodaysRules. compose may have run with an OLDER binary that lacked
// a rule added since, so a catalogue valid when built may not be valid now. This is
// the class the previous estate took a plane down with.
func TestLoadReRunsTodaysRules(t *testing.T) {
	for name, tool := range map[string]*toolv1.Tool{
		// a tool that never declared delivery, which an older compose allowed
		"no delivery": {Name: "probe.v1.old"},
		// an agent naming a tool nothing declares
		"unresolved allowlist": {Name: "probe.v1.agent",
			Delivery: &toolv1.Tool_Async{Async: &toolv1.Async{}},
			Agent:    &toolv1.Agent{Tools: []*toolv1.ToolRef{{Name: "probe.v1.gone"}}}},
		// an agent that cannot complete inside a call
		"a sync agent": {Name: "probe.v1.sync_agent",
			Delivery: &toolv1.Tool_Sync{Sync: &toolv1.Sync{Budget: durationpb.New(durationSeconds(1))}},
			Agent:    &toolv1.Agent{Tools: []*toolv1.ToolRef{}}},
	} {
		dir := t.TempDir()
		path, sha := write(t, dir, tool)
		if _, err := load(t, dir, path, sha); err == nil {
			t.Errorf("%s: a catalogue that today's rules refuse was loaded", name)
		}
	}
}

// TestTheHolderPublishesWholeValues. The property that makes an in-flight swap
// safe: a reader either sees the old catalogue or the new one, never a mixture,
// and a reader holding the old one keeps working after the swap.
func TestTheHolderPublishesWholeValues(t *testing.T) {
	dir := t.TempDir()
	p1, s1 := write(t, dir, syncTool("probe.v1.read", 2))
	c1, err := load(t, dir, p1, s1)
	if err != nil {
		t.Fatal(err)
	}
	dir2 := t.TempDir()
	p2, s2 := write(t, dir2, syncTool("probe.v1.read", 9), syncTool("probe.v1.extra", 1))
	c2, err := load(t, dir2, p2, s2)
	if err != nil {
		t.Fatal(err)
	}

	var h catalogue.Holder
	h.Set(c1)

	// a "call in flight": it snapshots once, then the catalogue is swapped
	held := h.Current()
	h.Set(c2)

	before, _ := held.Tool("probe.v1.read")
	if before.Budget() != durationSeconds(2) {
		t.Errorf("the snapshot changed under the caller: budget is %v", before.Budget())
	}
	if _, ok := held.Tool("probe.v1.extra"); ok {
		t.Error("the snapshot gained a tool that was added after it was taken")
	}
	after, _ := h.Current().Tool("probe.v1.read")
	if after.Budget() != durationSeconds(9) {
		t.Errorf("a new caller got the old catalogue: budget is %v", after.Budget())
	}
}

// TestConcurrentReadersAndASwapRace runs under -race: the point is that a reader
// never observes a partially published value.
func TestConcurrentReadersAndASwapRace(t *testing.T) {
	dir := t.TempDir()
	p1, s1 := write(t, dir, syncTool("probe.v1.read", 2))
	c1, _ := load(t, dir, p1, s1)
	dir2 := t.TempDir()
	p2, s2 := write(t, dir2, syncTool("probe.v1.read", 9))
	c2, _ := load(t, dir2, p2, s2)

	var h catalogue.Holder
	h.Set(c1)

	var wg sync.WaitGroup
	for i := 0; i < 32; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for j := 0; j < 200; j++ {
				c := h.Current()
				tool, ok := c.Tool("probe.v1.read")
				if !ok {
					t.Error("a reader saw a catalogue without the tool")
					return
				}
				// exactly one of the two, never something in between
				if b := tool.Budget(); b != durationSeconds(2) && b != durationSeconds(9) {
					t.Errorf("a reader saw a torn value: budget %v", b)
					return
				}
			}
		}()
	}
	for i := 0; i < 50; i++ {
		h.Set(c1)
		h.Set(c2)
	}
	wg.Wait()
}

func durationSeconds(n int64) time.Duration { return time.Duration(n) * time.Second }
