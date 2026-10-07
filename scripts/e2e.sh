#!/usr/bin/env bash
# The quick start, end to end, on this laptop. Everything README.md's Getting
# started says, run and checked: a throwaway topology, a server from its config,
# weatherd and rund with health listeners, one forecast -- and the answer, the
# readiness endpoints and the startup lines asserted rather than eyeballed.
set -euo pipefail
cd "$(dirname "$0")/.."

# Two modes. `e2e` is self-contained: its own topology under build/e2e and its
# own nats-server, nothing shipped. `e2e compose` runs against the two containers
# compose.yaml starts -- the bus booted from build/topo's config, OpenObserve on
# O2_PORT -- ships the telemetry there, and then ASKS OpenObserve for the trace
# the forecast produced: three spans, three services, one trace id.
mode="${1:-native}"
nats_port="${NATS_PORT:-4222}"
o2_port="${O2_PORT:-5080}"
pg_port="${PG_PORT:-5432}"
hp_rund="${RUND_HEALTH_PORT:-8080}"
hp_tool="${WEATHERD_HEALTH_PORT:-8081}"
o2_user="root@example.com"; o2_pass="Complexpass#123"   # compose.yaml's local defaults
if [ "$mode" = compose ]; then
  out=build/topo
  export OTEL_EXPORTER_OTLP_ENDPOINT="http://127.0.0.1:${o2_port}/api/default"
  export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic $(printf '%s:%s' "$o2_user" "$o2_pass" | base64 | tr -d '\n')"
else
  out=build/e2e
  rm -rf "$out"
fi
mkdir -p "$out"
pids=()
cleanup() { for p in "${pids[@]:-}"; do kill "$p" 2>/dev/null || true; done; wait 2>/dev/null || true; }
trap cleanup EXIT

say() { printf '\n== %s\n' "$*"; }
fail() { printf '\nFAIL: %s\n' "$*" >&2; exit 1; }

say "build: the four binaries a deployment runs (not go run -- it does not hand SIGTERM to its child, and a deployment runs binaries)"
go build -o "$out/bin/garmctl" ./cmd/garmctl
go build -o "$out/bin/rund" ./cmd/rund
go build -o "$out/bin/weatherd" ./examples/cmd/weatherd
go build -o "$out/bin/forecast" ./examples/cmd/forecast
bin="$out/bin"

say "compose: two repositories' declarations -> one verified namespace"
"$bin/garmctl" compose examples/images.yaml -o "$out/catalogue.binpb"

if [ "$mode" = compose ]; then
  topo="$out"
  say "compose mode: the bus is garm-nats on 127.0.0.1:$nats_port, booted from $topo; telemetry goes to OpenObserve on $o2_port"
  [ -f "$topo/nats-server.docker.conf" ] || fail "$topo has no topology; run: garmctl topology --dev --catalogue file://build/catalogue.binpb --callers forecast -o build/topo && docker compose up -d"
  docker inspect -f '{{.State.Health.Status}}' garm-nats 2>/dev/null | grep -q healthy || fail "garm-nats is not healthy; docker compose up -d first"
  curl -fsS -o /dev/null "http://127.0.0.1:${o2_port}/healthz" || fail "OpenObserve is not answering on 127.0.0.1:${o2_port}; docker compose up -d first"
  docker inspect -f '{{.State.Health.Status}}' garm-postgres 2>/dev/null | grep -q healthy || fail "garm-postgres is not healthy; docker compose up -d first"
  run_store="postgres://garm:garm@127.0.0.1:${pg_port}/garm?sslmode=disable"
else
  run_store="sqlite:$out/runs.db"
  topo="$out/topo"
  say "topology --dev: a THROWAWAY operator, accounts, one credential per process, a server config"
  "$bin/garmctl" topology --dev --catalogue "file://$out/catalogue.binpb" --callers forecast -o "$topo"

  say "nats-server from the emitted config (operator mode, TLS)"
  if lsof -nP -iTCP:$nats_port -sTCP:LISTEN 2>/dev/null | grep -q "127.0.0.1:$nats_port"; then
    fail "something already listens on 127.0.0.1:$nats_port; stop it (or docker compose down) or the quick start's server cannot bind"
  fi
  nats-server -c "$topo/nats-server.conf" > "$out/nats-server.log" 2>&1 &
  pids+=($!)
  for _ in $(seq 1 50); do grep -q "Server is ready" "$out/nats-server.log" 2>/dev/null && break; sleep 0.1; done
  grep -q "Server is ready" "$out/nats-server.log" || fail "nats-server did not become ready: $(tail -5 "$out/nats-server.log")"
fi
nats_url="nats://127.0.0.1:$nats_port"

