package main

import (
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/garm-ai/garm-ai/natsconn"
	"github.com/garm-ai/garm-ai/rundbos"
)

// A broken --callers table refuses to start, naming the file, BEFORE anything
// is loaded or dialled -- the NATS URL below reaches nothing, and the catalogue
// does not exist, so a refusal that came from either would be the wrong one.
func TestABrokenCallersTableRefusesToStartBeforeAnythingElse(t *testing.T) {
	p := filepath.Join(t.TempDir(), "callers.json")
	if err := os.WriteFile(p, []byte(`{not json`), 0o600); err != nil {
		t.Fatal(err)
	}
	err := serveRund("nats://127.0.0.1:1", natsconn.Options{}, "file://does-not-exist.binpb", "", t.TempDir(),
		"rund", "0.1.0", p, "", rundbos.Config{}, slog.New(slog.DiscardHandler))
	if err == nil || !strings.Contains(err.Error(), p) {
		t.Fatalf("err = %v, want one naming %s", err, p)
	}
}
