package topology_test

import (
	"testing"

	"github.com/nats-io/jwt/v2"

	"github.com/garm-ai/garm-ai/topology"
)

// Review finding: no account carried any limit, so a valid caller credential
// could saturate rund, and a misconfigured server's payload ceiling was the only
// one. Every account now carries a payload ceiling the generator states, and a
// caller account carries a connection ceiling -- in the JWT, where the server
// enforces it regardless of its own configuration. Bearer tokens are disallowed
// on every account: a credential here is a seed-signed nkey, never a string.
func TestEveryAccountCarriesLimitsAndDisallowsBearer(t *testing.T) {
	out := generate(t, "studio")
	for name, encoded := range out.Accounts {
		ac, err := jwt.DecodeAccountClaims(encoded)
		if err != nil {
			t.Fatal(err)
		}
		if ac.Limits.Payload <= 0 {
			t.Errorf("%s: no payload limit; a tool could be sent a gigabyte", name)
		}
		if ac.Limits.Payload > topology.MaxPayload {
			t.Errorf("%s: payload limit %d exceeds the stated ceiling %d", name, ac.Limits.Payload, topology.MaxPayload)
		}
		if !ac.Limits.DisallowBearer {
			t.Errorf("%s: bearer tokens allowed; a credential must prove its key", name)
		}
		if name == topology.CallerPrefix+"studio" && ac.Limits.Conn <= 0 {
			t.Errorf("%s: a caller account with no connection limit can hold the server open", name)
		}
	}
}
