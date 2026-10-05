package topology

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"time"

	"github.com/nats-io/jwt/v2"
	"github.com/nats-io/nkeys"
)

// Manifest is the issuance record: the previous topology the generator diffs
// against, and the audit trail revocation-by-generation cannot work without. It
// is committed beside images.yaml and signed by the operator signing key.
type Manifest struct {
	Generation      int       `json:"generation"`
	CatalogueSHA256 string    `json:"catalogue_sha256"`
	IssuedAt        time.Time `json:"issued_at"`
	// Accounts records every account's public keys -- identity, signing, and a
	// retiring signing key between the two steps of a rotation (spec §4, §5).
	Accounts map[string]AccountRecord `json:"accounts"`
	Entries  []Entry                  `json:"entries"`
}

// AccountRecord is one account's keys as the manifest knows them. All public.
type AccountRecord struct {
	Identity string `json:"identity"`
	Signing  string `json:"signing"`
	Retiring string `json:"retiring,omitempty"`
	// Retired is every signing key ever dropped from this account, by the
	// generation that dropped it -- a retirement is recorded, not just done.
	Retired map[string]int `json:"retired,omitempty"`
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
	// IssuedAt is the credential's iat. A revocation is dated no earlier than
	// this, because the server honours a revocation only for credentials issued
	// at or before its timestamp -- and in.Now is the caller's clock, not the
	// encoder's.
	IssuedAt int64 `json:"issued_at"`
	// SigningKey is the public key that signed this credential, so a rotation
	// can say what it reissued and a retirement can check nothing still names
	// the old key.
	SigningKey string `json:"signing_key"`
	// Reason is why this entry was issued: "new", "catalogue", "rotation";
	// empty for a carry-forward.
	Reason string `json:"reason,omitempty"`
}

// Empty is the explicit first manifest. Explicit, because a generator that treated
// "no manifest" as "nothing was issued before" would never revoke anything.
func Empty() *Manifest { return &Manifest{Accounts: map[string]AccountRecord{}} }

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

// Load reads a manifest and verifies it was signed by one of signers -- the
// operator signing keys the operator JWT lists, so a manifest signed by a key
// that has since been replaced (and is still listed) loads. A manifest signed by
// anything else is refused: the generator trusts its previous state only because
// it was the generator that wrote it.
func Load(path string, signers ...string) (*Manifest, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var s signed
	if err := json.Unmarshal(raw, &s); err != nil {
		return nil, fmt.Errorf("topology: %s is not a manifest: %w", path, err)
	}
	var listed bool
	for _, k := range signers {
		listed = listed || s.Signer == k
	}
	if !listed {
		return nil, fmt.Errorf("topology: %s was signed by %s, not an operator signing key the operator lists", path, s.Signer)
	}
	operatorPublic := s.Signer
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
	if s.Manifest.Accounts == nil {
		return nil, fmt.Errorf("topology: %s predates signing keys and cannot be continued; start again with --first under the new key layout", path)
	}
	return &s.Manifest, nil
}

// permissionsHash is over the PERMISSION SET -- account, subscribe allow, publish
// allow -- and nothing issuance-specific, so it is the same across two issuances
// of the same thing. That stability is what lets the generator carry an entry
// forward instead of reissuing it, and what lets a reader compare a credential's
// manifest entry with what the startup gate would check.
func permissionsHash(account string, p jwt.Permissions) string {
	sub := append([]string(nil), p.Sub.Allow...)
	pub := append([]string(nil), p.Pub.Allow...)
	sort.Strings(sub)
	sort.Strings(pub)
	body, _ := json.Marshal(struct {
		Account string   `json:"account"`
		Sub     []string `json:"sub"`
		Pub     []string `json:"pub"`
	}{account, sub, pub})
	sum := sha256.Sum256(body)
	return hex.EncodeToString(sum[:8])
}

// delta compares the manifest just built against the previous one and emits a
// revocation for every previous credential that is no longer current: retired if
// its name is gone, moved if its account changed, superseded if it was reissued.
// A carried-forward entry has the same public key and is left alone.
func delta(prev *Manifest, cur Manifest, now time.Time) []Revocation {
	current := map[string]Entry{}
	for _, e := range cur.Entries {
		current[e.Name] = e
	}
	var rev []Revocation
	for _, p := range prev.Entries {
		c, still := current[p.Name]
		// Never before the credential's own iat, or the server ignores it.
		at := now
		if issued := time.Unix(p.IssuedAt, 0); issued.After(at) {
			at = issued
		}
		switch {
		case !still:
			rev = append(rev, Revocation{Name: p.Name, Account: p.Account, Public: p.Public, At: at,
				Kind: Retired, Why: "retired: no longer in the catalogue"})
		case c.Public == p.Public:
			// carried forward, untouched
		case c.Account != p.Account:
			rev = append(rev, Revocation{Name: p.Name, Account: p.Account, Public: p.Public, At: at,
				Kind: Moved, Why: "moved accounts"})
		default:
			rev = append(rev, Revocation{Name: p.Name, Account: p.Account, Public: p.Public, At: at,
				Kind: Superseded, Why: fmt.Sprintf("superseded by generation %d", cur.Generation)})
		}
	}
	sort.Slice(rev, func(i, j int) bool { return rev[i].Public < rev[j].Public })
	return rev
}
