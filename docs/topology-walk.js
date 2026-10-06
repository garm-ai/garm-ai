// Written by `mise run topology-walk` (cmd/garmctl/walk_test.go): the lifecycle of
// docs/operating-the-topology.md run for real and recorded. Regenerate, do not edit.
window.TOPOLOGY_WALK = {
 "generated_at": "2026-10-06T01:39:29Z",
 "steps": [
  {
   "id": "ceremony",
   "title": "The root ceremony, once, offline",
   "prose": "`garmctl operator init` mints the operator root and the operator signing key, writes the root-signed operator JWT, and puts the root under `root/` for custody. Everything `topology` will ever need is under `keys/`; the root is not.",
   "command": "garmctl operator init --out ceremony",
   "stdout": "ok: operator ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2; keys for topology in ceremony/keys\nMOVE ceremony/root TO CUSTODY NOW: the root signs nothing day to day and must never be where topology runs\n",
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
     "content": "{\n  \"jti\": \"AHOARQDQ7JXLEOXWF54JL5QPI7ZXNYGAUS4NEZAOCDHZXHH3MBOA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"name\": \"garm\",\n  \"sub\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "content": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4"
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
     "content": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI"
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
     "content": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN"
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
     "content": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI"
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
     "content": "{\n  \"jti\": \"AHOARQDQ7JXLEOXWF54JL5QPI7ZXNYGAUS4NEZAOCDHZXHH3MBOA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"name\": \"garm\",\n  \"sub\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 3046,
     "content": "{\n  \"manifest\": {\n    \"generation\": 1,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T05:39:12.804518+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n        \"signing\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n      },\n      \"GARM\": {\n        \"identity\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"signing\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      \"SYS\": {\n        \"identity\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n        \"signing\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"signing\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCVSCBP4BKHJ26M46UHSLB26KCRT4WUOQDRGLI2IFBUO6EILLLWJOGEI\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\",\n        \"reason\": \"new\"\n      }\n    ]\n  },\n  \"signer\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"signature\": \"37d288fd7607a25195fd2103944de13b4ab9ffd931395e7eeebf6bb25f24602b5e169fabec6f331e51f8b3a87e69c344392d0aec86292289e80dae6741ba3207\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"EBUF6TU65WMIC2FJICWMTVR2BMNIIUEN3NQ5YIN7FDZEOUBWJK7Q\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4.\\u003e\",\n        \"account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJNSldXRE1WQ0RZNU1ZNVNOTjRPREFVNE5MRzczTTIyWjJCQlVYRVdHR0JVQlpGV0tLWEVRIiwiaWF0IjoxNzkxMjUwNzUyLCJpc3MiOiJBQVVGTldVUUxEQVA1TVdRS1lQU1BCWEkzT1lMSDRTWEw1S0kzRlQzV0lXUVdYVUpLUURTRkUyQyIsInN1YiI6IkFCRkpITDVENjdIM0FIWVBaWEhDVkJENU9MWkRHR043UVpJRU9DVlAyWFY2RkM2RUhDRzZGUlM0IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUJGSkhMNUQ2N0gzQUhZUFpYSENWQkQ1T0xaREdHTjdRWklFT0NWUDJYVjZGQzZFSENHNkZSUzQuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.kvAtgyLTctu6csGk7mg_V3N-J0NKvlKC2ISJwKzLJG6bh2RO_Jqg6MNQ6PWdtxwhHXdYRtWIQO24xpXDDR6ZBA\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"U4YJANUD6CI6JVH3EBGRLUGLRBUJGSV4UCX6EH3ZKJE64NVIFKTA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"GARM\",\n  \"sub\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJMVkRNSkkyNklDNlFXTEpXVktHTjZBUVNETUtPT0Q3Vk5JM1JYSENINENIMlRNRVQzVUdRIiwiaWF0IjoxNzkxMjUwNzUyLCJpc3MiOiJBQ1c0T0g0RFBHQ0FQSVNTM1ZaRjZETEI0TkFMVURQMzVTU1FaRVEzUlVRWEc3QVJVQjIyVFlVTCIsInN1YiI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQkRZWkVVRTZPWVc0QkVNTVBNREI0SVdBN05KUTJTVEs1T1ZYV1M0QURaUUFVQU9TUlRFT0pFSSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.PHGBNaIYkZkXV5y75I6TWE51kM2Ad_hpr4Etcq-22jEC9yHe96ZCPHhySsZB1GR-5J3BjPsj5TolZu7AQdA8AQ\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"FRVFHJAPZPINU2AEG4EYFWTYCID3YEZ67JXP3S5JY2AQD5TYBOIQ\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"SYS\",\n  \"sub\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"YZ5LVO4C6GO3OGIERJYY6DV63QMPXFO3UXNFFVKHWLJDZVRPVO4A\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "new",
     "secret": false,
     "size": 74,
     "content": "{\n  \"studio\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\"\n}"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"B5QTY55RORYO2A2R5X5NI6T4AGSHQ5QALY2U7DWKFGGTNG5HOXIQ\",\n  \"iat\": 1791250752,\n  \"iss\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\",\n  \"name\": \"ops\",\n  \"sub\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"BSBA3GDKAJOKQ4MOOS76XXYPAG7KQV2GKNMSILLY6UJAUUIYBQUA\",\n  \"iat\": 1791250752,\n  \"iss\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\",\n  \"name\": \"rund\",\n  \"sub\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"RUY5GDYUDU3K53Y6WHEKGHPLHRAUPU2J2JLWTEG4CHLBDXYVIXNA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\",\n  \"name\": \"studio\",\n  \"sub\": \"UCVSCBP4BKHJ26M46UHSLB26KCRT4WUOQDRGLI2IFBUO6EILLLWJOGEI\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"GZT44YX6K47G7FUSAREFKSTAKVJBVSKGUYTRU5UBLY5JTX2SAHZQ\",\n  \"iat\": 1791250752,\n  \"iss\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "new",
     "secret": false,
     "size": 3046,
     "content": "{\n  \"manifest\": {\n    \"generation\": 1,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T05:39:12.804518+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n        \"signing\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n      },\n      \"GARM\": {\n        \"identity\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"signing\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      \"SYS\": {\n        \"identity\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n        \"signing\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"signing\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCVSCBP4BKHJ26M46UHSLB26KCRT4WUOQDRGLI2IFBUO6EILLLWJOGEI\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\",\n        \"reason\": \"new\"\n      }\n    ]\n  },\n  \"signer\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"signature\": \"37d288fd7607a25195fd2103944de13b4ab9ffd931395e7eeebf6bb25f24602b5e169fabec6f331e51f8b3a87e69c344392d0aec86292289e80dae6741ba3207\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"AHOARQDQ7JXLEOXWF54JL5QPI7ZXNYGAUS4NEZAOCDHZXHH3MBOA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"name\": \"garm\",\n  \"sub\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:64172",
    "accounts": [
     {
      "name": "CALLER-studio",
      "public": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4",
      "signing_keys": [
       "ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "GARM",
      "public": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI",
      "signing_keys": [
       "AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "SYS",
      "public": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN",
      "signing_keys": [
       "AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "TOOLS",
      "public": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI",
      "signing_keys": [
       "ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL"
      ],
      "revocations": 0,
      "pushed": false
     }
    ],
    "creds": [
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN",
      "public": "UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3",
      "issuer": "AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI",
      "public": "UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN",
      "issuer": "AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
      "account": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4",
      "public": "UCVSCBP4BKHJ26M46UHSLB26KCRT4WUOQDRGLI2IFBUO6EILLLWJOGEI",
      "issuer": "ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
      "account": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI",
      "public": "UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS",
      "issuer": "ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
     "content": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4"
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
     "content": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI"
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
     "content": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN"
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
     "content": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI"
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
     "content": "{\n  \"jti\": \"AHOARQDQ7JXLEOXWF54JL5QPI7ZXNYGAUS4NEZAOCDHZXHH3MBOA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"name\": \"garm\",\n  \"sub\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 3424,
     "content": "{\n  \"manifest\": {\n    \"generation\": 2,\n    \"catalogue_sha256\": \"f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n    \"issued_at\": \"2026-10-06T05:39:14.089927+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n        \"signing\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n      },\n      \"GARM\": {\n        \"identity\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"signing\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      \"SYS\": {\n        \"identity\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n        \"signing\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"signing\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCVSCBP4BKHJ26M46UHSLB26KCRT4WUOQDRGLI2IFBUO6EILLLWJOGEI\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      },\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBUB23UI2KWSTNO2EMUARS2GIKUMXYML37TKTYZGOQYUUMQ3NUR4EUQO\",\n        \"catalogue_sha256\": \"f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n        \"generation\": 2,\n        \"permissions_hash\": \"19ef9109d050959e\",\n        \"issued_at\": 1791250754,\n        \"signing_key\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\",\n        \"reason\": \"new\"\n      }\n    ]\n  },\n  \"signer\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"signature\": \"1830d4b3aedff0048b5dec3447acd0f0aea6dcf0733631f473d58d14f92a8f00c4dfe951e54d7ca9601d42df7ec99bdbe27c6bd6eaf57a317a5e89e387be1606\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"UYWM5RXSBER3B6F7A6AK2HJVFWSZFUOAMG7ZYVD37HFJIDVTPEWQ\",\n  \"iat\": 1791250754,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4.\\u003e\",\n        \"account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiI2S1E1QVpLQVhLRUpDVDVRUTVCVUpTTFFUVkVIUlpCWlZGQVFXQjRNVERWVElTNTJFS0NBIiwiaWF0IjoxNzkxMjUwNzU0LCJpc3MiOiJBQVVGTldVUUxEQVA1TVdRS1lQU1BCWEkzT1lMSDRTWEw1S0kzRlQzV0lXUVdYVUpLUURTRkUyQyIsInN1YiI6IkFCRkpITDVENjdIM0FIWVBaWEhDVkJENU9MWkRHR043UVpJRU9DVlAyWFY2RkM2RUhDRzZGUlM0IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUJGSkhMNUQ2N0gzQUhZUFpYSENWQkQ1T0xaREdHTjdRWklFT0NWUDJYVjZGQzZFSENHNkZSUzQuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.tvVLFr-80yAMIV13q2cSuyCljYoqQazB4He6ylAhCXGkt6x8-InBnkQa_4TRjHt15gwbHXgKh7i6YZdvmOzNCg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"L4U4THUIE7QLSBT6UTPCQGJFGPMRZEDUHUKCD7RAA4F2HZSPLZMQ\",\n  \"iat\": 1791250754,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"GARM\",\n  \"sub\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJESk9TNjczUDZaSU9RQkhOQUxONlpFSk1MNzJYQllCNTVVWE40RFVXTjVKVU5VN1ZYRkJRIiwiaWF0IjoxNzkxMjUwNzU0LCJpc3MiOiJBQ1c0T0g0RFBHQ0FQSVNTM1ZaRjZETEI0TkFMVURQMzVTU1FaRVEzUlVRWEc3QVJVQjIyVFlVTCIsInN1YiI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQkRZWkVVRTZPWVc0QkVNTVBNREI0SVdBN05KUTJTVEs1T1ZYV1M0QURaUUFVQU9TUlRFT0pFSSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.VAjRE83gqnYvnV3NqtoZeHV6-cvq_McsAweD029j71LA4KEN4YGCgOlqAtVc7V2izWssKuEVOyPtU2skfQ6rCw\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"MKNR6IAIGZQ23L7GRRS34GNBX4REQCLWEFVR2H46A74X5PC2WBAA\",\n  \"iat\": 1791250754,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"SYS\",\n  \"sub\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"2WPARGD5CHOZVJCI3EYMIAN42EWBUUBKWDWW56C2W3QQ32V4KJPA\",\n  \"iat\": 1791250754,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 74,
     "content": "{\n  \"studio\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\"\n}"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"B5QTY55RORYO2A2R5X5NI6T4AGSHQ5QALY2U7DWKFGGTNG5HOXIQ\",\n  \"iat\": 1791250752,\n  \"iss\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\",\n  \"name\": \"ops\",\n  \"sub\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"BSBA3GDKAJOKQ4MOOS76XXYPAG7KQV2GKNMSILLY6UJAUUIYBQUA\",\n  \"iat\": 1791250752,\n  \"iss\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\",\n  \"name\": \"rund\",\n  \"sub\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"RUY5GDYUDU3K53Y6WHEKGHPLHRAUPU2J2JLWTEG4CHLBDXYVIXNA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\",\n  \"name\": \"studio\",\n  \"sub\": \"UCVSCBP4BKHJ26M46UHSLB26KCRT4WUOQDRGLI2IFBUO6EILLLWJOGEI\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"GZT44YX6K47G7FUSAREFKSTAKVJBVSKGUYTRU5UBLY5JTX2SAHZQ\",\n  \"iat\": 1791250752,\n  \"iss\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather2.v1.WeatherService.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1399,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786754,\n  \"jti\": \"G36Q4NOHCUND5ZUJ36RA2JJ7FH6RVVGDLDUERA2Z3J5JYTLWY67Q\",\n  \"iat\": 1791250754,\n  \"iss\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\",\n  \"name\": \"weather2.v1.WeatherService\",\n  \"sub\": \"UBUB23UI2KWSTNO2EMUARS2GIKUMXYML37TKTYZGOQYUUMQ3NUR4EUQO\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather-2.v1.get_forecast\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n    \"tags\": [\n      \"catalogue:f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n      \"generation:2\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3424,
     "content": "{\n  \"manifest\": {\n    \"generation\": 2,\n    \"catalogue_sha256\": \"f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n    \"issued_at\": \"2026-10-06T05:39:14.089927+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n        \"signing\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n      },\n      \"GARM\": {\n        \"identity\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"signing\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      \"SYS\": {\n        \"identity\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n        \"signing\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"signing\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCVSCBP4BKHJ26M46UHSLB26KCRT4WUOQDRGLI2IFBUO6EILLLWJOGEI\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      },\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBUB23UI2KWSTNO2EMUARS2GIKUMXYML37TKTYZGOQYUUMQ3NUR4EUQO\",\n        \"catalogue_sha256\": \"f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n        \"generation\": 2,\n        \"permissions_hash\": \"19ef9109d050959e\",\n        \"issued_at\": 1791250754,\n        \"signing_key\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\",\n        \"reason\": \"new\"\n      }\n    ]\n  },\n  \"signer\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"signature\": \"1830d4b3aedff0048b5dec3447acd0f0aea6dcf0733631f473d58d14f92a8f00c4dfe951e54d7ca9601d42df7ec99bdbe27c6bd6eaf57a317a5e89e387be1606\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"AHOARQDQ7JXLEOXWF54JL5QPI7ZXNYGAUS4NEZAOCDHZXHH3MBOA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"name\": \"garm\",\n  \"sub\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:64172",
    "accounts": [
     {
      "name": "CALLER-studio",
      "public": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4",
      "signing_keys": [
       "ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI",
      "signing_keys": [
       "AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN",
      "signing_keys": [
       "AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI",
      "signing_keys": [
       "ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL"
      ],
      "revocations": 0,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN",
      "public": "UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3",
      "issuer": "AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI",
      "public": "UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN",
      "issuer": "AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
      "account": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4",
      "public": "UCVSCBP4BKHJ26M46UHSLB26KCRT4WUOQDRGLI2IFBUO6EILLLWJOGEI",
      "issuer": "ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
      "account": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI",
      "public": "UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS",
      "issuer": "ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
      "account": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI",
      "public": "UBUB23UI2KWSTNO2EMUARS2GIKUMXYML37TKTYZGOQYUUMQ3NUR4EUQO",
      "issuer": "ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL",
      "tags": [
       "catalogue:f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a",
       "generation:2"
      ],
      "expires": "2027-10-06T01:39:14Z",
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
     "content": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4"
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
     "content": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI"
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
     "content": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN"
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
     "content": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI"
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
     "content": "{\n  \"jti\": \"AHOARQDQ7JXLEOXWF54JL5QPI7ZXNYGAUS4NEZAOCDHZXHH3MBOA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"name\": \"garm\",\n  \"sub\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 2946,
     "content": "{\n  \"manifest\": {\n    \"generation\": 3,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T05:39:15.371998+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n        \"signing\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n      },\n      \"GARM\": {\n        \"identity\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"signing\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      \"SYS\": {\n        \"identity\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n        \"signing\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"signing\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCVSCBP4BKHJ26M46UHSLB26KCRT4WUOQDRGLI2IFBUO6EILLLWJOGEI\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    ]\n  },\n  \"signer\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"signature\": \"06ef3aa792195f2c42666eaf11236871d5153c816c3dcc704d8df0374ce43acc80d07e2f8c4d4fef73b4696153355042fc19590c482d300a5d7a8502939bd204\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"5JY4IAI7ZZPNHZYUP6FLMFV7EVKGGNZ53EBUDFDAWROWNB2RDGUA\",\n  \"iat\": 1791250755,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4.\\u003e\",\n        \"account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJPNVRPQjQ0U1VCQVBWN0lENjRBV1FSRUFVMkdKMkI3VzU1SVlFTzc0MkxKNTdTWFlETE1RIiwiaWF0IjoxNzkxMjUwNzU1LCJpc3MiOiJBQVVGTldVUUxEQVA1TVdRS1lQU1BCWEkzT1lMSDRTWEw1S0kzRlQzV0lXUVdYVUpLUURTRkUyQyIsInN1YiI6IkFCRkpITDVENjdIM0FIWVBaWEhDVkJENU9MWkRHR043UVpJRU9DVlAyWFY2RkM2RUhDRzZGUlM0IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUJGSkhMNUQ2N0gzQUhZUFpYSENWQkQ1T0xaREdHTjdRWklFT0NWUDJYVjZGQzZFSENHNkZSUzQuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.hN61NhxObY6pFLPYn_2-3WIqloPOCbooZ5Y1cqqfP8pGIPNI-AZgFKvm6pQZYSZlEoaC9QDUIj9y2_bmj1LMBQ\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"KOMQBQWNTQANNKGEJEVVUMK3B25CGBP7D2DOEWNKAGYPBFPJ7DTA\",\n  \"iat\": 1791250755,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"GARM\",\n  \"sub\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiIzU1pNNUMyTEFHUlczNjVNRE9VRlA2QkVTTkdVVkFHUDZJWVNKU0JFRks3VFNWQ1pLWEpRIiwiaWF0IjoxNzkxMjUwNzU1LCJpc3MiOiJBQ1c0T0g0RFBHQ0FQSVNTM1ZaRjZETEI0TkFMVURQMzVTU1FaRVEzUlVRWEc3QVJVQjIyVFlVTCIsInN1YiI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQkRZWkVVRTZPWVc0QkVNTVBNREI0SVdBN05KUTJTVEs1T1ZYV1M0QURaUUFVQU9TUlRFT0pFSSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.clGZ8hu-9b9_5IOx3ad67qMVqAuePOpvjbI8kZqQc6f3ZUrGDRc1hMKp54TYDPZXoVpD9R5mzs1wkXvk0Cn_Dg\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"R3ZXW4HXQ5UT5I22OJJ3ZKFUYHSN4N5RVOWFPLUGRMDNSZHBNI6A\",\n  \"iat\": 1791250755,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"SYS\",\n  \"sub\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 1084,
     "content": "{\n  \"jti\": \"6ACXWQGU5BYWG45OPMWZKG73ADDJ533G3VYM4FE2FFOWP6O567LA\",\n  \"iat\": 1791250755,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n    ],\n    \"revocations\": {\n      \"UBUB23UI2KWSTNO2EMUARS2GIKUMXYML37TKTYZGOQYUUMQ3NUR4EUQO\": 1791250755\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 74,
     "content": "{\n  \"studio\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\"\n}"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"B5QTY55RORYO2A2R5X5NI6T4AGSHQ5QALY2U7DWKFGGTNG5HOXIQ\",\n  \"iat\": 1791250752,\n  \"iss\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\",\n  \"name\": \"ops\",\n  \"sub\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"BSBA3GDKAJOKQ4MOOS76XXYPAG7KQV2GKNMSILLY6UJAUUIYBQUA\",\n  \"iat\": 1791250752,\n  \"iss\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\",\n  \"name\": \"rund\",\n  \"sub\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"RUY5GDYUDU3K53Y6WHEKGHPLHRAUPU2J2JLWTEG4CHLBDXYVIXNA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\",\n  \"name\": \"studio\",\n  \"sub\": \"UCVSCBP4BKHJ26M46UHSLB26KCRT4WUOQDRGLI2IFBUO6EILLLWJOGEI\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"GZT44YX6K47G7FUSAREFKSTAKVJBVSKGUYTRU5UBLY5JTX2SAHZQ\",\n  \"iat\": 1791250752,\n  \"iss\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
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
     "size": 2946,
     "content": "{\n  \"manifest\": {\n    \"generation\": 3,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T05:39:15.371998+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n        \"signing\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n      },\n      \"GARM\": {\n        \"identity\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"signing\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      \"SYS\": {\n        \"identity\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n        \"signing\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"signing\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCVSCBP4BKHJ26M46UHSLB26KCRT4WUOQDRGLI2IFBUO6EILLLWJOGEI\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    ]\n  },\n  \"signer\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"signature\": \"06ef3aa792195f2c42666eaf11236871d5153c816c3dcc704d8df0374ce43acc80d07e2f8c4d4fef73b4696153355042fc19590c482d300a5d7a8502939bd204\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"AHOARQDQ7JXLEOXWF54JL5QPI7ZXNYGAUS4NEZAOCDHZXHH3MBOA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"name\": \"garm\",\n  \"sub\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 269,
     "content": "[\n  {\n    \"Name\": \"weather2.v1.WeatherService\",\n    \"Account\": \"TOOLS\",\n    \"Public\": \"UBUB23UI2KWSTNO2EMUARS2GIKUMXYML37TKTYZGOQYUUMQ3NUR4EUQO\",\n    \"At\": \"2026-10-06T05:39:15.371998+04:00\",\n    \"Kind\": \"retired\",\n    \"Why\": \"retired: no longer in the catalogue\"\n  }\n]"
    }
   ],
   "bus": {
    "server": "tls://127.0.0.1:64172",
    "accounts": [
     {
      "name": "CALLER-studio",
      "public": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4",
      "signing_keys": [
       "ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI",
      "signing_keys": [
       "AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN",
      "signing_keys": [
       "AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI",
      "signing_keys": [
       "ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL"
      ],
      "revocations": 1,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN",
      "public": "UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3",
      "issuer": "AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI",
      "public": "UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN",
      "issuer": "AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
      "account": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4",
      "public": "UCVSCBP4BKHJ26M46UHSLB26KCRT4WUOQDRGLI2IFBUO6EILLLWJOGEI",
      "issuer": "ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
      "account": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI",
      "public": "UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS",
      "issuer": "ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
      "account": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI",
      "public": "UBUB23UI2KWSTNO2EMUARS2GIKUMXYML37TKTYZGOQYUUMQ3NUR4EUQO",
      "issuer": "ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL",
      "tags": [
       "catalogue:f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a",
       "generation:2"
      ],
      "expires": "2027-10-06T01:39:14Z",
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
     "content": "ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR"
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
     "content": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4"
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
     "content": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI"
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
     "content": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN"
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
     "content": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI"
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
     "content": "{\n  \"jti\": \"AHOARQDQ7JXLEOXWF54JL5QPI7ZXNYGAUS4NEZAOCDHZXHH3MBOA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"name\": \"garm\",\n  \"sub\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 3601,
     "content": "{\n  \"manifest\": {\n    \"generation\": 4,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T05:39:16.682526+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n        \"signing\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n        \"signing\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n      },\n      \"GARM\": {\n        \"identity\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"signing\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      \"SYS\": {\n        \"identity\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n        \"signing\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"signing\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UAA56JGRU2AO6LIXRHAUIBWUYUQXHGSBPTDT3K2TXWLVM32ICZRG47YR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791250756,\n        \"signing_key\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCVSCBP4BKHJ26M46UHSLB26KCRT4WUOQDRGLI2IFBUO6EILLLWJOGEI\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    ]\n  },\n  \"signer\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"signature\": \"2d430b57f7b66dd2828ddeb33e2d724de9c9a986c943a9069a3c6015f3340fc48083126ea330aadbe9163807019941c3f51412a77fb78cdc051e723954e77c0e\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 2133,
     "content": "{\n  \"jti\": \"HYAZRH55TOUKJXF3ZWEF2IVVJSZY2Z3EM4UOG7KQJKYW57UPMGGQ\",\n  \"iat\": 1791250756,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR.\\u003e\",\n        \"account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJPS0FUWENMSkNHNk5TVFNPN1dBQjUyN1pKNUlUT002QUI0UzNOUE83MkVBQTdQU0tXU0tRIiwiaWF0IjoxNzkxMjUwNzU2LCJpc3MiOiJBQVVGTldVUUxEQVA1TVdRS1lQU1BCWEkzT1lMSDRTWEw1S0kzRlQzV0lXUVdYVUpLUURTRkUyQyIsInN1YiI6IkFEWkw3S0lWT09WR05LNUNSSk5RWFdOSEs2M09OT0s3UUhQVUtLNEFKVVBWTVNUUDYzRFk2UEdSIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURaTDdLSVZPT1ZHTks1Q1JKTlFYV05ISzYzT05PSzdRSFBVS0s0QUpVUFZNU1RQNjNEWTZQR1IuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.n1L4nq8K7K_sgnrIEOhKYAvDzvesOcMeY9rZKS_wfx5OC8VDUm6So30U-OKTDbMMk8VBULJqELMMrALjjaabBQ\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"H322WY5ZIS5JTOJ5FLK3FY4O6IBJH3SIVIWBTBCLLCUJPV3GD7OQ\",\n  \"iat\": 1791250756,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4.\\u003e\",\n        \"account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJGSEZDSDVDTkcyWkFZQ0c1NkhXRERONlRGMllXN0JLMlFQUk5MRTQ1Tzc2UkJRM1JUR0ZRIiwiaWF0IjoxNzkxMjUwNzU2LCJpc3MiOiJBQVVGTldVUUxEQVA1TVdRS1lQU1BCWEkzT1lMSDRTWEw1S0kzRlQzV0lXUVdYVUpLUURTRkUyQyIsInN1YiI6IkFCRkpITDVENjdIM0FIWVBaWEhDVkJENU9MWkRHR043UVpJRU9DVlAyWFY2RkM2RUhDRzZGUlM0IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUJGSkhMNUQ2N0gzQUhZUFpYSENWQkQ1T0xaREdHTjdRWklFT0NWUDJYVjZGQzZFSENHNkZSUzQuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.KhtEhWCEhNsyTT7t_QIVuf20S6U3DAD2MQ745zzKTsCFH-9_ktcbP2adIkO43vUMSvUqAwY-3EuZqSA_IwdZBw\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"W7SUCE6KTU5AHVAWCVURL4G2O7CAO3VPLNKCERE5LJYOK6MIGCTQ\",\n  \"iat\": 1791250756,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"GARM\",\n  \"sub\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJWRFFMSkNIT1o0WjM1UFlYQU9UQjZQSDNRUU5GTVFNUTVMWUhNU0dDMzJZWDQ1UzUySEpRIiwiaWF0IjoxNzkxMjUwNzU2LCJpc3MiOiJBQ1c0T0g0RFBHQ0FQSVNTM1ZaRjZETEI0TkFMVURQMzVTU1FaRVEzUlVRWEc3QVJVQjIyVFlVTCIsInN1YiI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQkRZWkVVRTZPWVc0QkVNTVBNREI0SVdBN05KUTJTVEs1T1ZYV1M0QURaUUFVQU9TUlRFT0pFSSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.RnFifeWMtsJqF8yV7KKgRGi-iSgdJv8ZEpTuddA1slJxCtpLfscWp34kGdiH3xQrkF3uZoTfIanYslxFatScBg\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"SN37X2N25IEWQZYAHHS5OZ3RGVXD7I3DSPWJGDRCZYDDKDET4YPQ\",\n  \"iat\": 1791250756,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"SYS\",\n  \"sub\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"PLARBUAZXTA2JOJQMMVEL67YB32LA27KY3SGGXWJG47WBNXARTAQ\",\n  \"iat\": 1791250756,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n  \"studio\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786756,\n  \"jti\": \"5QLV7XHTMD6FKMRM2J64F5LYJEYN6WEHAZB224ZJLJM7MF5EZ7VA\",\n  \"iat\": 1791250756,\n  \"iss\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\",\n  \"name\": \"batch\",\n  \"sub\": \"UAA56JGRU2AO6LIXRHAUIBWUYUQXHGSBPTDT3K2TXWLVM32ICZRG47YR\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:4\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"B5QTY55RORYO2A2R5X5NI6T4AGSHQ5QALY2U7DWKFGGTNG5HOXIQ\",\n  \"iat\": 1791250752,\n  \"iss\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\",\n  \"name\": \"ops\",\n  \"sub\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"BSBA3GDKAJOKQ4MOOS76XXYPAG7KQV2GKNMSILLY6UJAUUIYBQUA\",\n  \"iat\": 1791250752,\n  \"iss\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\",\n  \"name\": \"rund\",\n  \"sub\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"RUY5GDYUDU3K53Y6WHEKGHPLHRAUPU2J2JLWTEG4CHLBDXYVIXNA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\",\n  \"name\": \"studio\",\n  \"sub\": \"UCVSCBP4BKHJ26M46UHSLB26KCRT4WUOQDRGLI2IFBUO6EILLLWJOGEI\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"GZT44YX6K47G7FUSAREFKSTAKVJBVSKGUYTRU5UBLY5JTX2SAHZQ\",\n  \"iat\": 1791250752,\n  \"iss\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3601,
     "content": "{\n  \"manifest\": {\n    \"generation\": 4,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T05:39:16.682526+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n        \"signing\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n        \"signing\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n      },\n      \"GARM\": {\n        \"identity\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"signing\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      \"SYS\": {\n        \"identity\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n        \"signing\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"signing\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UAA56JGRU2AO6LIXRHAUIBWUYUQXHGSBPTDT3K2TXWLVM32ICZRG47YR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791250756,\n        \"signing_key\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCVSCBP4BKHJ26M46UHSLB26KCRT4WUOQDRGLI2IFBUO6EILLLWJOGEI\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    ]\n  },\n  \"signer\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"signature\": \"2d430b57f7b66dd2828ddeb33e2d724de9c9a986c943a9069a3c6015f3340fc48083126ea330aadbe9163807019941c3f51412a77fb78cdc051e723954e77c0e\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"AHOARQDQ7JXLEOXWF54JL5QPI7ZXNYGAUS4NEZAOCDHZXHH3MBOA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"name\": \"garm\",\n  \"sub\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:64172",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR",
      "signing_keys": [
       "ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "CALLER-studio",
      "public": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4",
      "signing_keys": [
       "ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI",
      "signing_keys": [
       "AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN",
      "signing_keys": [
       "AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI",
      "signing_keys": [
       "ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL"
      ],
      "revocations": 0,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR",
      "public": "UAA56JGRU2AO6LIXRHAUIBWUYUQXHGSBPTDT3K2TXWLVM32ICZRG47YR",
      "issuer": "ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:4"
      ],
      "expires": "2027-10-06T01:39:16Z",
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
      "account": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN",
      "public": "UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3",
      "issuer": "AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI",
      "public": "UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN",
      "issuer": "AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
      "account": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4",
      "public": "UCVSCBP4BKHJ26M46UHSLB26KCRT4WUOQDRGLI2IFBUO6EILLLWJOGEI",
      "issuer": "ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
      "account": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI",
      "public": "UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS",
      "issuer": "ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
   "stderr": "CALLER-studio: signing key retiring; the old key ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK is still listed -- roll the new credentials out, then run an issuance with --verify-live to retire it\n",
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
     "content": "ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR"
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
     "content": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4"
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
     "content": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI"
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
     "content": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN"
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
     "content": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI"
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
     "path": "ceremony/keys/archive/CALLER-studio.signing.ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK.nk",
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
     "content": "{\n  \"jti\": \"AHOARQDQ7JXLEOXWF54JL5QPI7ZXNYGAUS4NEZAOCDHZXHH3MBOA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"name\": \"garm\",\n  \"sub\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 3686,
     "content": "{\n  \"manifest\": {\n    \"generation\": 5,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T05:39:19.920205+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n        \"signing\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n        \"signing\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n        \"retiring\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n      },\n      \"GARM\": {\n        \"identity\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"signing\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      \"SYS\": {\n        \"identity\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n        \"signing\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"signing\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UAA56JGRU2AO6LIXRHAUIBWUYUQXHGSBPTDT3K2TXWLVM32ICZRG47YR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791250756,\n        \"signing_key\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCOFQD6Y5U6DYAIHLWFUW2K5HPTE7S5YCKSJ7O6I7LBNGU33X7KDROSO\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791250759,\n        \"signing_key\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n        \"reason\": \"rotation\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    ]\n  },\n  \"signer\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"signature\": \"81e13def09cb8ce213b8391d4c806f95f712c2bd0eebee163e0bc56fd7fd3ac086e71d4191fde1ecb959a33d525e036e3165d4a9dc17cfa5b0a9f3ea1526d90c\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2133,
     "content": "{\n  \"jti\": \"XPSYMN5YYE6HVYJBEUF3SQGAFQ7EO3XD6NAA25O3BYVJR6TC42TQ\",\n  \"iat\": 1791250759,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR.\\u003e\",\n        \"account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJXWlNITkVXTTNJRlFXQ0tYR1lBN0o2U1pWNFE1WUpFQlpDRUJPS0w0SzVTUTIyTkZQSzdRIiwiaWF0IjoxNzkxMjUwNzU5LCJpc3MiOiJBQVVGTldVUUxEQVA1TVdRS1lQU1BCWEkzT1lMSDRTWEw1S0kzRlQzV0lXUVdYVUpLUURTRkUyQyIsInN1YiI6IkFEWkw3S0lWT09WR05LNUNSSk5RWFdOSEs2M09OT0s3UUhQVUtLNEFKVVBWTVNUUDYzRFk2UEdSIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURaTDdLSVZPT1ZHTks1Q1JKTlFYV05ISzYzT05PSzdRSFBVS0s0QUpVUFZNU1RQNjNEWTZQR1IuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.y44d6euKKVAm77sPTtV9_JwV8mCaWq5WlMWh-HOvz-SbcXqz1jP-spwphKLlZsQGgm3WxexsQ1GKY8uGMhqDCQ\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2213,
     "content": "{\n  \"jti\": \"ZWKDALJZDQLJKRK6NDKUQG3YADLNWODKTTF2LLRQBVZ2NTNDFCCA\",\n  \"iat\": 1791250759,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4.\\u003e\",\n        \"account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJSQUpXRlZNWDVIQ1hXM1A1M0pUUFZOQzVJS0pBVURDQllBRlNWU1RCU1FVUllFTFdYQ0FRIiwiaWF0IjoxNzkxMjUwNzU5LCJpc3MiOiJBQVVGTldVUUxEQVA1TVdRS1lQU1BCWEkzT1lMSDRTWEw1S0kzRlQzV0lXUVdYVUpLUURTRkUyQyIsInN1YiI6IkFCRkpITDVENjdIM0FIWVBaWEhDVkJENU9MWkRHR043UVpJRU9DVlAyWFY2RkM2RUhDRzZGUlM0IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUJGSkhMNUQ2N0gzQUhZUFpYSENWQkQ1T0xaREdHTjdRWklFT0NWUDJYVjZGQzZFSENHNkZSUzQuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.tk5H0cHi0CjegKA9PpZSEw30kaDBp7XlI7GzyN9uAo8ZT1K4oc3VxVcKMpf4tNDec6YRzhKdKWMqh5b_tGXaCg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n      \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"YRS6BQCLVDG2C2PVMO4ORBEAYWLAHNJ66CW4RSSHG3TH2QD6OCKA\",\n  \"iat\": 1791250759,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"GARM\",\n  \"sub\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJHVTYzTFhDMzdJS0JHMk1QWVQ3REdNM0FPUEtIV1NOTktNMkU0RkFPQlA2RFA1WVdJUUVRIiwiaWF0IjoxNzkxMjUwNzU5LCJpc3MiOiJBQ1c0T0g0RFBHQ0FQSVNTM1ZaRjZETEI0TkFMVURQMzVTU1FaRVEzUlVRWEc3QVJVQjIyVFlVTCIsInN1YiI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQkRZWkVVRTZPWVc0QkVNTVBNREI0SVdBN05KUTJTVEs1T1ZYV1M0QURaUUFVQU9TUlRFT0pFSSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.DiWnQR7r_CGCNm10K_WAAT7tHgaiH9GgT29I8-UhAjJcmKy-I5-6hHg3xbvJD5n6St8koT2A_i567lq9oM2qAg\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"73U2PJQIJVCWG5OOTU2BVRMBZ27C4HAQASMRPZDQ42EFXB6KI2MA\",\n  \"iat\": 1791250759,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"SYS\",\n  \"sub\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"CEYO7ZRFAVB5P5XL2X7CJMROD26HL5RITSB3I4NDG5F5TGIPVCQQ\",\n  \"iat\": 1791250759,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n  \"studio\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786756,\n  \"jti\": \"5QLV7XHTMD6FKMRM2J64F5LYJEYN6WEHAZB224ZJLJM7MF5EZ7VA\",\n  \"iat\": 1791250756,\n  \"iss\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\",\n  \"name\": \"batch\",\n  \"sub\": \"UAA56JGRU2AO6LIXRHAUIBWUYUQXHGSBPTDT3K2TXWLVM32ICZRG47YR\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:4\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"B5QTY55RORYO2A2R5X5NI6T4AGSHQ5QALY2U7DWKFGGTNG5HOXIQ\",\n  \"iat\": 1791250752,\n  \"iss\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\",\n  \"name\": \"ops\",\n  \"sub\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"BSBA3GDKAJOKQ4MOOS76XXYPAG7KQV2GKNMSILLY6UJAUUIYBQUA\",\n  \"iat\": 1791250752,\n  \"iss\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\",\n  \"name\": \"rund\",\n  \"sub\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "changed",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786759,\n  \"jti\": \"NRHWXKKJWBHPUC2CNKUR635F42SFHLA3TUXO6QBBPR3VUYTBWZCQ\",\n  \"iat\": 1791250759,\n  \"iss\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n  \"name\": \"studio\",\n  \"sub\": \"UCOFQD6Y5U6DYAIHLWFUW2K5HPTE7S5YCKSJ7O6I7LBNGU33X7KDROSO\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"GZT44YX6K47G7FUSAREFKSTAKVJBVSKGUYTRU5UBLY5JTX2SAHZQ\",\n  \"iat\": 1791250752,\n  \"iss\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3686,
     "content": "{\n  \"manifest\": {\n    \"generation\": 5,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T05:39:19.920205+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n        \"signing\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n        \"signing\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n        \"retiring\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n      },\n      \"GARM\": {\n        \"identity\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"signing\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      \"SYS\": {\n        \"identity\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n        \"signing\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"signing\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UAA56JGRU2AO6LIXRHAUIBWUYUQXHGSBPTDT3K2TXWLVM32ICZRG47YR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791250756,\n        \"signing_key\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCOFQD6Y5U6DYAIHLWFUW2K5HPTE7S5YCKSJ7O6I7LBNGU33X7KDROSO\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791250759,\n        \"signing_key\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n        \"reason\": \"rotation\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    ]\n  },\n  \"signer\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"signature\": \"81e13def09cb8ce213b8391d4c806f95f712c2bd0eebee163e0bc56fd7fd3ac086e71d4191fde1ecb959a33d525e036e3165d4a9dc17cfa5b0a9f3ea1526d90c\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"AHOARQDQ7JXLEOXWF54JL5QPI7ZXNYGAUS4NEZAOCDHZXHH3MBOA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"name\": \"garm\",\n  \"sub\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:64172",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR",
      "signing_keys": [
       "ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "CALLER-studio",
      "public": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4",
      "signing_keys": [
       "ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK",
       "ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI",
      "signing_keys": [
       "AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN",
      "signing_keys": [
       "AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI",
      "signing_keys": [
       "ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL"
      ],
      "revocations": 0,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR",
      "public": "UAA56JGRU2AO6LIXRHAUIBWUYUQXHGSBPTDT3K2TXWLVM32ICZRG47YR",
      "issuer": "ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:4"
      ],
      "expires": "2027-10-06T01:39:16Z",
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
      "account": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN",
      "public": "UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3",
      "issuer": "AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI",
      "public": "UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN",
      "issuer": "AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
      "account": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4",
      "public": "UCOFQD6Y5U6DYAIHLWFUW2K5HPTE7S5YCKSJ7O6I7LBNGU33X7KDROSO",
      "issuer": "ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:5"
      ],
      "expires": "2027-10-06T01:39:19Z",
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
      "account": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI",
      "public": "UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS",
      "issuer": "ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
      "account": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4",
      "public": "UCVSCBP4BKHJ26M46UHSLB26KCRT4WUOQDRGLI2IFBUO6EILLLWJOGEI",
      "issuer": "ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
   "error": "--verify-live: CALLER-studio's retiring key ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK still signs 1 live connection(s): studio-old -- roll them out first",
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
     "content": "ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR"
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
     "content": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4"
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
     "content": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI"
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
     "content": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN"
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
     "content": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI"
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
     "path": "ceremony/keys/archive/CALLER-studio.signing.ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK.nk",
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
     "content": "{\n  \"jti\": \"AHOARQDQ7JXLEOXWF54JL5QPI7ZXNYGAUS4NEZAOCDHZXHH3MBOA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"name\": \"garm\",\n  \"sub\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 3686,
     "content": "{\n  \"manifest\": {\n    \"generation\": 5,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T05:39:19.920205+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n        \"signing\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n        \"signing\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n        \"retiring\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n      },\n      \"GARM\": {\n        \"identity\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"signing\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      \"SYS\": {\n        \"identity\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n        \"signing\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"signing\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UAA56JGRU2AO6LIXRHAUIBWUYUQXHGSBPTDT3K2TXWLVM32ICZRG47YR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791250756,\n        \"signing_key\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCOFQD6Y5U6DYAIHLWFUW2K5HPTE7S5YCKSJ7O6I7LBNGU33X7KDROSO\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791250759,\n        \"signing_key\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n        \"reason\": \"rotation\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    ]\n  },\n  \"signer\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"signature\": \"81e13def09cb8ce213b8391d4c806f95f712c2bd0eebee163e0bc56fd7fd3ac086e71d4191fde1ecb959a33d525e036e3165d4a9dc17cfa5b0a9f3ea1526d90c\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2133,
     "content": "{\n  \"jti\": \"XPSYMN5YYE6HVYJBEUF3SQGAFQ7EO3XD6NAA25O3BYVJR6TC42TQ\",\n  \"iat\": 1791250759,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR.\\u003e\",\n        \"account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJXWlNITkVXTTNJRlFXQ0tYR1lBN0o2U1pWNFE1WUpFQlpDRUJPS0w0SzVTUTIyTkZQSzdRIiwiaWF0IjoxNzkxMjUwNzU5LCJpc3MiOiJBQVVGTldVUUxEQVA1TVdRS1lQU1BCWEkzT1lMSDRTWEw1S0kzRlQzV0lXUVdYVUpLUURTRkUyQyIsInN1YiI6IkFEWkw3S0lWT09WR05LNUNSSk5RWFdOSEs2M09OT0s3UUhQVUtLNEFKVVBWTVNUUDYzRFk2UEdSIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURaTDdLSVZPT1ZHTks1Q1JKTlFYV05ISzYzT05PSzdRSFBVS0s0QUpVUFZNU1RQNjNEWTZQR1IuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.y44d6euKKVAm77sPTtV9_JwV8mCaWq5WlMWh-HOvz-SbcXqz1jP-spwphKLlZsQGgm3WxexsQ1GKY8uGMhqDCQ\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2213,
     "content": "{\n  \"jti\": \"ZWKDALJZDQLJKRK6NDKUQG3YADLNWODKTTF2LLRQBVZ2NTNDFCCA\",\n  \"iat\": 1791250759,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4.\\u003e\",\n        \"account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJSQUpXRlZNWDVIQ1hXM1A1M0pUUFZOQzVJS0pBVURDQllBRlNWU1RCU1FVUllFTFdYQ0FRIiwiaWF0IjoxNzkxMjUwNzU5LCJpc3MiOiJBQVVGTldVUUxEQVA1TVdRS1lQU1BCWEkzT1lMSDRTWEw1S0kzRlQzV0lXUVdYVUpLUURTRkUyQyIsInN1YiI6IkFCRkpITDVENjdIM0FIWVBaWEhDVkJENU9MWkRHR043UVpJRU9DVlAyWFY2RkM2RUhDRzZGUlM0IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUJGSkhMNUQ2N0gzQUhZUFpYSENWQkQ1T0xaREdHTjdRWklFT0NWUDJYVjZGQzZFSENHNkZSUzQuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.tk5H0cHi0CjegKA9PpZSEw30kaDBp7XlI7GzyN9uAo8ZT1K4oc3VxVcKMpf4tNDec6YRzhKdKWMqh5b_tGXaCg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n      \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"YRS6BQCLVDG2C2PVMO4ORBEAYWLAHNJ66CW4RSSHG3TH2QD6OCKA\",\n  \"iat\": 1791250759,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"GARM\",\n  \"sub\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJHVTYzTFhDMzdJS0JHMk1QWVQ3REdNM0FPUEtIV1NOTktNMkU0RkFPQlA2RFA1WVdJUUVRIiwiaWF0IjoxNzkxMjUwNzU5LCJpc3MiOiJBQ1c0T0g0RFBHQ0FQSVNTM1ZaRjZETEI0TkFMVURQMzVTU1FaRVEzUlVRWEc3QVJVQjIyVFlVTCIsInN1YiI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQkRZWkVVRTZPWVc0QkVNTVBNREI0SVdBN05KUTJTVEs1T1ZYV1M0QURaUUFVQU9TUlRFT0pFSSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.DiWnQR7r_CGCNm10K_WAAT7tHgaiH9GgT29I8-UhAjJcmKy-I5-6hHg3xbvJD5n6St8koT2A_i567lq9oM2qAg\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"73U2PJQIJVCWG5OOTU2BVRMBZ27C4HAQASMRPZDQ42EFXB6KI2MA\",\n  \"iat\": 1791250759,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"SYS\",\n  \"sub\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"CEYO7ZRFAVB5P5XL2X7CJMROD26HL5RITSB3I4NDG5F5TGIPVCQQ\",\n  \"iat\": 1791250759,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n  \"studio\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786756,\n  \"jti\": \"5QLV7XHTMD6FKMRM2J64F5LYJEYN6WEHAZB224ZJLJM7MF5EZ7VA\",\n  \"iat\": 1791250756,\n  \"iss\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\",\n  \"name\": \"batch\",\n  \"sub\": \"UAA56JGRU2AO6LIXRHAUIBWUYUQXHGSBPTDT3K2TXWLVM32ICZRG47YR\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:4\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"B5QTY55RORYO2A2R5X5NI6T4AGSHQ5QALY2U7DWKFGGTNG5HOXIQ\",\n  \"iat\": 1791250752,\n  \"iss\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\",\n  \"name\": \"ops\",\n  \"sub\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"BSBA3GDKAJOKQ4MOOS76XXYPAG7KQV2GKNMSILLY6UJAUUIYBQUA\",\n  \"iat\": 1791250752,\n  \"iss\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\",\n  \"name\": \"rund\",\n  \"sub\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786759,\n  \"jti\": \"NRHWXKKJWBHPUC2CNKUR635F42SFHLA3TUXO6QBBPR3VUYTBWZCQ\",\n  \"iat\": 1791250759,\n  \"iss\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n  \"name\": \"studio\",\n  \"sub\": \"UCOFQD6Y5U6DYAIHLWFUW2K5HPTE7S5YCKSJ7O6I7LBNGU33X7KDROSO\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"GZT44YX6K47G7FUSAREFKSTAKVJBVSKGUYTRU5UBLY5JTX2SAHZQ\",\n  \"iat\": 1791250752,\n  \"iss\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 3686,
     "content": "{\n  \"manifest\": {\n    \"generation\": 5,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T05:39:19.920205+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n        \"signing\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n        \"signing\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n        \"retiring\": \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\"\n      },\n      \"GARM\": {\n        \"identity\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"signing\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      \"SYS\": {\n        \"identity\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n        \"signing\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"signing\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UAA56JGRU2AO6LIXRHAUIBWUYUQXHGSBPTDT3K2TXWLVM32ICZRG47YR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791250756,\n        \"signing_key\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCOFQD6Y5U6DYAIHLWFUW2K5HPTE7S5YCKSJ7O6I7LBNGU33X7KDROSO\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791250759,\n        \"signing_key\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n        \"reason\": \"rotation\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    ]\n  },\n  \"signer\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"signature\": \"81e13def09cb8ce213b8391d4c806f95f712c2bd0eebee163e0bc56fd7fd3ac086e71d4191fde1ecb959a33d525e036e3165d4a9dc17cfa5b0a9f3ea1526d90c\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"AHOARQDQ7JXLEOXWF54JL5QPI7ZXNYGAUS4NEZAOCDHZXHH3MBOA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"name\": \"garm\",\n  \"sub\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:64172",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR",
      "signing_keys": [
       "ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "CALLER-studio",
      "public": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4",
      "signing_keys": [
       "ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK",
       "ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "GARM",
      "public": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI",
      "signing_keys": [
       "AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "SYS",
      "public": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN",
      "signing_keys": [
       "AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "TOOLS",
      "public": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI",
      "signing_keys": [
       "ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL"
      ],
      "revocations": 0,
      "pushed": false
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR",
      "public": "UAA56JGRU2AO6LIXRHAUIBWUYUQXHGSBPTDT3K2TXWLVM32ICZRG47YR",
      "issuer": "ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:4"
      ],
      "expires": "2027-10-06T01:39:16Z",
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
      "account": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN",
      "public": "UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3",
      "issuer": "AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI",
      "public": "UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN",
      "issuer": "AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
      "account": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4",
      "public": "UCOFQD6Y5U6DYAIHLWFUW2K5HPTE7S5YCKSJ7O6I7LBNGU33X7KDROSO",
      "issuer": "ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:5"
      ],
      "expires": "2027-10-06T01:39:19Z",
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
      "account": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI",
      "public": "UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS",
      "issuer": "ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
      "account": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4",
      "public": "UCVSCBP4BKHJ26M46UHSLB26KCRT4WUOQDRGLI2IFBUO6EILLLWJOGEI",
      "issuer": "ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
   "stdout": "CALLER-studio: retired signing key ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK; every credential it signed is now refused\nok: generation 6 from catalogue 24164e3e783d -- 5 accounts, 0 credentials, 0 revocations, written to topo\n",
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
     "content": "ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR"
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
     "content": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4"
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
     "content": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI"
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
     "content": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN"
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
     "content": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI"
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
     "path": "ceremony/keys/archive/CALLER-studio.signing.ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK.nk",
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
     "content": "{\n  \"jti\": \"AHOARQDQ7JXLEOXWF54JL5QPI7ZXNYGAUS4NEZAOCDHZXHH3MBOA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"name\": \"garm\",\n  \"sub\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 3680,
     "content": "{\n  \"manifest\": {\n    \"generation\": 6,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T05:39:26.687254+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n        \"signing\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n        \"signing\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n        \"retired\": {\n          \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\": 6\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"signing\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      \"SYS\": {\n        \"identity\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n        \"signing\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"signing\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UAA56JGRU2AO6LIXRHAUIBWUYUQXHGSBPTDT3K2TXWLVM32ICZRG47YR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791250756,\n        \"signing_key\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCOFQD6Y5U6DYAIHLWFUW2K5HPTE7S5YCKSJ7O6I7LBNGU33X7KDROSO\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791250759,\n        \"signing_key\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    ]\n  },\n  \"signer\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"signature\": \"26277d7fb47c041cdad65d3f3fb7abd74883ee7e87dd84181634abeb217149f21358d2fa99b819c252d56e9ecb245fc696e1503dbbe3912d43ba4475f67c8806\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2133,
     "content": "{\n  \"jti\": \"A6FTRSV42EOTTDNJVHSNDDELCH2PLBPBMULE7O5PBKDO3WY5FD4A\",\n  \"iat\": 1791250766,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR.\\u003e\",\n        \"account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiIyUldZVlhHSEEzU0NDTElaUVFHUk1YM00zTFoyMlFLVlBaV01BRUpRRVE2WU5ENlFNNTZBIiwiaWF0IjoxNzkxMjUwNzY2LCJpc3MiOiJBQVVGTldVUUxEQVA1TVdRS1lQU1BCWEkzT1lMSDRTWEw1S0kzRlQzV0lXUVdYVUpLUURTRkUyQyIsInN1YiI6IkFEWkw3S0lWT09WR05LNUNSSk5RWFdOSEs2M09OT0s3UUhQVUtLNEFKVVBWTVNUUDYzRFk2UEdSIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURaTDdLSVZPT1ZHTks1Q1JKTlFYV05ISzYzT05PSzdRSFBVS0s0QUpVUFZNU1RQNjNEWTZQR1IuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.mIAMNBHyCYkrqCOVZvBZuIAr_T3MALQW4A6sTEkcf682TjHeJGkhjLUNlJTqUeZBXToMmYcLIggsTNJi3wf_Cg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"5JS4XLRA5L3AFW6Q3DI26EJ2Y2SZV4ND3E3JLXEQHYILYLH3YHMA\",\n  \"iat\": 1791250766,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4.\\u003e\",\n        \"account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiI1RUUzUUg0RUJINVNRSDZPWTZPRjdEN0xHR1hBUTJSRldLMlE1RERWTUs2UE1VT082R1JBIiwiaWF0IjoxNzkxMjUwNzY2LCJpc3MiOiJBQVVGTldVUUxEQVA1TVdRS1lQU1BCWEkzT1lMSDRTWEw1S0kzRlQzV0lXUVdYVUpLUURTRkUyQyIsInN1YiI6IkFCRkpITDVENjdIM0FIWVBaWEhDVkJENU9MWkRHR043UVpJRU9DVlAyWFY2RkM2RUhDRzZGUlM0IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUJGSkhMNUQ2N0gzQUhZUFpYSENWQkQ1T0xaREdHTjdRWklFT0NWUDJYVjZGQzZFSENHNkZSUzQuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.B41nyBsSWsjITCdL3-j4QI7UU36FwF4FEunUcrlLG875WGOmPRdaCm-fHgi9iJ3ZWSjCCp7vXejR0O1qlAKuBw\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"XYAZ6UNV4CFSQZ22SXYA2KJQNDCPAG6EAEOIVAJB5WCXDAVYWDSQ\",\n  \"iat\": 1791250766,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"GARM\",\n  \"sub\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJLUUlEMjNHSzZUR0pLUDZSNjJBQ1VXMzRSWUtFNjVQRzNFWFBQQTZLM1paSFFDWjJCTDJRIiwiaWF0IjoxNzkxMjUwNzY2LCJpc3MiOiJBQ1c0T0g0RFBHQ0FQSVNTM1ZaRjZETEI0TkFMVURQMzVTU1FaRVEzUlVRWEc3QVJVQjIyVFlVTCIsInN1YiI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQkRZWkVVRTZPWVc0QkVNTVBNREI0SVdBN05KUTJTVEs1T1ZYV1M0QURaUUFVQU9TUlRFT0pFSSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.jpgzMgfPiAergw7UtNR-wkn1jnFgOq71WxkgPUQ1b0o6_vaPmKmL7RQkKt51Apq-0eiz8YpSB6FU6tBnjXtDDQ\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"HI7ZERPPYD2YLDFCJDZ5R6VEFYAGZKARJK4BYKHC6TQQE5WSEDYQ\",\n  \"iat\": 1791250766,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"SYS\",\n  \"sub\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"NDAJFMVF2M4ASQBUZHUUEAH6THD76T2DHKCZPL5ZUO3KB4ZNAC4A\",\n  \"iat\": 1791250766,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n  \"studio\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786756,\n  \"jti\": \"5QLV7XHTMD6FKMRM2J64F5LYJEYN6WEHAZB224ZJLJM7MF5EZ7VA\",\n  \"iat\": 1791250756,\n  \"iss\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\",\n  \"name\": \"batch\",\n  \"sub\": \"UAA56JGRU2AO6LIXRHAUIBWUYUQXHGSBPTDT3K2TXWLVM32ICZRG47YR\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:4\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"B5QTY55RORYO2A2R5X5NI6T4AGSHQ5QALY2U7DWKFGGTNG5HOXIQ\",\n  \"iat\": 1791250752,\n  \"iss\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\",\n  \"name\": \"ops\",\n  \"sub\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"BSBA3GDKAJOKQ4MOOS76XXYPAG7KQV2GKNMSILLY6UJAUUIYBQUA\",\n  \"iat\": 1791250752,\n  \"iss\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\",\n  \"name\": \"rund\",\n  \"sub\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786759,\n  \"jti\": \"NRHWXKKJWBHPUC2CNKUR635F42SFHLA3TUXO6QBBPR3VUYTBWZCQ\",\n  \"iat\": 1791250759,\n  \"iss\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n  \"name\": \"studio\",\n  \"sub\": \"UCOFQD6Y5U6DYAIHLWFUW2K5HPTE7S5YCKSJ7O6I7LBNGU33X7KDROSO\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"GZT44YX6K47G7FUSAREFKSTAKVJBVSKGUYTRU5UBLY5JTX2SAHZQ\",\n  \"iat\": 1791250752,\n  \"iss\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3680,
     "content": "{\n  \"manifest\": {\n    \"generation\": 6,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T05:39:26.687254+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n        \"signing\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n        \"signing\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n        \"retired\": {\n          \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\": 6\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"signing\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      \"SYS\": {\n        \"identity\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n        \"signing\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"signing\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UAA56JGRU2AO6LIXRHAUIBWUYUQXHGSBPTDT3K2TXWLVM32ICZRG47YR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791250756,\n        \"signing_key\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCOFQD6Y5U6DYAIHLWFUW2K5HPTE7S5YCKSJ7O6I7LBNGU33X7KDROSO\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791250759,\n        \"signing_key\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    ]\n  },\n  \"signer\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"signature\": \"26277d7fb47c041cdad65d3f3fb7abd74883ee7e87dd84181634abeb217149f21358d2fa99b819c252d56e9ecb245fc696e1503dbbe3912d43ba4475f67c8806\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"AHOARQDQ7JXLEOXWF54JL5QPI7ZXNYGAUS4NEZAOCDHZXHH3MBOA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"name\": \"garm\",\n  \"sub\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:64172",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR",
      "signing_keys": [
       "ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "CALLER-studio",
      "public": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4",
      "signing_keys": [
       "ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI",
      "signing_keys": [
       "AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN",
      "signing_keys": [
       "AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI",
      "signing_keys": [
       "ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL"
      ],
      "revocations": 0,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR",
      "public": "UAA56JGRU2AO6LIXRHAUIBWUYUQXHGSBPTDT3K2TXWLVM32ICZRG47YR",
      "issuer": "ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:4"
      ],
      "expires": "2027-10-06T01:39:16Z",
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
      "account": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN",
      "public": "UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3",
      "issuer": "AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI",
      "public": "UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN",
      "issuer": "AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
      "account": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4",
      "public": "UCOFQD6Y5U6DYAIHLWFUW2K5HPTE7S5YCKSJ7O6I7LBNGU33X7KDROSO",
      "issuer": "ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:5"
      ],
      "expires": "2027-10-06T01:39:19Z",
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
      "account": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI",
      "public": "UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS",
      "issuer": "ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
      "account": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4",
      "public": "UCVSCBP4BKHJ26M46UHSLB26KCRT4WUOQDRGLI2IFBUO6EILLLWJOGEI",
      "issuer": "ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
     "content": "ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR"
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
     "content": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4"
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
     "content": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI"
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
     "content": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN"
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
     "content": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI"
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
     "path": "ceremony/keys/archive/CALLER-studio.signing.ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK.nk",
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
     "content": "{\n  \"jti\": \"AHOARQDQ7JXLEOXWF54JL5QPI7ZXNYGAUS4NEZAOCDHZXHH3MBOA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"name\": \"garm\",\n  \"sub\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 3710,
     "content": "{\n  \"manifest\": {\n    \"generation\": 7,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T05:39:27.956529+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n        \"signing\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n        \"signing\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n        \"retired\": {\n          \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\": 6\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"signing\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      \"SYS\": {\n        \"identity\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n        \"signing\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"signing\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UCL5IEMJ6NUH5W2AVJJKPETUAITAF3XYXZ4NFGECGPEU4PBQ3T4C7MJ3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 7,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791250767,\n        \"signing_key\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\",\n        \"reason\": \"reissued\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCOFQD6Y5U6DYAIHLWFUW2K5HPTE7S5YCKSJ7O6I7LBNGU33X7KDROSO\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791250759,\n        \"signing_key\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    ]\n  },\n  \"signer\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"signature\": \"be6bcd13398988dd0c67d1f52f921805874fb600fa543efd22b4ba8944720a666d3b536a462b17c2375b40e7bcb89db6a78ae420ab2de01a313a6d1d83541b07\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2248,
     "content": "{\n  \"jti\": \"2NAJGTKE4JICS7PK6LBDYL2SCZH5AJDB32FJOCSYUVAQTITKVH7A\",\n  \"iat\": 1791250767,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR.\\u003e\",\n        \"account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJZT1BZQURUS1VMMjYyNjVBNlpOMlNHWlJNVE5RTzY3MkZKWUdOQ0RKQlZHUjdLVDRRQjNBIiwiaWF0IjoxNzkxMjUwNzY3LCJpc3MiOiJBQVVGTldVUUxEQVA1TVdRS1lQU1BCWEkzT1lMSDRTWEw1S0kzRlQzV0lXUVdYVUpLUURTRkUyQyIsInN1YiI6IkFEWkw3S0lWT09WR05LNUNSSk5RWFdOSEs2M09OT0s3UUhQVUtLNEFKVVBWTVNUUDYzRFk2UEdSIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURaTDdLSVZPT1ZHTks1Q1JKTlFYV05ISzYzT05PSzdRSFBVS0s0QUpVUFZNU1RQNjNEWTZQR1IuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.CN3SO0-TRgQEsjuqd_3dfaTULm7G7ZP0LI19G04hTpLNxq04uYF8jmEBW-7405zWO1648Oql43YHnayFpKovAg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n    ],\n    \"revocations\": {\n      \"UAA56JGRU2AO6LIXRHAUIBWUYUQXHGSBPTDT3K2TXWLVM32ICZRG47YR\": 1791250767\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"D476L4YKDGD3P5NWZAFEOCJMH3ZPF4TPPHFYAJFVPE3DN7QOG2XA\",\n  \"iat\": 1791250767,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4.\\u003e\",\n        \"account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiI0Q0FINzVYTlFRN1ZWWkMyUVpNVEk1Rk4yUzZNWE1NSjdQN1RPR1ZXS1VQN1o0N1hXTTZBIiwiaWF0IjoxNzkxMjUwNzY3LCJpc3MiOiJBQVVGTldVUUxEQVA1TVdRS1lQU1BCWEkzT1lMSDRTWEw1S0kzRlQzV0lXUVdYVUpLUURTRkUyQyIsInN1YiI6IkFCRkpITDVENjdIM0FIWVBaWEhDVkJENU9MWkRHR043UVpJRU9DVlAyWFY2RkM2RUhDRzZGUlM0IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUJGSkhMNUQ2N0gzQUhZUFpYSENWQkQ1T0xaREdHTjdRWklFT0NWUDJYVjZGQzZFSENHNkZSUzQuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.Rgheh4dVeViu8tvyqyyJDl8jl1aKvqCcKZDAA49ejiuurwwtbA6siG5PixkuDe1q4kEdwSRgrpk66nXUit7EDQ\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"C6DRLVTTPA7LKG3Z7DEO3CYHRGIHMLQGPCZ2Y6HTH5ODJPR3F36Q\",\n  \"iat\": 1791250767,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"GARM\",\n  \"sub\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJLUjNZWEVPUUpQS1NHQlpBM0lVSU1OU00yRldRM0hBVEg3TFhRSVRSNVdMNEJPMkVVNEFBIiwiaWF0IjoxNzkxMjUwNzY3LCJpc3MiOiJBQ1c0T0g0RFBHQ0FQSVNTM1ZaRjZETEI0TkFMVURQMzVTU1FaRVEzUlVRWEc3QVJVQjIyVFlVTCIsInN1YiI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQkRZWkVVRTZPWVc0QkVNTVBNREI0SVdBN05KUTJTVEs1T1ZYV1M0QURaUUFVQU9TUlRFT0pFSSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.c-vWStLm0IlsuO7o-nb2Hlv7p-TJQMwqkbp7v7z49wdgsKzfBfaZuJZzCI1P8lH_o21qBVwEzUzlC0MhNHgLBg\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"ZIDHZCYISVZYRTPMCLQVYYISZ7NULC4M4IAGT43ILYKYUC3WLBVQ\",\n  \"iat\": 1791250767,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"SYS\",\n  \"sub\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"OKOIWY3JAWLPJ5M4XAEI7EYPPDIGY6W3SK3AOBYMSX2FQLC2BHEA\",\n  \"iat\": 1791250767,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n  \"studio\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "changed",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786767,\n  \"jti\": \"FLVACDZBXW36EXCTAXRT3D3K6KMCOQPFUMQKEWPNS4EB37P7IRUQ\",\n  \"iat\": 1791250767,\n  \"iss\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\",\n  \"name\": \"batch\",\n  \"sub\": \"UCL5IEMJ6NUH5W2AVJJKPETUAITAF3XYXZ4NFGECGPEU4PBQ3T4C7MJ3\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:7\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"B5QTY55RORYO2A2R5X5NI6T4AGSHQ5QALY2U7DWKFGGTNG5HOXIQ\",\n  \"iat\": 1791250752,\n  \"iss\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\",\n  \"name\": \"ops\",\n  \"sub\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"BSBA3GDKAJOKQ4MOOS76XXYPAG7KQV2GKNMSILLY6UJAUUIYBQUA\",\n  \"iat\": 1791250752,\n  \"iss\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\",\n  \"name\": \"rund\",\n  \"sub\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786759,\n  \"jti\": \"NRHWXKKJWBHPUC2CNKUR635F42SFHLA3TUXO6QBBPR3VUYTBWZCQ\",\n  \"iat\": 1791250759,\n  \"iss\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n  \"name\": \"studio\",\n  \"sub\": \"UCOFQD6Y5U6DYAIHLWFUW2K5HPTE7S5YCKSJ7O6I7LBNGU33X7KDROSO\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"GZT44YX6K47G7FUSAREFKSTAKVJBVSKGUYTRU5UBLY5JTX2SAHZQ\",\n  \"iat\": 1791250752,\n  \"iss\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3710,
     "content": "{\n  \"manifest\": {\n    \"generation\": 7,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T05:39:27.956529+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n        \"signing\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n        \"signing\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n        \"retired\": {\n          \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\": 6\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"signing\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      \"SYS\": {\n        \"identity\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n        \"signing\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"signing\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UCL5IEMJ6NUH5W2AVJJKPETUAITAF3XYXZ4NFGECGPEU4PBQ3T4C7MJ3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 7,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791250767,\n        \"signing_key\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\",\n        \"reason\": \"reissued\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCOFQD6Y5U6DYAIHLWFUW2K5HPTE7S5YCKSJ7O6I7LBNGU33X7KDROSO\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791250759,\n        \"signing_key\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    ]\n  },\n  \"signer\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"signature\": \"be6bcd13398988dd0c67d1f52f921805874fb600fa543efd22b4ba8944720a666d3b536a462b17c2375b40e7bcb89db6a78ae420ab2de01a313a6d1d83541b07\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"AHOARQDQ7JXLEOXWF54JL5QPI7ZXNYGAUS4NEZAOCDHZXHH3MBOA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"name\": \"garm\",\n  \"sub\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 249,
     "content": "[\n  {\n    \"Name\": \"batch\",\n    \"Account\": \"CALLER-batch\",\n    \"Public\": \"UAA56JGRU2AO6LIXRHAUIBWUYUQXHGSBPTDT3K2TXWLVM32ICZRG47YR\",\n    \"At\": \"2026-10-06T05:39:27.956529+04:00\",\n    \"Kind\": \"superseded\",\n    \"Why\": \"superseded by generation 7\"\n  }\n]"
    }
   ],
   "bus": {
    "server": "tls://127.0.0.1:64172",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR",
      "signing_keys": [
       "ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT"
      ],
      "revocations": 1,
      "pushed": true
     },
     {
      "name": "CALLER-studio",
      "public": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4",
      "signing_keys": [
       "ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI",
      "signing_keys": [
       "AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN",
      "signing_keys": [
       "AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI",
      "signing_keys": [
       "ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL"
      ],
      "revocations": 0,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR",
      "public": "UCL5IEMJ6NUH5W2AVJJKPETUAITAF3XYXZ4NFGECGPEU4PBQ3T4C7MJ3",
      "issuer": "ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:7"
      ],
      "expires": "2027-10-06T01:39:27Z",
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
      "account": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN",
      "public": "UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3",
      "issuer": "AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI",
      "public": "UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN",
      "issuer": "AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
      "account": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4",
      "public": "UCOFQD6Y5U6DYAIHLWFUW2K5HPTE7S5YCKSJ7O6I7LBNGU33X7KDROSO",
      "issuer": "ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:5"
      ],
      "expires": "2027-10-06T01:39:19Z",
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
      "account": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI",
      "public": "UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS",
      "issuer": "ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T01:39:12Z",
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
   "stdout": "generation 7 from catalogue 24164e3e783d, issued 2026-10-06T05:39:27+04:00; 5 credentials\n  CALLER-batch  identity ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR  signing ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\n  CALLER-studio  identity ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4  signing ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\n  GARM  identity ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI  signing AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\n  SYS  identity ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN  signing AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\n  TOOLS  identity ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI  signing ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\n",
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
     "content": "ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR"
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
     "content": "ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4"
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
     "content": "ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI"
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
     "content": "ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN"
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
     "content": "ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI"
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
     "path": "ceremony/keys/archive/CALLER-studio.signing.ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK.nk",
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
     "content": "{\n  \"jti\": \"AHOARQDQ7JXLEOXWF54JL5QPI7ZXNYGAUS4NEZAOCDHZXHH3MBOA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"name\": \"garm\",\n  \"sub\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 3710,
     "content": "{\n  \"manifest\": {\n    \"generation\": 7,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T05:39:27.956529+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n        \"signing\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n        \"signing\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n        \"retired\": {\n          \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\": 6\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"signing\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      \"SYS\": {\n        \"identity\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n        \"signing\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"signing\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UCL5IEMJ6NUH5W2AVJJKPETUAITAF3XYXZ4NFGECGPEU4PBQ3T4C7MJ3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 7,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791250767,\n        \"signing_key\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\",\n        \"reason\": \"reissued\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCOFQD6Y5U6DYAIHLWFUW2K5HPTE7S5YCKSJ7O6I7LBNGU33X7KDROSO\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791250759,\n        \"signing_key\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    ]\n  },\n  \"signer\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"signature\": \"be6bcd13398988dd0c67d1f52f921805874fb600fa543efd22b4ba8944720a666d3b536a462b17c2375b40e7bcb89db6a78ae420ab2de01a313a6d1d83541b07\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2248,
     "content": "{\n  \"jti\": \"2NAJGTKE4JICS7PK6LBDYL2SCZH5AJDB32FJOCSYUVAQTITKVH7A\",\n  \"iat\": 1791250767,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR.\\u003e\",\n        \"account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJZT1BZQURUS1VMMjYyNjVBNlpOMlNHWlJNVE5RTzY3MkZKWUdOQ0RKQlZHUjdLVDRRQjNBIiwiaWF0IjoxNzkxMjUwNzY3LCJpc3MiOiJBQVVGTldVUUxEQVA1TVdRS1lQU1BCWEkzT1lMSDRTWEw1S0kzRlQzV0lXUVdYVUpLUURTRkUyQyIsInN1YiI6IkFEWkw3S0lWT09WR05LNUNSSk5RWFdOSEs2M09OT0s3UUhQVUtLNEFKVVBWTVNUUDYzRFk2UEdSIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURaTDdLSVZPT1ZHTks1Q1JKTlFYV05ISzYzT05PSzdRSFBVS0s0QUpVUFZNU1RQNjNEWTZQR1IuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.CN3SO0-TRgQEsjuqd_3dfaTULm7G7ZP0LI19G04hTpLNxq04uYF8jmEBW-7405zWO1648Oql43YHnayFpKovAg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n    ],\n    \"revocations\": {\n      \"UAA56JGRU2AO6LIXRHAUIBWUYUQXHGSBPTDT3K2TXWLVM32ICZRG47YR\": 1791250767\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"D476L4YKDGD3P5NWZAFEOCJMH3ZPF4TPPHFYAJFVPE3DN7QOG2XA\",\n  \"iat\": 1791250767,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4.\\u003e\",\n        \"account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiI0Q0FINzVYTlFRN1ZWWkMyUVpNVEk1Rk4yUzZNWE1NSjdQN1RPR1ZXS1VQN1o0N1hXTTZBIiwiaWF0IjoxNzkxMjUwNzY3LCJpc3MiOiJBQVVGTldVUUxEQVA1TVdRS1lQU1BCWEkzT1lMSDRTWEw1S0kzRlQzV0lXUVdYVUpLUURTRkUyQyIsInN1YiI6IkFCRkpITDVENjdIM0FIWVBaWEhDVkJENU9MWkRHR043UVpJRU9DVlAyWFY2RkM2RUhDRzZGUlM0IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUJGSkhMNUQ2N0gzQUhZUFpYSENWQkQ1T0xaREdHTjdRWklFT0NWUDJYVjZGQzZFSENHNkZSUzQuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.Rgheh4dVeViu8tvyqyyJDl8jl1aKvqCcKZDAA49ejiuurwwtbA6siG5PixkuDe1q4kEdwSRgrpk66nXUit7EDQ\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"C6DRLVTTPA7LKG3Z7DEO3CYHRGIHMLQGPCZ2Y6HTH5ODJPR3F36Q\",\n  \"iat\": 1791250767,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"GARM\",\n  \"sub\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJLUjNZWEVPUUpQS1NHQlpBM0lVSU1OU00yRldRM0hBVEg3TFhRSVRSNVdMNEJPMkVVNEFBIiwiaWF0IjoxNzkxMjUwNzY3LCJpc3MiOiJBQ1c0T0g0RFBHQ0FQSVNTM1ZaRjZETEI0TkFMVURQMzVTU1FaRVEzUlVRWEc3QVJVQjIyVFlVTCIsInN1YiI6IkFCTTU1RkNGSkNPM0pMRFlHTU9MQTZXMkNQWEw2NUFQTEI2NVZMNkJCNloyTTVHTEZBVUZHSFhJIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQkRZWkVVRTZPWVc0QkVNTVBNREI0SVdBN05KUTJTVEs1T1ZYV1M0QURaUUFVQU9TUlRFT0pFSSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.c-vWStLm0IlsuO7o-nb2Hlv7p-TJQMwqkbp7v7z49wdgsKzfBfaZuJZzCI1P8lH_o21qBVwEzUzlC0MhNHgLBg\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"ZIDHZCYISVZYRTPMCLQVYYISZ7NULC4M4IAGT43ILYKYUC3WLBVQ\",\n  \"iat\": 1791250767,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"SYS\",\n  \"sub\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"OKOIWY3JAWLPJ5M4XAEI7EYPPDIGY6W3SK3AOBYMSX2FQLC2BHEA\",\n  \"iat\": 1791250767,\n  \"iss\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n  \"studio\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786767,\n  \"jti\": \"FLVACDZBXW36EXCTAXRT3D3K6KMCOQPFUMQKEWPNS4EB37P7IRUQ\",\n  \"iat\": 1791250767,\n  \"iss\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\",\n  \"name\": \"batch\",\n  \"sub\": \"UCL5IEMJ6NUH5W2AVJJKPETUAITAF3XYXZ4NFGECGPEU4PBQ3T4C7MJ3\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:7\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"B5QTY55RORYO2A2R5X5NI6T4AGSHQ5QALY2U7DWKFGGTNG5HOXIQ\",\n  \"iat\": 1791250752,\n  \"iss\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\",\n  \"name\": \"ops\",\n  \"sub\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"BSBA3GDKAJOKQ4MOOS76XXYPAG7KQV2GKNMSILLY6UJAUUIYBQUA\",\n  \"iat\": 1791250752,\n  \"iss\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\",\n  \"name\": \"rund\",\n  \"sub\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786759,\n  \"jti\": \"NRHWXKKJWBHPUC2CNKUR635F42SFHLA3TUXO6QBBPR3VUYTBWZCQ\",\n  \"iat\": 1791250759,\n  \"iss\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n  \"name\": \"studio\",\n  \"sub\": \"UCOFQD6Y5U6DYAIHLWFUW2K5HPTE7S5YCKSJ7O6I7LBNGU33X7KDROSO\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822786752,\n  \"jti\": \"GZT44YX6K47G7FUSAREFKSTAKVJBVSKGUYTRU5UBLY5JTX2SAHZQ\",\n  \"iat\": 1791250752,\n  \"iss\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 3710,
     "content": "{\n  \"manifest\": {\n    \"generation\": 7,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T05:39:27.956529+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADZL7KIVOOVGNK5CRJNQXWNHK63ONOK7QHPUKK4AJUPVMSTP63DY6PGR\",\n        \"signing\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ABFJHL5D67H3AHYPZXHCVBD5OLZDGGN7QZIEOCVP2XV6FC6EHCG6FRS4\",\n        \"signing\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\",\n        \"retired\": {\n          \"ADZOKFFGM6FCQCNUOZU3M5KDEZDPQZWBHCWD3OWY7PAFN662YAWQRNEK\": 6\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ABM55FCFJCO3JLDYGMOLA6W2CPXL65APLB65VL6BB6Z2M5GLFAUFGHXI\",\n        \"signing\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      \"SYS\": {\n        \"identity\": \"ADIBHYQEECMVOF7VKNFTNLK7XC7QZVVQIWM6CI6PHHJIQAZHRK4SCTCN\",\n        \"signing\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ABDYZEUE6OYW4BEMMPMDB4IWA7NJQ2STK5OVXWS4ADZQAUAOSRTEOJEI\",\n        \"signing\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UCL5IEMJ6NUH5W2AVJJKPETUAITAF3XYXZ4NFGECGPEU4PBQ3T4C7MJ3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 7,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791250767,\n        \"signing_key\": \"ADU45TYW3OOGPZ4CZ66H44IZ5BEGYRYGDTBPEKMUER5MPOP7BOY4LUZT\",\n        \"reason\": \"reissued\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDVYNSTHR3GLCFRB2Y77TTN7TLQVPTYRRCZKRGCMCUIJJTBXB65P7WC3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AD2S3YXZ2WPEYW2PY2KFKV7UIN5AEIBLBV6U4Z4YFS5JYXV2BCZNYVCZ\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCQ2K7O6W4XFKFGCPHIHO2T2XXG7SSVIKRF55F6PE2JVP224TGUT2PKN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"AAUFNWUQLDAP5MWQKYPSPBXI3OYLH4SXL5KI3FT3WIWQWXUJKQDSFE2C\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UCOFQD6Y5U6DYAIHLWFUW2K5HPTE7S5YCKSJ7O6I7LBNGU33X7KDROSO\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791250759,\n        \"signing_key\": \"ADPN5M3BI3I64ECW633QGSZEUTTNMC2TJPW4N74FZU6HPXHVLQ3M2PLK\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBI3VUT64BTFFDDKKT7VFSTUVJXG6U7GY7GEA3CHKTT2B3ZHRJWLTWTS\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791250752,\n        \"signing_key\": \"ACW4OH4DPGCAPISS3VZF6DLB4NALUDP35SSQZEQ3RUQXG7ARUB22TYUL\"\n      }\n    ]\n  },\n  \"signer\": \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\",\n  \"signature\": \"be6bcd13398988dd0c67d1f52f921805874fb600fa543efd22b4ba8944720a666d3b536a462b17c2375b40e7bcb89db6a78ae420ab2de01a313a6d1d83541b07\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"AHOARQDQ7JXLEOXWF54JL5QPI7ZXNYGAUS4NEZAOCDHZXHH3MBOA\",\n  \"iat\": 1791250752,\n  \"iss\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"name\": \"garm\",\n  \"sub\": \"ODG72GLU7YPYWKLQAKUDOXENXOULWN5UZ5ZFJBANLS2PYOLC2X6OSNK2\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"ODX6MONN65DDXYEHAXMJN4VG7WX5ZVZJVHJYGGYECQV7EHXUDLLX3NNB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 249,
     "content": "[\n  {\n    \"Name\": \"batch\",\n    \"Account\": \"CALLER-batch\",\n    \"Public\": \"UAA56JGRU2AO6LIXRHAUIBWUYUQXHGSBPTDT3K2TXWLVM32ICZRG47YR\",\n    \"At\": \"2026-10-06T05:39:27.956529+04:00\",\n    \"Kind\": \"superseded\",\n    \"Why\": \"superseded by generation 7\"\n  }\n]"
    }
   ]
  }
 ]
}
;
