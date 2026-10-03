// Package fetch gets a built artefact from a URI and verifies it is the bytes
// somebody pinned.
//
// Separate from `images` because an IMAGE and a CATALOGUE are different things --
// one team's output, and many images merged with every collision check passed --
// and both are fetched the same way. Putting the mechanism here lets rund load a
// catalogue without any code calling it an image, which a decision record is
// emphatic that it is not.
//
// So: one fetcher, two artefacts, and neither package named for the other's.
package fetch

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// Artefact is one place to get bytes, and what they must hash to.
type Artefact struct {
	// URI is where the bytes are: file://, https:// or s3://.
	//
	// A URI rather than per-scheme fields so that a new source is a new fetcher
	// and not a schema change. A git tag arrives as an https:// release asset --
	// the URL already encodes the tag, so it needs no git client and no clone.
	URI string

	// SHA256 is the hex digest the fetched bytes must have.
	//
	// REQUIRED for remote schemes, optional for file://, and the asymmetry
	// matches where the trust boundary is. An s3 object and a release asset can
	// both be replaced in place, so a remote URI without a digest pins a LOCATION
	// and not bytes. A local file is already in your tree under the same review
	// as your code -- and a digest to update on every rebuild is friction people
	// route around, which is weaker than a rule scoped to where it matters.
	SHA256 string
}

// Get returns the artefact's bytes, verifying any declared digest.
//
// Verification happens BEFORE a caller parses anything. A digest that only runs
// on bytes which happened to parse is a digest protecting the easy case.
func (r *Resolver) Get(ctx context.Context, a Artefact) ([]byte, error) {
	raw, err := r.bytes(ctx, a.URI)
	if err != nil {
		return nil, err
	}
	if a.SHA256 != "" {
		got := hex.EncodeToString(sha256Of(raw))
		if got != a.SHA256 {
			return nil, fmt.Errorf("%s: sha256 is %s, pinned as %s -- the bytes at "+
				"that location are not the bytes this pins", a.URI, got, a.SHA256)
		}
	}
	return raw, nil
}

// ObjectGetter reads one object from a bucket.
//
// An interface so the s3 path is TESTABLE. Without it the only way to exercise
// it would be against a real bucket, which means in practice it would be
// exercised by nobody -- and an untested fetcher behind a digest check is the
// shape of problem this repository keeps finding in the estate it replaces.
type ObjectGetter interface {
	Get(ctx context.Context, bucket, key string) ([]byte, error)
}

// Resolver fetches the images a manifest names.
//
// The two client fields exist so tests can supply their own; nil means the real
// thing. They are not configuration -- nothing reads them from a file.
type Resolver struct {
	// Dir is what relative file:// paths resolve against, so a manifest is
	// movable as a unit.
	Dir string

	// HTTP is nil for http.DefaultClient.
	HTTP *http.Client

	// S3 is nil for the AWS SDK with the ambient credential chain.
	S3 ObjectGetter
}

func sha256Of(b []byte) []byte {
	sum := sha256.Sum256(b)
	return sum[:]
}

func (r *Resolver) bytes(ctx context.Context, uri string) ([]byte, error) {
	switch {
	case strings.HasPrefix(uri, "file://"):
		return r.file(uri)
	case strings.HasPrefix(uri, "https://"):
		return r.https(ctx, uri)
	case strings.HasPrefix(uri, "s3://"):
		return r.s3(ctx, uri)
	default:
		// Name the schemes that work. A reader who wrote `http://` or `git://`
		// deserves to know which spelling is wanted, not that theirs is wrong.
		return nil, fmt.Errorf("%s: unsupported scheme; use file://, https:// or s3://", uri)
	}
}

func (r *Resolver) file(uri string) ([]byte, error) {
	path := strings.TrimPrefix(uri, "file://")
	if !filepath.IsAbs(path) {
		path = filepath.Join(r.Dir, path)
	}
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", uri, err)
	}
	return raw, nil
}

// https fetches an image over HTTPS.
//
// This is also how a GIT TAG is resolved: a forge's release-asset URL already
// encodes the tag -- `…/releases/download/v1.4.0/payments.binpb` -- so it needs
// no git client, no clone, and no credentials beyond whatever the forge wants.
// A `git+` fetcher that clones and reads a path from a tree only earns its place
// if somebody's image is not published as an asset.
func (r *Resolver) https(ctx context.Context, uri string) ([]byte, error) {
	cl := r.HTTP
	if cl == nil {
		cl = http.DefaultClient
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, uri, nil)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", uri, err)
	}
	resp, err := cl.Do(req)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", uri, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		// The status, because a 404 and a 403 send a reader to completely
		// different places -- a wrong tag versus a private repository.
		return nil, fmt.Errorf("%s: HTTP %s", uri, resp.Status)
	}
	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("%s: reading the body: %w", uri, err)
	}
	return raw, nil
}

func (r *Resolver) s3(ctx context.Context, uri string) ([]byte, error) {
	rest := strings.TrimPrefix(uri, "s3://")
	bucket, key, ok := strings.Cut(rest, "/")
	if !ok || bucket == "" || key == "" {
		return nil, fmt.Errorf("%s: want s3://<bucket>/<key>", uri)
	}
	g := r.S3
	if g == nil {
		var err error
		if g, err = newAWS(ctx); err != nil {
			return nil, fmt.Errorf("%s: %w", uri, err)
		}
	}
	raw, err := g.Get(ctx, bucket, key)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", uri, err)
	}
	return raw, nil
}

// awsGetter is the real ObjectGetter, built from the ambient credential chain.
type awsGetter struct{ cl *s3.Client }

func newAWS(ctx context.Context) (ObjectGetter, error) {
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, fmt.Errorf("loading AWS config: %w", err)
	}
	return &awsGetter{cl: s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = usePathStyle(os.Getenv)
	})}, nil
}

// usePathStyle reports whether S3 path-style addressing is wanted.
//
// Path-style ONLY when a custom endpoint is configured. An earlier revision
// hardcoded it to true, because the estate's local plane runs an S3-compatible
// store and virtual-host addressing does not work against one -- a
// deployment-specific choice made invisibly, and wrong against real AWS where
// path-style is deprecated. So it is derived from the one signal that separates
// the two cases: an endpoint override, which the SDK reads itself and which
// nobody sets when talking to AWS proper.
//
// A FUNCTION TAKING getenv, rather than reading the environment inline, so the
// decision is reachable from a test. The first fix for the hardcoded value was
// correct and untested, because `newAWS` builds a real client from the ambient
// credential chain and there was nowhere to get at the choice. An unguarded fix
// is one regression away from being the bug again.
//
// Note what this is NOT: a garm.yaml. Credentials, region and endpoint already
// have a standard resolution order -- AWS_* variables, ~/.aws/config, instance
// roles. A file of our own duplicating them would be a second place to look when
// it does not work, and the previous estate's expensive failures were config
// claiming one thing while reality did another.
func usePathStyle(getenv func(string) string) bool {
	// AWS_ENDPOINT_URL_S3 takes precedence in the SDK's own resolution, but
	// either being set means somebody is pointing at something that is not AWS.
	return getenv("AWS_ENDPOINT_URL_S3") != "" || getenv("AWS_ENDPOINT_URL") != ""
}

func (a *awsGetter) Get(ctx context.Context, bucket, key string) ([]byte, error) {
	out, err := a.cl.GetObject(ctx, &s3.GetObjectInput{Bucket: &bucket, Key: &key})
	if err != nil {
		return nil, err
	}
	defer out.Body.Close()
	return io.ReadAll(out.Body)
}
