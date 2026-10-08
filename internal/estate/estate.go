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
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/nats-io/jwt/v2"
	natsserver "github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nkeys"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/durationpb"

	"github.com/garm-ai/garm-ai/authority"
	"github.com/garm-ai/garm-ai/catalogue"
	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	"github.com/garm-ai/garm-ai/examples/weatherd"
	invokev1 "github.com/garm-ai/garm-ai/garm/invoke/v1"
	runv1 "github.com/garm-ai/garm-ai/garm/run/v1"
	"github.com/garm-ai/garm-ai/internal/fixtures"
	"github.com/garm-ai/garm-ai/natsmicro"
	"github.com/garm-ai/garm-ai/natsserve"
	"github.com/garm-ai/garm-ai/observe"
	"github.com/garm-ai/garm-ai/observe/otlp/otlptest"
	"github.com/garm-ai/garm-ai/run"
	"github.com/garm-ai/garm-ai/rundbos"
	"github.com/garm-ai/garm-ai/rundsvc"
	"github.com/garm-ai/garm-ai/topology"
)

// Quiet discards a service's mount lines, which are not the test's output.
func Quiet() *slog.Logger { return slog.New(slog.NewTextHandler(io.Discard, nil)) }

// Role is who a connection is. The estate issues one credential per role from the
// same generator a deployment uses, so a test connects as what production would.
type Role string

const (
	RoleOps     Role = "ops"
	RoleRund    Role = "rund"
	RoleTool    Role = "weather.v1.WeatherService"
	RoleTool2   Role = fixtures.SecondService // holds a credential; nothing answers for it
	RoleCaller  Role = "studio"
	RoleCaller2 Role = "batch"
)

// callers is every caller account the estate issues.
var callers = []string{string(RoleCaller), string(RoleCaller2)}

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

	srv      *natsserver.Server
	tls      *tls.Config
	topo     *topology.Output
	creds    map[Role]topology.Credential
	keys     topology.Keys
	root     nkeys.KeyPair // the throwaway root, apart from keys, as it would be
	rundLog  *lockedBuffer
	caPEM    []byte
	rec      *otlptest.Recorder
	store    *rundbos.Store
	storeDir string
	gated    *gatedCaller
	grants   string
	engine   *run.Engine
}

// GrantsFile is where the estate wrote its grants, for a test that reads or
// rewrites them; empty under WithoutGrants.
func (e *Estate) GrantsFile() string { return e.grants }

// Option shapes an estate.
type Option func(*options)

type options struct {
	store, storeDown bool
	noGrants         bool
	ownGrants        bool // WithGrant was used: the defaults are replaced
	gates            []string
	grants           []string // grant entries, as YAML list items
}

// WithoutGrants is rund with no grant source: the reduced posture (authority
// spec §9) -- a tool that requires nothing is open, a tool with a requirement
// is refused naming the flag.
func WithoutGrants() Option { return func(o *options) { o.noGrants = true } }

// WithGrant REPLACES the estate's default grants with exactly the ones given,
// so a test states precisely what the world holds. The defaults -- studio
// holding `weather`, batch holding `support`, both with tools ["*"] -- are what
// an estate has when no test says otherwise, and they are what make a refusal
// assertable without any option at all.
func WithGrant(as Role, tools, compartments []string) Option {
	return func(o *options) {
		o.ownGrants = true
		o.grants = append(o.grants, fmt.Sprintf(`  - principal: { kind: account, id: %s%s }
    tools: [%s]
    compartments: [%s]
`, topology.CallerPrefix, as, strings.Join(quoteAll(tools), ", "), strings.Join(compartments, ", ")))
	}
}

// WithGrantActingFor is WithGrant for an agent assigned to a subject: the grant
// is held by the ACTING principal, with the subject recorded (authority spec
// §8). Replaces the defaults, as WithGrant does.
func WithGrantActingFor(as Role, tools, compartments []string, subjectKind, subjectID string) Option {
	return func(o *options) {
		o.ownGrants = true
		o.grants = append(o.grants, fmt.Sprintf(`  - principal: { kind: account, id: %s%s }
    acts_for: { kind: %s, id: %s }
    tools: [%s]
    compartments: [%s]
`, topology.CallerPrefix, as, subjectKind, subjectID, strings.Join(quoteAll(tools), ", "), strings.Join(compartments, ", ")))
	}
}

