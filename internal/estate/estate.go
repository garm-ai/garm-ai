// Package estate stands up a whole garm estate in one process, for tests: a tool
// service, and rund in front of it, on a NATS server of their own -- in OPERATOR
// MODE, over TLS, with the same topology a deployment gets.
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
	"bytes"
	"context"
	"crypto/sha256"
	"crypto/tls"
	"encoding/hex"
	"encoding/json"
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"github.com/nats-io/jwt/v2"
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
	"github.com/garm-ai/garm-ai/topology"
)

// Quiet discards a service's mount lines, which are not the test's output.
func Quiet() *slog.Logger { return slog.New(slog.NewTextHandler(io.Discard, nil)) }

// Role is who a connection is. The estate issues one credential per role from the
// same generator a deployment uses, so a test connects as what production would.
type Role string

const (
	RoleOps    Role = "ops"
	RoleRund   Role = "rund"
	RoleTool   Role = "weather.v1.WeatherService"
	RoleCaller Role = "studio"
)

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

	srv     *natsserver.Server
	tls     *tls.Config
	topo    *topology.Output
	creds   map[Role]topology.Credential
	keys    topology.Keys
	rundLog *lockedBuffer
	caPEM   []byte
}

// Reissue runs the generator again, against THIS estate's manifest and keys, for a
// different catalogue -- which is what a deployment does when a tool is added or
// retired. The output's revocations are in its account JWTs; PushAccount is how
// they reach the server.
func (e *Estate) Reissue(t *testing.T, cat *catalogue.Catalogue) *topology.Output {
	t.Helper()
	out, err := topology.Generate(topology.Input{
		Catalogue: cat, Callers: []string{string(RoleCaller)},
		Previous: &e.topo.Manifest, Keys: e.keys, Now: time.Now(),
	})
	if err != nil {
		t.Fatalf("reissuing: %v", err)
	}
	e.topo = out
	return out
}

// PushAccount updates one account on the running server the way operations does:
// over $SYS, with the operations credential, through the full resolver. A revoked
// user's live connection closes as a result (spec §5) -- that is what the test
// that calls this is watching.
func (e *Estate) PushAccount(t *testing.T, encoded string) {
	t.Helper()
	ac, err := jwt.DecodeAccountClaims(encoded)
	if err != nil {
		t.Fatal(err)
	}
	ops := e.Connect(t, RoleOps)
	reply, err := ops.Request("$SYS.REQ.ACCOUNT."+ac.Subject+".CLAIMS.UPDATE", []byte(encoded), 5*time.Second)
	if err != nil {
		t.Fatalf("pushing %s: %v", ac.Name, err)
	}
	var resp struct {
		Error *struct {
			Description string `json:"description"`
		} `json:"error"`
	}
	if err := json.Unmarshal(reply.Data, &resp); err != nil {
		t.Fatalf("pushing %s: unreadable reply %q", ac.Name, reply.Data)
	}
	if resp.Error != nil {
		t.Fatalf("pushing %s: the server refused it: %s", ac.Name, resp.Error.Description)
	}
}

// EmptyCatalogue has files but declares no tool -- the catalogue a deployment has
// after retiring everything, which is the sharpest case for a reissue.
func EmptyCatalogue(t *testing.T) *catalogue.Catalogue {
	t.Helper()
	dep := weatherv1.File_weather_v1_weather_proto.Imports().Get(0).FileDescriptor
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
	add(dep)
	raw, err := proto.Marshal(&descriptorpb.FileDescriptorSet{File: all})
	if err != nil {
		t.Fatal(err)
	}
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "e.binpb"), raw, 0o600); err != nil {
		t.Fatal(err)
	}
	sum := sha256.Sum256(raw)
	c, err := catalogue.Load(context.Background(), &fetch.Resolver{Dir: dir},
		fetch.Artefact{URI: "file://e.binpb", SHA256: hex.EncodeToString(sum[:])})
	if err != nil {
		t.Fatal(err)
	}
	return c
}

// CredsFile writes a role's credential in NATS creds format -- what a command's
// --creds flag takes -- and returns the path. The file lives in the test's temp
// dir and dies with it.
func (e *Estate) CredsFile(t *testing.T, as Role) string {
	t.Helper()
	c, ok := e.creds[as]
	if !ok {
		t.Fatalf("no credential for role %q", as)
	}
	body, err := jwt.FormatUserConfig(c.JWT, []byte(c.Seed))
	if err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(t.TempDir(), string(as)+".creds")
	if err := os.WriteFile(path, body, 0o600); err != nil {
		t.Fatal(err)
	}
	return path
}

// CAFile writes the estate's CA as PEM -- what a command's --tls-ca flag takes.
func (e *Estate) CAFile(t *testing.T) string {
	t.Helper()
	path := filepath.Join(t.TempDir(), "ca.pem")
	if err := os.WriteFile(path, e.caPEM, 0o600); err != nil {
		t.Fatal(err)
	}
	return path
}

// lockedBuffer captures rund's log so a test can assert what rund was told --
// which account called, in particular. Locked because rund logs from handler
// goroutines while the test reads.
type lockedBuffer struct {
	mu sync.Mutex
	b  bytes.Buffer
}

func (l *lockedBuffer) Write(p []byte) (int, error) {
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.b.Write(p)
}

