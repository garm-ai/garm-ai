package images_test

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
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

	m, base, err := images.Load(manifest(t, dir, "file://a.binpb", "file://b.binpb"))
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
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

func TestAnUnsupportedSchemeNamesTheOnesThatWork(t *testing.T) {
	// A reader who wrote git:// or http:// deserves to be told which spelling is
	// wanted, not that theirs is wrong.
	dir := t.TempDir()
	m, base, err := images.Load(manifest(t, dir, "git://example.com/x.binpb"))
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	_, err = images.Fetch(m, base)
	if err == nil {
		t.Fatal("Fetch accepted a git:// URI")
	}
	for _, want := range []string{"file://", "https://", "s3://"} {
		if !strings.Contains(err.Error(), want) {
			t.Errorf("the error does not name %q: %v", want, err)
		}
	}
}

func TestARemoteImageWithoutADigestIsRefusedAtLoad(t *testing.T) {
	// An s3 object or a release asset can be replaced in place, so a remote URI
	// with no digest pins a LOCATION and not bytes. Refused at load, before
	// anything is downloaded.
	dir := t.TempDir()
	for _, uri := range []string{
		"s3://bucket/payments.binpb",
		"https://example.com/releases/download/v1.2.0/payments.binpb",
	} {
		_, _, err := images.Load(manifest(t, dir, uri))
		if err == nil {
			t.Fatalf("%s was accepted with no sha256", uri)
		}
		if !strings.Contains(err.Error(), "sha256") {
			t.Errorf("%s: the error does not mention sha256: %v", uri, err)
		}
	}
}

func TestALocalImageNeedsNoDigest(t *testing.T) {
	// The asymmetry is deliberate: a local file is already in the tree and under
	// the same review as the code, and a digest to update on every rebuild is
	// friction people route around.
	dir := t.TempDir()
	writeImage(t, dir, "tools.binpb", fdp(testdatav1.File_testdata_v1_tools_proto))
	m, base, err := images.Load(manifest(t, dir, "file://tools.binpb"))
	if err != nil {
		t.Fatalf("a local image was refused for having no digest: %v", err)
	}
	if _, err := images.Fetch(m, base); err != nil {
		t.Fatalf("Fetch: %v", err)
	}
}

func TestAMalformedDigestIsRefusedAtLoad(t *testing.T) {
	dir := t.TempDir()
	body := "schema: v1\nimages:\n  - uri: file://x.binpb\n    sha256: not-a-digest\n"
	path := filepath.Join(dir, "images.yaml")
	if err := os.WriteFile(path, []byte(body), 0o600); err != nil {
		t.Fatal(err)
	}
	_, _, err := images.Load(path)
	if err == nil {
		t.Fatal("Load accepted a sha256 that is not 64 hex characters")
	}
	if !strings.Contains(err.Error(), "64 hex") {
		t.Errorf("the error does not say what shape is wanted: %v", err)
	}
}

func TestAnHTTPSImageIsFetchedAndItsDigestVerified(t *testing.T) {
	// This is also how a GIT TAG resolves: a forge's release-asset URL already
	// encodes the tag, so no git client is involved.
	dir := t.TempDir()
	imgPath := writeImage(t, dir, "payments.binpb", fdp(testdatav1.File_testdata_v1_tools_proto))
	raw, err := os.ReadFile(imgPath)
	if err != nil {
		t.Fatal(err)
	}
	sum := sha256.Sum256(raw)
	digest := hex.EncodeToString(sum[:])

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Write(raw)
	}))
	defer srv.Close()

	// httptest serves http://, and the manifest requires https:// for remotes --
	// so the URI is written as https and the Resolver is handed the test client.
	// That keeps the digest RULE under test without pretending TLS is involved.
	body := "schema: v1\nimages:\n  - uri: https://example.invalid/payments.binpb\n    sha256: " + digest + "\n"
	path := filepath.Join(dir, "images.yaml")
	if err := os.WriteFile(path, []byte(body), 0o600); err != nil {
		t.Fatal(err)
	}
	m, base, err := images.Load(path)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	r := &images.Resolver{Dir: base, HTTP: srv.Client()}
	r.HTTP.Transport = rewriteTo(srv.URL)

	fetched, err := r.Fetch(context.Background(), m)
	if err != nil {
		t.Fatalf("Fetch: %v", err)
	}
	if len(fetched) != 1 || fetched[0].URI != "https://example.invalid/payments.binpb" {
		t.Fatalf("fetched = %+v", fetched)
	}
}

