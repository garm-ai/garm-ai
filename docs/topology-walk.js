// Written by `mise run topology-walk` (cmd/garmctl/walk_test.go): the lifecycle of
// docs/operating-the-topology.md run for real and recorded. Regenerate, do not edit.
window.TOPOLOGY_WALK = {
 "generated_at": "2026-10-07T05:12:40Z",
 "steps": [
  {
   "id": "ceremony",
   "title": "The root ceremony, once, offline",
   "prose": "`garmctl operator init` mints the operator root and the operator signing key, writes the root-signed operator JWT, and puts the root under `root/` for custody. Everything `topology` will ever need is under `keys/`; the root is not.",
   "command": "garmctl operator init --out ceremony",
   "stdout": "ok: operator ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF; keys for topology in ceremony/keys\nMOVE ceremony/root TO CUSTODY NOW: the root signs nothing day to day and must never be where topology runs\n",
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
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "content": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7"
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
     "content": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A"
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
     "content": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH"
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
     "content": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36"
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
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 3181,
     "content": "{\n  \"manifest\": {\n    \"generation\": 1,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-07T09:12:15.47545+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n        \"signing\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"signing\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      \"SYS\": {\n        \"identity\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n        \"signing\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"signing\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"10d053423b42ba95\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"de4176fe88b30b4e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\",\n        \"reason\": \"new\"\n      }\n    ]\n  },\n  \"signer\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"signature\": \"1136b127fb5ddcff595ca31c021aa06a3682f09155b07d13543808d484a4545f5d8097620bd2ca2d8e619318bed61809734b3ceaec8a5562d12d9874d5de2204\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 3410,
     "content": "{\n  \"jti\": \"2ZK64RE6I64CJOLX2QSVEQSHN2H4MGDHZTGF237EJ7UXF6OQQY5Q\",\n  \"iat\": 1791349935,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJKVU1JVFhQTUVXU0E2SFVZS01FU1VLVTRGNFZGSFlXVlVBNFhVVEFXSFFCRTRJSlZZRVdBIiwiaWF0IjoxNzkxMzQ5OTM1LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFEUkhPREpaRExPWDY0SFg1NlpFUjM3TTJMUzNIM0JaS1JDUFlLVkgzS0dIVVJGQjZOSVlXNVM3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURSSE9ESlpETE9YNjRIWDU2WkVSMzdNMkxTM0gzQlpLUkNQWUtWSDNLR0hVUkZCNk5JWVc1UzcuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.l1ZxG72yuZyC9bdBwk-K8_SEOwfDNjT9CkEYRt98iuJUokF2M9vhI_aAVJjRWA8oVOFheXvxpJswYxkrOAHZCA\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7.out.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJKVU1JVFhQTUVXU0E2SFVZS01FU1VLVTRGNFZGSFlXVlVBNFhVVEFXSFFCRTRJSlZZRVdBIiwiaWF0IjoxNzkxMzQ5OTM1LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFEUkhPREpaRExPWDY0SFg1NlpFUjM3TTJMUzNIM0JaS1JDUFlLVkgzS0dIVVJGQjZOSVlXNVM3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURSSE9ESlpETE9YNjRIWDU2WkVSMzdNMkxTM0gzQlpLUkNQWUtWSDNLR0hVUkZCNk5JWVc1Uzcub3V0Llx1MDAzZSIsImtpbmQiOiJzdHJlYW0iLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.35KwKfX-gBzDIe9YkEm-viFzNqj6lb6-Mq0Ce4Ds9OphSafSm1bOM3tzzAeMSUmq0dXZMTe6gXlsGh6q4MMyBQ\",\n        \"local_subject\": \"garm.run.v1.out.\\u003e\",\n        \"type\": \"stream\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 2202,
     "content": "{\n  \"jti\": \"C6ICMG2E7LTZY7OWH7YRRMWDNYQIKYXCHP45XYR5EQZZI24JX2UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJSR09MTDRKRTNHUEROTzZaUzI1V0xEWjZVWEQyWktSS0dZWEpETjJUTUJXVFJUWTdVRUhRIiwiaWF0IjoxNzkxMzQ5OTM1LCJpc3MiOiJBQklRSFQ1SFlNRENIRURTWEhFQTRaUVVNWkVWMlczWko2WlNZSEdMQkVBRFNGVE1YSUFaVVdNVCIsInN1YiI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQUFJSVZZMklVVlpGWUNWV1NHRDNCVFdDVEJNUkJNRkhZWFpaWlpUT0dGVUtXSDc0TU9LSUozNiIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.HzqzhepI3VqaZ_0j5ov9WmDbDN37AzKqTeeGJh7n5gteE3SSfPXR6ICYMwjbY3r1922C1oolrg1TimL1GdL2AQ\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.*.out.\\u003e\",\n        \"type\": \"stream\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"IP5TFPZ2EP3D3BPSOR6WKHL4BJCF5NPLUXTFWVDPGBGKFFY2QZYA\",\n  \"iat\": 1791349935,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"SYS\",\n  \"sub\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"UVPBQJYHHDNQWPIOYUTFFRDR7ZQRQSYJL3CHIVXHJB54IJPWDWJQ\",\n  \"iat\": 1791349935,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "new",
     "secret": false,
     "size": 74,
     "content": "{\n  \"studio\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\"\n}"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"WRYA3EIFM4RWGTNTCRQ36TAONJ55DYPL46XQPRM6PS4MFCB3TBDQ\",\n  \"iat\": 1791349935,\n  \"iss\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\",\n  \"name\": \"ops\",\n  \"sub\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1421,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"SN6TG73UXVVPZORNIAYAVDCUJ2ZUOP2YMFV5SYARWYV52F6OBUEA\",\n  \"iat\": 1791349935,\n  \"iss\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\",\n  \"name\": \"rund\",\n  \"sub\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\",\n        \"garm.run.v1.*.out.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1396,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"XNYSIJOVP5S2WEFRPDJEEQH5OPEJPO3VLLDWP6LIO5JK57ILY4XQ\",\n  \"iat\": 1791349935,\n  \"iss\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\",\n  \"name\": \"studio\",\n  \"sub\": \"UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.invoke\",\n        \"garm.run.v1.fetch\",\n        \"garm.run.v1.events\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\",\n        \"garm.run.v1.out.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"7I5GELQJ5BXHYJ6MTWDUEC7AMWYYDR5GYATO2SMT7RKFATYSRBUA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "new",
     "secret": false,
     "size": 3181,
     "content": "{\n  \"manifest\": {\n    \"generation\": 1,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-07T09:12:15.47545+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n        \"signing\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"signing\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      \"SYS\": {\n        \"identity\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n        \"signing\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"signing\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"10d053423b42ba95\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"de4176fe88b30b4e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\",\n        \"reason\": \"new\"\n      }\n    ]\n  },\n  \"signer\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"signature\": \"1136b127fb5ddcff595ca31c021aa06a3682f09155b07d13543808d484a4545f5d8097620bd2ca2d8e619318bed61809734b3ceaec8a5562d12d9874d5de2204\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:62504",
    "accounts": [
     {
      "name": "CALLER-studio",
      "public": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "signing_keys": [
       "AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "GARM",
      "public": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A",
      "signing_keys": [
       "AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "SYS",
      "public": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH",
      "signing_keys": [
       "ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "TOOLS",
      "public": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "signing_keys": [
       "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT"
      ],
      "revocations": 0,
      "pushed": false
     }
    ],
    "creds": [
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH",
      "public": "UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA",
      "issuer": "ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A",
      "public": "UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O",
      "issuer": "AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": [
       "garm.tool.>",
       "garm.run.v1.*.out.>"
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
      "account": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "public": "UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT",
      "issuer": "AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": [
       "garm.run.v1.invoke",
       "garm.run.v1.fetch",
       "garm.run.v1.events"
      ],
      "sub_allow": [
       "_INBOX.>",
       "garm.run.v1.out.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/weather.v1.WeatherService.creds",
      "name": "weather.v1.WeatherService",
      "account": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "public": "UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ",
      "issuer": "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
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
     },
     {
      "cred": "studio",
      "action": "subscribe",
      "subject": "garm.run.v1.out.>",
      "outcome": "allowed"
     },
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.run.v1.out.forged.1",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Publish to \"garm.run.v1.out.forged.1\""
     },
     {
      "cred": "rund",
      "action": "publish",
      "subject": "garm.run.v1.ACX.out.r.1",
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
     "content": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7"
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
     "content": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A"
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
     "content": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH"
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
     "content": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36"
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
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "content": "{\n  \"manifest\": {\n    \"generation\": 2,\n    \"catalogue_sha256\": \"f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n    \"issued_at\": \"2026-10-07T09:12:17.557232+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n        \"signing\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"signing\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      \"SYS\": {\n        \"identity\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n        \"signing\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"signing\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"10d053423b42ba95\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"de4176fe88b30b4e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      },\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\",\n        \"catalogue_sha256\": \"f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n        \"generation\": 2,\n        \"permissions_hash\": \"19ef9109d050959e\",\n        \"issued_at\": 1791349937,\n        \"expires_at\": 1822885937,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\",\n        \"reason\": \"new\"\n      }\n    ]\n  },\n  \"signer\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"signature\": \"2bbbad94ca9d5df9888d439b4cb8bc46c93a06a0bb0a3ef047f247c42a8360d30004b25384caecdf55e53aeb5ed24dd0c4f196ad5fdd8a65c1a858887c089b0d\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 3410,
     "content": "{\n  \"jti\": \"7ASIXUO6WHEZQNFAICOICTZOCWE7RA5KOHEMJLAP3NVZ7CAJRHHA\",\n  \"iat\": 1791349937,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJZWFlQUUtYM01BWEhYUEFGVFVJU0NVQ05UVlhFM1pSV1BVQ08zVFBEQllDRlBDNE5BSUxRIiwiaWF0IjoxNzkxMzQ5OTM3LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFEUkhPREpaRExPWDY0SFg1NlpFUjM3TTJMUzNIM0JaS1JDUFlLVkgzS0dIVVJGQjZOSVlXNVM3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURSSE9ESlpETE9YNjRIWDU2WkVSMzdNMkxTM0gzQlpLUkNQWUtWSDNLR0hVUkZCNk5JWVc1UzcuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.HLZ54LRX_1DG4ppfXA87T8xsdgFEsLPANTerKkfsQRSuYEFPGZ6ow2JKRPxf0TRxCfjwpqqMLdXsVJEAHdOoCA\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7.out.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJZWFlQUUtYM01BWEhYUEFGVFVJU0NVQ05UVlhFM1pSV1BVQ08zVFBEQllDRlBDNE5BSUxRIiwiaWF0IjoxNzkxMzQ5OTM3LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFEUkhPREpaRExPWDY0SFg1NlpFUjM3TTJMUzNIM0JaS1JDUFlLVkgzS0dIVVJGQjZOSVlXNVM3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURSSE9ESlpETE9YNjRIWDU2WkVSMzdNMkxTM0gzQlpLUkNQWUtWSDNLR0hVUkZCNk5JWVc1Uzcub3V0Llx1MDAzZSIsImtpbmQiOiJzdHJlYW0iLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.PCQG1rmGRQIItPGPKLILdZ9drp0eXYAi258Kg0mvFzHWvUKnSA9WxfNFjMyFxvhHNb4pWA4XRUE45BU_Kr-9CA\",\n        \"local_subject\": \"garm.run.v1.out.\\u003e\",\n        \"type\": \"stream\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2202,
     "content": "{\n  \"jti\": \"VFFBUXENLYFRUSHNV6SORWWHZI3DGGROUK7MIX6KR5Z2TG2LBBXA\",\n  \"iat\": 1791349937,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJQWjRURkRMNFRaNzZCS1VLMlVXRktFN0RNWFBWTlE0MlJMV1RUQVRTSzJQV1FZWFdHT1VBIiwiaWF0IjoxNzkxMzQ5OTM3LCJpc3MiOiJBQklRSFQ1SFlNRENIRURTWEhFQTRaUVVNWkVWMlczWko2WlNZSEdMQkVBRFNGVE1YSUFaVVdNVCIsInN1YiI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQUFJSVZZMklVVlpGWUNWV1NHRDNCVFdDVEJNUkJNRkhZWFpaWlpUT0dGVUtXSDc0TU9LSUozNiIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.4GyaYrSmHNUgKxNAOir8ZmAKUDcmP39S55_unn6Y6Ho_6dVF2gCNVcaKyyu8UawzuhopgK71q73GPMQF16txDg\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.*.out.\\u003e\",\n        \"type\": \"stream\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"P57JIO6632NKIVJSACYNKG6ZZ6JOZMWFDPRLWSCUIYRXEURMRH6A\",\n  \"iat\": 1791349937,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"SYS\",\n  \"sub\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 969,
     "content": "{\n  \"jti\": \"EUVVB5KYUW6TGWWXVR65BA7FGY3OTNCROILJPQXNQYHBM23QUK6A\",\n  \"iat\": 1791349937,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 74,
     "content": "{\n  \"studio\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\"\n}"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"WRYA3EIFM4RWGTNTCRQ36TAONJ55DYPL46XQPRM6PS4MFCB3TBDQ\",\n  \"iat\": 1791349935,\n  \"iss\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\",\n  \"name\": \"ops\",\n  \"sub\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1421,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"SN6TG73UXVVPZORNIAYAVDCUJ2ZUOP2YMFV5SYARWYV52F6OBUEA\",\n  \"iat\": 1791349935,\n  \"iss\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\",\n  \"name\": \"rund\",\n  \"sub\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\",\n        \"garm.run.v1.*.out.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1396,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"XNYSIJOVP5S2WEFRPDJEEQH5OPEJPO3VLLDWP6LIO5JK57ILY4XQ\",\n  \"iat\": 1791349935,\n  \"iss\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\",\n  \"name\": \"studio\",\n  \"sub\": \"UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.invoke\",\n        \"garm.run.v1.fetch\",\n        \"garm.run.v1.events\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\",\n        \"garm.run.v1.out.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"7I5GELQJ5BXHYJ6MTWDUEC7AMWYYDR5GYATO2SMT7RKFATYSRBUA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather2.v1.WeatherService.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1399,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885937,\n  \"jti\": \"6GTQQ3OCJFRACTJPKGOWXF7S2V6VB5246D5676JGOV5VICBUDE4Q\",\n  \"iat\": 1791349937,\n  \"iss\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\",\n  \"name\": \"weather2.v1.WeatherService\",\n  \"sub\": \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather-2.v1.get_forecast\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n    \"tags\": [\n      \"catalogue:f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n      \"generation:2\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3594,
     "content": "{\n  \"manifest\": {\n    \"generation\": 2,\n    \"catalogue_sha256\": \"f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n    \"issued_at\": \"2026-10-07T09:12:17.557232+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n        \"signing\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"signing\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      \"SYS\": {\n        \"identity\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n        \"signing\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"signing\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"10d053423b42ba95\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"de4176fe88b30b4e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      },\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\",\n        \"catalogue_sha256\": \"f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a\",\n        \"generation\": 2,\n        \"permissions_hash\": \"19ef9109d050959e\",\n        \"issued_at\": 1791349937,\n        \"expires_at\": 1822885937,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\",\n        \"reason\": \"new\"\n      }\n    ]\n  },\n  \"signer\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"signature\": \"2bbbad94ca9d5df9888d439b4cb8bc46c93a06a0bb0a3ef047f247c42a8360d30004b25384caecdf55e53aeb5ed24dd0c4f196ad5fdd8a65c1a858887c089b0d\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:62504",
    "accounts": [
     {
      "name": "CALLER-studio",
      "public": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "signing_keys": [
       "AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A",
      "signing_keys": [
       "AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH",
      "signing_keys": [
       "ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "signing_keys": [
       "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT"
      ],
      "revocations": 0,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH",
      "public": "UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA",
      "issuer": "ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A",
      "public": "UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O",
      "issuer": "AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": [
       "garm.tool.>",
       "garm.run.v1.*.out.>"
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
      "account": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "public": "UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT",
      "issuer": "AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": [
       "garm.run.v1.invoke",
       "garm.run.v1.fetch",
       "garm.run.v1.events"
      ],
      "sub_allow": [
       "_INBOX.>",
       "garm.run.v1.out.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/weather.v1.WeatherService.creds",
      "name": "weather.v1.WeatherService",
      "account": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "public": "UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ",
      "issuer": "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
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
      "account": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "public": "UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI",
      "issuer": "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT",
      "tags": [
       "catalogue:f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a",
       "generation:2"
      ],
      "expires": "2027-10-07T05:12:17Z",
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
     },
     {
      "cred": "studio",
      "action": "subscribe",
      "subject": "garm.run.v1.out.>",
      "outcome": "allowed"
     },
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.run.v1.out.forged.1",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Publish to \"garm.run.v1.out.forged.1\""
     },
     {
      "cred": "rund",
      "action": "publish",
      "subject": "garm.run.v1.ACX.out.r.1",
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
     "content": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7"
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
     "content": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A"
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
     "content": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH"
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
     "content": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36"
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
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 3388,
     "content": "{\n  \"manifest\": {\n    \"generation\": 3,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-07T09:12:19.61669+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n        \"signing\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"signing\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      \"SYS\": {\n        \"identity\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n        \"signing\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"signing\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"10d053423b42ba95\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"de4176fe88b30b4e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\",\n        \"at\": 1791349939,\n        \"generation\": 3,\n        \"expires_at\": 1822885937,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"signature\": \"960136276bf2fb99d00393e42e5e118bdd2ed5096c575237975386560c8e0615191024b62c1cefbd48d103b10b01f5856e8cac136bea0e13fd75339ec4a7a501\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 3410,
     "content": "{\n  \"jti\": \"AS7TP4Q3CPRD7GL7Q5D333CS76QWJMKPA6J3PMLTFL3FXCTBRQKA\",\n  \"iat\": 1791349939,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJRN1hEWElVQk5YSENRSEFVR0dRQ0hBNUFXQkZXVlJDWlA3SVJLUkE1WUU2QkE1WU1CNzRRIiwiaWF0IjoxNzkxMzQ5OTM5LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFEUkhPREpaRExPWDY0SFg1NlpFUjM3TTJMUzNIM0JaS1JDUFlLVkgzS0dIVVJGQjZOSVlXNVM3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURSSE9ESlpETE9YNjRIWDU2WkVSMzdNMkxTM0gzQlpLUkNQWUtWSDNLR0hVUkZCNk5JWVc1UzcuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.QnqJfGWR4ZQ3jeiu80cQbva75gKgSJp96LrKC3ca752vIO_G7BXsefTmby-Zk_y_swflor1kiJm6sQXadZZvCw\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7.out.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJRN1hEWElVQk5YSENRSEFVR0dRQ0hBNUFXQkZXVlJDWlA3SVJLUkE1WUU2QkE1WU1CNzRRIiwiaWF0IjoxNzkxMzQ5OTM5LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFEUkhPREpaRExPWDY0SFg1NlpFUjM3TTJMUzNIM0JaS1JDUFlLVkgzS0dIVVJGQjZOSVlXNVM3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURSSE9ESlpETE9YNjRIWDU2WkVSMzdNMkxTM0gzQlpLUkNQWUtWSDNLR0hVUkZCNk5JWVc1Uzcub3V0Llx1MDAzZSIsImtpbmQiOiJzdHJlYW0iLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.rVgW5Kb1MrE_2A8fr6xuwbPvQc2g7LNjrb-WAkVI5qIS29v6S_lHXChvh9cKRY1wyBewp8ne5F9sVsz4TPzPAw\",\n        \"local_subject\": \"garm.run.v1.out.\\u003e\",\n        \"type\": \"stream\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2202,
     "content": "{\n  \"jti\": \"HUEFZ4QIK5G5GOIXOVMADJT5QIVBVZHUQNWG64SYE53TEIGUT5KA\",\n  \"iat\": 1791349939,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJTMktLNlRTWklKVVFJT0pIT1NMRFJFNEg3VEdDRFc3QkhLWkROM0dITVJXNlFBSVZXV1dBIiwiaWF0IjoxNzkxMzQ5OTM5LCJpc3MiOiJBQklRSFQ1SFlNRENIRURTWEhFQTRaUVVNWkVWMlczWko2WlNZSEdMQkVBRFNGVE1YSUFaVVdNVCIsInN1YiI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQUFJSVZZMklVVlpGWUNWV1NHRDNCVFdDVEJNUkJNRkhZWFpaWlpUT0dGVUtXSDc0TU9LSUozNiIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.KxevGK71fYqm_ykicwfkgN9hErjEDZE7eo4zfTfBNAjPFooCFPeEDhmdcyrefITjmGba8FKrNnkylfubeBlyAA\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.*.out.\\u003e\",\n        \"type\": \"stream\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"JYAGSJ75I3CKPYYG35HXUSIUTDRIUMQXDRE6EIGGWHQNRL5A2VEA\",\n  \"iat\": 1791349939,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"SYS\",\n  \"sub\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 1084,
     "content": "{\n  \"jti\": \"HAMMQAQJUHJMEPYAJSODJHBKAWHLTKSWNZH6UFV3VFWONXCC6VWA\",\n  \"iat\": 1791349939,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n    ],\n    \"revocations\": {\n      \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\": 1791349939\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 74,
     "content": "{\n  \"studio\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\"\n}"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"WRYA3EIFM4RWGTNTCRQ36TAONJ55DYPL46XQPRM6PS4MFCB3TBDQ\",\n  \"iat\": 1791349935,\n  \"iss\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\",\n  \"name\": \"ops\",\n  \"sub\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1421,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"SN6TG73UXVVPZORNIAYAVDCUJ2ZUOP2YMFV5SYARWYV52F6OBUEA\",\n  \"iat\": 1791349935,\n  \"iss\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\",\n  \"name\": \"rund\",\n  \"sub\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\",\n        \"garm.run.v1.*.out.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1396,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"XNYSIJOVP5S2WEFRPDJEEQH5OPEJPO3VLLDWP6LIO5JK57ILY4XQ\",\n  \"iat\": 1791349935,\n  \"iss\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\",\n  \"name\": \"studio\",\n  \"sub\": \"UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.invoke\",\n        \"garm.run.v1.fetch\",\n        \"garm.run.v1.events\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\",\n        \"garm.run.v1.out.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"7I5GELQJ5BXHYJ6MTWDUEC7AMWYYDR5GYATO2SMT7RKFATYSRBUA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
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
     "size": 3388,
     "content": "{\n  \"manifest\": {\n    \"generation\": 3,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-07T09:12:19.61669+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n        \"signing\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"signing\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      \"SYS\": {\n        \"identity\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n        \"signing\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"signing\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"10d053423b42ba95\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"de4176fe88b30b4e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\",\n        \"at\": 1791349939,\n        \"generation\": 3,\n        \"expires_at\": 1822885937,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"signature\": \"960136276bf2fb99d00393e42e5e118bdd2ed5096c575237975386560c8e0615191024b62c1cefbd48d103b10b01f5856e8cac136bea0e13fd75339ec4a7a501\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 268,
     "content": "[\n  {\n    \"Name\": \"weather2.v1.WeatherService\",\n    \"Account\": \"TOOLS\",\n    \"Public\": \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\",\n    \"At\": \"2026-10-07T09:12:19.61669+04:00\",\n    \"Kind\": \"retired\",\n    \"Why\": \"retired: no longer in the catalogue\"\n  }\n]"
    }
   ],
   "bus": {
    "server": "tls://127.0.0.1:62504",
    "accounts": [
     {
      "name": "CALLER-studio",
      "public": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "signing_keys": [
       "AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A",
      "signing_keys": [
       "AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH",
      "signing_keys": [
       "ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "signing_keys": [
       "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT"
      ],
      "revocations": 1,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH",
      "public": "UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA",
      "issuer": "ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A",
      "public": "UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O",
      "issuer": "AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": [
       "garm.tool.>",
       "garm.run.v1.*.out.>"
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
      "account": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "public": "UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT",
      "issuer": "AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": [
       "garm.run.v1.invoke",
       "garm.run.v1.fetch",
       "garm.run.v1.events"
      ],
      "sub_allow": [
       "_INBOX.>",
       "garm.run.v1.out.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/weather.v1.WeatherService.creds",
      "name": "weather.v1.WeatherService",
      "account": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "public": "UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ",
      "issuer": "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
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
      "account": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "public": "UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI",
      "issuer": "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT",
      "tags": [
       "catalogue:f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a",
       "generation:2"
      ],
      "expires": "2027-10-07T05:12:17Z",
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
     },
     {
      "cred": "studio",
      "action": "subscribe",
      "subject": "garm.run.v1.out.>",
      "outcome": "allowed"
     },
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.run.v1.out.forged.1",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Publish to \"garm.run.v1.out.forged.1\""
     },
     {
      "cred": "rund",
      "action": "publish",
      "subject": "garm.run.v1.ACX.out.r.1",
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
     "content": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7"
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
     "content": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A"
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
     "content": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH"
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
     "content": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36"
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
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "content": "{\n  \"manifest\": {\n    \"generation\": 4,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-07T09:12:21.666681+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n        \"signing\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"signing\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      \"SYS\": {\n        \"identity\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n        \"signing\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"signing\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"10d053423b42ba95\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"de4176fe88b30b4e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\",\n        \"at\": 1791349939,\n        \"generation\": 3,\n        \"expires_at\": 1822885937,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"signature\": \"6a86eb7ba30c1d622ed929d6b6294514ef5ebc990d7cda3262712eb543adf04b6efe5377c02783d1c763ee689ea99015d1ce490294c9483e45bb80ec6a5b1b0a\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 3410,
     "content": "{\n  \"jti\": \"5MLWQRNUECD7BLPH4ONIRO7LI2RBMVEG2PFDV6HGMZAQBHDOA7TQ\",\n  \"iat\": 1791349941,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJKUktGWFpRNlk1REZMQ09RWllLU001SFFNWTdGWlJHVExDRkdYRlRZQ0gzRUw1V0ZMNlpBIiwiaWF0IjoxNzkxMzQ5OTQxLCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFEUkhPREpaRExPWDY0SFg1NlpFUjM3TTJMUzNIM0JaS1JDUFlLVkgzS0dIVVJGQjZOSVlXNVM3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURSSE9ESlpETE9YNjRIWDU2WkVSMzdNMkxTM0gzQlpLUkNQWUtWSDNLR0hVUkZCNk5JWVc1UzcuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.kJ38ceaQyPMtBV6O5YQP8IRnlpivwgV7_Ag4wvZhd5f8nWoAUXbyR-nAs5sK0CfzQcJ-uGlS9anFIudY_G3tBQ\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7.out.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJKUktGWFpRNlk1REZMQ09RWllLU001SFFNWTdGWlJHVExDRkdYRlRZQ0gzRUw1V0ZMNlpBIiwiaWF0IjoxNzkxMzQ5OTQxLCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFEUkhPREpaRExPWDY0SFg1NlpFUjM3TTJMUzNIM0JaS1JDUFlLVkgzS0dIVVJGQjZOSVlXNVM3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURSSE9ESlpETE9YNjRIWDU2WkVSMzdNMkxTM0gzQlpLUkNQWUtWSDNLR0hVUkZCNk5JWVc1Uzcub3V0Llx1MDAzZSIsImtpbmQiOiJzdHJlYW0iLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.ImCkn07nbUElO8FTgnXgDB4UKZrSCDzXvx9TjFUZlaVBemwPyN6baYwWuP_ShqgzZVC-NvWVo-gipNLU9t_hBg\",\n        \"local_subject\": \"garm.run.v1.out.\\u003e\",\n        \"type\": \"stream\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2202,
     "content": "{\n  \"jti\": \"N27BKBL5MNS3I2PVXXY45EMNAOV3E62CZ5E6OKVBIUWQZQX5MU2A\",\n  \"iat\": 1791349941,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJUTU1DM1lHU0xZRlJEVUJFQ1BKSFgyRE82TUNLNjVFWDZWMlNSMkFaVU4yTlhQSlFHNERBIiwiaWF0IjoxNzkxMzQ5OTQxLCJpc3MiOiJBQklRSFQ1SFlNRENIRURTWEhFQTRaUVVNWkVWMlczWko2WlNZSEdMQkVBRFNGVE1YSUFaVVdNVCIsInN1YiI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQUFJSVZZMklVVlpGWUNWV1NHRDNCVFdDVEJNUkJNRkhZWFpaWlpUT0dGVUtXSDc0TU9LSUozNiIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.TWmgDr4UemgezUh2MEt1H-hsfAyDrCDlhWwSlRbJgOmJyd0rPjLS9mWex4cMutxfrRWoDvmMdn1u3HSFTqhBDA\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.*.out.\\u003e\",\n        \"type\": \"stream\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"B3P5RR2BKRZRW5YZKDDHZBWPG2EOA2ZWBWYME5JFOKAWUNKKAZJQ\",\n  \"iat\": 1791349941,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"SYS\",\n  \"sub\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 1084,
     "content": "{\n  \"jti\": \"AC62JOMZKWQ64DZ7MOWZKZP4FI4BIFLIT4V65V6MWPUWTZGUBNMA\",\n  \"iat\": 1791349941,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n    ],\n    \"revocations\": {\n      \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\": 1791349939\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 74,
     "content": "{\n  \"studio\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\"\n}"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"WRYA3EIFM4RWGTNTCRQ36TAONJ55DYPL46XQPRM6PS4MFCB3TBDQ\",\n  \"iat\": 1791349935,\n  \"iss\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\",\n  \"name\": \"ops\",\n  \"sub\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1421,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"SN6TG73UXVVPZORNIAYAVDCUJ2ZUOP2YMFV5SYARWYV52F6OBUEA\",\n  \"iat\": 1791349935,\n  \"iss\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\",\n  \"name\": \"rund\",\n  \"sub\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\",\n        \"garm.run.v1.*.out.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1396,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"XNYSIJOVP5S2WEFRPDJEEQH5OPEJPO3VLLDWP6LIO5JK57ILY4XQ\",\n  \"iat\": 1791349935,\n  \"iss\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\",\n  \"name\": \"studio\",\n  \"sub\": \"UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.invoke\",\n        \"garm.run.v1.fetch\",\n        \"garm.run.v1.events\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\",\n        \"garm.run.v1.out.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"7I5GELQJ5BXHYJ6MTWDUEC7AMWYYDR5GYATO2SMT7RKFATYSRBUA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 3389,
     "content": "{\n  \"manifest\": {\n    \"generation\": 4,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-07T09:12:21.666681+04:00\",\n    \"accounts\": {\n      \"CALLER-studio\": {\n        \"identity\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n        \"signing\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"signing\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      \"SYS\": {\n        \"identity\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n        \"signing\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"signing\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"10d053423b42ba95\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"de4176fe88b30b4e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\",\n        \"at\": 1791349939,\n        \"generation\": 3,\n        \"expires_at\": 1822885937,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"signature\": \"6a86eb7ba30c1d622ed929d6b6294514ef5ebc990d7cda3262712eb543adf04b6efe5377c02783d1c763ee689ea99015d1ce490294c9483e45bb80ec6a5b1b0a\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:62504",
    "accounts": [
     {
      "name": "CALLER-studio",
      "public": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "signing_keys": [
       "AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A",
      "signing_keys": [
       "AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH",
      "signing_keys": [
       "ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "signing_keys": [
       "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT"
      ],
      "revocations": 1,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH",
      "public": "UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA",
      "issuer": "ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A",
      "public": "UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O",
      "issuer": "AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": [
       "garm.tool.>",
       "garm.run.v1.*.out.>"
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
      "account": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "public": "UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT",
      "issuer": "AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": [
       "garm.run.v1.invoke",
       "garm.run.v1.fetch",
       "garm.run.v1.events"
      ],
      "sub_allow": [
       "_INBOX.>",
       "garm.run.v1.out.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/weather.v1.WeatherService.creds",
      "name": "weather.v1.WeatherService",
      "account": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "public": "UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ",
      "issuer": "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
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
      "account": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "public": "UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI",
      "issuer": "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT",
      "tags": [
       "catalogue:f37e484e035f6ca0769e3d334fa69aaeb3e85baf792f1c722f24645ebd3e474a",
       "generation:2"
      ],
      "expires": "2027-10-07T05:12:17Z",
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
     },
     {
      "cred": "studio",
      "action": "subscribe",
      "subject": "garm.run.v1.out.>",
      "outcome": "allowed"
     },
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.run.v1.out.forged.1",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Publish to \"garm.run.v1.out.forged.1\""
     },
     {
      "cred": "rund",
      "action": "publish",
      "subject": "garm.run.v1.ACX.out.r.1",
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
     "content": "AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB"
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
     "content": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7"
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
     "content": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A"
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
     "content": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH"
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
     "content": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36"
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
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "content": "{\n  \"manifest\": {\n    \"generation\": 5,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-07T09:12:23.740422+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n        \"signing\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n        \"signing\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"signing\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      \"SYS\": {\n        \"identity\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n        \"signing\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"signing\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"0f5b5da9ac25bd0b\",\n        \"issued_at\": 1791349943,\n        \"expires_at\": 1822885943,\n        \"signing_key\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"10d053423b42ba95\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"de4176fe88b30b4e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\",\n        \"at\": 1791349939,\n        \"generation\": 3,\n        \"expires_at\": 1822885937,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"signature\": \"d166703761615ff7064db5444e004bbdae52a5aac2c324042c32c7ab4e51854ea89158c652075ca2a6f5e26cb15cc59dbb8339d3292f7f66cc09d80d18746209\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "new",
     "secret": false,
     "size": 3409,
     "content": "{\n  \"jti\": \"3IOJTE4CSHRRWH2HDRFUJB43Z2VWD2WVWL3G6WWPSZNW2VBTCD4A\",\n  \"iat\": 1791349943,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJJMjU2R1NDNkxNRDY3WUs1UkRWQzdQU0FMVTZMNU9QRE9KQUk3UVdaWTJYN1U2TjRNSE9BIiwiaWF0IjoxNzkxMzQ5OTQzLCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFBRUhUWTJRQ1Q1M0hJSE4zMlpKU0NTNVdMUzZPVUEyRVRHNUNVWkVRTEJLVVhEUlUyM0VBVlBCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFFSFRZMlFDVDUzSElITjMyWkpTQ1M1V0xTNk9VQTJFVEc1Q1VaRVFMQktVWERSVTIzRUFWUEIuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.BeEHu5e6OFU12tKP7w9V1Js5CyF_sRT1qF67Npj58uaNGC3NHZI6UG77A1FBhHqK3ZcpNOcV5zZi6InDivV8Dg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB.out.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJJMjU2R1NDNkxNRDY3WUs1UkRWQzdQU0FMVTZMNU9QRE9KQUk3UVdaWTJYN1U2TjRNSE9BIiwiaWF0IjoxNzkxMzQ5OTQzLCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFBRUhUWTJRQ1Q1M0hJSE4zMlpKU0NTNVdMUzZPVUEyRVRHNUNVWkVRTEJLVVhEUlUyM0VBVlBCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFFSFRZMlFDVDUzSElITjMyWkpTQ1M1V0xTNk9VQTJFVEc1Q1VaRVFMQktVWERSVTIzRUFWUEIub3V0Llx1MDAzZSIsImtpbmQiOiJzdHJlYW0iLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.4mR8uBrn0k24R8VlV-h1sc-nmzpgQqjMguL7_ecfOQ-8pXNnRXOg3Y8ogS7QRTa5vI4j1jHhP5e5f2AnhemADg\",\n        \"local_subject\": \"garm.run.v1.out.\\u003e\",\n        \"type\": \"stream\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 3410,
     "content": "{\n  \"jti\": \"XVILMPCQBLN3I4J3F32CMDDFUZI4HUURXNHNGSH3OMFSVJTY42CA\",\n  \"iat\": 1791349943,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJPMlFFWERLUUUyNFJSVEFMVENSNVlFT01DSUhLM1lENlAyRldFUUtUUlVSWEw1VjNKNUdBIiwiaWF0IjoxNzkxMzQ5OTQzLCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFEUkhPREpaRExPWDY0SFg1NlpFUjM3TTJMUzNIM0JaS1JDUFlLVkgzS0dIVVJGQjZOSVlXNVM3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURSSE9ESlpETE9YNjRIWDU2WkVSMzdNMkxTM0gzQlpLUkNQWUtWSDNLR0hVUkZCNk5JWVc1UzcuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.yoWxTadRRJWTXGvaG3BqY86Oy0vWrhyFBtsPcgAmAF5DvAKGPHAHsDGqDDZfHT4QLHJ85zGFyGDPKJFjo7OGCg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7.out.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJPMlFFWERLUUUyNFJSVEFMVENSNVlFT01DSUhLM1lENlAyRldFUUtUUlVSWEw1VjNKNUdBIiwiaWF0IjoxNzkxMzQ5OTQzLCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFEUkhPREpaRExPWDY0SFg1NlpFUjM3TTJMUzNIM0JaS1JDUFlLVkgzS0dIVVJGQjZOSVlXNVM3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURSSE9ESlpETE9YNjRIWDU2WkVSMzdNMkxTM0gzQlpLUkNQWUtWSDNLR0hVUkZCNk5JWVc1Uzcub3V0Llx1MDAzZSIsImtpbmQiOiJzdHJlYW0iLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.rm93FGyNSfUNKequkXKQdktM9e_b7nxpMRlOzEhiskJReaZgeUmFYZwlKneAEKAgAM9TzFnN9p0yv661_Ks9BQ\",\n        \"local_subject\": \"garm.run.v1.out.\\u003e\",\n        \"type\": \"stream\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2202,
     "content": "{\n  \"jti\": \"KJ67BF7TIH6MWUUAJ774QMYMQBERVQMNVGKULXYM7HBF5AU53URA\",\n  \"iat\": 1791349943,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJKRkZVRkpMSllPSlVXRElIWjRMWE5QS0FSSlFVRUNCNEpaSU1JMlpQUUVJUDdaQUVMR1NRIiwiaWF0IjoxNzkxMzQ5OTQzLCJpc3MiOiJBQklRSFQ1SFlNRENIRURTWEhFQTRaUVVNWkVWMlczWko2WlNZSEdMQkVBRFNGVE1YSUFaVVdNVCIsInN1YiI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQUFJSVZZMklVVlpGWUNWV1NHRDNCVFdDVEJNUkJNRkhZWFpaWlpUT0dGVUtXSDc0TU9LSUozNiIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.5LbBhOo6JE9Uz8GsPp29_FAw2nF-ShQn_40J18tWWiTHvcCbhTicl0cXegSiBGovyKQEcvs6UeTazNfaYLLYAg\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.*.out.\\u003e\",\n        \"type\": \"stream\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"XTTUWHRNHVZESUAFTV2EE3KSWMOQX2VFUFWMTFPX7QXBG4H6Z5LA\",\n  \"iat\": 1791349943,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"SYS\",\n  \"sub\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 1084,
     "content": "{\n  \"jti\": \"FGWJFSD7MWUSZEKVKRCLSWUIRQAWI5HV2BGDHNJ7HI42GZCSQLDQ\",\n  \"iat\": 1791349943,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n    ],\n    \"revocations\": {\n      \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\": 1791349939\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n  \"studio\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "new",
     "secret": true,
     "size": 1395,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885943,\n  \"jti\": \"QI7V2Z5PCTD2OI5QEJRATNTGUYISKAQQGPHTYMXNNKGPPTJRZTKA\",\n  \"iat\": 1791349943,\n  \"iss\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\",\n  \"name\": \"batch\",\n  \"sub\": \"UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.invoke\",\n        \"garm.run.v1.fetch\",\n        \"garm.run.v1.events\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\",\n        \"garm.run.v1.out.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"WRYA3EIFM4RWGTNTCRQ36TAONJ55DYPL46XQPRM6PS4MFCB3TBDQ\",\n  \"iat\": 1791349935,\n  \"iss\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\",\n  \"name\": \"ops\",\n  \"sub\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1421,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"SN6TG73UXVVPZORNIAYAVDCUJ2ZUOP2YMFV5SYARWYV52F6OBUEA\",\n  \"iat\": 1791349935,\n  \"iss\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\",\n  \"name\": \"rund\",\n  \"sub\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\",\n        \"garm.run.v1.*.out.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1396,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"XNYSIJOVP5S2WEFRPDJEEQH5OPEJPO3VLLDWP6LIO5JK57ILY4XQ\",\n  \"iat\": 1791349935,\n  \"iss\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\",\n  \"name\": \"studio\",\n  \"sub\": \"UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.invoke\",\n        \"garm.run.v1.fetch\",\n        \"garm.run.v1.events\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\",\n        \"garm.run.v1.out.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"7I5GELQJ5BXHYJ6MTWDUEC7AMWYYDR5GYATO2SMT7RKFATYSRBUA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 4078,
     "content": "{\n  \"manifest\": {\n    \"generation\": 5,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-07T09:12:23.740422+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n        \"signing\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n        \"signing\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"signing\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      \"SYS\": {\n        \"identity\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n        \"signing\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"signing\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"0f5b5da9ac25bd0b\",\n        \"issued_at\": 1791349943,\n        \"expires_at\": 1822885943,\n        \"signing_key\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\",\n        \"reason\": \"new\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"10d053423b42ba95\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"de4176fe88b30b4e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\",\n        \"at\": 1791349939,\n        \"generation\": 3,\n        \"expires_at\": 1822885937,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"signature\": \"d166703761615ff7064db5444e004bbdae52a5aac2c324042c32c7ab4e51854ea89158c652075ca2a6f5e26cb15cc59dbb8339d3292f7f66cc09d80d18746209\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:62504",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB",
      "signing_keys": [
       "ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "CALLER-studio",
      "public": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "signing_keys": [
       "AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A",
      "signing_keys": [
       "AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH",
      "signing_keys": [
       "ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "signing_keys": [
       "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT"
      ],
      "revocations": 1,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB",
      "public": "UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY",
      "issuer": "ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:5"
      ],
      "expires": "2027-10-07T05:12:23Z",
      "pub_allow": [
       "garm.run.v1.invoke",
       "garm.run.v1.fetch",
       "garm.run.v1.events"
      ],
      "sub_allow": [
       "_INBOX.>",
       "garm.run.v1.out.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH",
      "public": "UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA",
      "issuer": "ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A",
      "public": "UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O",
      "issuer": "AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": [
       "garm.tool.>",
       "garm.run.v1.*.out.>"
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
      "account": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "public": "UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT",
      "issuer": "AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": [
       "garm.run.v1.invoke",
       "garm.run.v1.fetch",
       "garm.run.v1.events"
      ],
      "sub_allow": [
       "_INBOX.>",
       "garm.run.v1.out.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/weather.v1.WeatherService.creds",
      "name": "weather.v1.WeatherService",
      "account": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "public": "UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ",
      "issuer": "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
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
     },
     {
      "cred": "studio",
      "action": "subscribe",
      "subject": "garm.run.v1.out.>",
      "outcome": "allowed"
     },
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.run.v1.out.forged.1",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Publish to \"garm.run.v1.out.forged.1\""
     },
     {
      "cred": "rund",
      "action": "publish",
      "subject": "garm.run.v1.ACX.out.r.1",
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
   "stderr": "CALLER-studio: signing key retiring; the old key AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL is still listed -- roll the new credentials out, then run an issuance with --verify-live to retire it\n",
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
     "content": "AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB"
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
     "content": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7"
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
     "content": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A"
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
     "content": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH"
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
     "content": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36"
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
     "path": "ceremony/keys/archive/CALLER-studio.signing.AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL.nk",
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
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "content": "{\n  \"manifest\": {\n    \"generation\": 6,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-07T09:12:27.707591+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n        \"signing\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n        \"signing\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\",\n        \"retiring\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"signing\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      \"SYS\": {\n        \"identity\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n        \"signing\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"signing\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"0f5b5da9ac25bd0b\",\n        \"issued_at\": 1791349943,\n        \"expires_at\": 1822885943,\n        \"signing_key\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"10d053423b42ba95\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UC4QJXPZJCTABSEE47MF2SI5GY5ENZ5YF5BIBFC6PJSDE5IF446QP5DH\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 6,\n        \"permissions_hash\": \"de4176fe88b30b4e\",\n        \"issued_at\": 1791349947,\n        \"expires_at\": 1822885947,\n        \"signing_key\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\",\n        \"reason\": \"rotation\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\",\n        \"at\": 1791349939,\n        \"generation\": 3,\n        \"expires_at\": 1822885937,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"signature\": \"793736c36ef9bd187022fe573cb94c98b9449893093168a27c8f79d75767cee2b6913260a20e2aef655ce8fba7043a56d07d878f6a6e4be80ef9a62008019602\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 3409,
     "content": "{\n  \"jti\": \"URK4LFF2LQJG7C3DOSIZCEZZERPM6456KCQGVU5A2IISWHWTKF7Q\",\n  \"iat\": 1791349947,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiI2VVVYS0tCVkVIWDJRT0tKT0gyVElDTzZWRkZCRllSM01BWk83QkxHVkVTVUxJNTNQRlBRIiwiaWF0IjoxNzkxMzQ5OTQ3LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFBRUhUWTJRQ1Q1M0hJSE4zMlpKU0NTNVdMUzZPVUEyRVRHNUNVWkVRTEJLVVhEUlUyM0VBVlBCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFFSFRZMlFDVDUzSElITjMyWkpTQ1M1V0xTNk9VQTJFVEc1Q1VaRVFMQktVWERSVTIzRUFWUEIuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.bN71XnEpOsArNmicvvW5qMh5gLdPMn8aoXARUsxOJrDL1mxv64uo-HFMQKNKHD4VqMJK3-UlhORzLyPF4xpNDw\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB.out.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiI2VVVYS0tCVkVIWDJRT0tKT0gyVElDTzZWRkZCRllSM01BWk83QkxHVkVTVUxJNTNQRlBRIiwiaWF0IjoxNzkxMzQ5OTQ3LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFBRUhUWTJRQ1Q1M0hJSE4zMlpKU0NTNVdMUzZPVUEyRVRHNUNVWkVRTEJLVVhEUlUyM0VBVlBCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFFSFRZMlFDVDUzSElITjMyWkpTQ1M1V0xTNk9VQTJFVEc1Q1VaRVFMQktVWERSVTIzRUFWUEIub3V0Llx1MDAzZSIsImtpbmQiOiJzdHJlYW0iLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.S-bdxDOUJWqz26MGR0PHLLXPWvnbE9Yh3x_ROv7CitNO1RC4FWaY7mH90ifgO3GsMXIsRI01EP0rbXTYa5xbAw\",\n        \"local_subject\": \"garm.run.v1.out.\\u003e\",\n        \"type\": \"stream\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 3489,
     "content": "{\n  \"jti\": \"JGD673CMNF3P7O6V56JWJVA6JQCX4ETYHMWYD2W4AXRXQPUZ4GUQ\",\n  \"iat\": 1791349947,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJHR0FRSlJNTE1QT0k3WDZTM1NFM09USDJJMk40UVpIWk1FSjZVNzZHVlhIWUdKTVRBNlpRIiwiaWF0IjoxNzkxMzQ5OTQ3LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFEUkhPREpaRExPWDY0SFg1NlpFUjM3TTJMUzNIM0JaS1JDUFlLVkgzS0dIVVJGQjZOSVlXNVM3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURSSE9ESlpETE9YNjRIWDU2WkVSMzdNMkxTM0gzQlpLUkNQWUtWSDNLR0hVUkZCNk5JWVc1UzcuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.K91Ojo_0p_J0jW8vmEOv56F5D6xJyr698QuHEHBNo6KT-xWrm_NV8JIjyYLS73h7qoZK4UjLCXIO2nIvv3EmBg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7.out.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJHR0FRSlJNTE1QT0k3WDZTM1NFM09USDJJMk40UVpIWk1FSjZVNzZHVlhIWUdKTVRBNlpRIiwiaWF0IjoxNzkxMzQ5OTQ3LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFEUkhPREpaRExPWDY0SFg1NlpFUjM3TTJMUzNIM0JaS1JDUFlLVkgzS0dIVVJGQjZOSVlXNVM3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURSSE9ESlpETE9YNjRIWDU2WkVSMzdNMkxTM0gzQlpLUkNQWUtWSDNLR0hVUkZCNk5JWVc1Uzcub3V0Llx1MDAzZSIsImtpbmQiOiJzdHJlYW0iLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.pSDaz-9NRXH0oz22Ti_ikh2ggK1_BBEdY9vxCnx8mXgwzqjgJFmV1-4vnjY2EPjDxQWq5tRcGXci1N-77AuEAA\",\n        \"local_subject\": \"garm.run.v1.out.\\u003e\",\n        \"type\": \"stream\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\",\n      \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2202,
     "content": "{\n  \"jti\": \"5U6GQLJLDU2JPEEAVU6DABHFXC2ZGMHMVT6QQNNDNMHMCEGNWFIQ\",\n  \"iat\": 1791349947,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJMSDNHTkJGNUlPRlNWUFVYRFhBMjNETUM3S0NVWlZLWUJJREVEVzRLRDNFVTVUTzVGS1JBIiwiaWF0IjoxNzkxMzQ5OTQ3LCJpc3MiOiJBQklRSFQ1SFlNRENIRURTWEhFQTRaUVVNWkVWMlczWko2WlNZSEdMQkVBRFNGVE1YSUFaVVdNVCIsInN1YiI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQUFJSVZZMklVVlpGWUNWV1NHRDNCVFdDVEJNUkJNRkhZWFpaWlpUT0dGVUtXSDc0TU9LSUozNiIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.v-1g2k7CBBl3qTVUJe9CzwJIk4Y7Gcdp6lbiWPvlSZ1-VqdjjnXWP191_yRb1j9Pq155QHaFyQNNJk1v9PdaCg\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.*.out.\\u003e\",\n        \"type\": \"stream\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"SHGTDSJ7A2QPG4ESXPAAKYXVUZ6ZCUSMPEFLVMXBAXYZ3Q6KQ5LQ\",\n  \"iat\": 1791349947,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"SYS\",\n  \"sub\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 1084,
     "content": "{\n  \"jti\": \"J54XOL774QINA3NPNLXFGNPHLBOUVX5N2EIPHH37VLS6XCKUKY2Q\",\n  \"iat\": 1791349947,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n    ],\n    \"revocations\": {\n      \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\": 1791349939\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n  \"studio\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1395,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885943,\n  \"jti\": \"QI7V2Z5PCTD2OI5QEJRATNTGUYISKAQQGPHTYMXNNKGPPTJRZTKA\",\n  \"iat\": 1791349943,\n  \"iss\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\",\n  \"name\": \"batch\",\n  \"sub\": \"UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.invoke\",\n        \"garm.run.v1.fetch\",\n        \"garm.run.v1.events\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\",\n        \"garm.run.v1.out.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"WRYA3EIFM4RWGTNTCRQ36TAONJ55DYPL46XQPRM6PS4MFCB3TBDQ\",\n  \"iat\": 1791349935,\n  \"iss\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\",\n  \"name\": \"ops\",\n  \"sub\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1421,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"SN6TG73UXVVPZORNIAYAVDCUJ2ZUOP2YMFV5SYARWYV52F6OBUEA\",\n  \"iat\": 1791349935,\n  \"iss\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\",\n  \"name\": \"rund\",\n  \"sub\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\",\n        \"garm.run.v1.*.out.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "changed",
     "secret": true,
     "size": 1396,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885947,\n  \"jti\": \"NELSX35IFXHGVBPSXKEPFLJEP2RMRTAOMBLJ6WTPBD3I2C3ZYRBA\",\n  \"iat\": 1791349947,\n  \"iss\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\",\n  \"name\": \"studio\",\n  \"sub\": \"UC4QJXPZJCTABSEE47MF2SI5GY5ENZ5YF5BIBFC6PJSDE5IF446QP5DH\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.invoke\",\n        \"garm.run.v1.fetch\",\n        \"garm.run.v1.events\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\",\n        \"garm.run.v1.out.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:6\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"7I5GELQJ5BXHYJ6MTWDUEC7AMWYYDR5GYATO2SMT7RKFATYSRBUA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 4163,
     "content": "{\n  \"manifest\": {\n    \"generation\": 6,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-07T09:12:27.707591+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n        \"signing\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n        \"signing\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\",\n        \"retiring\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"signing\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      \"SYS\": {\n        \"identity\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n        \"signing\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"signing\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"0f5b5da9ac25bd0b\",\n        \"issued_at\": 1791349943,\n        \"expires_at\": 1822885943,\n        \"signing_key\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"10d053423b42ba95\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UC4QJXPZJCTABSEE47MF2SI5GY5ENZ5YF5BIBFC6PJSDE5IF446QP5DH\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 6,\n        \"permissions_hash\": \"de4176fe88b30b4e\",\n        \"issued_at\": 1791349947,\n        \"expires_at\": 1822885947,\n        \"signing_key\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\",\n        \"reason\": \"rotation\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\",\n        \"at\": 1791349939,\n        \"generation\": 3,\n        \"expires_at\": 1822885937,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"signature\": \"793736c36ef9bd187022fe573cb94c98b9449893093168a27c8f79d75767cee2b6913260a20e2aef655ce8fba7043a56d07d878f6a6e4be80ef9a62008019602\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:62504",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB",
      "signing_keys": [
       "ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "CALLER-studio",
      "public": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "signing_keys": [
       "AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL",
       "AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A",
      "signing_keys": [
       "AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH",
      "signing_keys": [
       "ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "signing_keys": [
       "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT"
      ],
      "revocations": 1,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB",
      "public": "UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY",
      "issuer": "ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:5"
      ],
      "expires": "2027-10-07T05:12:23Z",
      "pub_allow": [
       "garm.run.v1.invoke",
       "garm.run.v1.fetch",
       "garm.run.v1.events"
      ],
      "sub_allow": [
       "_INBOX.>",
       "garm.run.v1.out.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH",
      "public": "UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA",
      "issuer": "ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A",
      "public": "UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O",
      "issuer": "AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": [
       "garm.tool.>",
       "garm.run.v1.*.out.>"
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
      "account": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "public": "UC4QJXPZJCTABSEE47MF2SI5GY5ENZ5YF5BIBFC6PJSDE5IF446QP5DH",
      "issuer": "AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:6"
      ],
      "expires": "2027-10-07T05:12:27Z",
      "pub_allow": [
       "garm.run.v1.invoke",
       "garm.run.v1.fetch",
       "garm.run.v1.events"
      ],
      "sub_allow": [
       "_INBOX.>",
       "garm.run.v1.out.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/weather.v1.WeatherService.creds",
      "name": "weather.v1.WeatherService",
      "account": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "public": "UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ",
      "issuer": "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
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
      "account": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "public": "UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT",
      "issuer": "AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": [
       "garm.run.v1.invoke",
       "garm.run.v1.fetch",
       "garm.run.v1.events"
      ],
      "sub_allow": [
       "_INBOX.>",
       "garm.run.v1.out.>"
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
     },
     {
      "cred": "studio",
      "action": "subscribe",
      "subject": "garm.run.v1.out.>",
      "outcome": "allowed"
     },
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.run.v1.out.forged.1",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Publish to \"garm.run.v1.out.forged.1\""
     },
     {
      "cred": "rund",
      "action": "publish",
      "subject": "garm.run.v1.ACX.out.r.1",
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
   "error": "--verify-live: CALLER-studio's retiring key AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL still signs 1 live connection(s): studio-old -- roll them out first",
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
     "content": "AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB"
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
     "content": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7"
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
     "content": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A"
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
     "content": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH"
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
     "content": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36"
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
     "path": "ceremony/keys/archive/CALLER-studio.signing.AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL.nk",
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
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "content": "{\n  \"manifest\": {\n    \"generation\": 6,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-07T09:12:27.707591+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n        \"signing\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n        \"signing\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\",\n        \"retiring\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"signing\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      \"SYS\": {\n        \"identity\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n        \"signing\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"signing\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"0f5b5da9ac25bd0b\",\n        \"issued_at\": 1791349943,\n        \"expires_at\": 1822885943,\n        \"signing_key\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"10d053423b42ba95\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UC4QJXPZJCTABSEE47MF2SI5GY5ENZ5YF5BIBFC6PJSDE5IF446QP5DH\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 6,\n        \"permissions_hash\": \"de4176fe88b30b4e\",\n        \"issued_at\": 1791349947,\n        \"expires_at\": 1822885947,\n        \"signing_key\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\",\n        \"reason\": \"rotation\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\",\n        \"at\": 1791349939,\n        \"generation\": 3,\n        \"expires_at\": 1822885937,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"signature\": \"793736c36ef9bd187022fe573cb94c98b9449893093168a27c8f79d75767cee2b6913260a20e2aef655ce8fba7043a56d07d878f6a6e4be80ef9a62008019602\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 3409,
     "content": "{\n  \"jti\": \"URK4LFF2LQJG7C3DOSIZCEZZERPM6456KCQGVU5A2IISWHWTKF7Q\",\n  \"iat\": 1791349947,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiI2VVVYS0tCVkVIWDJRT0tKT0gyVElDTzZWRkZCRllSM01BWk83QkxHVkVTVUxJNTNQRlBRIiwiaWF0IjoxNzkxMzQ5OTQ3LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFBRUhUWTJRQ1Q1M0hJSE4zMlpKU0NTNVdMUzZPVUEyRVRHNUNVWkVRTEJLVVhEUlUyM0VBVlBCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFFSFRZMlFDVDUzSElITjMyWkpTQ1M1V0xTNk9VQTJFVEc1Q1VaRVFMQktVWERSVTIzRUFWUEIuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.bN71XnEpOsArNmicvvW5qMh5gLdPMn8aoXARUsxOJrDL1mxv64uo-HFMQKNKHD4VqMJK3-UlhORzLyPF4xpNDw\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB.out.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiI2VVVYS0tCVkVIWDJRT0tKT0gyVElDTzZWRkZCRllSM01BWk83QkxHVkVTVUxJNTNQRlBRIiwiaWF0IjoxNzkxMzQ5OTQ3LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFBRUhUWTJRQ1Q1M0hJSE4zMlpKU0NTNVdMUzZPVUEyRVRHNUNVWkVRTEJLVVhEUlUyM0VBVlBCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFFSFRZMlFDVDUzSElITjMyWkpTQ1M1V0xTNk9VQTJFVEc1Q1VaRVFMQktVWERSVTIzRUFWUEIub3V0Llx1MDAzZSIsImtpbmQiOiJzdHJlYW0iLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.S-bdxDOUJWqz26MGR0PHLLXPWvnbE9Yh3x_ROv7CitNO1RC4FWaY7mH90ifgO3GsMXIsRI01EP0rbXTYa5xbAw\",\n        \"local_subject\": \"garm.run.v1.out.\\u003e\",\n        \"type\": \"stream\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 3489,
     "content": "{\n  \"jti\": \"JGD673CMNF3P7O6V56JWJVA6JQCX4ETYHMWYD2W4AXRXQPUZ4GUQ\",\n  \"iat\": 1791349947,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJHR0FRSlJNTE1QT0k3WDZTM1NFM09USDJJMk40UVpIWk1FSjZVNzZHVlhIWUdKTVRBNlpRIiwiaWF0IjoxNzkxMzQ5OTQ3LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFEUkhPREpaRExPWDY0SFg1NlpFUjM3TTJMUzNIM0JaS1JDUFlLVkgzS0dIVVJGQjZOSVlXNVM3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURSSE9ESlpETE9YNjRIWDU2WkVSMzdNMkxTM0gzQlpLUkNQWUtWSDNLR0hVUkZCNk5JWVc1UzcuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.K91Ojo_0p_J0jW8vmEOv56F5D6xJyr698QuHEHBNo6KT-xWrm_NV8JIjyYLS73h7qoZK4UjLCXIO2nIvv3EmBg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7.out.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJHR0FRSlJNTE1QT0k3WDZTM1NFM09USDJJMk40UVpIWk1FSjZVNzZHVlhIWUdKTVRBNlpRIiwiaWF0IjoxNzkxMzQ5OTQ3LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFEUkhPREpaRExPWDY0SFg1NlpFUjM3TTJMUzNIM0JaS1JDUFlLVkgzS0dIVVJGQjZOSVlXNVM3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURSSE9ESlpETE9YNjRIWDU2WkVSMzdNMkxTM0gzQlpLUkNQWUtWSDNLR0hVUkZCNk5JWVc1Uzcub3V0Llx1MDAzZSIsImtpbmQiOiJzdHJlYW0iLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.pSDaz-9NRXH0oz22Ti_ikh2ggK1_BBEdY9vxCnx8mXgwzqjgJFmV1-4vnjY2EPjDxQWq5tRcGXci1N-77AuEAA\",\n        \"local_subject\": \"garm.run.v1.out.\\u003e\",\n        \"type\": \"stream\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\",\n      \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2202,
     "content": "{\n  \"jti\": \"5U6GQLJLDU2JPEEAVU6DABHFXC2ZGMHMVT6QQNNDNMHMCEGNWFIQ\",\n  \"iat\": 1791349947,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJMSDNHTkJGNUlPRlNWUFVYRFhBMjNETUM3S0NVWlZLWUJJREVEVzRLRDNFVTVUTzVGS1JBIiwiaWF0IjoxNzkxMzQ5OTQ3LCJpc3MiOiJBQklRSFQ1SFlNRENIRURTWEhFQTRaUVVNWkVWMlczWko2WlNZSEdMQkVBRFNGVE1YSUFaVVdNVCIsInN1YiI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQUFJSVZZMklVVlpGWUNWV1NHRDNCVFdDVEJNUkJNRkhZWFpaWlpUT0dGVUtXSDc0TU9LSUozNiIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.v-1g2k7CBBl3qTVUJe9CzwJIk4Y7Gcdp6lbiWPvlSZ1-VqdjjnXWP191_yRb1j9Pq155QHaFyQNNJk1v9PdaCg\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.*.out.\\u003e\",\n        \"type\": \"stream\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"SHGTDSJ7A2QPG4ESXPAAKYXVUZ6ZCUSMPEFLVMXBAXYZ3Q6KQ5LQ\",\n  \"iat\": 1791349947,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"SYS\",\n  \"sub\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 1084,
     "content": "{\n  \"jti\": \"J54XOL774QINA3NPNLXFGNPHLBOUVX5N2EIPHH37VLS6XCKUKY2Q\",\n  \"iat\": 1791349947,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n    ],\n    \"revocations\": {\n      \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\": 1791349939\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n  \"studio\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1395,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885943,\n  \"jti\": \"QI7V2Z5PCTD2OI5QEJRATNTGUYISKAQQGPHTYMXNNKGPPTJRZTKA\",\n  \"iat\": 1791349943,\n  \"iss\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\",\n  \"name\": \"batch\",\n  \"sub\": \"UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.invoke\",\n        \"garm.run.v1.fetch\",\n        \"garm.run.v1.events\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\",\n        \"garm.run.v1.out.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"WRYA3EIFM4RWGTNTCRQ36TAONJ55DYPL46XQPRM6PS4MFCB3TBDQ\",\n  \"iat\": 1791349935,\n  \"iss\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\",\n  \"name\": \"ops\",\n  \"sub\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1421,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"SN6TG73UXVVPZORNIAYAVDCUJ2ZUOP2YMFV5SYARWYV52F6OBUEA\",\n  \"iat\": 1791349935,\n  \"iss\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\",\n  \"name\": \"rund\",\n  \"sub\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\",\n        \"garm.run.v1.*.out.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1396,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885947,\n  \"jti\": \"NELSX35IFXHGVBPSXKEPFLJEP2RMRTAOMBLJ6WTPBD3I2C3ZYRBA\",\n  \"iat\": 1791349947,\n  \"iss\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\",\n  \"name\": \"studio\",\n  \"sub\": \"UC4QJXPZJCTABSEE47MF2SI5GY5ENZ5YF5BIBFC6PJSDE5IF446QP5DH\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.invoke\",\n        \"garm.run.v1.fetch\",\n        \"garm.run.v1.events\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\",\n        \"garm.run.v1.out.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:6\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"7I5GELQJ5BXHYJ6MTWDUEC7AMWYYDR5GYATO2SMT7RKFATYSRBUA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 4163,
     "content": "{\n  \"manifest\": {\n    \"generation\": 6,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-07T09:12:27.707591+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n        \"signing\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n        \"signing\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\",\n        \"retiring\": \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\"\n      },\n      \"GARM\": {\n        \"identity\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"signing\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      \"SYS\": {\n        \"identity\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n        \"signing\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"signing\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"0f5b5da9ac25bd0b\",\n        \"issued_at\": 1791349943,\n        \"expires_at\": 1822885943,\n        \"signing_key\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"10d053423b42ba95\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UC4QJXPZJCTABSEE47MF2SI5GY5ENZ5YF5BIBFC6PJSDE5IF446QP5DH\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 6,\n        \"permissions_hash\": \"de4176fe88b30b4e\",\n        \"issued_at\": 1791349947,\n        \"expires_at\": 1822885947,\n        \"signing_key\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\",\n        \"reason\": \"rotation\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\",\n        \"at\": 1791349939,\n        \"generation\": 3,\n        \"expires_at\": 1822885937,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"signature\": \"793736c36ef9bd187022fe573cb94c98b9449893093168a27c8f79d75767cee2b6913260a20e2aef655ce8fba7043a56d07d878f6a6e4be80ef9a62008019602\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:62504",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB",
      "signing_keys": [
       "ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "CALLER-studio",
      "public": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "signing_keys": [
       "AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL",
       "AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "GARM",
      "public": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A",
      "signing_keys": [
       "AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "SYS",
      "public": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH",
      "signing_keys": [
       "ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR"
      ],
      "revocations": 0,
      "pushed": false
     },
     {
      "name": "TOOLS",
      "public": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "signing_keys": [
       "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT"
      ],
      "revocations": 1,
      "pushed": false
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB",
      "public": "UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY",
      "issuer": "ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:5"
      ],
      "expires": "2027-10-07T05:12:23Z",
      "pub_allow": [
       "garm.run.v1.invoke",
       "garm.run.v1.fetch",
       "garm.run.v1.events"
      ],
      "sub_allow": [
       "_INBOX.>",
       "garm.run.v1.out.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH",
      "public": "UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA",
      "issuer": "ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A",
      "public": "UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O",
      "issuer": "AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": [
       "garm.tool.>",
       "garm.run.v1.*.out.>"
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
      "account": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "public": "UC4QJXPZJCTABSEE47MF2SI5GY5ENZ5YF5BIBFC6PJSDE5IF446QP5DH",
      "issuer": "AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:6"
      ],
      "expires": "2027-10-07T05:12:27Z",
      "pub_allow": [
       "garm.run.v1.invoke",
       "garm.run.v1.fetch",
       "garm.run.v1.events"
      ],
      "sub_allow": [
       "_INBOX.>",
       "garm.run.v1.out.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/weather.v1.WeatherService.creds",
      "name": "weather.v1.WeatherService",
      "account": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "public": "UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ",
      "issuer": "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
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
      "account": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "public": "UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT",
      "issuer": "AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": [
       "garm.run.v1.invoke",
       "garm.run.v1.fetch",
       "garm.run.v1.events"
      ],
      "sub_allow": [
       "_INBOX.>",
       "garm.run.v1.out.>"
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
     },
     {
      "cred": "studio",
      "action": "subscribe",
      "subject": "garm.run.v1.out.>",
      "outcome": "allowed"
     },
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.run.v1.out.forged.1",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Publish to \"garm.run.v1.out.forged.1\""
     },
     {
      "cred": "rund",
      "action": "publish",
      "subject": "garm.run.v1.ACX.out.r.1",
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
   "stdout": "CALLER-studio: retired signing key AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL; every credential it signed is now refused\nok: generation 7 from catalogue 24164e3e783d -- 5 accounts, 0 credentials, 0 revocations, written to topo\n",
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
     "content": "AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB"
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
     "content": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7"
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
     "content": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A"
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
     "content": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH"
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
     "content": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36"
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
     "path": "ceremony/keys/archive/CALLER-studio.signing.AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL.nk",
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
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "size": 4155,
     "content": "{\n  \"manifest\": {\n    \"generation\": 7,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-07T09:12:36.0348+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n        \"signing\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n        \"signing\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\",\n        \"retired\": {\n          \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\": 7\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"signing\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      \"SYS\": {\n        \"identity\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n        \"signing\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"signing\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"0f5b5da9ac25bd0b\",\n        \"issued_at\": 1791349943,\n        \"expires_at\": 1822885943,\n        \"signing_key\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"10d053423b42ba95\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UC4QJXPZJCTABSEE47MF2SI5GY5ENZ5YF5BIBFC6PJSDE5IF446QP5DH\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 6,\n        \"permissions_hash\": \"de4176fe88b30b4e\",\n        \"issued_at\": 1791349947,\n        \"expires_at\": 1822885947,\n        \"signing_key\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\",\n        \"at\": 1791349939,\n        \"generation\": 3,\n        \"expires_at\": 1822885937,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"signature\": \"e7a4e545a3ac45dcac08e1f4dccf6629554d28c90fc71724019a44f71f646629acc1752bde65a3da647c93a9776df518d8aacb061bf657fa9c1d4a3bff963303\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 3409,
     "content": "{\n  \"jti\": \"X5W3OSLJD2O54DSCAQMCZCZ2OVECXDSF5MNHXEEOBMZF4I37TLHA\",\n  \"iat\": 1791349956,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJLWkcyVFRKWUE2RTRHNU1OUzJPRzQ2U0FJRFBWT05WMzdKS1NZNlQzQjVaNDdJNEE3TFZBIiwiaWF0IjoxNzkxMzQ5OTU2LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFBRUhUWTJRQ1Q1M0hJSE4zMlpKU0NTNVdMUzZPVUEyRVRHNUNVWkVRTEJLVVhEUlUyM0VBVlBCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFFSFRZMlFDVDUzSElITjMyWkpTQ1M1V0xTNk9VQTJFVEc1Q1VaRVFMQktVWERSVTIzRUFWUEIuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.qFvH4oId6J0HyOaT7D28HWDx_aJZyq_3kP1tRBjvx_s9TULbFYAqFKETMbnc2kfxnhSYwC1WA6OC43yFSXLtAQ\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB.out.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJLWkcyVFRKWUE2RTRHNU1OUzJPRzQ2U0FJRFBWT05WMzdKS1NZNlQzQjVaNDdJNEE3TFZBIiwiaWF0IjoxNzkxMzQ5OTU2LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFBRUhUWTJRQ1Q1M0hJSE4zMlpKU0NTNVdMUzZPVUEyRVRHNUNVWkVRTEJLVVhEUlUyM0VBVlBCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFFSFRZMlFDVDUzSElITjMyWkpTQ1M1V0xTNk9VQTJFVEc1Q1VaRVFMQktVWERSVTIzRUFWUEIub3V0Llx1MDAzZSIsImtpbmQiOiJzdHJlYW0iLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.MTVeBcUfn8pW9gR5bf496JFW7UT1XYTB2x0dO7IqzLI1QKtDx5w-IbDAmAkO2WL8eS-0Nvzh20EH0uBR9UcjDQ\",\n        \"local_subject\": \"garm.run.v1.out.\\u003e\",\n        \"type\": \"stream\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 3410,
     "content": "{\n  \"jti\": \"NENRPBEDU3UVD43RDCN52N36M35ZBJUQTJPDIXROZDIDYLBSQIMA\",\n  \"iat\": 1791349956,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJRTDVRTkxBS0tUNkY1NEtJVTI2WFQ3TlRQM0tDR0dWNElRWlVHTzNVUVczMjU1TzVLTDdRIiwiaWF0IjoxNzkxMzQ5OTU2LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFEUkhPREpaRExPWDY0SFg1NlpFUjM3TTJMUzNIM0JaS1JDUFlLVkgzS0dIVVJGQjZOSVlXNVM3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURSSE9ESlpETE9YNjRIWDU2WkVSMzdNMkxTM0gzQlpLUkNQWUtWSDNLR0hVUkZCNk5JWVc1UzcuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0._ZS4912whIVFKyvS5qpxBVpf1Zj9oIe9htBl-nzuCnF-fKOM3RqMiFW9T6b0i5HE9H36mEnH70ZP85t12ZENCA\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7.out.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJRTDVRTkxBS0tUNkY1NEtJVTI2WFQ3TlRQM0tDR0dWNElRWlVHTzNVUVczMjU1TzVLTDdRIiwiaWF0IjoxNzkxMzQ5OTU2LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFEUkhPREpaRExPWDY0SFg1NlpFUjM3TTJMUzNIM0JaS1JDUFlLVkgzS0dIVVJGQjZOSVlXNVM3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURSSE9ESlpETE9YNjRIWDU2WkVSMzdNMkxTM0gzQlpLUkNQWUtWSDNLR0hVUkZCNk5JWVc1Uzcub3V0Llx1MDAzZSIsImtpbmQiOiJzdHJlYW0iLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.7Zq3AlidJZttpTPnPAA8JkXuUmyUEwl8FBvRoEJMH9AUMjqslx4KGv5O69nDA-vvN_vFuRuz8K8fSVjrvZbzDw\",\n        \"local_subject\": \"garm.run.v1.out.\\u003e\",\n        \"type\": \"stream\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2202,
     "content": "{\n  \"jti\": \"VN2S47JVWJHJAXLKECMCM4GX2NG4YV4TEK2AHBF6IT2QU3IAB7PQ\",\n  \"iat\": 1791349956,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJUSkpTTjZCMjdYQUFMNjY3VUtUSTJYTFlXQjZTUTI3TkhFWUJTMkdZVjdBUlJSRU1PNkhBIiwiaWF0IjoxNzkxMzQ5OTU2LCJpc3MiOiJBQklRSFQ1SFlNRENIRURTWEhFQTRaUVVNWkVWMlczWko2WlNZSEdMQkVBRFNGVE1YSUFaVVdNVCIsInN1YiI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQUFJSVZZMklVVlpGWUNWV1NHRDNCVFdDVEJNUkJNRkhZWFpaWlpUT0dGVUtXSDc0TU9LSUozNiIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.--R7pEjRfz8RFowzRpS8-A5JZ9fHSwEiabdagsQaa2GT5XjbWnYWuNams2kxNKZRknsMgs8TFVlBUDdlQnPyAQ\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.*.out.\\u003e\",\n        \"type\": \"stream\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"ALP2NRUWZGDPP6KX4FHOIECWT6YM63KFHXLA5IONY2TPWAUQH6GQ\",\n  \"iat\": 1791349956,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"SYS\",\n  \"sub\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 1084,
     "content": "{\n  \"jti\": \"FROQUXKUSKDND4C6N5OKM2VVYQYRUZXTTNFEDH7EE6DHGPI4YS7Q\",\n  \"iat\": 1791349956,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n    ],\n    \"revocations\": {\n      \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\": 1791349939\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n  \"studio\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1395,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885943,\n  \"jti\": \"QI7V2Z5PCTD2OI5QEJRATNTGUYISKAQQGPHTYMXNNKGPPTJRZTKA\",\n  \"iat\": 1791349943,\n  \"iss\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\",\n  \"name\": \"batch\",\n  \"sub\": \"UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.invoke\",\n        \"garm.run.v1.fetch\",\n        \"garm.run.v1.events\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\",\n        \"garm.run.v1.out.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:5\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"WRYA3EIFM4RWGTNTCRQ36TAONJ55DYPL46XQPRM6PS4MFCB3TBDQ\",\n  \"iat\": 1791349935,\n  \"iss\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\",\n  \"name\": \"ops\",\n  \"sub\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1421,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"SN6TG73UXVVPZORNIAYAVDCUJ2ZUOP2YMFV5SYARWYV52F6OBUEA\",\n  \"iat\": 1791349935,\n  \"iss\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\",\n  \"name\": \"rund\",\n  \"sub\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\",\n        \"garm.run.v1.*.out.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1396,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885947,\n  \"jti\": \"NELSX35IFXHGVBPSXKEPFLJEP2RMRTAOMBLJ6WTPBD3I2C3ZYRBA\",\n  \"iat\": 1791349947,\n  \"iss\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\",\n  \"name\": \"studio\",\n  \"sub\": \"UC4QJXPZJCTABSEE47MF2SI5GY5ENZ5YF5BIBFC6PJSDE5IF446QP5DH\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.invoke\",\n        \"garm.run.v1.fetch\",\n        \"garm.run.v1.events\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\",\n        \"garm.run.v1.out.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:6\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"7I5GELQJ5BXHYJ6MTWDUEC7AMWYYDR5GYATO2SMT7RKFATYSRBUA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 4155,
     "content": "{\n  \"manifest\": {\n    \"generation\": 7,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-07T09:12:36.0348+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n        \"signing\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n        \"signing\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\",\n        \"retired\": {\n          \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\": 7\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"signing\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      \"SYS\": {\n        \"identity\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n        \"signing\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"signing\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 5,\n        \"permissions_hash\": \"0f5b5da9ac25bd0b\",\n        \"issued_at\": 1791349943,\n        \"expires_at\": 1822885943,\n        \"signing_key\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"10d053423b42ba95\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UC4QJXPZJCTABSEE47MF2SI5GY5ENZ5YF5BIBFC6PJSDE5IF446QP5DH\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 6,\n        \"permissions_hash\": \"de4176fe88b30b4e\",\n        \"issued_at\": 1791349947,\n        \"expires_at\": 1822885947,\n        \"signing_key\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\",\n        \"at\": 1791349939,\n        \"generation\": 3,\n        \"expires_at\": 1822885937,\n        \"kind\": \"retired\"\n      }\n    ]\n  },\n  \"signer\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"signature\": \"e7a4e545a3ac45dcac08e1f4dccf6629554d28c90fc71724019a44f71f646629acc1752bde65a3da647c93a9776df518d8aacb061bf657fa9c1d4a3bff963303\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
    "server": "tls://127.0.0.1:62504",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB",
      "signing_keys": [
       "ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "CALLER-studio",
      "public": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "signing_keys": [
       "AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A",
      "signing_keys": [
       "AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH",
      "signing_keys": [
       "ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "signing_keys": [
       "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT"
      ],
      "revocations": 1,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB",
      "public": "UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY",
      "issuer": "ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:5"
      ],
      "expires": "2027-10-07T05:12:23Z",
      "pub_allow": [
       "garm.run.v1.invoke",
       "garm.run.v1.fetch",
       "garm.run.v1.events"
      ],
      "sub_allow": [
       "_INBOX.>",
       "garm.run.v1.out.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH",
      "public": "UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA",
      "issuer": "ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A",
      "public": "UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O",
      "issuer": "AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": [
       "garm.tool.>",
       "garm.run.v1.*.out.>"
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
      "account": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "public": "UC4QJXPZJCTABSEE47MF2SI5GY5ENZ5YF5BIBFC6PJSDE5IF446QP5DH",
      "issuer": "AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:6"
      ],
      "expires": "2027-10-07T05:12:27Z",
      "pub_allow": [
       "garm.run.v1.invoke",
       "garm.run.v1.fetch",
       "garm.run.v1.events"
      ],
      "sub_allow": [
       "_INBOX.>",
       "garm.run.v1.out.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/weather.v1.WeatherService.creds",
      "name": "weather.v1.WeatherService",
      "account": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "public": "UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ",
      "issuer": "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
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
      "account": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "public": "UBTFPN7P5D6AOGNKGT2LVCVEJTEPBP7TYI6QUYAOSVEZEIYPO7WQNFXT",
      "issuer": "AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": [
       "garm.run.v1.invoke",
       "garm.run.v1.fetch",
       "garm.run.v1.events"
      ],
      "sub_allow": [
       "_INBOX.>",
       "garm.run.v1.out.>"
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
     },
     {
      "cred": "studio",
      "action": "subscribe",
      "subject": "garm.run.v1.out.>",
      "outcome": "allowed"
     },
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.run.v1.out.forged.1",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Publish to \"garm.run.v1.out.forged.1\""
     },
     {
      "cred": "rund",
      "action": "publish",
      "subject": "garm.run.v1.ACX.out.r.1",
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
     "content": "AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB"
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
     "content": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7"
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
     "content": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A"
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
     "content": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH"
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
     "content": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36"
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
     "path": "ceremony/keys/archive/CALLER-studio.signing.AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL.nk",
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
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "content": "{\n  \"manifest\": {\n    \"generation\": 8,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-07T09:12:38.107251+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n        \"signing\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n        \"signing\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\",\n        \"retired\": {\n          \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\": 7\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"signing\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      \"SYS\": {\n        \"identity\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n        \"signing\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"signing\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UCSTOMOIMPGUBGO62LOQKGBV2WM5W4AAGHFVK7ANOXSVYPOEMR55N3JF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 8,\n        \"permissions_hash\": \"0f5b5da9ac25bd0b\",\n        \"issued_at\": 1791349958,\n        \"expires_at\": 1822885958,\n        \"signing_key\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\",\n        \"reason\": \"reissued\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"10d053423b42ba95\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UC4QJXPZJCTABSEE47MF2SI5GY5ENZ5YF5BIBFC6PJSDE5IF446QP5DH\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 6,\n        \"permissions_hash\": \"de4176fe88b30b4e\",\n        \"issued_at\": 1791349947,\n        \"expires_at\": 1822885947,\n        \"signing_key\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\",\n        \"at\": 1791349939,\n        \"generation\": 3,\n        \"expires_at\": 1822885937,\n        \"kind\": \"retired\"\n      },\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY\",\n        \"at\": 1791349958,\n        \"generation\": 8,\n        \"expires_at\": 1822885943,\n        \"kind\": \"superseded\"\n      }\n    ]\n  },\n  \"signer\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"signature\": \"39f40fb9037919bcb558a6c5b21b2f9ad562d8839c1585fba6c3c9c860c3c5e3900a34b7cdd317a08c2b39e2134fe09544e16223e2fdf677bb0ede0ec825930b\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 3524,
     "content": "{\n  \"jti\": \"KK6R4ODNCJ6WZYDWKVVEAHDBBONR4VTVXXS6DFPTWC2QGRSPMXUA\",\n  \"iat\": 1791349958,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJGVExWUVJCT0NFU0Y2RVBLTVhKMk41U0JCVEJPSkRJTkJNU0RPWklPQU8ySVNaTVhMSjdBIiwiaWF0IjoxNzkxMzQ5OTU4LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFBRUhUWTJRQ1Q1M0hJSE4zMlpKU0NTNVdMUzZPVUEyRVRHNUNVWkVRTEJLVVhEUlUyM0VBVlBCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFFSFRZMlFDVDUzSElITjMyWkpTQ1M1V0xTNk9VQTJFVEc1Q1VaRVFMQktVWERSVTIzRUFWUEIuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.WdvY3Re5xZgS1uxBjc43uiOYOrf7RjlkjovHo7Tzwvo6pl30t52Zdlyr9QVLyqW0ch6pgWYsg0it35n0bJnsCg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB.out.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJGVExWUVJCT0NFU0Y2RVBLTVhKMk41U0JCVEJPSkRJTkJNU0RPWklPQU8ySVNaTVhMSjdBIiwiaWF0IjoxNzkxMzQ5OTU4LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFBRUhUWTJRQ1Q1M0hJSE4zMlpKU0NTNVdMUzZPVUEyRVRHNUNVWkVRTEJLVVhEUlUyM0VBVlBCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFFSFRZMlFDVDUzSElITjMyWkpTQ1M1V0xTNk9VQTJFVEc1Q1VaRVFMQktVWERSVTIzRUFWUEIub3V0Llx1MDAzZSIsImtpbmQiOiJzdHJlYW0iLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.r51o3MOffUiS8b6xBD0OCutII44RIqEPvzq4RiMKbJqQDrFtcQUPagkzpeKouRGza1QKgNUzQx7hGgXDup50Cg\",\n        \"local_subject\": \"garm.run.v1.out.\\u003e\",\n        \"type\": \"stream\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n    ],\n    \"revocations\": {\n      \"UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY\": 1791349958\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 3410,
     "content": "{\n  \"jti\": \"GWKQ3XLQRGAZ23TBKEZZ42CJ3A6SKKCHWCVMJS5MGGQFETR7QY6Q\",\n  \"iat\": 1791349958,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJKSzVQWTZUU1VZR0FaUVNPM0pLNURZWUVYTFVURVNLWDY0RjQ3SE5LUlhKV1NRRjVXS05BIiwiaWF0IjoxNzkxMzQ5OTU4LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFEUkhPREpaRExPWDY0SFg1NlpFUjM3TTJMUzNIM0JaS1JDUFlLVkgzS0dIVVJGQjZOSVlXNVM3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURSSE9ESlpETE9YNjRIWDU2WkVSMzdNMkxTM0gzQlpLUkNQWUtWSDNLR0hVUkZCNk5JWVc1UzcuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.Ts7CAdROf2F11vHf1FPGYdKljpeleFFDwxauFLQZyEbQHFwcY-ml---odtsNNTuLZqaO6BDMzAKWSqIjz6-xAw\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7.out.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJKSzVQWTZUU1VZR0FaUVNPM0pLNURZWUVYTFVURVNLWDY0RjQ3SE5LUlhKV1NRRjVXS05BIiwiaWF0IjoxNzkxMzQ5OTU4LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFEUkhPREpaRExPWDY0SFg1NlpFUjM3TTJMUzNIM0JaS1JDUFlLVkgzS0dIVVJGQjZOSVlXNVM3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURSSE9ESlpETE9YNjRIWDU2WkVSMzdNMkxTM0gzQlpLUkNQWUtWSDNLR0hVUkZCNk5JWVc1Uzcub3V0Llx1MDAzZSIsImtpbmQiOiJzdHJlYW0iLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.r2gb_wblQkDQrsx7vSmcxrLC3gyxnq0yO5Er1sb2Y8YApLkZLniBZclcGpvkKhyuNNGHTrx0dGe8wJ-47ZeIBA\",\n        \"local_subject\": \"garm.run.v1.out.\\u003e\",\n        \"type\": \"stream\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 2202,
     "content": "{\n  \"jti\": \"QWKAZ5K5WKNDCKIDQ4HUNRYRR5OKLMQRUZTCXCJHQQYEZZ7ZQ5QA\",\n  \"iat\": 1791349958,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJCVFozVUNJSzJHS1FOWFFQSjRFV1lJVVBSNEVaVkpNQzZEUEhIRUlZTVAyNURYTklZVEhBIiwiaWF0IjoxNzkxMzQ5OTU4LCJpc3MiOiJBQklRSFQ1SFlNRENIRURTWEhFQTRaUVVNWkVWMlczWko2WlNZSEdMQkVBRFNGVE1YSUFaVVdNVCIsInN1YiI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQUFJSVZZMklVVlpGWUNWV1NHRDNCVFdDVEJNUkJNRkhZWFpaWlpUT0dGVUtXSDc0TU9LSUozNiIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.MnwTkNQf-Q7mByOgc1xqrh-Zs555WDiWcR_sDMuhydXtl2WxgKaArs3Qxaq1lqv7FiHJ7HDOON5XzYakZqeQAQ\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.*.out.\\u003e\",\n        \"type\": \"stream\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"EYQ3P6RJ5TFD7ZP55WHKIL2RQG6GEYYAPQ6FHJACAW5Y7K2GZLGQ\",\n  \"iat\": 1791349958,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"SYS\",\n  \"sub\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "changed",
     "secret": false,
     "size": 1084,
     "content": "{\n  \"jti\": \"VCOYAEPW2KUK53Y73FAMSM4IUMSPNA6AX4FD5NGV7YBXPPHAK5QA\",\n  \"iat\": 1791349958,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n    ],\n    \"revocations\": {\n      \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\": 1791349939\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n  \"studio\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "changed",
     "secret": true,
     "size": 1395,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885958,\n  \"jti\": \"5ZHSNK3LWRVMR45J5MJJC7JGPH462XLHORAQVD4G32DRDM6UIL3Q\",\n  \"iat\": 1791349958,\n  \"iss\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\",\n  \"name\": \"batch\",\n  \"sub\": \"UCSTOMOIMPGUBGO62LOQKGBV2WM5W4AAGHFVK7ANOXSVYPOEMR55N3JF\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.invoke\",\n        \"garm.run.v1.fetch\",\n        \"garm.run.v1.events\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\",\n        \"garm.run.v1.out.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:8\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"WRYA3EIFM4RWGTNTCRQ36TAONJ55DYPL46XQPRM6PS4MFCB3TBDQ\",\n  \"iat\": 1791349935,\n  \"iss\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\",\n  \"name\": \"ops\",\n  \"sub\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1421,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"SN6TG73UXVVPZORNIAYAVDCUJ2ZUOP2YMFV5SYARWYV52F6OBUEA\",\n  \"iat\": 1791349935,\n  \"iss\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\",\n  \"name\": \"rund\",\n  \"sub\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\",\n        \"garm.run.v1.*.out.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1396,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885947,\n  \"jti\": \"NELSX35IFXHGVBPSXKEPFLJEP2RMRTAOMBLJ6WTPBD3I2C3ZYRBA\",\n  \"iat\": 1791349947,\n  \"iss\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\",\n  \"name\": \"studio\",\n  \"sub\": \"UC4QJXPZJCTABSEE47MF2SI5GY5ENZ5YF5BIBFC6PJSDE5IF446QP5DH\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.invoke\",\n        \"garm.run.v1.fetch\",\n        \"garm.run.v1.events\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\",\n        \"garm.run.v1.out.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:6\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"7I5GELQJ5BXHYJ6MTWDUEC7AMWYYDR5GYATO2SMT7RKFATYSRBUA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 4456,
     "content": "{\n  \"manifest\": {\n    \"generation\": 8,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-07T09:12:38.107251+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n        \"signing\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n        \"signing\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\",\n        \"retired\": {\n          \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\": 7\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"signing\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      \"SYS\": {\n        \"identity\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n        \"signing\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"signing\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UCSTOMOIMPGUBGO62LOQKGBV2WM5W4AAGHFVK7ANOXSVYPOEMR55N3JF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 8,\n        \"permissions_hash\": \"0f5b5da9ac25bd0b\",\n        \"issued_at\": 1791349958,\n        \"expires_at\": 1822885958,\n        \"signing_key\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\",\n        \"reason\": \"reissued\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"10d053423b42ba95\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UC4QJXPZJCTABSEE47MF2SI5GY5ENZ5YF5BIBFC6PJSDE5IF446QP5DH\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 6,\n        \"permissions_hash\": \"de4176fe88b30b4e\",\n        \"issued_at\": 1791349947,\n        \"expires_at\": 1822885947,\n        \"signing_key\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\",\n        \"at\": 1791349939,\n        \"generation\": 3,\n        \"expires_at\": 1822885937,\n        \"kind\": \"retired\"\n      },\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY\",\n        \"at\": 1791349958,\n        \"generation\": 8,\n        \"expires_at\": 1822885943,\n        \"kind\": \"superseded\"\n      }\n    ]\n  },\n  \"signer\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"signature\": \"39f40fb9037919bcb558a6c5b21b2f9ad562d8839c1585fba6c3c9c860c3c5e3900a34b7cdd317a08c2b39e2134fe09544e16223e2fdf677bb0ede0ec825930b\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "changed",
     "secret": false,
     "size": 249,
     "content": "[\n  {\n    \"Name\": \"batch\",\n    \"Account\": \"CALLER-batch\",\n    \"Public\": \"UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY\",\n    \"At\": \"2026-10-07T09:12:38.107251+04:00\",\n    \"Kind\": \"superseded\",\n    \"Why\": \"superseded by generation 8\"\n  }\n]"
    }
   ],
   "bus": {
    "server": "tls://127.0.0.1:62504",
    "accounts": [
     {
      "name": "CALLER-batch",
      "public": "AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB",
      "signing_keys": [
       "ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D"
      ],
      "revocations": 1,
      "pushed": true
     },
     {
      "name": "CALLER-studio",
      "public": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "signing_keys": [
       "AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "GARM",
      "public": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A",
      "signing_keys": [
       "AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "SYS",
      "public": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH",
      "signing_keys": [
       "ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR"
      ],
      "revocations": 0,
      "pushed": true
     },
     {
      "name": "TOOLS",
      "public": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "signing_keys": [
       "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT"
      ],
      "revocations": 1,
      "pushed": true
     }
    ],
    "creds": [
     {
      "file": "creds/batch.creds",
      "name": "batch",
      "account": "AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB",
      "public": "UCSTOMOIMPGUBGO62LOQKGBV2WM5W4AAGHFVK7ANOXSVYPOEMR55N3JF",
      "issuer": "ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:8"
      ],
      "expires": "2027-10-07T05:12:38Z",
      "pub_allow": [
       "garm.run.v1.invoke",
       "garm.run.v1.fetch",
       "garm.run.v1.events"
      ],
      "sub_allow": [
       "_INBOX.>",
       "garm.run.v1.out.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/ops.creds",
      "name": "ops",
      "account": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH",
      "public": "UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA",
      "issuer": "ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": null,
      "sub_allow": null,
      "accepted": true
     },
     {
      "file": "creds/rund.creds",
      "name": "rund",
      "account": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A",
      "public": "UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O",
      "issuer": "AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
      "pub_allow": [
       "garm.tool.>",
       "garm.run.v1.*.out.>"
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
      "account": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7",
      "public": "UC4QJXPZJCTABSEE47MF2SI5GY5ENZ5YF5BIBFC6PJSDE5IF446QP5DH",
      "issuer": "AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:6"
      ],
      "expires": "2027-10-07T05:12:27Z",
      "pub_allow": [
       "garm.run.v1.invoke",
       "garm.run.v1.fetch",
       "garm.run.v1.events"
      ],
      "sub_allow": [
       "_INBOX.>",
       "garm.run.v1.out.>"
      ],
      "accepted": true
     },
     {
      "file": "creds/weather.v1.WeatherService.creds",
      "name": "weather.v1.WeatherService",
      "account": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36",
      "public": "UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ",
      "issuer": "ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT",
      "tags": [
       "catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73",
       "generation:1"
      ],
      "expires": "2027-10-07T05:12:15Z",
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
     },
     {
      "cred": "studio",
      "action": "subscribe",
      "subject": "garm.run.v1.out.>",
      "outcome": "allowed"
     },
     {
      "cred": "studio",
      "action": "publish",
      "subject": "garm.run.v1.out.forged.1",
      "outcome": "refused by the server: nats: permissions violation: Permissions Violation for Publish to \"garm.run.v1.out.forged.1\""
     },
     {
      "cred": "rund",
      "action": "publish",
      "subject": "garm.run.v1.ACX.out.r.1",
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
   "stdout": "generation 8 from catalogue 24164e3e783d, issued 2026-10-07T09:12:38+04:00; 5 credentials\n  CALLER-batch  identity AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB  signing ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\n  CALLER-studio  identity ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7  signing AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\n  GARM  identity ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A  signing AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\n  SYS  identity ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH  signing ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\n  TOOLS  identity AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36  signing ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\n",
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
     "content": "AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB"
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
     "content": "ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7"
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
     "content": "ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A"
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
     "content": "ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH"
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
     "content": "AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36"
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
     "path": "ceremony/keys/archive/CALLER-studio.signing.AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL.nk",
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
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
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
     "content": "{\n  \"manifest\": {\n    \"generation\": 8,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-07T09:12:38.107251+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n        \"signing\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n        \"signing\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\",\n        \"retired\": {\n          \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\": 7\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"signing\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      \"SYS\": {\n        \"identity\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n        \"signing\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"signing\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UCSTOMOIMPGUBGO62LOQKGBV2WM5W4AAGHFVK7ANOXSVYPOEMR55N3JF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 8,\n        \"permissions_hash\": \"0f5b5da9ac25bd0b\",\n        \"issued_at\": 1791349958,\n        \"expires_at\": 1822885958,\n        \"signing_key\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\",\n        \"reason\": \"reissued\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"10d053423b42ba95\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UC4QJXPZJCTABSEE47MF2SI5GY5ENZ5YF5BIBFC6PJSDE5IF446QP5DH\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 6,\n        \"permissions_hash\": \"de4176fe88b30b4e\",\n        \"issued_at\": 1791349947,\n        \"expires_at\": 1822885947,\n        \"signing_key\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\",\n        \"at\": 1791349939,\n        \"generation\": 3,\n        \"expires_at\": 1822885937,\n        \"kind\": \"retired\"\n      },\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY\",\n        \"at\": 1791349958,\n        \"generation\": 8,\n        \"expires_at\": 1822885943,\n        \"kind\": \"superseded\"\n      }\n    ]\n  },\n  \"signer\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"signature\": \"39f40fb9037919bcb558a6c5b21b2f9ad562d8839c1585fba6c3c9c860c3c5e3900a34b7cdd317a08c2b39e2134fe09544e16223e2fdf677bb0ede0ec825930b\"\n}"
    },
    {
     "path": "topo/accounts/CALLER-batch.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 3524,
     "content": "{\n  \"jti\": \"KK6R4ODNCJ6WZYDWKVVEAHDBBONR4VTVXXS6DFPTWC2QGRSPMXUA\",\n  \"iat\": 1791349958,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"CALLER-batch\",\n  \"sub\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJGVExWUVJCT0NFU0Y2RVBLTVhKMk41U0JCVEJPSkRJTkJNU0RPWklPQU8ySVNaTVhMSjdBIiwiaWF0IjoxNzkxMzQ5OTU4LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFBRUhUWTJRQ1Q1M0hJSE4zMlpKU0NTNVdMUzZPVUEyRVRHNUNVWkVRTEJLVVhEUlUyM0VBVlBCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFFSFRZMlFDVDUzSElITjMyWkpTQ1M1V0xTNk9VQTJFVEc1Q1VaRVFMQktVWERSVTIzRUFWUEIuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.WdvY3Re5xZgS1uxBjc43uiOYOrf7RjlkjovHo7Tzwvo6pl30t52Zdlyr9QVLyqW0ch6pgWYsg0it35n0bJnsCg\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB.out.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJGVExWUVJCT0NFU0Y2RVBLTVhKMk41U0JCVEJPSkRJTkJNU0RPWklPQU8ySVNaTVhMSjdBIiwiaWF0IjoxNzkxMzQ5OTU4LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFBRUhUWTJRQ1Q1M0hJSE4zMlpKU0NTNVdMUzZPVUEyRVRHNUNVWkVRTEJLVVhEUlUyM0VBVlBCIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQUFFSFRZMlFDVDUzSElITjMyWkpTQ1M1V0xTNk9VQTJFVEc1Q1VaRVFMQktVWERSVTIzRUFWUEIub3V0Llx1MDAzZSIsImtpbmQiOiJzdHJlYW0iLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.r51o3MOffUiS8b6xBD0OCutII44RIqEPvzq4RiMKbJqQDrFtcQUPagkzpeKouRGza1QKgNUzQx7hGgXDup50Cg\",\n        \"local_subject\": \"garm.run.v1.out.\\u003e\",\n        \"type\": \"stream\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n    ],\n    \"revocations\": {\n      \"UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY\": 1791349958\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/CALLER-studio.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 3410,
     "content": "{\n  \"jti\": \"GWKQ3XLQRGAZ23TBKEZZ42CJ3A6SKKCHWCVMJS5MGGQFETR7QY6Q\",\n  \"iat\": 1791349958,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"CALLER-studio\",\n  \"sub\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJKSzVQWTZUU1VZR0FaUVNPM0pLNURZWUVYTFVURVNLWDY0RjQ3SE5LUlhKV1NRRjVXS05BIiwiaWF0IjoxNzkxMzQ5OTU4LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFEUkhPREpaRExPWDY0SFg1NlpFUjM3TTJMUzNIM0JaS1JDUFlLVkgzS0dIVVJGQjZOSVlXNVM3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURSSE9ESlpETE9YNjRIWDU2WkVSMzdNMkxTM0gzQlpLUkNQWUtWSDNLR0hVUkZCNk5JWVc1UzcuXHUwMDNlIiwia2luZCI6InNlcnZpY2UiLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.Ts7CAdROf2F11vHf1FPGYdKljpeleFFDwxauFLQZyEbQHFwcY-ml---odtsNNTuLZqaO6BDMzAKWSqIjz6-xAw\",\n        \"local_subject\": \"garm.run.v1.\\u003e\",\n        \"type\": \"service\"\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7.out.\\u003e\",\n        \"account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJKSzVQWTZUU1VZR0FaUVNPM0pLNURZWUVYTFVURVNLWDY0RjQ3SE5LUlhKV1NRRjVXS05BIiwiaWF0IjoxNzkxMzQ5OTU4LCJpc3MiOiJBQjZCMkJSTFRaQjJHTlpGQkJQNEVCWEhQWkdWU0dIU0lDUEJXTlhVUTdLS0tSUDNVM0FZUko3QSIsInN1YiI6IkFEUkhPREpaRExPWDY0SFg1NlpFUjM3TTJMUzNIM0JaS1JDUFlLVkgzS0dIVVJGQjZOSVlXNVM3IiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS5ydW4udjEuQURSSE9ESlpETE9YNjRIWDU2WkVSMzdNMkxTM0gzQlpLUkNQWUtWSDNLR0hVUkZCNk5JWVc1Uzcub3V0Llx1MDAzZSIsImtpbmQiOiJzdHJlYW0iLCJpc3N1ZXJfYWNjb3VudCI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwidHlwZSI6ImFjdGl2YXRpb24iLCJ2ZXJzaW9uIjoyfX0.r2gb_wblQkDQrsx7vSmcxrLC3gyxnq0yO5Er1sb2Y8YApLkZLniBZclcGpvkKhyuNNGHTrx0dGe8wJ-47ZeIBA\",\n        \"local_subject\": \"garm.run.v1.out.\\u003e\",\n        \"type\": \"stream\"\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": 64,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/GARM.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 2202,
     "content": "{\n  \"jti\": \"QWKAZ5K5WKNDCKIDQ4HUNRYRR5OKLMQRUZTCXCJHQQYEZZ7ZQ5QA\",\n  \"iat\": 1791349958,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"GARM\",\n  \"sub\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n  \"nats\": {\n    \"imports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJCVFozVUNJSzJHS1FOWFFQSjRFV1lJVVBSNEVaVkpNQzZEUEhIRUlZTVAyNURYTklZVEhBIiwiaWF0IjoxNzkxMzQ5OTU4LCJpc3MiOiJBQklRSFQ1SFlNRENIRURTWEhFQTRaUVVNWkVWMlczWko2WlNZSEdMQkVBRFNGVE1YSUFaVVdNVCIsInN1YiI6IkFDS09ZWllXN1o3RldGV1NEMlVKTUlaRFhSWDJFWFdQUUZTSUtPVVo2Q0JUN0hBSURQRTJUUjVBIiwibmF0cyI6eyJzdWJqZWN0IjoiZ2FybS50b29sLlx1MDAzZSIsImtpbmQiOiJzZXJ2aWNlIiwiaXNzdWVyX2FjY291bnQiOiJBQUFJSVZZMklVVlpGWUNWV1NHRDNCVFdDVEJNUkJNRkhZWFpaWlpUT0dGVUtXSDc0TU9LSUozNiIsInR5cGUiOiJhY3RpdmF0aW9uIiwidmVyc2lvbiI6Mn19.MnwTkNQf-Q7mByOgc1xqrh-Zs555WDiWcR_sDMuhydXtl2WxgKaArs3Qxaq1lqv7FiHJ7HDOON5XzYakZqeQAQ\",\n        \"type\": \"service\"\n      }\n    ],\n    \"exports\": [\n      {\n        \"name\": \"run\",\n        \"subject\": \"garm.run.v1.*.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      },\n      {\n        \"name\": \"out\",\n        \"subject\": \"garm.run.v1.*.out.\\u003e\",\n        \"type\": \"stream\",\n        \"token_req\": true,\n        \"account_token_position\": 4\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/SYS.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 844,
     "content": "{\n  \"jti\": \"EYQ3P6RJ5TFD7ZP55WHKIL2RQG6GEYYAPQ6FHJACAW5Y7K2GZLGQ\",\n  \"iat\": 1791349958,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"SYS\",\n  \"sub\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n  \"nats\": {\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n    ],\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/accounts/TOOLS.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 1084,
     "content": "{\n  \"jti\": \"VCOYAEPW2KUK53Y73FAMSM4IUMSPNA6AX4FD5NGV7YBXPPHAK5QA\",\n  \"iat\": 1791349958,\n  \"iss\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"name\": \"TOOLS\",\n  \"sub\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n  \"nats\": {\n    \"exports\": [\n      {\n        \"name\": \"tools\",\n        \"subject\": \"garm.tool.\\u003e\",\n        \"type\": \"service\",\n        \"token_req\": true\n      }\n    ],\n    \"limits\": {\n      \"subs\": -1,\n      \"data\": -1,\n      \"payload\": 1048576,\n      \"imports\": -1,\n      \"exports\": -1,\n      \"wildcards\": true,\n      \"disallow_bearer\": true,\n      \"conn\": -1,\n      \"leaf\": -1\n    },\n    \"signing_keys\": [\n      \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n    ],\n    \"revocations\": {\n      \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\": 1791349939\n    },\n    \"default_permissions\": {\n      \"pub\": {},\n      \"sub\": {}\n    },\n    \"authorization\": {},\n    \"type\": \"account\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/callers.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 145,
     "content": "{\n  \"batch\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n  \"studio\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\"\n}"
    },
    {
     "path": "topo/creds/batch.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1395,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885958,\n  \"jti\": \"5ZHSNK3LWRVMR45J5MJJC7JGPH462XLHORAQVD4G32DRDM6UIL3Q\",\n  \"iat\": 1791349958,\n  \"iss\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\",\n  \"name\": \"batch\",\n  \"sub\": \"UCSTOMOIMPGUBGO62LOQKGBV2WM5W4AAGHFVK7ANOXSVYPOEMR55N3JF\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.invoke\",\n        \"garm.run.v1.fetch\",\n        \"garm.run.v1.events\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\",\n        \"garm.run.v1.out.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:8\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/ops.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1231,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"WRYA3EIFM4RWGTNTCRQ36TAONJ55DYPL46XQPRM6PS4MFCB3TBDQ\",\n  \"iat\": 1791349935,\n  \"iss\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\",\n  \"name\": \"ops\",\n  \"sub\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n  \"nats\": {\n    \"pub\": {},\n    \"sub\": {},\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/rund.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1421,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"SN6TG73UXVVPZORNIAYAVDCUJ2ZUOP2YMFV5SYARWYV52F6OBUEA\",\n  \"iat\": 1791349935,\n  \"iss\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\",\n  \"name\": \"rund\",\n  \"sub\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.tool.\\u003e\",\n        \"garm.run.v1.*.out.\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"garm.run.v1.*.\\u003e\",\n        \"_INBOX.\\u003e\",\n        \"$SRV.\\u003e\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/studio.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1396,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885947,\n  \"jti\": \"NELSX35IFXHGVBPSXKEPFLJEP2RMRTAOMBLJ6WTPBD3I2C3ZYRBA\",\n  \"iat\": 1791349947,\n  \"iss\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\",\n  \"name\": \"studio\",\n  \"sub\": \"UC4QJXPZJCTABSEE47MF2SI5GY5ENZ5YF5BIBFC6PJSDE5IF446QP5DH\",\n  \"nats\": {\n    \"pub\": {\n      \"allow\": [\n        \"garm.run.v1.invoke\",\n        \"garm.run.v1.fetch\",\n        \"garm.run.v1.events\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"_INBOX.\\u003e\",\n        \"garm.run.v1.out.\\u003e\"\n      ]\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:6\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/creds/weather.v1.WeatherService.creds",
     "kind": "creds",
     "change": "same",
     "secret": true,
     "size": 1447,
     "content": "-----BEGIN NATS USER JWT----- (decoded)\n{\n  \"exp\": 1822885935,\n  \"jti\": \"7I5GELQJ5BXHYJ6MTWDUEC7AMWYYDR5GYATO2SMT7RKFATYSRBUA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\",\n  \"name\": \"weather.v1.WeatherService\",\n  \"sub\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n  \"nats\": {\n    \"pub\": {\n      \"deny\": [\n        \"\\u003e\"\n      ]\n    },\n    \"sub\": {\n      \"allow\": [\n        \"$SRV.\\u003e\",\n        \"garm.tool.weather.v1.get_forecast\",\n        \"garm.tool.weather.v1.schedule_report\"\n      ]\n    },\n    \"resp\": {\n      \"max\": 1,\n      \"ttl\": 0\n    },\n    \"subs\": -1,\n    \"data\": -1,\n    \"payload\": -1,\n    \"issuer_account\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n    \"tags\": [\n      \"catalogue:24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n      \"generation:1\"\n    ],\n    \"type\": \"user\",\n    \"version\": 2\n  }\n}\n-----BEGIN USER NKEY SEED-----\n(the seed: not shown)"
    },
    {
     "path": "topo/manifest.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 4456,
     "content": "{\n  \"manifest\": {\n    \"generation\": 8,\n    \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n    \"issued_at\": \"2026-10-07T09:12:38.107251+04:00\",\n    \"accounts\": {\n      \"CALLER-batch\": {\n        \"identity\": \"AAEHTY2QCT53HIHN32ZJSCS5WLS6OUA2ETG5CUZEQLBKUXDRU23EAVPB\",\n        \"signing\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\"\n      },\n      \"CALLER-studio\": {\n        \"identity\": \"ADRHODJZDLOX64HX56ZER37M2LS3H3BZKRCPYKVH3KGHURFB6NIYW5S7\",\n        \"signing\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\",\n        \"retired\": {\n          \"AAZTMXYMLJ4VIHSG77AQODE26PVOHKG4FOAVE7EGUUWIVKWXL4AB5EBL\": 7\n        }\n      },\n      \"GARM\": {\n        \"identity\": \"ACKOYZYW7Z7FWFWSD2UJMIZDXRX2EXWPQFSIKOUZ6CBT7HAIDPE2TR5A\",\n        \"signing\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      \"SYS\": {\n        \"identity\": \"ABXFHUYV3E3PQR3DA6GPS3R4WAHJXHSPZEGUQJSP6COFTFZ23KP5DGXH\",\n        \"signing\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      \"TOOLS\": {\n        \"identity\": \"AAAIIVY2IUVZFYCVWSGD3BTWCTBMRBMFHYXZZZZTOGFUKWH74MOKIJ36\",\n        \"signing\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    },\n    \"entries\": [\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UCSTOMOIMPGUBGO62LOQKGBV2WM5W4AAGHFVK7ANOXSVYPOEMR55N3JF\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 8,\n        \"permissions_hash\": \"0f5b5da9ac25bd0b\",\n        \"issued_at\": 1791349958,\n        \"expires_at\": 1822885958,\n        \"signing_key\": \"ADRQQOKUWUNSFZY272IYT4AQSCFUGQBKL3E4FDF4DGMBLBHVRDAAS45D\",\n        \"reason\": \"reissued\"\n      },\n      {\n        \"name\": \"ops\",\n        \"account\": \"SYS\",\n        \"public\": \"UAO5VBYHDBX35YK5IDB2XTLHVFJAJF3YFO6MFR27S6IVKCL3Q4U3TEIA\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"e11981ec3d5b466e\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABY6QTMSR7E2WWLNEAFD4ANNV3FHNUEXZPSLR2QC6VTSIARL3UJOINUR\"\n      },\n      {\n        \"name\": \"rund\",\n        \"account\": \"GARM\",\n        \"public\": \"UBP66OK4BIZJLVIH6SB43TIJE766FYDCSBLHMODBWWABC375CQVUNC2O\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"10d053423b42ba95\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"AB6B2BRLTZB2GNZFBBP4EBXHPZGVSGHSICPBWNXUQ7KKKRP3U3AYRJ7A\"\n      },\n      {\n        \"name\": \"studio\",\n        \"account\": \"CALLER-studio\",\n        \"public\": \"UC4QJXPZJCTABSEE47MF2SI5GY5ENZ5YF5BIBFC6PJSDE5IF446QP5DH\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 6,\n        \"permissions_hash\": \"de4176fe88b30b4e\",\n        \"issued_at\": 1791349947,\n        \"expires_at\": 1822885947,\n        \"signing_key\": \"AD5WUXS6O7P6UEXDC7CLJZUG7CSU2XNFHNREF5XAQ54M3JJHAAEAFU56\"\n      },\n      {\n        \"name\": \"weather.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UDZH5AW253AI3OE2QBNJTI277OYZP635ODL2GUILNVQYALXX3H27IYQJ\",\n        \"catalogue_sha256\": \"24164e3e783d08b091082b41669a949a2f7a7be6867469c4d4f157d71b056c73\",\n        \"generation\": 1,\n        \"permissions_hash\": \"122117da58f99905\",\n        \"issued_at\": 1791349935,\n        \"expires_at\": 1822885935,\n        \"signing_key\": \"ABIQHT5HYMDCHEDSXHEA4ZQUMZEV2W3ZJ6ZSYHGLBEADSFTMXIAZUWMT\"\n      }\n    ],\n    \"revocations\": [\n      {\n        \"name\": \"weather2.v1.WeatherService\",\n        \"account\": \"TOOLS\",\n        \"public\": \"UC4KCI5YJAKRCPNIMPPDVM2VGLQBWA3ROVELTT6B2VSOJSSUJPSEZFWI\",\n        \"at\": 1791349939,\n        \"generation\": 3,\n        \"expires_at\": 1822885937,\n        \"kind\": \"retired\"\n      },\n      {\n        \"name\": \"batch\",\n        \"account\": \"CALLER-batch\",\n        \"public\": \"UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY\",\n        \"at\": 1791349958,\n        \"generation\": 8,\n        \"expires_at\": 1822885943,\n        \"kind\": \"superseded\"\n      }\n    ]\n  },\n  \"signer\": \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\",\n  \"signature\": \"39f40fb9037919bcb558a6c5b21b2f9ad562d8839c1585fba6c3c9c860c3c5e3900a34b7cdd317a08c2b39e2134fe09544e16223e2fdf677bb0ede0ec825930b\"\n}"
    },
    {
     "path": "topo/operator.jwt",
     "kind": "jwt",
     "change": "same",
     "secret": false,
     "size": 628,
     "content": "{\n  \"jti\": \"H3IVWVKBNX6GTOHUWVRDWLZXJJQVCZPGYH7YCAAW74MXAH2QT5UA\",\n  \"iat\": 1791349935,\n  \"iss\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"name\": \"garm\",\n  \"sub\": \"ODS5VIJDPP4CCYUHKJEJ34HTRXVLULAMNTKOOHJKA7XB7AUSCUDGN2NF\",\n  \"nats\": {\n    \"signing_keys\": [\n      \"OCSMB5E5KZBGZAH67XSFAIVCFU5NN3HI3UGW7XKFDXUP3RXTQOKUHWAB\"\n    ],\n    \"strict_signing_key_usage\": true,\n    \"type\": \"operator\",\n    \"version\": 2\n  }\n}"
    },
    {
     "path": "topo/revocations.json",
     "kind": "json",
     "change": "same",
     "secret": false,
     "size": 249,
     "content": "[\n  {\n    \"Name\": \"batch\",\n    \"Account\": \"CALLER-batch\",\n    \"Public\": \"UDNHFYT5X44XEZWSFL355ADABM5YCTWUTBHCD5WJKIZ2EGE5VHVXDFKY\",\n    \"At\": \"2026-10-07T09:12:38.107251+04:00\",\n    \"Kind\": \"superseded\",\n    \"Why\": \"superseded by generation 8\"\n  }\n]"
    }
   ]
  }
 ]
}
;
