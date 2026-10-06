# Operating the topology

`garmctl topology` is the one generator that turns a catalogue into the bus's
operator-mode configuration: the operator, the accounts, one credential per
process, and the revocations a change requires. [docs/concepts.md](concepts.md)
says what those things are and [docs/guide.md](guide.md) §4 walks through the
first issuance and a signing-key rotation. This page is the rest: what the
command reads and writes, file by file; the events of a running deployment and
the command each one is; where the files go on Kubernetes; and every refusal
you can meet, with what it means. Every claim here is kept true by a test named
in [docs/invariants.md](invariants.md), under "The transport, under operator
mode" and "Signing keys".

## What it reads

| input | flag | what it is |
|---|---|---|
| the catalogue | `--catalogue`, `--catalogue-sha256`, `--catalogue-dir` | what `garmctl compose` wrote. Every permission is derived from it: a tool service may subscribe to exactly the tools it declares; a caller may publish `garm.run.v1.>` and nothing else |
| the keys directory | `--keys` | what `garmctl operator init` wrote under `keys/`: `operator.jwt` (signed by the root, listing the operator signing key), `operator-signing.nk` (the seed that signs accounts and the manifest), and per account `<ACCOUNT>.pub` and `<ACCOUNT>.signing.nk`. **The root is never here**; a directory holding `root.nk` is refused |
| the manifest | `--manifest` | the previous topology, signed. Required: a removal is only visible as a difference against it. A first issuance says `--first`; `--first` against an existing manifest is refused |
| the callers | `--callers` | the caller accounts to issue, by name. Each becomes `CALLER-<name>`; a name with no `<ACCOUNT>.pub` in `--keys` is new, and its keys are minted |

`--dev` replaces `--keys` and `--manifest` with a throwaway operator whose root is
discarded, and writes a local server configuration beside the output. It is the
laptop and the test estate, never a deployment, and it says so on every run.

## What it writes

Under `--out`:

| file | who reads it | secret? |
|---|---|---|
| `operator.jwt` | the server (`operator:` in its configuration) | no, but 0600 |
| `accounts/<ACCOUNT>.jwt` | the server's resolver. Each carries the account's permissions, its signing keys, and its **revocations** | no |
| `creds/<name>.creds` | one process each: `rund.creds`, `ops.creds`, `<proto service>.creds` per tool service, `<caller>.creds` per caller. A user JWT and its seed | **yes** |
| `manifest.json` | the next issuance. Generation, catalogue digest, every credential issued with its account, public key, generation, permission hash and signing key; signed by the operator signing key | no, and it belongs in git |
| `revocations.json` | you, to review. The credentials this issuance revoked, each with its kind (`Retired`, `Moved`, `Superseded`) and why. `[]` when nothing was | no |
| `callers.json` | `rund --callers`, to label spans and counters with a caller's name | no, 0644 |

Under `--keys-out` (default `--keys`), only when an account is new or rotated:

| file | what |
|---|---|
| `<ACCOUNT>.pub` | the account's identity public key: its name on the bus, stable for life |
| `<ACCOUNT>.signing.nk` | the seed that signs this account's credentials |
| `archive/<ACCOUNT>.identity.nk` | the identity seed, written once and read by nothing: the identity key signs nothing after creation |
| `archive/<ACCOUNT>.signing.<key>.nk` | a superseded signing seed after `--rotate-signing`, kept until you delete it |

`--dev` adds `nats-server.conf` (absolute paths, `127.0.0.1`), `nats-server.docker.conf`
(paths relative to the directory, every interface, for `compose.yaml` which mounts
the directory at `/topo`), and a self-signed `ca.pem`, `server.pem`, `server-key.pem`
good for a day. Both configurations run the **memory resolver with every account
preloaded**, which is why a changed catalogue on a laptop means re-running
`--dev` and restarting the server. A deployment does neither: it runs the full
resolver and pushes accounts to it (below).

The command's last line is the summary:

```
ok: generation 2 from catalogue 4d0c794cd437 -- 4 accounts, 5 credentials, 1 revocations, written to topo
```

## The lifecycle, event by event

