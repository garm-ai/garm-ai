// Written by `mise run topology-walk` (cmd/garmctl/walk_test.go): the lifecycle of
// docs/operating-the-topology.md run for real and recorded. Regenerate, do not edit.
window.TOPOLOGY_WALK = {
 "generated_at": "2026-10-06T02:09:54Z",
 "steps": [
  {
   "id": "ceremony",
   "title": "The root ceremony, once, offline",
   "prose": "`garmctl operator init` mints the operator root and the operator signing key, writes the root-signed operator JWT, and puts the root under `root/` for custody. Everything `topology` will ever need is under `keys/`; the root is not.",
   "command": "garmctl operator init --out ceremony",
   "stdout": "ok: operator OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF; keys for topology in ceremony/keys\nMOVE ceremony/root TO CUSTODY NOW: the root signs nothing day to day and must never be where topology runs\n",
   "stderr": "",
   "files": [
    {
     "path": "ceremony/keys/operator-signing.nk",
     "kind": "seed",
     "change": "new",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/operator.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YJNO5HIDUCDNOQ2SER3XA224F5ABE7RVEXH4YK5AT7US6QGPXNBQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"name\": \"garm\",\n  \"sub\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "ceremony/root/root.nk",
     "kind": "seed",
     "change": "new",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    }
   ]
  },
  {
   "id": "first",
   "title": "The first issuance",
   "prose": "Against the weather catalogue (one tool service, one agent) and one caller, `studio`. `--first` because there is no manifest yet. Four accounts, four credentials; every permission derived from the catalogue. The server beside it runs the full resolver, seeded with the account JWTs, and every credential is tried against it.",
   "command": "garmctl topology --keys ceremony/keys --manifest manifest.json --first --catalogue file://weather.binpb --callers studio -o topo",
   "stdout": "ok: generation 1 from catalogue 24164e3e783d -- 4 accounts, 4 credentials, 0 revocations, written to topo\n",
   "stderr": "",
   "files": [
    {
     "path": "ca.pem",
     "kind": "pem",
     "change": "new",
     "secret": false,
     "size": 583,
     "content": "-----BEGIN CERTIFICATE-----\n…"
    },
    {
     "path": "ceremony/keys/CALLER-studio.pub",
     "kind": "text",
     "change": "new",
     "secret": false,
     "size": 57,
     "content": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N"
    },
    {
     "path": "ceremony/keys/CALLER-studio.signing.nk",
     "kind": "seed",
     "change": "new",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/GARM.pub",
     "kind": "text",
     "change": "new",
     "secret": false,
     "size": 57,
     "content": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK"
    },
    {
     "path": "ceremony/keys/GARM.signing.nk",
     "kind": "seed",
     "change": "new",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/SYS.pub",
     "kind": "text",
     "change": "new",
     "secret": false,
     "size": 57,
     "content": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB"
    },
    {
     "path": "ceremony/keys/SYS.signing.nk",
     "kind": "seed",
     "change": "new",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/TOOLS.pub",
     "kind": "text",
     "change": "new",
     "secret": false,
     "size": 57,
     "content": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5"
    },
    {
     "path": "ceremony/keys/TOOLS.signing.nk",
     "kind": "seed",
     "change": "new",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/CALLER-studio.identity.nk",
     "kind": "seed",
     "change": "new",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/GARM.identity.nk",
     "kind": "seed",
     "change": "new",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/SYS.identity.nk",
     "kind": "seed",
     "change": "new",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/TOOLS.identity.nk",
     "kind": "seed",
     "change": "new",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/operator-signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YJNO5HIDUCDNOQ2SER3XA224F5ABE7RVEXH4YK5AT7US6QGPXNBQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"name\": \"garm\",\n  \"sub\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "ceremony/root/root.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "manifest.json",
     "kind": "json",
     "change": "new",
     "secret": false,
     "size": 3182,
     "content": "{\n  \"manifest\": {\n    \"generation\": 1,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:09:38.618426+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n        \"signing\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n      },\n      \"GARM\": {\n        \"identity\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"signing\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n        \"signing\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"signing\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCQB77KS353BZOFF4PRMBYYN3X3C7QAZMANS3CKAO5EZ3KX6BUVSVTU5\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\",\n        \"reason\": \"new\"\n      }\n    ]\n  },\n  \"signer\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"signature\": \"5a7f5eca6aa47b41155372be7d5729d6d3829755dcfd1b604d8951bd58b33ec6eb109e6b4358456a89ce55fb665422051ade2914c99a73633bc592d978703200\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"LUE6ALB3FXBPZUQBMMJOOCQUNWUDETSNT75SSNUPOSQMOHFJI2XA\",\n  \"iat\": 1791252578,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N.\\u003e\",\n        \"account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiIzNzdVS1U0VE42QlJaUDJVUVZXSldYMzRITk4zQ1NNNkpaSjJTUDIzMllDT0lBVzRRSFFRIiwiaWF0IjoxNzkxMjUyNTc4LCJpc3MiOiJBRDI2N0RTWlpPR0lZSUNVUlVYWllORElRVENPU0pHTlhDVUJQT0pJSzQ2WVVWWUg3Wk9KTVpPSiIsInN1YiI6IkFESUpTU01LTlA2QU1VUE5MUzQzQ0M1SEdNQTNDUFk1TlE1M1JYRUZXMkxTS0VTRUlSWERSQjZOIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURJSlNTTUtOUDZBTVVQTkxTNDNDQzVIR01BM0NQWTVOUTUzUlhFRlcyTFNLRVNFSVJYRFJCNk4uXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.KepDfeYOc2c9_pPdw7rXnOUA6voLHwKfH5yjwQlnOtGZ6r2_r4mKSgUyFSX8YzLBIiat6V4ZiK91UTQD3GzyDQ\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"SBSBTLMLOBZ7QZNYN2XRJHK53KKINYG2P7UIPBS46YP7TH4RGFAQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"GARM\",\n  \"sub\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJWTU1MSlpNR1FPQVY0NkdVS0ZOVlNLUklCTURGU0I0MzZUTTdaQlQ1MldYQ0VLVUFSWkZBIiwiaWF0IjoxNzkxMjUyNTc4LCJpc3MiOiJBQ0RBQVkyUUlENjVSM0dFR0JNNUJXSUxWWkVaSktNQU1NU1FUSUU3RjY2NlA3QUJEQ1RLVUZMWCIsInN1YiI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQ1ZCQVhYSzJGQk5TNU9YVVU2RFNPV1VCNEtHWkFEUVRaQzZCSVdHVFBKSlhEWkpNUVVPMzZDNSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.Ms5T5REdG9Tzi_r9eVvGLpsLbBjY6Y63jJV-c-nohmIkZHTabjyTNNTSCuxx8_hrtt5aW98GuzwNE_JDtDDhCQ\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"ZGSX272SCU3AIQT3GWBMW63OAQLXOGZEANSIGDGSJBJRFNXSZKAA\",\n  \"iat\": 1791252578,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"SYS\",\n  \"sub\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"GCBJNHOAI35FPXD4WBZ2FHKBAW7HTGEOCK2CLKTT7MY5CNNWIAIQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "new",
     "secret": false,
     "size": 74,
     "content": "{\n  \"studio\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\"\n}"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"3I7FAEW2AVCDHQDKTM4G6B6UONEZ4QOUVMJW4ZEXWVS7IQF4ICAQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\",\n  \"name\": \"ops\",\n  \"sub\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"CROSCNXNKYON4VXDAK2ZQUM2NCTFDCIBCSFQIX6UMGV56KKEXO6A\",\n  \"iat\": 1791252578,\n  \"iss\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\",\n  \"name\": \"rund\",\n  \"sub\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"I4UFAW5RZX3RRSCIWZYPOOH6RWBLNUF4HTQT4UGKSCLHOUJ3WPPQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\",\n  \"name\": \"studio\",\n  \"sub\": \"UCQB77KS353BZOFF4PRMBYYN3X3C7QAZMANS3CKAO5EZ3KX6BUVSVTU5\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"P7NCUEG67QB7UFMGFAINV52EPZQZXUI2PDQJQU7JCON4V44YIV6Q\",\n  \"iat\": 1791252578,\n  \"iss\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "new",
     "secret": false,
     "size": 3182,
     "content": "{\n  \"manifest\": {\n    \"generation\": 1,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:09:38.618426+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n        \"signing\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n      },\n      \"GARM\": {\n        \"identity\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"signing\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n        \"signing\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"signing\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCQB77KS353BZOFF4PRMBYYN3X3C7QAZMANS3CKAO5EZ3KX6BUVSVTU5\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\",\n        \"reason\": \"new\"\n      }\n    ]\n  },\n  \"signer\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"signature\": \"5a7f5eca6aa47b41155372be7d5729d6d3829755dcfd1b604d8951bd58b33ec6eb109e6b4358456a89ce55fb665422051ade2914c99a73633bc592d978703200\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YJNO5HIDUCDNOQ2SER3XA224F5ABE7RVEXH4YK5AT7US6QGPXNBQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"name\": \"garm\",\n  \"sub\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "new",
     "secret": false,
     "size": 2,
     "content": "[]"
    }
   ],
   "bus": {
    "server": "tls://127.0.0.1:57443",
    "accounts": [
     {
      "name": "CALLER-studio",
      "public": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N",
      "signing_keys": [
       "AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "GARM",
      "public": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK",
      "signing_keys": [
       "AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "SYS",
      "public": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB",
      "signing_keys": [
       "ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "TOOLS",
      "public": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5",
      "signing_keys": [
       "ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX"
      ],
      "revocations": 0,
      "pushed": false
     }
    ],
    "creds": [
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB",
      "public": "UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR",
      "issuer": "ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK",
      "public": "UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL",
      "issuer": "AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": [
       "garm.tool.>"
      ],
      "sub_allow": [
       "garm.run.v1.*.>",
       "_INBOX.>",
       "$SRV.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/studio.creds",
      "name": "studio",
      "account": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N",
      "public": "UCQB77KS353BZOFF4PRMBYYN3X3C7QAZMANS3CKAO5EZ3KX6BUVSVTU5",
      "issuer": "AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": [
       "garm.run.v1.>"
      ],
      "sub_allow": [
       "_INBOX.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/weather.v1.WeatherService.creds",
      "name": "weather.v1.WeatherService",
      "account": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5",
      "public": "UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X",
      "issuer": "ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": null,
      "sub_allow": [
       "$SRV.>",
       "garm.tool.weather.v1.get_forecast",
       "garm.tool.weather.v1.schedule_report"
      ],
      "accepted": true
     }
    ],
    "probes": [
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.tool.weather.v1.get_forecast",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Publish to \"garm.tool.weather.v1.get_forecast\""
     },
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.run.v1.invoke",
      "outcome": "allowed"
     },
     {
      "cred": "weather.v1.WeatherService",
      "action": "subscribe",
      "subject": "garm.tool.weather.v1.get_forecast",
      "outcome": "allowed"
     },
     {
      "cred": "weather.v1.WeatherService",
      "action": "subscribe",
      "subject": "garm.run.v1.>",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Subscription to \"garm.run.v1.>\""
     },
     {
      "cred": "rund",
      "action": "subscribe",
      "subject": "garm.run.v1.*.invoke",
      "outcome": "allowed"
     }
    ]
   }
  },
  {
   "id": "tool-added",
   "title": "A tool is added",
   "prose": "The catalogue gains a second service, `weather2.v1.WeatherService`, declaring `weather-2.v1.get_forecast`. One issuance against the manifest: the new service gets a credential, everything whose permission set did not change is carried forward untouched. The changed account JWTs are pushed to the server over `$SYS` with the ops credential; the new credential is accepted.",
   "command": "garmctl topology --keys ceremony/keys --manifest manifest.json --catalogue file://two.binpb --callers studio -o topo",
   "stdout": "ok: generation 2 from catalogue f37e484e035f -- 4 accounts, 1 credentials, 0 revocations, written to topo\n",
   "stderr": "",
   "files": [
    {
     "path": "ca.pem",
     "kind": "pem",
     "change": "same",
     "secret": false,
     "size": 583,
     "content": "-----BEGIN CERTIFICATE-----\n…"
    },
    {
     "path": "ceremony/keys/CALLER-studio.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N"
    },
    {
     "path": "ceremony/keys/CALLER-studio.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/GARM.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK"
    },
    {
     "path": "ceremony/keys/GARM.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/SYS.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB"
    },
    {
     "path": "ceremony/keys/SYS.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/TOOLS.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5"
    },
    {
     "path": "ceremony/keys/TOOLS.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/CALLER-studio.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/GARM.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/SYS.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/TOOLS.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/operator-signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YJNO5HIDUCDNOQ2SER3XA224F5ABE7RVEXH4YK5AT7US6QGPXNBQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"name\": \"garm\",\n  \"sub\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "ceremony/root/root.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3593,
     "content": "{\n  \"manifest\": {\n    \"generation\": 2,\n    \"catalogue_sha256\": \"f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n    \"issued_at\": \"2026-10-06T06:09:39.87943+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n        \"signing\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n      },\n      \"GARM\": {\n        \"identity\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"signing\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n        \"signing\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"signing\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCQB77KS353BZOFF4PRMBYYN3X3C7QAZMANS3CKAO5EZ3KX6BUVSVTU5\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      },\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UCH4QUKW7YBTU3KPVVQHUOZVH67JTLKOJYZHCPDSY5JIO4TVTU3AZKKD\",\n        \"catalogue_sha256\": \"f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n        \"generation\": 2,\n        \"permissions_hash\": \"19ef9109d050959e\",\n        \"issued_at\": 1791252579,\n        \"expires_at\": 1822788579,\n        \"signing_key\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\",\n        \"reason\": \"new\"\n      }\n    ]\n  },\n  \"signer\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"signature\": \"c16c07482f8e4074a4005be231b8d3c7806d9e9f3fc648203ffa60f5f6156c989978cb024ccf423de74bad914492a9e00b597637031ed5220d04bb63ba26f506\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"NBKSEBW2FZJ7FQUNV4LC2QOJIJPKZEKZWX77SNPIGW7KPC3GWNAA\",\n  \"iat\": 1791252579,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N.\\u003e\",\n        \"account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJHR1dXV01NQ0ZZVlBFT0o3VzVaUFRSRVFOUUxTVlJPQkE3Rk01T1hZUFdLNlI1WUZOUUpBIiwiaWF0IjoxNzkxMjUyNTc5LCJpc3MiOiJBRDI2N0RTWlpPR0lZSUNVUlVYWllORElRVENPU0pHTlhDVUJQT0pJSzQ2WVVWWUg3Wk9KTVpPSiIsInN1YiI6IkFESUpTU01LTlA2QU1VUE5MUzQzQ0M1SEdNQTNDUFk1TlE1M1JYRUZXMkxTS0VTRUlSWERSQjZOIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURJSlNTTUtOUDZBTVVQTkxTNDNDQzVIR01BM0NQWTVOUTUzUlhFRlcyTFNLRVNFSVJYRFJCNk4uXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.uhkVnELECr_4hv998MHD5B4lFwQuUhVhzl4IFKSPrPhAAL1r_6njxnV3eLZZDusLwydOBk6QSUcCz4sJV2NLBg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"U2KPPYJOSJ4ZBYTO5UVIBVCGZYOXFSQY7VD6WX4WTYMC3FVNPOUQ\",\n  \"iat\": 1791252579,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"GARM\",\n  \"sub\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJFVDRJS1BBU1NQUENQSTIzWkU2SVRZQkZSQjJIVEREU09DM0FGQ1pSU0haRjc1RkNHQTNBIiwiaWF0IjoxNzkxMjUyNTc5LCJpc3MiOiJBQ0RBQVkyUUlENjVSM0dFR0JNNUJXSUxWWkVaSktNQU1NU1FUSUU3RjY2NlA3QUJEQ1RLVUZMWCIsInN1YiI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQ1ZCQVhYSzJGQk5TNU9YVVU2RFNPV1VCNEtHWkFEUVRaQzZCSVdHVFBKSlhEWkpNUVVPMzZDNSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.JuJF_oaCkrUq6QSuYhyHSVLKctlBcFG3dHoiSzUueV6qH1ywKl18Y1oPjSmU7D3nUsg_63HBR5JKUQRXKkNpCA\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"3XTNRF62YHH5A2CW2X4KFX7UHEVNDILFZZBJBYBN645LOSRTSRWA\",\n  \"iat\": 1791252579,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"SYS\",\n  \"sub\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"GA7PDW6ZZVMAJCGWRJODRUKGEE6NBPF525Z2ZRZFKGR53OW32LUA\",\n  \"iat\": 1791252579,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 74,
     "content": "{\n  \"studio\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\"\n}"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"3I7FAEW2AVCDHQDKTM4G6B6UONEZ4QOUVMJW4ZEXWVS7IQF4ICAQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\",\n  \"name\": \"ops\",\n  \"sub\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"CROSCNXNKYON4VXDAK2ZQUM2NCTFDCIBCSFQIX6UMGV56KKEXO6A\",\n  \"iat\": 1791252578,\n  \"iss\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\",\n  \"name\": \"rund\",\n  \"sub\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"I4UFAW5RZX3RRSCIWZYPOOH6RWBLNUF4HTQT4UGKSCLHOUJ3WPPQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\",\n  \"name\": \"studio\",\n  \"sub\": \"UCQB77KS353BZOFF4PRMBYYN3X3C7QAZMANS3CKAO5EZ3KX6BUVSVTU5\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"P7NCUEG67QB7UFMGFAINV52EPZQZXUI2PDQJQU7JCON4V44YIV6Q\",\n  \"iat\": 1791252578,\n  \"iss\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather2.v1.WeatherService.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1399,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788579,\n  \"jti\": \"NDYYVTHEMRCJOZRZAMKRMPKVMMPBZACIKRXQLKPCQ7GLQSMUT6XQ\",\n  \"iat\": 1791252579,\n  \"iss\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\",\n  \"name\": \"weather2.v1.WeatherService\",\n  \"sub\": \"UCH4QUKW7YBTU3KPVVQHUOZVH67JTLKOJYZHCPDSY5JIO4TVTU3AZKKD\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather-2.v1.get_forecast\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n    \"tags\": [\n      \"catalogue:f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n      \"generation:2\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3593,
     "content": "{\n  \"manifest\": {\n    \"generation\": 2,\n    \"catalogue_sha256\": \"f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n    \"issued_at\": \"2026-10-06T06:09:39.87943+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n        \"signing\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n      },\n      \"GARM\": {\n        \"identity\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"signing\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n        \"signing\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"signing\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCQB77KS353BZOFF4PRMBYYN3X3C7QAZMANS3CKAO5EZ3KX6BUVSVTU5\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      },\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UCH4QUKW7YBTU3KPVVQHUOZVH67JTLKOJYZHCPDSY5JIO4TVTU3AZKKD\",\n        \"catalogue_sha256\": \"f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n        \"generation\": 2,\n        \"permissions_hash\": \"19ef9109d050959e\",\n        \"issued_at\": 1791252579,\n        \"expires_at\": 1822788579,\n        \"signing_key\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\",\n        \"reason\": \"new\"\n      }\n    ]\n  },\n  \"signer\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"signature\": \"c16c07482f8e4074a4005be231b8d3c7806d9e9f3fc648203ffa60f5f6156c989978cb024ccf423de74bad914492a9e00b597637031ed5220d04bb63ba26f506\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YJNO5HIDUCDNOQ2SER3XA224F5ABE7RVEXH4YK5AT7US6QGPXNBQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"name\": \"garm\",\n  \"sub\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 2,
     "content": "[]"
    }
   ],
   "bus": {
    "server": "tls://127.0.0.1:57443",
    "accounts": [
     {
      "name": "CALLER-studio",
      "public": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N",
      "signing_keys": [
       "AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK",
      "signing_keys": [
       "AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB",
      "signing_keys": [
       "ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5",
      "signing_keys": [
       "ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX"
      ],
      "revocations": 0,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB",
      "public": "UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR",
      "issuer": "ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK",
      "public": "UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL",
      "issuer": "AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": [
       "garm.tool.>"
      ],
      "sub_allow": [
       "garm.run.v1.*.>",
       "_INBOX.>",
       "$SRV.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/studio.creds",
      "name": "studio",
      "account": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N",
      "public": "UCQB77KS353BZOFF4PRMBYYN3X3C7QAZMANS3CKAO5EZ3KX6BUVSVTU5",
      "issuer": "AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": [
       "garm.run.v1.>"
      ],
      "sub_allow": [
       "_INBOX.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/weather.v1.WeatherService.creds",
      "name": "weather.v1.WeatherService",
      "account": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5",
      "public": "UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X",
      "issuer": "ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": null,
      "sub_allow": [
       "$SRV.>",
       "garm.tool.weather.v1.get_forecast",
       "garm.tool.weather.v1.schedule_report"
      ],
      "accepted": true
     },
     {
      "file": "creds/weather2.v1.WeatherService.creds",
      "name": "weather2.v1.WeatherService",
      "account": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5",
      "public": "UCH4QUKW7YBTU3KPVVQHUOZVH67JTLKOJYZHCPDSY5JIO4TVTU3AZKKD",
      "issuer": "ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX",
      "tags": [
       "catalogue:f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a",
       "generation:2"
      ],
      "expires": "2027-10-06T02:09:39Z",
      "pub_allow": null,
      "sub_allow": [
       "$SRV.>",
       "garm.tool.weather-2.v1.get_forecast"
      ],
      "accepted": true
     }
    ],
    "probes": [
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.tool.weather.v1.get_forecast",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Publish to \"garm.tool.weather.v1.get_forecast\""
     },
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.run.v1.invoke",
      "outcome": "allowed"
     },
     {
      "cred": "weather.v1.WeatherService",
      "action": "subscribe",
      "subject": "garm.tool.weather.v1.get_forecast",
      "outcome": "allowed"
     },
     {
      "cred": "weather.v1.WeatherService",
      "action": "subscribe",
      "subject": "garm.run.v1.>",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Subscription to \"garm.run.v1.>\""
     },
     {
      "cred": "rund",
      "action": "subscribe",
      "subject": "garm.run.v1.*.invoke",
      "outcome": "allowed"
     }
    ]
   }
  },
  {
   "id": "tool-removed",
   "title": "A tool is removed",
   "prose": "The catalogue goes back to one service. Routing stopped the moment `rund` reloaded; but a credential is a bearer document in a process's hands, so the generator revokes the retired service's credential in its account JWT, lists it in `revocations.json`, and removes its file. The account is pushed. The copy a zombie process still holds is tried: refused.",
   "command": "garmctl topology --keys ceremony/keys --manifest manifest.json --catalogue file://weather.binpb --callers studio -o topo",
   "stdout": "ok: generation 3 from catalogue 24164e3e783d -- 4 accounts, 0 credentials, 1 revocations, written to topo\n",
   "stderr": "",
   "files": [
    {
     "path": "ca.pem",
     "kind": "pem",
     "change": "same",
     "secret": false,
     "size": 583,
     "content": "-----BEGIN CERTIFICATE-----\n…"
    },
    {
     "path": "ceremony/keys/CALLER-studio.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N"
    },
    {
     "path": "ceremony/keys/CALLER-studio.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/GARM.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK"
    },
    {
     "path": "ceremony/keys/GARM.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/SYS.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB"
    },
    {
     "path": "ceremony/keys/SYS.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/TOOLS.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5"
    },
    {
     "path": "ceremony/keys/TOOLS.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/CALLER-studio.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/GARM.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/SYS.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/TOOLS.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/operator-signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YJNO5HIDUCDNOQ2SER3XA224F5ABE7RVEXH4YK5AT7US6QGPXNBQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"name\": \"garm\",\n  \"sub\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "ceremony/root/root.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3082,
     "content": "{\n  \"manifest\": {\n    \"generation\": 3,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:09:41.115708+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n        \"signing\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n      },\n      \"GARM\": {\n        \"identity\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"signing\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n        \"signing\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"signing\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCQB77KS353BZOFF4PRMBYYN3X3C7QAZMANS3CKAO5EZ3KX6BUVSVTU5\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    ]\n  },\n  \"signer\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"signature\": \"ac30bff1fb057857fdab1f5c070522ff716b0731d60f6b72735e35410a2fe93752893801d1f5133ee4b7a89a87241c24550ca91ada95aa971cecab6f9745a30c\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"XZE3GXY36A6LAPGBTRXOVVY26XNKVQUGY6YPUTYZTCVMOWCBDXYQ\",\n  \"iat\": 1791252581,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N.\\u003e\",\n        \"account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJYN1M0UUhHTEo3Q0pFUU5BQUNMMzJaNFlQR0pQQTJQR002Rks2Nk9JSlNMQU5DNzIzVTJRIiwiaWF0IjoxNzkxMjUyNTgxLCJpc3MiOiJBRDI2N0RTWlpPR0lZSUNVUlVYWllORElRVENPU0pHTlhDVUJQT0pJSzQ2WVVWWUg3Wk9KTVpPSiIsInN1YiI6IkFESUpTU01LTlA2QU1VUE5MUzQzQ0M1SEdNQTNDUFk1TlE1M1JYRUZXMkxTS0VTRUlSWERSQjZOIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURJSlNTTUtOUDZBTVVQTkxTNDNDQzVIR01BM0NQWTVOUTUzUlhFRlcyTFNLRVNFSVJYRFJCNk4uXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.4npLEudGPdncj1UAEpasbXGIL9vULlFI5bw9TUg3udggAfIabU5LoUq5296yVvELlunMbEYTk3W0O2cWNjZjCA\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"FGMGX5KG6ACUC7QOQ46BLVPPWML7D6XZG7DY3OASITJH66QSH6RQ\",\n  \"iat\": 1791252581,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"GARM\",\n  \"sub\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJHRTU3VERTWEFYWlBXUVRJU1YzN1dITEpRTU5MSlVVMlBXMkM1UTM1UlhRQjVDUkhQM0tBIiwiaWF0IjoxNzkxMjUyNTgxLCJpc3MiOiJBQ0RBQVkyUUlENjVSM0dFR0JNNUJXSUxWWkVaSktNQU1NU1FUSUU3RjY2NlA3QUJEQ1RLVUZMWCIsInN1YiI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQ1ZCQVhYSzJGQk5TNU9YVVU2RFNPV1VCNEtHWkFEUVRaQzZCSVdHVFBKSlhEWkpNUVVPMzZDNSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.Ga6RO6OAg3tFLk1627K3k5qID9sMfsX8e5gNTJDv1g8UgQCPIc2oGSTdjayK5k_vzgK4qSfr4QfOxmgvwzvkAw\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"TQ7KJDSFUFA3VOSUUIT3FCH6INV5MKC5W7XXDRYTBCDW267AS7XA\",\n  \"iat\": 1791252581,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"SYS\",\n  \"sub\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 1084,
     "content": "{\n  \"jti\": \"WDXMZ3NU3BYVKCGLGLJWYMBEOWGF2LJWR5ZF4L3NZRURAU4EPNLQ\",\n  \"iat\": 1791252581,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n    ],\n    \"revocations\": {\n      \"UCH4QUKW7YBTU3KPVVQHUOZVH67JTLKOJYZHCPDSY5JIO4TVTU3AZKKD\": 1791252581\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 74,
     "content": "{\n  \"studio\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\"\n}"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"3I7FAEW2AVCDHQDKTM4G6B6UONEZ4QOUVMJW4ZEXWVS7IQF4ICAQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\",\n  \"name\": \"ops\",\n  \"sub\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"CROSCNXNKYON4VXDAK2ZQUM2NCTFDCIBCSFQIX6UMGV56KKEXO6A\",\n  \"iat\": 1791252578,\n  \"iss\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\",\n  \"name\": \"rund\",\n  \"sub\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"I4UFAW5RZX3RRSCIWZYPOOH6RWBLNUF4HTQT4UGKSCLHOUJ3WPPQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\",\n  \"name\": \"studio\",\n  \"sub\": \"UCQB77KS353BZOFF4PRMBYYN3X3C7QAZMANS3CKAO5EZ3KX6BUVSVTU5\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"P7NCUEG67QB7UFMGFAINV52EPZQZXUI2PDQJQU7JCON4V44YIV6Q\",\n  \"iat\": 1791252578,\n  \"iss\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather2.v1.WeatherService.creds",
     "kind": "creds",
     "change": "removed",
     "secret": true,
     "size": 0,
     "content": ""
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3082,
     "content": "{\n  \"manifest\": {\n    \"generation\": 3,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:09:41.115708+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n        \"signing\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n      },\n      \"GARM\": {\n        \"identity\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"signing\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n        \"signing\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"signing\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCQB77KS353BZOFF4PRMBYYN3X3C7QAZMANS3CKAO5EZ3KX6BUVSVTU5\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    ]\n  },\n  \"signer\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"signature\": \"ac30bff1fb057857fdab1f5c070522ff716b0731d60f6b72735e35410a2fe93752893801d1f5133ee4b7a89a87241c24550ca91ada95aa971cecab6f9745a30c\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YJNO5HIDUCDNOQ2SER3XA224F5ABE7RVEXH4YK5AT7US6QGPXNBQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"name\": \"garm\",\n  \"sub\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 269,
     "content": "[\n  {\n    \"Name\": \"weather2.v1.WeatherService\",\n    \"Account\": \"TOOLS\",\n    \"Public\": \"UCH4QUKW7YBTU3KPVVQHUOZVH67JTLKOJYZHCPDSY5JIO4TVTU3AZKKD\",\n    \"At\": \"2026-10-06T06:09:41.115708+04:00\",\n    \"Kind\": \"retired\",\n    \"Why\": \"retired: no longer in the catalogue\"\n  }\n]"
    }
   ],
   "bus": {
    "server": "tls://127.0.0.1:57443",
    "accounts": [
     {
      "name": "CALLER-studio",
      "public": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N",
      "signing_keys": [
       "AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK",
      "signing_keys": [
       "AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB",
      "signing_keys": [
       "ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5",
      "signing_keys": [
       "ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX"
      ],
      "revocations": 1,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB",
      "public": "UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR",
      "issuer": "ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK",
      "public": "UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL",
      "issuer": "AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": [
       "garm.tool.>"
      ],
      "sub_allow": [
       "garm.run.v1.*.>",
       "_INBOX.>",
       "$SRV.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/studio.creds",
      "name": "studio",
      "account": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N",
      "public": "UCQB77KS353BZOFF4PRMBYYN3X3C7QAZMANS3CKAO5EZ3KX6BUVSVTU5",
      "issuer": "AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": [
       "garm.run.v1.>"
      ],
      "sub_allow": [
       "_INBOX.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/weather.v1.WeatherService.creds",
      "name": "weather.v1.WeatherService",
      "account": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5",
      "public": "UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X",
      "issuer": "ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": null,
      "sub_allow": [
       "$SRV.>",
       "garm.tool.weather.v1.get_forecast",
       "garm.tool.weather.v1.schedule_report"
      ],
      "accepted": true
     },
     {
      "file": "a copy of weather2.v1.WeatherService.creds a process still holds",
      "name": "weather2.v1.WeatherService",
      "account": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5",
      "public": "UCH4QUKW7YBTU3KPVVQHUOZVH67JTLKOJYZHCPDSY5JIO4TVTU3AZKKD",
      "issuer": "ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX",
      "tags": [
       "catalogue:f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a",
       "generation:2"
      ],
      "expires": "2027-10-06T02:09:39Z",
      "pub_allow": null,
      "sub_allow": [
       "$SRV.>",
       "garm.tool.weather-2.v1.get_forecast"
      ],
      "accepted": false,
      "reason": "nats: Authorization Violation",
      "from_before": true
     }
    ],
    "probes": [
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.tool.weather.v1.get_forecast",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Publish to \"garm.tool.weather.v1.get_forecast\""
     },
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.run.v1.invoke",
      "outcome": "allowed"
     },
     {
      "cred": "weather.v1.WeatherService",
      "action": "subscribe",
      "subject": "garm.tool.weather.v1.get_forecast",
      "outcome": "allowed"
     },
     {
      "cred": "weather.v1.WeatherService",
      "action": "subscribe",
      "subject": "garm.run.v1.>",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Subscription to \"garm.run.v1.>\""
     },
     {
      "cred": "rund",
      "action": "subscribe",
      "subject": "garm.run.v1.*.invoke",
      "outcome": "allowed"
     }
    ]
   }
  },
  {
   "id": "caller-added",
   "title": "A caller is added",
   "prose": "`batch` joins `--callers`. It has no `CALLER-batch.pub` in `--keys`, so its identity and signing keys are minted and written to `--keys-out`, the identity seed under `archive/` where nothing reads it. Its account JWT, its credential and a new `callers.json` appear.",
   "command": "garmctl topology --keys ceremony/keys --manifest manifest.json --catalogue file://weather.binpb --callers studio,batch -o topo",
   "stdout": "ok: generation 4 from catalogue 24164e3e783d -- 5 accounts, 1 credentials, 0 revocations, written to topo\n",
   "stderr": "",
   "files": [
    {
     "path": "ca.pem",
     "kind": "pem",
     "change": "same",
     "secret": false,
     "size": 583,
     "content": "-----BEGIN CERTIFICATE-----\n…"
    },
    {
     "path": "ceremony/keys/CALLER-batch.pub",
     "kind": "text",
     "change": "new",
     "secret": false,
     "size": 57,
     "content": "AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ"
    },
    {
     "path": "ceremony/keys/CALLER-batch.signing.nk",
     "kind": "seed",
     "change": "new",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/CALLER-studio.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N"
    },
    {
     "path": "ceremony/keys/CALLER-studio.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/GARM.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK"
    },
    {
     "path": "ceremony/keys/GARM.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/SYS.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB"
    },
    {
     "path": "ceremony/keys/SYS.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/TOOLS.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5"
    },
    {
     "path": "ceremony/keys/TOOLS.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/CALLER-batch.identity.nk",
     "kind": "seed",
     "change": "new",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/CALLER-studio.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/GARM.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/SYS.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/TOOLS.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/operator-signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YJNO5HIDUCDNOQ2SER3XA224F5ABE7RVEXH4YK5AT7US6QGPXNBQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"name\": \"garm\",\n  \"sub\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "ceremony/root/root.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3771,
     "content": "{\n  \"manifest\": {\n    \"generation\": 4,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:09:42.351495+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n        \"signing\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n        \"signing\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n      },\n      \"GARM\": {\n        \"identity\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"signing\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n        \"signing\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"signing\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDR73DBG22J6QQIOO4CBI6PQ7GSV5R7PWPFKWKZEHZEYHDJ45OGUSTVL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252582,\n        \"expires_at\": 1822788582,\n        \"signing_key\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCQB77KS353BZOFF4PRMBYYN3X3C7QAZMANS3CKAO5EZ3KX6BUVSVTU5\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    ]\n  },\n  \"signer\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"signature\": \"b2795d42540b54a905b35af029cd3086bb0a83c0ab797ce61a221774ab68694d2eaa431065a641eecca1db49390746a56e45357bb43a0d00f1dd7e8cabf8ae0c\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 2133,
     "content": "{\n  \"jti\": \"PEOK42OQLRMB5ZBV2J3IHQNSM2MLGS7LNOSVKLCHNZZZINOEVTAQ\",\n  \"iat\": 1791252582,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ.\\u003e\",\n        \"account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJKMk80NVJNU0JYU1ZNQzYzVFlYM0dRUUhBTVVJV0ZCN0dFT0taV0E3TTRYRVFTUlFJNlpRIiwiaWF0IjoxNzkxMjUyNTgyLCJpc3MiOiJBRDI2N0RTWlpPR0lZSUNVUlVYWllORElRVENPU0pHTlhDVUJQT0pJSzQ2WVVWWUg3Wk9KTVpPSiIsInN1YiI6IkFBSFBDR1g2T043N0NOSkE3SEYyNk5ESUxFUkI1M1pPREJNSFFPS09GRFo3R0hXT0NIUFIzRENaIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFIUENHWDZPTjc3Q05KQTdIRjI2TkRJTEVSQjUzWk9EQk1IUU9LT0ZEWjdHSFdPQ0hQUjNEQ1ouXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.HGgIP1dHdya9ZIM6QDSdz4yp-pK3wEG6reV-LvDSqaenYSWZ-nFtjKNVIEFW3admunW26ZRDNLOg75vvx-6DAw\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"4E4IT2UI46TTEVVCWYNKEZTR264SC7DAGOO4OED2KFAV252C3Q3A\",\n  \"iat\": 1791252582,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N.\\u003e\",\n        \"account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiIzUFI2UlA3V0dMTldYUDJQQjQzNUNQSURZU1lZRFM3SjNEWUFWTlRKTzZUNTJOR0FQWkJBIiwiaWF0IjoxNzkxMjUyNTgyLCJpc3MiOiJBRDI2N0RTWlpPR0lZSUNVUlVYWllORElRVENPU0pHTlhDVUJQT0pJSzQ2WVVWWUg3Wk9KTVpPSiIsInN1YiI6IkFESUpTU01LTlA2QU1VUE5MUzQzQ0M1SEdNQTNDUFk1TlE1M1JYRUZXMkxTS0VTRUlSWERSQjZOIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURJSlNTTUtOUDZBTVVQTkxTNDNDQzVIR01BM0NQWTVOUTUzUlhFRlcyTFNLRVNFSVJYRFJCNk4uXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.OiYtmuxAipCDEy2tCGzPXAO1-lRNfz7MWiZTDaMbSe4YW4G8KnMKlMpHfivjqziMDh9Kd_kL3ophDlVELYtCCQ\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"4Q7XWU4SE2M3VKY7PX55UR2UMXTHKR3UAJPXW24E344LLO6ERIFA\",\n  \"iat\": 1791252582,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"GARM\",\n  \"sub\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJXN1RRTFk2VDdGRkU3QkxNRTY2WkpRR1hKT1o2TEJBV1ZQVkRIU1A2RzJCTEJOUldMM0NBIiwiaWF0IjoxNzkxMjUyNTgyLCJpc3MiOiJBQ0RBQVkyUUlENjVSM0dFR0JNNUJXSUxWWkVaSktNQU1NU1FUSUU3RjY2NlA3QUJEQ1RLVUZMWCIsInN1YiI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQ1ZCQVhYSzJGQk5TNU9YVVU2RFNPV1VCNEtHWkFEUVRaQzZCSVdHVFBKSlhEWkpNUVVPMzZDNSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.aLB8q0q8TqTFqUiEIpwM8KscMTrV8f0mclqe3Mf0LjWfQv3WBf83HztUeTaU164Y19I0Y0cQrIgR7MvI5nyNDg\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"LXSROUB236WPBOIDFO3ORIDRLGLK6QPPZG5RVJUFMJSHZIQHTN7A\",\n  \"iat\": 1791252582,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"SYS\",\n  \"sub\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"3T5RRUZWPCX6KJ7DUMAFNGVBX3EZEFFEPAP4LYOFG3XOX2D6QEWA\",\n  \"iat\": 1791252582,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n  \"studio\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788582,\n  \"jti\": \"4AYKUWECA4IXKB5RGNH4J5U4WMQT5O525THEWJKYMMEKEC6VLALA\",\n  \"iat\": 1791252582,\n  \"iss\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\",\n  \"name\": \"batch\",\n  \"sub\": \"UDR73DBG22J6QQIOO4CBI6PQ7GSV5R7PWPFKWKZEHZEYHDJ45OGUSTVL\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:4\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"3I7FAEW2AVCDHQDKTM4G6B6UONEZ4QOUVMJW4ZEXWVS7IQF4ICAQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\",\n  \"name\": \"ops\",\n  \"sub\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"CROSCNXNKYON4VXDAK2ZQUM2NCTFDCIBCSFQIX6UMGV56KKEXO6A\",\n  \"iat\": 1791252578,\n  \"iss\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\",\n  \"name\": \"rund\",\n  \"sub\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"I4UFAW5RZX3RRSCIWZYPOOH6RWBLNUF4HTQT4UGKSCLHOUJ3WPPQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\",\n  \"name\": \"studio\",\n  \"sub\": \"UCQB77KS353BZOFF4PRMBYYN3X3C7QAZMANS3CKAO5EZ3KX6BUVSVTU5\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"P7NCUEG67QB7UFMGFAINV52EPZQZXUI2PDQJQU7JCON4V44YIV6Q\",\n  \"iat\": 1791252578,\n  \"iss\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3771,
     "content": "{\n  \"manifest\": {\n    \"generation\": 4,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:09:42.351495+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n        \"signing\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n        \"signing\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n      },\n      \"GARM\": {\n        \"identity\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"signing\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n        \"signing\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"signing\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDR73DBG22J6QQIOO4CBI6PQ7GSV5R7PWPFKWKZEHZEYHDJ45OGUSTVL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252582,\n        \"expires_at\": 1822788582,\n        \"signing_key\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCQB77KS353BZOFF4PRMBYYN3X3C7QAZMANS3CKAO5EZ3KX6BUVSVTU5\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    ]\n  },\n  \"signer\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"signature\": \"b2795d42540b54a905b35af029cd3086bb0a83c0ab797ce61a221774ab68694d2eaa431065a641eecca1db49390746a56e45357bb43a0d00f1dd7e8cabf8ae0c\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YJNO5HIDUCDNOQ2SER3XA224F5ABE7RVEXH4YK5AT7US6QGPXNBQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"name\": \"garm\",\n  \"sub\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 2,
     "content": "[]"
    }
   ],
   "bus": {
    "server": "tls://127.0.0.1:57443",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ",
      "signing_keys": [
       "ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "CALLER-studio",
      "public": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N",
      "signing_keys": [
       "AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK",
      "signing_keys": [
       "AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB",
      "signing_keys": [
       "ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5",
      "signing_keys": [
       "ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX"
      ],
      "revocations": 0,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ",
      "public": "UDR73DBG22J6QQIOO4CBI6PQ7GSV5R7PWPFKWKZEHZEYHDJ45OGUSTVL",
      "issuer": "ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:4"
      ],
      "expires": "2027-10-06T02:09:42Z",
      "pub_allow": [
       "garm.run.v1.>"
      ],
      "sub_allow": [
       "_INBOX.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB",
      "public": "UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR",
      "issuer": "ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK",
      "public": "UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL",
      "issuer": "AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": [
       "garm.tool.>"
      ],
      "sub_allow": [
       "garm.run.v1.*.>",
       "_INBOX.>",
       "$SRV.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/studio.creds",
      "name": "studio",
      "account": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N",
      "public": "UCQB77KS353BZOFF4PRMBYYN3X3C7QAZMANS3CKAO5EZ3KX6BUVSVTU5",
      "issuer": "AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": [
       "garm.run.v1.>"
      ],
      "sub_allow": [
       "_INBOX.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/weather.v1.WeatherService.creds",
      "name": "weather.v1.WeatherService",
      "account": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5",
      "public": "UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X",
      "issuer": "ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": null,
      "sub_allow": [
       "$SRV.>",
       "garm.tool.weather.v1.get_forecast",
       "garm.tool.weather.v1.schedule_report"
      ],
      "accepted": true
     }
    ],
    "probes": [
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.tool.weather.v1.get_forecast",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Publish to \"garm.tool.weather.v1.get_forecast\""
     },
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.run.v1.invoke",
      "outcome": "allowed"
     },
     {
      "cred": "weather.v1.WeatherService",
      "action": "subscribe",
      "subject": "garm.tool.weather.v1.get_forecast",
      "outcome": "allowed"
     },
     {
      "cred": "weather.v1.WeatherService",
      "action": "subscribe",
      "subject": "garm.run.v1.>",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Subscription to \"garm.run.v1.>\""
     },
     {
      "cred": "rund",
      "action": "subscribe",
      "subject": "garm.run.v1.*.invoke",
      "outcome": "allowed"
     }
    ]
   }
  },
  {
   "id": "rotate-one",
   "title": "Rotating a signing key, step one",
   "prose": "`CALLER-studio`'s signing key is replaced: the new key is listed beside the old in the account JWT, every credential of the account is reissued under it, the old seed goes to `archive/`. Nothing is revoked: a process named `studio-old` is still connected on the old credential, and stays connected.",
   "command": "garmctl topology --keys ceremony/keys --manifest manifest.json --catalogue file://weather.binpb --callers studio,batch --rotate-signing CALLER-studio -o topo",
   "stdout": "ok: generation 5 from catalogue 24164e3e783d -- 5 accounts, 1 credentials, 0 revocations, written to topo\n",
   "stderr": "CALLER-studio: signing key retiring; the old key AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS is still listed -- roll the new credentials out, then run an issuance with --verify-live to retire it\n",
   "files": [
    {
     "path": "ca.pem",
     "kind": "pem",
     "change": "same",
     "secret": false,
     "size": 583,
     "content": "-----BEGIN CERTIFICATE-----\n…"
    },
    {
     "path": "ceremony/keys/CALLER-batch.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ"
    },
    {
     "path": "ceremony/keys/CALLER-batch.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/CALLER-studio.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N"
    },
    {
     "path": "ceremony/keys/CALLER-studio.signing.nk",
     "kind": "seed",
     "change": "changed",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/GARM.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK"
    },
    {
     "path": "ceremony/keys/GARM.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/SYS.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB"
    },
    {
     "path": "ceremony/keys/SYS.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/TOOLS.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5"
    },
    {
     "path": "ceremony/keys/TOOLS.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/CALLER-batch.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/CALLER-studio.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/CALLER-studio.signing.AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS.nk",
     "kind": "seed",
     "change": "new",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/GARM.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/SYS.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/TOOLS.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/operator-signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YJNO5HIDUCDNOQ2SER3XA224F5ABE7RVEXH4YK5AT7US6QGPXNBQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"name\": \"garm\",\n  \"sub\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "ceremony/root/root.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3856,
     "content": "{\n  \"manifest\": {\n    \"generation\": 5,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:09:45.496047+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n        \"signing\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n        \"signing\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\",\n        \"retiring\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n      },\n      \"GARM\": {\n        \"identity\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"signing\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n        \"signing\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"signing\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDR73DBG22J6QQIOO4CBI6PQ7GSV5R7PWPFKWKZEHZEYHDJ45OGUSTVL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252582,\n        \"expires_at\": 1822788582,\n        \"signing_key\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UAWYFYB4TLOU5GJQP4CDKVTDCS3BNCE7ESAAFDMWKLRP2ZDQSM5DGXG7\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252585,\n        \"expires_at\": 1822788585,\n        \"signing_key\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\",\n        \"reason\": \"rotation\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    ]\n  },\n  \"signer\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"signature\": \"e1fb1e74930c965e5f7da074feab56a82bfa587ed8d03505a0491f45aa2a8073fdf5111bdfb75f79ede64753bb1b4835a9aa78f7fde973e3a9a5c1b0c04b7703\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2133,
     "content": "{\n  \"jti\": \"NXRZDZPFZE5AZIS6JJAND5W4KLFACRFPF6I6FW7PA2BBDVEBLMDA\",\n  \"iat\": 1791252585,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ.\\u003e\",\n        \"account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJOR1U2TExXV0ZZRTNHR0ZaQlhDR0dQNkRaNUlHT1pVQlE1TkJVSUFZNkczT05RVUoySjJRIiwiaWF0IjoxNzkxMjUyNTg1LCJpc3MiOiJBRDI2N0RTWlpPR0lZSUNVUlVYWllORElRVENPU0pHTlhDVUJQT0pJSzQ2WVVWWUg3Wk9KTVpPSiIsInN1YiI6IkFBSFBDR1g2T043N0NOSkE3SEYyNk5ESUxFUkI1M1pPREJNSFFPS09GRFo3R0hXT0NIUFIzRENaIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFIUENHWDZPTjc3Q05KQTdIRjI2TkRJTEVSQjUzWk9EQk1IUU9LT0ZEWjdHSFdPQ0hQUjNEQ1ouXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.i7eUVlaZ9M_DHvrpAWmlA5KJOclHqqAmbXaBqMdLQz3DRPPqRiZEYv452_ujhyPqDVAzeEXJwV5X6piZkOmQBA\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2213,
     "content": "{\n  \"jti\": \"SZFJI3KF4TBPLITEF5L6RB6WAHQB7UNMDYNP6HDID2XGXEJVMEPQ\",\n  \"iat\": 1791252585,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N.\\u003e\",\n        \"account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJCUzUyT0hZVEFMQldCQ0pKTFBVNFMyRkpWNTZHUlVBV01HWVlZUVRMUVBCUVdCT0JNU0JRIiwiaWF0IjoxNzkxMjUyNTg1LCJpc3MiOiJBRDI2N0RTWlpPR0lZSUNVUlVYWllORElRVENPU0pHTlhDVUJQT0pJSzQ2WVVWWUg3Wk9KTVpPSiIsInN1YiI6IkFESUpTU01LTlA2QU1VUE5MUzQzQ0M1SEdNQTNDUFk1TlE1M1JYRUZXMkxTS0VTRUlSWERSQjZOIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURJSlNTTUtOUDZBTVVQTkxTNDNDQzVIR01BM0NQWTVOUTUzUlhFRlcyTFNLRVNFSVJYRFJCNk4uXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.M9BNrHSbYxxMW0ueL2aDMdc4ahw8mVmrHJp4cqhQCbuBAxS3ez3fs7PhhxLvrxbltuOzOFqpqa6D9SWfQxxwDA\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\",\n      \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"X2VA4YC5YNJHI7SZSNSL43WISLKNDTXQ5MWLQA7F4N53P6GF23CQ\",\n  \"iat\": 1791252585,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"GARM\",\n  \"sub\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiIyVVo2S0I3Nk5JR0VPNlVXSEdBUVlMRE1GN1FNSE81UUpPUVhKUkM3NFdLVEJKNVdINkZRIiwiaWF0IjoxNzkxMjUyNTg1LCJpc3MiOiJBQ0RBQVkyUUlENjVSM0dFR0JNNUJXSUxWWkVaSktNQU1NU1FUSUU3RjY2NlA3QUJEQ1RLVUZMWCIsInN1YiI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQ1ZCQVhYSzJGQk5TNU9YVVU2RFNPV1VCNEtHWkFEUVRaQzZCSVdHVFBKSlhEWkpNUVVPMzZDNSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.bUO_Kd2n0RAs-VGxsNaVaiqnOnZk9hcQSH2maoz86G9p0Rw240vQjpGx9QGFjd43ZhdgEovHvrNgpxPZt4FTDg\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"ZAKBSAL4D36GGZ4GBDRATIF3UE67OP56HJNV2LWNYVYO4QPFTVSQ\",\n  \"iat\": 1791252585,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"SYS\",\n  \"sub\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"ZQBU2BS3KMTK4EZQYQL44MAZN4RSZC3B7XAEYLRG6Y3XCY3L22PQ\",\n  \"iat\": 1791252585,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n  \"studio\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788582,\n  \"jti\": \"4AYKUWECA4IXKB5RGNH4J5U4WMQT5O525THEWJKYMMEKEC6VLALA\",\n  \"iat\": 1791252582,\n  \"iss\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\",\n  \"name\": \"batch\",\n  \"sub\": \"UDR73DBG22J6QQIOO4CBI6PQ7GSV5R7PWPFKWKZEHZEYHDJ45OGUSTVL\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:4\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"3I7FAEW2AVCDHQDKTM4G6B6UONEZ4QOUVMJW4ZEXWVS7IQF4ICAQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\",\n  \"name\": \"ops\",\n  \"sub\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"CROSCNXNKYON4VXDAK2ZQUM2NCTFDCIBCSFQIX6UMGV56KKEXO6A\",\n  \"iat\": 1791252578,\n  \"iss\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\",\n  \"name\": \"rund\",\n  \"sub\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "changed",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788585,\n  \"jti\": \"7STAZBPIBE7BX4YXECFAYLTFVK64WTRKJBW2T2HVBV7HCA6SSLFQ\",\n  \"iat\": 1791252585,\n  \"iss\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\",\n  \"name\": \"studio\",\n  \"sub\": \"UAWYFYB4TLOU5GJQP4CDKVTDCS3BNCE7ESAAFDMWKLRP2ZDQSM5DGXG7\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"P7NCUEG67QB7UFMGFAINV52EPZQZXUI2PDQJQU7JCON4V44YIV6Q\",\n  \"iat\": 1791252578,\n  \"iss\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3856,
     "content": "{\n  \"manifest\": {\n    \"generation\": 5,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:09:45.496047+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n        \"signing\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n        \"signing\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\",\n        \"retiring\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n      },\n      \"GARM\": {\n        \"identity\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"signing\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n        \"signing\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"signing\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDR73DBG22J6QQIOO4CBI6PQ7GSV5R7PWPFKWKZEHZEYHDJ45OGUSTVL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252582,\n        \"expires_at\": 1822788582,\n        \"signing_key\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UAWYFYB4TLOU5GJQP4CDKVTDCS3BNCE7ESAAFDMWKLRP2ZDQSM5DGXG7\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252585,\n        \"expires_at\": 1822788585,\n        \"signing_key\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\",\n        \"reason\": \"rotation\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    ]\n  },\n  \"signer\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"signature\": \"e1fb1e74930c965e5f7da074feab56a82bfa587ed8d03505a0491f45aa2a8073fdf5111bdfb75f79ede64753bb1b4835a9aa78f7fde973e3a9a5c1b0c04b7703\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YJNO5HIDUCDNOQ2SER3XA224F5ABE7RVEXH4YK5AT7US6QGPXNBQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"name\": \"garm\",\n  \"sub\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 2,
     "content": "[]"
    }
   ],
   "bus": {
    "server": "tls://127.0.0.1:57443",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ",
      "signing_keys": [
       "ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "CALLER-studio",
      "public": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N",
      "signing_keys": [
       "AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS",
       "ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK",
      "signing_keys": [
       "AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB",
      "signing_keys": [
       "ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5",
      "signing_keys": [
       "ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX"
      ],
      "revocations": 0,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ",
      "public": "UDR73DBG22J6QQIOO4CBI6PQ7GSV5R7PWPFKWKZEHZEYHDJ45OGUSTVL",
      "issuer": "ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:4"
      ],
      "expires": "2027-10-06T02:09:42Z",
      "pub_allow": [
       "garm.run.v1.>"
      ],
      "sub_allow": [
       "_INBOX.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB",
      "public": "UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR",
      "issuer": "ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK",
      "public": "UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL",
      "issuer": "AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": [
       "garm.tool.>"
      ],
      "sub_allow": [
       "garm.run.v1.*.>",
       "_INBOX.>",
       "$SRV.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/studio.creds",
      "name": "studio",
      "account": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N",
      "public": "UAWYFYB4TLOU5GJQP4CDKVTDCS3BNCE7ESAAFDMWKLRP2ZDQSM5DGXG7",
      "issuer": "ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:5"
      ],
      "expires": "2027-10-06T02:09:45Z",
      "pub_allow": [
       "garm.run.v1.>"
      ],
      "sub_allow": [
       "_INBOX.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/weather.v1.WeatherService.creds",
      "name": "weather.v1.WeatherService",
      "account": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5",
      "public": "UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X",
      "issuer": "ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": null,
      "sub_allow": [
       "$SRV.>",
       "garm.tool.weather.v1.get_forecast",
       "garm.tool.weather.v1.schedule_report"
      ],
      "accepted": true
     },
     {
      "file": "a copy of studio.creds a process still holds",
      "name": "studio",
      "account": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N",
      "public": "UCQB77KS353BZOFF4PRMBYYN3X3C7QAZMANS3CKAO5EZ3KX6BUVSVTU5",
      "issuer": "AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": [
       "garm.run.v1.>"
      ],
      "sub_allow": [
       "_INBOX.>"
      ],
      "accepted": true,
      "from_before": true
     }
    ],
    "probes": [
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.tool.weather.v1.get_forecast",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Publish to \"garm.tool.weather.v1.get_forecast\""
     },
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.run.v1.invoke",
      "outcome": "allowed"
     },
     {
      "cred": "weather.v1.WeatherService",
      "action": "subscribe",
      "subject": "garm.tool.weather.v1.get_forecast",
      "outcome": "allowed"
     },
     {
      "cred": "weather.v1.WeatherService",
      "action": "subscribe",
      "subject": "garm.run.v1.>",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Subscription to \"garm.run.v1.>\""
     },
     {
      "cred": "rund",
      "action": "subscribe",
      "subject": "garm.run.v1.*.invoke",
      "outcome": "allowed"
     }
    ]
   }
  },
  {
   "id": "verify-live-refused",
   "title": "Step two, refused",
   "prose": "The next issuance would retire the old key. `--verify-live` asks the server which key signed each live connection, finds `studio-old` still on the old one, and refuses by name. Nothing is written.",
   "command": "garmctl topology … --verify-live --nats nats://127.0.0.1:… --ops-creds topo/creds/ops.creds --tls-ca ca.pem -o topo",
   "stdout": "",
   "stderr": "",
   "error": "--verify-live: CALLER-studio's retiring key AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS still signs 1 live connection(s): studio-old -- roll them out first",
   "files": [
    {
     "path": "ca.pem",
     "kind": "pem",
     "change": "same",
     "secret": false,
     "size": 583,
     "content": "-----BEGIN CERTIFICATE-----\n…"
    },
    {
     "path": "ceremony/keys/CALLER-batch.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ"
    },
    {
     "path": "ceremony/keys/CALLER-batch.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/CALLER-studio.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N"
    },
    {
     "path": "ceremony/keys/CALLER-studio.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/GARM.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK"
    },
    {
     "path": "ceremony/keys/GARM.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/SYS.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB"
    },
    {
     "path": "ceremony/keys/SYS.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/TOOLS.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5"
    },
    {
     "path": "ceremony/keys/TOOLS.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/CALLER-batch.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/CALLER-studio.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/CALLER-studio.signing.AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/GARM.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/SYS.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/TOOLS.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/operator-signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YJNO5HIDUCDNOQ2SER3XA224F5ABE7RVEXH4YK5AT7US6QGPXNBQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"name\": \"garm\",\n  \"sub\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "ceremony/root/root.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "manifest.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 3856,
     "content": "{\n  \"manifest\": {\n    \"generation\": 5,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:09:45.496047+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n        \"signing\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n        \"signing\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\",\n        \"retiring\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n      },\n      \"GARM\": {\n        \"identity\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"signing\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n        \"signing\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"signing\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDR73DBG22J6QQIOO4CBI6PQ7GSV5R7PWPFKWKZEHZEYHDJ45OGUSTVL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252582,\n        \"expires_at\": 1822788582,\n        \"signing_key\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UAWYFYB4TLOU5GJQP4CDKVTDCS3BNCE7ESAAFDMWKLRP2ZDQSM5DGXG7\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252585,\n        \"expires_at\": 1822788585,\n        \"signing_key\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\",\n        \"reason\": \"rotation\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    ]\n  },\n  \"signer\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"signature\": \"e1fb1e74930c965e5f7da074feab56a82bfa587ed8d03505a0491f45aa2a8073fdf5111bdfb75f79ede64753bb1b4835a9aa78f7fde973e3a9a5c1b0c04b7703\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2133,
     "content": "{\n  \"jti\": \"NXRZDZPFZE5AZIS6JJAND5W4KLFACRFPF6I6FW7PA2BBDVEBLMDA\",\n  \"iat\": 1791252585,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ.\\u003e\",\n        \"account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJOR1U2TExXV0ZZRTNHR0ZaQlhDR0dQNkRaNUlHT1pVQlE1TkJVSUFZNkczT05RVUoySjJRIiwiaWF0IjoxNzkxMjUyNTg1LCJpc3MiOiJBRDI2N0RTWlpPR0lZSUNVUlVYWllORElRVENPU0pHTlhDVUJQT0pJSzQ2WVVWWUg3Wk9KTVpPSiIsInN1YiI6IkFBSFBDR1g2T043N0NOSkE3SEYyNk5ESUxFUkI1M1pPREJNSFFPS09GRFo3R0hXT0NIUFIzRENaIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFIUENHWDZPTjc3Q05KQTdIRjI2TkRJTEVSQjUzWk9EQk1IUU9LT0ZEWjdHSFdPQ0hQUjNEQ1ouXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.i7eUVlaZ9M_DHvrpAWmlA5KJOclHqqAmbXaBqMdLQz3DRPPqRiZEYv452_ujhyPqDVAzeEXJwV5X6piZkOmQBA\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2213,
     "content": "{\n  \"jti\": \"SZFJI3KF4TBPLITEF5L6RB6WAHQB7UNMDYNP6HDID2XGXEJVMEPQ\",\n  \"iat\": 1791252585,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N.\\u003e\",\n        \"account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJCUzUyT0hZVEFMQldCQ0pKTFBVNFMyRkpWNTZHUlVBV01HWVlZUVRMUVBCUVdCT0JNU0JRIiwiaWF0IjoxNzkxMjUyNTg1LCJpc3MiOiJBRDI2N0RTWlpPR0lZSUNVUlVYWllORElRVENPU0pHTlhDVUJQT0pJSzQ2WVVWWUg3Wk9KTVpPSiIsInN1YiI6IkFESUpTU01LTlA2QU1VUE5MUzQzQ0M1SEdNQTNDUFk1TlE1M1JYRUZXMkxTS0VTRUlSWERSQjZOIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURJSlNTTUtOUDZBTVVQTkxTNDNDQzVIR01BM0NQWTVOUTUzUlhFRlcyTFNLRVNFSVJYRFJCNk4uXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.M9BNrHSbYxxMW0ueL2aDMdc4ahw8mVmrHJp4cqhQCbuBAxS3ez3fs7PhhxLvrxbltuOzOFqpqa6D9SWfQxxwDA\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\",\n      \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"X2VA4YC5YNJHI7SZSNSL43WISLKNDTXQ5MWLQA7F4N53P6GF23CQ\",\n  \"iat\": 1791252585,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"GARM\",\n  \"sub\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiIyVVo2S0I3Nk5JR0VPNlVXSEdBUVlMRE1GN1FNSE81UUpPUVhKUkM3NFdLVEJKNVdINkZRIiwiaWF0IjoxNzkxMjUyNTg1LCJpc3MiOiJBQ0RBQVkyUUlENjVSM0dFR0JNNUJXSUxWWkVaSktNQU1NU1FUSUU3RjY2NlA3QUJEQ1RLVUZMWCIsInN1YiI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQ1ZCQVhYSzJGQk5TNU9YVVU2RFNPV1VCNEtHWkFEUVRaQzZCSVdHVFBKSlhEWkpNUVVPMzZDNSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.bUO_Kd2n0RAs-VGxsNaVaiqnOnZk9hcQSH2maoz86G9p0Rw240vQjpGx9QGFjd43ZhdgEovHvrNgpxPZt4FTDg\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"ZAKBSAL4D36GGZ4GBDRATIF3UE67OP56HJNV2LWNYVYO4QPFTVSQ\",\n  \"iat\": 1791252585,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"SYS\",\n  \"sub\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"ZQBU2BS3KMTK4EZQYQL44MAZN4RSZC3B7XAEYLRG6Y3XCY3L22PQ\",\n  \"iat\": 1791252585,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n  \"studio\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788582,\n  \"jti\": \"4AYKUWECA4IXKB5RGNH4J5U4WMQT5O525THEWJKYMMEKEC6VLALA\",\n  \"iat\": 1791252582,\n  \"iss\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\",\n  \"name\": \"batch\",\n  \"sub\": \"UDR73DBG22J6QQIOO4CBI6PQ7GSV5R7PWPFKWKZEHZEYHDJ45OGUSTVL\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:4\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"3I7FAEW2AVCDHQDKTM4G6B6UONEZ4QOUVMJW4ZEXWVS7IQF4ICAQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\",\n  \"name\": \"ops\",\n  \"sub\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"CROSCNXNKYON4VXDAK2ZQUM2NCTFDCIBCSFQIX6UMGV56KKEXO6A\",\n  \"iat\": 1791252578,\n  \"iss\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\",\n  \"name\": \"rund\",\n  \"sub\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788585,\n  \"jti\": \"7STAZBPIBE7BX4YXECFAYLTFVK64WTRKJBW2T2HVBV7HCA6SSLFQ\",\n  \"iat\": 1791252585,\n  \"iss\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\",\n  \"name\": \"studio\",\n  \"sub\": \"UAWYFYB4TLOU5GJQP4CDKVTDCS3BNCE7ESAAFDMWKLRP2ZDQSM5DGXG7\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"P7NCUEG67QB7UFMGFAINV52EPZQZXUI2PDQJQU7JCON4V44YIV6Q\",\n  \"iat\": 1791252578,\n  \"iss\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 3856,
     "content": "{\n  \"manifest\": {\n    \"generation\": 5,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:09:45.496047+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n        \"signing\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n        \"signing\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\",\n        \"retiring\": \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\"\n      },\n      \"GARM\": {\n        \"identity\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"signing\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n        \"signing\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"signing\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDR73DBG22J6QQIOO4CBI6PQ7GSV5R7PWPFKWKZEHZEYHDJ45OGUSTVL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252582,\n        \"expires_at\": 1822788582,\n        \"signing_key\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UAWYFYB4TLOU5GJQP4CDKVTDCS3BNCE7ESAAFDMWKLRP2ZDQSM5DGXG7\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252585,\n        \"expires_at\": 1822788585,\n        \"signing_key\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\",\n        \"reason\": \"rotation\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    ]\n  },\n  \"signer\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"signature\": \"e1fb1e74930c965e5f7da074feab56a82bfa587ed8d03505a0491f45aa2a8073fdf5111bdfb75f79ede64753bb1b4835a9aa78f7fde973e3a9a5c1b0c04b7703\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YJNO5HIDUCDNOQ2SER3XA224F5ABE7RVEXH4YK5AT7US6QGPXNBQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"name\": \"garm\",\n  \"sub\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 2,
     "content": "[]"
    }
   ],
   "bus": {
    "server": "tls://127.0.0.1:57443",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ",
      "signing_keys": [
       "ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "CALLER-studio",
      "public": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N",
      "signing_keys": [
       "AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS",
       "ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "GARM",
      "public": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK",
      "signing_keys": [
       "AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "SYS",
      "public": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB",
      "signing_keys": [
       "ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "TOOLS",
      "public": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5",
      "signing_keys": [
       "ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX"
      ],
      "revocations": 0,
      "pushed": false
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ",
      "public": "UDR73DBG22J6QQIOO4CBI6PQ7GSV5R7PWPFKWKZEHZEYHDJ45OGUSTVL",
      "issuer": "ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:4"
      ],
      "expires": "2027-10-06T02:09:42Z",
      "pub_allow": [
       "garm.run.v1.>"
      ],
      "sub_allow": [
       "_INBOX.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB",
      "public": "UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR",
      "issuer": "ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK",
      "public": "UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL",
      "issuer": "AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": [
       "garm.tool.>"
      ],
      "sub_allow": [
       "garm.run.v1.*.>",
       "_INBOX.>",
       "$SRV.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/studio.creds",
      "name": "studio",
      "account": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N",
      "public": "UAWYFYB4TLOU5GJQP4CDKVTDCS3BNCE7ESAAFDMWKLRP2ZDQSM5DGXG7",
      "issuer": "ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:5"
      ],
      "expires": "2027-10-06T02:09:45Z",
      "pub_allow": [
       "garm.run.v1.>"
      ],
      "sub_allow": [
       "_INBOX.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/weather.v1.WeatherService.creds",
      "name": "weather.v1.WeatherService",
      "account": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5",
      "public": "UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X",
      "issuer": "ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": null,
      "sub_allow": [
       "$SRV.>",
       "garm.tool.weather.v1.get_forecast",
       "garm.tool.weather.v1.schedule_report"
      ],
      "accepted": true
     },
     {
      "file": "a copy of studio.creds a process still holds",
      "name": "studio",
      "account": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N",
      "public": "UCQB77KS353BZOFF4PRMBYYN3X3C7QAZMANS3CKAO5EZ3KX6BUVSVTU5",
      "issuer": "AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": [
       "garm.run.v1.>"
      ],
      "sub_allow": [
       "_INBOX.>"
      ],
      "accepted": true,
      "from_before": true
     }
    ],
    "probes": [
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.tool.weather.v1.get_forecast",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Publish to \"garm.tool.weather.v1.get_forecast\""
     },
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.run.v1.invoke",
      "outcome": "allowed"
     },
     {
      "cred": "weather.v1.WeatherService",
      "action": "subscribe",
      "subject": "garm.tool.weather.v1.get_forecast",
      "outcome": "allowed"
     },
     {
      "cred": "weather.v1.WeatherService",
      "action": "subscribe",
      "subject": "garm.run.v1.>",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Subscription to \"garm.run.v1.>\""
     },
     {
      "cred": "rund",
      "action": "subscribe",
      "subject": "garm.run.v1.*.invoke",
      "outcome": "allowed"
     }
    ]
   }
  },
  {
   "id": "rotate-two",
   "title": "Step two: the old key is retired",
   "prose": "`studio-old` has rolled out. `--verify-live` finds no connection on the old key, the issuance drops it from the account, and the account is pushed. The copy of the old credential, signed by a key the account no longer lists, is refused.",
   "command": "garmctl topology … --verify-live --nats nats://127.0.0.1:… --ops-creds topo/creds/ops.creds --tls-ca ca.pem -o topo",
   "stdout": "CALLER-studio: retired signing key AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS; every credential it signed is now refused\nok: generation 6 from catalogue 24164e3e783d -- 5 accounts, 0 credentials, 0 revocations, written to topo\n",
   "stderr": "",
   "files": [
    {
     "path": "ca.pem",
     "kind": "pem",
     "change": "same",
     "secret": false,
     "size": 583,
     "content": "-----BEGIN CERTIFICATE-----\n…"
    },
    {
     "path": "ceremony/keys/CALLER-batch.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ"
    },
    {
     "path": "ceremony/keys/CALLER-batch.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/CALLER-studio.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N"
    },
    {
     "path": "ceremony/keys/CALLER-studio.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/GARM.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK"
    },
    {
     "path": "ceremony/keys/GARM.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/SYS.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB"
    },
    {
     "path": "ceremony/keys/SYS.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/TOOLS.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5"
    },
    {
     "path": "ceremony/keys/TOOLS.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/CALLER-batch.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/CALLER-studio.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/CALLER-studio.signing.AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/GARM.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/SYS.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/TOOLS.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/operator-signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YJNO5HIDUCDNOQ2SER3XA224F5ABE7RVEXH4YK5AT7US6QGPXNBQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"name\": \"garm\",\n  \"sub\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "ceremony/root/root.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3850,
     "content": "{\n  \"manifest\": {\n    \"generation\": 6,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:09:52.230044+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n        \"signing\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n        \"signing\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\",\n        \"retired\": {\n          \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\": 6\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"signing\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n        \"signing\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"signing\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDR73DBG22J6QQIOO4CBI6PQ7GSV5R7PWPFKWKZEHZEYHDJ45OGUSTVL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252582,\n        \"expires_at\": 1822788582,\n        \"signing_key\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UAWYFYB4TLOU5GJQP4CDKVTDCS3BNCE7ESAAFDMWKLRP2ZDQSM5DGXG7\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252585,\n        \"expires_at\": 1822788585,\n        \"signing_key\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    ]\n  },\n  \"signer\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"signature\": \"491d60f29c2db326575499d9e497995d91d500f4f2149d70080061b1a9c37a551f39516bbdfa017766da95ea039708b5999502cd8cd0393d5d04c16bcc54a00f\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2133,
     "content": "{\n  \"jti\": \"TF4LLNC3XJVJGPBLR7ZPEMIMKFISACRKYQIO7T2ZCEOIIXOMZPNQ\",\n  \"iat\": 1791252592,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ.\\u003e\",\n        \"account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJGVkdCQVRWSzRPUk0yMlpUNDJCVkpJWUdNSFFMSDY1NE42WUtVUTZCRE81U1JONk1FUVNRIiwiaWF0IjoxNzkxMjUyNTkyLCJpc3MiOiJBRDI2N0RTWlpPR0lZSUNVUlVYWllORElRVENPU0pHTlhDVUJQT0pJSzQ2WVVWWUg3Wk9KTVpPSiIsInN1YiI6IkFBSFBDR1g2T043N0NOSkE3SEYyNk5ESUxFUkI1M1pPREJNSFFPS09GRFo3R0hXT0NIUFIzRENaIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFIUENHWDZPTjc3Q05KQTdIRjI2TkRJTEVSQjUzWk9EQk1IUU9LT0ZEWjdHSFdPQ0hQUjNEQ1ouXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.Kl3vf8MV2pjW7JmeIDFMv-zn02kgVajQxGcGxuldRcGyw-tr3AOQHwCfKEbJMedpSUZ9bA2kIk6e9k00JVp2Cw\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"XWFOQWMEXJ5DNDTD7QXPPJU7ZT5JQP7YHQOK7R4DAD7SM5XYUYKQ\",\n  \"iat\": 1791252592,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N.\\u003e\",\n        \"account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJFSFZZNFhWNkJWNjNXWlVBMk9QVjRIQUg3NE82S0pNSkI0TVJXUk5VWEMzWDdEVEQ3UkxBIiwiaWF0IjoxNzkxMjUyNTkyLCJpc3MiOiJBRDI2N0RTWlpPR0lZSUNVUlVYWllORElRVENPU0pHTlhDVUJQT0pJSzQ2WVVWWUg3Wk9KTVpPSiIsInN1YiI6IkFESUpTU01LTlA2QU1VUE5MUzQzQ0M1SEdNQTNDUFk1TlE1M1JYRUZXMkxTS0VTRUlSWERSQjZOIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURJSlNTTUtOUDZBTVVQTkxTNDNDQzVIR01BM0NQWTVOUTUzUlhFRlcyTFNLRVNFSVJYRFJCNk4uXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.XcddNh6Vgz-spQtrBN2gt9WmpQaC4Zu3hili48h7ncm3RFvGsLXFOenFZfy7rMXQnVcnh5JWtrhT2-2sDJRgCg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"UZYGE3FFPS4M2TFFOCJHPX6LCNHUEUJDARKWOYTNWABICSRMJRHQ\",\n  \"iat\": 1791252592,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"GARM\",\n  \"sub\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJKWFFGSzdaUkVCNzZRWUJZUFdFTTZUN1JGWkpVNlNJTkxJVTVNMzRYNk1YWFNDWVQzMjVRIiwiaWF0IjoxNzkxMjUyNTkyLCJpc3MiOiJBQ0RBQVkyUUlENjVSM0dFR0JNNUJXSUxWWkVaSktNQU1NU1FUSUU3RjY2NlA3QUJEQ1RLVUZMWCIsInN1YiI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQ1ZCQVhYSzJGQk5TNU9YVVU2RFNPV1VCNEtHWkFEUVRaQzZCSVdHVFBKSlhEWkpNUVVPMzZDNSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.-DtvQ96S5gd9hqJ1nWbHFopcTCf9yjGZTFn2BhQ7YwC4cwWux6ACXC4mfr4tCVH1i1_1Noa7WAWpjQAxImnTDg\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"EYARYRYSNL5BVII6TIMREKMT56NCXEJDRT2RYWICPDGOF6ZTBPVA\",\n  \"iat\": 1791252592,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"SYS\",\n  \"sub\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"USQKACXAZZFHT6NL7ITBO7WUZWKIPQSKFZ5D56KNEFLDRALK4X4A\",\n  \"iat\": 1791252592,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n  \"studio\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788582,\n  \"jti\": \"4AYKUWECA4IXKB5RGNH4J5U4WMQT5O525THEWJKYMMEKEC6VLALA\",\n  \"iat\": 1791252582,\n  \"iss\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\",\n  \"name\": \"batch\",\n  \"sub\": \"UDR73DBG22J6QQIOO4CBI6PQ7GSV5R7PWPFKWKZEHZEYHDJ45OGUSTVL\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:4\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"3I7FAEW2AVCDHQDKTM4G6B6UONEZ4QOUVMJW4ZEXWVS7IQF4ICAQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\",\n  \"name\": \"ops\",\n  \"sub\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"CROSCNXNKYON4VXDAK2ZQUM2NCTFDCIBCSFQIX6UMGV56KKEXO6A\",\n  \"iat\": 1791252578,\n  \"iss\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\",\n  \"name\": \"rund\",\n  \"sub\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788585,\n  \"jti\": \"7STAZBPIBE7BX4YXECFAYLTFVK64WTRKJBW2T2HVBV7HCA6SSLFQ\",\n  \"iat\": 1791252585,\n  \"iss\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\",\n  \"name\": \"studio\",\n  \"sub\": \"UAWYFYB4TLOU5GJQP4CDKVTDCS3BNCE7ESAAFDMWKLRP2ZDQSM5DGXG7\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"P7NCUEG67QB7UFMGFAINV52EPZQZXUI2PDQJQU7JCON4V44YIV6Q\",\n  \"iat\": 1791252578,\n  \"iss\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3850,
     "content": "{\n  \"manifest\": {\n    \"generation\": 6,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:09:52.230044+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n        \"signing\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n        \"signing\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\",\n        \"retired\": {\n          \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\": 6\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"signing\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n        \"signing\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"signing\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDR73DBG22J6QQIOO4CBI6PQ7GSV5R7PWPFKWKZEHZEYHDJ45OGUSTVL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252582,\n        \"expires_at\": 1822788582,\n        \"signing_key\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UAWYFYB4TLOU5GJQP4CDKVTDCS3BNCE7ESAAFDMWKLRP2ZDQSM5DGXG7\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252585,\n        \"expires_at\": 1822788585,\n        \"signing_key\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    ]\n  },\n  \"signer\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"signature\": \"491d60f29c2db326575499d9e497995d91d500f4f2149d70080061b1a9c37a551f39516bbdfa017766da95ea039708b5999502cd8cd0393d5d04c16bcc54a00f\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YJNO5HIDUCDNOQ2SER3XA224F5ABE7RVEXH4YK5AT7US6QGPXNBQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"name\": \"garm\",\n  \"sub\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 2,
     "content": "[]"
    }
   ],
   "bus": {
    "server": "tls://127.0.0.1:57443",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ",
      "signing_keys": [
       "ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "CALLER-studio",
      "public": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N",
      "signing_keys": [
       "ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK",
      "signing_keys": [
       "AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB",
      "signing_keys": [
       "ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5",
      "signing_keys": [
       "ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX"
      ],
      "revocations": 0,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ",
      "public": "UDR73DBG22J6QQIOO4CBI6PQ7GSV5R7PWPFKWKZEHZEYHDJ45OGUSTVL",
      "issuer": "ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:4"
      ],
      "expires": "2027-10-06T02:09:42Z",
      "pub_allow": [
       "garm.run.v1.>"
      ],
      "sub_allow": [
       "_INBOX.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB",
      "public": "UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR",
      "issuer": "ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK",
      "public": "UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL",
      "issuer": "AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": [
       "garm.tool.>"
      ],
      "sub_allow": [
       "garm.run.v1.*.>",
       "_INBOX.>",
       "$SRV.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/studio.creds",
      "name": "studio",
      "account": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N",
      "public": "UAWYFYB4TLOU5GJQP4CDKVTDCS3BNCE7ESAAFDMWKLRP2ZDQSM5DGXG7",
      "issuer": "ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:5"
      ],
      "expires": "2027-10-06T02:09:45Z",
      "pub_allow": [
       "garm.run.v1.>"
      ],
      "sub_allow": [
       "_INBOX.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/weather.v1.WeatherService.creds",
      "name": "weather.v1.WeatherService",
      "account": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5",
      "public": "UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X",
      "issuer": "ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": null,
      "sub_allow": [
       "$SRV.>",
       "garm.tool.weather.v1.get_forecast",
       "garm.tool.weather.v1.schedule_report"
      ],
      "accepted": true
     },
     {
      "file": "a copy of studio.creds a process still holds",
      "name": "studio",
      "account": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N",
      "public": "UCQB77KS353BZOFF4PRMBYYN3X3C7QAZMANS3CKAO5EZ3KX6BUVSVTU5",
      "issuer": "AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": [
       "garm.run.v1.>"
      ],
      "sub_allow": [
       "_INBOX.>"
      ],
      "accepted": false,
      "reason": "nats: Authorization Violation",
      "from_before": true
     }
    ],
    "probes": [
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.tool.weather.v1.get_forecast",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Publish to \"garm.tool.weather.v1.get_forecast\""
     },
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.run.v1.invoke",
      "outcome": "allowed"
     },
     {
      "cred": "weather.v1.WeatherService",
      "action": "subscribe",
      "subject": "garm.tool.weather.v1.get_forecast",
      "outcome": "allowed"
     },
     {
      "cred": "weather.v1.WeatherService",
      "action": "subscribe",
      "subject": "garm.run.v1.>",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Subscription to \"garm.run.v1.>\""
     },
     {
      "cred": "rund",
      "action": "subscribe",
      "subject": "garm.run.v1.*.invoke",
      "outcome": "allowed"
     }
    ]
   }
  },
  {
   "id": "creds-lost",
   "title": "A credential file went missing",
   "prose": "`creds/batch.creds` is gone from `--out`. The same issuance into the same directory sees a credential the manifest records and the directory lacks, reissues it by name, and says so.",
   "command": "rm topo/creds/batch.creds; garmctl topology --keys ceremony/keys --manifest manifest.json --catalogue file://weather.binpb --callers studio,batch -o topo",
   "stdout": "batch: credential file was missing; reissued\nok: generation 7 from catalogue 24164e3e783d -- 5 accounts, 1 credentials, 1 revocations, written to topo\n",
   "stderr": "",
   "files": [
    {
     "path": "ca.pem",
     "kind": "pem",
     "change": "same",
     "secret": false,
     "size": 583,
     "content": "-----BEGIN CERTIFICATE-----\n…"
    },
    {
     "path": "ceremony/keys/CALLER-batch.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ"
    },
    {
     "path": "ceremony/keys/CALLER-batch.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/CALLER-studio.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N"
    },
    {
     "path": "ceremony/keys/CALLER-studio.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/GARM.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK"
    },
    {
     "path": "ceremony/keys/GARM.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/SYS.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB"
    },
    {
     "path": "ceremony/keys/SYS.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/TOOLS.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5"
    },
    {
     "path": "ceremony/keys/TOOLS.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/CALLER-batch.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/CALLER-studio.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/CALLER-studio.signing.AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/GARM.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/SYS.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/TOOLS.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/operator-signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YJNO5HIDUCDNOQ2SER3XA224F5ABE7RVEXH4YK5AT7US6QGPXNBQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"name\": \"garm\",\n  \"sub\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "ceremony/root/root.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3880,
     "content": "{\n  \"manifest\": {\n    \"generation\": 7,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:09:53.474274+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n        \"signing\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n        \"signing\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\",\n        \"retired\": {\n          \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\": 6\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"signing\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n        \"signing\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"signing\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDDIABXR37RZROOFJ7UPMMBN5U6MNYTFLFXSSTHBB7LLNGIET6BV6MCK\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 7,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252593,\n        \"expires_at\": 1822788593,\n        \"signing_key\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\",\n        \"reason\": \"reissued\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UAWYFYB4TLOU5GJQP4CDKVTDCS3BNCE7ESAAFDMWKLRP2ZDQSM5DGXG7\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252585,\n        \"expires_at\": 1822788585,\n        \"signing_key\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    ]\n  },\n  \"signer\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"signature\": \"e02bd4503e0692a1a93a0f2332ab04bb124aba9a3446d79caaf9fa3e749a1672a347443b87dc5f359f79a9ce29421c0926b0892168337e1a61abc8ed4f68fa05\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2248,
     "content": "{\n  \"jti\": \"H3LXGIGRRIMDHFCEKDMYCWPZAXLTU6V6IPTQWNDO6ZZYFDUV45PA\",\n  \"iat\": 1791252593,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ.\\u003e\",\n        \"account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJCSEsyM0ZHTTVDMkxPVlhCVlJHWVdHUlhFVEtUSlBFUzdGNjRKNzNDTlFJNUY2MlpHQlFRIiwiaWF0IjoxNzkxMjUyNTkzLCJpc3MiOiJBRDI2N0RTWlpPR0lZSUNVUlVYWllORElRVENPU0pHTlhDVUJQT0pJSzQ2WVVWWUg3Wk9KTVpPSiIsInN1YiI6IkFBSFBDR1g2T043N0NOSkE3SEYyNk5ESUxFUkI1M1pPREJNSFFPS09GRFo3R0hXT0NIUFIzRENaIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFIUENHWDZPTjc3Q05KQTdIRjI2TkRJTEVSQjUzWk9EQk1IUU9LT0ZEWjdHSFdPQ0hQUjNEQ1ouXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.rQAWFApMIkJypp7E8k7KzSklqDGAh9Tjbzyko7aFSNbdzcRIP6g_4fDviueRKw6KP7y23rBMzExd6MGtb46WCw\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n    ],\n    \"revocations\": {\n      \"UDR73DBG22J6QQIOO4CBI6PQ7GSV5R7PWPFKWKZEHZEYHDJ45OGUSTVL\": 1791252593\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"BXGPMQQA7YE3O5MAEIXOXJ5TXUWN4DHXMZG6KDJHXZ6XSR5XJPAA\",\n  \"iat\": 1791252593,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N.\\u003e\",\n        \"account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJUTzZNVFJQQldOVklYQVQ1QUg0VE5LR0ZHVDJXT0E3VUpBR1JDVE5XM0FKWU1UTVZNVVNRIiwiaWF0IjoxNzkxMjUyNTkzLCJpc3MiOiJBRDI2N0RTWlpPR0lZSUNVUlVYWllORElRVENPU0pHTlhDVUJQT0pJSzQ2WVVWWUg3Wk9KTVpPSiIsInN1YiI6IkFESUpTU01LTlA2QU1VUE5MUzQzQ0M1SEdNQTNDUFk1TlE1M1JYRUZXMkxTS0VTRUlSWERSQjZOIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURJSlNTTUtOUDZBTVVQTkxTNDNDQzVIR01BM0NQWTVOUTUzUlhFRlcyTFNLRVNFSVJYRFJCNk4uXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.arLHiaUXbreubri5MfkSWbc0kjZLkHjk27--gTvUWFg8RHZDeyYmVuoMr_NHsiFgVlD02qBf5GOGc5GIW2crAQ\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"QYIWCJQ654INIG7QYASYXYFDF6UOPCK2BMFJA44FDFBAZWCHSYSA\",\n  \"iat\": 1791252593,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"GARM\",\n  \"sub\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJWVVI0UE9ONzVRU0xURjNVMkFTTEQzWUdCQk1NSUJXMkZaWEpJRjNOMzU2U0NHNzdZNUVRIiwiaWF0IjoxNzkxMjUyNTkzLCJpc3MiOiJBQ0RBQVkyUUlENjVSM0dFR0JNNUJXSUxWWkVaSktNQU1NU1FUSUU3RjY2NlA3QUJEQ1RLVUZMWCIsInN1YiI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQ1ZCQVhYSzJGQk5TNU9YVVU2RFNPV1VCNEtHWkFEUVRaQzZCSVdHVFBKSlhEWkpNUVVPMzZDNSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.pzp3TFuRgw7LeFwEhJ0S-TGMGL6Q9qG2H30i-kAAS2-t3X12peLe7tB8JnMwf3vMSCWLVNz8w6JUU46tfc8RBA\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"UNNJ344MXUT6C7BTXQX7ZWVRT2A4U5KPZARLQQKMQDMMJL7AOX6A\",\n  \"iat\": 1791252593,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"SYS\",\n  \"sub\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"REGEXGDQ7UCK2N7I324MT3OUMOUEJATQVDMW2GXFNTEPIOBZ4DZQ\",\n  \"iat\": 1791252593,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n  \"studio\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "changed",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788593,\n  \"jti\": \"CM3TMKMWXOVS5CWRRXCUNWNUKBQUP3NOOHMZO7B5HSREEMAAJDHA\",\n  \"iat\": 1791252593,\n  \"iss\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\",\n  \"name\": \"batch\",\n  \"sub\": \"UDDIABXR37RZROOFJ7UPMMBN5U6MNYTFLFXSSTHBB7LLNGIET6BV6MCK\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:7\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"3I7FAEW2AVCDHQDKTM4G6B6UONEZ4QOUVMJW4ZEXWVS7IQF4ICAQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\",\n  \"name\": \"ops\",\n  \"sub\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"CROSCNXNKYON4VXDAK2ZQUM2NCTFDCIBCSFQIX6UMGV56KKEXO6A\",\n  \"iat\": 1791252578,\n  \"iss\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\",\n  \"name\": \"rund\",\n  \"sub\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788585,\n  \"jti\": \"7STAZBPIBE7BX4YXECFAYLTFVK64WTRKJBW2T2HVBV7HCA6SSLFQ\",\n  \"iat\": 1791252585,\n  \"iss\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\",\n  \"name\": \"studio\",\n  \"sub\": \"UAWYFYB4TLOU5GJQP4CDKVTDCS3BNCE7ESAAFDMWKLRP2ZDQSM5DGXG7\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"P7NCUEG67QB7UFMGFAINV52EPZQZXUI2PDQJQU7JCON4V44YIV6Q\",\n  \"iat\": 1791252578,\n  \"iss\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3880,
     "content": "{\n  \"manifest\": {\n    \"generation\": 7,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:09:53.474274+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n        \"signing\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n        \"signing\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\",\n        \"retired\": {\n          \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\": 6\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"signing\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n        \"signing\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"signing\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDDIABXR37RZROOFJ7UPMMBN5U6MNYTFLFXSSTHBB7LLNGIET6BV6MCK\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 7,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252593,\n        \"expires_at\": 1822788593,\n        \"signing_key\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\",\n        \"reason\": \"reissued\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UAWYFYB4TLOU5GJQP4CDKVTDCS3BNCE7ESAAFDMWKLRP2ZDQSM5DGXG7\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252585,\n        \"expires_at\": 1822788585,\n        \"signing_key\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    ]\n  },\n  \"signer\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"signature\": \"e02bd4503e0692a1a93a0f2332ab04bb124aba9a3446d79caaf9fa3e749a1672a347443b87dc5f359f79a9ce29421c0926b0892168337e1a61abc8ed4f68fa05\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YJNO5HIDUCDNOQ2SER3XA224F5ABE7RVEXH4YK5AT7US6QGPXNBQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"name\": \"garm\",\n  \"sub\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 249,
     "content": "[\n  {\n    \"Name\": \"batch\",\n    \"Account\": \"CALLER-batch\",\n    \"Public\": \"UDR73DBG22J6QQIOO4CBI6PQ7GSV5R7PWPFKWKZEHZEYHDJ45OGUSTVL\",\n    \"At\": \"2026-10-06T06:09:53.474274+04:00\",\n    \"Kind\": \"superseded\",\n    \"Why\": \"superseded by generation 7\"\n  }\n]"
    }
   ],
   "bus": {
    "server": "tls://127.0.0.1:57443",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ",
      "signing_keys": [
       "ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM"
      ],
      "revocations": 1,
      "pushed": true
     },
     {
      "name": "CALLER-studio",
      "public": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N",
      "signing_keys": [
       "ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK",
      "signing_keys": [
       "AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB",
      "signing_keys": [
       "ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5",
      "signing_keys": [
       "ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX"
      ],
      "revocations": 0,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ",
      "public": "UDDIABXR37RZROOFJ7UPMMBN5U6MNYTFLFXSSTHBB7LLNGIET6BV6MCK",
      "issuer": "ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:7"
      ],
      "expires": "2027-10-06T02:09:53Z",
      "pub_allow": [
       "garm.run.v1.>"
      ],
      "sub_allow": [
       "_INBOX.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB",
      "public": "UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR",
      "issuer": "ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK",
      "public": "UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL",
      "issuer": "AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": [
       "garm.tool.>"
      ],
      "sub_allow": [
       "garm.run.v1.*.>",
       "_INBOX.>",
       "$SRV.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/studio.creds",
      "name": "studio",
      "account": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N",
      "public": "UAWYFYB4TLOU5GJQP4CDKVTDCS3BNCE7ESAAFDMWKLRP2ZDQSM5DGXG7",
      "issuer": "ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:5"
      ],
      "expires": "2027-10-06T02:09:45Z",
      "pub_allow": [
       "garm.run.v1.>"
      ],
      "sub_allow": [
       "_INBOX.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/weather.v1.WeatherService.creds",
      "name": "weather.v1.WeatherService",
      "account": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5",
      "public": "UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X",
      "issuer": "ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:09:38Z",
      "pub_allow": null,
      "sub_allow": [
       "$SRV.>",
       "garm.tool.weather.v1.get_forecast",
       "garm.tool.weather.v1.schedule_report"
      ],
      "accepted": true
     }
    ],
    "probes": [
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.tool.weather.v1.get_forecast",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Publish to \"garm.tool.weather.v1.get_forecast\""
     },
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.run.v1.invoke",
      "outcome": "allowed"
     },
     {
      "cred": "weather.v1.WeatherService",
      "action": "subscribe",
      "subject": "garm.tool.weather.v1.get_forecast",
      "outcome": "allowed"
     },
     {
      "cred": "weather.v1.WeatherService",
      "action": "subscribe",
      "subject": "garm.run.v1.>",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Subscription to \"garm.run.v1.>\""
     },
     {
      "cred": "rund",
      "action": "subscribe",
      "subject": "garm.run.v1.*.invoke",
      "outcome": "allowed"
     }
    ]
   }
  },
  {
   "id": "status",
   "title": "Where things stand",
   "prose": "`--status` reads the manifest and issues nothing: the generation, the catalogue it came from, every account with its identity and signing keys, and any key still retiring.",
   "command": "garmctl topology --status --keys ceremony/keys --manifest manifest.json",
   "stdout": "generation 7 from catalogue 24164e3e783d, issued 2026-10-06T06:09:53+04:00; 5 credentials\n  CALLER-batch  identity AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ  signing ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\n  CALLER-studio  identity ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N  signing ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\n  GARM  identity AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK  signing AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\n  SYS  identity ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB  signing ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\n  TOOLS  identity ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5  signing ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\n",
   "stderr": "",
   "files": [
    {
     "path": "ca.pem",
     "kind": "pem",
     "change": "same",
     "secret": false,
     "size": 583,
     "content": "-----BEGIN CERTIFICATE-----\n…"
    },
    {
     "path": "ceremony/keys/CALLER-batch.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ"
    },
    {
     "path": "ceremony/keys/CALLER-batch.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/CALLER-studio.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N"
    },
    {
     "path": "ceremony/keys/CALLER-studio.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/GARM.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK"
    },
    {
     "path": "ceremony/keys/GARM.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/SYS.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB"
    },
    {
     "path": "ceremony/keys/SYS.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/TOOLS.pub",
     "kind": "text",
     "change": "same",
     "secret": false,
     "size": 57,
     "content": "ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5"
    },
    {
     "path": "ceremony/keys/TOOLS.signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/CALLER-batch.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/CALLER-studio.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/CALLER-studio.signing.AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/GARM.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/SYS.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/archive/TOOLS.identity.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/operator-signing.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "ceremony/keys/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YJNO5HIDUCDNOQ2SER3XA224F5ABE7RVEXH4YK5AT7US6QGPXNBQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"name\": \"garm\",\n  \"sub\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "ceremony/root/root.nk",
     "kind": "seed",
     "change": "same",
     "secret": true,
     "size": 58,
     "content": "(a private seed, 0600 -- never shown, never leaves the issuance environment)"
    },
    {
     "path": "manifest.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 3880,
     "content": "{\n  \"manifest\": {\n    \"generation\": 7,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:09:53.474274+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n        \"signing\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n        \"signing\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\",\n        \"retired\": {\n          \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\": 6\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"signing\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n        \"signing\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"signing\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDDIABXR37RZROOFJ7UPMMBN5U6MNYTFLFXSSTHBB7LLNGIET6BV6MCK\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 7,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252593,\n        \"expires_at\": 1822788593,\n        \"signing_key\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\",\n        \"reason\": \"reissued\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UAWYFYB4TLOU5GJQP4CDKVTDCS3BNCE7ESAAFDMWKLRP2ZDQSM5DGXG7\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252585,\n        \"expires_at\": 1822788585,\n        \"signing_key\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    ]\n  },\n  \"signer\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"signature\": \"e02bd4503e0692a1a93a0f2332ab04bb124aba9a3446d79caaf9fa3e749a1672a347443b87dc5f359f79a9ce29421c0926b0892168337e1a61abc8ed4f68fa05\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2248,
     "content": "{\n  \"jti\": \"H3LXGIGRRIMDHFCEKDMYCWPZAXLTU6V6IPTQWNDO6ZZYFDUV45PA\",\n  \"iat\": 1791252593,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ.\\u003e\",\n        \"account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJCSEsyM0ZHTTVDMkxPVlhCVlJHWVdHUlhFVEtUSlBFUzdGNjRKNzNDTlFJNUY2MlpHQlFRIiwiaWF0IjoxNzkxMjUyNTkzLCJpc3MiOiJBRDI2N0RTWlpPR0lZSUNVUlVYWllORElRVENPU0pHTlhDVUJQT0pJSzQ2WVVWWUg3Wk9KTVpPSiIsInN1YiI6IkFBSFBDR1g2T043N0NOSkE3SEYyNk5ESUxFUkI1M1pPREJNSFFPS09GRFo3R0hXT0NIUFIzRENaIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFIUENHWDZPTjc3Q05KQTdIRjI2TkRJTEVSQjUzWk9EQk1IUU9LT0ZEWjdHSFdPQ0hQUjNEQ1ouXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.rQAWFApMIkJypp7E8k7KzSklqDGAh9Tjbzyko7aFSNbdzcRIP6g_4fDviueRKw6KP7y23rBMzExd6MGtb46WCw\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n    ],\n    \"revocations\": {\n      \"UDR73DBG22J6QQIOO4CBI6PQ7GSV5R7PWPFKWKZEHZEYHDJ45OGUSTVL\": 1791252593\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"BXGPMQQA7YE3O5MAEIXOXJ5TXUWN4DHXMZG6KDJHXZ6XSR5XJPAA\",\n  \"iat\": 1791252593,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N.\\u003e\",\n        \"account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJUTzZNVFJQQldOVklYQVQ1QUg0VE5LR0ZHVDJXT0E3VUpBR1JDVE5XM0FKWU1UTVZNVVNRIiwiaWF0IjoxNzkxMjUyNTkzLCJpc3MiOiJBRDI2N0RTWlpPR0lZSUNVUlVYWllORElRVENPU0pHTlhDVUJQT0pJSzQ2WVVWWUg3Wk9KTVpPSiIsInN1YiI6IkFESUpTU01LTlA2QU1VUE5MUzQzQ0M1SEdNQTNDUFk1TlE1M1JYRUZXMkxTS0VTRUlSWERSQjZOIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURJSlNTTUtOUDZBTVVQTkxTNDNDQzVIR01BM0NQWTVOUTUzUlhFRlcyTFNLRVNFSVJYRFJCNk4uXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.arLHiaUXbreubri5MfkSWbc0kjZLkHjk27--gTvUWFg8RHZDeyYmVuoMr_NHsiFgVlD02qBf5GOGc5GIW2crAQ\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"QYIWCJQ654INIG7QYASYXYFDF6UOPCK2BMFJA44FDFBAZWCHSYSA\",\n  \"iat\": 1791252593,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"GARM\",\n  \"sub\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJWVVI0UE9ONzVRU0xURjNVMkFTTEQzWUdCQk1NSUJXMkZaWEpJRjNOMzU2U0NHNzdZNUVRIiwiaWF0IjoxNzkxMjUyNTkzLCJpc3MiOiJBQ0RBQVkyUUlENjVSM0dFR0JNNUJXSUxWWkVaSktNQU1NU1FUSUU3RjY2NlA3QUJEQ1RLVUZMWCIsInN1YiI6IkFBSE1CNFJKUjI3MkhOU0JWUE5RU1JWU0ZTNVBZRDUySlpQQlNQTzRIQU1aVTZTTEJQTDJJSEZLIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQ1ZCQVhYSzJGQk5TNU9YVVU2RFNPV1VCNEtHWkFEUVRaQzZCSVdHVFBKSlhEWkpNUVVPMzZDNSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.pzp3TFuRgw7LeFwEhJ0S-TGMGL6Q9qG2H30i-kAAS2-t3X12peLe7tB8JnMwf3vMSCWLVNz8w6JUU46tfc8RBA\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"UNNJ344MXUT6C7BTXQX7ZWVRT2A4U5KPZARLQQKMQDMMJL7AOX6A\",\n  \"iat\": 1791252593,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"SYS\",\n  \"sub\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"REGEXGDQ7UCK2N7I324MT3OUMOUEJATQVDMW2GXFNTEPIOBZ4DZQ\",\n  \"iat\": 1791252593,\n  \"iss\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n  \"studio\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788593,\n  \"jti\": \"CM3TMKMWXOVS5CWRRXCUNWNUKBQUP3NOOHMZO7B5HSREEMAAJDHA\",\n  \"iat\": 1791252593,\n  \"iss\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\",\n  \"name\": \"batch\",\n  \"sub\": \"UDDIABXR37RZROOFJ7UPMMBN5U6MNYTFLFXSSTHBB7LLNGIET6BV6MCK\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:7\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"3I7FAEW2AVCDHQDKTM4G6B6UONEZ4QOUVMJW4ZEXWVS7IQF4ICAQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\",\n  \"name\": \"ops\",\n  \"sub\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"CROSCNXNKYON4VXDAK2ZQUM2NCTFDCIBCSFQIX6UMGV56KKEXO6A\",\n  \"iat\": 1791252578,\n  \"iss\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\",\n  \"name\": \"rund\",\n  \"sub\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788585,\n  \"jti\": \"7STAZBPIBE7BX4YXECFAYLTFVK64WTRKJBW2T2HVBV7HCA6SSLFQ\",\n  \"iat\": 1791252585,\n  \"iss\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\",\n  \"name\": \"studio\",\n  \"sub\": \"UAWYFYB4TLOU5GJQP4CDKVTDCS3BNCE7ESAAFDMWKLRP2ZDQSM5DGXG7\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788578,\n  \"jti\": \"P7NCUEG67QB7UFMGFAINV52EPZQZXUI2PDQJQU7JCON4V44YIV6Q\",\n  \"iat\": 1791252578,\n  \"iss\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 3880,
     "content": "{\n  \"manifest\": {\n    \"generation\": 7,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:09:53.474274+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAHPCGX6ON77CNJA7HF26NDILERB53ZODBMHQOKOFDZ7GHWOCHPR3DCZ\",\n        \"signing\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADIJSSMKNP6AMUPNLS43CC5HGMA3CPY5NQ53RXEFW2LSKESEIRXDRB6N\",\n        \"signing\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\",\n        \"retired\": {\n          \"AC4KQAKJJD7TWBN4GW4BJ35NOEVZAATHR6DC7O6XI7GKYWIIVI35ZLZS\": 6\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"AAHMB4RJR272HNSBVPNQSRVSFS5PYD52JZPBSPO4HAMZU6SLBPL2IHFK\",\n        \"signing\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGN5QQNWLIJD7O3FFM7W6SUTLZXR64GFZJQMFE662N6JE2ODLTXO3GB\",\n        \"signing\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACVBAXXK2FBNS5OXUU6DSOWUB4KGZADQTZC6BIWGTPJJXDZJMQUO36C5\",\n        \"signing\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDDIABXR37RZROOFJ7UPMMBN5U6MNYTFLFXSSTHBB7LLNGIET6BV6MCK\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 7,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252593,\n        \"expires_at\": 1822788593,\n        \"signing_key\": \"ABJTSOI2PEJAOT5JCHNRK5OTUQZLM7LY6M33PXVAKPBHPXNZKXVXOYWM\",\n        \"reason\": \"reissued\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UBYW4ZEOZ6KY7B2Y6PH6MUPE7BPT5WKVCWXS3XOJAAMBBQ5EZXG2EQAR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ADB65EL6VAFWZRBRKPZE5C2Q275BKTWDPLBWDIMTKIJPVCVQFLQJ6IYS\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCSJPADWEI4AKMU3SOIQNGRJAEKQOEBJ54FFTALELFPLGGPBU2JCO5VL\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"AD267DSZZOGIYICURUXZYNDIQTCOSJGNXCUBPOJIK46YUVYH7ZOJMZOJ\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UAWYFYB4TLOU5GJQP4CDKVTDCS3BNCE7ESAAFDMWKLRP2ZDQSM5DGXG7\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252585,\n        \"expires_at\": 1822788585,\n        \"signing_key\": \"ACZMXRT5C6VX5ZGRFCA2EWVIMLTYU3BGQNBOOTAVPPNMOOVD3IF5HHDZ\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDE6H3ZUIPFC5LUAAD45A4MIREYGT2SOT5FQCQEYWMPIJVXQUKU5OJ2X\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252578,\n        \"expires_at\": 1822788578,\n        \"signing_key\": \"ACDAAY2QID65R3GEGBM5BWILVZEZJKMAMMSQTIE7F666P7ABDCTKUFLX\"\n      }\n    ]\n  },\n  \"signer\": \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\",\n  \"signature\": \"e02bd4503e0692a1a93a0f2332ab04bb124aba9a3446d79caaf9fa3e749a1672a347443b87dc5f359f79a9ce29421c0926b0892168337e1a61abc8ed4f68fa05\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YJNO5HIDUCDNOQ2SER3XA224F5ABE7RVEXH4YK5AT7US6QGPXNBQ\",\n  \"iat\": 1791252578,\n  \"iss\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"name\": \"garm\",\n  \"sub\": \"OB5OAPWFY2775MGTNFUJ5TBQRTPW2HERBU4DNI5Z5E7FLCUUTPGF3NPF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OAJILI6GBW4QFQQI5YQ6YT46X6S673W53GLWNWLRDBD67IPEDHQIELBH\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 249,
     "content": "[\n  {\n    \"Name\": \"batch\",\n    \"Account\": \"CALLER-batch\",\n    \"Public\": \"UDR73DBG22J6QQIOO4CBI6PQ7GSV5R7PWPFKWKZEHZEYHDJ45OGUSTVL\",\n    \"At\": \"2026-10-06T06:09:53.474274+04:00\",\n    \"Kind\": \"superseded\",\n    \"Why\": \"superseded by generation 7\"\n  }\n]"
    }
   ]
  }
 ]
}
;
