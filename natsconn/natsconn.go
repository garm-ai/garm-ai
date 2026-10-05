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

// Connect dials with the credential and trust the options name.
func Connect(url string, o Options) (*nats.Conn, error) {
	var opts []nats.Option
	if o.Creds != "" {
		opts = append(opts, nats.UserCredentials(o.Creds))
	}
	if o.CA != "" {
		opts = append(opts, nats.RootCAs(o.CA))
	}
	nc, err := nats.Connect(url, opts...)
	if err != nil {
		if o.Creds == "" && errors.Is(err, nats.ErrAuthorization) {
			return nil, fmt.Errorf("%w -- the server requires a credential; pass --creds", err)
		}
		return nil, err
	}
	return nc, nil
}
