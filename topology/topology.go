// Package topology generates a NATS operator-mode topology from the catalogue.
//
// It has exactly two consumers -- the test estate, in process, and
// `garmctl topology`, to disk -- so the configuration that is tested is the
// configuration that is deployed. Nothing else may build accounts or users.
//
// Keys are an INPUT. This package signs with what it is given and never invents
// a key it also trusts; FreshKeys exists for tests and --dev and says so.
package topology

import (
	"time"

	"github.com/nats-io/nkeys"

	"github.com/garm-ai/garm-ai/catalogue"
)

// Account names. Fixed, because the shape of the topology is the design and a
// deployment that renames an account has a different design.
const (
	AccountSYS   = "SYS"
	AccountGARM  = "GARM"
	AccountTOOLS = "TOOLS"
	// CallerPrefix + name is a caller account. Names are a deployment input.
	CallerPrefix = "CALLER-"
)

// Keys is what signs. Operator is a SIGNING key, never the root (spec §5.1).
type Keys struct {
	Operator nkeys.KeyPair
	// Accounts by account name: SYS, GARM, TOOLS, and CALLER-<n> for each caller.
	Accounts map[string]nkeys.KeyPair
}

// Input is everything Generate needs. Previous is REQUIRED; Empty() is explicit.
type Input struct {
	Catalogue *catalogue.Catalogue
	Callers   []string
	Previous  *Manifest
	Keys      Keys
	Now       time.Time
	// Expiry is the floor under revocation (spec §5). Zero means DefaultExpiry.
	Expiry time.Duration
}

// DefaultExpiry: long enough never to cause a reconnect storm, short enough that
// a leaked credential nobody noticed does not live forever.
const DefaultExpiry = 365 * 24 * time.Hour

// Credential is one process's identity. Seed is in Output only, never in the
// Manifest.
type Credential struct {
	Name    string
	Account string
	Public  string
	JWT     string
	Seed    string
}

// Revocation is an instruction to the deployment: this user, in this account,
// is revoked for every credential issued before At.
type Revocation struct {
	Account string
	Public  string
	At      time.Time
	Why     string
}

// Output is what a consumer applies.
type Output struct {
	OperatorJWT string
	// Accounts by name -> encoded account JWT, revocations already applied.
	Accounts    map[string]string
	Credentials []Credential
	Manifest    Manifest
	Revoke      []Revocation
}
