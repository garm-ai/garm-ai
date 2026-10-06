// Package natsconn is how a COMMAND connects: with a credential file and a CA.
//
// Four commands -- rund, garmctl call, and the two examples -- need the same ten
// lines, and the previous estate's worst structural bug was one idea implemented
// several times. It lives apart from `call`, which must stay broker-free so that
// generated client code never resolves nats.go.
package natsconn

import (
	"errors"
	"fmt"
	"github.com/nats-io/jwt/v2"
	"os"
	"time"

	"github.com/nats-io/nats.go"
)

// Options is what a deployment hands a process. Both are paths; both are what the
// generator wrote (spec §5) or the deployment's own CA.
type Options struct {
	// Creds is a NATS credentials file: the user JWT and its seed. Required in
	// operator mode -- without it the server refuses the connection, and the error
	// below says which flag was missing rather than 'authorization violation'.
	Creds string
	// CA is a PEM file the server's certificate chains to. Empty means the system
	// roots, which is right for a public CA and wrong for a test estate.
	CA string
}

// Connect dials with the credential and trust the options name. extra is for the
// one or two things a command wants beyond those -- a connection name, so that
// a tool asking the cluster about connections can see its own.
func Connect(url string, o Options, extra ...nats.Option) (*nats.Conn, error) {
	var opts []nats.Option
	if o.Creds != "" {
		opts = append(opts, nats.UserCredentials(o.Creds))
	}
	if o.CA != "" {
		opts = append(opts, nats.RootCAs(o.CA))
	}
	opts = append(opts, extra...)
	nc, err := nats.Connect(url, opts...)
	if err != nil {
		if o.Creds == "" && errors.Is(err, nats.ErrAuthorization) {
			return nil, fmt.Errorf("%w -- the server requires a credential; pass --creds", err)
		}
		return nil, err
	}
	return nc, nil
}

// CredentialExpiry reads the expiry of the user JWT in a credentials file, so a
// process can say at startup when its own credential dies. Nothing renews a
// credential; the date in the log is the notice. Zero when the JWT carries none.
func CredentialExpiry(path string) (time.Time, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return time.Time{}, err
	}
	token, err := jwt.ParseDecoratedJWT(raw)
	if err != nil {
		return time.Time{}, fmt.Errorf("%s: %w", path, err)
	}
	uc, err := jwt.DecodeUserClaims(token)
	if err != nil {
		return time.Time{}, fmt.Errorf("%s: %w", path, err)
	}
	if uc.Expires == 0 {
		return time.Time{}, nil
	}
	return time.Unix(uc.Expires, 0).UTC(), nil
}