say "weatherd and rund, each with a health listener"
for port in "$hp_rund" "$hp_tool"; do
  if lsof -nP -iTCP:$port -sTCP:LISTEN 2>/dev/null | grep -q LISTEN; then
    fail "something already listens on 127.0.0.1:$port (a previous run's process?); stop it first: lsof -nP -iTCP:$port"
  fi
done
"$bin/weatherd" --nats "$nats_url" --creds "$topo/creds/weather.v1.WeatherService.creds" --tls-ca "$topo/ca.pem" --health "127.0.0.1:$hp_tool" > "$out/weatherd.log" 2>&1 &
pids+=($!)
"$bin/rund" --nats "$nats_url" --creds "$topo/creds/rund.creds" --tls-ca "$topo/ca.pem" --catalogue "file://$out/catalogue.binpb" --callers "$topo/callers.json" --health "127.0.0.1:$hp_rund" --run-store "$run_store" > "$out/rund.log" 2>&1 &
pids+=($!)

ready() { [ "$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$1/readyz")" = "200" ]; }
for _ in $(seq 1 200); do ready "$hp_tool" && ready "$hp_rund" && break; sleep 0.1; done
ready "$hp_tool" || fail "weatherd never became ready: $(tail -5 "$out/weatherd.log")"
ready "$hp_rund" || fail "rund never became ready: $(tail -5 "$out/rund.log")"
echo "readyz: weatherd 200, rund 200"

say "forecast: a caller that names a tool and nothing else"
answer=$("$bin/forecast" --nats "$nats_url" --creds "$topo/creds/forecast.creds" --tls-ca "$topo/ca.pem" --place Ghent --days 2 2>"$out/forecast.log")
echo "$answer"
[[ "$answer" == *"Ghent"* && "$answer" == *"high"* ]] || fail "the forecast did not come back through the chain: $answer"

say "schedule_report: an ASYNC tool -- pending now, the answer from the run store"
grep -q 'msg="run store"' "$out/rund.log" || fail "rund did not open the run store: $(grep -i 'run store' "$out/rund.log" | tail -3)"
grep 'msg="run store"' "$out/rund.log" | sed 's/^/  /'
key="e2e-$(date +%s)"
pending=$("$bin/garmctl" call weather.v1.schedule_report '{"place":"Ghent"}' --idempotency-key "$key" \
  --nats "$nats_url" --creds "$topo/creds/forecast.creds" --tls-ca "$topo/ca.pem" \
  --catalogue "file://$out/catalogue.binpb" 2>"$out/call.log")
echo "  $pending"
[[ "$pending" == "pending $key" ]] || fail "the async call did not come back pending with the key as the run id: $pending ($(cat "$out/call.log"))"
# A held fetch returns when the run CHANGES -- a stage change included -- so a
# person sees where it is; the answer is whichever fetch finds it terminal.
fetched=""
for _ in $(seq 1 10); do
  fetched=$("$bin/garmctl" fetch "$key" --wait 30s \
    --nats "$nats_url" --creds "$topo/creds/forecast.creds" --tls-ca "$topo/ca.pem" \
    --catalogue "file://$out/catalogue.binpb" 2>"$out/fetch.log")
  echo "$fetched" | sed 's/^/  /'
  [[ "$fetched" == RUNNING* ]] || break
done
[[ "$fetched" == *"SUCCEEDED"* && "$fetched" == *"report-Ghent"* ]] || fail "fetch did not return the run's answer: $fetched ($(cat "$out/fetch.log"))"
grep -q "msg=\"run started\"" "$out/rund.log" || fail "rund logged no run start"

say "follow: the run's events -- the record first, then live, stitched by sequence; then again from zero once it is over"
followed=$("$bin/garmctl" fetch "$key" --follow \
  --nats "$nats_url" --creds "$topo/creds/forecast.creds" --tls-ca "$topo/ca.pem" \
  --catalogue "file://$out/catalogue.binpb" 2>"$out/follow.log")
echo "$followed" | sed 's/^/  /'
[[ "$followed" == *"stage calling:0"* && "$followed" == *"step $key:0 OK"* && "$followed" == *"done SUCCEEDED"* ]] || fail "follow did not print the run's events: $followed ($(cat "$out/follow.log"))"
again=$("$bin/garmctl" fetch "$key" --follow --after 0 \
  --nats "$nats_url" --creds "$topo/creds/forecast.creds" --tls-ca "$topo/ca.pem" \
  --catalogue "file://$out/catalogue.binpb" 2>"$out/follow2.log")
[[ "$again" == "$followed" ]] || fail "the catch-up from zero after the run differs from the live follow:
$again"
echo "  (the same four lines again, from the record alone)"

say "what each process said at startup"
grep -q 'msg=credential expires=' "$out/weatherd.log" || fail "weatherd did not say when its credential expires"
grep -q 'msg=credential expires=' "$out/rund.log" || fail "rund did not say when its credential expires"
grep -h 'msg=credential ' "$out/weatherd.log" "$out/rund.log" | sed 's/^/  /'
grep -h "msg=observability" "$out/weatherd.log" "$out/rund.log" "$out/forecast.log" | sed 's/^/  /'
if [ "$mode" = compose ]; then
  grep -q "exporter=otlp" "$out/rund.log" || fail "rund did not say exporter=otlp with the endpoint set"
else
  grep -q "exporter=none" "$out/rund.log" || fail "rund did not say exporter=none with no endpoint set"
fi
grep -q 'msg=invoked' "$out/rund.log" || fail "rund logged no invocation"
grep -q 'trace_id=' "$out/rund.log" || fail "rund's invocation line carries no trace id"
grep -E 'msg=invoked' "$out/rund.log" | sed 's/^/  /'

if [ "$mode" = compose ]; then
  say "OpenObserve: the trace the forecast produced -- three spans, three services, one id"
  trace_id=$(grep -oE 'msg=invoked.*trace_id=[0-9a-f]+' "$out/rund.log" | tail -1 | sed -E 's/.*trace_id=//')
  [ -n "$trace_id" ] || fail "no trace id on rund's invocation line"
  found=""
  for _ in $(seq 1 30); do
    now=$(python3 -c 'import time; print(int(time.time()*1e6))'); start=$((now - 600 * 1000000))
    found=$(curl -s -u "$o2_user:$o2_pass" -H 'Content-Type: application/json' "http://127.0.0.1:${o2_port}/api/default/_search?type=traces" \
      -d "{\"query\":{\"sql\":\"SELECT operation_name, service_name FROM default WHERE trace_id = '$trace_id'\",\"start_time\":$start,\"end_time\":$now,\"from\":0,\"size\":10}}" \
      | python3 -c "import sys,json; d=json.load(sys.stdin); print(' '.join(sorted(h['service_name']+'/'+h['operation_name'] for h in d.get('hits',[]))))")
    [[ "$found" == *"forecast/garm.call"* && "$found" == *"rund/garm.run.invoke"* && "$found" == *"weatherd/garm.tool"* ]] && break
    sleep 1
  done
  echo "  trace $trace_id: $found"
  [[ "$found" == *"forecast/garm.call"* && "$found" == *"rund/garm.run.invoke"* && "$found" == *"weatherd/garm.tool"* ]] \
    || fail "OpenObserve does not hold the three spans of trace $trace_id (got: '$found')"

  say "OpenObserve: the async run -- the tool's span, executed from the queue, in the trace the caller started"
  run_trace=$(grep -oE 'msg="run started".*trace_id=[0-9a-f]+' "$out/rund.log" | tail -1 | sed -E 's/.*trace_id=//')
  [ -n "$run_trace" ] || fail "no trace id on rund's run-started line"
  found=""
  for _ in $(seq 1 30); do
    now=$(python3 -c 'import time; print(int(time.time()*1e6))'); start=$((now - 600 * 1000000))
    found=$(curl -s -u "$o2_user:$o2_pass" -H 'Content-Type: application/json' "http://127.0.0.1:${o2_port}/api/default/_search?type=traces" \
      -d "{\"query\":{\"sql\":\"SELECT operation_name, service_name FROM default WHERE trace_id = '$run_trace'\",\"start_time\":$start,\"end_time\":$now,\"from\":0,\"size\":10}}" \
      | python3 -c "import sys,json; d=json.load(sys.stdin); print(' '.join(sorted(h['service_name']+'/'+h['operation_name'] for h in d.get('hits',[]))))")
    [[ "$found" == *"rund/garm.run.invoke"* && "$found" == *"weatherd/garm.tool"* ]] && break
    sleep 1
  done
  echo "  trace $run_trace: $found"
  [[ "$found" == *"rund/garm.run.invoke"* && "$found" == *"weatherd/garm.tool"* ]] \
    || fail "OpenObserve does not hold the async run's invoke and tool spans under one trace (got: '$found')"
fi

say "drain: SIGTERM, readyz goes 503, the processes exit cleanly"
if [ "$mode" = compose ]; then w="${pids[0]}"; r="${pids[1]}"; else w="${pids[1]}"; r="${pids[2]}"; fi
kill -TERM "$w" "$r"
for _ in $(seq 1 50); do ready "$hp_rund" || break; sleep 0.1; done
wait "$w" "$r" 2>/dev/null || true
grep -q "stopped cleanly" "$out/weatherd.log" || fail "weatherd did not stop cleanly: $(tail -3 "$out/weatherd.log")"
grep -q "stopped cleanly" "$out/rund.log" || fail "rund did not stop cleanly: $(tail -3 "$out/rund.log")"

printf '\nOK: the quick start runs end to end. Logs in %s/\n' "$out"
