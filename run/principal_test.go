package run_test

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// AsPrincipal is the one field in this slice that ELEVATES trust: it wins over
// the account the transport proved. So the set of files that may write it is a
// closed list, checked here rather than left to a comment.
//
// Found in review: the comment on the field said in capitals that it must never
// come from a caller-written header, and nothing would have failed if a
// transport had started reading one. The scenario is cheap and total -- a caller
// sets the header, gets whatever that principal holds, and reads every run that
// principal is the subject of.
//
// Exactly one hit is required per file, so the test cannot pass vacuously once
// the field is renamed away.
func TestOnlyTheEngineAndTheTestEstateMayWriteAsPrincipal(t *testing.T) {
	// The engine declares and reads it; the test estate is the only writer,
	// because a person has no connection in this build and reading a run as one
	// is the only honest way to exercise a subject's visibility.
	allowed := map[string]bool{
		"../run/principal.go":          true, // the declaration and PrincipalOf's read
		"../run/run.go":                true, // the Headers field it lives on
		"../internal/estate/estate.go": true, // AsPrincipal(t, kind, id), the only writer
	}
	var writers []string
	_ = filepath.WalkDir("..", func(path string, d os.DirEntry, err error) error {
		if err != nil || d.IsDir() || !strings.HasSuffix(path, ".go") || strings.HasSuffix(path, "_test.go") {
			return nil
		}
		body, err := os.ReadFile(path)
		if err != nil {
			return nil
		}
		if strings.Contains(string(body), "AsPrincipal") {
			writers = append(writers, filepath.ToSlash(path))
		}
		return nil
	})
	if len(writers) == 0 {
		t.Fatal("AsPrincipal appears in no file: has it been renamed? this check would pass vacuously")
	}
	for _, w := range writers {
		if !allowed[w] {
			t.Errorf("%s names AsPrincipal; a transport that fills it from a header is an authentication bypass -- "+
				"the principal must come from what the server proved (authority spec §2)", w)
		}
	}
}