// AsPrincipal reads runs as a principal the TRANSPORT cannot present: a person,
// in a build where only accounts connect. It calls the engine directly, which
// is the only honest way to exercise a subject's visibility before auth callout
// exists -- and it is exactly what the engine will be handed once it does.
func (e *Estate) AsPrincipal(t testing.TB, kind, id string) *AsReader {
	t.Helper()
	if e.engine == nil {
		t.Fatal("the estate has no engine")
	}
	return &AsReader{e: e.engine, h: run.Headers{}, p: run.Principal{Kind: run.PrincipalKind(kind), ID: id}}
}

// AsReader is the read half of the run service, as one principal.
type AsReader struct {
	e *run.Engine
	h run.Headers
	p run.Principal
}

func (r *AsReader) Fetch(ctx context.Context, id string, wait time.Duration) (*runv1.FetchResponse, *invokev1.Error) {
	return r.e.Fetch(ctx, &runv1.FetchRequest{RunId: id, Wait: durationpb.New(wait)}, r.headers())
}

func (r *AsReader) Events(ctx context.Context, id string, after uint64, wait time.Duration) (*runv1.EventsResponse, *invokev1.Error) {
	return r.e.Events(ctx, &runv1.EventsRequest{RunId: id, After: after, Wait: durationpb.New(wait)}, r.headers())
}

// headers carries the principal the way rundsvc will once a connection can be
// identified as one: through the envelope, never as something a caller asserts.
func (r *AsReader) headers() run.Headers {
	h := r.h
	h.AsPrincipal = &r.p
	return h
}

func quoteAll(ss []string) []string {
	out := make([]string, 0, len(ss))
	for _, s := range ss {
		out = append(out, `"`+s+`"`)
	}
	return out
}

// WithToolGate blocks the tool call whose idempotency key is key until
// OpenToolGate is called: a test can stand inside a run.
func WithToolGate(keys ...string) Option {
	return func(o *options) { o.store = true; o.gates = append(o.gates, keys...) }
}

// gatedCaller holds a tool call at its key until the gate opens.
type gatedCaller struct {
	inner run.Caller
	mu    sync.Mutex
	gates map[string]chan struct{}
	seen  map[string]chan struct{}
}

func (g *gatedCaller) Call(ctx context.Context, tool string, input []byte, budget time.Duration, h run.Headers) ([]byte, error) {
	g.mu.Lock()
	gate := g.gates[h.Idempotency]
	if seen, ok := g.seen[h.Idempotency]; ok {
		select {
		case <-seen:
		default:
			close(seen)
		}
	}
	g.mu.Unlock()
	if gate != nil {
		select {
		case <-gate:
		case <-ctx.Done():
			return nil, ctx.Err()
		}
	}
	return g.inner.Call(ctx, tool, input, budget, h)
}

// AwaitToolCall returns once the tool call with this key has been made.
func (e *Estate) AwaitToolCall(t testing.TB, key string) {
	t.Helper()
	e.gated.mu.Lock()
	seen := e.gated.seen[key]
	e.gated.mu.Unlock()
	if seen == nil {
		t.Fatalf("no gate for %s", key)
	}
	select {
	case <-seen:
	case <-time.After(10 * time.Second):
		t.Fatalf("the tool call %s was not made", key)
	}
}

// OpenToolGate lets the held call through.
func (e *Estate) OpenToolGate(key string) {
	e.gated.mu.Lock()
	defer e.gated.mu.Unlock()
	if g := e.gated.gates[key]; g != nil {
		select {
		case <-g:
		default:
			close(g)
		}
	}
}

// WithStore gives rund a run store -- rundbos on a SQLite file in the test's
// temp dir. OPT-IN: a DBOS runtime is a real cost per test, and the many tests
// about identity, rotation and tracing have no run to hold. Without it the
// estate is a storeless rund: sync only, async refused naming the flag.
func WithStore() Option { return func(o *options) { o.store = true } }

// WithStoreDown is a rund whose store is configured but unreachable at start:
// the database's directory is a FILE, so it cannot be created. StoreUp makes
// it reachable, and the store reconnects on its own. Implies WithStore.
func WithStoreDown() Option { return func(o *options) { o.store, o.storeDown = true, true } }

// Store is the estate's run store, nil without WithStore.
func (e *Estate) Store() *rundbos.Store { return e.store }

