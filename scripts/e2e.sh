#!/usr/bin/env bash
# The quick start, end to end, on this laptop. Everything README.md's Getting
# started says, run and checked: a throwaway topology, a server from its config,
# weatherd and rund with health listeners, one forecast -- and the answer, the
# readiness endpoints and the startup lines asserted rather than eyeballed.
set -euo pipefail
cd "$(dirname "$0")/.."

out=build/e2e
rm -rf "$out" && mkdir -p "$out"
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

say "topology --dev: a THROWAWAY operator, accounts, one credential per process, a server config"
"$bin/garmctl" topology --dev --catalogue "file://$out/catalogue.binpb" --callers forecast -o "$out/topo"

say "nats-server from the emitted config (operator mode, TLS)"
if lsof -nP -iTCP:4222 -sTCP:LISTEN 2>/dev/null | grep -q 127.0.0.1:4222; then
  fail "something already listens on 127.0.0.1:4222; stop it or the quick start's server cannot bind"
fi
nats-server -c "$out/topo/nats-server.conf" > "$out/nats-server.log" 2>&1 &
pids+=($!)
for _ in $(seq 1 50); do grep -q "Server is ready" "$out/nats-server.log" 2>/dev/null && break; sleep 0.1; done
grep -q "Server is ready" "$out/nats-server.log" || fail "nats-server did not become ready: $(tail -5 "$out/nats-server.log")"

say "weatherd and rund, each with a health listener"
for port in 8080 8081; do
  if lsof -nP -iTCP:$port -sTCP:LISTEN 2>/dev/null | grep -q LISTEN; then
    fail "something already listens on 127.0.0.1:$port (a previous run's process?); stop it first: lsof -nP -iTCP:$port"
  fi
done
"$bin/weatherd" --creds "$out/topo/creds/weather.v1.WeatherService.creds" --tls-ca "$out/topo/ca.pem" --health 127.0.0.1:8081 > "$out/weatherd.log" 2>&1 &
pids+=($!)
"$bin/rund" --creds "$out/topo/creds/rund.creds" --tls-ca "$out/topo/ca.pem" --catalogue "file://$out/catalogue.binpb" --callers "$out/topo/callers.json" --health 127.0.0.1:8080 > "$out/rund.log" 2>&1 &
pids+=($!)

ready() { [ "$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$1/readyz")" = "200" ]; }
for _ in $(seq 1 200); do ready 8081 && ready 8080 && break; sleep 0.1; done
ready 8081 || fail "weatherd never became ready: $(tail -5 "$out/weatherd.log")"
ready 8080 || fail "rund never became ready: $(tail -5 "$out/rund.log")"
echo "readyz: weatherd 200, rund 200"

say "forecast: a caller that names a tool and nothing else"
answer=$("$bin/forecast" --creds "$out/topo/creds/forecast.creds" --tls-ca "$out/topo/ca.pem" --place Ghent --days 2 2>"$out/forecast.log")
echo "$answer"
[[ "$answer" == *"Ghent"* && "$answer" == *"high"* ]] || fail "the forecast did not come back through the chain: $answer"

say "what each process said at startup"
grep -h "msg=observability" "$out/weatherd.log" "$out/rund.log" "$out/forecast.log" | sed 's/^/  /'
grep -q "exporter=none" "$out/rund.log" || fail "rund did not say exporter=none with no endpoint set"
grep -q 'msg=invoked' "$out/rund.log" || fail "rund logged no invocation"
grep -q 'trace_id=' "$out/rund.log" || fail "rund's invocation line carries no trace id"
grep -E 'msg=invoked' "$out/rund.log" | sed 's/^/  /'

say "drain: SIGTERM, readyz goes 503, the processes exit cleanly"
kill -TERM "${pids[1]}" "${pids[2]}"
for _ in $(seq 1 50); do ready 8080 || break; sleep 0.1; done
wait "${pids[1]}" "${pids[2]}" 2>/dev/null || true
grep -q "stopped cleanly" "$out/weatherd.log" || fail "weatherd did not stop cleanly: $(tail -3 "$out/weatherd.log")"
grep -q "stopped cleanly" "$out/rund.log" || fail "rund did not stop cleanly: $(tail -3 "$out/rund.log")"

printf '\nOK: the quick start runs end to end. Logs in %s/\n' "$out"
