package observe

import "strings"

// HeaderCarrier carries trace context on a NATS message's headers (nats.Header
// is map[string][]string, so it converts directly).
//
// Not propagation.HeaderCarrier, which is http.Header and canonicalises keys to
// "Traceparent" -- while nats.Header.Get is case-sensitive and the W3C header is
// defined lower-case, so the other end would read nothing. This writes
// lower-case and reads whichever case arrived.
type HeaderCarrier map[string][]string

func (c HeaderCarrier) Get(key string) string {
	if v, ok := c[strings.ToLower(key)]; ok && len(v) > 0 {
		return v[0]
	}
	for k, v := range c {
		if strings.EqualFold(k, key) && len(v) > 0 {
			return v[0]
		}
	}
	return ""
}

func (c HeaderCarrier) Set(key, value string) { c[strings.ToLower(key)] = []string{value} }

func (c HeaderCarrier) Keys() []string {
	keys := make([]string, 0, len(c))
	for k := range c {
		keys = append(keys, k)
	}
	return keys
}
