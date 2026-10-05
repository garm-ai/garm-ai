package natsmicro

import (
	"fmt"
	"strings"

	"github.com/nats-io/jwt/v2"
	"github.com/nats-io/nats.go"
)

// gate refuses to start a service whose mounts its own credential cannot cover.
//
// Why this exists: a subscription the server does not permit is refused
// ASYNCHRONOUSLY, after Start has returned. The service then looks healthy and
// never answers. The credential is in the process's own hands, so the check is
// local, deterministic, and needs no round trip (spec §4.3).
//
// It lives here, not in natsserve, because this is where every mount's subject
// already is -- and because rund mounts through this package directly. When the
// gate was natsserve's, rund was ungated.
//
// A connection with no JWT -- the open server some tests use on purpose -- is not
// gated: there is nothing to check against, and no permission to violate.
func gate(nc *nats.Conn, subjects []string) error {
	if nc.Opts.UserJWT == nil {
		return nil
	}
	token, err := nc.Opts.UserJWT()
	if err != nil {
		return fmt.Errorf("reading this process's own credential: %w", err)
	}
	uc, err := jwt.DecodeUserClaims(token)
	if err != nil {
		return fmt.Errorf("this process's credential does not decode: %w", err)
	}
	return check(uc.Permissions, subjects)
}

// check is the gate's pure core: every subject must be covered by the subscribe
// allow-list (an EMPTY allow-list is unrestricted, as NATS reads it) and by none
// of the deny-list. A denied subject is refused by name, because the server would
// refuse it too -- after Start returned, silently.
func check(p jwt.Permissions, subjects []string) error {
	var missing, denied []string
	for _, s := range subjects {
		if len(p.Sub.Allow) > 0 && !covered(s, p.Sub.Allow) {
			missing = append(missing, s)
		}
		if covered(s, p.Sub.Deny) {
			denied = append(denied, s)
		}
	}
	switch {
	case len(denied) > 0:
		return fmt.Errorf("this credential explicitly denies subscribing to %s", strings.Join(denied, ", "))
	case len(missing) > 0:
		return fmt.Errorf("this credential does not permit answering %s; the catalogue it was issued from does not declare it",
			strings.Join(missing, ", "))
	}
	return nil
}

// covered reports whether any pattern matches subject, with NATS wildcards.
func covered(subject string, patterns []string) bool {
	st := strings.Split(subject, ".")
	for _, pat := range patterns {
		if match(st, strings.Split(pat, ".")) {
			return true
		}
	}
	return false
}

func match(subj, pat []string) bool {
	for i, p := range pat {
		switch {
		case p == ">":
			return i < len(subj)
		case i >= len(subj):
			return false
		case p == "*", p == subj[i]:
		default:
			return false
		}
	}
	return len(subj) == len(pat)
}
