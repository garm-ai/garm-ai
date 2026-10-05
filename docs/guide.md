# Building a tool, and an agent

Every file this guide names is in the repository and composed by `mise run ci`.
If a field is renamed, this guide breaks in CI rather than misleading you.

- `examples/proto/weather/v1/weather.proto` — a tool
- `examples/proto/trips/v1/trips.proto` — an agent that calls it
- `examples/weatherd/weatherd.go` — everything a tool author writes
- `examples/cmd/weatherd/main.go` — the whole process that serves it
- `examples/images.yaml` — how they compose

## 1. A tool

A tool is an RPC method carrying one option.

```proto
service WeatherService {
  rpc GetForecast(GetForecastRequest) returns (GetForecastResponse) {
    option (garm.tool.v1.tool) = {
      name: "weather.v1.get_forecast"
      sync: { budget: { seconds: 5 } }
    };
  }
}
```

### Every tool says how its answer arrives

`sync` or `async`, and a tool declaring **neither is refused** — silence must not
become a default, because a caller waiting for an answer and a caller holding a
receipt write different code.

**`async` is not about being slow.** A tool that pages a ledger for ten seconds is
synchronous; one that takes a millisecond but may pause for a person is not. The
axis is whether **state outlives the call**.

So **`sync` is a safety claim**: it says the answer comes back inside the budget
*and* that no policy may interpose a human. That second half is what makes the
number honest — otherwise an approval rule could turn a truthful `5s` into four
hours with the author doing nothing wrong. A tool that might ever need a person
declares `async`.

The budget is **required and positive**, because it exists so that no caller has to
invent a deadline. An agent may never declare `sync` at all: both decider kinds are
durable, so an agent cannot complete inside a call.

The `name` is how everything else refers to it: an agent's allowlist, a log line,
a policy. Choose it deliberately — it is the identity, and the proto path is not.

Convention in these examples is `<package>.<tool>`, which keeps names unique when
tools come from different repositories. The **shape** is not enforced. Two things
are: no two tools may share a name, and a name must be a dot-separated sequence of
`[A-Za-z0-9_-]` segments.

That second rule is a security rule rather than a style one. A name like `a.*.b`
would become a message-broker **wildcard subscription**, so the service mounting it
would receive *other tools'* requests — and NATS micro's own subject validation
accepts `*` without complaint. `garmctl compose` refuses it, naming what would have
happened.

## 2. An agent

An agent is a tool with an `agent` block. The block's presence means `rund` runs the
call and asks a decider what to do next, rather than a service answering it.

```proto
service TripPlannerService {
  rpc PlanTrip(PlanTripRequest) returns (PlanTripResponse) {
    option (garm.tool.v1.tool) = {
      name: "trip-planner"
      async: {}
      agent: {
        tools: [ { name: "weather.v1.get_forecast" } ]
      }
    };
  }
}
```

Three things to notice.

**The method is `PlanTrip`, not `Invoke`.** The option carries the identity, so
the method name is an address and nothing reads it — name it for what the call
does.

**The response is a reference, not an answer.** A run can take minutes and may
wait on a human, so the call that starts one returns immediately.

**The allowlist names a tool from another proto package, with no import.** You
cannot import it, and buf will reject the import as unused if you try: an
allowlist cites *names*, so there is no proto-level dependency. That is precisely
why the next step is not optional.

## 3. Implement it, and write nothing else

`buf generate` runs `protoc-gen-garm-go` over the same protos. You implement an
interface. You write no subject, no marshalling, no registration and no error
mapping.

Generated, in `examples/gen/weather/v1/weather_garm.pb.go`:

```go
type WeatherServiceHandler interface {
	// GetForecast answers the tool "weather.v1.get_forecast".
	GetForecast(context.Context, *GetForecastRequest) (*GetForecastResponse, error)
}

func ServeWeatherService(r serve.Registrar, h WeatherServiceHandler) error
```

Yours, in `examples/weatherd/weatherd.go` — the whole file, minus imports:

