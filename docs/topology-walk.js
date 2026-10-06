// Written by `mise run topology-walk` (cmd/garmctl/walk_test.go): the lifecycle of
// docs/operating-the-topology.md run for real and recorded. Regenerate, do not edit.
window.TOPOLOGY_WALK = {
 "generated_at": "2026-10-06T02:07:59Z",
 "steps": [
  {
   "id": "ceremony",
   "title": "The root ceremony, once, offline",
   "prose": "`garmctl operator init` mints the operator root and the operator signing key, writes the root-signed operator JWT, and puts the root under `root/` for custody. Everything `topology` will ever need is under `keys/`; the root is not.",
   "command": "garmctl operator init --out ceremony",
   "stdout": "ok: operator OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q; keys for topology in ceremony/keys\nMOVE ceremony/root TO CUSTODY NOW: the root signs nothing day to day and must never be where topology runs\n",
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
     "content": "{\n  \"jti\": \"YE4I7JMBNYM23P42R6Y7ZBEZDRDPDR3UZ37HM34PY5H4WNF7QATQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"name\": \"garm\",\n  \"sub\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "content": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB"
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
     "content": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE"
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
     "content": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY"
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
     "content": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I"
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
     "content": "{\n  \"jti\": \"YE4I7JMBNYM23P42R6Y7ZBEZDRDPDR3UZ37HM34PY5H4WNF7QATQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"name\": \"garm\",\n  \"sub\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "content": "{\n  \"manifest\": {\n    \"generation\": 1,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:07:43.194997+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n        \"signing\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"signing\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n        \"signing\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"signing\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UC22F7IQ6YI7E2DZDYXFGXSDEF5DJQPABCP3WLHI4PF2IG7JTTNDHY5V\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\",\n        \"reason\": \"new\"\n      }\n    ]\n  },\n  \"signer\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"signature\": \"ca376605904a74500fc3b42384f72c898210ba62c452ca3f39bc29e358f1f81d045c8fb565932f8a33f8286f19feb8edd4f4eaf72c347566c773bb62f96b240d\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"WNPBXNA435LRPHDSBUNIRUWRY7ALI6SREFQCGB266EPCKDJL5EAQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB.\\u003e\",\n        \"account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiI0V1Y2NTI0RUlHVlE2UjJUN1NYN04yTlBFSUo1WjJCSzY1RTM0WE8zVjZRVEZBSFBNNkpRIiwiaWF0IjoxNzkxMjUyNDYzLCJpc3MiOiJBQkROSTc0UDJXSUlPSFJNSVhDS0tQUk43QkE0WlAzR0gyRDdJSllFTFEyR01PWUw2TElSVktWWSIsInN1YiI6IkFBTDJaTVk1SURWWFU2VTdGSFRGU0dFRVJIUk5DVVhHVDcyMkpURURZRzZFREtYTVNLWUlEQkhCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFMMlpNWTVJRFZYVTZVN0ZIVEZTR0VFUkhSTkNVWEdUNzIySlRFRFlHNkVES1hNU0tZSURCSEIuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.SciLRjHT5_1M7xZBOGT9MnSaTp3hDCZZ4GM03X4x2OdYntOXxvKZefuf4hsNsgRMUZAqMIUxaKD9pAbx66sHAA\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"FCKVG52JOQYSQDOJA6GA3RDZB7UUFFUPMFEQRPUIIQE2ER2FGVQQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJKVUpWT1lCNU1BNVRWUEdBUlpNUlNRQkIySkZKUFlTSTY2S05NTkZSN0pVV0tJNEZGREtBIiwiaWF0IjoxNzkxMjUyNDYzLCJpc3MiOiJBREdUNUZTMkdTNTdNTEtEVkNEUVFXUDRZQkVCQjJIRTVaVlVaVVJFNUtDWlJaWkVDSU5FUkdCTyIsInN1YiI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQ0NLUzJUQ1dNRVpGQUNOTUtXSklXV1FJT0NPUVREUVpXWEw2U1NBVFNVSVhXNVNDUUY1RU4ySSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.LRjT9ulaoS-aPNPwppB1J0UNlpUiZbcQAIFJ4tILxIk-8o7tQvfijUHpIpShdYNReSH0J0BWs7X5mI9i3opWAw\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"GHE76TUNTWXIJHIPPK2QS55YCJFABXQD7XEPHWZGA3BIXRDUIWGQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"SYS\",\n  \"sub\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"Y3DFXTAZ4EY32HDEEC3GCHW6NGR2NKSA2LQHEQZQS4UWX5HQAJVQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "new",
     "secret": false,
     "size": 74,
     "content": "{\n  \"studio\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\"\n}"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"6AEIACYDMUWQJ4JQIFZDKV4E4LGOIP32REXBRYLSILHB3EQH3HWQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\",\n  \"name\": \"ops\",\n  \"sub\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"F7J25POOW33LIC6WELW3P3OUB465HW4WFCDBJASOOWVC74YKPZSA\",\n  \"iat\": 1791252463,\n  \"iss\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\",\n  \"name\": \"rund\",\n  \"sub\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"JLGDDA6YDGUS33Z4RDEIPRVT5ALMKQ4JGQYAWIQZVWRYWVYR43GA\",\n  \"iat\": 1791252463,\n  \"iss\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\",\n  \"name\": \"studio\",\n  \"sub\": \"UC22F7IQ6YI7E2DZDYXFGXSDEF5DJQPABCP3WLHI4PF2IG7JTTNDHY5V\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"PEH3FCZGWPHCE3EV5FUVOWL4LEIKJSFZRQWDRTBMBQTZUUIMOCMQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "new",
     "secret": false,
     "size": 3182,
     "content": "{\n  \"manifest\": {\n    \"generation\": 1,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:07:43.194997+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n        \"signing\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"signing\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n        \"signing\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"signing\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UC22F7IQ6YI7E2DZDYXFGXSDEF5DJQPABCP3WLHI4PF2IG7JTTNDHY5V\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\",\n        \"reason\": \"new\"\n      }\n    ]\n  },\n  \"signer\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"signature\": \"ca376605904a74500fc3b42384f72c898210ba62c452ca3f39bc29e358f1f81d045c8fb565932f8a33f8286f19feb8edd4f4eaf72c347566c773bb62f96b240d\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YE4I7JMBNYM23P42R6Y7ZBEZDRDPDR3UZ37HM34PY5H4WNF7QATQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"name\": \"garm\",\n  \"sub\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:56505",
    "accounts": [
     {
      "name": "CALLER-studio",
      "public": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB",
      "signing_keys": [
       "ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "GARM",
      "public": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE",
      "signing_keys": [
       "ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "SYS",
      "public": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY",
      "signing_keys": [
       "AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "TOOLS",
      "public": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I",
      "signing_keys": [
       "ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO"
      ],
      "revocations": 0,
      "pushed": false
     }
    ],
    "creds": [
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY",
      "public": "UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B",
      "issuer": "AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE",
      "public": "UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L",
      "issuer": "ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
      "account": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB",
      "public": "UC22F7IQ6YI7E2DZDYXFGXSDEF5DJQPABCP3WLHI4PF2IG7JTTNDHY5V",
      "issuer": "ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
      "account": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I",
      "public": "UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L",
      "issuer": "ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
     "content": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB"
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
     "content": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE"
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
     "content": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY"
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
     "content": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I"
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
     "content": "{\n  \"jti\": \"YE4I7JMBNYM23P42R6Y7ZBEZDRDPDR3UZ37HM34PY5H4WNF7QATQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"name\": \"garm\",\n  \"sub\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 3594,
     "content": "{\n  \"manifest\": {\n    \"generation\": 2,\n    \"catalogue_sha256\": \"f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n    \"issued_at\": \"2026-10-06T06:07:44.460154+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n        \"signing\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"signing\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n        \"signing\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"signing\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UC22F7IQ6YI7E2DZDYXFGXSDEF5DJQPABCP3WLHI4PF2IG7JTTNDHY5V\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      },\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDUVRPOPIGHO55TZYSVPATHLUFJNE3GKRBBQVAKX3TW4JXMZCE5R333I\",\n        \"catalogue_sha256\": \"f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n        \"generation\": 2,\n        \"permissions_hash\": \"19ef9109d050959e\",\n        \"issued_at\": 1791252464,\n        \"expires_at\": 1822788464,\n        \"signing_key\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\",\n        \"reason\": \"new\"\n      }\n    ]\n  },\n  \"signer\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"signature\": \"e169b7544274c362938784a9ebc8fc43986f08c17875612a54e81fe02d78792676a336f62c0da06c1a85fb0b7fd51924ac8b039e70accf4eb4d5e62ffb1ec10d\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"5VZO2TRCZOA5VQEG7WZJDTJQIDWULRMBWZ4GBTTHFDGKMZ6EQMMQ\",\n  \"iat\": 1791252464,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB.\\u003e\",\n        \"account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJMTlFMQjRTN0pSQlFWWEpKU0I2NVpUVUkyWlRGWFdXWEs2VERURlVON0VPRTVPRlNPNEtRIiwiaWF0IjoxNzkxMjUyNDY0LCJpc3MiOiJBQkROSTc0UDJXSUlPSFJNSVhDS0tQUk43QkE0WlAzR0gyRDdJSllFTFEyR01PWUw2TElSVktWWSIsInN1YiI6IkFBTDJaTVk1SURWWFU2VTdGSFRGU0dFRVJIUk5DVVhHVDcyMkpURURZRzZFREtYTVNLWUlEQkhCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFMMlpNWTVJRFZYVTZVN0ZIVEZTR0VFUkhSTkNVWEdUNzIySlRFRFlHNkVES1hNU0tZSURCSEIuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.PD4hlV6-UJ06lFYYwdxnd2CPEXR2b6_0o6lM5BBavACUytqzcjNQTyHL9mIZNB7fHMEhpgScyoaFRQ97-cLaBA\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"IDS7EO4GHSOSHU3QU3KBWC2PDMLGYNV7JQRDA6VFVBXLDIAHB7YA\",\n  \"iat\": 1791252464,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJYUERSWFJBNkI2TEI2RDZPTDVUT0hJSFhNVkxOQkNPUDNGRkM1NjNFSkVYWkgzSkVDWkFBIiwiaWF0IjoxNzkxMjUyNDY0LCJpc3MiOiJBREdUNUZTMkdTNTdNTEtEVkNEUVFXUDRZQkVCQjJIRTVaVlVaVVJFNUtDWlJaWkVDSU5FUkdCTyIsInN1YiI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQ0NLUzJUQ1dNRVpGQUNOTUtXSklXV1FJT0NPUVREUVpXWEw2U1NBVFNVSVhXNVNDUUY1RU4ySSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.2Q5Bi4BPJ3ynL6-wZ6zv1q4InECwblIk61HYcIhwefclFvaVkw3ly5zJR7dizddY14dJXDeUGTGwbMIKy-QbCA\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"TOTJ2M7FPWPGAV4NBUSMRJKN5UUAT3JJ2XAUUSVZB75ICRRFGREA\",\n  \"iat\": 1791252464,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"SYS\",\n  \"sub\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"VI77L45UYFHURIH3QO6VLJNPLG7NERWPUQIX7UZLYELQBOU63SWA\",\n  \"iat\": 1791252464,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 74,
     "content": "{\n  \"studio\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\"\n}"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"6AEIACYDMUWQJ4JQIFZDKV4E4LGOIP32REXBRYLSILHB3EQH3HWQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\",\n  \"name\": \"ops\",\n  \"sub\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"F7J25POOW33LIC6WELW3P3OUB465HW4WFCDBJASOOWVC74YKPZSA\",\n  \"iat\": 1791252463,\n  \"iss\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\",\n  \"name\": \"rund\",\n  \"sub\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"JLGDDA6YDGUS33Z4RDEIPRVT5ALMKQ4JGQYAWIQZVWRYWVYR43GA\",\n  \"iat\": 1791252463,\n  \"iss\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\",\n  \"name\": \"studio\",\n  \"sub\": \"UC22F7IQ6YI7E2DZDYXFGXSDEF5DJQPABCP3WLHI4PF2IG7JTTNDHY5V\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"PEH3FCZGWPHCE3EV5FUVOWL4LEIKJSFZRQWDRTBMBQTZUUIMOCMQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather2.v1.WeatherService.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1399,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788464,\n  \"jti\": \"N6KPYF6SV27AOIR66XHGOR53ZT7VCQ2I7HJ47TZ5H6WGIFUJHGIA\",\n  \"iat\": 1791252464,\n  \"iss\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\",\n  \"name\": \"weather2.v1.WeatherService\",\n  \"sub\": \"UDUVRPOPIGHO55TZYSVPATHLUFJNE3GKRBBQVAKX3TW4JXMZCE5R333I\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather-2.v1.get_forecast\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n    \"tags\": [\n      \"catalogue:f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n      \"generation:2\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3594,
     "content": "{\n  \"manifest\": {\n    \"generation\": 2,\n    \"catalogue_sha256\": \"f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n    \"issued_at\": \"2026-10-06T06:07:44.460154+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n        \"signing\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"signing\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n        \"signing\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"signing\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UC22F7IQ6YI7E2DZDYXFGXSDEF5DJQPABCP3WLHI4PF2IG7JTTNDHY5V\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      },\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDUVRPOPIGHO55TZYSVPATHLUFJNE3GKRBBQVAKX3TW4JXMZCE5R333I\",\n        \"catalogue_sha256\": \"f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n        \"generation\": 2,\n        \"permissions_hash\": \"19ef9109d050959e\",\n        \"issued_at\": 1791252464,\n        \"expires_at\": 1822788464,\n        \"signing_key\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\",\n        \"reason\": \"new\"\n      }\n    ]\n  },\n  \"signer\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"signature\": \"e169b7544274c362938784a9ebc8fc43986f08c17875612a54e81fe02d78792676a336f62c0da06c1a85fb0b7fd51924ac8b039e70accf4eb4d5e62ffb1ec10d\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YE4I7JMBNYM23P42R6Y7ZBEZDRDPDR3UZ37HM34PY5H4WNF7QATQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"name\": \"garm\",\n  \"sub\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:56505",
    "accounts": [
     {
      "name": "CALLER-studio",
      "public": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB",
      "signing_keys": [
       "ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE",
      "signing_keys": [
       "ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY",
      "signing_keys": [
       "AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I",
      "signing_keys": [
       "ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO"
      ],
      "revocations": 0,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY",
      "public": "UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B",
      "issuer": "AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE",
      "public": "UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L",
      "issuer": "ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
      "account": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB",
      "public": "UC22F7IQ6YI7E2DZDYXFGXSDEF5DJQPABCP3WLHI4PF2IG7JTTNDHY5V",
      "issuer": "ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
      "account": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I",
      "public": "UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L",
      "issuer": "ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
      "account": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I",
      "public": "UDUVRPOPIGHO55TZYSVPATHLUFJNE3GKRBBQVAKX3TW4JXMZCE5R333I",
      "issuer": "ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO",
      "tags": [
       "catalogue:f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a",
       "generation:2"
      ],
      "expires": "2027-10-06T02:07:44Z",
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
     "content": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB"
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
     "content": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE"
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
     "content": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY"
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
     "content": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I"
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
     "content": "{\n  \"jti\": \"YE4I7JMBNYM23P42R6Y7ZBEZDRDPDR3UZ37HM34PY5H4WNF7QATQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"name\": \"garm\",\n  \"sub\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 3081,
     "content": "{\n  \"manifest\": {\n    \"generation\": 3,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:07:45.70089+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n        \"signing\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"signing\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n        \"signing\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"signing\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UC22F7IQ6YI7E2DZDYXFGXSDEF5DJQPABCP3WLHI4PF2IG7JTTNDHY5V\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    ]\n  },\n  \"signer\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"signature\": \"f9e402e9219e12acbd782cfd770e7f494f5148cf1a1e3f083d1b92e868c50672563b6cf0b82143cf85e92e2eac825c1c222cac2e217ff7abe2b553b090212d07\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"77QLF5EX35BO5PBSQDIPWJBJZRRMKFIE4NWL2C5Q65H7VVD6ETFQ\",\n  \"iat\": 1791252465,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB.\\u003e\",\n        \"account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJBN1hPVVdKTk5CQzdDUU1OUVlFTDNMNllXR09JREJMWUhWVEhRV0xWNFk1T0FSSE80VVpRIiwiaWF0IjoxNzkxMjUyNDY1LCJpc3MiOiJBQkROSTc0UDJXSUlPSFJNSVhDS0tQUk43QkE0WlAzR0gyRDdJSllFTFEyR01PWUw2TElSVktWWSIsInN1YiI6IkFBTDJaTVk1SURWWFU2VTdGSFRGU0dFRVJIUk5DVVhHVDcyMkpURURZRzZFREtYTVNLWUlEQkhCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFMMlpNWTVJRFZYVTZVN0ZIVEZTR0VFUkhSTkNVWEdUNzIySlRFRFlHNkVES1hNU0tZSURCSEIuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.xRSPXZC9JlTC3sr9w2rzniwAyx1YvxqErpWFR5DL_x3CvHeSk8DB5rl3IIse4bWhtrVH_dMltuqpOV9TA4ONAg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"HWIIAIQ54GSAYMUWKCSTSQ6OLJV2JXWWJ3DNOUCMUNNIVNV76EPQ\",\n  \"iat\": 1791252465,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJEMllKRVpKWFJENlEzRUdNTlNCUTY3VFNVUjZJRDdUVlJWR1FET0pMR09IU1E3VVZQQVFBIiwiaWF0IjoxNzkxMjUyNDY1LCJpc3MiOiJBREdUNUZTMkdTNTdNTEtEVkNEUVFXUDRZQkVCQjJIRTVaVlVaVVJFNUtDWlJaWkVDSU5FUkdCTyIsInN1YiI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQ0NLUzJUQ1dNRVpGQUNOTUtXSklXV1FJT0NPUVREUVpXWEw2U1NBVFNVSVhXNVNDUUY1RU4ySSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.51NQUN-tGzZ8he_ldXyUQA8_BrE_mhRqh7zaNV7zo0PNVPftnIMcJkgciL2gvh1mn9ruggCzYF1x79wrfBS3Bg\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"IQQPCYHB2X62N2AOI7K3CZWO4Q4YZPEJMMWENJOVJ5XXLZE4WUYQ\",\n  \"iat\": 1791252465,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"SYS\",\n  \"sub\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 1084,
     "content": "{\n  \"jti\": \"CRK3K5BWGFGK3MQ2LLSY4HIGVCHGR6VDXOU7Q5K44XLKASSAKFGQ\",\n  \"iat\": 1791252465,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n    ],\n    \"revocations\": {\n      \"UDUVRPOPIGHO55TZYSVPATHLUFJNE3GKRBBQVAKX3TW4JXMZCE5R333I\": 1791252465\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 74,
     "content": "{\n  \"studio\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\"\n}"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"6AEIACYDMUWQJ4JQIFZDKV4E4LGOIP32REXBRYLSILHB3EQH3HWQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\",\n  \"name\": \"ops\",\n  \"sub\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"F7J25POOW33LIC6WELW3P3OUB465HW4WFCDBJASOOWVC74YKPZSA\",\n  \"iat\": 1791252463,\n  \"iss\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\",\n  \"name\": \"rund\",\n  \"sub\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"JLGDDA6YDGUS33Z4RDEIPRVT5ALMKQ4JGQYAWIQZVWRYWVYR43GA\",\n  \"iat\": 1791252463,\n  \"iss\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\",\n  \"name\": \"studio\",\n  \"sub\": \"UC22F7IQ6YI7E2DZDYXFGXSDEF5DJQPABCP3WLHI4PF2IG7JTTNDHY5V\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"PEH3FCZGWPHCE3EV5FUVOWL4LEIKJSFZRQWDRTBMBQTZUUIMOCMQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
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
     "size": 3081,
     "content": "{\n  \"manifest\": {\n    \"generation\": 3,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:07:45.70089+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n        \"signing\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"signing\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n        \"signing\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"signing\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UC22F7IQ6YI7E2DZDYXFGXSDEF5DJQPABCP3WLHI4PF2IG7JTTNDHY5V\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    ]\n  },\n  \"signer\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"signature\": \"f9e402e9219e12acbd782cfd770e7f494f5148cf1a1e3f083d1b92e868c50672563b6cf0b82143cf85e92e2eac825c1c222cac2e217ff7abe2b553b090212d07\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YE4I7JMBNYM23P42R6Y7ZBEZDRDPDR3UZ37HM34PY5H4WNF7QATQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"name\": \"garm\",\n  \"sub\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 268,
     "content": "[\n  {\n    \"Name\": \"weather2.v1.WeatherService\",\n    \"Account\": \"TOOLS\",\n    \"Public\": \"UDUVRPOPIGHO55TZYSVPATHLUFJNE3GKRBBQVAKX3TW4JXMZCE5R333I\",\n    \"At\": \"2026-10-06T06:07:45.70089+04:00\",\n    \"Kind\": \"retired\",\n    \"Why\": \"retired: no longer in the catalogue\"\n  }\n]"
    }
   ],
   "bus": {
    "server": "tls://127.0.0.1:56505",
    "accounts": [
     {
      "name": "CALLER-studio",
      "public": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB",
      "signing_keys": [
       "ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE",
      "signing_keys": [
       "ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY",
      "signing_keys": [
       "AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I",
      "signing_keys": [
       "ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO"
      ],
      "revocations": 1,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY",
      "public": "UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B",
      "issuer": "AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE",
      "public": "UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L",
      "issuer": "ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
      "account": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB",
      "public": "UC22F7IQ6YI7E2DZDYXFGXSDEF5DJQPABCP3WLHI4PF2IG7JTTNDHY5V",
      "issuer": "ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
      "account": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I",
      "public": "UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L",
      "issuer": "ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
      "account": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I",
      "public": "UDUVRPOPIGHO55TZYSVPATHLUFJNE3GKRBBQVAKX3TW4JXMZCE5R333I",
      "issuer": "ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO",
      "tags": [
       "catalogue:f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a",
       "generation:2"
      ],
      "expires": "2027-10-06T02:07:44Z",
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
     "content": "AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC"
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
     "content": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB"
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
     "content": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE"
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
     "content": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY"
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
     "content": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I"
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
     "content": "{\n  \"jti\": \"YE4I7JMBNYM23P42R6Y7ZBEZDRDPDR3UZ37HM34PY5H4WNF7QATQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"name\": \"garm\",\n  \"sub\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 3769,
     "content": "{\n  \"manifest\": {\n    \"generation\": 4,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:07:46.9396+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n        \"signing\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n        \"signing\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"signing\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n        \"signing\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"signing\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UB4QFFGAO6IX5DBNAZM72WSZ3PZ4PRLJGJWERNC5H5WYJETZKQNVTSUG\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252466,\n        \"expires_at\": 1822788466,\n        \"signing_key\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UC22F7IQ6YI7E2DZDYXFGXSDEF5DJQPABCP3WLHI4PF2IG7JTTNDHY5V\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    ]\n  },\n  \"signer\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"signature\": \"d721c5240711e61ee4528364903eb60b59351f13bf785da27cc0ad1e1a6c7519e1cd2fcac623eb8d6dab64bcb6b789584c6966e6814c67c0116e223f7a81a80c\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 2133,
     "content": "{\n  \"jti\": \"4T7NO3JZYDYSSYKLHFTH62MOMVCAYXFEYWT3HGZOIPBLR6E62C2A\",\n  \"iat\": 1791252466,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC.\\u003e\",\n        \"account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJJV08zVUlMNFZLQVdZREFZUkJYNFZaR1dEVUUzSkdBTUs1UTRPREk3RElRQjJKQUpBTlpBIiwiaWF0IjoxNzkxMjUyNDY2LCJpc3MiOiJBQkROSTc0UDJXSUlPSFJNSVhDS0tQUk43QkE0WlAzR0gyRDdJSllFTFEyR01PWUw2TElSVktWWSIsInN1YiI6IkFBN0ZQWk9UREZXWERaT0hKTTNTUEFES1ZMWEtBT0ZDWks1VVhMVVJHU0ZPS1RKNkFCV1lSVlVDIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUE3RlBaT1RERldYRFpPSEpNM1NQQURLVkxYS0FPRkNaSzVVWExVUkdTRk9LVEo2QUJXWVJWVUMuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.NP0kXg5OH3edwBYrMVsveZ1jm3At_0i2dIgebyyk4baXrlB3krVNm5tUnzbj7yIQvzA2jDDEKifR7xjAizSSDw\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"XJFF3QXLNQVX3NHO3K6SEFS5EL2D4DSKZEIEDHO6QF3W2HSSXLSA\",\n  \"iat\": 1791252466,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB.\\u003e\",\n        \"account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJIVUczUkFKU1hYVUNaWEpXU09TSjdPT01TUjZDTlNKNzNaRENDNlBPWDNGNDRLWlRPRTZBIiwiaWF0IjoxNzkxMjUyNDY2LCJpc3MiOiJBQkROSTc0UDJXSUlPSFJNSVhDS0tQUk43QkE0WlAzR0gyRDdJSllFTFEyR01PWUw2TElSVktWWSIsInN1YiI6IkFBTDJaTVk1SURWWFU2VTdGSFRGU0dFRVJIUk5DVVhHVDcyMkpURURZRzZFREtYTVNLWUlEQkhCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFMMlpNWTVJRFZYVTZVN0ZIVEZTR0VFUkhSTkNVWEdUNzIySlRFRFlHNkVES1hNU0tZSURCSEIuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.YVFTj8OnX6VBcgOdqqox6dm4DFbwaK0fKkbK0t7W6eKy2o1Uv73EPTDX2Id0OV5FuiE3-o3rysU3C-sVl96yDg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"HT2VP3FZY2USG4SX5LKOJ5MLXRNRJVUKXJ26WDC2Z4LSZJNVRGGQ\",\n  \"iat\": 1791252466,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJRT0MyNzcySVZIQjVCWDVZREVaQklUS1NCSVlMQUQ3WVJJRlVCNFFaM09KQUw1Qk5KVFRBIiwiaWF0IjoxNzkxMjUyNDY2LCJpc3MiOiJBREdUNUZTMkdTNTdNTEtEVkNEUVFXUDRZQkVCQjJIRTVaVlVaVVJFNUtDWlJaWkVDSU5FUkdCTyIsInN1YiI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQ0NLUzJUQ1dNRVpGQUNOTUtXSklXV1FJT0NPUVREUVpXWEw2U1NBVFNVSVhXNVNDUUY1RU4ySSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.uoFg_L1gPz1pAzOH-QYfRtof4rbtrdVP1o0tDSE6ywgib8r9seDxlwsviJsLkLRb23MwAkZ8zDC3pYKFWZF1Dg\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"CMYNDOFN3UUXLD5FLCPA35DCVSBHAI5CS2NJ6NMQVTRM6FRO4ILA\",\n  \"iat\": 1791252466,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"SYS\",\n  \"sub\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"ZTTSVLB5GKAO7CSXRREWQULJTLAFWHX5FDC6FMVBLNZWTPRW4J7Q\",\n  \"iat\": 1791252466,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n  \"studio\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788466,\n  \"jti\": \"P7ESKGSYWNC6QRFBDGZO2NJLJNGUVA6D37KQYBMIJF4VICW3F33Q\",\n  \"iat\": 1791252466,\n  \"iss\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\",\n  \"name\": \"batch\",\n  \"sub\": \"UB4QFFGAO6IX5DBNAZM72WSZ3PZ4PRLJGJWERNC5H5WYJETZKQNVTSUG\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:4\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"6AEIACYDMUWQJ4JQIFZDKV4E4LGOIP32REXBRYLSILHB3EQH3HWQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\",\n  \"name\": \"ops\",\n  \"sub\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"F7J25POOW33LIC6WELW3P3OUB465HW4WFCDBJASOOWVC74YKPZSA\",\n  \"iat\": 1791252463,\n  \"iss\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\",\n  \"name\": \"rund\",\n  \"sub\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"JLGDDA6YDGUS33Z4RDEIPRVT5ALMKQ4JGQYAWIQZVWRYWVYR43GA\",\n  \"iat\": 1791252463,\n  \"iss\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\",\n  \"name\": \"studio\",\n  \"sub\": \"UC22F7IQ6YI7E2DZDYXFGXSDEF5DJQPABCP3WLHI4PF2IG7JTTNDHY5V\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"PEH3FCZGWPHCE3EV5FUVOWL4LEIKJSFZRQWDRTBMBQTZUUIMOCMQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3769,
     "content": "{\n  \"manifest\": {\n    \"generation\": 4,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:07:46.9396+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n        \"signing\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n        \"signing\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"signing\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n        \"signing\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"signing\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UB4QFFGAO6IX5DBNAZM72WSZ3PZ4PRLJGJWERNC5H5WYJETZKQNVTSUG\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252466,\n        \"expires_at\": 1822788466,\n        \"signing_key\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UC22F7IQ6YI7E2DZDYXFGXSDEF5DJQPABCP3WLHI4PF2IG7JTTNDHY5V\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    ]\n  },\n  \"signer\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"signature\": \"d721c5240711e61ee4528364903eb60b59351f13bf785da27cc0ad1e1a6c7519e1cd2fcac623eb8d6dab64bcb6b789584c6966e6814c67c0116e223f7a81a80c\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YE4I7JMBNYM23P42R6Y7ZBEZDRDPDR3UZ37HM34PY5H4WNF7QATQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"name\": \"garm\",\n  \"sub\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:56505",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC",
      "signing_keys": [
       "AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "CALLER-studio",
      "public": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB",
      "signing_keys": [
       "ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE",
      "signing_keys": [
       "ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY",
      "signing_keys": [
       "AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I",
      "signing_keys": [
       "ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO"
      ],
      "revocations": 0,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC",
      "public": "UB4QFFGAO6IX5DBNAZM72WSZ3PZ4PRLJGJWERNC5H5WYJETZKQNVTSUG",
      "issuer": "AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:4"
      ],
      "expires": "2027-10-06T02:07:46Z",
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
      "account": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY",
      "public": "UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B",
      "issuer": "AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE",
      "public": "UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L",
      "issuer": "ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
      "account": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB",
      "public": "UC22F7IQ6YI7E2DZDYXFGXSDEF5DJQPABCP3WLHI4PF2IG7JTTNDHY5V",
      "issuer": "ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
      "account": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I",
      "public": "UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L",
      "issuer": "ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
   "stderr": "CALLER-studio: signing key retiring; the old key ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR is still listed -- roll the new credentials out, then run an issuance with --verify-live to retire it\n",
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
     "content": "AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC"
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
     "content": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB"
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
     "content": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE"
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
     "content": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY"
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
     "content": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I"
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
     "path": "ceremony/keys/archive/CALLER-studio.signing.ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR.nk",
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
     "content": "{\n  \"jti\": \"YE4I7JMBNYM23P42R6Y7ZBEZDRDPDR3UZ37HM34PY5H4WNF7QATQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"name\": \"garm\",\n  \"sub\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "content": "{\n  \"manifest\": {\n    \"generation\": 5,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:07:50.090064+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n        \"signing\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n        \"signing\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\",\n        \"retiring\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"signing\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n        \"signing\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"signing\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UB4QFFGAO6IX5DBNAZM72WSZ3PZ4PRLJGJWERNC5H5WYJETZKQNVTSUG\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252466,\n        \"expires_at\": 1822788466,\n        \"signing_key\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UBANSGDEPP66ZSB64OXQ5BHZZEC67OKXJTARS3XVWCYRLWVT4E5KJRD3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252470,\n        \"expires_at\": 1822788470,\n        \"signing_key\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\",\n        \"reason\": \"rotation\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    ]\n  },\n  \"signer\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"signature\": \"3068a3b2989de0cc802a8cc81ca70c5bca0f66a36a5741310942d893e7e2a31302820a5e88682c28a42f9dfe4f017d2afed89f88f5075bd1ef977b2d52ba2304\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2133,
     "content": "{\n  \"jti\": \"SKIDV6JMLFX6PZ5NKV2PVFGZFGT22Q2CWMJNGIE3PIWAUDVWBVPA\",\n  \"iat\": 1791252470,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC.\\u003e\",\n        \"account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJRSVBBMkxKNEZKM1lKWkNKRkVBNDM0VFcyTkNMRVNTQUUyRTJWSVJGWDZFQ1hYRUZaQkJRIiwiaWF0IjoxNzkxMjUyNDcwLCJpc3MiOiJBQkROSTc0UDJXSUlPSFJNSVhDS0tQUk43QkE0WlAzR0gyRDdJSllFTFEyR01PWUw2TElSVktWWSIsInN1YiI6IkFBN0ZQWk9UREZXWERaT0hKTTNTUEFES1ZMWEtBT0ZDWks1VVhMVVJHU0ZPS1RKNkFCV1lSVlVDIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUE3RlBaT1RERldYRFpPSEpNM1NQQURLVkxYS0FPRkNaSzVVWExVUkdTRk9LVEo2QUJXWVJWVUMuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.zg5qsL5nZSnf2wa8YzoTNffREY9aGXMX9OEDURgWtx2RIcl9BZ3bkSMwbmb2CEFmiW40YnKpeKPdhMzZniKIDw\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2213,
     "content": "{\n  \"jti\": \"ZOPYYJNGSKZGWVDCKRHQLV3S5C7OSSW7GSSHUSEQMYSQVLH6PTHQ\",\n  \"iat\": 1791252470,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB.\\u003e\",\n        \"account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJDQlFWV0NRTVBOQ0RNUVlaNlRZMlhPM1lVSk9RVkwyU0NWQ0RCVlNRQ1haV1dUQUhTWFlBIiwiaWF0IjoxNzkxMjUyNDcwLCJpc3MiOiJBQkROSTc0UDJXSUlPSFJNSVhDS0tQUk43QkE0WlAzR0gyRDdJSllFTFEyR01PWUw2TElSVktWWSIsInN1YiI6IkFBTDJaTVk1SURWWFU2VTdGSFRGU0dFRVJIUk5DVVhHVDcyMkpURURZRzZFREtYTVNLWUlEQkhCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFMMlpNWTVJRFZYVTZVN0ZIVEZTR0VFUkhSTkNVWEdUNzIySlRFRFlHNkVES1hNU0tZSURCSEIuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.3_haZyvS3bPGBL38PcdMKk2-aE9gcxfiYN7lYqcLbaBvcELnCAnSdYV5FPvcY966LElvjpm76qYHLbzSomQGAg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\",\n      \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"CEKZTEF5LJGZJQDHJHL24YDCKCYMNDOMXULPGY5WYHS6U3GGQOXA\",\n  \"iat\": 1791252470,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJMVUhVV09ENFNFQUZaRFdGNUFFWVhOMlBGSkVWSU8zRFRITjNWSENPM0ZJVVZSRk5NVEtBIiwiaWF0IjoxNzkxMjUyNDcwLCJpc3MiOiJBREdUNUZTMkdTNTdNTEtEVkNEUVFXUDRZQkVCQjJIRTVaVlVaVVJFNUtDWlJaWkVDSU5FUkdCTyIsInN1YiI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQ0NLUzJUQ1dNRVpGQUNOTUtXSklXV1FJT0NPUVREUVpXWEw2U1NBVFNVSVhXNVNDUUY1RU4ySSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.8nu4lF5YyaHuheO97yvhISaMHvYOHe3kVg7SGIWxyTwNoD0fcMFFAfPQevVW_L_yO-3e4lx4BFqbZH5Fj0yBBA\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"MAGGYR2BOGFOKOEGLO33ITNFCSVPLTUXSPPGKQIATJP53VIFPXNQ\",\n  \"iat\": 1791252470,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"SYS\",\n  \"sub\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"TLNY77LZWNPQU2SU7MQ66NJL5WWU4ZJLM3IVZXSAAXLYIWODJTLA\",\n  \"iat\": 1791252470,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n  \"studio\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788466,\n  \"jti\": \"P7ESKGSYWNC6QRFBDGZO2NJLJNGUVA6D37KQYBMIJF4VICW3F33Q\",\n  \"iat\": 1791252466,\n  \"iss\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\",\n  \"name\": \"batch\",\n  \"sub\": \"UB4QFFGAO6IX5DBNAZM72WSZ3PZ4PRLJGJWERNC5H5WYJETZKQNVTSUG\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:4\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"6AEIACYDMUWQJ4JQIFZDKV4E4LGOIP32REXBRYLSILHB3EQH3HWQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\",\n  \"name\": \"ops\",\n  \"sub\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"F7J25POOW33LIC6WELW3P3OUB465HW4WFCDBJASOOWVC74YKPZSA\",\n  \"iat\": 1791252463,\n  \"iss\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\",\n  \"name\": \"rund\",\n  \"sub\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "changed",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788470,\n  \"jti\": \"EL43K2HZX7IXY5SHXA2WPODVELIO6BVJ47D4KP5LWZXPMNXK74VQ\",\n  \"iat\": 1791252470,\n  \"iss\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\",\n  \"name\": \"studio\",\n  \"sub\": \"UBANSGDEPP66ZSB64OXQ5BHZZEC67OKXJTARS3XVWCYRLWVT4E5KJRD3\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"PEH3FCZGWPHCE3EV5FUVOWL4LEIKJSFZRQWDRTBMBQTZUUIMOCMQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3856,
     "content": "{\n  \"manifest\": {\n    \"generation\": 5,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:07:50.090064+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n        \"signing\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n        \"signing\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\",\n        \"retiring\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"signing\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n        \"signing\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"signing\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UB4QFFGAO6IX5DBNAZM72WSZ3PZ4PRLJGJWERNC5H5WYJETZKQNVTSUG\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252466,\n        \"expires_at\": 1822788466,\n        \"signing_key\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UBANSGDEPP66ZSB64OXQ5BHZZEC67OKXJTARS3XVWCYRLWVT4E5KJRD3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252470,\n        \"expires_at\": 1822788470,\n        \"signing_key\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\",\n        \"reason\": \"rotation\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    ]\n  },\n  \"signer\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"signature\": \"3068a3b2989de0cc802a8cc81ca70c5bca0f66a36a5741310942d893e7e2a31302820a5e88682c28a42f9dfe4f017d2afed89f88f5075bd1ef977b2d52ba2304\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YE4I7JMBNYM23P42R6Y7ZBEZDRDPDR3UZ37HM34PY5H4WNF7QATQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"name\": \"garm\",\n  \"sub\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:56505",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC",
      "signing_keys": [
       "AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "CALLER-studio",
      "public": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB",
      "signing_keys": [
       "ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR",
       "ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE",
      "signing_keys": [
       "ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY",
      "signing_keys": [
       "AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I",
      "signing_keys": [
       "ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO"
      ],
      "revocations": 0,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC",
      "public": "UB4QFFGAO6IX5DBNAZM72WSZ3PZ4PRLJGJWERNC5H5WYJETZKQNVTSUG",
      "issuer": "AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:4"
      ],
      "expires": "2027-10-06T02:07:46Z",
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
      "account": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY",
      "public": "UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B",
      "issuer": "AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE",
      "public": "UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L",
      "issuer": "ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
      "account": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB",
      "public": "UBANSGDEPP66ZSB64OXQ5BHZZEC67OKXJTARS3XVWCYRLWVT4E5KJRD3",
      "issuer": "ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:5"
      ],
      "expires": "2027-10-06T02:07:50Z",
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
      "account": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I",
      "public": "UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L",
      "issuer": "ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
      "account": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB",
      "public": "UC22F7IQ6YI7E2DZDYXFGXSDEF5DJQPABCP3WLHI4PF2IG7JTTNDHY5V",
      "issuer": "ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
   "error": "--verify-live: CALLER-studio's retiring key ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR still signs 1 live connection(s): studio-old -- roll them out first",
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
     "content": "AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC"
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
     "content": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB"
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
     "content": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE"
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
     "content": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY"
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
     "content": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I"
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
     "path": "ceremony/keys/archive/CALLER-studio.signing.ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR.nk",
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
     "content": "{\n  \"jti\": \"YE4I7JMBNYM23P42R6Y7ZBEZDRDPDR3UZ37HM34PY5H4WNF7QATQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"name\": \"garm\",\n  \"sub\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "content": "{\n  \"manifest\": {\n    \"generation\": 5,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:07:50.090064+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n        \"signing\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n        \"signing\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\",\n        \"retiring\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"signing\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n        \"signing\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"signing\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UB4QFFGAO6IX5DBNAZM72WSZ3PZ4PRLJGJWERNC5H5WYJETZKQNVTSUG\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252466,\n        \"expires_at\": 1822788466,\n        \"signing_key\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UBANSGDEPP66ZSB64OXQ5BHZZEC67OKXJTARS3XVWCYRLWVT4E5KJRD3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252470,\n        \"expires_at\": 1822788470,\n        \"signing_key\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\",\n        \"reason\": \"rotation\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    ]\n  },\n  \"signer\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"signature\": \"3068a3b2989de0cc802a8cc81ca70c5bca0f66a36a5741310942d893e7e2a31302820a5e88682c28a42f9dfe4f017d2afed89f88f5075bd1ef977b2d52ba2304\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2133,
     "content": "{\n  \"jti\": \"SKIDV6JMLFX6PZ5NKV2PVFGZFGT22Q2CWMJNGIE3PIWAUDVWBVPA\",\n  \"iat\": 1791252470,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC.\\u003e\",\n        \"account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJRSVBBMkxKNEZKM1lKWkNKRkVBNDM0VFcyTkNMRVNTQUUyRTJWSVJGWDZFQ1hYRUZaQkJRIiwiaWF0IjoxNzkxMjUyNDcwLCJpc3MiOiJBQkROSTc0UDJXSUlPSFJNSVhDS0tQUk43QkE0WlAzR0gyRDdJSllFTFEyR01PWUw2TElSVktWWSIsInN1YiI6IkFBN0ZQWk9UREZXWERaT0hKTTNTUEFES1ZMWEtBT0ZDWks1VVhMVVJHU0ZPS1RKNkFCV1lSVlVDIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUE3RlBaT1RERldYRFpPSEpNM1NQQURLVkxYS0FPRkNaSzVVWExVUkdTRk9LVEo2QUJXWVJWVUMuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.zg5qsL5nZSnf2wa8YzoTNffREY9aGXMX9OEDURgWtx2RIcl9BZ3bkSMwbmb2CEFmiW40YnKpeKPdhMzZniKIDw\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2213,
     "content": "{\n  \"jti\": \"ZOPYYJNGSKZGWVDCKRHQLV3S5C7OSSW7GSSHUSEQMYSQVLH6PTHQ\",\n  \"iat\": 1791252470,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB.\\u003e\",\n        \"account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJDQlFWV0NRTVBOQ0RNUVlaNlRZMlhPM1lVSk9RVkwyU0NWQ0RCVlNRQ1haV1dUQUhTWFlBIiwiaWF0IjoxNzkxMjUyNDcwLCJpc3MiOiJBQkROSTc0UDJXSUlPSFJNSVhDS0tQUk43QkE0WlAzR0gyRDdJSllFTFEyR01PWUw2TElSVktWWSIsInN1YiI6IkFBTDJaTVk1SURWWFU2VTdGSFRGU0dFRVJIUk5DVVhHVDcyMkpURURZRzZFREtYTVNLWUlEQkhCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFMMlpNWTVJRFZYVTZVN0ZIVEZTR0VFUkhSTkNVWEdUNzIySlRFRFlHNkVES1hNU0tZSURCSEIuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.3_haZyvS3bPGBL38PcdMKk2-aE9gcxfiYN7lYqcLbaBvcELnCAnSdYV5FPvcY966LElvjpm76qYHLbzSomQGAg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\",\n      \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"CEKZTEF5LJGZJQDHJHL24YDCKCYMNDOMXULPGY5WYHS6U3GGQOXA\",\n  \"iat\": 1791252470,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJMVUhVV09ENFNFQUZaRFdGNUFFWVhOMlBGSkVWSU8zRFRITjNWSENPM0ZJVVZSRk5NVEtBIiwiaWF0IjoxNzkxMjUyNDcwLCJpc3MiOiJBREdUNUZTMkdTNTdNTEtEVkNEUVFXUDRZQkVCQjJIRTVaVlVaVVJFNUtDWlJaWkVDSU5FUkdCTyIsInN1YiI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQ0NLUzJUQ1dNRVpGQUNOTUtXSklXV1FJT0NPUVREUVpXWEw2U1NBVFNVSVhXNVNDUUY1RU4ySSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.8nu4lF5YyaHuheO97yvhISaMHvYOHe3kVg7SGIWxyTwNoD0fcMFFAfPQevVW_L_yO-3e4lx4BFqbZH5Fj0yBBA\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"MAGGYR2BOGFOKOEGLO33ITNFCSVPLTUXSPPGKQIATJP53VIFPXNQ\",\n  \"iat\": 1791252470,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"SYS\",\n  \"sub\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"TLNY77LZWNPQU2SU7MQ66NJL5WWU4ZJLM3IVZXSAAXLYIWODJTLA\",\n  \"iat\": 1791252470,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n  \"studio\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788466,\n  \"jti\": \"P7ESKGSYWNC6QRFBDGZO2NJLJNGUVA6D37KQYBMIJF4VICW3F33Q\",\n  \"iat\": 1791252466,\n  \"iss\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\",\n  \"name\": \"batch\",\n  \"sub\": \"UB4QFFGAO6IX5DBNAZM72WSZ3PZ4PRLJGJWERNC5H5WYJETZKQNVTSUG\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:4\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"6AEIACYDMUWQJ4JQIFZDKV4E4LGOIP32REXBRYLSILHB3EQH3HWQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\",\n  \"name\": \"ops\",\n  \"sub\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"F7J25POOW33LIC6WELW3P3OUB465HW4WFCDBJASOOWVC74YKPZSA\",\n  \"iat\": 1791252463,\n  \"iss\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\",\n  \"name\": \"rund\",\n  \"sub\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788470,\n  \"jti\": \"EL43K2HZX7IXY5SHXA2WPODVELIO6BVJ47D4KP5LWZXPMNXK74VQ\",\n  \"iat\": 1791252470,\n  \"iss\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\",\n  \"name\": \"studio\",\n  \"sub\": \"UBANSGDEPP66ZSB64OXQ5BHZZEC67OKXJTARS3XVWCYRLWVT4E5KJRD3\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"PEH3FCZGWPHCE3EV5FUVOWL4LEIKJSFZRQWDRTBMBQTZUUIMOCMQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 3856,
     "content": "{\n  \"manifest\": {\n    \"generation\": 5,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:07:50.090064+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n        \"signing\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n        \"signing\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\",\n        \"retiring\": \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"signing\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n        \"signing\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"signing\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UB4QFFGAO6IX5DBNAZM72WSZ3PZ4PRLJGJWERNC5H5WYJETZKQNVTSUG\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252466,\n        \"expires_at\": 1822788466,\n        \"signing_key\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UBANSGDEPP66ZSB64OXQ5BHZZEC67OKXJTARS3XVWCYRLWVT4E5KJRD3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252470,\n        \"expires_at\": 1822788470,\n        \"signing_key\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\",\n        \"reason\": \"rotation\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    ]\n  },\n  \"signer\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"signature\": \"3068a3b2989de0cc802a8cc81ca70c5bca0f66a36a5741310942d893e7e2a31302820a5e88682c28a42f9dfe4f017d2afed89f88f5075bd1ef977b2d52ba2304\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YE4I7JMBNYM23P42R6Y7ZBEZDRDPDR3UZ37HM34PY5H4WNF7QATQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"name\": \"garm\",\n  \"sub\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:56505",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC",
      "signing_keys": [
       "AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "CALLER-studio",
      "public": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB",
      "signing_keys": [
       "ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR",
       "ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "GARM",
      "public": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE",
      "signing_keys": [
       "ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "SYS",
      "public": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY",
      "signing_keys": [
       "AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "TOOLS",
      "public": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I",
      "signing_keys": [
       "ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO"
      ],
      "revocations": 0,
      "pushed": false
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC",
      "public": "UB4QFFGAO6IX5DBNAZM72WSZ3PZ4PRLJGJWERNC5H5WYJETZKQNVTSUG",
      "issuer": "AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:4"
      ],
      "expires": "2027-10-06T02:07:46Z",
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
      "account": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY",
      "public": "UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B",
      "issuer": "AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE",
      "public": "UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L",
      "issuer": "ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
      "account": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB",
      "public": "UBANSGDEPP66ZSB64OXQ5BHZZEC67OKXJTARS3XVWCYRLWVT4E5KJRD3",
      "issuer": "ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:5"
      ],
      "expires": "2027-10-06T02:07:50Z",
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
      "account": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I",
      "public": "UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L",
      "issuer": "ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
      "account": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB",
      "public": "UC22F7IQ6YI7E2DZDYXFGXSDEF5DJQPABCP3WLHI4PF2IG7JTTNDHY5V",
      "issuer": "ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
   "stdout": "CALLER-studio: retired signing key ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR; every credential it signed is now refused\nok: generation 6 from catalogue 24164e3e783d -- 5 accounts, 0 credentials, 0 revocations, written to topo\n",
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
     "content": "AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC"
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
     "content": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB"
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
     "content": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE"
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
     "content": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY"
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
     "content": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I"
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
     "path": "ceremony/keys/archive/CALLER-studio.signing.ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR.nk",
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
     "content": "{\n  \"jti\": \"YE4I7JMBNYM23P42R6Y7ZBEZDRDPDR3UZ37HM34PY5H4WNF7QATQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"name\": \"garm\",\n  \"sub\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "content": "{\n  \"manifest\": {\n    \"generation\": 6,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:07:56.770398+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n        \"signing\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n        \"signing\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\",\n        \"retired\": {\n          \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\": 6\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"signing\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n        \"signing\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"signing\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UB4QFFGAO6IX5DBNAZM72WSZ3PZ4PRLJGJWERNC5H5WYJETZKQNVTSUG\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252466,\n        \"expires_at\": 1822788466,\n        \"signing_key\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UBANSGDEPP66ZSB64OXQ5BHZZEC67OKXJTARS3XVWCYRLWVT4E5KJRD3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252470,\n        \"expires_at\": 1822788470,\n        \"signing_key\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    ]\n  },\n  \"signer\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"signature\": \"7466704dc32278a204dc79cb3d4281e86993d5d2346be8a9437f074125f34c3414b3cdc5301b5919d73ff69d64f890b04e375146fcc27a6e5ed7684930c23e0e\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2133,
     "content": "{\n  \"jti\": \"FTDOPRXQTCMFESDLWIHRQZ35NVEN2QT2XHBMOETHEGSR6VTSMLDA\",\n  \"iat\": 1791252476,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC.\\u003e\",\n        \"account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiIzWkNDN0IzQUY3U0dQWEpQTENYS1hSUFBNVjNFSEJBNDdWWkFIRzIzSkRPSU9YNkdYSFpBIiwiaWF0IjoxNzkxMjUyNDc2LCJpc3MiOiJBQkROSTc0UDJXSUlPSFJNSVhDS0tQUk43QkE0WlAzR0gyRDdJSllFTFEyR01PWUw2TElSVktWWSIsInN1YiI6IkFBN0ZQWk9UREZXWERaT0hKTTNTUEFES1ZMWEtBT0ZDWks1VVhMVVJHU0ZPS1RKNkFCV1lSVlVDIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUE3RlBaT1RERldYRFpPSEpNM1NQQURLVkxYS0FPRkNaSzVVWExVUkdTRk9LVEo2QUJXWVJWVUMuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.XrHApsejis5Fc_vQEQdG6BHgVtjskPE6_Cf_eiELoxxbT_vfPM_2K0zWHgP9rbvwtcmvZITv9IuanyROVIMdCg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"WV4RKSLAM3RIUF37SN5EYAKXUEXRHYC2QEYZ22TBXAUHR6CXCRNQ\",\n  \"iat\": 1791252476,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB.\\u003e\",\n        \"account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiIzWEtPUEE1S1A2S0dXMzNIWlIyNUtPSFpZVkpDR0tRQk1ENVRFTE9HRk5JNzdGWUJNTkRRIiwiaWF0IjoxNzkxMjUyNDc2LCJpc3MiOiJBQkROSTc0UDJXSUlPSFJNSVhDS0tQUk43QkE0WlAzR0gyRDdJSllFTFEyR01PWUw2TElSVktWWSIsInN1YiI6IkFBTDJaTVk1SURWWFU2VTdGSFRGU0dFRVJIUk5DVVhHVDcyMkpURURZRzZFREtYTVNLWUlEQkhCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFMMlpNWTVJRFZYVTZVN0ZIVEZTR0VFUkhSTkNVWEdUNzIySlRFRFlHNkVES1hNU0tZSURCSEIuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.tY2Mf7bvguWQMXDffVvRM_hFk807IzO0f0irUh1SFF38wrGpiIgszz5pAXQUh7qhRBgywMh1HFewO7TizgjyBA\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"UUA3TIJ232HXNO32J57333F25BI3HFG2V5FJ3GEV6NOG2TIJCTHQ\",\n  \"iat\": 1791252476,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJURVFOU1NMT1hYNldPVExFRTdBSEhKUVIzNE8zMjNYTVRRWk9JQjZDRUhJU0tHUFBNSUpBIiwiaWF0IjoxNzkxMjUyNDc2LCJpc3MiOiJBREdUNUZTMkdTNTdNTEtEVkNEUVFXUDRZQkVCQjJIRTVaVlVaVVJFNUtDWlJaWkVDSU5FUkdCTyIsInN1YiI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQ0NLUzJUQ1dNRVpGQUNOTUtXSklXV1FJT0NPUVREUVpXWEw2U1NBVFNVSVhXNVNDUUY1RU4ySSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.9fh3D6LDxNYxItSVMNGylKGtzA0PfzDqZO_Jo34Jk0ucoiFTKBR3ov3y3_Un9nK1hkbeluxQi8kPvk7j4V19BA\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"BTKXJIZH6WLSXYUBPULV2QJS72C3HDLGHCJHTBFMYEK37Z5ITBHA\",\n  \"iat\": 1791252476,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"SYS\",\n  \"sub\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"WFIB2WM3Y2USEOZDLPNG6XIEHJ2YNDX7KFTNZ7PKJSXQCSKXZMFA\",\n  \"iat\": 1791252476,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n  \"studio\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788466,\n  \"jti\": \"P7ESKGSYWNC6QRFBDGZO2NJLJNGUVA6D37KQYBMIJF4VICW3F33Q\",\n  \"iat\": 1791252466,\n  \"iss\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\",\n  \"name\": \"batch\",\n  \"sub\": \"UB4QFFGAO6IX5DBNAZM72WSZ3PZ4PRLJGJWERNC5H5WYJETZKQNVTSUG\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:4\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"6AEIACYDMUWQJ4JQIFZDKV4E4LGOIP32REXBRYLSILHB3EQH3HWQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\",\n  \"name\": \"ops\",\n  \"sub\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"F7J25POOW33LIC6WELW3P3OUB465HW4WFCDBJASOOWVC74YKPZSA\",\n  \"iat\": 1791252463,\n  \"iss\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\",\n  \"name\": \"rund\",\n  \"sub\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788470,\n  \"jti\": \"EL43K2HZX7IXY5SHXA2WPODVELIO6BVJ47D4KP5LWZXPMNXK74VQ\",\n  \"iat\": 1791252470,\n  \"iss\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\",\n  \"name\": \"studio\",\n  \"sub\": \"UBANSGDEPP66ZSB64OXQ5BHZZEC67OKXJTARS3XVWCYRLWVT4E5KJRD3\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"PEH3FCZGWPHCE3EV5FUVOWL4LEIKJSFZRQWDRTBMBQTZUUIMOCMQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3850,
     "content": "{\n  \"manifest\": {\n    \"generation\": 6,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:07:56.770398+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n        \"signing\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n        \"signing\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\",\n        \"retired\": {\n          \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\": 6\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"signing\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n        \"signing\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"signing\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UB4QFFGAO6IX5DBNAZM72WSZ3PZ4PRLJGJWERNC5H5WYJETZKQNVTSUG\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 4,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252466,\n        \"expires_at\": 1822788466,\n        \"signing_key\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UBANSGDEPP66ZSB64OXQ5BHZZEC67OKXJTARS3XVWCYRLWVT4E5KJRD3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252470,\n        \"expires_at\": 1822788470,\n        \"signing_key\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    ]\n  },\n  \"signer\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"signature\": \"7466704dc32278a204dc79cb3d4281e86993d5d2346be8a9437f074125f34c3414b3cdc5301b5919d73ff69d64f890b04e375146fcc27a6e5ed7684930c23e0e\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YE4I7JMBNYM23P42R6Y7ZBEZDRDPDR3UZ37HM34PY5H4WNF7QATQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"name\": \"garm\",\n  \"sub\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:56505",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC",
      "signing_keys": [
       "AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "CALLER-studio",
      "public": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB",
      "signing_keys": [
       "ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE",
      "signing_keys": [
       "ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY",
      "signing_keys": [
       "AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I",
      "signing_keys": [
       "ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO"
      ],
      "revocations": 0,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC",
      "public": "UB4QFFGAO6IX5DBNAZM72WSZ3PZ4PRLJGJWERNC5H5WYJETZKQNVTSUG",
      "issuer": "AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:4"
      ],
      "expires": "2027-10-06T02:07:46Z",
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
      "account": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY",
      "public": "UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B",
      "issuer": "AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE",
      "public": "UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L",
      "issuer": "ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
      "account": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB",
      "public": "UBANSGDEPP66ZSB64OXQ5BHZZEC67OKXJTARS3XVWCYRLWVT4E5KJRD3",
      "issuer": "ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:5"
      ],
      "expires": "2027-10-06T02:07:50Z",
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
      "account": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I",
      "public": "UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L",
      "issuer": "ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
      "account": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB",
      "public": "UC22F7IQ6YI7E2DZDYXFGXSDEF5DJQPABCP3WLHI4PF2IG7JTTNDHY5V",
      "issuer": "ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
     "content": "AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC"
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
     "content": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB"
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
     "content": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE"
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
     "content": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY"
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
     "content": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I"
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
     "path": "ceremony/keys/archive/CALLER-studio.signing.ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR.nk",
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
     "content": "{\n  \"jti\": \"YE4I7JMBNYM23P42R6Y7ZBEZDRDPDR3UZ37HM34PY5H4WNF7QATQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"name\": \"garm\",\n  \"sub\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "content": "{\n  \"manifest\": {\n    \"generation\": 7,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:07:58.006923+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n        \"signing\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n        \"signing\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\",\n        \"retired\": {\n          \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\": 6\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"signing\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n        \"signing\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"signing\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDUNH6I57KZHBUSCYCK4VMBAMPFTRZ745CMCPN2YQTWPQ23HBORV2PRR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 7,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252478,\n        \"expires_at\": 1822788478,\n        \"signing_key\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\",\n        \"reason\": \"reissued\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UBANSGDEPP66ZSB64OXQ5BHZZEC67OKXJTARS3XVWCYRLWVT4E5KJRD3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252470,\n        \"expires_at\": 1822788470,\n        \"signing_key\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    ]\n  },\n  \"signer\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"signature\": \"5b4bbc588ad20bcf506165958f4c1ee6d1fe1c0a3e48b2127ba1faf90f7cdf65f8df27743b7b97aaa222c7db9ed7a81bc606890500cdd5f7b442e0829f418f0d\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2248,
     "content": "{\n  \"jti\": \"2AQSWDUZQZRS4EZQQQQPX6L3WJMI7HI4RN573IGOGX6MK22PRK4Q\",\n  \"iat\": 1791252478,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC.\\u003e\",\n        \"account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJXRE00WVA2UElMR1dCR0RJMllDUFpTVlg2QUo0NEFLT0U0RjdMQ1ZCQUdPN01PWUtJWjZBIiwiaWF0IjoxNzkxMjUyNDc4LCJpc3MiOiJBQkROSTc0UDJXSUlPSFJNSVhDS0tQUk43QkE0WlAzR0gyRDdJSllFTFEyR01PWUw2TElSVktWWSIsInN1YiI6IkFBN0ZQWk9UREZXWERaT0hKTTNTUEFES1ZMWEtBT0ZDWks1VVhMVVJHU0ZPS1RKNkFCV1lSVlVDIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUE3RlBaT1RERldYRFpPSEpNM1NQQURLVkxYS0FPRkNaSzVVWExVUkdTRk9LVEo2QUJXWVJWVUMuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.wTsSbjiGS2cy4PEzTVs0GC_BJkX87uXUmYFCChMzox8jJHGnclvMeQ8sxbeG5XeYXPwbBXU7SIzNahKjAFWcAw\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n    ],\n    \"revocations\": {\n      \"UB4QFFGAO6IX5DBNAZM72WSZ3PZ4PRLJGJWERNC5H5WYJETZKQNVTSUG\": 1791252478\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"FS7FM2RVCXNAU5RFTL3YRHEMO4MGVXBN3LLOYOPCNCIIDMUKL2QQ\",\n  \"iat\": 1791252478,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB.\\u003e\",\n        \"account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJWSk9RRlZOWUlKN1dKRE5SV0lOM1pLQjNJTVA3SDVVVEdDWDRKUzVIVkpUSUc3VTdMR1lRIiwiaWF0IjoxNzkxMjUyNDc4LCJpc3MiOiJBQkROSTc0UDJXSUlPSFJNSVhDS0tQUk43QkE0WlAzR0gyRDdJSllFTFEyR01PWUw2TElSVktWWSIsInN1YiI6IkFBTDJaTVk1SURWWFU2VTdGSFRGU0dFRVJIUk5DVVhHVDcyMkpURURZRzZFREtYTVNLWUlEQkhCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFMMlpNWTVJRFZYVTZVN0ZIVEZTR0VFUkhSTkNVWEdUNzIySlRFRFlHNkVES1hNU0tZSURCSEIuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0._LVCTs_0De5vB1AkkMPQHp5F6L3PmPxkQqXZThs53bTM5HKLrRGSWVtoOAf7DT__9CgQSmMyGubnxetZLhgACg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"ZDX7ENPFK7NUHIO64P6FDKZCSY6Z3QK55UJNHF7WQ65JOCG6J7NA\",\n  \"iat\": 1791252478,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJQVzdLUlozRkEyUTJPNEk0R0JLSExNUUtCRUJTN0tUQldZRjJIUVNYWFhISzJMS1dNWFhBIiwiaWF0IjoxNzkxMjUyNDc4LCJpc3MiOiJBREdUNUZTMkdTNTdNTEtEVkNEUVFXUDRZQkVCQjJIRTVaVlVaVVJFNUtDWlJaWkVDSU5FUkdCTyIsInN1YiI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQ0NLUzJUQ1dNRVpGQUNOTUtXSklXV1FJT0NPUVREUVpXWEw2U1NBVFNVSVhXNVNDUUY1RU4ySSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.AU9glh88sK6bKKa0Bfj729-ZY1QT9yGAEqefSe8jmjEg_Ljn0kYdxZksz7Cpp_XlMtuvas2IJT_joXnaYysoCA\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"NXJQEZMYTO74COHDF3GNQ5HNZGKOPOFK5X6UWHYZALNCMHBQCVAA\",\n  \"iat\": 1791252478,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"SYS\",\n  \"sub\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"OHUZSYDFZRFEAF2FOZFYKFK2DJAPABPICMK7KXXIOAEHSTN2W74A\",\n  \"iat\": 1791252478,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n  \"studio\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "changed",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788478,\n  \"jti\": \"MH27BJKLTBZ3NN377YYN5CMSGAYKJJNLT5BLIPIDXRWK4HLGHHSQ\",\n  \"iat\": 1791252478,\n  \"iss\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\",\n  \"name\": \"batch\",\n  \"sub\": \"UDUNH6I57KZHBUSCYCK4VMBAMPFTRZ745CMCPN2YQTWPQ23HBORV2PRR\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:7\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"6AEIACYDMUWQJ4JQIFZDKV4E4LGOIP32REXBRYLSILHB3EQH3HWQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\",\n  \"name\": \"ops\",\n  \"sub\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"F7J25POOW33LIC6WELW3P3OUB465HW4WFCDBJASOOWVC74YKPZSA\",\n  \"iat\": 1791252463,\n  \"iss\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\",\n  \"name\": \"rund\",\n  \"sub\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788470,\n  \"jti\": \"EL43K2HZX7IXY5SHXA2WPODVELIO6BVJ47D4KP5LWZXPMNXK74VQ\",\n  \"iat\": 1791252470,\n  \"iss\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\",\n  \"name\": \"studio\",\n  \"sub\": \"UBANSGDEPP66ZSB64OXQ5BHZZEC67OKXJTARS3XVWCYRLWVT4E5KJRD3\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"PEH3FCZGWPHCE3EV5FUVOWL4LEIKJSFZRQWDRTBMBQTZUUIMOCMQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3880,
     "content": "{\n  \"manifest\": {\n    \"generation\": 7,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:07:58.006923+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n        \"signing\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n        \"signing\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\",\n        \"retired\": {\n          \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\": 6\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"signing\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n        \"signing\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"signing\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDUNH6I57KZHBUSCYCK4VMBAMPFTRZ745CMCPN2YQTWPQ23HBORV2PRR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 7,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252478,\n        \"expires_at\": 1822788478,\n        \"signing_key\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\",\n        \"reason\": \"reissued\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UBANSGDEPP66ZSB64OXQ5BHZZEC67OKXJTARS3XVWCYRLWVT4E5KJRD3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252470,\n        \"expires_at\": 1822788470,\n        \"signing_key\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    ]\n  },\n  \"signer\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"signature\": \"5b4bbc588ad20bcf506165958f4c1ee6d1fe1c0a3e48b2127ba1faf90f7cdf65f8df27743b7b97aaa222c7db9ed7a81bc606890500cdd5f7b442e0829f418f0d\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YE4I7JMBNYM23P42R6Y7ZBEZDRDPDR3UZ37HM34PY5H4WNF7QATQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"name\": \"garm\",\n  \"sub\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 249,
     "content": "[\n  {\n    \"Name\": \"batch\",\n    \"Account\": \"CALLER-batch\",\n    \"Public\": \"UB4QFFGAO6IX5DBNAZM72WSZ3PZ4PRLJGJWERNC5H5WYJETZKQNVTSUG\",\n    \"At\": \"2026-10-06T06:07:58.006923+04:00\",\n    \"Kind\": \"superseded\",\n    \"Why\": \"superseded by generation 7\"\n  }\n]"
    }
   ],
   "bus": {
    "server": "tls://127.0.0.1:56505",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC",
      "signing_keys": [
       "AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG"
      ],
      "revocations": 1,
      "pushed": true
     },
     {
      "name": "CALLER-studio",
      "public": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB",
      "signing_keys": [
       "ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE",
      "signing_keys": [
       "ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY",
      "signing_keys": [
       "AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I",
      "signing_keys": [
       "ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO"
      ],
      "revocations": 0,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC",
      "public": "UDUNH6I57KZHBUSCYCK4VMBAMPFTRZ745CMCPN2YQTWPQ23HBORV2PRR",
      "issuer": "AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:7"
      ],
      "expires": "2027-10-06T02:07:58Z",
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
      "account": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY",
      "public": "UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B",
      "issuer": "AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE",
      "public": "UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L",
      "issuer": "ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
      "account": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB",
      "public": "UBANSGDEPP66ZSB64OXQ5BHZZEC67OKXJTARS3XVWCYRLWVT4E5KJRD3",
      "issuer": "ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:5"
      ],
      "expires": "2027-10-06T02:07:50Z",
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
      "account": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I",
      "public": "UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L",
      "issuer": "ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T02:07:43Z",
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
   "stdout": "generation 7 from catalogue 24164e3e783d, issued 2026-10-06T06:07:58+04:00; 5 credentials\n  CALLER-batch  identity AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC  signing AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\n  CALLER-studio  identity AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB  signing ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\n  GARM  identity ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE  signing ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\n  SYS  identity ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY  signing AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\n  TOOLS  identity ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I  signing ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\n",
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
     "content": "AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC"
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
     "content": "AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB"
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
     "content": "ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE"
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
     "content": "ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY"
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
     "content": "ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I"
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
     "path": "ceremony/keys/archive/CALLER-studio.signing.ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR.nk",
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
     "content": "{\n  \"jti\": \"YE4I7JMBNYM23P42R6Y7ZBEZDRDPDR3UZ37HM34PY5H4WNF7QATQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"name\": \"garm\",\n  \"sub\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "content": "{\n  \"manifest\": {\n    \"generation\": 7,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:07:58.006923+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n        \"signing\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n        \"signing\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\",\n        \"retired\": {\n          \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\": 6\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"signing\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n        \"signing\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"signing\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDUNH6I57KZHBUSCYCK4VMBAMPFTRZ745CMCPN2YQTWPQ23HBORV2PRR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 7,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252478,\n        \"expires_at\": 1822788478,\n        \"signing_key\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\",\n        \"reason\": \"reissued\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UBANSGDEPP66ZSB64OXQ5BHZZEC67OKXJTARS3XVWCYRLWVT4E5KJRD3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252470,\n        \"expires_at\": 1822788470,\n        \"signing_key\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    ]\n  },\n  \"signer\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"signature\": \"5b4bbc588ad20bcf506165958f4c1ee6d1fe1c0a3e48b2127ba1faf90f7cdf65f8df27743b7b97aaa222c7db9ed7a81bc606890500cdd5f7b442e0829f418f0d\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2248,
     "content": "{\n  \"jti\": \"2AQSWDUZQZRS4EZQQQQPX6L3WJMI7HI4RN573IGOGX6MK22PRK4Q\",\n  \"iat\": 1791252478,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC.\\u003e\",\n        \"account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJXRE00WVA2UElMR1dCR0RJMllDUFpTVlg2QUo0NEFLT0U0RjdMQ1ZCQUdPN01PWUtJWjZBIiwiaWF0IjoxNzkxMjUyNDc4LCJpc3MiOiJBQkROSTc0UDJXSUlPSFJNSVhDS0tQUk43QkE0WlAzR0gyRDdJSllFTFEyR01PWUw2TElSVktWWSIsInN1YiI6IkFBN0ZQWk9UREZXWERaT0hKTTNTUEFES1ZMWEtBT0ZDWks1VVhMVVJHU0ZPS1RKNkFCV1lSVlVDIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUE3RlBaT1RERldYRFpPSEpNM1NQQURLVkxYS0FPRkNaSzVVWExVUkdTRk9LVEo2QUJXWVJWVUMuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.wTsSbjiGS2cy4PEzTVs0GC_BJkX87uXUmYFCChMzox8jJHGnclvMeQ8sxbeG5XeYXPwbBXU7SIzNahKjAFWcAw\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n    ],\n    \"revocations\": {\n      \"UB4QFFGAO6IX5DBNAZM72WSZ3PZ4PRLJGJWERNC5H5WYJETZKQNVTSUG\": 1791252478\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"FS7FM2RVCXNAU5RFTL3YRHEMO4MGVXBN3LLOYOPCNCIIDMUKL2QQ\",\n  \"iat\": 1791252478,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB.\\u003e\",\n        \"account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJWSk9RRlZOWUlKN1dKRE5SV0lOM1pLQjNJTVA3SDVVVEdDWDRKUzVIVkpUSUc3VTdMR1lRIiwiaWF0IjoxNzkxMjUyNDc4LCJpc3MiOiJBQkROSTc0UDJXSUlPSFJNSVhDS0tQUk43QkE0WlAzR0gyRDdJSllFTFEyR01PWUw2TElSVktWWSIsInN1YiI6IkFBTDJaTVk1SURWWFU2VTdGSFRGU0dFRVJIUk5DVVhHVDcyMkpURURZRzZFREtYTVNLWUlEQkhCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFMMlpNWTVJRFZYVTZVN0ZIVEZTR0VFUkhSTkNVWEdUNzIySlRFRFlHNkVES1hNU0tZSURCSEIuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0._LVCTs_0De5vB1AkkMPQHp5F6L3PmPxkQqXZThs53bTM5HKLrRGSWVtoOAf7DT__9CgQSmMyGubnxetZLhgACg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"ZDX7ENPFK7NUHIO64P6FDKZCSY6Z3QK55UJNHF7WQ65JOCG6J7NA\",\n  \"iat\": 1791252478,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJQVzdLUlozRkEyUTJPNEk0R0JLSExNUUtCRUJTN0tUQldZRjJIUVNYWFhISzJMS1dNWFhBIiwiaWF0IjoxNzkxMjUyNDc4LCJpc3MiOiJBREdUNUZTMkdTNTdNTEtEVkNEUVFXUDRZQkVCQjJIRTVaVlVaVVJFNUtDWlJaWkVDSU5FUkdCTyIsInN1YiI6IkFDWUlEVUNVT0ZKT0I0U1VMT0ZERE83R0hQU0tJR0dCVkI0TTZTNVFBSlAyMzU2VElFRURWRFpFIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQ0NLUzJUQ1dNRVpGQUNOTUtXSklXV1FJT0NPUVREUVpXWEw2U1NBVFNVSVhXNVNDUUY1RU4ySSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.AU9glh88sK6bKKa0Bfj729-ZY1QT9yGAEqefSe8jmjEg_Ljn0kYdxZksz7Cpp_XlMtuvas2IJT_joXnaYysoCA\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"NXJQEZMYTO74COHDF3GNQ5HNZGKOPOFK5X6UWHYZALNCMHBQCVAA\",\n  \"iat\": 1791252478,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"SYS\",\n  \"sub\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"OHUZSYDFZRFEAF2FOZFYKFK2DJAPABPICMK7KXXIOAEHSTN2W74A\",\n  \"iat\": 1791252478,\n  \"iss\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n  \"studio\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788478,\n  \"jti\": \"MH27BJKLTBZ3NN377YYN5CMSGAYKJJNLT5BLIPIDXRWK4HLGHHSQ\",\n  \"iat\": 1791252478,\n  \"iss\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\",\n  \"name\": \"batch\",\n  \"sub\": \"UDUNH6I57KZHBUSCYCK4VMBAMPFTRZ745CMCPN2YQTWPQ23HBORV2PRR\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:7\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"6AEIACYDMUWQJ4JQIFZDKV4E4LGOIP32REXBRYLSILHB3EQH3HWQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\",\n  \"name\": \"ops\",\n  \"sub\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"F7J25POOW33LIC6WELW3P3OUB465HW4WFCDBJASOOWVC74YKPZSA\",\n  \"iat\": 1791252463,\n  \"iss\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\",\n  \"name\": \"rund\",\n  \"sub\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788470,\n  \"jti\": \"EL43K2HZX7IXY5SHXA2WPODVELIO6BVJ47D4KP5LWZXPMNXK74VQ\",\n  \"iat\": 1791252470,\n  \"iss\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\",\n  \"name\": \"studio\",\n  \"sub\": \"UBANSGDEPP66ZSB64OXQ5BHZZEC67OKXJTARS3XVWCYRLWVT4E5KJRD3\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822788463,\n  \"jti\": \"PEH3FCZGWPHCE3EV5FUVOWL4LEIKJSFZRQWDRTBMBQTZUUIMOCMQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 3880,
     "content": "{\n  \"manifest\": {\n    \"generation\": 7,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T06:07:58.006923+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AA7FPZOTDFWXDZOHJM3SPADKVLXKAOFCZK5UXLURGSFOKTJ6ABWYRVUC\",\n        \"signing\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AAL2ZMY5IDVXU6U7FHTFSGEERHRNCUXGT722JTEDYG6EDKXMSKYIDBHB\",\n        \"signing\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\",\n        \"retired\": {\n          \"ACCM4SWAS7NREHMNSH2HERXXX7VVQT4KSJE5IRFJGCOMTSWEKFGKT2AR\": 6\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ACYIDUCUOFJOB4SULOFDDO7GHPSKIGGBVB4M6S5QAJP2356TIEEDVDZE\",\n        \"signing\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      \"SYS\": {\n        \"identity\": \"ACGVAL3HL77J4CJWXDU5MQC4UTQLAUGP5WFVHDKWJQLK6IH7XJFAZVEY\",\n        \"signing\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"ACCKS2TCWMEZFACNMKWJIWWQIOCOQTDQZWXL6SSATSUIXW5SCQF5EN2I\",\n        \"signing\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDUNH6I57KZHBUSCYCK4VMBAMPFTRZ745CMCPN2YQTWPQ23HBORV2PRR\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 7,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791252478,\n        \"expires_at\": 1822788478,\n        \"signing_key\": \"AAIEWA2XUJJOADS5SJTEN32CKWODQBCT4VFAWYTILG76WZ4FONGFMQTG\",\n        \"reason\": \"reissued\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAHQHCTO4QYJ27UUT5G6H3FW64DKJPRWBZ7IL3OFH4NUGFYSHSANT55B\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"AAMQBSP2VLWH66OBT5KFU7VH7MAON7J52H2KAZM2HHO2TQZUK6GWBIOE\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UB4SPWXBPDBHP6G5ZWIV7HPKVL4GCLTEBNH3ST74MQXV2T424UVUAQ2L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ABDNI74P2WIIOHRMIXCKKPRN7BA4ZP3GH2D7IJYELQ2GMOYL6LIRVKVY\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UBANSGDEPP66ZSB64OXQ5BHZZEC67OKXJTARS3XVWCYRLWVT4E5KJRD3\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791252470,\n        \"expires_at\": 1822788470,\n        \"signing_key\": \"ADJNCAVD6FEZQZBMCK3V3Z4XWSN44FMTRXHHIAJEG3QFPETS6T7HG5PE\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UBC3LDVSRJHGSILZOI5ZK2LBK4GIJZQYDR66SL4IKNDSPCB3CDTQW57L\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791252463,\n        \"expires_at\": 1822788463,\n        \"signing_key\": \"ADGT5FS2GS57MLKDVCDQQWP4YBEBB2HE5ZVUZURE5KCZRZZECINERGBO\"\n      }\n    ]\n  },\n  \"signer\": \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\",\n  \"signature\": \"5b4bbc588ad20bcf506165958f4c1ee6d1fe1c0a3e48b2127ba1faf90f7cdf65f8df27743b7b97aaa222c7db9ed7a81bc606890500cdd5f7b442e0829f418f0d\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"YE4I7JMBNYM23P42R6Y7ZBEZDRDPDR3UZ37HM34PY5H4WNF7QATQ\",\n  \"iat\": 1791252463,\n  \"iss\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"name\": \"garm\",\n  \"sub\": \"OCO6EZBDN6MHTZXFCYQOUYWOEKM3B66QJG4CWETSTJMGZ7H4GTJY6F5Q\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OATUOGUFVWAVOFQSW4LN5JVYWRLT3KITZYLOLDPHGIVBS62U6MGWGO5L\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 249,
     "content": "[\n  {\n    \"Name\": \"batch\",\n    \"Account\": \"CALLER-batch\",\n    \"Public\": \"UB4QFFGAO6IX5DBNAZM72WSZ3PZ4PRLJGJWERNC5H5WYJETZKQNVTSUG\",\n    \"At\": \"2026-10-06T06:07:58.006923+04:00\",\n    \"Kind\": \"superseded\",\n    \"Why\": \"superseded by generation 7\"\n  }\n]"
    }
   ]
  }
 ]
}
;
