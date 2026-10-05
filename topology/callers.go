package topology

import (
	"fmt"
	"strings"

	"github.com/nats-io/jwt/v2"
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
