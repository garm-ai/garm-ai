package observe

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/nats-io/nkeys"
)

// CallerNames labels a caller's account key with the name the topology issued it
// under. A label, not an identity: the key is what the server placed in the
// subject; the name is what a person reads. An account the table does not know
// is reported by key alone and never dropped (spec §1.1). A nil table knows
// nobody, and that is fine.
type CallerNames map[string]string

// LoadCallerNames reads the callers.json garmctl topology writes: name -> key,
// inverted here to key -> name. An empty path is no table and no error.
func LoadCallerNames(path string) (CallerNames, error) {
	if path == "" {
		return nil, nil
	}
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var byName map[string]string
	if err := json.Unmarshal(raw, &byName); err != nil {
		return nil, fmt.Errorf("%s: %w", path, err)
	}
	names := CallerNames{}
	for name, key := range byName {
		// A mistyped or hand-edited key would leave attribution intact (the key on
		// the span is the server's) and make a name-filtered dashboard lie; refuse.
		if !nkeys.IsValidPublicAccountKey(key) {
			return nil, fmt.Errorf("%s: %q is not a public account key (for %q)", path, key, name)
		}
		if prev, dup := names[key]; dup {
			// A label that could be either is a lie; refuse rather than pick.
			return nil, fmt.Errorf("%s: %q and %q both name account %s", path, prev, name, key)
		}
		names[key] = name
	}
	return names, nil
}

// Name is the label for key, or "" and false.
func (c CallerNames) Name(key string) (string, bool) {
	n, ok := c[key]
	return n, ok
}
