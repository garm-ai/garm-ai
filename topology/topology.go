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

// Keys is what signs.
//
// NOT YET THE SHAPE SPEC §5.1 DESCRIBES, and said plainly: Operator here signs the
// operator JWT itself and every account, so it IS the root, and users are signed by
// each account's identity key rather than by an account signing key. §5.1 wants the
// root offline, signing only operator signing keys, with accounts carrying signing
// keys for users. That is an input-shape change to this struct and to the generator
// -- a root-signed operator JWT taken as input, a signing keypair per account -- and
// it has to land before §10 step 5's first precondition can be ticked. Found in
// review; recorded in the spec's status and §13 rather than fixed in the same
// pass, because it changes what a deployment keeps and is its own task.
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
	// Rotate reissues every credential and revokes every previous one -- spec §5's
	// "issue the new credential, restart that one process, revoke the old", asked
	// for explicitly. Without it, a credential whose permission set is unchanged
	// is carried forward untouched (spec §4.2), so adding one tool restarts one
	// service and not every process on the bus.
	Rotate bool
}

// DefaultExpiry: long enough never to cause a reconnect storm, short enough that
// a leaked credential nobody noticed does not live forever.
const DefaultExpiry = 365 * 24 * time.Hour

// Limits every account carries, in its JWT, where the server enforces them
// regardless of how it is otherwise configured. Constants rather than inputs
// until a deployment needs different ones; when one does, they become Input
// fields with these as defaults, and the test that pins them moves with them.
const (
	// MaxPayload is the ceiling on one message. Large artefacts do not cross this
	// bus by rule -- they go to an object store and a reference crosses -- so a
	// request over this is INVALID before it is sent, not a transport error after.
	// NATS's own default, stated here so that it is a decision and not a default.
	MaxPayload = 1 << 20
	// CallerConnections bounds how many connections one caller account may hold
	// open. A front door needs a handful; a batch job needs one. A caller holding
	// hundreds is either misbehaving or a sign the account should be split.
	CallerConnections = 64
)

// Credential is one process's identity. Seed is in Output only, never in the
// Manifest.
type Credential struct {
	Name    string
	Account string
	Public  string
	JWT     string
	Seed    string
	// IssuedAt is the JWT's own iat, unix seconds -- the wall clock at encoding,
	// which is what the server compares a revocation against.
	IssuedAt int64
}

// Revocation is an instruction to the deployment: this user, in this account,
// is revoked for every credential issued before At. Name is the credential's,
// so a deployment can find the file it must stop deploying.
type Revocation struct {
	Name    string
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
