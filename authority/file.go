package authority

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"slices"
	"strings"
	"time"

	"gopkg.in/yaml.v3"

	"github.com/garm-ai/garm-ai/declared"
	"github.com/garm-ai/garm-ai/run"
)

// Schema is the grant file version this build understands.
const Schema = "v1"

// File is the deployment's reviewed grants: the same committed, reviewed place
// as images.yaml, the caller list and the issuance manifest. YAML because
// people read and review it.
//
// Every check happens at LOAD, not at decision time: a pattern that is not a
// pattern, a compartment the deployment never declared, a principal the caller
// table does not know. Each of those would otherwise be a grant that silently
// matches nothing -- a refusal nobody can debug -- and the file is the one
// place where naming them is possible (spec §6).
type File struct {
	path       string
	generation string
	vocabulary []string
	byKey      map[string][]Grant
	all        []Grant // file order, for a report a person reads beside the file
}

var _ Source = (*File)(nil)

// document is the file's shape. A struct rather than a map so an unknown field
// is a refusal: a misspelled key in an authority file must not be ignored.
type document struct {
	Schema       string       `yaml:"schema"`
	Compartments []string     `yaml:"compartments"`
	Grants       []grantEntry `yaml:"grants"`
}

type grantEntry struct {
	Principal    principalEntry  `yaml:"principal"`
	ActsFor      *principalEntry `yaml:"acts_for"`
	Tools        []string        `yaml:"tools"`
	Compartments []string        `yaml:"compartments"`
	Expires      string          `yaml:"expires"`
}

type principalEntry struct {
	Kind string `yaml:"kind"`
	ID   string `yaml:"id"`
}

// LoadFile reads and checks a grant file. resolve turns a principal's NAME into
// its account key -- in a deployment, the callers table rund already takes --
// because a human reviews this file and an account key is 56 random characters.
func LoadFile(path string, resolve func(name string) (key string, ok bool)) (*File, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("the grants file: %w", err)
	}
	var doc document
	dec := yaml.NewDecoder(strings.NewReader(string(raw)))
	dec.KnownFields(true)
	if err := dec.Decode(&doc); err != nil {
		return nil, fmt.Errorf("%s: %w", path, err)
	}
	// A second YAML document would be read by nothing. Dropping grants silently
	// is the failure this file's checks exist to prevent, so say so instead.
	if err := dec.Decode(new(document)); err != io.EOF {
		return nil, fmt.Errorf("%s: a second YAML document, after a \"---\" separator; one file is one document, and grants in a second one would be read by nothing", path)
	}
	if doc.Schema != Schema {
		return nil, fmt.Errorf("%s: schema is %q; this build understands %q", path, doc.Schema, Schema)
	}
	vocabulary := append([]string(nil), doc.Compartments...)
	slices.Sort(vocabulary)
	// Not named `declared`: this package imports the declared package.
	inVocabulary := func(c string) bool { return slices.Contains(vocabulary, c) }

	f := &File{path: path, vocabulary: vocabulary, byKey: map[string][]Grant{}}
	sum := sha256.Sum256(raw)
	f.generation = hex.EncodeToString(sum[:6])

	for i, e := range doc.Grants {
		where := fmt.Sprintf("%s: grant %d", path, i)
		p, err := principalOf(e.Principal, resolve, where)
		if err != nil {
			return nil, err
		}
		g := Grant{ID: fmt.Sprintf("%s#%d", e.Principal.ID, i), Principal: p,
			Tools: append([]string(nil), e.Tools...), Compartments: append([]string(nil), e.Compartments...)}
		if len(g.Tools) == 0 {
			return nil, fmt.Errorf("%s (%s): no tools; a grant that admits nothing denies everything, which is what omitting the grant does", where, e.Principal.ID)
		}
		for _, pattern := range g.Tools {
			if err := checkPattern(pattern, where); err != nil {
				return nil, err
			}
		}
		for _, c := range g.Compartments {
			if !inVocabulary(c) {
				return nil, fmt.Errorf("%s (%s): compartment %q is not in this deployment's vocabulary %v -- a typo here grants nothing, silently",
					where, e.Principal.ID, c, vocabulary)
			}
		}
		if e.ActsFor != nil {
			// The subject need not be a kind this build can PROVE: nobody
			// authenticates as it here, it is recorded and it is what a person
			// is read back by (spec §8).
			if e.ActsFor.Kind == "" || e.ActsFor.ID == "" {
				return nil, fmt.Errorf("%s (%s): acts_for needs a kind and an id", where, e.Principal.ID)
			}
			subject := run.Principal{Kind: run.PrincipalKind(e.ActsFor.Kind), ID: e.ActsFor.ID}
			g.ActsFor = &subject
		}
		if e.Expires != "" {
			at, err := time.Parse(time.RFC3339, e.Expires)
			if err != nil {
				return nil, fmt.Errorf("%s (%s): expires %q is not an RFC 3339 time: %w", where, e.Principal.ID, e.Expires, err)
			}
			g.Expires = at
		}
		f.byKey[p.ID] = append(f.byKey[p.ID], g)
		f.all = append(f.all, g)
	}
	return f, nil
}