// SubscribeEvents subscribes as a role to a run's live events, under the local
// prefix the role's account imports, and delivers them decoded. What the bus
// delivers to that account -- and only that -- is what arrives.
func (e *Estate) SubscribeEvents(t testing.TB, as Role, runID string) <-chan *runv1.Event {
	t.Helper()
	nc := e.Connect(t, as)
	out := make(chan *runv1.Event, 64)
	sub, err := nc.Subscribe(rundsvc.SubjectOut+"."+runID+".>", func(m *nats.Msg) {
		ev := &runv1.Event{}
		if err := proto.Unmarshal(m.Data, ev); err == nil {
			out <- ev
		}
	})
	if err != nil {
		t.Fatal(err)
	}
	if err := nc.Flush(); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = sub.Unsubscribe() })
	return out
}

// StoreUp makes a WithStoreDown estate's database reachable and waits for the
// store to reconnect.
func (e *Estate) StoreUp(t testing.TB) {
	t.Helper()
	if err := os.Remove(e.storeDir); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(e.storeDir, 0o750); err != nil {
		t.Fatal(err)
	}
	deadline := time.Now().Add(10 * time.Second)
	for {
		_, err := e.store.Fetch(context.Background(), "probe", 0)
		if errors.Is(err, run.ErrNotFound) {
			return
		}
		if time.Now().After(deadline) {
			t.Fatalf("the store did not come back: %v", err)
		}
		time.Sleep(50 * time.Millisecond)
	}
}

// Reissue runs the generator again, against THIS estate's manifest and keys, for a
// different catalogue -- which is what a deployment does when a tool is added or
// retired. The output's revocations are in its account JWTs; PushAccount is how
// they reach the server.
func (e *Estate) Reissue(t testing.TB, cat *catalogue.Catalogue) *topology.Output {
	t.Helper()
	out, err := topology.Generate(topology.Input{
		Catalogue: cat, Callers: callers,
		Previous: &e.topo.Manifest, Keys: e.keys, Now: time.Now(),
	})
	if err != nil {
		t.Fatalf("reissuing: %v", err)
	}
	e.topo = out
	e.ApplyNewKeys(out)
	e.adoptCredentials(out)
	return out
}

// Issue reissues against the current catalogue and manifest -- an ordinary
// issuance, which is what step two of a rotation is.
func (e *Estate) Issue(t testing.TB) *topology.Output { return e.Reissue(t, e.Catalogue.Current()) }

// RotateSigning is step one of the signing-keys spec's §4 for one account.
func (e *Estate) RotateSigning(t testing.TB, account string) *topology.Output {
	t.Helper()
	out, err := topology.Generate(topology.Input{
		Catalogue: e.Catalogue.Current(), Callers: callers,
		Previous: &e.topo.Manifest, Keys: e.keys, Now: time.Now(), RotateSigning: []string{account},
	})
	if err != nil {
		t.Fatalf("rotating %s: %v", account, err)
	}
	e.topo = out
	e.ApplyNewKeys(out)
	e.adoptCredentials(out)
	return out
}

// adoptCredentials makes a reissued credential the one Connect uses, as a
// deployment rolling out new files would. (Reissue did not, which was harmless
// until a rotation made the difference matter.)
func (e *Estate) adoptCredentials(out *topology.Output) {
	for _, c := range out.Credentials {
		e.creds[Role(c.Name)] = c
	}
}

// Keys is the estate's issuance keys -- what a deployment's issuance environment
// holds. No root: it is in OperatorRoot, apart, as it would be.
func (e *Estate) Keys() topology.Keys { return e.keys }

// OperatorRoot is the throwaway root the estate's operator JWT was signed with,
// kept ONLY so a test can sign something badly and watch the server refuse it.
func (e *Estate) OperatorRoot() nkeys.KeyPair { return e.root }

// ApplyNewKeys folds what an issuance minted into the estate's keys, as the
// issuance environment would keep them.
func (e *Estate) ApplyNewKeys(out *topology.Output) {
	for name, nk := range out.NewKeys {
		k := e.keys.Accounts[name]
		if nk.Identity != nil {
			k.Identity, _ = nk.Identity.PublicKey()
		}
		k.Signing = nk.Signing
		e.keys.Accounts[name] = k
	}
}

// PushAccount updates one account on the running server the way operations does:
// over $SYS, with the operations credential, through the full resolver. A revoked
// user's live connection closes as a result (spec §5) -- that is what the test
// that calls this is watching.
func (e *Estate) PushAccount(t testing.TB, encoded string) {
	t.Helper()
	if err := e.TryPushAccount(t, encoded); err != nil {
		t.Fatal(err)
	}
}

