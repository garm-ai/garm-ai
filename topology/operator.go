package topology

import (
	"fmt"

	"github.com/nats-io/jwt/v2"
	"github.com/nats-io/nkeys"
)

// Operator is what the root ceremony produces. Root leaves the machine; Signing
// and JWT go to the issuance environment.
type Operator struct {
	Root    nkeys.KeyPair
	Signing nkeys.KeyPair
	JWT     string
}

// InitOperator is the ONE place an operator key is created. The JWT it writes is
// root-signed, lists exactly the signing key, and turns StrictSigningKeyUsage on
// -- which is what makes the SERVER refuse an account signed by the root or a
// user signed by an account's identity key (spec §0). It names no system account:
// none exists yet; the server configuration names it.
func InitOperator() (Operator, error) {
	root, err := nkeys.CreateOperator()
	if err != nil {
		return Operator{}, err
	}
	signing, err := nkeys.CreateOperator()
	if err != nil {
		return Operator{}, err
	}
	signPub, err := signing.PublicKey()
	if err != nil {
		return Operator{}, err
	}
	encoded, err := encodeOperator(root, signPub)
	if err != nil {
		return Operator{}, err
	}
	return Operator{Root: root, Signing: signing, JWT: encoded}, nil
}

// ReplaceSigningKey is the operator-level rotation's first half: a new signing
// key, and an operator JWT listing it beside the current one. Retiring the old
// one is spec §3's deferred step; this exists so the server's acceptance of a
// replacement key is proved now.
func ReplaceSigningKey(root nkeys.KeyPair, current string) (nkeys.KeyPair, string, error) {
	signing, err := nkeys.CreateOperator()
	if err != nil {
		return nil, "", err
	}
	signPub, err := signing.PublicKey()
	if err != nil {
		return nil, "", err
	}
	encoded, err := encodeOperator(root, signPub, current)
	if err != nil {
		return nil, "", err
	}
	return signing, encoded, nil
}

// encodeOperator is the one operator claim this module builds: root-signed,
// strict, listing exactly the given signing keys.
func encodeOperator(root nkeys.KeyPair, signingKeys ...string) (string, error) {
	rootPub, err := root.PublicKey()
	if err != nil {
		return "", err
	}
	oc := jwt.NewOperatorClaims(rootPub)
	oc.Name = "garm"
	oc.StrictSigningKeyUsage = true
	oc.SigningKeys.Add(signingKeys...)
	encoded, err := oc.Encode(root)
	if err != nil {
		return "", fmt.Errorf("topology: encoding the operator: %w", err)
	}
	return encoded, nil
}
