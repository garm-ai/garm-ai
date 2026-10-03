package topology

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/nats-io/nkeys"
)

// Manifest is the issuance record: the previous topology the generator diffs
// against, and the audit trail revocation-by-generation cannot work without. It
// is committed beside images.yaml and signed by the operator signing key.
type Manifest struct {
	Generation      int       `json:"generation"`
	CatalogueSHA256 string    `json:"catalogue_sha256"`
	IssuedAt        time.Time `json:"issued_at"`
	Entries         []Entry   `json:"entries"`
}

// Entry is one issued credential, without its seed -- the manifest is a record of
// WHAT was issued, never a place a secret lives.
type Entry struct {
	Name            string `json:"name"`
	Account         string `json:"account"`
	Public          string `json:"public"`
	CatalogueSHA256 string `json:"catalogue_sha256"`
	Generation      int    `json:"generation"`
	PermissionsHash string `json:"permissions_hash"`
}

// Empty is the explicit first manifest. Explicit, because a generator that treated
// "no manifest" as "nothing was issued before" would never revoke anything.
func Empty() *Manifest { return &Manifest{} }

type signed struct {
	Manifest  Manifest `json:"manifest"`
	Signer    string   `json:"signer"`
	Signature string   `json:"signature"` // hex, over the canonical manifest bytes
}

func canonical(m Manifest) ([]byte, error) {
	entries := append([]Entry(nil), m.Entries...)
	sort.Slice(entries, func(i, j int) bool { return entries[i].Name < entries[j].Name })
	m.Entries = entries
	return json.Marshal(m)
}

// Save writes the manifest signed by the operator signing key.
func (m *Manifest) Save(path string, signer nkeys.KeyPair) error {
	body, err := canonical(*m)
	if err != nil {
		return err
	}
	sig, err := signer.Sign(body)
	if err != nil {
		return fmt.Errorf("topology: signing the manifest: %w", err)
	}
	pub, err := signer.PublicKey()
	if err != nil {
		return err
	}
	raw, err := json.MarshalIndent(signed{Manifest: *m, Signer: pub, Signature: hex.EncodeToString(sig)}, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, raw, 0o600)
}

// Load reads a manifest and verifies it was signed by operatorPublic. A manifest
// signed by anything else is refused: the generator trusts its previous state
// only because it was the generator that wrote it.
func Load(path, operatorPublic string) (*Manifest, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var s signed
	if err := json.Unmarshal(raw, &s); err != nil {
		return nil, fmt.Errorf("topology: %s is not a manifest: %w", path, err)
	}
	if s.Signer != operatorPublic {
		return nil, fmt.Errorf("topology: %s was signed by %s, not the operator", path, s.Signer)
	}
	body, err := canonical(s.Manifest)
	if err != nil {
		return nil, err
	}
	sig, err := hex.DecodeString(s.Signature)
	if err != nil {
		return nil, fmt.Errorf("topology: %s: bad signature encoding", path)
	}
	pub, err := nkeys.FromPublicKey(operatorPublic)
	if err != nil {
		return nil, err
	}
	if err := pub.Verify(body, sig); err != nil {
		return nil, fmt.Errorf("topology: %s: signature does not verify", path)
	}
	return &s.Manifest, nil
}

// permissionsHash identifies a permission set across reissues. The JWT's payload
// changes on every issuance (fresh key, new iat), so this hashes the claims
// segment only after decoding would be circular; instead it hashes the encoded
// claims, which differ only when the permissions, tags or expiry do -- all of
// which SHOULD count as a different credential.
func permissionsHash(c Credential) string {
	i := strings.Index(c.JWT, ".")
	j := strings.LastIndex(c.JWT, ".")
	if i < 0 || j <= i {
		return ""
	}
	sum := sha256.Sum256([]byte(c.JWT[i+1 : j]))
	return hex.EncodeToString(sum[:8])
}

// delta compares what was just issued against what the manifest says existed, and
// emits a revocation for every previous entry: retired if it has no successor,
// moved if its successor is in another account, and superseded otherwise.
//
// Superseded is the common case and it is deliberate. Every run issues fresh user
// keys, so the previous credential for a CONTINUING service is revoked too: that
// is the "issue, restart, revoke the old" of spec §5, and it is what makes a
// removed tool's permission actually disappear from a running process rather than
// merely from the next credential.
func delta(in Input, gen int, creds []Credential) (Manifest, []Revocation) {
	m := Manifest{Generation: gen, CatalogueSHA256: in.Catalogue.SHA256, IssuedAt: in.Now}
	now := map[string]Credential{}
	for _, c := range creds {
		now[c.Name] = c
		m.Entries = append(m.Entries, Entry{
			Name: c.Name, Account: c.Account, Public: c.Public,
			CatalogueSHA256: in.Catalogue.SHA256, Generation: gen,
			PermissionsHash: permissionsHash(c),
		})
	}
	var rev []Revocation
	for _, prev := range in.Previous.Entries {
		cur, still := now[prev.Name]
		switch {
		case !still:
			rev = append(rev, Revocation{Account: prev.Account, Public: prev.Public, At: in.Now,
				Why: "retired: no longer in the catalogue"})
		case cur.Account != prev.Account:
			rev = append(rev, Revocation{Account: prev.Account, Public: prev.Public, At: in.Now,
				Why: "moved accounts"})
		default:
			rev = append(rev, Revocation{Account: prev.Account, Public: prev.Public, At: in.Now,
				Why: fmt.Sprintf("superseded by generation %d", gen)})
		}
	}
	sort.Slice(rev, func(i, j int) bool { return rev[i].Public < rev[j].Public })
	return m, rev
}
