package run

import (
	"fmt"
)

// PrincipalKind is what sort of thing a principal is. Typed from the first line
// because a grant is a DURABLE RECORD: grants written today will still exist
// when a person can connect, and a grant keyed by a bare string could not be
// told apart from a person's once both were strings. The alternative -- a
// string now, a type later -- is a migration of the one kind of record that
// must never be ambiguous.
type PrincipalKind string

const (
	// KindAccount is a NATS account, proved by the server placing its key in the
	// subject (identity spec §3). THE ONLY KIND THIS BUILD CAN PROVE.
	KindAccount PrincipalKind = "account"
	// KindPerson and KindService arrive with auth callout (identity spec §11,
	// slice 2): a connection identified at connect, not a header anyone can set.
	// Declared here so a grant file written today can name one and be refused
	// for the right reason rather than parsed as an account.
	KindPerson  PrincipalKind = "person"
	KindService PrincipalKind = "service"
)

// Principal is who is asking. Derived from what the transport proved, never
// stored twice: see PrincipalOf.
type Principal struct {
	Kind PrincipalKind
	ID   string
}

// Zero reports whether the transport proved nobody.
func (p Principal) Zero() bool { return p.Kind == "" || p.ID == "" }

// String is what a refusal and a log line carry: the kind, and enough of the id
// to recognise. The full id stays in the struct -- an account key is 56
// characters and a refusal nobody can read is a refusal nobody can act on.
func (p Principal) String() string {
	if p.Zero() {
		return "an unidentified caller"
	}
	id := p.ID
	if len(id) > 12 {
		id = id[:12] + "…"
	}
	return fmt.Sprintf("%s:%s", p.Kind, id)
}

// PrincipalOf is the principal a call's envelope proves. ONE spelling: Headers
// keeps the account key the server placed in the subject, and this derives the
// principal from it. A second field holding the same fact is the most expensive
// bug this repository has had (see tool.proto's `name`).
func PrincipalOf(h Headers) Principal {
	if h.Caller == "" {
		return Principal{}
	}
	return Principal{Kind: KindAccount, ID: h.Caller}
}

// Seen is what a visibility decision needs of a run -- who started it and on
// whose behalf -- so the authority package imports no store type.
type Seen struct {
	Principal Principal
	ActsFor   *Principal
}
