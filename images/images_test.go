package images_test

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protodesc"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/types/descriptorpb"

	toolv1 "github.com/garm-ai/garm-ai/garm/tool/v1"
	"github.com/garm-ai/garm-ai/images"
	testdatav1 "github.com/garm-ai/garm-ai/testdata/v1"
)

func fdp(fd protoreflect.FileDescriptor) *descriptorpb.FileDescriptorProto {
	return protodesc.ToFileDescriptorProto(fd)
}

// writeImage writes a real FileDescriptorSet, the way buf build would. Every
// image includes its own copy of the shared dependencies, because buf does --
// which is exactly the duplication Merge exists to handle.
func writeImage(t *testing.T, dir, name string, files ...*descriptorpb.FileDescriptorProto) string {
	t.Helper()
	tool := toolv1.File_garm_tool_v1_tool_proto
	all := append([]*descriptorpb.FileDescriptorProto{
		fdp(tool.Imports().Get(0).FileDescriptor), // descriptor.proto
		fdp(tool),
	}, files...)
	raw, err := proto.Marshal(&descriptorpb.FileDescriptorSet{File: all})
	if err != nil {
		t.Fatalf("marshalling %s: %v", name, err)
	}
	path := filepath.Join(dir, name)
	if err := os.WriteFile(path, raw, 0o600); err != nil {
		t.Fatal(err)
	}
	return path
}

func manifest(t *testing.T, dir string, uris ...string) string {
	t.Helper()
	body := "schema: v1\nimages:\n"
	for _, u := range uris {
		body += "  - uri: " + u + "\n"
	}
	path := filepath.Join(dir, "images.yaml")
	if err := os.WriteFile(path, []byte(body), 0o600); err != nil {
		t.Fatal(err)
	}
	return path
}

func TestTwoImagesMergeIntoOneNamespace(t *testing.T) {
	// The point of the whole package: an agent in one image resolves its
	// allowlist against tools declared in another, because they become one
	// namespace. That is what makes tool definitions in separate repositories
	// work at all.
	dir := t.TempDir()
	writeImage(t, dir, "tools.binpb", fdp(testdatav1.File_testdata_v1_tools_proto))
	writeImage(t, dir, "agent.binpb", fdp(testdatav1.File_testdata_v1_agent_proto))
	mPath := manifest(t, dir, "file://tools.binpb", "file://agent.binpb")

	m, base, err := images.Load(mPath)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	fetched, err := images.Fetch(m, base)
	if err != nil {
		t.Fatalf("Fetch: %v", err)
	}
	merged, err := images.Merge(fetched)
	if err != nil {
		t.Fatalf("Merge: %v", err)
	}
	// descriptor.proto and the contract appear in BOTH images and must be
	// deduplicated, not concatenated -- protodesc.NewFiles refuses a repeated
	// path outright, so a naive merge of any two real images always fails.
	if len(merged.Shared) != 2 {
		t.Errorf("Shared = %v, want descriptor.proto and the contract", merged.Shared)
	}
	if _, err := protodesc.NewFiles(merged.Set); err != nil {
		t.Fatalf("the merged set does not resolve: %v", err)
	}
	// Provenance: a later collision message must be able to name an IMAGE, which
	// is the only form a stranger in another repository can act on.
	if got := merged.Source["testdata/v1/agent.proto"]; got != "file://agent.binpb" {
		t.Errorf("Source for the agent = %q, want file://agent.binpb", got)
	}
}

func TestADivergentSharedFileIsRefused(t *testing.T) {
	// Two teams on different versions of one shared contract file. Taking either
	// copy silently would mean one team's tools are read against a contract they
	// never compiled against.
	dir := t.TempDir()
	writeImage(t, dir, "a.binpb", fdp(testdatav1.File_testdata_v1_tools_proto))

	// b carries a MODIFIED copy of the shared contract.
	tool := fdp(toolv1.File_garm_tool_v1_tool_proto)
	tool.MessageType[0].Field = append(tool.MessageType[0].Field, &descriptorpb.FieldDescriptorProto{
		Name:   proto.String("a_field_the_other_image_does_not_have"),
		Number: proto.Int32(99),
		Type:   descriptorpb.FieldDescriptorProto_TYPE_STRING.Enum(),
		Label:  descriptorpb.FieldDescriptorProto_LABEL_OPTIONAL.Enum(),
	})
	raw, _ := proto.Marshal(&descriptorpb.FileDescriptorSet{File: []*descriptorpb.FileDescriptorProto{
		fdp(toolv1.File_garm_tool_v1_tool_proto.Imports().Get(0).FileDescriptor), tool,
	}})
	if err := os.WriteFile(filepath.Join(dir, "b.binpb"), raw, 0o600); err != nil {
		t.Fatal(err)
	}

	m, base, _ := images.Load(manifest(t, dir, "file://a.binpb", "file://b.binpb"))
	fetched, err := images.Fetch(m, base)
	if err != nil {
		t.Fatalf("Fetch: %v", err)
	}
	_, err = images.Merge(fetched)
	var d images.Divergent
	if !errors.As(err, &d) {
		t.Fatalf("Merge accepted divergent copies of a shared file; err = %v", err)
	}
	if d.Path != "garm/tool/v1/tool.proto" {
		t.Errorf("Divergent.Path = %q, want the contract", d.Path)
	}
	// Both images named: a message saying only "they differ" leaves a reader
	// with two repositories and no idea which to look at.
	for _, want := range []string{"a.binpb", "b.binpb"} {
		if !strings.Contains(d.Error(), want) {
			t.Errorf("the error does not name %s: %v", want, d)
		}
	}
}

func TestAnUnsupportedSchemeSaysWhatIsComing(t *testing.T) {
	// A reader who wrote s3:// deserves to know it is next rather than wrong.
	dir := t.TempDir()
	m, base, _ := images.Load(manifest(t, dir, "s3://bucket/payments.binpb"))
	_, err := images.Fetch(m, base)
	if err == nil {
		t.Fatal("Fetch accepted an s3:// URI it cannot resolve")
	}
	for _, want := range []string{"s3://", "https://"} {
		if !strings.Contains(err.Error(), want) {
			t.Errorf("the error does not mention %q: %v", want, err)
		}
	}
}

func TestAManifestWithTheWrongSchemaIsRefused(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "images.yaml")
	os.WriteFile(path, []byte("schema: v2\nimages:\n  - uri: file://x.binpb\n"), 0o600)
	if _, _, err := images.Load(path); err == nil {
		t.Fatal("Load accepted schema v2")
	}
}

func TestAManifestWithNoImagesIsRefused(t *testing.T) {
	// Composing nothing is not an empty namespace, it is a mistake -- and it
	// would otherwise produce a cheerfully green check over zero tools.
	dir := t.TempDir()
	path := filepath.Join(dir, "images.yaml")
	os.WriteFile(path, []byte("schema: v1\nimages: []\n"), 0o600)
	if _, _, err := images.Load(path); err == nil {
		t.Fatal("Load accepted a manifest declaring no images")
	}
}
