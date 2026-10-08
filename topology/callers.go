package topology

import (
	"fmt"
	"strings"

	"github.com/nats-io/jwt/v2"

	"github.com/garm-ai/garm-ai/observe"
)

// CallerNames is the public name -> account-key table a deployment hands rund as
// --callers, so a dashboard reads "studio" beside the key the server placed in
// the subject (observability spec §1.1). Nothing secret: both halves are already
// in the account JWTs. Callers only -- SYS, GARM and TOOLS are not callers.
func CallerNames(out *Output) (map[string]string, error) {
	names := map[string]string{}
	for account, encoded := range out.Accounts {
		if !strings.HasPrefix(account, CallerPrefix) {
			continue
		}
		ac, err := jwt.DecodeAccountClaims(encoded)
		if err != nil {
			return nil, fmt.Errorf("account %s: %w", account, err)
		}
		names[strings.TrimPrefix(account, CallerPrefix)] = ac.Subject
	}
	return names, nil
}

// CallerKeys reads the table CallerNames wrote and returns the lookup a grant
// file's principals resolve through: a grant names an ACCOUNT, "CALLER-studio",
// and the table names the caller, "studio", so the prefix is applied here.
//
// Here rather than in each binary that reads grants, because the prefix is this
// package's and a copy of it that drifted would resolve nothing -- every grant
// would silently fail to match and every call be refused "no grant". rund takes
// this at boot and `garmctl grants check` takes it without starting rund.
func CallerKeys(path string) (func(account string) (key string, ok bool), error) {
	names, err := observe.LoadCallerNames(path)
	if err != nil {
		return nil, err
	}
	byAccount := make(map[string]string, len(names))
	for key, name := range names {
		byAccount[CallerPrefix+name] = key
	}
	return func(account string) (string, bool) {
		key, ok := byAccount[account]
		return key, ok
	}, nil
}