func (l *lockedBuffer) String() string {
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.b.String()
}

// RundLog is everything rund has logged so far in this estate.
func (e *Estate) RundLog() string { return e.rundLog.String() }

// New starts a server in operator mode, a tool service and rund, and tears all
// three down with the test. The tool service is the EXAMPLE one, deployed exactly
// as its author does -- with a credential that permits exactly its declared tools.
func New(t *testing.T) *Estate {
	t.Helper()
	e := &Estate{}
	e.loadCatalogue(t)

	// The topology, from the SAME generator a deployment runs. Keys are fresh
	// because this is a test; a deployment's are an input.
	keys := topology.FreshKeys([]string{string(RoleCaller)})
	topo, err := topology.Generate(topology.Input{
		Catalogue: e.Catalogue.Current(), Callers: []string{string(RoleCaller)},
		Previous: topology.Empty(), Keys: keys, Now: time.Now(),
	})
	if err != nil {
		t.Fatalf("generating the topology: %v", err)
	}
	e.topo, e.keys = topo, keys
	e.creds = map[Role]topology.Credential{}
	for _, c := range topo.Credentials {
		e.creds[Role(c.Name)] = c
	}

	op, err := jwt.DecodeOperatorClaims(topo.OperatorJWT)
	if err != nil {
		t.Fatal(err)
	}
	// The FULL resolver, on disk, so an account update pushed over $SYS is the path
	// the tests exercise (spec §6). Not a memory stub that cannot take one.
	res, err := natsserver.NewDirAccResolver(t.TempDir(), 0, 2*time.Second, natsserver.NoDelete)
	if err != nil {
		t.Fatal(err)
	}
	sysPub, err := keys.Accounts[topology.AccountSYS].PublicKey()
	if err != nil {
		t.Fatal(err)
	}
	for name, encoded := range topo.Accounts {
		pub, err := keys.Accounts[name].PublicKey()
		if err != nil {
			t.Fatal(err)
		}
		if err := res.Store(pub, encoded); err != nil {
			t.Fatalf("preloading %s: %v", name, err)
		}
	}

	serverTLS, clientTLS, caPEM := tlsPair(t)
	e.tls, e.caPEM = clientTLS, caPEM
	srv, err := natsserver.NewServer(&natsserver.Options{
		Host: "127.0.0.1", Port: -1, NoLog: true, NoSigs: true,
		TrustedOperators: []*jwt.OperatorClaims{op},
		AccountResolver:  res,
		SystemAccount:    sysPub,
		TLSConfig:        serverTLS, // and nothing without it: property 11
	})
	if err != nil {
		t.Fatal(err)
	}
	e.srv = srv
	go srv.Start()
	t.Cleanup(srv.Shutdown)
	if !srv.ReadyForConnections(10 * time.Second) {
		t.Fatal("nats-server not ready")
	}
	e.URL = srv.ClientURL()

	tools, err := natsserve.New(natsserve.Config{Name: "weatherd", Version: "0.1.0", Logger: Quiet()})
	if err != nil {
		t.Fatal(err)
	}
	if err := weatherv1.ServeWeatherService(tools, weatherd.Service{}); err != nil {
		t.Fatal(err)
	}
	if err := tools.Start(e.Connect(t, RoleTool)); err != nil {
		t.Fatal(err)
	}

	svc, err := natsmicro.New(natsmicro.Config{Name: "rund", Version: "0.1.0", Logger: Quiet()})
	if err != nil {
		t.Fatal(err)
	}
	rundNC := e.Connect(t, RoleRund)
	e.rundLog = &lockedBuffer{}
	if err := rundsvc.Serve(svc, &run.Engine{
		Catalogue: e.Catalogue,
		Tools:     rundsvc.ToolCaller{NC: rundNC},
		Log:       slog.New(slog.NewTextHandler(e.rundLog, nil)),
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

// Connect dials as a role, with that role's credential and TLS, and closes with
// the test.
func (e *Estate) Connect(t *testing.T, as Role) *nats.Conn {
	t.Helper()
	return e.ConnectWith(t, as)
}

// ConnectWith is Connect plus options a test needs to observe the connection --
// nats.NoReconnect and a ClosedHandler, for a test watching a revocation land.
func (e *Estate) ConnectWith(t *testing.T, as Role, extra ...nats.Option) *nats.Conn {
	t.Helper()
	c, ok := e.creds[as]
	if !ok {
		t.Fatalf("no credential for role %q", as)
	}
	opts := append([]nats.Option{
		nats.UserJWTAndSeed(c.JWT, c.Seed), nats.Secure(e.tls), nats.Name(string(as)),
	}, extra...)
	nc, err := nats.Connect(e.URL, opts...)
	if err != nil {
		t.Fatalf("%s could not connect: %v", as, err)
	}
	t.Cleanup(nc.Close)
	return nc
}

// Credential exposes a role's JWT and seed, for a command under test.
func (e *Estate) Credential(as Role) (jwtToken, seed string) {
	c := e.creds[as]
	return c.JWT, c.Seed
}

// TLS is the client configuration that trusts this estate's server.
func (e *Estate) TLS() *tls.Config { return e.tls }

// Topology is what the generator produced, for a test that asserts on it.
func (e *Estate) Topology() *topology.Output { return e.topo }

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
