package observe_test

import (
	"errors"
	"testing"

	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/serve"
)

// Kind is the metric label for an outcome: "OK", or the kind without its enum
// prefix, so a dashboard reads INVALID rather than ERROR_KIND_INVALID.
func TestKindIsOKOrTheBareKindName(t *testing.T) {
	cases := map[string]error{
		"OK":          nil,
		"INVALID":     serve.Invalid("x"),
		"UNAVAILABLE": serve.Unavailable("x"),
		"INTERNAL":    errors.New("bare"),
	}
	for want, err := range cases {
		if got := observe.Kind(err); got != want {
			t.Errorf("Kind(%v) = %q, want %q", err, got, want)
		}
	}
}

// Instruments is created once: two calls are the same pointer, so natsserve and
// rundsvc cannot end up with two meters for one idea.
func TestInstrumentsIsASingleton(t *testing.T) {
	if observe.Instruments() != observe.Instruments() {
		t.Fatal("two calls built two instrument sets")
	}
	if observe.Instruments().ToolCalls == nil {
		t.Fatal("ToolCalls is nil")
	}
}
