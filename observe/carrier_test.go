package observe_test

import (
	"testing"

	"github.com/garm-ai/garm-ai/observe"
)

// nats.Header.Get is case-sensitive and the W3C header is lower-case
// "traceparent"; propagation.HeaderCarrier would write "Traceparent" and the
// other end would read nothing. The carrier writes lower-case and reads
// whichever case arrived.
func TestCarrierWritesLowerCaseAndReadsAnyCase(t *testing.T) {
	h := map[string][]string{}
	c := observe.HeaderCarrier(h)
	c.Set("Traceparent", "00-aa-bb-01")
	if _, ok := h["traceparent"]; !ok {
		t.Fatalf("stored under %v, want lower-case traceparent", keys(h))
	}
	if got := c.Get("TRACEPARENT"); got != "00-aa-bb-01" {
		t.Fatalf("Get(TRACEPARENT) = %q", got)
	}
	h["Tracestate"] = []string{"x=y"}
	if got := c.Get("tracestate"); got != "x=y" {
		t.Fatalf("Get(tracestate) = %q; a canonical-case header that arrived must still be read", got)
	}
	if n := len(c.Keys()); n != 2 {
		t.Fatalf("Keys() has %d entries, want 2", n)
	}
}

func keys(h map[string][]string) []string {
	out := make([]string, 0, len(h))
	for k := range h {
		out = append(out, k)
	}
	return out
}
