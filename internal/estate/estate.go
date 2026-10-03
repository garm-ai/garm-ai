// Package estate stands up a whole garm estate in one process, for tests: a tool
// service, and rund in front of it, on a NATS server of their own.
//
// It exists because the chain acquired a SECOND consumer. natscall's tests built
// it first; cmd/garmctl and examples/cmd/forecast need the same thing, and the
// rule here is to extract at the second consumer rather than in advance.
//
// It imports `testing`, as net/http/httptest does, because its job is to fail a
// test rather than return an error a caller might not check. It is `internal` so
// it cannot become part of this module's public surface.
package estate

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"testing"
	"time"

	natsserver "github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protodesc"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/types/descriptorpb"

	"github.com/garm-ai/garm-ai/catalogue"
	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	"github.com/garm-ai/garm-ai/examples/weatherd"
	"github.com/garm-ai/garm-ai/fetch"
	"github.com/garm-ai/garm-ai/natsmicro"
	"github.com/garm-ai/garm-ai/natsserve"
	"github.com/garm-ai/garm-ai/run"
	"github.com/garm-ai/garm-ai/rundsvc"
)

// Quiet discards a service's mount lines, which are not the test's output.
func Quiet() *slog.Logger { return slog.New(slog.NewTextHandler(io.Discard, nil)) }

// Estate is a running chain, plus the things a COMMAND needs to reach it that a
// library caller does not: a URL to dial and a catalogue to resolve a name in.
type Estate struct {
	// URL is what a --nats flag takes.
	URL string
	// CatalogueURI is what a --catalogue flag takes, relative to Dir.
	CatalogueURI string
	// CatalogueSHA is what --catalogue-sha256 takes.
	CatalogueSHA string
	// Dir is what --catalogue-dir takes.
	Dir string
	// Catalogue is the same namespace already loaded, for a caller holding rund
	// rather than running it.
	Catalogue *catalogue.Holder
}

// New starts a server, a tool service and rund, and tears all three down with the
// test. The tool service is the EXAMPLE one, deployed exactly as its author does.
func New(t *testing.T) *Estate {
	t.Helper()
	srv, err := natsserver.NewServer(&natsserver.Options{
		Host: "127.0.0.1", Port: -1, NoLog: true, NoSigs: true})
	if err != nil {
		t.Fatal(err)
	}
	go srv.Start()
	t.Cleanup(srv.Shutdown)
	if !srv.ReadyForConnections(10 * time.Second) {
		t.Fatal("nats-server not ready")
	}
	e := &Estate{URL: srv.ClientURL()}
	e.loadCatalogue(t)

	tools, err := natsserve.New(natsserve.Config{Name: "weatherd", Version: "0.1.0", Logger: Quiet()})
	if err != nil {
		t.Fatal(err)
	}
	if err := weatherv1.ServeWeatherService(tools, weatherd.Service{}); err != nil {
		t.Fatal(err)
	}
	if err := tools.Start(e.Connect(t)); err != nil {
		t.Fatal(err)
	}

	svc, err := natsmicro.New(natsmicro.Config{Name: "rund", Version: "0.1.0", Logger: Quiet()})
	if err != nil {
		t.Fatal(err)
	}
	rundNC := e.Connect(t)
	if err := rundsvc.Serve(svc, &run.Engine{
		Catalogue: e.Catalogue,
		Tools:     rundsvc.ToolCaller{NC: rundNC},
		Log:       Quiet(),
	}); err != nil {
		t.Fatal(err)
	}
	if err := svc.Start(rundNC); err != nil {
		t.Fatal(err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan struct{}, 2)
	go func() { _ = svc.Serve(ctx); done <- struct{}{} }()
	go func() { _ = tools.Serve(ctx); done <- struct{}{} }()
	t.Cleanup(func() { cancel(); <-done; <-done })

	return e
}

// Connect dials the estate's server and closes with the test.
func (e *Estate) Connect(t *testing.T) *nats.Conn {
	t.Helper()
	nc, err := nats.Connect(e.URL)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(nc.Close)
	return nc
}

// loadCatalogue writes a real catalogue.binpb and loads it through the real
// resolver, digest and all. Not a hand-built Holder: a command is given a URI and
// a digest, so the test has to give it the same thing a deployment does.
func (e *Estate) loadCatalogue(t *testing.T) {
	t.Helper()
	var all []*descriptorpb.FileDescriptorProto
	seen := map[string]bool{}
	var add func(protoreflect.FileDescriptor)
	add = func(fd protoreflect.FileDescriptor) {
		if seen[fd.Path()] {
			return
		}
		seen[fd.Path()] = true
		for i := 0; i < fd.Imports().Len(); i++ {
			add(fd.Imports().Get(i).FileDescriptor)
		}
		all = append(all, protodesc.ToFileDescriptorProto(fd))
	}
	add(weatherv1.File_weather_v1_weather_proto)

	raw, err := proto.Marshal(&descriptorpb.FileDescriptorSet{File: all})
	if err != nil {
		t.Fatal(err)
	}
	e.Dir = t.TempDir()
	if err := os.WriteFile(filepath.Join(e.Dir, "c.binpb"), raw, 0o600); err != nil {
		t.Fatal(err)
	}
	sum := sha256.Sum256(raw)
	e.CatalogueURI, e.CatalogueSHA = "file://c.binpb", hex.EncodeToString(sum[:])

	c, err := catalogue.Load(context.Background(), &fetch.Resolver{Dir: e.Dir},
		fetch.Artefact{URI: e.CatalogueURI, SHA256: e.CatalogueSHA})
	if err != nil {
		t.Fatalf("loading the catalogue: %v", err)
	}
	e.Catalogue = new(catalogue.Holder)
	e.Catalogue.Set(c)
}
