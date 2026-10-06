// Written by `mise run topology-walk` (cmd/garmctl/walk_test.go): the lifecycle of
// docs/operating-the-topology.md run for real and recorded. Regenerate, do not edit.
window.TOPOLOGY_WALK = {
 "generated_at": "2026-10-06T09:02:06Z",
 "steps": [
  {
   "id": "ceremony",
   "title": "The root ceremony, once, offline",
   "prose": "`garmctl operator init` mints the operator root and the operator signing key, writes the root-signed operator JWT, and puts the root under `root/` for custody. Everything `topology` will ever need is under `keys/`; the root is not.",
   "command": "garmctl operator init --out ceremony",
   "stdout": "ok: operator OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP; keys for topology in ceremony/keys\nMOVE ceremony/root TO CUSTODY NOW: the root signs nothing day to day and must never be where topology runs\n",
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
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "content": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ"
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
     "content": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7"
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
     "content": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY"
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
     "content": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI"
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
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "content": "{\n  \"manifest\": {\n    \"generation\": 1,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T13:01:49.657419+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n        \"signing\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"signing\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      \"SYS\": {\n        \"identity\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n        \"signing\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"signing\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\",\n        \"reason\": \"new\"\n      }\n    ]\n  },\n  \"signer\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"signature\": \"bfbab10dde269fbf0255f9647793db868c3ca4a0911802c7440c998a9598de26acfae195597e33c6ab9b5d55482e8b6fc563414d761c9244ded5a71964346f08\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"Z24D6WLM4ASDM75PV3TXFJJCSQHTJARAEKYKHSI4USF6LP7ZKALQ\",\n  \"iat\": 1791277309,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ.\\u003e\",\n        \"account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJRNUs0NEJOUk9YN1VPQk1TMlhNVk1USFNERUlFS1NMUzdaVU9IWklLVldPSkMzQTI1RkNBIiwiaWF0IjoxNzkxMjc3MzA5LCJpc3MiOiJBRENRT0xNRlVRVkk3RUNTU1IyNlc0T05HWFZWSEhFQzI2WE9PUzVMNUdIRzdQRUdQWVpYQVYzRyIsInN1YiI6IkFEMjdXVE9UNEVJM0hFNDVFQlhTQkNQVUhGWFdTV0pFRUUyRUdHM0xMWklPM0RCTlA1NDdZWkNRIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUQyN1dUT1Q0RUkzSEU0NUVCWFNCQ1BVSEZYV1NXSkVFRTJFR0czTExaSU8zREJOUDU0N1laQ1EuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.v5B-kJNlDkV48jXYXYayemENVSivcbry1zVzxneacsALIjeQTcgN0qRJD6G0X73mwdlpW-hGlLyMvfvGlV6LDg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"PLU5OAHFNURWOH5QMRQEAQBRGMASZUQFUOH7NTLY46WTRZUDC42Q\",\n  \"iat\": 1791277309,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJRVTZVSlZaNTdMUzU1S0pGRUkyTEZQUzZJU1dGN0NFS08zWFRQSlFOVkpWSE5HNjJBWENBIiwiaWF0IjoxNzkxMjc3MzA5LCJpc3MiOiJBQjZDWlJBWVdIUUFXNzYzTkxXMkhYQk9WUFpTR09XNVZFSkZMTzRNQlJMTU5JRElZQ1FZVzQ0VSIsInN1YiI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQUNVVE9YR0tGT0c2VkdUTUhKRTRDTFJNNVhETDdKS0ZFWDJQNkxOT1NZWklTM0ZJSVBYS1NUSSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.yBDPNUPVmqfuGj-3ZdeXKy-f3ouXR3QGdrTPWIOoWt-_Q3qZePy9qEUUvEvlUoSdNkVnXbBmvShBNiQiK7zjCw\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"OH745CBHFT3YU4S5NOMMK6L3SUKLFOJZ2ADNDYNZYTTQKE7Z2VGQ\",\n  \"iat\": 1791277309,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"SYS\",\n  \"sub\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"NEETNRPSRZ6AF3MTQT5TC6IE6XHTOD25B7XOQ3MORLBZYHHRKQFQ\",\n  \"iat\": 1791277309,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "new",
     "secret": false,
     "size": 74,
     "content": "{\n  \"studio\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\"\n}"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"JOZ5EPLT7TQF2C42SDAH4ECIX6RZRQD2WLRN75KUZLPSEVR36SQQ\",\n  \"iat\": 1791277309,\n  \"iss\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\",\n  \"name\": \"ops\",\n  \"sub\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"YOBOFUF7UXKB66VMGWMQZZJN6JVLFQNNQAG5XZQU66UH4D4R2J6Q\",\n  \"iat\": 1791277309,\n  \"iss\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\",\n  \"name\": \"rund\",\n  \"sub\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"X375EUNMP6BSC6U6653INJL55FYOP3HYL2MB2RXZKNIF6OMO33YA\",\n  \"iat\": 1791277309,\n  \"iss\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\",\n  \"name\": \"studio\",\n  \"sub\": \"UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"OZDQG7LQN6SJN6OAPPUWQNBO45QJWOLBF67W2RCR5SBRIS34KWVA\",\n  \"iat\": 1791277309,\n  \"iss\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "new",
     "secret": false,
     "size": 3182,
     "content": "{\n  \"manifest\": {\n    \"generation\": 1,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T13:01:49.657419+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n        \"signing\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"signing\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      \"SYS\": {\n        \"identity\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n        \"signing\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"signing\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\",\n        \"reason\": \"new\"\n      }\n    ]\n  },\n  \"signer\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"signature\": \"bfbab10dde269fbf0255f9647793db868c3ca4a0911802c7440c998a9598de26acfae195597e33c6ab9b5d55482e8b6fc563414d761c9244ded5a71964346f08\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:62849",
    "accounts": [
     {
      "name": "CALLER-studio",
      "public": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "signing_keys": [
       "ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "GARM",
      "public": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7",
      "signing_keys": [
       "ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "SYS",
      "public": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY",
      "signing_keys": [
       "AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "TOOLS",
      "public": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "signing_keys": [
       "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U"
      ],
      "revocations": 0,
      "pushed": false
     }
    ],
    "creds": [
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY",
      "public": "UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA",
      "issuer": "AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7",
      "public": "UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF",
      "issuer": "ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
      "account": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "public": "UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4",
      "issuer": "ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
      "account": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "public": "UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN",
      "issuer": "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
     "content": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ"
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
     "content": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7"
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
     "content": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY"
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
     "content": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI"
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
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "content": "{\n  \"manifest\": {\n    \"generation\": 2,\n    \"catalogue_sha256\": \"f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n    \"issued_at\": \"2026-10-06T13:01:50.926007+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n        \"signing\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"signing\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      \"SYS\": {\n        \"identity\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n        \"signing\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"signing\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      },\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\",\n        \"catalogue_sha256\": \"f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n        \"generation\": 2,\n        \"permissions_hash\": \"19ef9109d050959e\",\n        \"issued_at\": 1791277310,\n        \"expires_at\": 1822813310,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\",\n        \"reason\": \"new\"\n      }\n    ]\n  },\n  \"signer\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"signature\": \"b1fd655563dd3f994a0a96a3813e75088db4600e29342ed6fbaa9c23cef911c95a18f0a6f5eaa7632fdcaccd2324fe5b68d78c0626251f73b2c9216aa0bb290a\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"2BQLFE3MZFOCBFTFRJUSH5RLPQ7AW5XJV3KOJOARUJRMWYUCUYBQ\",\n  \"iat\": 1791277310,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ.\\u003e\",\n        \"account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJHRFVTR0RBT01PSEdBWk1RSkJSWlBGR1I3TjVKWjc0VFgyTDdJU002T1hDMk03VkZURTNBIiwiaWF0IjoxNzkxMjc3MzEwLCJpc3MiOiJBRENRT0xNRlVRVkk3RUNTU1IyNlc0T05HWFZWSEhFQzI2WE9PUzVMNUdIRzdQRUdQWVpYQVYzRyIsInN1YiI6IkFEMjdXVE9UNEVJM0hFNDVFQlhTQkNQVUhGWFdTV0pFRUUyRUdHM0xMWklPM0RCTlA1NDdZWkNRIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUQyN1dUT1Q0RUkzSEU0NUVCWFNCQ1BVSEZYV1NXSkVFRTJFR0czTExaSU8zREJOUDU0N1laQ1EuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.ofjdf6dxvhVpNYI8SSoxfdreKzWkUjB82-BvCNsXKTb98g_vWQzdkA_mDbADmTCJfoF2zxPM_91qvCiMKjA6CA\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"WQIPWXDMCOUGEW3WZGAVWRWYHZMZ7VSSJZYURPWDOK46WKY7NKPQ\",\n  \"iat\": 1791277310,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJQWFNXWFk0Q0dNUDRLRDRJSlAzRDdHRjRNSEVMRFZMSlQyV1lPNlpHU0czM0hRQUMzWFFRIiwiaWF0IjoxNzkxMjc3MzEwLCJpc3MiOiJBQjZDWlJBWVdIUUFXNzYzTkxXMkhYQk9WUFpTR09XNVZFSkZMTzRNQlJMTU5JRElZQ1FZVzQ0VSIsInN1YiI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQUNVVE9YR0tGT0c2VkdUTUhKRTRDTFJNNVhETDdKS0ZFWDJQNkxOT1NZWklTM0ZJSVBYS1NUSSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.eu_j21JZJErs0gNG7IyOuJHPCIdTEr6K074dQLLnC9qgHOHf1RuJwgX96t22lGTtukB0sp8ueSz0DL8IipH3Ag\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"L4LW6CBVHZEMFXAPQWZXLB352OAKFIKXUN3PQPJOAYJ65SGQ3AVQ\",\n  \"iat\": 1791277310,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"SYS\",\n  \"sub\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"OQBT6LG475DIEK3YZU2PUYAYXTDFCFT6L5YWFZG5UW4J7ZW6ORCQ\",\n  \"iat\": 1791277310,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 74,
     "content": "{\n  \"studio\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\"\n}"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"JOZ5EPLT7TQF2C42SDAH4ECIX6RZRQD2WLRN75KUZLPSEVR36SQQ\",\n  \"iat\": 1791277309,\n  \"iss\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\",\n  \"name\": \"ops\",\n  \"sub\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"YOBOFUF7UXKB66VMGWMQZZJN6JVLFQNNQAG5XZQU66UH4D4R2J6Q\",\n  \"iat\": 1791277309,\n  \"iss\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\",\n  \"name\": \"rund\",\n  \"sub\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"X375EUNMP6BSC6U6653INJL55FYOP3HYL2MB2RXZKNIF6OMO33YA\",\n  \"iat\": 1791277309,\n  \"iss\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\",\n  \"name\": \"studio\",\n  \"sub\": \"UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"OZDQG7LQN6SJN6OAPPUWQNBO45QJWOLBF67W2RCR5SBRIS34KWVA\",\n  \"iat\": 1791277309,\n  \"iss\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather2.v1.WeatherService.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1399,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813310,\n  \"jti\": \"SYSJP3FXKKZPR7SOPFBD7V263ZIHESQ2VIFUOVDWGXRYQS76PN3A\",\n  \"iat\": 1791277310,\n  \"iss\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\",\n  \"name\": \"weather2.v1.WeatherService\",\n  \"sub\": \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather-2.v1.get_forecast\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n    \"tags\": [\n      \"catalogue:f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n      \"generation:2\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3594,
     "content": "{\n  \"manifest\": {\n    \"generation\": 2,\n    \"catalogue_sha256\": \"f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n    \"issued_at\": \"2026-10-06T13:01:50.926007+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n        \"signing\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"signing\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      \"SYS\": {\n        \"identity\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n        \"signing\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"signing\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      },\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\",\n        \"catalogue_sha256\": \"f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n        \"generation\": 2,\n        \"permissions_hash\": \"19ef9109d050959e\",\n        \"issued_at\": 1791277310,\n        \"expires_at\": 1822813310,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\",\n        \"reason\": \"new\"\n      }\n    ]\n  },\n  \"signer\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"signature\": \"b1fd655563dd3f994a0a96a3813e75088db4600e29342ed6fbaa9c23cef911c95a18f0a6f5eaa7632fdcaccd2324fe5b68d78c0626251f73b2c9216aa0bb290a\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:62849",
    "accounts": [
     {
      "name": "CALLER-studio",
      "public": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "signing_keys": [
       "ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7",
      "signing_keys": [
       "ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY",
      "signing_keys": [
       "AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "signing_keys": [
       "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U"
      ],
      "revocations": 0,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY",
      "public": "UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA",
      "issuer": "AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7",
      "public": "UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF",
      "issuer": "ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
      "account": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "public": "UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4",
      "issuer": "ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
      "account": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "public": "UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN",
      "issuer": "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
      "account": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "public": "UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS",
      "issuer": "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U",
      "tags": [
       "catalogue:f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a",
       "generation:2"
      ],
      "expires": "2027-10-06T09:01:50Z",
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
     "content": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ"
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
     "content": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7"
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
     "content": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY"
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
     "content": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI"
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
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 3389,
     "content": "{\n  \"manifest\": {\n    \"generation\": 3,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T13:01:52.160564+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n        \"signing\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"signing\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      \"SYS\": {\n        \"identity\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n        \"signing\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"signing\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\",\n        \"at\": 1791277312,\n        \"generation\": 3,\n        \"expires_at\": 1822813310,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"signature\": \"12f8b4a7647c27a81aba6367bda5c4bb856abde30b504ba6e2132bcf1ac1c96be21e5eb6d8cdc5f3424eb55d72d88b322efffe1da4c54a42863e2dd7966acd02\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"S4QEUC3PCXSCWX44H5D35VS7ZU4BZ5U2MWNP7RAIGTBROWMCRL3A\",\n  \"iat\": 1791277312,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ.\\u003e\",\n        \"account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJIWkY3WkY0NFBIVTRUWUhWRjdRNTZRSDZaMkg2M01QRVpNSjdMWkxSV0pGRjJGVlE0QVBBIiwiaWF0IjoxNzkxMjc3MzEyLCJpc3MiOiJBRENRT0xNRlVRVkk3RUNTU1IyNlc0T05HWFZWSEhFQzI2WE9PUzVMNUdIRzdQRUdQWVpYQVYzRyIsInN1YiI6IkFEMjdXVE9UNEVJM0hFNDVFQlhTQkNQVUhGWFdTV0pFRUUyRUdHM0xMWklPM0RCTlA1NDdZWkNRIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUQyN1dUT1Q0RUkzSEU0NUVCWFNCQ1BVSEZYV1NXSkVFRTJFR0czTExaSU8zREJOUDU0N1laQ1EuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.ertnsnGXhQ4vqnkm7xYkDwrcxVZid0BAJ7r_G8Wye8Gt4RQ5T1pZVwtEbcwU_6bD5OIhjHgFN2B4xbJjwNvgAA\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"IOWZ7RYJSXUU5HLOU2O2VIWJ4VMA2SA3VDBSJMQ6YIT4O6T7QLNQ\",\n  \"iat\": 1791277312,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiIzNUc3UzU3Qko0RkFNN1FTU1JWRVRTQVk3M0pZN09YWkJJSDdCMktRUjdUWFVZM0U0NDZRIiwiaWF0IjoxNzkxMjc3MzEyLCJpc3MiOiJBQjZDWlJBWVdIUUFXNzYzTkxXMkhYQk9WUFpTR09XNVZFSkZMTzRNQlJMTU5JRElZQ1FZVzQ0VSIsInN1YiI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQUNVVE9YR0tGT0c2VkdUTUhKRTRDTFJNNVhETDdKS0ZFWDJQNkxOT1NZWklTM0ZJSVBYS1NUSSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.Y-gFIGIPBNehbl7Tm4qoRrSa8sFOGjBsLSNW4dxl_xRat4trHqFB-ZtlKFGNNUbaNVU9Q_hn75gm2kSz2W-3Bg\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"WBHDFRFAJFDLWPG66YGFOG5FND4FWIB4TY5HVEOMISGKMSKRVDSQ\",\n  \"iat\": 1791277312,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"SYS\",\n  \"sub\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 1084,
     "content": "{\n  \"jti\": \"3QJSJMF5OTD3JYWZTLAMH6RFS777YAXRM5YV3SX5YCIBAZWQZRHQ\",\n  \"iat\": 1791277312,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n    ],\n    \"revocations\": {\n      \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\": 1791277312\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 74,
     "content": "{\n  \"studio\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\"\n}"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"JOZ5EPLT7TQF2C42SDAH4ECIX6RZRQD2WLRN75KUZLPSEVR36SQQ\",\n  \"iat\": 1791277309,\n  \"iss\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\",\n  \"name\": \"ops\",\n  \"sub\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"YOBOFUF7UXKB66VMGWMQZZJN6JVLFQNNQAG5XZQU66UH4D4R2J6Q\",\n  \"iat\": 1791277309,\n  \"iss\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\",\n  \"name\": \"rund\",\n  \"sub\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"X375EUNMP6BSC6U6653INJL55FYOP3HYL2MB2RXZKNIF6OMO33YA\",\n  \"iat\": 1791277309,\n  \"iss\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\",\n  \"name\": \"studio\",\n  \"sub\": \"UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"OZDQG7LQN6SJN6OAPPUWQNBO45QJWOLBF67W2RCR5SBRIS34KWVA\",\n  \"iat\": 1791277309,\n  \"iss\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
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
     "size": 3389,
     "content": "{\n  \"manifest\": {\n    \"generation\": 3,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T13:01:52.160564+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n        \"signing\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"signing\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      \"SYS\": {\n        \"identity\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n        \"signing\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"signing\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\",\n        \"at\": 1791277312,\n        \"generation\": 3,\n        \"expires_at\": 1822813310,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"signature\": \"12f8b4a7647c27a81aba6367bda5c4bb856abde30b504ba6e2132bcf1ac1c96be21e5eb6d8cdc5f3424eb55d72d88b322efffe1da4c54a42863e2dd7966acd02\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 269,
     "content": "[\n  {\n    \"Name\": \"weather2.v1.WeatherService\",\n    \"Account\": \"TOOLS\",\n    \"Public\": \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\",\n    \"At\": \"2026-10-06T13:01:52.160564+04:00\",\n    \"Kind\": \"retired\",\n    \"Why\": \"retired: no longer in the catalogue\"\n  }\n]"
    }
   ],
   "bus": {
    "server": "tls://127.0.0.1:62849",
    "accounts": [
     {
      "name": "CALLER-studio",
      "public": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "signing_keys": [
       "ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7",
      "signing_keys": [
       "ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY",
      "signing_keys": [
       "AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "signing_keys": [
       "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U"
      ],
      "revocations": 1,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY",
      "public": "UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA",
      "issuer": "AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7",
      "public": "UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF",
      "issuer": "ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
      "account": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "public": "UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4",
      "issuer": "ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
      "account": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "public": "UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN",
      "issuer": "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
      "account": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "public": "UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS",
      "issuer": "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U",
      "tags": [
       "catalogue:f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a",
       "generation:2"
      ],
      "expires": "2027-10-06T09:01:50Z",
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
   "id": "revoked-stays-revoked",
   "title": "Nothing changes; revoked stays revoked",
   "prose": "The same catalogue again: this issuance revokes nothing new, and every account JWT is rebuilt. The manifest's cumulative record carries generation 3's revocation into generation 4's `TOOLS` JWT, so the zombie's copy is refused again. It stays refused until the credential's own expiry, when the record prunes it.",
   "command": "garmctl topology --keys ceremony/keys --manifest manifest.json --catalogue file://weather.binpb --callers studio -o topo",
   "stdout": "ok: generation 4 from catalogue 24164e3e783d -- 4 accounts, 0 credentials, 0 revocations, written to topo\n",
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
     "content": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ"
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
     "content": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7"
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
     "content": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY"
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
     "content": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI"
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
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 3389,
     "content": "{\n  \"manifest\": {\n    \"generation\": 4,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T13:01:53.398633+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n        \"signing\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"signing\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      \"SYS\": {\n        \"identity\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n        \"signing\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"signing\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\",\n        \"at\": 1791277312,\n        \"generation\": 3,\n        \"expires_at\": 1822813310,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"signature\": \"e375eff2f21ea39670935df335566857407473a316472b59516cace428113e1beb045354f54ae326cd10cabc21d96a92647977081eb009a2c15dd5d0a8348a0a\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"BGPAX7N7WYZ5LCQQXCQXMTCBQAYGMJS4T34O2B6REQA3N5TFQXRA\",\n  \"iat\": 1791277313,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ.\\u003e\",\n        \"account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJNWU9YUVZJTTNXNlNQVUxNVDROUlVFUU9PS0s3WVBDMlQyVTVZSFFLQUtOMlVEWFhUR0xBIiwiaWF0IjoxNzkxMjc3MzEzLCJpc3MiOiJBRENRT0xNRlVRVkk3RUNTU1IyNlc0T05HWFZWSEhFQzI2WE9PUzVMNUdIRzdQRUdQWVpYQVYzRyIsInN1YiI6IkFEMjdXVE9UNEVJM0hFNDVFQlhTQkNQVUhGWFdTV0pFRUUyRUdHM0xMWklPM0RCTlA1NDdZWkNRIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUQyN1dUT1Q0RUkzSEU0NUVCWFNCQ1BVSEZYV1NXSkVFRTJFR0czTExaSU8zREJOUDU0N1laQ1EuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.c9eOqJpt5XHApGtaJeRlLZhvp-iTgaaYcdwVcsJ4KIB0GY3KUkWaMUHwSNJKuSVpk8mqBvngjcpNHFmYz3vbBg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"RSQCUZC5NQVIEIVSINBGJM5WAT5UR2H4JMPKZ6GLIGMZT7IRC4NA\",\n  \"iat\": 1791277313,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJOTDIzV0dZWTVPQ0FDRlBGWUI2SVZBM09HUFVLTzJFTTVWVUQ0WEtPRUZONFZSQVlCN1ZBIiwiaWF0IjoxNzkxMjc3MzEzLCJpc3MiOiJBQjZDWlJBWVdIUUFXNzYzTkxXMkhYQk9WUFpTR09XNVZFSkZMTzRNQlJMTU5JRElZQ1FZVzQ0VSIsInN1YiI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQUNVVE9YR0tGT0c2VkdUTUhKRTRDTFJNNVhETDdKS0ZFWDJQNkxOT1NZWklTM0ZJSVBYS1NUSSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.Xa7k0bQRWmdNmf5erO8FbXab8Rqh06rEiQ3qwmROPbjjUEpmwGEp3gVrmpFiQzwzG9_gQX4-gsykdvFe2jY0Bg\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"6YULA56ICO3MJNNX765L7RCUTINS6ARTNSEDYK4YSSRQS7R5GIBA\",\n  \"iat\": 1791277313,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"SYS\",\n  \"sub\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 1084,
     "content": "{\n  \"jti\": \"7CW7AMEFOPJYLPKFP4W3BP4KKFX22XDEH7OISLT6VGBDQ3BFDKNQ\",\n  \"iat\": 1791277313,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n    ],\n    \"revocations\": {\n      \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\": 1791277312\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 74,
     "content": "{\n  \"studio\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\"\n}"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"JOZ5EPLT7TQF2C42SDAH4ECIX6RZRQD2WLRN75KUZLPSEVR36SQQ\",\n  \"iat\": 1791277309,\n  \"iss\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\",\n  \"name\": \"ops\",\n  \"sub\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"YOBOFUF7UXKB66VMGWMQZZJN6JVLFQNNQAG5XZQU66UH4D4R2J6Q\",\n  \"iat\": 1791277309,\n  \"iss\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\",\n  \"name\": \"rund\",\n  \"sub\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"X375EUNMP6BSC6U6653INJL55FYOP3HYL2MB2RXZKNIF6OMO33YA\",\n  \"iat\": 1791277309,\n  \"iss\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\",\n  \"name\": \"studio\",\n  \"sub\": \"UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"OZDQG7LQN6SJN6OAPPUWQNBO45QJWOLBF67W2RCR5SBRIS34KWVA\",\n  \"iat\": 1791277309,\n  \"iss\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3389,
     "content": "{\n  \"manifest\": {\n    \"generation\": 4,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T13:01:53.398633+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n        \"signing\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"signing\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      \"SYS\": {\n        \"identity\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n        \"signing\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"signing\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\",\n        \"at\": 1791277312,\n        \"generation\": 3,\n        \"expires_at\": 1822813310,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"signature\": \"e375eff2f21ea39670935df335566857407473a316472b59516cace428113e1beb045354f54ae326cd10cabc21d96a92647977081eb009a2c15dd5d0a8348a0a\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:62849",
    "accounts": [
     {
      "name": "CALLER-studio",
      "public": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "signing_keys": [
       "ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7",
      "signing_keys": [
       "ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY",
      "signing_keys": [
       "AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "signing_keys": [
       "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U"
      ],
      "revocations": 1,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY",
      "public": "UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA",
      "issuer": "AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7",
      "public": "UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF",
      "issuer": "ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
      "account": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "public": "UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4",
      "issuer": "ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
      "account": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "public": "UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN",
      "issuer": "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
      "account": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "public": "UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS",
      "issuer": "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U",
      "tags": [
       "catalogue:f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a",
       "generation:2"
      ],
      "expires": "2027-10-06T09:01:50Z",
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
   "stdout": "ok: generation 5 from catalogue 24164e3e783d -- 5 accounts, 1 credentials, 0 revocations, written to topo\n",
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
     "content": "ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F"
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
     "content": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ"
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
     "content": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7"
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
     "content": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY"
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
     "content": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI"
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
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 4078,
     "content": "{\n  \"manifest\": {\n    \"generation\": 5,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T13:01:54.651862+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n        \"signing\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n        \"signing\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"signing\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      \"SYS\": {\n        \"identity\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n        \"signing\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"signing\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791277314,\n        \"expires_at\": 1822813314,\n        \"signing_key\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\",\n        \"at\": 1791277312,\n        \"generation\": 3,\n        \"expires_at\": 1822813310,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"signature\": \"b9ab4dd230e1d6c3bbc52590484c3a2f93721cd95fa668efbd03e1e93b96800e133da8f16d88282f2136f34cc541a7d36c49fb0d43da57a968b60584dcd6560b\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 2133,
     "content": "{\n  \"jti\": \"JZ674LXKS5OKNSEWDR3TM4Y46AVWD63GJMSBO4S357BQRYSKWYKA\",\n  \"iat\": 1791277314,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F.\\u003e\",\n        \"account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJQWlJRNFlEM1JLQTRFUlk2V0VYTkVWWUhZM1FVUVRaUUhWVzRTTUpZTUVPWDVEWUoyQ0RRIiwiaWF0IjoxNzkxMjc3MzE0LCJpc3MiOiJBRENRT0xNRlVRVkk3RUNTU1IyNlc0T05HWFZWSEhFQzI2WE9PUzVMNUdIRzdQRUdQWVpYQVYzRyIsInN1YiI6IkFESlY3QUY1TEJUTVNDTlZGWTJCN0tFRlNIWTRGT0YzNlhFQU1TNkxIM1dYN0lDV0JGVEQzNDZGIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURKVjdBRjVMQlRNU0NOVkZZMkI3S0VGU0hZNEZPRjM2WEVBTVM2TEgzV1g3SUNXQkZURDM0NkYuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.NZRl-K7mOz0gp68PcdvG_2DGsgX0_X3h3iQjpUETgLDikju40CBOlqkkNObyvmRamO9KSf6FLS8i3wNLZphQDQ\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"KFGPYAA7RHZJOVS64YDD6QB5L5FTYAKQ62A3K6IHHMMFWVP3MMUA\",\n  \"iat\": 1791277314,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ.\\u003e\",\n        \"account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJJTlRRWU4zNVJFM1pFMlhUVkdTQUFTSUo2M0NXSEZXR05JSFdKWkQySEZIVkFRMkRPRUhBIiwiaWF0IjoxNzkxMjc3MzE0LCJpc3MiOiJBRENRT0xNRlVRVkk3RUNTU1IyNlc0T05HWFZWSEhFQzI2WE9PUzVMNUdIRzdQRUdQWVpYQVYzRyIsInN1YiI6IkFEMjdXVE9UNEVJM0hFNDVFQlhTQkNQVUhGWFdTV0pFRUUyRUdHM0xMWklPM0RCTlA1NDdZWkNRIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUQyN1dUT1Q0RUkzSEU0NUVCWFNCQ1BVSEZYV1NXSkVFRTJFR0czTExaSU8zREJOUDU0N1laQ1EuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.Dj1VVhG0JI-BzWL6x-PVpe3uwzPx7M62oytT2GPgB84-YCqS1Ey_I42Yap95L_OZDToW7bC3khl-BsyXdStbBA\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"QPRTYNXYBSQA5VILYD76GHFZNUNK6GKQYI6YKBRJDIC7WOCJ2BRQ\",\n  \"iat\": 1791277314,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJXQVdFREhLTllWRDdZVFVPRUVWSDZIVENRN0NZTkJVSURDTlg0T1JVNlhGRlRGRUxLMlBRIiwiaWF0IjoxNzkxMjc3MzE0LCJpc3MiOiJBQjZDWlJBWVdIUUFXNzYzTkxXMkhYQk9WUFpTR09XNVZFSkZMTzRNQlJMTU5JRElZQ1FZVzQ0VSIsInN1YiI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQUNVVE9YR0tGT0c2VkdUTUhKRTRDTFJNNVhETDdKS0ZFWDJQNkxOT1NZWklTM0ZJSVBYS1NUSSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.poaX64DTkYufmSilBhp-gr4-cq9_SdeFtg0ls1KOXGk_NvlN4yjgQNxryq32lD8T-O5nTIGas1N4Qv27Kov_Dg\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"C6FCG54TB4BU754NAW7U55IDDMIVMKRTYD67NMIDISEAASTVKPLQ\",\n  \"iat\": 1791277314,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"SYS\",\n  \"sub\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 1084,
     "content": "{\n  \"jti\": \"UZ45ZZEQZYAM4TLHPOMOZ4BLDHJEUTLPSPJZ7LQY7ZIQKSYOW2RQ\",\n  \"iat\": 1791277314,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n    ],\n    \"revocations\": {\n      \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\": 1791277312\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n  \"studio\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813314,\n  \"jti\": \"NBG6XBXJWRN5FY2T4XF4P7R4AULXGYLJ5VPJ5SH52VD3FE3ESKAQ\",\n  \"iat\": 1791277314,\n  \"iss\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\",\n  \"name\": \"batch\",\n  \"sub\": \"UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"JOZ5EPLT7TQF2C42SDAH4ECIX6RZRQD2WLRN75KUZLPSEVR36SQQ\",\n  \"iat\": 1791277309,\n  \"iss\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\",\n  \"name\": \"ops\",\n  \"sub\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"YOBOFUF7UXKB66VMGWMQZZJN6JVLFQNNQAG5XZQU66UH4D4R2J6Q\",\n  \"iat\": 1791277309,\n  \"iss\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\",\n  \"name\": \"rund\",\n  \"sub\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"X375EUNMP6BSC6U6653INJL55FYOP3HYL2MB2RXZKNIF6OMO33YA\",\n  \"iat\": 1791277309,\n  \"iss\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\",\n  \"name\": \"studio\",\n  \"sub\": \"UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"OZDQG7LQN6SJN6OAPPUWQNBO45QJWOLBF67W2RCR5SBRIS34KWVA\",\n  \"iat\": 1791277309,\n  \"iss\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 4078,
     "content": "{\n  \"manifest\": {\n    \"generation\": 5,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T13:01:54.651862+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n        \"signing\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n        \"signing\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"signing\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      \"SYS\": {\n        \"identity\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n        \"signing\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"signing\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791277314,\n        \"expires_at\": 1822813314,\n        \"signing_key\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\",\n        \"at\": 1791277312,\n        \"generation\": 3,\n        \"expires_at\": 1822813310,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"signature\": \"b9ab4dd230e1d6c3bbc52590484c3a2f93721cd95fa668efbd03e1e93b96800e133da8f16d88282f2136f34cc541a7d36c49fb0d43da57a968b60584dcd6560b\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:62849",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F",
      "signing_keys": [
       "ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "CALLER-studio",
      "public": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "signing_keys": [
       "ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7",
      "signing_keys": [
       "ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY",
      "signing_keys": [
       "AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "signing_keys": [
       "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U"
      ],
      "revocations": 1,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F",
      "public": "UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG",
      "issuer": "ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:5"
      ],
      "expires": "2027-10-06T09:01:54Z",
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
      "account": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY",
      "public": "UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA",
      "issuer": "AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7",
      "public": "UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF",
      "issuer": "ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
      "account": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "public": "UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4",
      "issuer": "ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
      "account": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "public": "UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN",
      "issuer": "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
   "stdout": "ok: generation 6 from catalogue 24164e3e783d -- 5 accounts, 1 credentials, 0 revocations, written to topo\n",
   "stderr": "CALLER-studio: signing key retiring; the old key ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM is still listed -- roll the new credentials out, then run an issuance with --verify-live to retire it\n",
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
     "content": "ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F"
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
     "content": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ"
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
     "content": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7"
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
     "content": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY"
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
     "content": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI"
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
     "path": "ceremony/keys/archive/CALLER-studio.signing.ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM.nk",
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
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 4163,
     "content": "{\n  \"manifest\": {\n    \"generation\": 6,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T13:01:57.799374+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n        \"signing\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n        \"signing\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n        \"retiring\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"signing\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      \"SYS\": {\n        \"identity\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n        \"signing\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"signing\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791277314,\n        \"expires_at\": 1822813314,\n        \"signing_key\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UD5AXT6FJTAWWGSZTBTOWKQDWHSPVODRUW4LRQTX6IWNQXUHWMF5XHJI\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 6,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791277317,\n        \"expires_at\": 1822813317,\n        \"signing_key\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n        \"reason\": \"rotation\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\",\n        \"at\": 1791277312,\n        \"generation\": 3,\n        \"expires_at\": 1822813310,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"signature\": \"a1c5eecf0933fbeb6fdb27edf9e7b85f73b21679fb290a2d0d84f51291f82369354e489cad59bb310e4a47ee62f46226a2579bc0c53239fb56acf0a3dab80703\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2133,
     "content": "{\n  \"jti\": \"EJUJOU34Z4SAKUZH54O6O7SBCUTOA6PJOP54IN3J2CYNDY5INTFA\",\n  \"iat\": 1791277317,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F.\\u003e\",\n        \"account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJUM0Q2N1dHSlZMTTRTUllYNUpIWVRUVEQzM0w0NUtPRllKU1U3T0tNSVlZUVA0TUdJSDdRIiwiaWF0IjoxNzkxMjc3MzE3LCJpc3MiOiJBRENRT0xNRlVRVkk3RUNTU1IyNlc0T05HWFZWSEhFQzI2WE9PUzVMNUdIRzdQRUdQWVpYQVYzRyIsInN1YiI6IkFESlY3QUY1TEJUTVNDTlZGWTJCN0tFRlNIWTRGT0YzNlhFQU1TNkxIM1dYN0lDV0JGVEQzNDZGIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURKVjdBRjVMQlRNU0NOVkZZMkI3S0VGU0hZNEZPRjM2WEVBTVM2TEgzV1g3SUNXQkZURDM0NkYuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.E0olvq759s6GuDbgeAYE7-islJjAtLo5y17-tXiFQjPAuia7gCuphkl-_SpzShdMuJ2lvq9kUnmyjrLNYiw2CQ\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2213,
     "content": "{\n  \"jti\": \"2ZLQPM6GS4NCSBLNQEDH3PGEWUOBZLM337ALDVCUYJRGCLBOZLAQ\",\n  \"iat\": 1791277317,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ.\\u003e\",\n        \"account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJDVlAzTVZGMjRVNUU2UFA3WkdLVEk3TVQ2TUpWSVU0VVZXRFNVWDNYR0JINDdSUDUzN1pBIiwiaWF0IjoxNzkxMjc3MzE3LCJpc3MiOiJBRENRT0xNRlVRVkk3RUNTU1IyNlc0T05HWFZWSEhFQzI2WE9PUzVMNUdIRzdQRUdQWVpYQVYzRyIsInN1YiI6IkFEMjdXVE9UNEVJM0hFNDVFQlhTQkNQVUhGWFdTV0pFRUUyRUdHM0xMWklPM0RCTlA1NDdZWkNRIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUQyN1dUT1Q0RUkzSEU0NUVCWFNCQ1BVSEZYV1NXSkVFRTJFR0czTExaSU8zREJOUDU0N1laQ1EuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.Z_9xIf0186gLOue72fnE1FG1fzTrXVqIJRe5VlsrwxwNR3eEOKF1RaIO2KZ6ZSgi2P8gsd7lcBeBplV0C_2lAg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n      \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"X2X6R7IBEQAUVMDIC5ZMKL7EPCPZL2CFPLUM5LIBJCZJFKORCMRA\",\n  \"iat\": 1791277317,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJIU0RNVlhGWVIyRTJCTUFWUUE3UkkyNkhOMk9VUjVORURXVlVSNlVESTZQM1paSk1NRUNBIiwiaWF0IjoxNzkxMjc3MzE3LCJpc3MiOiJBQjZDWlJBWVdIUUFXNzYzTkxXMkhYQk9WUFpTR09XNVZFSkZMTzRNQlJMTU5JRElZQ1FZVzQ0VSIsInN1YiI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQUNVVE9YR0tGT0c2VkdUTUhKRTRDTFJNNVhETDdKS0ZFWDJQNkxOT1NZWklTM0ZJSVBYS1NUSSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.KZ0UgCjefeNm1CaNkh_CrmlzHEal1nvG0yjaSUl4qx8e73lE4DiXhuUzbgPWGDPkCld8d1oPlwgnra8yZft8BQ\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"AKOMIAD62BOY2U4U6VKWHXLYZORXFUASHGTM5HPORZOIKHLZ2LPA\",\n  \"iat\": 1791277317,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"SYS\",\n  \"sub\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 1084,
     "content": "{\n  \"jti\": \"2LTABW4T7Z5DXHPX5USPRLT3ZRFNMNVQJC34MEV62AY4JYQNASPA\",\n  \"iat\": 1791277317,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n    ],\n    \"revocations\": {\n      \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\": 1791277312\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n  \"studio\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813314,\n  \"jti\": \"NBG6XBXJWRN5FY2T4XF4P7R4AULXGYLJ5VPJ5SH52VD3FE3ESKAQ\",\n  \"iat\": 1791277314,\n  \"iss\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\",\n  \"name\": \"batch\",\n  \"sub\": \"UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"JOZ5EPLT7TQF2C42SDAH4ECIX6RZRQD2WLRN75KUZLPSEVR36SQQ\",\n  \"iat\": 1791277309,\n  \"iss\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\",\n  \"name\": \"ops\",\n  \"sub\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"YOBOFUF7UXKB66VMGWMQZZJN6JVLFQNNQAG5XZQU66UH4D4R2J6Q\",\n  \"iat\": 1791277309,\n  \"iss\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\",\n  \"name\": \"rund\",\n  \"sub\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "changed",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813317,\n  \"jti\": \"BJLA6MOSSIBSMVAOJ4A6C3ZLT7WYUDYKRFHTYJEPZ4VMEGOVVCVQ\",\n  \"iat\": 1791277317,\n  \"iss\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n  \"name\": \"studio\",\n  \"sub\": \"UD5AXT6FJTAWWGSZTBTOWKQDWHSPVODRUW4LRQTX6IWNQXUHWMF5XHJI\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:6\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"OZDQG7LQN6SJN6OAPPUWQNBO45QJWOLBF67W2RCR5SBRIS34KWVA\",\n  \"iat\": 1791277309,\n  \"iss\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 4163,
     "content": "{\n  \"manifest\": {\n    \"generation\": 6,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T13:01:57.799374+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n        \"signing\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n        \"signing\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n        \"retiring\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"signing\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      \"SYS\": {\n        \"identity\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n        \"signing\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"signing\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791277314,\n        \"expires_at\": 1822813314,\n        \"signing_key\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UD5AXT6FJTAWWGSZTBTOWKQDWHSPVODRUW4LRQTX6IWNQXUHWMF5XHJI\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 6,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791277317,\n        \"expires_at\": 1822813317,\n        \"signing_key\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n        \"reason\": \"rotation\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\",\n        \"at\": 1791277312,\n        \"generation\": 3,\n        \"expires_at\": 1822813310,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"signature\": \"a1c5eecf0933fbeb6fdb27edf9e7b85f73b21679fb290a2d0d84f51291f82369354e489cad59bb310e4a47ee62f46226a2579bc0c53239fb56acf0a3dab80703\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:62849",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F",
      "signing_keys": [
       "ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "CALLER-studio",
      "public": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "signing_keys": [
       "AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF",
       "ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7",
      "signing_keys": [
       "ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY",
      "signing_keys": [
       "AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "signing_keys": [
       "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U"
      ],
      "revocations": 1,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F",
      "public": "UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG",
      "issuer": "ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:5"
      ],
      "expires": "2027-10-06T09:01:54Z",
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
      "account": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY",
      "public": "UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA",
      "issuer": "AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7",
      "public": "UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF",
      "issuer": "ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
      "account": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "public": "UD5AXT6FJTAWWGSZTBTOWKQDWHSPVODRUW4LRQTX6IWNQXUHWMF5XHJI",
      "issuer": "AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:6"
      ],
      "expires": "2027-10-06T09:01:57Z",
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
      "account": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "public": "UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN",
      "issuer": "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
      "account": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "public": "UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4",
      "issuer": "ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
   "error": "--verify-live: CALLER-studio's retiring key ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM still signs 1 live connection(s): studio-old -- roll them out first",
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
     "content": "ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F"
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
     "content": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ"
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
     "content": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7"
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
     "content": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY"
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
     "content": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI"
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
     "path": "ceremony/keys/archive/CALLER-studio.signing.ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM.nk",
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
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 4163,
     "content": "{\n  \"manifest\": {\n    \"generation\": 6,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T13:01:57.799374+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n        \"signing\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n        \"signing\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n        \"retiring\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"signing\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      \"SYS\": {\n        \"identity\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n        \"signing\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"signing\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791277314,\n        \"expires_at\": 1822813314,\n        \"signing_key\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UD5AXT6FJTAWWGSZTBTOWKQDWHSPVODRUW4LRQTX6IWNQXUHWMF5XHJI\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 6,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791277317,\n        \"expires_at\": 1822813317,\n        \"signing_key\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n        \"reason\": \"rotation\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\",\n        \"at\": 1791277312,\n        \"generation\": 3,\n        \"expires_at\": 1822813310,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"signature\": \"a1c5eecf0933fbeb6fdb27edf9e7b85f73b21679fb290a2d0d84f51291f82369354e489cad59bb310e4a47ee62f46226a2579bc0c53239fb56acf0a3dab80703\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2133,
     "content": "{\n  \"jti\": \"EJUJOU34Z4SAKUZH54O6O7SBCUTOA6PJOP54IN3J2CYNDY5INTFA\",\n  \"iat\": 1791277317,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F.\\u003e\",\n        \"account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJUM0Q2N1dHSlZMTTRTUllYNUpIWVRUVEQzM0w0NUtPRllKU1U3T0tNSVlZUVA0TUdJSDdRIiwiaWF0IjoxNzkxMjc3MzE3LCJpc3MiOiJBRENRT0xNRlVRVkk3RUNTU1IyNlc0T05HWFZWSEhFQzI2WE9PUzVMNUdIRzdQRUdQWVpYQVYzRyIsInN1YiI6IkFESlY3QUY1TEJUTVNDTlZGWTJCN0tFRlNIWTRGT0YzNlhFQU1TNkxIM1dYN0lDV0JGVEQzNDZGIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURKVjdBRjVMQlRNU0NOVkZZMkI3S0VGU0hZNEZPRjM2WEVBTVM2TEgzV1g3SUNXQkZURDM0NkYuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.E0olvq759s6GuDbgeAYE7-islJjAtLo5y17-tXiFQjPAuia7gCuphkl-_SpzShdMuJ2lvq9kUnmyjrLNYiw2CQ\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2213,
     "content": "{\n  \"jti\": \"2ZLQPM6GS4NCSBLNQEDH3PGEWUOBZLM337ALDVCUYJRGCLBOZLAQ\",\n  \"iat\": 1791277317,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ.\\u003e\",\n        \"account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJDVlAzTVZGMjRVNUU2UFA3WkdLVEk3TVQ2TUpWSVU0VVZXRFNVWDNYR0JINDdSUDUzN1pBIiwiaWF0IjoxNzkxMjc3MzE3LCJpc3MiOiJBRENRT0xNRlVRVkk3RUNTU1IyNlc0T05HWFZWSEhFQzI2WE9PUzVMNUdIRzdQRUdQWVpYQVYzRyIsInN1YiI6IkFEMjdXVE9UNEVJM0hFNDVFQlhTQkNQVUhGWFdTV0pFRUUyRUdHM0xMWklPM0RCTlA1NDdZWkNRIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUQyN1dUT1Q0RUkzSEU0NUVCWFNCQ1BVSEZYV1NXSkVFRTJFR0czTExaSU8zREJOUDU0N1laQ1EuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.Z_9xIf0186gLOue72fnE1FG1fzTrXVqIJRe5VlsrwxwNR3eEOKF1RaIO2KZ6ZSgi2P8gsd7lcBeBplV0C_2lAg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n      \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"X2X6R7IBEQAUVMDIC5ZMKL7EPCPZL2CFPLUM5LIBJCZJFKORCMRA\",\n  \"iat\": 1791277317,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJIU0RNVlhGWVIyRTJCTUFWUUE3UkkyNkhOMk9VUjVORURXVlVSNlVESTZQM1paSk1NRUNBIiwiaWF0IjoxNzkxMjc3MzE3LCJpc3MiOiJBQjZDWlJBWVdIUUFXNzYzTkxXMkhYQk9WUFpTR09XNVZFSkZMTzRNQlJMTU5JRElZQ1FZVzQ0VSIsInN1YiI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQUNVVE9YR0tGT0c2VkdUTUhKRTRDTFJNNVhETDdKS0ZFWDJQNkxOT1NZWklTM0ZJSVBYS1NUSSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.KZ0UgCjefeNm1CaNkh_CrmlzHEal1nvG0yjaSUl4qx8e73lE4DiXhuUzbgPWGDPkCld8d1oPlwgnra8yZft8BQ\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"AKOMIAD62BOY2U4U6VKWHXLYZORXFUASHGTM5HPORZOIKHLZ2LPA\",\n  \"iat\": 1791277317,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"SYS\",\n  \"sub\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 1084,
     "content": "{\n  \"jti\": \"2LTABW4T7Z5DXHPX5USPRLT3ZRFNMNVQJC34MEV62AY4JYQNASPA\",\n  \"iat\": 1791277317,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n    ],\n    \"revocations\": {\n      \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\": 1791277312\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n  \"studio\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813314,\n  \"jti\": \"NBG6XBXJWRN5FY2T4XF4P7R4AULXGYLJ5VPJ5SH52VD3FE3ESKAQ\",\n  \"iat\": 1791277314,\n  \"iss\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\",\n  \"name\": \"batch\",\n  \"sub\": \"UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"JOZ5EPLT7TQF2C42SDAH4ECIX6RZRQD2WLRN75KUZLPSEVR36SQQ\",\n  \"iat\": 1791277309,\n  \"iss\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\",\n  \"name\": \"ops\",\n  \"sub\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"YOBOFUF7UXKB66VMGWMQZZJN6JVLFQNNQAG5XZQU66UH4D4R2J6Q\",\n  \"iat\": 1791277309,\n  \"iss\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\",\n  \"name\": \"rund\",\n  \"sub\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813317,\n  \"jti\": \"BJLA6MOSSIBSMVAOJ4A6C3ZLT7WYUDYKRFHTYJEPZ4VMEGOVVCVQ\",\n  \"iat\": 1791277317,\n  \"iss\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n  \"name\": \"studio\",\n  \"sub\": \"UD5AXT6FJTAWWGSZTBTOWKQDWHSPVODRUW4LRQTX6IWNQXUHWMF5XHJI\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:6\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"OZDQG7LQN6SJN6OAPPUWQNBO45QJWOLBF67W2RCR5SBRIS34KWVA\",\n  \"iat\": 1791277309,\n  \"iss\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 4163,
     "content": "{\n  \"manifest\": {\n    \"generation\": 6,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T13:01:57.799374+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n        \"signing\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n        \"signing\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n        \"retiring\": \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"signing\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      \"SYS\": {\n        \"identity\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n        \"signing\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"signing\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791277314,\n        \"expires_at\": 1822813314,\n        \"signing_key\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UD5AXT6FJTAWWGSZTBTOWKQDWHSPVODRUW4LRQTX6IWNQXUHWMF5XHJI\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 6,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791277317,\n        \"expires_at\": 1822813317,\n        \"signing_key\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n        \"reason\": \"rotation\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\",\n        \"at\": 1791277312,\n        \"generation\": 3,\n        \"expires_at\": 1822813310,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"signature\": \"a1c5eecf0933fbeb6fdb27edf9e7b85f73b21679fb290a2d0d84f51291f82369354e489cad59bb310e4a47ee62f46226a2579bc0c53239fb56acf0a3dab80703\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:62849",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F",
      "signing_keys": [
       "ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "CALLER-studio",
      "public": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "signing_keys": [
       "AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF",
       "ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "GARM",
      "public": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7",
      "signing_keys": [
       "ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "SYS",
      "public": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY",
      "signing_keys": [
       "AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "TOOLS",
      "public": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "signing_keys": [
       "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U"
      ],
      "revocations": 1,
      "pushed": false
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F",
      "public": "UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG",
      "issuer": "ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:5"
      ],
      "expires": "2027-10-06T09:01:54Z",
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
      "account": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY",
      "public": "UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA",
      "issuer": "AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7",
      "public": "UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF",
      "issuer": "ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
      "account": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "public": "UD5AXT6FJTAWWGSZTBTOWKQDWHSPVODRUW4LRQTX6IWNQXUHWMF5XHJI",
      "issuer": "AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:6"
      ],
      "expires": "2027-10-06T09:01:57Z",
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
      "account": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "public": "UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN",
      "issuer": "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
      "account": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "public": "UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4",
      "issuer": "ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
   "stdout": "CALLER-studio: retired signing key ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM; every credential it signed is now refused\nok: generation 7 from catalogue 24164e3e783d -- 5 accounts, 0 credentials, 0 revocations, written to topo\n",
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
     "content": "ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F"
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
     "content": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ"
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
     "content": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7"
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
     "content": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY"
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
     "content": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI"
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
     "path": "ceremony/keys/archive/CALLER-studio.signing.ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM.nk",
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
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 4157,
     "content": "{\n  \"manifest\": {\n    \"generation\": 7,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T13:02:04.492594+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n        \"signing\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n        \"signing\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n        \"retired\": {\n          \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\": 7\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"signing\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      \"SYS\": {\n        \"identity\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n        \"signing\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"signing\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791277314,\n        \"expires_at\": 1822813314,\n        \"signing_key\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UD5AXT6FJTAWWGSZTBTOWKQDWHSPVODRUW4LRQTX6IWNQXUHWMF5XHJI\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 6,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791277317,\n        \"expires_at\": 1822813317,\n        \"signing_key\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\",\n        \"at\": 1791277312,\n        \"generation\": 3,\n        \"expires_at\": 1822813310,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"signature\": \"23e7fa84c9fd01a85af84c1c3caaab687fc86dbff481bb5f688eacc7966dba365aec926307abd8bf0419796eb7eafcee8a6c1e3c003a7246ff22dcca43b19209\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2133,
     "content": "{\n  \"jti\": \"BYW2UWABLPAAWYXFMFPIKPVPOFT2U5VZ73QMCPSBA7DBKZZKEKNQ\",\n  \"iat\": 1791277324,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F.\\u003e\",\n        \"account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJOV0JYQVI0RUJXT1pZWDdaWk5XTkxTQUtEWUlRRExNQVNON0xWTEVSRVpCRVVERlo2Rk1BIiwiaWF0IjoxNzkxMjc3MzI0LCJpc3MiOiJBRENRT0xNRlVRVkk3RUNTU1IyNlc0T05HWFZWSEhFQzI2WE9PUzVMNUdIRzdQRUdQWVpYQVYzRyIsInN1YiI6IkFESlY3QUY1TEJUTVNDTlZGWTJCN0tFRlNIWTRGT0YzNlhFQU1TNkxIM1dYN0lDV0JGVEQzNDZGIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURKVjdBRjVMQlRNU0NOVkZZMkI3S0VGU0hZNEZPRjM2WEVBTVM2TEgzV1g3SUNXQkZURDM0NkYuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.f6ZibKuJ2N5q0WN7Yu6RU9FYADO3UJmjohMbH7qHICtvwTDgPD75Kwdgla-dIsdE331g6TKn85pQEeAzRhmKAQ\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"KYJYTMFLAZ4DV7F6YBAV5QL5K4UQJ5QYWHLL2TP32UM4H7GCV7BQ\",\n  \"iat\": 1791277324,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ.\\u003e\",\n        \"account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJTQ1FRUjI3UENKT1hUSkZBM0tQQ1NERk1MUjJUMjJRN0NEUUlaRzUyM0VSNTJFQURXU1hRIiwiaWF0IjoxNzkxMjc3MzI0LCJpc3MiOiJBRENRT0xNRlVRVkk3RUNTU1IyNlc0T05HWFZWSEhFQzI2WE9PUzVMNUdIRzdQRUdQWVpYQVYzRyIsInN1YiI6IkFEMjdXVE9UNEVJM0hFNDVFQlhTQkNQVUhGWFdTV0pFRUUyRUdHM0xMWklPM0RCTlA1NDdZWkNRIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUQyN1dUT1Q0RUkzSEU0NUVCWFNCQ1BVSEZYV1NXSkVFRTJFR0czTExaSU8zREJOUDU0N1laQ1EuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.VUU7h2F9_dstxMpXBmKqEIroykyCvr_90-aN8mSh9fwf8DKN-wSz-YwkAlnJ7dBgApM6rmuCfFfWODKgahtuCw\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"WDBNI5N364HNPFPXXC5OR75UPXJAJFVSI4LBHII3DQYS6XMV7TMQ\",\n  \"iat\": 1791277324,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJVMzJCSFRMNUhGM0ZKUUkzNVgzNE1CSUM3Mk00RVlXRVZCUkYzSTdWVllaNUVMQUNLNVJBIiwiaWF0IjoxNzkxMjc3MzI0LCJpc3MiOiJBQjZDWlJBWVdIUUFXNzYzTkxXMkhYQk9WUFpTR09XNVZFSkZMTzRNQlJMTU5JRElZQ1FZVzQ0VSIsInN1YiI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQUNVVE9YR0tGT0c2VkdUTUhKRTRDTFJNNVhETDdKS0ZFWDJQNkxOT1NZWklTM0ZJSVBYS1NUSSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.0lmChb3SFAWRHBjzujVHhUJnW5VuPAO8tmTXSdla2E7SnH3oa8GcYh29kMmMIgAKEMgEWj_PUNK-AK3cg7WyDg\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"YJMFH2PAIANPWCR6AE2QASIROHGNIUD6O6W3VJHG7RRWE5MUXBNQ\",\n  \"iat\": 1791277324,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"SYS\",\n  \"sub\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 1084,
     "content": "{\n  \"jti\": \"OKYEOMGXIJF5WJ4B4Q3UZS5R26XDYUKS6YH63F6IHVH7RE3AQE3A\",\n  \"iat\": 1791277324,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n    ],\n    \"revocations\": {\n      \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\": 1791277312\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n  \"studio\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813314,\n  \"jti\": \"NBG6XBXJWRN5FY2T4XF4P7R4AULXGYLJ5VPJ5SH52VD3FE3ESKAQ\",\n  \"iat\": 1791277314,\n  \"iss\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\",\n  \"name\": \"batch\",\n  \"sub\": \"UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"JOZ5EPLT7TQF2C42SDAH4ECIX6RZRQD2WLRN75KUZLPSEVR36SQQ\",\n  \"iat\": 1791277309,\n  \"iss\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\",\n  \"name\": \"ops\",\n  \"sub\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"YOBOFUF7UXKB66VMGWMQZZJN6JVLFQNNQAG5XZQU66UH4D4R2J6Q\",\n  \"iat\": 1791277309,\n  \"iss\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\",\n  \"name\": \"rund\",\n  \"sub\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813317,\n  \"jti\": \"BJLA6MOSSIBSMVAOJ4A6C3ZLT7WYUDYKRFHTYJEPZ4VMEGOVVCVQ\",\n  \"iat\": 1791277317,\n  \"iss\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n  \"name\": \"studio\",\n  \"sub\": \"UD5AXT6FJTAWWGSZTBTOWKQDWHSPVODRUW4LRQTX6IWNQXUHWMF5XHJI\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:6\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"OZDQG7LQN6SJN6OAPPUWQNBO45QJWOLBF67W2RCR5SBRIS34KWVA\",\n  \"iat\": 1791277309,\n  \"iss\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 4157,
     "content": "{\n  \"manifest\": {\n    \"generation\": 7,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T13:02:04.492594+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n        \"signing\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n        \"signing\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n        \"retired\": {\n          \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\": 7\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"signing\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      \"SYS\": {\n        \"identity\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n        \"signing\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"signing\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791277314,\n        \"expires_at\": 1822813314,\n        \"signing_key\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UD5AXT6FJTAWWGSZTBTOWKQDWHSPVODRUW4LRQTX6IWNQXUHWMF5XHJI\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 6,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791277317,\n        \"expires_at\": 1822813317,\n        \"signing_key\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\",\n        \"at\": 1791277312,\n        \"generation\": 3,\n        \"expires_at\": 1822813310,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"signature\": \"23e7fa84c9fd01a85af84c1c3caaab687fc86dbff481bb5f688eacc7966dba365aec926307abd8bf0419796eb7eafcee8a6c1e3c003a7246ff22dcca43b19209\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:62849",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F",
      "signing_keys": [
       "ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "CALLER-studio",
      "public": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "signing_keys": [
       "AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7",
      "signing_keys": [
       "ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY",
      "signing_keys": [
       "AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "signing_keys": [
       "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U"
      ],
      "revocations": 1,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F",
      "public": "UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG",
      "issuer": "ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:5"
      ],
      "expires": "2027-10-06T09:01:54Z",
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
      "account": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY",
      "public": "UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA",
      "issuer": "AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7",
      "public": "UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF",
      "issuer": "ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
      "account": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "public": "UD5AXT6FJTAWWGSZTBTOWKQDWHSPVODRUW4LRQTX6IWNQXUHWMF5XHJI",
      "issuer": "AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:6"
      ],
      "expires": "2027-10-06T09:01:57Z",
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
      "account": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "public": "UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN",
      "issuer": "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
      "account": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "public": "UDWDRCCZNPWDWM535WI24LMLIKCUHCY4HVLTEL7G63TLDDHIM4GDO7W4",
      "issuer": "ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
   "stdout": "batch: credential file was missing; reissued\nok: generation 8 from catalogue 24164e3e783d -- 5 accounts, 1 credentials, 1 revocations, written to topo\n",
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
     "content": "ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F"
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
     "content": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ"
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
     "content": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7"
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
     "content": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY"
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
     "content": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI"
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
     "path": "ceremony/keys/archive/CALLER-studio.signing.ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM.nk",
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
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 4456,
     "content": "{\n  \"manifest\": {\n    \"generation\": 8,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T13:02:05.742933+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n        \"signing\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n        \"signing\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n        \"retired\": {\n          \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\": 7\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"signing\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      \"SYS\": {\n        \"identity\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n        \"signing\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"signing\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UAY6SWK64V6IJVS7PKG4JGVV77Q5QOVJCUMPJDJXWGD3OL25MQ2CZC67\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 8,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791277325,\n        \"expires_at\": 1822813325,\n        \"signing_key\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\",\n        \"reason\": \"reissued\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UD5AXT6FJTAWWGSZTBTOWKQDWHSPVODRUW4LRQTX6IWNQXUHWMF5XHJI\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 6,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791277317,\n        \"expires_at\": 1822813317,\n        \"signing_key\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG\",\n        \"at\": 1791277325,\n        \"generation\": 8,\n        \"expires_at\": 1822813314,\n        \"kind\": \"superseded\"\n      },\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\",\n        \"at\": 1791277312,\n        \"generation\": 3,\n        \"expires_at\": 1822813310,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"signature\": \"446460d22c2f22585efebc8d19215574d9067ff4dac763d240bf138fbbe0880095057146dbf6e79b09e5afd9e9af8281856f05844a85fe6ac9f0527677ae9907\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2248,
     "content": "{\n  \"jti\": \"CKPQC5Y42YZGYDNICLMDL5JFUF623F5R4TKGS6OKMOAUNFDO67IA\",\n  \"iat\": 1791277325,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F.\\u003e\",\n        \"account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJJRk1ETTVST1ZHUVhEQjZNSUg0VFdKUVhHUVpVR0JBS1lLNlBKUDZYTlZJM1ZHRUZSSzZRIiwiaWF0IjoxNzkxMjc3MzI1LCJpc3MiOiJBRENRT0xNRlVRVkk3RUNTU1IyNlc0T05HWFZWSEhFQzI2WE9PUzVMNUdIRzdQRUdQWVpYQVYzRyIsInN1YiI6IkFESlY3QUY1TEJUTVNDTlZGWTJCN0tFRlNIWTRGT0YzNlhFQU1TNkxIM1dYN0lDV0JGVEQzNDZGIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURKVjdBRjVMQlRNU0NOVkZZMkI3S0VGU0hZNEZPRjM2WEVBTVM2TEgzV1g3SUNXQkZURDM0NkYuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.iwE3pv__sUXHtpQStVzupImDYhYVaVV89usgneleondLXkQgapV9FkNDz0BopJtgUu9riNku6yKUBM4PZQWQAA\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n    ],\n    \"revocations\": {\n      \"UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG\": 1791277325\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"UWTTQ6OE3P3HEJP76XHN3ZFBN2QI3UTKJACSEZV3C7QX3C47TUVA\",\n  \"iat\": 1791277325,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ.\\u003e\",\n        \"account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJOV0xQUVpTWUpRNVNEWDNXWldaTDUzSTdMS0FVNkJBUFdHVVFTTjNSTktMUDRUN1JGVldRIiwiaWF0IjoxNzkxMjc3MzI1LCJpc3MiOiJBRENRT0xNRlVRVkk3RUNTU1IyNlc0T05HWFZWSEhFQzI2WE9PUzVMNUdIRzdQRUdQWVpYQVYzRyIsInN1YiI6IkFEMjdXVE9UNEVJM0hFNDVFQlhTQkNQVUhGWFdTV0pFRUUyRUdHM0xMWklPM0RCTlA1NDdZWkNRIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUQyN1dUT1Q0RUkzSEU0NUVCWFNCQ1BVSEZYV1NXSkVFRTJFR0czTExaSU8zREJOUDU0N1laQ1EuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.fDhed53To90TRxvYNNXmtcl0NJOSmBjvNQYijj8FwdnqSAimqGCntbYwb3XuxZwhK9WAil20rqX57uQcBgxLCQ\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"WW5OFS6PWKTEESYPLR3SIR2W5IMMEKSYQNSAI47DK46ESXX5E37A\",\n  \"iat\": 1791277325,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiI2NEFaRVREWElOTlhZWEdGWkFMRVpXREJPS0ZHQlVLVEZZNVBWNDZBWjNNS1FPTEIyT09RIiwiaWF0IjoxNzkxMjc3MzI1LCJpc3MiOiJBQjZDWlJBWVdIUUFXNzYzTkxXMkhYQk9WUFpTR09XNVZFSkZMTzRNQlJMTU5JRElZQ1FZVzQ0VSIsInN1YiI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQUNVVE9YR0tGT0c2VkdUTUhKRTRDTFJNNVhETDdKS0ZFWDJQNkxOT1NZWklTM0ZJSVBYS1NUSSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.Mr6XZHx6yCuMaeODSQKsKXXzHxQaRyAe7DI8wGmo7qJj74gRPWK4DxgHVB2ozL04rb9RBWjADqhQbLhmFGIaBA\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"44IVEQFPUT44JPONERFMRIGYX56UBAE7FCJIRID7VLJX6LTMAODA\",\n  \"iat\": 1791277325,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"SYS\",\n  \"sub\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 1084,
     "content": "{\n  \"jti\": \"EZ5OXQAIROS3LFJARBGQJJORNAEZ2GJW26FDG5JYZSHNLDSWCCLA\",\n  \"iat\": 1791277325,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n    ],\n    \"revocations\": {\n      \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\": 1791277312\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n  \"studio\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "changed",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813325,\n  \"jti\": \"N4ZMBH5OSNN6DD6MKTB42KECZ5SL55KR3WPQ5TRYBTFLTUKH7HKQ\",\n  \"iat\": 1791277325,\n  \"iss\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\",\n  \"name\": \"batch\",\n  \"sub\": \"UAY6SWK64V6IJVS7PKG4JGVV77Q5QOVJCUMPJDJXWGD3OL25MQ2CZC67\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:8\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"JOZ5EPLT7TQF2C42SDAH4ECIX6RZRQD2WLRN75KUZLPSEVR36SQQ\",\n  \"iat\": 1791277309,\n  \"iss\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\",\n  \"name\": \"ops\",\n  \"sub\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"YOBOFUF7UXKB66VMGWMQZZJN6JVLFQNNQAG5XZQU66UH4D4R2J6Q\",\n  \"iat\": 1791277309,\n  \"iss\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\",\n  \"name\": \"rund\",\n  \"sub\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813317,\n  \"jti\": \"BJLA6MOSSIBSMVAOJ4A6C3ZLT7WYUDYKRFHTYJEPZ4VMEGOVVCVQ\",\n  \"iat\": 1791277317,\n  \"iss\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n  \"name\": \"studio\",\n  \"sub\": \"UD5AXT6FJTAWWGSZTBTOWKQDWHSPVODRUW4LRQTX6IWNQXUHWMF5XHJI\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:6\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"OZDQG7LQN6SJN6OAPPUWQNBO45QJWOLBF67W2RCR5SBRIS34KWVA\",\n  \"iat\": 1791277309,\n  \"iss\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 4456,
     "content": "{\n  \"manifest\": {\n    \"generation\": 8,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T13:02:05.742933+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n        \"signing\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n        \"signing\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n        \"retired\": {\n          \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\": 7\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"signing\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      \"SYS\": {\n        \"identity\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n        \"signing\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"signing\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UAY6SWK64V6IJVS7PKG4JGVV77Q5QOVJCUMPJDJXWGD3OL25MQ2CZC67\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 8,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791277325,\n        \"expires_at\": 1822813325,\n        \"signing_key\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\",\n        \"reason\": \"reissued\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UD5AXT6FJTAWWGSZTBTOWKQDWHSPVODRUW4LRQTX6IWNQXUHWMF5XHJI\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 6,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791277317,\n        \"expires_at\": 1822813317,\n        \"signing_key\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG\",\n        \"at\": 1791277325,\n        \"generation\": 8,\n        \"expires_at\": 1822813314,\n        \"kind\": \"superseded\"\n      },\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\",\n        \"at\": 1791277312,\n        \"generation\": 3,\n        \"expires_at\": 1822813310,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"signature\": \"446460d22c2f22585efebc8d19215574d9067ff4dac763d240bf138fbbe0880095057146dbf6e79b09e5afd9e9af8281856f05844a85fe6ac9f0527677ae9907\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 249,
     "content": "[\n  {\n    \"Name\": \"batch\",\n    \"Account\": \"CALLER-batch\",\n    \"Public\": \"UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG\",\n    \"At\": \"2026-10-06T13:02:05.742933+04:00\",\n    \"Kind\": \"superseded\",\n    \"Why\": \"superseded by generation 8\"\n  }\n]"
    }
   ],
   "bus": {
    "server": "tls://127.0.0.1:62849",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F",
      "signing_keys": [
       "ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP"
      ],
      "revocations": 1,
      "pushed": true
     },
     {
      "name": "CALLER-studio",
      "public": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "signing_keys": [
       "AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7",
      "signing_keys": [
       "ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY",
      "signing_keys": [
       "AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "signing_keys": [
       "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U"
      ],
      "revocations": 1,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F",
      "public": "UAY6SWK64V6IJVS7PKG4JGVV77Q5QOVJCUMPJDJXWGD3OL25MQ2CZC67",
      "issuer": "ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:8"
      ],
      "expires": "2027-10-06T09:02:05Z",
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
      "account": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY",
      "public": "UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA",
      "issuer": "AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7",
      "public": "UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF",
      "issuer": "ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
      "account": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ",
      "public": "UD5AXT6FJTAWWGSZTBTOWKQDWHSPVODRUW4LRQTX6IWNQXUHWMF5XHJI",
      "issuer": "AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:6"
      ],
      "expires": "2027-10-06T09:01:57Z",
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
      "account": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI",
      "public": "UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN",
      "issuer": "AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-06T09:01:49Z",
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
   "stdout": "generation 8 from catalogue 24164e3e783d, issued 2026-10-06T13:02:05+04:00; 5 credentials\n  CALLER-batch  identity ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F  signing ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\n  CALLER-studio  identity AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ  signing AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\n  GARM  identity ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7  signing ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\n  SYS  identity AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY  signing AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\n  TOOLS  identity AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI  signing AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\n",
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
     "content": "ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F"
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
     "content": "AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ"
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
     "content": "ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7"
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
     "content": "AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY"
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
     "content": "AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI"
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
     "path": "ceremony/keys/archive/CALLER-studio.signing.ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM.nk",
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
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 4456,
     "content": "{\n  \"manifest\": {\n    \"generation\": 8,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T13:02:05.742933+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n        \"signing\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n        \"signing\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n        \"retired\": {\n          \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\": 7\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"signing\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      \"SYS\": {\n        \"identity\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n        \"signing\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"signing\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UAY6SWK64V6IJVS7PKG4JGVV77Q5QOVJCUMPJDJXWGD3OL25MQ2CZC67\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 8,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791277325,\n        \"expires_at\": 1822813325,\n        \"signing_key\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\",\n        \"reason\": \"reissued\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UD5AXT6FJTAWWGSZTBTOWKQDWHSPVODRUW4LRQTX6IWNQXUHWMF5XHJI\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 6,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791277317,\n        \"expires_at\": 1822813317,\n        \"signing_key\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG\",\n        \"at\": 1791277325,\n        \"generation\": 8,\n        \"expires_at\": 1822813314,\n        \"kind\": \"superseded\"\n      },\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\",\n        \"at\": 1791277312,\n        \"generation\": 3,\n        \"expires_at\": 1822813310,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"signature\": \"446460d22c2f22585efebc8d19215574d9067ff4dac763d240bf138fbbe0880095057146dbf6e79b09e5afd9e9af8281856f05844a85fe6ac9f0527677ae9907\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2248,
     "content": "{\n  \"jti\": \"CKPQC5Y42YZGYDNICLMDL5JFUF623F5R4TKGS6OKMOAUNFDO67IA\",\n  \"iat\": 1791277325,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F.\\u003e\",\n        \"account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJJRk1ETTVST1ZHUVhEQjZNSUg0VFdKUVhHUVpVR0JBS1lLNlBKUDZYTlZJM1ZHRUZSSzZRIiwiaWF0IjoxNzkxMjc3MzI1LCJpc3MiOiJBRENRT0xNRlVRVkk3RUNTU1IyNlc0T05HWFZWSEhFQzI2WE9PUzVMNUdIRzdQRUdQWVpYQVYzRyIsInN1YiI6IkFESlY3QUY1TEJUTVNDTlZGWTJCN0tFRlNIWTRGT0YzNlhFQU1TNkxIM1dYN0lDV0JGVEQzNDZGIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURKVjdBRjVMQlRNU0NOVkZZMkI3S0VGU0hZNEZPRjM2WEVBTVM2TEgzV1g3SUNXQkZURDM0NkYuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.iwE3pv__sUXHtpQStVzupImDYhYVaVV89usgneleondLXkQgapV9FkNDz0BopJtgUu9riNku6yKUBM4PZQWQAA\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n    ],\n    \"revocations\": {\n      \"UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG\": 1791277325\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2134,
     "content": "{\n  \"jti\": \"UWTTQ6OE3P3HEJP76XHN3ZFBN2QI3UTKJACSEZV3C7QX3C47TUVA\",\n  \"iat\": 1791277325,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ.\\u003e\",\n        \"account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJOV0xQUVpTWUpRNVNEWDNXWldaTDUzSTdMS0FVNkJBUFdHVVFTTjNSTktMUDRUN1JGVldRIiwiaWF0IjoxNzkxMjc3MzI1LCJpc3MiOiJBRENRT0xNRlVRVkk3RUNTU1IyNlc0T05HWFZWSEhFQzI2WE9PUzVMNUdIRzdQRUdQWVpYQVYzRyIsInN1YiI6IkFEMjdXVE9UNEVJM0hFNDVFQlhTQkNQVUhGWFdTV0pFRUUyRUdHM0xMWklPM0RCTlA1NDdZWkNRIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUQyN1dUT1Q0RUkzSEU0NUVCWFNCQ1BVSEZYV1NXSkVFRTJFR0czTExaSU8zREJOUDU0N1laQ1EuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.fDhed53To90TRxvYNNXmtcl0NJOSmBjvNQYijj8FwdnqSAimqGCntbYwb3XuxZwhK9WAil20rqX57uQcBgxLCQ\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2053,
     "content": "{\n  \"jti\": \"WW5OFS6PWKTEESYPLR3SIR2W5IMMEKSYQNSAI47DK46ESXX5E37A\",\n  \"iat\": 1791277325,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiI2NEFaRVREWElOTlhZWEdGWkFMRVpXREJPS0ZHQlVLVEZZNVBWNDZBWjNNS1FPTEIyT09RIiwiaWF0IjoxNzkxMjc3MzI1LCJpc3MiOiJBQjZDWlJBWVdIUUFXNzYzTkxXMkhYQk9WUFpTR09XNVZFSkZMTzRNQlJMTU5JRElZQ1FZVzQ0VSIsInN1YiI6IkFDR0FWTjUyTTdMR1paNjQ0VFgyUENZVEtTU0JCWU41SFcyTTVSVE01M0RFUlNJRkJXR1pUSkY3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQUNVVE9YR0tGT0c2VkdUTUhKRTRDTFJNNVhETDdKS0ZFWDJQNkxOT1NZWklTM0ZJSVBYS1NUSSIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.Mr6XZHx6yCuMaeODSQKsKXXzHxQaRyAe7DI8wGmo7qJj74gRPWK4DxgHVB2ozL04rb9RBWjADqhQbLhmFGIaBA\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"44IVEQFPUT44JPONERFMRIGYX56UBAE7FCJIRID7VLJX6LTMAODA\",\n  \"iat\": 1791277325,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"SYS\",\n  \"sub\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 1084,
     "content": "{\n  \"jti\": \"EZ5OXQAIROS3LFJARBGQJJORNAEZ2GJW26FDG5JYZSHNLDSWCCLA\",\n  \"iat\": 1791277325,\n  \"iss\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n    ],\n    \"revocations\": {\n      \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\": 1791277312\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n  \"studio\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1307,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813325,\n  \"jti\": \"N4ZMBH5OSNN6DD6MKTB42KECZ5SL55KR3WPQ5TRYBTFLTUKH7HKQ\",\n  \"iat\": 1791277325,\n  \"iss\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\",\n  \"name\": \"batch\",\n  \"sub\": \"UAY6SWK64V6IJVS7PKG4JGVV77Q5QOVJCUMPJDJXWGD3OL25MQ2CZC67\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:8\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"JOZ5EPLT7TQF2C42SDAH4ECIX6RZRQD2WLRN75KUZLPSEVR36SQQ\",\n  \"iat\": 1791277309,\n  \"iss\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\",\n  \"name\": \"ops\",\n  \"sub\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1385,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"YOBOFUF7UXKB66VMGWMQZZJN6JVLFQNNQAG5XZQU66UH4D4R2J6Q\",\n  \"iat\": 1791277309,\n  \"iss\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\",\n  \"name\": \"rund\",\n  \"sub\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1308,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813317,\n  \"jti\": \"BJLA6MOSSIBSMVAOJ4A6C3ZLT7WYUDYKRFHTYJEPZ4VMEGOVVCVQ\",\n  \"iat\": 1791277317,\n  \"iss\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n  \"name\": \"studio\",\n  \"sub\": \"UD5AXT6FJTAWWGSZTBTOWKQDWHSPVODRUW4LRQTX6IWNQXUHWMF5XHJI\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:6\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822813309,\n  \"jti\": \"OZDQG7LQN6SJN6OAPPUWQNBO45QJWOLBF67W2RCR5SBRIS34KWVA\",\n  \"iat\": 1791277309,\n  \"iss\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 4456,
     "content": "{\n  \"manifest\": {\n    \"generation\": 8,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-06T13:02:05.742933+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"ADJV7AF5LBTMSCNVFY2B7KEFSHY4FOF36XEAMS6LH3WX7ICWBFTD346F\",\n        \"signing\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"AD27WTOT4EI3HE45EBXSBCPUHFXWSWJEEE2EGG3LLZIO3DBNP547YZCQ\",\n        \"signing\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\",\n        \"retired\": {\n          \"ACE5CZRPMHXTE2H5OSFRRV2JTWZG7INTGEXI6OBD2G7JVHWVZ5O4ZHGM\": 7\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ACGAVN52M7LGZZ644TX2PCYTKSSBBYN5HW2M5RTM53DERSIFBWGZTJF7\",\n        \"signing\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      \"SYS\": {\n        \"identity\": \"AAUGHK2OEKBBWAYAJVFLU324UVDT6YFU6VSGIT77B4YIIXMAK6PJJCWY\",\n        \"signing\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AACUTOXGKFOG6VGTMHJE4CLRM5XDL7JKFEX2P6LNOSYZIS3FIIPXKSTI\",\n        \"signing\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UAY6SWK64V6IJVS7PKG4JGVV77Q5QOVJCUMPJDJXWGD3OL25MQ2CZC67\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 8,\n        \"permissions_hash\": \"80b7810c3e17989d\",\n        \"issued_at\": 1791277325,\n        \"expires_at\": 1822813325,\n        \"signing_key\": \"ABCDAERGLIHHPVWBXHTCBDWWZ6N4YATDHQMQZWMTHWBXI6FAB2NYIKKP\",\n        \"reason\": \"reissued\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UDH2HEZ7JLZRBE4GUMYDRBUDK2MYCPQI6FBY57DE54RMD6CKBR5FQKTA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AAO7RPOKFBL7BL76JTH3CZJ2YP6DSJTYZIKCT67EXRUQS32TEVF6X4SB\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UCS3LIZ4Y2WSLQCTNWXGFD4ODCW53VA2GBZNIHW5BP577IFN5NXZEAOF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"4c2d65b9986f1f0f\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"ADCQOLMFUQVI7ECSSR26W4ONGXVVHHEC26XOOS5L5GHG7PEGPYZXAV3G\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UD5AXT6FJTAWWGSZTBTOWKQDWHSPVODRUW4LRQTX6IWNQXUHWMF5XHJI\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 6,\n        \"permissions_hash\": \"190cdc15c2d35c25\",\n        \"issued_at\": 1791277317,\n        \"expires_at\": 1822813317,\n        \"signing_key\": \"AANTUL47E7MGOYCDERTEBCHDB6QNQTC7QWUFNIZBBKH2M47U7G25EVCF\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC2DQNXSA4W5LHTFRQWNRG3BDNDUCHWMT4VAQ6D2TZBJCPKDYI3K7FZN\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791277309,\n        \"expires_at\": 1822813309,\n        \"signing_key\": \"AB6CZRAYWHQAW763NLW2HXBOVPZSGOW5VEJFLO4MBRLMNIDIYCQYW44U\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG\",\n        \"at\": 1791277325,\n        \"generation\": 8,\n        \"expires_at\": 1822813314,\n        \"kind\": \"superseded\"\n      },\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC5CPEH27FKAZOTI4GE6PYZUTQBZFOKYGGPTGNCXNMVAMKNZYUJDBNNS\",\n        \"at\": 1791277312,\n        \"generation\": 3,\n        \"expires_at\": 1822813310,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\",\n  \"signature\": \"446460d22c2f22585efebc8d19215574d9067ff4dac763d240bf138fbbe0880095057146dbf6e79b09e5afd9e9af8281856f05844a85fe6ac9f0527677ae9907\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"GARCG2P6TXZD2R4BJBITKB3RIONXBT4RW3XWDGCC46JAXUDUPCNA\",\n  \"iat\": 1791277309,\n  \"iss\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"name\": \"garm\",\n  \"sub\": \"OAFYJKC5ZJOIYHZA7RGBIYWWAOQNXV7I6UEVOKO7YAYIS47B3MIXFYMP\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OD6Q4YARDQILNUC5JMKS5PSZSCLMX2FBCSBVIBKF6EWANMNCVLKFLNZM\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 249,
     "content": "[\n  {\n    \"Name\": \"batch\",\n    \"Account\": \"CALLER-batch\",\n    \"Public\": \"UB2KV5ZF44YORRNYSML3S6ZOG3EYOMBC2RPHZUV7NJT4GTASV6MSPYBG\",\n    \"At\": \"2026-10-06T13:02:05.742933+04:00\",\n    \"Kind\": \"superseded\",\n    \"Why\": \"superseded by generation 8\"\n  }\n]"
    }
   ]
  }
 ]
}
;