Every event is one issuance against the manifest. The generator reads the
previous state, computes the delta, writes the new state back. A credential
whose permission set did not change is **carried forward untouched**: adding one
tool restarts one service, not every process on the bus.

**First issuance.** Once, after the root ceremony, from the issuance environment:

```bash
garmctl operator init --out ceremony                     # offline; then move ceremony/root to custody
garmctl topology --keys ceremony/keys --manifest manifest.json --first \
  --catalogue file://build/catalogue.binpb --callers studio -o topo
```

Commit `manifest.json`. Store `creds/` in the secret store, one secret per
process. Hand `operator.jwt` and `accounts/*.jwt` to the servers.

**A tool is added.** Compose the new catalogue and issue against the manifest:

```bash
garmctl topology --keys … --manifest manifest.json --catalogue file://build/catalogue.binpb --callers studio -o topo
```

The service that declares the new tool gets a reissued credential whose
permission set now covers it; everything else is carried forward. Order: the
permission lands **before** the service answering it starts, because a service
refuses to start on a credential that does not cover a mount. So: push the
account, roll out the credential, then deploy the service.

**A tool is removed.** The same command. `rund` reloads and the name no longer
resolves, which stops routing at once; but a user JWT is a bearer document in a
process's hands, and editing a catalogue reaches nothing a process already holds.
So the generator **revokes** the retired service's credential in its account JWT
and lists it in `revocations.json`. Order: the service stops **before** the
account carrying the revocation is pushed, or it loses its connection mid-call.
Both orders are one rule: the permission set is briefly a superset of what is
running, never a subset.

**A caller is added.** Add its name to `--callers`. Its account keys are minted
into `--keys-out`; its account JWT, its credential and a new `callers.json`
appear. A caller's account imports the run service at its own key, which is how
the server places that caller's identity in every subject it publishes.

**A credential file went missing.** Run the same issuance into the same `--out`.
A credential the manifest records and the directory lacks is reissued by name,
and the run says `<name>: credential file was missing; reissued`. A fresh,
empty `--out` is a new place, not a partial failure, and reissues nothing.

**Everything is reissued.** `--rotate` reissues every credential and revokes every
previous one: a compromise, or a wholesale rotation inside the expiry. Every
credential carries an expiry of one year by default; revocation is the mechanism
and expiry the floor under it.

**An account's signing key is rotated.** Two issuances, so nothing goes down.
Step one lists the new key beside the old and reissues the account's credentials
under it; the old seed goes to `archive/`. Roll the credentials out. Step two
retires the old key, and the generator refuses to do that as a side effect: it
wants `--verify-live`, which asks every server which key each live connection
was signed by and refuses while any still uses the old one, or `--no-verify-live`
said on purpose. `--status` shows what is retiring in between. The guide's §4
has the three commands.

```bash
garmctl topology --status --keys … --manifest manifest.json
# generation 3 from catalogue 4d0c794cd437, issued 2026-10-06T09:12:00Z; 5 credentials
#   GARM  identity ACMI…  signing ACEB…
#     RETIRING AB7Q… (1 credentials still name it): roll the new credentials out, then run an issuance with --verify-live to retire it
```

## Applying a change to a live cluster

A deployment's servers run the NATS **full resolver**: accounts stored and
replicated by the servers themselves, updated over the system account, with no
separate account server. In `nats-server.conf`:

```
operator: /etc/garm/operator.jwt
system_account: <SYS account public key, from keys/SYS.pub>
resolver {
  type: full
  dir: /var/lib/nats/accounts
}
```

A new or changed account JWT reaches the servers by a request on the system
account, made with the operations credential `creds/ops.creds`, which nothing in
the data path holds:

```bash
nats --creds topo/creds/ops.creds --tlsca ca.pem --server nats://… \
  request '$SYS.REQ.ACCOUNT.'"$(cat keys/GARM.pub)"'.CLAIMS.UPDATE' "$(cat topo/accounts/GARM.jwt)"
```

That is the path the test estate exercises for every revocation property: an
account update pushed over `$SYS` with the ops credential, against the same full
resolver, in process. A `garmctl` verb that does this push for every account an
issuance changed is on the roadmap; today it is one request per changed account.

