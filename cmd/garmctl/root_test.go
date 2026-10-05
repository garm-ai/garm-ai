package main

import (
	"bytes"
	"context"
	"strings"
	"testing"
)

// runRoot runs the whole command the way main does -- through root(), so the
// persistent hooks fire -- and returns what reached stderr.
func runRoot(t *testing.T, args ...string) string {
	t.Helper()
	cmd, stop := root()
	var stderr bytes.Buffer
	cmd.SetOut(&stderr)
	cmd.SetErr(&stderr)
	cmd.SetArgs(args)
	_ = cmd.Execute() // the failure is the point; the hooks ran either way
	_ = stop(context.Background())
	return stderr.String()
}

// A CLI in a pipeline gets no observability line unless an endpoint is set:
// the "log effective configuration" rule is for daemons, and stderr noise on
// every `garmctl call` is the wrong trade. With an endpoint, the one line says
// where things go -- which is the case where a person wants to know.
func TestGarmctlIsQuietAboutObservabilityUnlessAnEndpointIsSet(t *testing.T) {
	t.Setenv("OTEL_EXPORTER_OTLP_ENDPOINT", "")
	t.Setenv("OTEL_SDK_DISABLED", "")
	if out := runRoot(t, "compose", "does-not-exist.yaml"); strings.Contains(out, "observability") {
		t.Fatalf("an observability line with no endpoint set:\n%s", out)
	}
	t.Setenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://127.0.0.1:1/api/garm")
	if out := runRoot(t, "compose", "does-not-exist.yaml"); !strings.Contains(out, "exporter=otlp") {
		t.Fatalf("no observability line with an endpoint set:\n%s", out)
	}
}
