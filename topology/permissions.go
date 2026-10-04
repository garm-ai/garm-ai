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

// replies is the ONLY way a service answers: NATS's allow-responses permission
// lets a subscriber publish a reply to a request it actually received, and
// nothing else -- across accounts included, where the reply subject is the
// server's own _R_.> rather than an inbox.
//
// This replaced an explicit publish allow on _R_.> and _INBOX.>. That worked and
// was over-broad: a tool could publish to ANY reply subject in its account. With
// allow-responses a tool service has no publish permission at all. Found as a
// review suggestion and proved by probe: the whole chain runs with it.
func replies() *jwt.ResponsePermission { return &jwt.ResponsePermission{MaxMsgs: 1} }

// toolService answers exactly its declared tools, and may publish nothing but
// a reply to a request it received. names are tool names.
func toolService(names []string) jwt.Permissions {
	sub := []string{microDiscovery}
	for _, n := range names {
		sub = append(sub, natsserve.Subject(n))
	}
	return jwt.Permissions{
		Sub:  jwt.Permission{Allow: sub},
		Resp: replies(),
	}
}

// rund calls every tool through its import, and answers every caller -- the
// latter as a reply, not a publish.
func rund() jwt.Permissions {
	return jwt.Permissions{
		Pub:  jwt.Permission{Allow: []string{"garm.tool.>"}},
		Sub:  jwt.Permission{Allow: []string{"garm.run.v1.*.>", inbox, microDiscovery}},
		Resp: replies(),
	}
}

// caller publishes the run subjects it publishes today; the import rewrites them.
func caller() jwt.Permissions {
	return jwt.Permissions{
		Pub: jwt.Permission{Allow: []string{"garm.run.v1.>"}},
		Sub: jwt.Permission{Allow: []string{inbox}},
	}
}

// ops holds the system account and is restricted by nothing here: the system
// account's own rules apply, and nothing in the data path receives it.
func ops() jwt.Permissions { return jwt.Permissions{} }