A process picks up a new credential on its next connection. The Go client
re-reads a credentials file on reconnect, and a mounted Secret updates in place,
so a pod often follows a rotation without a restart; that is useful and is not
what step two of a rotation relies on, which is `--verify-live`.

## On Kubernetes

The issuance environment is the security boundary. The generator is a CLI so
that it can run in an audited job with a secret store, and "keys are an input"
is what makes that possible.

| thing | where |
|---|---|
| the root | custody, offline. Never on a cluster |
| `keys/` | a Secret mounted read-only into the issuance job. Because it is read-only, pass `--keys-out` as a scratch path and store what lands there back into the Secret |
| `manifest.json` | the deployment repository, beside `images.yaml`. A review is a pull request; two operators issuing from different previous states is a merge conflict, not two conflicting revocations |
| `operator.jwt`, `accounts/` | a ConfigMap for the servers' first boot; thereafter the resolver's directory, fed by pushes |
| `creds/<name>.creds` | one Secret per process, mounted into that process only. `rund` gets `rund.creds`, each tool service its own, each caller its own |
| `ops.creds` | the issuance job and operators. Nothing in the data path |
| TLS | the deployment's CA. The server refuses non-TLS connections; every process takes `--tls-ca` |
| `rund --run-store-executor` | unrelated to the topology, but the same kind of rule: stable across restarts, unique among live replicas, so a StatefulSet ordinal |

`kubectl rollout status` is necessary and not sufficient before retiring a key: a
Deployment can be "rolled out" with one pod still reconnecting on an old mount.
`--verify-live` is the check that is.

## Refusals, and what each means

| message | meaning |
|---|---|
| `--keys and --manifest are required (or --dev for a throwaway topology)` | a deployment issuance needs both inputs; `--dev` is the laptop |
| `… holds root.nk: the root must never be where topology runs` | the keys directory contains the root seed. Move it to custody; the generator refuses to run beside it |
| `no manifest at …: the generator refuses to run without the previous topology … For a FIRST issuance pass --first` | the manifest is absent. If this really is the first issuance, say so; if it is not, find the manifest before issuing, or every credential it recorded is forgotten |
| `… exists; --first would forget every credential it records` | `--first` with a manifest present. Drop the flag |
| `cannot read the manifest at …` | the path exists and cannot be read (a permission, a path under a file). Not a reason to pass `--first` |
| `this issuance would retire a signing key on GARM, which closes every connection still using it; pass --verify-live … or --no-verify-live …` | step two of a rotation is pending and must be decided, not carried along with an unrelated change |
| `--verify-live: GARM's retiring key AB7Q… still signs 2 live connection(s): …` | the rollout is not finished. Roll out, then retry |
| `--verify-live: 1 server(s) answered CONNZ within …, 3 expected; a server that did not answer is not evidence …` | no evidence is not a pass. Check the cluster and the ops credential, or lower `--servers` only if the cluster really is smaller |
| `--verify-live: server … reports N connections and showed M; its connections could not all be checked` | a server's connection list could not be paged to its end. Retry; it fails closed |
| `--verify-live needs --nats and --ops-creds` | it asks the cluster, so it needs a way in |
| `--status takes --keys and --manifest and nothing else` | a status read issues nothing; an issuance flag beside it would be silently ignored, so it is refused |
| a service logs `this credential does not permit answering garm.tool.<name>; the catalogue it was issued from does not declare it` | the service's credential predates the tool. Issue, push, roll out, then start the service |
| `--rotate and --rotate-signing together are refused: --rotate revokes every previous credential now, --rotate-signing keeps the account's alive until the old key is retired` | pick one: a wholesale rotation of credentials, or a signing-key rotation that keeps them alive |

## What this does not cover

Leafnode and route connections, which `--verify-live` cannot see in `CONNZ`;
nothing in this estate uses them. Revocations across generations: an account JWT
is rebuilt on every issuance, so a revocation from generation N is absent at N+1
once its entry ages out; the fix is a revocation record carried forward in the
manifest, on the roadmap under "Found, not yet fixed". A `garmctl` push verb.
