package rundbos_test

import (
	"bytes"
	"context"
	"errors"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/observe/otlp/otlptest"
	"github.com/garm-ai/garm-ai/run"
	"github.com/garm-ai/garm-ai/rundbos"
	"github.com/garm-ai/garm-ai/serve"
)

// unreachable is a store whose database cannot come up: the path's parent is a
// FILE, so the directory cannot be created. Removing the file and making the
// directory is "the database returns".
func unreachable(t *testing.T) (url, blocker string) {
	t.Helper()
	blocker = filepath.Join(t.TempDir(), "store")
	if err := os.WriteFile(blocker, []byte("in the way"), 0o600); err != nil {
		t.Fatal(err)
	}
	return rundbos.FileURL(filepath.Join(blocker, "runs.db")), blocker
}

func openDegradable(t *testing.T, url string, log *slog.Logger) *rundbos.Store {
	t.Helper()
	s, err := rundbos.Open(context.Background(), rundbos.Config{
		URL: url, AppName: "garm-test", Executor: "test-a", Workers: 1, Migrate: true,
		Logger: log, Retry: 100 * time.Millisecond,
	}, holder(t), &fakeTools{reply: []byte("ok")})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = s.Close(context.Background()) })
	return s
}

// Property 12: an unreachable store at start is a DEGRADED rund, not a dead
// one -- Open succeeds, async is UNAVAILABLE naming the store, and the counter
// says so. Sync never touched the store, so sync is untouched.
func TestAnUnreachableStoreDegradesRatherThanFails(t *testing.T) {
	rec := otlptest.Install(t)
	url, _ := unreachable(t)
	s := openDegradable(t, url, slog.New(slog.DiscardHandler))
	_, err := s.Start(context.Background(), run.Run{ID: "k", Tool: asyncTool, Caller: "ACX"})
	var se *serve.Error
	if !errors.As(err, &se) || se.Kind != invokev1.ErrorKind_ERROR_KIND_UNAVAILABLE || !strings.Contains(err.Error(), "run store") {
		t.Fatalf("got %v, want UNAVAILABLE naming the store", err)
	}
	if _, err := s.Fetch(context.Background(), "k", 0); !errors.As(err, &se) || se.Kind != invokev1.ErrorKind_ERROR_KIND_UNAVAILABLE {
		t.Fatalf("Fetch on a degraded store: %v", err)
	}
	if n := rec.Counter(context.Background(), "garm.run.store", observe.KeyState.String("down")); n < 1 {
		t.Fatalf("garm.run.store{state=down} = %d", n)
	}
}

// The store recovers on its own when the database returns: the retry
// reconnects, async works, the counter moves to up.
func TestTheStoreRecoversWhenTheDatabaseReturns(t *testing.T) {
	rec := otlptest.Install(t)
	url, blocker := unreachable(t)
	s := openDegradable(t, url, slog.New(slog.DiscardHandler))
	if _, err := s.Start(context.Background(), run.Run{ID: "k", Tool: asyncTool, Caller: "ACX"}); err == nil {
		t.Fatal("Start succeeded on an unreachable store")
	}
	if err := os.Remove(blocker); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(blocker, 0o750); err != nil {
		t.Fatal(err)
	}
	deadline := time.Now().Add(10 * time.Second)
	for {
		_, err := s.Start(context.Background(), run.Run{ID: "k", Tool: asyncTool, Input: []byte("in"),
			Fingerprint: run.Fingerprint(asyncTool, []byte("in")), Caller: "ACX", Message: "m0"})
		if err == nil {
			break
		}
		if time.Now().After(deadline) {
			t.Fatalf("the store did not recover: %v", err)
		}
		time.Sleep(100 * time.Millisecond)
	}
	if st := awaitTerminal(t, s, "k", 5*time.Second); st.Status != run.StatusSucceeded {
		t.Fatalf("%+v", st)
	}
	if n := rec.Counter(context.Background(), "garm.run.store", observe.KeyState.String("up")); n < 1 {
		t.Fatalf("garm.run.store{state=up} = %d", n)
	}
}

// Review focus 4: a URL that is not a store is a CONFIGURATION error -- rund
// refuses to start, naming the flag -- never "degraded".
func TestABadStoreURLRefusesToStart(t *testing.T) {
	_, err := rundbos.Open(context.Background(), rundbos.Config{URL: "mysql://x/y", AppName: "garm-test"}, holder(t), &fakeTools{})
	if err == nil || !strings.Contains(err.Error(), "--run-store") {
		t.Fatalf("got %v, want a refusal naming --run-store", err)
	}
}

// Property 15: the credential never reaches a log line.
func TestTheStartupLineRedactsTheCredential(t *testing.T) {
	if got := rundbos.Redact("postgres://garm:s3cret@db:5432/garm?sslmode=disable"); strings.Contains(got, "s3cret") || !strings.Contains(got, "garm:") {
		t.Fatalf("Redact: %q", got)
	}
	var buf bytes.Buffer
	s, err := rundbos.Open(context.Background(), rundbos.Config{
		URL: "postgres://garm:s3cret@127.0.0.1:1/garm?connect_timeout=1", AppName: "garm-test", Executor: "test-a",
		Logger: slog.New(slog.NewTextHandler(&buf, nil)), Retry: time.Hour,
	}, holder(t), &fakeTools{})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = s.Close(context.Background()) })
	if strings.Contains(buf.String(), "s3cret") {
		t.Fatalf("the credential reached the log:\n%s", buf.String())
	}
	if !strings.Contains(buf.String(), "redacted") {
		t.Fatalf("the store URL was not logged at all:\n%s", buf.String())
	}
}

// A connection failure is what degrades; a tool's refusal or an unknown id is not.
func TestOnlyAConnectionFailureDegrades(t *testing.T) {
	if !rundbos.IsConnectionError(errors.New("failed to connect to `host=db`: dial error (dial tcp: connection refused)")) {
		t.Error("a dial error did not count")
	}
	if rundbos.IsConnectionError(serve.Invalid("nope")) || rundbos.IsConnectionError(run.ErrNotFound) {
		t.Error("a tool's or the port's own error counted as a connection failure")
	}
}
