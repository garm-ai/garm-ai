// Package topology generates a NATS operator-mode topology from the catalogue.
//
// It has exactly two consumers -- the test estate, in process, and
// `garmctl topology`, to disk -- so the configuration that is tested is the
// configuration that is deployed. Nothing else may build accounts or users.
//
// The root and the operator signing key are an INPUT this package never
// produces (operator.go is the one place an operator key is created, for the
// ceremony); account keys are born here on first sight of an account and handed
// back in Output.NewKeys. FreshKeys exists for tests and --dev and says so.
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

// Keys is what signs. The shape the identity spec's §5.1 describes and the
// signing-keys spec §1 pins: THE ROOT IS NOT HERE. OperatorJWT is root-signed and
// taken as given; OperatorSigning signs accounts; each account's Signing signs
// its users and activations; Identity is a PUBLIC key, so nothing here can ever
// encode with an identity seed.
type Keys struct {
	OperatorJWT     string
	OperatorSigning nkeys.KeyPair
	// Accounts by name: SYS, GARM, TOOLS, CALLER-<n>. An account missing here is
	// NEW: Generate mints its keys and returns them in Output.NewKeys.
	Accounts map[string]AccountKeys
}

// AccountKeys is one account's keys as the issuance environment holds them.
type AccountKeys struct {
	Identity string // public; the seed is archived by the caller, read by nothing
	Signing  nkeys.KeyPair
}

// NewAccountKeys is what Generate minted and the caller must keep: both pairs for
// a new account; Signing only for a rotation (Identity nil).
type NewAccountKeys struct {
	Identity nkeys.KeyPair
	Signing  nkeys.KeyPair
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
	// RotateSigning names accounts whose signing key is replaced: a new key is
	// minted and listed beside the old, and every credential of the account is
	// reissued under it (spec §4 step one). The old key is dropped at the next
	// issuance that finds it retiring.
	RotateSigning []string
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
	// SigningKey is the public key that signed the JWT.
	SigningKey string
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
	// NewKeys is every account key Generate minted: a new account's pair, or a
	// rotation's new signing key. The caller writes them where --keys-out says.
	NewKeys map[string]NewAccountKeys
}