```go
type Service struct{}

func (Service) GetForecast(_ context.Context, in *weatherv1.GetForecastRequest) (*weatherv1.GetForecastResponse, error) {
	if in.GetPlace() == "" {
		return nil, fmt.Errorf("place is required")
	}
	days := in.GetDays()
	if days == 0 {
		days = 1
	}
	return &weatherv1.GetForecastResponse{
		Summary:     fmt.Sprintf("%d day(s) over %s: clear", days, in.GetPlace()),
		HighCelsius: 21,
	}, nil
}

var _ weatherv1.WeatherServiceHandler = Service{}
```

Four things that follow.

**There is no `Unimplemented` embed.** Add a tool to the `.proto`, forget to
implement it, and the build fails. The grpc-go generator embeds one: that buys
source compatibility and pays for it with half-implemented services which start
cleanly and answer `Unimplemented` to a real caller.

**The tool's name is nowhere in your code.** It is in the `.proto`, the generator
read it there, and `ServeWeatherService` mounts it. One place, one spelling — a
handler that named itself would be the second.

**You return a plain `error`.** No status codes: the transport maps them, and a
tool author choosing one would be choosing one per transport.

**An agent gets no interface.** `trips.proto` declares only an agent, so
`buf generate` produces `trips.pb.go` and no `trips_garm.pb.go`. `rund` runs it with
a decider, so a handler method would be one you must never implement — and implementing
it would put a second answerer on the subject.

The last line is what makes this an example rather than a claim: it is compiled by
`mise run ci`, so renaming the method in the `.proto` breaks this package.

## 4. Run it

The bus runs in **operator mode**: every process connects with a credential whose
permissions were derived from the catalogue, over TLS. Locally, `garmctl topology
--dev` mints a throwaway set — keys, credentials, a self-signed certificate, and a
`nats-server.conf` that uses them — and says so. A deployment's root and operator
signing key come from a ceremony the generator never runs (below), its
certificate comes from its own CA, and it runs the full resolver rather than the
preloaded memory one `--dev` writes; the
[identity spec](specs/2026-10-04-identity-and-transport-security-design.md) §5–§7
says what each of those is.

```bash
garmctl compose examples/images.yaml -o build/catalogue.binpb
garmctl topology --dev --catalogue file://build/catalogue.binpb --callers forecast -o build/topo
nats-server -c build/topo/nats-server.conf &
go run ./examples/cmd/weatherd --creds build/topo/creds/weather.v1.WeatherService.creds --tls-ca build/topo/ca.pem
go run ./cmd/rund              --creds build/topo/creds/rund.creds                      --tls-ca build/topo/ca.pem --catalogue file://build/catalogue.binpb
go run ./examples/cmd/forecast --creds build/topo/creds/forecast.creds                  --tls-ca build/topo/ca.pem
```

Every line above is what `cmd/garmctl`'s `TestDevEmitsAServerConfigThatBootsAndAcceptsItsOwnCredentials`
does: it starts a server from the emitted file and connects with an emitted
credential. The test estate (`internal/estate`) is the same topology stood up in
process, which is how every test runs against it.

```
level=INFO msg=observability exporter=none endpoint="" headers=[] disabled=false service=weatherd
level=INFO msg=starting nats=nats://127.0.0.1:4222 creds=build/topo/creds/weather.v1.WeatherService.creds name=weatherd version=0.1.0 health=""
level=INFO msg=mounted service=weatherd endpoint=weather_v1_get_forecast subject=garm.tool.weather.v1.get_forecast
```

**The subject comes from the tool's name, not from the proto path.** Re-home
`GetForecast` to another package, service or method and the subject does not move,
because the *name* did not. That is what separating identity from address buys, and
the estate this replaces gave it away by routing on the path.

The whole process is forty lines, and the only line that mentions this service's
tools is generated:

```go
svc, err := natsserve.New(natsserve.Config{Name: name, Version: version, Logger: log})
...
err = weatherv1.ServeWeatherService(svc, weatherd.Service{})   // generated
...
err = svc.Start(nc)          // returns only once the tools are ANSWERING
log.Info("ready")            // /readyz turns 200 on exactly this line
return svc.Serve(ctx)        // until SIGTERM, then drains
```

