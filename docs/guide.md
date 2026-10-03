# Building a tool, and an agent

Every file this guide names is in the repository and composed by `mise run ci`.
If a field is renamed, this guide breaks in CI rather than misleading you.

- `examples/proto/weather/v1/weather.proto` — a tool
- `examples/proto/trips/v1/trips.proto` — an agent that calls it
- `examples/images.yaml` — how they compose

## 1. A tool

A tool is an RPC method carrying one option.

```proto
service WeatherService {
  rpc GetForecast(GetForecastRequest) returns (GetForecastResponse) {
    option (garm.tool.v1.tool) = { name: "weather.v1.get_forecast" };
  }
}
```

The `name` is how everything else refers to it: an agent's allowlist, a log line,
a policy. Choose it deliberately — it is the identity, and the proto path is not.

Convention in these examples is `<package>.<tool>`, which keeps names unique when
tools come from different repositories. Nothing enforces that shape yet; what *is*
enforced is that no two tools share a name.

## 2. An agent

An agent is a tool with an `agent` block. The block's presence means a runner
answers the call rather than a service.

```proto
service TripPlannerService {
  rpc PlanTrip(PlanTripRequest) returns (PlanTripResponse) {
    option (garm.tool.v1.tool) = {
      name: "trip-planner"
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

## 3. Compose, and let it check

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
| two tools claiming one name | *"two tools declare the name …"*, naming **both images** |
| an allowlist entry naming nothing | *"… names a tool nothing in this namespace declares"* |
| a shared contract file differing between images | *"… differs between … and …"* |

Try it: rename `weather.v1.get_forecast` and run `mise run examples`. The agent's
allowlist stops resolving, and the error names the image to look in.

## 4. Images from elsewhere

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

Nothing runs these tools. There is no gateway, no runner, no clearance,
compartments, verbs, tool sets or approvals. Those are real and most are coming —
they are absent because nothing enforces them yet, and a declaration nothing acts
on is a promise the platform breaks silently.
