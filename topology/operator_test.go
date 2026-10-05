package topology_test

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/nats-io/jwt/v2"

	"github.com/garm-ai/garm-ai/topology"
)

// The operator JWT the ceremony writes is root-signed, lists exactly the signing
// key, and turns strict signing-key usage on -- the field the whole shape rests
// on, because it is what makes the SERVER refuse a root-signed account.
func TestInitOperatorWritesAStrictRootSignedOperator(t *testing.T) {
	op, err := topology.InitOperator()
	if err != nil {
		t.Fatal(err)
	}
	oc, err := jwt.DecodeOperatorClaims(op.JWT)
	if err != nil {
		t.Fatal(err)
	}
	rootPub, _ := op.Root.PublicKey()
	signPub, _ := op.Signing.PublicKey()
	if oc.Subject != rootPub || oc.Issuer != rootPub {
		t.Errorf("subject %s issuer %s, want the root %s", oc.Subject, oc.Issuer, rootPub)
	}
	if len(oc.SigningKeys) != 1 || !oc.SigningKeys.Contains(signPub) {
		t.Errorf("signing keys %v, want exactly %s", oc.SigningKeys, signPub)
	}
	if !oc.StrictSigningKeyUsage {
		t.Error("strict signing-key usage is off; the server would accept a root-signed account")
	}
	if oc.SystemAccount != "" {
		t.Error("the operator JWT names a system account it cannot know at ceremony time")
	}
}

// Property 3, the structural half: the only place an operator key is created is
// operator.go. Every other file is checked by reading it, because a test that
// called Generate and hoped is not a proof of absence.
func TestTheOnlyCreateOperatorIsInOperatorGo(t *testing.T) {
	// The one legitimate file by its FULL path, and exactly one hit required --
	// a test that only forbids would pass vacuously once the call is renamed
	// away, and "any file named operator.go" would exempt cmd/garmctl's too.
	var hits []string
	_ = filepath.WalkDir("..", func(path string, d os.DirEntry, err error) error {
		if err != nil || d.IsDir() || !strings.HasSuffix(path, ".go") || strings.HasSuffix(path, "_test.go") {
			return nil
		}
		body, err := os.ReadFile(path)
		if err != nil {
			return nil
		}
		if strings.Contains(string(body), "nkeys.CreateOperator(") {
			hits = append(hits, filepath.ToSlash(path))
		}
		return nil
	})
	if len(hits) != 1 || hits[0] != "../topology/operator.go" {
		t.Fatalf("nkeys.CreateOperator must appear in exactly ../topology/operator.go; found %v", hits)
	}
}