`Run` returns only once every in-flight call has been answered — including a call
that was queued behind a slow one. That is why `main` closes the connection with
`defer` *after* `Run`, and not before: closing early turns a deploy into a handful
of caller timeouts.

### A deployment's keys

`--dev` mints a throwaway operator and discards its root. A deployment runs the
root ceremony **once, offline**, and hands `topology` only what it needs:

```bash
garmctl operator init --out ceremony            # OFFLINE, once; then move ceremony/root to custody
garmctl topology --keys ceremony/keys --manifest manifest.json --first \
  --catalogue file://build/catalogue.binpb --callers studio -o topo
```

Three keys, three places: the **root** signs the operator JWT and nothing else,
and lives in custody — `topology` refuses a `--keys` that holds it; the
**operator signing key** signs every account and lives where issuance runs; each
**account's signing key** signs its credentials. A new caller's keys are born at
issuance and written to `--keys-out` (default `--keys`; a scratch path where
`--keys` is a read-only mount), its identity seed under `archive/` where nothing
reads it. The server enforces the shape: with `StrictSigningKeyUsage` on, an
account signed by the root or a user signed by an identity key is refused.

Rotating an account's signing key is two issuances, so nothing goes down:

```bash
garmctl topology --keys … --manifest … --rotate-signing GARM …   # new key listed beside the old; GARM's credentials reissued; the old seed archived
# roll the new credential files out
garmctl topology --keys … --manifest … --verify-live --nats … --ops-creds … --servers 3 …   # retires the old key -- refusing, by name, if any live connection still uses it
garmctl topology --status --keys … --manifest …                  # what is retiring, in between
```

Retiring a key is a decision, not a side effect: an issuance that would drop one
refuses unless it is told `--verify-live` or `--no-verify-live`. `--verify-live`
asks the cluster which key each live connection was signed by, pages through
every server's connections, and treats fewer servers answering than `--servers`
as no evidence. On Kubernetes `kubectl rollout status` is necessary and not
sufficient — a Deployment can be "rolled out" with one pod still reconnecting on
an old mount — and this is the check that is. A credential file that went
missing from `--out` is reissued on the next run, and the run says so.

### Seeing it run

Every process opens with the same two lines, and they are the whole of its
observability setup:

```go
log := slog.New(observe.Handler(slog.NewTextHandler(os.Stderr, nil)))
stop, err := otlp.Start(ctx, "weatherd", log)   // reads OTEL_EXPORTER_OTLP_ENDPOINT; none means export nothing
defer stop(ctx)
```