// TryPushAccount is PushAccount that returns the server's refusal instead of
// failing the test, for a test whose point is the refusal.
func (e *Estate) TryPushAccount(t testing.TB, encoded string) error {
	t.Helper()
	ac, err := jwt.DecodeAccountClaims(encoded)
	if err != nil {
		return err
	}
	ops := e.Connect(t, RoleOps)
	reply, err := ops.Request("$SYS.REQ.ACCOUNT."+ac.Subject+".CLAIMS.UPDATE", []byte(encoded), 5*time.Second)
	if err != nil {
		return fmt.Errorf("pushing %s: %w", ac.Name, err)
	}
	var resp struct {
		Error *struct {
			Description string `json:"description"`
		} `json:"error"`
	}
	if err := json.Unmarshal(reply.Data, &resp); err != nil {
		return fmt.Errorf("pushing %s: unreadable reply %q", ac.Name, reply.Data)
	}
	if resp.Error != nil {
		return fmt.Errorf("pushing %s: the server refused it: %s", ac.Name, resp.Error.Description)
	}
	return nil
}

// EmptyCatalogue has files but declares no tool: the catalogue after retiring
// everything, the sharpest case for a reissue.
func EmptyCatalogue(t testing.TB) *catalogue.Catalogue { return fixtures.Empty(t).Catalogue }

// WeatherCatalogue is the estate's catalogue MINUS its second service: the
// catalogue after retiring exactly one tool service, which is what "a revocation
// touches nobody else in the account" needs.
func WeatherCatalogue(t testing.TB) *catalogue.Catalogue { return fixtures.Weather(t).Catalogue }

