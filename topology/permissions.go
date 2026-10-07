package topology

import (
	"github.com/nats-io/jwt/v2"

	"github.com/garm-ai/garm-ai/natsserve"
)

// The subjects every process needs regardless of role.
const (
	inbox = "_INBOX.>" // replies to this process's OWN requests arrive here
	// microDiscovery is what micro.AddService subscribes for PING/INFO/STATS.
	microDiscovery = "$SRV.>"
)

// The event feed's subjects (push spec §2): what rund exports and publishes
// on, keyed by the owner's account at position four; and what a caller
// subscribes to in its own account, the import mapping one to the other.
const (
	OutExport = "garm.run.v1.*.out.>"
	OutLocal  = "garm.run.v1.out.>"
)

// callerVerbs is what a caller may publish: the three verbs of the run
// service, and nothing else -- not the event prefix, which it only receives.
var callerVerbs = []string{"garm.run.v1.invoke", "garm.run.v1.fetch", "garm.run.v1.events"}

// replies is the ONLY way a service answers: NATS's allow-responses permission
// lets a subscriber publish a reply to a request it actually received, and
// nothing else -- across accounts included, where the reply subject is the
// server's own _R_.> rather than an inbox.
//
// This replaced an explicit publish allow on _R_.> and _INBOX.>. That worked and
// was over-broad: a tool could publish to ANY reply subject in its account.
func replies() *jwt.ResponsePermission { return &jwt.ResponsePermission{MaxMsgs: 1} }

// denyAllPublish is what makes allow-responses MEAN something. In NATS an EMPTY
// publish allow-list is not "publish nothing" -- it is unrestricted. A probe
// proved it: with no publish permission at all and no allow-responses, a tool's
// reply still went out, because nothing was restricting it. The first version of
// this file shipped exactly that and a test asserted it as "publishes nothing".
// Deny everything explicitly; allow-responses is then the only way out.
func denyAllPublish() jwt.Permission { return jwt.Permission{Deny: []string{">"}} }

// toolService answers exactly its declared tools, and may publish nothing but
// a reply to a request it received. names are tool names.
func toolService(names []string) jwt.Permissions {
	sub := []string{microDiscovery}
	for _, n := range names {
		sub = append(sub, natsserve.Subject(n))
	}
	return jwt.Permissions{
		Sub:  jwt.Permission{Allow: sub},
		Pub:  denyAllPublish(),
		Resp: replies(),
	}
}

// rund calls every tool through its import, and answers every caller -- the
// latter as a reply, not a publish.
func rund() jwt.Permissions {
	return jwt.Permissions{
		Pub:  jwt.Permission{Allow: []string{"garm.tool.>", OutExport}},
		Sub:  jwt.Permission{Allow: []string{"garm.run.v1.*.>", inbox, microDiscovery}},
		Resp: replies(),
	}
}

// caller publishes the run service's three verbs, which the import rewrites,
// and receives its own runs' events under the local event prefix.
func caller() jwt.Permissions {
	return jwt.Permissions{
		Pub: jwt.Permission{Allow: append([]string(nil), callerVerbs...)},
		Sub: jwt.Permission{Allow: []string{inbox, OutLocal}},
	}
}

// ops holds the system account and is restricted by nothing here: the system
// account's own rules apply, and nothing in the data path receives it.
func ops() jwt.Permissions { return jwt.Permissions{} }
