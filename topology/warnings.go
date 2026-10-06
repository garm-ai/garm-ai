package topology

import (
	"fmt"
	"sort"
	"time"
)

// Warnings is what an issuance and --status say about a manifest that is
// heading somewhere an operator should know about before arriving. Each is one
// sentence with the numbers and names in it; none is an error -- the issuance
// is correct -- and each has a threshold the caller chooses:
//
//   - an account holding more than maxPerAccount credentials: rotating its
//     signing key reissues all of them, and every one must be rolled out before
//     the old key can be retired. That is the moment to shard, before it hurts.
//   - credentials expiring within window: nothing renews a credential, so an
//     estate issued in one week dies in one week a year later unless reissued.
//     The earliest is named with its date. An already-expired credential is a
//     process that cannot reconnect, and is said separately.
//   - an entry with no recorded expiry (a manifest from before the field): named,
//     never silently treated as living forever.
func Warnings(m Manifest, now time.Time, maxPerAccount int, window time.Duration) []string {
	var out []string

	perAccount := map[string]int{}
	for _, e := range m.Entries {
		perAccount[e.Account]++
	}
	accounts := make([]string, 0, len(perAccount))
	for a := range perAccount {
		accounts = append(accounts, a)
	}
	sort.Strings(accounts)
	for _, a := range accounts {
		if n := perAccount[a]; maxPerAccount > 0 && n > maxPerAccount {
			out = append(out, fmt.Sprintf("%s holds %d credentials (threshold %d): rotating its signing key reissues all of them, and every one must be rolled out before the old key can be retired -- shard the tool accounts before that is painful",
				a, n, maxPerAccount))
		}
	}

	var expired, soon, unknown []Entry
	for _, e := range m.Entries {
		switch {
		case e.ExpiresAt == 0:
			unknown = append(unknown, e)
		case !now.Before(time.Unix(e.ExpiresAt, 0)):
			expired = append(expired, e)
		case window > 0 && time.Unix(e.ExpiresAt, 0).Before(now.Add(window)):
			soon = append(soon, e)
		}
	}
	byExpiry := func(es []Entry) { sort.Slice(es, func(i, j int) bool { return es[i].ExpiresAt < es[j].ExpiresAt }) }
	if len(expired) > 0 {
		byExpiry(expired)
		out = append(out, fmt.Sprintf("%d credential%s EXPIRED and cannot reconnect: %s (%s) -- reissue now",
			len(expired), plural(len(expired), " has", "s have"), expired[0].Name, time.Unix(expired[0].ExpiresAt, 0).UTC().Format("2006-01-02")))
	}
	if len(soon) > 0 {
		byExpiry(soon)
		out = append(out, fmt.Sprintf("%d credential%s expire%s within %d days; the earliest is %s on %s -- plan a reissue (nothing renews a credential)",
			len(soon), plural(len(soon), "", "s"), plural(len(soon), "s", ""), int(window.Hours()/24),
			soon[0].Name, time.Unix(soon[0].ExpiresAt, 0).UTC().Format("2006-01-02")))
	}
	if len(unknown) > 0 {
		names := make([]string, 0, len(unknown))
		for _, e := range unknown {
			names = append(names, e.Name)
		}
		sort.Strings(names)
		out = append(out, fmt.Sprintf("%d credential%s no recorded expiry (issued before the manifest kept it): %v -- reissue so the date is known",
			len(unknown), plural(len(unknown), " has", "s have"), names))
	}
	return out
}

func plural(n int, one, many string) string {
	if n == 1 {
		return one
	}
	return many
}