// CredsFile writes a role's credential in NATS creds format -- what a command's
// --creds flag takes -- and returns the path. The file lives in the test's temp
// dir and dies with it.
func (e *Estate) CredsFile(t testing.TB, as Role) string {
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
func (e *Estate) CAFile(t testing.TB) string {
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

// Recorder is what the estate's processes recorded: spans, counters, log records.
func (e *Estate) Recorder() *otlptest.Recorder { return e.rec }

// AccountKey is the public key of a caller role's account -- the value the server
// places at token 4 and rund reports as garm.caller.
func (e *Estate) AccountKey(as Role) string {
	return e.keys.Accounts[topology.CallerPrefix+string(as)].Identity
}

// New starts a server in operator mode, a tool service and rund, and tears all
// three down with the test. The tool service is the EXAMPLE one, deployed exactly
// as its author does -- with a credential that permits exactly its declared tools.
func New(t testing.TB, opts ...Option) *Estate {
	t.Helper()
	var o options
	for _, opt := range opts {
		opt(&o)
	}
	e := &Estate{}
	// The three processes share THIS process, so one recorder sees the caller's,
	// rund's and the tool's spans -- which is what makes end-to-end linkage
	// assertable at all.
	e.rec = otlptest.Install(t)
	e.loadCatalogue(t)

	// The topology, from the SAME generator a deployment runs. Keys are fresh
	// because this is a test; a deployment's are an input.
	//
	// The operator comes from the same ceremony a deployment runs; the root is
	// kept apart on the estate for the tests that sign badly on purpose.
	op, err := topology.InitOperator()
	if err != nil {
		t.Fatal(err)
	}
	e.root = op.Root
	keys := topology.FreshKeysFor(op, callers)
	topo, err := topology.Generate(topology.Input{
		Catalogue: e.Catalogue.Current(), Callers: callers,
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

	opClaims, err := jwt.DecodeOperatorClaims(topo.OperatorJWT)
	if err != nil {
		t.Fatal(err)
	}
	// The FULL resolver, on disk, so an account update pushed over $SYS is the path
	// the tests exercise (spec §6). Not a memory stub that cannot take one.
	res, err := natsserver.NewDirAccResolver(t.TempDir(), 0, 2*time.Second, natsserver.NoDelete)
	if err != nil {
		t.Fatal(err)
	}
	sysPub := keys.Accounts[topology.AccountSYS].Identity
	for name, encoded := range topo.Accounts {
		if err := res.Store(keys.Accounts[name].Identity, encoded); err != nil {
			t.Fatalf("preloading %s: %v", name, err)
		}
	}

	serverTLS, clientTLS, caPEM := tlsPair(t)
	e.tls, e.caPEM = clientTLS, caPEM
	srv, err := natsserver.NewServer(&natsserver.Options{
		Host: "127.0.0.1", Port: -1, NoLog: true, NoSigs: true,
		TrustedOperators: []*jwt.OperatorClaims{opClaims},
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
	// The caller table names studio and deliberately NOT batch, so a test can see
	// both halves of "named when known, by key alone when not" (spec §1.1).
	names := observe.CallerNames{e.AccountKey(RoleCaller): string(RoleCaller)}
	rundLog := slog.New(observe.Handler(slog.NewTextHandler(e.rundLog, nil)))
	engine := &run.Engine{
		Catalogue: e.Catalogue,
		Tools:     rundsvc.ToolCaller{NC: rundNC},
		Log:       rundLog,
	}
	if !o.noGrants {
		// studio holds `weather`, so it may invoke the example's requiring tool;
		// batch holds `support`, so it may not. One estate, both halves of a
		// decision (authority spec §11 properties 1 and 3).
		entries := o.grants
		if !o.ownGrants {
			entries = []string{
				"  - principal: { kind: account, id: " + topology.CallerPrefix + string(RoleCaller) + " }\n    tools: [\"*\"]\n    compartments: [weather]\n",
				"  - principal: { kind: account, id: " + topology.CallerPrefix + string(RoleCaller2) + " }\n    tools: [\"*\"]\n    compartments: [support]\n",
			}
		}
		body := "schema: v1\ncompartments: [weather, support, payments]\ngrants:\n" + strings.Join(entries, "")
		path := filepath.Join(t.TempDir(), "grants.yaml")
		if err := os.WriteFile(path, []byte(body), 0o600); err != nil {
			t.Fatal(err)
		}
		// The estate resolves every role it issues, not only the ones its
		// caller table labels: rund's resolver is callers.json, and this is not
		// rund's main.
		file, err := authority.LoadFile(path, func(name string) (string, bool) {
			role := Role(strings.TrimPrefix(name, topology.CallerPrefix))
			key := e.AccountKey(role)
			return key, key != ""
		})
		if err != nil {
			t.Fatal(err)
		}
		a := &authority.Authority{}
		a.Set(file)
		engine.Authority = a
		e.grants = path
	}
	if o.store {
		// The run store on a SQLite file in the test's temp dir -- the same
		// rundbos a deployment runs on Postgres, no container. A stable
		// executor id, as a deployment's (spec §2).
		e.storeDir = filepath.Join(t.TempDir(), "store")
		if o.storeDown {
			if err := os.WriteFile(e.storeDir, []byte("in the way"), 0o600); err != nil {
				t.Fatal(err)
			}
		}
		e.gated = &gatedCaller{inner: engine.Tools, gates: map[string]chan struct{}{}, seen: map[string]chan struct{}{}}
		for _, k := range o.gates {
			e.gated.gates[k] = make(chan struct{})
			e.gated.seen[k] = make(chan struct{})
		}
		store, err := rundbos.Open(context.Background(), rundbos.Config{
			URL: rundbos.FileURL(filepath.Join(e.storeDir, "runs.db")), AppName: "estate",
			Executor: "estate-rund", Workers: 2, Migrate: true, Logger: rundLog, Retry: 100 * time.Millisecond,
		}, e.Catalogue, e.gated, rundsvc.NewLivePublisher(rundNC, rundLog))
		if err != nil {
			t.Fatal(err)
		}
		e.store = store
		engine.Store = store
		t.Cleanup(func() { _ = store.Close(context.Background()) })
	}
	e.engine = engine
	if err := rundsvc.Serve(svc, engine, names); err != nil {
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
func (e *Estate) Connect(t testing.TB, as Role) *nats.Conn {
	t.Helper()
	return e.ConnectWith(t, as)
}

// ConnectWith is Connect plus options a test needs to observe the connection --
// nats.NoReconnect and a ClosedHandler, for a test watching a revocation land.
func (e *Estate) ConnectWith(t testing.TB, as Role, extra ...nats.Option) *nats.Conn {
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

// loadCatalogue is the TWO-service namespace: the example weather service, which
// weatherd answers, and a second service cloned from it, which nothing answers but
// which holds a credential -- so that two users share the TOOLS account.
func (e *Estate) loadCatalogue(t testing.TB) {
	t.Helper()
	fx := fixtures.TwoServices(t)
	e.Dir, e.CatalogueURI, e.CatalogueSHA = fx.Dir, fx.URI, fx.SHA
	e.Catalogue = new(catalogue.Holder)
	e.Catalogue.Set(fx.Catalogue)
}
