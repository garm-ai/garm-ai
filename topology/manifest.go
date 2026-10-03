package topology

import "time"

// Manifest is the issuance record: the previous topology the generator diffs
// against, and the audit trail revocation-by-generation cannot work without.
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