With no endpoint the startup line says `observability exporter=none` and nothing
leaves the process. To ship everything to OpenObserve, two variables and nothing
else — the code knows no backend's name, only OTLP. (`docker compose up -d`
starts one beside the bus; `mise run e2e-compose` runs the quick start against
both and looks the forecast's trace up in it.)

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=https://o2.example.com/api/garm
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic $(echo -n 'user@example.com:password' | base64)"
```

The startup line then reads `exporter=otlp … headers=[Authorization]` — header
*names*, never values.

**One call is one trace.** `garm.call` in the caller, `garm.run.invoke` in `rund`
— carrying the caller's account key as `garm.caller` and, given
`rund --callers build/topo/callers.json`, its name as `garm.caller_name` —
and `garm.tool` in the tool, as its child. A tool handler finds the span on its
`ctx`; adding to it is an ordinary OTel API call in the author's own module. The
id an `INTERNAL` error tells a caller to quote is `rund`'s run id, which is
`garm.run_id` on that trace — search for it and the whole trace opens, every
process included. Logs go to stdout for you and over OTLP for the backend, each
line stamped with its `trace_id`; **do not also tail stdout into OpenObserve**,
or every line arrives twice.

**Counters, no histogram.** `garm.tool.calls{tool,kind}`, `garm.tool.inflight`,
`garm.tool.deadline_exceeded`, `garm.run.invocations{tool,caller,caller_name,kind}`,
`garm.service.drain{service,queued}`. Latency comes from the spans themselves —
every call is traced, so the backend has every duration exactly.

**Health.** `--health 127.0.0.1:8080` serves `/livez` and `/readyz`. `/readyz` is
200 exactly while the service answers `$SRV.PING` — after `Start` returned,
until the drain begins — and a test holds the two to that, because a readiness
flag that disagreed with the bus would be the kind of check this repository
exists to catch. (Under operator mode, `nats micro ping` needs a credential in
the service's account that may publish `$SRV.>`; none of the issued ones may,
by design — the HTTP endpoint is the operator's view.)

### Telling the caller what went wrong

A handler returns a plain `error` and gets `INTERNAL` with a correlation id — its
own words never reach the caller, because that is where connection strings and
constraint values live. To say something to the caller, say it deliberately:

```go
if in.GetPlace() == "" {
	return nil, serve.Invalid("place is required")
}
if !known(in.GetPlace()) {
	return nil, serve.NotFound("no forecast for %q", in.GetPlace())
}
if err := upstream(ctx); err != nil {
	return nil, serve.Unavailable("the forecast service is not answering").Because(err)
}
```

`Because` is for your log, not for the wire. Five kinds exist — `INVALID`,
`NOT_FOUND`, `DENIED`, `UNAVAILABLE`, `INTERNAL` — and `UNAVAILABLE` is the only
one that tells a caller retrying is worth it.

One thing *does* leave the process: the cause chain is logged with the id, and
logs are shipped to the backend (next section). An error that interpolates an
input — `fmt.Errorf("no rate for %s", in.GetIban())` — ships that input. Say what
failed, not what it was called with.

## 5. Compose, and let it check

```yaml
# examples/images.yaml
schema: v1
images:
  - uri: file://../build/weather.binpb
  - uri: file://../build/trips.binpb
```

```
buf build --path examples/proto/weather -o build/weather.binpb
buf build --path examples/proto/trips   -o build/trips.binpb
garmctl compose examples/images.yaml
```

```
ok: 2 images, 2 tools, 1 of them agents, every allowlist entry resolves
```

Two images, as two repositories would each publish one, merged into one namespace
and checked. What it refuses:

| | |
|---|---|
| a tool declaring no delivery | *"declares no delivery: say sync or async"* |
| an agent declaring `sync` | *"is an agent and declares sync: an agent is durable and cannot complete inside a call"* |
| two tools claiming one name | *"two tools declare the name …"*, naming **both images** |
| an allowlist entry naming nothing | *"… names a tool nothing in this namespace declares"* |
| a shared contract file differing between images | *"… differs between … and …"* |

Try it: rename `weather.v1.get_forecast` and run `mise run examples`. The agent's
allowlist stops resolving, and the error names the image to look in.

## 6. Images from elsewhere

`file://` is one of three schemes.

```yaml
images:
  - uri: file://build/local.binpb
  - uri: s3://garm/images/accounts-v1.2.0.binpb
    sha256: 9f2c…
  - uri: https://github.com/acme/screening/releases/download/v1.4.0/screening.binpb
    sha256: 4a81…
```

A **git tag** resolves as that third form: a release-asset URL already encodes the
tag, so there is no clone and no git client.

`sha256` is **required for remote** and optional for `file://`. An S3 object and a
release asset can both be replaced in place, so a remote URI without a digest pins
a location rather than bytes. A local file is already in your tree under the same
review as your code.

For an S3-compatible store, set `AWS_ENDPOINT_URL`; credentials resolve the
standard way (`AWS_*`, `~/.aws/config`, instance roles). There is no config file
of our own duplicating that.

## What does not exist yet

**Nothing calls a tool for you.** There is no generated client, so a caller
marshals a request and does `nc.Request(natsserve.Subject(name), body, timeout)`
itself. That is the next step.

There is also no gateway, no decider, no discovery, no descriptor hash, no clearance,
compartments, verbs, tool sets or approvals. Those are real and most are coming —
they are absent because nothing enforces them yet, and a declaration nothing acts
on is a promise the platform breaks silently.
