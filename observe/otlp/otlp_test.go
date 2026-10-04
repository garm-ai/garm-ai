package otlp_test

import (
	"bytes"
	"context"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"

	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/observe/otlp"
)

func start(t *testing.T, env map[string]string) (log string, stop func(context.Context) error) {
	t.Helper()
	for _, k := range []string{"OTEL_EXPORTER_OTLP_ENDPOINT", "OTEL_EXPORTER_OTLP_HEADERS", "OTEL_SDK_DISABLED", "OTEL_SERVICE_NAME"} {
		t.Setenv(k, "") // every variable pinned, so the test does not read the shell's
	}
	for k, v := range env {
		t.Setenv(k, v)
	}
	var out bytes.Buffer
	stop, err := otlp.Start(context.Background(), "probe", slog.New(slog.NewTextHandler(&out, nil)))
	if err != nil {
		t.Fatalf("Start: %v", err)
	}
	t.Cleanup(func() { _ = stop(context.Background()) })
	return out.String(), stop
}

// Property 7: no endpoint, no exporter, and the line says so. A span still gets a
// valid id, because the error id a caller quotes is that id whether or not it is
// exported anywhere.
func TestNoEndpointMeansNoExporterAndSaysSo(t *testing.T) {
	log, _ := start(t, nil)
	if !strings.Contains(log, "exporter=none") {
		t.Fatalf("startup line: %s", log)
	}
	_, span := observe.Tracer().Start(context.Background(), "probe")
	defer span.End()
	if !span.SpanContext().IsValid() {
		t.Fatal("a span has no id without an exporter; the error id would be meaningless")
	}
}

// Properties 8 and 14: the standard variables are honoured in OpenObserve's shape
// -- base URL plus /v1/traces, the configured header present -- and the header's
// VALUE is never logged.
func TestTheStandardVariablesReachTheBackendAndTheValueIsNotLogged(t *testing.T) {
	var mu sync.Mutex
	var paths, auths []string
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		mu.Lock()
		paths = append(paths, r.URL.Path)
		auths = append(auths, r.Header.Get("Authorization"))
		mu.Unlock()
		w.WriteHeader(http.StatusOK)
	}))
	t.Cleanup(srv.Close)

	const secret = "Basic c2VjcmV0OnZhbHVl"
	log, stop := start(t, map[string]string{
		"OTEL_EXPORTER_OTLP_ENDPOINT": srv.URL + "/api/garm",
		"OTEL_EXPORTER_OTLP_HEADERS":  "Authorization=" + secret,
	})
	if !strings.Contains(log, "exporter=otlp") || !strings.Contains(log, "headers=[Authorization]") {
		t.Errorf("startup line: %s", log)
	}
	if strings.Contains(log, "c2VjcmV0") {
		t.Fatalf("the header VALUE is in the log: %s", log)
	}

	_, span := observe.Tracer().Start(context.Background(), "probe")
	span.End()
	if err := stop(context.Background()); err != nil {
		t.Fatalf("stop: %v", err)
	}

	mu.Lock()
	defer mu.Unlock()
	var sawTraces bool
	for i, p := range paths {
		if p == "/api/garm/v1/traces" {
			sawTraces = true
		}
		if auths[i] != secret {
			t.Errorf("request to %s carried Authorization %q", p, auths[i])
		}
	}
	if !sawTraces {
		t.Fatalf("no request reached /api/garm/v1/traces; paths were %v", paths)
	}
}

// Review focus 2: OTEL_SDK_DISABLED wins over an endpoint.
func TestDisabledMeansNoExporterAndSaysSo(t *testing.T) {
	log, _ := start(t, map[string]string{
		"OTEL_EXPORTER_OTLP_ENDPOINT": "http://127.0.0.1:1/api/garm",
		"OTEL_SDK_DISABLED":           "true",
	})
	if !strings.Contains(log, "exporter=none") || !strings.Contains(log, "disabled=true") {
		t.Fatalf("startup line: %s", log)
	}
}