func TestAWrongDigestIsRefusedBeforeUnmarshalling(t *testing.T) {
	// Verified BEFORE parsing: a digest that only runs on bytes which happened to
	// parse is a digest protecting the easy case. The body here is not even a
	// descriptor set, and the digest must be what rejects it.
	dir := t.TempDir()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Write([]byte("these are not the bytes you pinned"))
	}))
	defer srv.Close()

	body := "schema: v1\nimages:\n  - uri: https://example.invalid/x.binpb\n    sha256: " +
		strings.Repeat("ab", 32) + "\n"
	path := filepath.Join(dir, "images.yaml")
	if err := os.WriteFile(path, []byte(body), 0o600); err != nil {
		t.Fatal(err)
	}
	m, base, err := images.Load(path)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	r := &images.Resolver{Dir: base, HTTP: srv.Client()}
	r.HTTP.Transport = rewriteTo(srv.URL)

	_, err = r.Fetch(context.Background(), m)
	if err == nil {
		t.Fatal("Fetch accepted bytes whose digest does not match")
	}
	if !strings.Contains(err.Error(), "sha256 is") {
		t.Errorf("the error does not report the digest mismatch: %v", err)
	}
	// It must NOT have got as far as complaining about the proto shape.
	if strings.Contains(err.Error(), "FileDescriptorSet") {
		t.Errorf("the digest was checked after unmarshalling, not before: %v", err)
	}
}

func TestAnS3ImageIsFetchedThroughTheGetter(t *testing.T) {
	// The ObjectGetter interface exists so this path is exercised at all. Without
	// it the only way to test s3 would be against a real bucket, which means in
	// practice nobody would -- and an untested fetcher behind a digest check is
	// precisely the shape of problem this repository keeps finding.
	dir := t.TempDir()
	imgPath := writeImage(t, dir, "accounts.binpb", fdp(testdatav1.File_testdata_v1_tools_proto))
	raw, err := os.ReadFile(imgPath)
	if err != nil {
		t.Fatal(err)
	}
	sum := sha256.Sum256(raw)

	body := "schema: v1\nimages:\n  - uri: s3://garm/images/accounts.binpb\n    sha256: " +
		hex.EncodeToString(sum[:]) + "\n"
	path := filepath.Join(dir, "images.yaml")
	if err := os.WriteFile(path, []byte(body), 0o600); err != nil {
		t.Fatal(err)
	}
	m, base, err := images.Load(path)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	got := &fakeS3{want: "garm/images/accounts.binpb", raw: raw}
	r := &images.Resolver{Dir: base, S3: got}
	if _, err := r.Fetch(context.Background(), m); err != nil {
		t.Fatalf("Fetch: %v", err)
	}
	if !got.called {
		t.Error("the s3 getter was never called")
	}
}

type fakeS3 struct {
	want   string
	raw    []byte
	called bool
}

func (f *fakeS3) Get(_ context.Context, bucket, key string) ([]byte, error) {
	f.called = true
	if got := bucket + "/" + key; got != f.want {
		return nil, fmt.Errorf("asked for %q, want %q", got, f.want)
	}
	return f.raw, nil
}

// rewriteTo sends every request to the test server regardless of the URI's host,
// so a manifest can carry an https:// URI while the bytes come from httptest.
func rewriteTo(base string) http.RoundTripper {
	u, _ := url.Parse(base)
	return &rewriter{host: u.Host}
}

type rewriter struct{ host string }

func (rt *rewriter) RoundTrip(req *http.Request) (*http.Response, error) {
	req = req.Clone(req.Context())
	req.URL.Scheme = "http"
	req.URL.Host = rt.host
	return http.DefaultTransport.RoundTrip(req)
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