// principalOf types and resolves a grant's principal. Only an account is
// accepted: a grant for a person would otherwise sit in the file matching
// nothing until auth callout exists, which is a promise the platform would
// break silently.
func principalOf(e principalEntry, resolve func(string) (string, bool), where string) (run.Principal, error) {
	if e.Kind == "" || e.ID == "" {
		return run.Principal{}, fmt.Errorf("%s: principal needs a kind and an id", where)
	}
	if run.PrincipalKind(e.Kind) != run.KindAccount {
		return run.Principal{}, fmt.Errorf("%s: principal kind %q cannot be proved by this build; only %q can, until a connection is identified at connect",
			where, e.Kind, run.KindAccount)
	}
	key, ok := resolve(e.ID)
	if !ok {
		return run.Principal{}, fmt.Errorf("%s: no caller named %q -- a grant for a principal nothing can present is a grant that never matches (is it in --callers?)",
			where, e.ID)
	}
	return run.Principal{Kind: run.KindAccount, ID: key}, nil
}

// checkPattern: exact, one trailing ".*", or exactly "*". Anything else is
// refused here, so Admits never has to decide what a half-pattern meant.
func checkPattern(p, where string) error {
	if p == "*" {
		return nil
	}
	if p == "" {
		return fmt.Errorf("%s: an empty tool pattern", where)
	}
	if stars := strings.Count(p, "*"); stars > 0 {
		if stars > 1 || !strings.HasSuffix(p, ".*") {
			return fmt.Errorf("%s: tool pattern %q is neither a name, a prefix ending in \".*\", nor \"*\"", where, p)
		}
		// ".*" passes the rule above and matches nothing: no tool name begins
		// with a dot. A pattern that matches nothing is what this refuses.
		if p == ".*" {
			return fmt.Errorf("%s: tool pattern %q has nothing before the star, so it matches no tool; write a prefix (\"weather.v1.*\") or exactly \"*\"", where, p)
		}
	}
	return nil
}

// For is Source: the principal's live grants.
func (f *File) For(_ context.Context, p run.Principal, now time.Time) ([]Grant, error) {
	var out []Grant
	for _, g := range f.byKey[p.ID] {
		if g.Principal.Kind == p.Kind && g.Live(now) {
			out = append(out, g)
		}
	}
	return out, nil
}

// Grants is every grant the file holds, in file order -- what `garmctl grants
// check` reads back to whoever reviews the file. A copy, so a caller that
// sorts its report does not reorder the file.
func (f *File) Grants() []Grant { return append([]Grant(nil), f.all...) }

// CheckCatalogue is the §6 cross-check: a tool requiring a compartment this
// deployment does not declare is a tool nobody can call, which is a
// configuration error and not a refusal once per call. Made by rund at boot and
// by `garmctl grants check` without starting rund -- one implementation,
// because the two must agree about what refuses.
func (f *File) CheckCatalogue(tools []declared.Tool) error {
	for _, t := range tools {
		for _, c := range t.Requires {
			if !slices.Contains(f.vocabulary, c) {
				return fmt.Errorf("%s requires the compartment %q, which %s does not declare -- a requirement nothing can satisfy is a tool nobody can call",
					t.Name, c, f.path)
			}
		}
	}
	return nil
}

// Vocabulary is the compartments this deployment declared, sorted. rund checks
// its catalogue against it at boot.
func (f *File) Vocabulary() []string { return append([]string(nil), f.vocabulary...) }

// Generation identifies the file's content, for the startup and reload lines.
func (f *File) Generation() string { return f.generation }

// Path is where it was read from.
func (f *File) Path() string { return f.path }
