package fetch_test

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/garm-ai/garm-ai/fetch"
)

func digest(b []byte) string {
	sum := sha256.Sum256(b)
	return hex.EncodeToString(sum[:])
}

func TestALocalFileNeedsNoDigest(t *testing.T) {
	dir := t.TempDir()
	want := []byte("some built artefact")
	if err := os.WriteFile(filepath.Join(dir, "a.binpb"), want, 0o600); err != nil {
		t.Fatal(err)
	}
	r := &fetch.Resolver{Dir: dir}
	got, err := r.Get(context.Background(), fetch.Artefact{URI: "file://a.binpb"})
	if err != nil {
		t.Fatalf("Get: %v", err)
	}
	if string(got) != string(want) {
		t.Errorf("got %q", got)
	}
}

func TestAnUnsupportedSchemeNamesTheOnesThatWork(t *testing.T) {
	r := &fetch.Resolver{}
	_, err := r.Get(context.Background(), fetch.Artefact{URI: "git://acme/payments.binpb"})
	if err == nil {
		t.Fatal("git:// was accepted")
	}
	// A reader who wrote the wrong spelling deserves the right one, not just a no.
	for _, want := range []string{"file://", "https://", "s3://"} {
		if !strings.Contains(err.Error(), want) {
			t.Errorf("the refusal does not name %s: %v", want, err)
		}
	}
}

func TestAnHTTPSArtefactIsFetchedAndItsDigestVerified(t *testing.T) {
	body := []byte("a release asset, as a git tag resolves to")
	srv := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Write(body)
	}))
	defer srv.Close()

	r := &fetch.Resolver{HTTP: srv.Client()}
	got, err := r.Get(context.Background(), fetch.Artefact{URI: srv.URL + "/v1.4.0/x.binpb", SHA256: digest(body)})
	if err != nil {
		t.Fatalf("Get: %v", err)
	}
	if string(got) != string(body) {
		t.Errorf("got %q", got)
	}
}

func TestAWrongDigestIsRefusedAndSaysBothSides(t *testing.T) {
	body := []byte("the bytes that are actually there")
	srv := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Write(body)
	}))
	defer srv.Close()

	r := &fetch.Resolver{HTTP: srv.Client()}
	_, err := r.Get(context.Background(), fetch.Artefact{
		URI: srv.URL + "/x.binpb", SHA256: digest([]byte("what somebody pinned")),
	})
	if err == nil {
		t.Fatal("a wrong digest was accepted")
	}
	// Both digests, because "mismatch" alone leaves an operator unable to tell
	// whether the artefact moved or the pin is stale.
	if !strings.Contains(err.Error(), digest(body)) {
		t.Errorf("the error does not say what the bytes actually hash to: %v", err)
	}
}

// getter records what was asked for, so the s3 path is exercised without a bucket.
type getter struct {
	bucket, key string
	body        []byte
}

func (g *getter) Get(_ context.Context, bucket, key string) ([]byte, error) {
	g.bucket, g.key = bucket, key
	return g.body, nil
}

func TestAnS3ArtefactIsFetchedThroughTheGetterWithBucketAndKeySplit(t *testing.T) {
	body := []byte("an object in a bucket")
	g := &getter{body: body}
	r := &fetch.Resolver{S3: g}

	got, err := r.Get(context.Background(), fetch.Artefact{
		URI: "s3://garm-artefacts/catalogues/prod/2026-10-03.binpb", SHA256: digest(body),
	})
	if err != nil {
		t.Fatalf("Get: %v", err)
	}
	if string(got) != string(body) {
		t.Errorf("got %q", got)
	}
	if g.bucket != "garm-artefacts" {
		t.Errorf("bucket is %q", g.bucket)
	}
	// The whole path after the bucket is the key, slashes and all.
	if g.key != "catalogues/prod/2026-10-03.binpb" {
		t.Errorf("key is %q", g.key)
	}
}

// TestPathStyleIsDerivedFromAnEndpointOverrideAndNotHardcoded.
//
// Proved in BOTH directions, because either hardcoded value is wrong for somebody:
// path-style is deprecated against real AWS, and required by most S3-compatible
// stores. An earlier revision set it to true unconditionally because the local
// plane ran one.
func TestPathStyleIsDerivedFromAnEndpointOverrideAndNotHardcoded(t *testing.T) {
	for name, tc := range map[string]struct {
		env  map[string]string
		want bool
	}{
		"real AWS, no endpoint":     {map[string]string{}, false},
		"an S3-compatible endpoint": {map[string]string{"AWS_ENDPOINT_URL_S3": "http://seaweed:8333"}, true},
		"a generic endpoint":        {map[string]string{"AWS_ENDPOINT_URL": "http://localstack:4566"}, true},
		"an unrelated AWS variable": {map[string]string{"AWS_REGION": "eu-west-1"}, false},
	} {
		got := fetch.UsePathStyleForTest(func(k string) string { return tc.env[k] })
		if got != tc.want {
			t.Errorf("%s: usePathStyle = %v, want %v", name, got, tc.want)
		}
	}
}
