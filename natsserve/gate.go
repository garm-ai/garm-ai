package natsserve

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
// never answers, which is the same silent shape as a missing _R_.> permission. The
// credential is in the process's own hands, so the check is local, deterministic,
// and needs no round trip (spec §4.3).
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
	allow := uc.Permissions.Sub.Allow
	if len(allow) == 0 {
		return nil // unrestricted
	}
	var missing []string
	for _, s := range subjects {
		if !covered(s, allow) {
			missing = append(missing, s)
		}
	}
	if len(missing) > 0 {
		return fmt.Errorf("this credential does not permit answering %s; the catalogue it was issued from does not declare it",
			strings.Join(missing, ", "))
	}
	return nil
}

// covered reports whether any allow pattern matches subject, with NATS wildcards.
func covered(subject string, allow []string) bool {
	st := strings.Split(subject, ".")
	for _, pat := range allow {
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
