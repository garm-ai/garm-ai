package topology

import (
	"github.com/nats-io/jwt/v2"

	"github.com/garm-ai/garm-ai/natsserve"
)

// The subjects every process needs regardless of role.
const (
	inbox = "_INBOX.>" // replies to this process's own requests
	// crossAccountReply is where a cross-account service reply goes. NOT _INBOX.
	// A process answering an imported service that lacks this receives the call
	// and is silently refused the reply (spec §4.1).
	crossAccountReply = "_R_.>"
	// microDiscovery is what micro.AddService subscribes for PING/INFO/STATS.
	microDiscovery = "$SRV.>"
)

// toolService answers exactly its declared tools. names are tool names.
func toolService(names []string) jwt.Permissions {
	sub := []string{microDiscovery}
	for _, n := range names {
		sub = append(sub, natsserve.Subject(n))
	}
	return jwt.Permissions{
		Sub: jwt.Permission{Allow: sub},
		Pub: jwt.Permission{Allow: []string{crossAccountReply, inbox}},
	}
}

// rund calls every tool through its import and answers every caller.
func rund() jwt.Permissions {
	return jwt.Permissions{
		Pub: jwt.Permission{Allow: []string{"garm.tool.>", crossAccountReply, inbox}},
		Sub: jwt.Permission{Allow: []string{"garm.run.v1.*.>", inbox, microDiscovery}},
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
