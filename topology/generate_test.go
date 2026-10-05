package topology_test

import (
	"sort"
	"testing"
	"time"

	"github.com/nats-io/jwt/v2"

	"github.com/garm-ai/garm-ai/catalogue"
	"github.com/garm-ai/garm-ai/internal/fixtures"
	"github.com/garm-ai/garm-ai/topology"
)

func weatherCatalogue(t *testing.T) *catalogue.Catalogue { return fixtures.Weather(t).Catalogue }
func emptyCatalogue(t *testing.T) *catalogue.Catalogue   { return fixtures.Empty(t).Catalogue }

func generate(t *testing.T, callers ...string) *topology.Output {
	t.Helper()
	out, err := topology.Generate(topology.Input{
		Catalogue: weatherCatalogue(t),
		Callers:   callers,
		Previous:  topology.Empty(),
		Keys:      topology.FreshKeys(callers),
		Now:       time.Date(2026, 10, 4, 12, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatalf("Generate: %v", err)
	}
	return out
}

func credential(t *testing.T, out *topology.Output, name string) *jwt.UserClaims {
	t.Helper()
	for _, c := range out.Credentials {
		if c.Name == name {
			uc, err := jwt.DecodeUserClaims(c.JWT)
			if err != nil {
				t.Fatal(err)
			}
			return uc
		}
	}
	t.Fatalf("no credential named %q; have %v", name, names(out))
	return nil
}

func names(out *topology.Output) []string {
	var ns []string
	for _, c := range out.Credentials {
		ns = append(ns, c.Name)
	}
	sort.Strings(ns)
	return ns
}

// Property 9: exactly one subscribe permission per DECLARED tool, and no others.
func TestAToolServiceMaySubscribeExactlyItsDeclaredTools(t *testing.T) {
	out := generate(t, "studio")
	uc := credential(t, out, "weather.v1.WeatherService")

	got := append([]string(nil), uc.Permissions.Sub.Allow...)
	sort.Strings(got)
	want := []string{
		"$SRV.>", // micro's discovery subjects, or AddService fails
		"garm.tool.weather.v1.get_forecast",
	}
	if len(got) != len(want) {
		t.Fatalf("subscribe allow is %v, want %v", got, want)
	}
	for i := range want {
		if got[i] != want[i] {
			t.Errorf("subscribe allow[%d] = %q, want %q", i, got[i], want[i])
		}
	}
	if uc.Permissions.Sub.Deny != nil {
		t.Errorf("deny list present: %v -- an allow list is the whole policy", uc.Permissions.Sub.Deny)
	}
}

// Spec §4.1, amended: a tool service may publish NOTHING but a reply to a request
// it received -- publish is DENIED outright, and allow-responses is the only way
// out, across accounts too, where the reply subject is the server's _R_.>.
//
// The deny is the point. In NATS an empty publish allow-list is UNRESTRICTED,
// not empty; the first version of this test asserted len(Pub.Allow)==0 as
// "publishes nothing" and was asserting the opposite. A probe found it: with no
// publish permission and no allow-responses, the reply still went out.
// Property 2 is what proves the reply gets out WITH the deny in place.
func TestAToolServiceMayPublishNothingButReplies(t *testing.T) {
	out := generate(t, "studio")
	uc := credential(t, out, "weather.v1.WeatherService")
	if len(uc.Permissions.Pub.Allow) != 0 {
		t.Fatalf("a tool service may publish %v; it should publish nothing but replies", uc.Permissions.Pub.Allow)
	}
	if deny := uc.Permissions.Pub.Deny; len(deny) != 1 || deny[0] != ">" {
		t.Fatalf("publish deny is %v, want [>] -- an empty allow-list is unrestricted, not empty", deny)
	}
	if uc.Permissions.Resp == nil {
		t.Fatal("no allow-responses permission: the tool would receive every call and answer none")
	}
}

// Review Focus 1: a service whose only methods are agents gets NO user.
//
// Asserted as the EXACT set, not the absence of one name: the first version
// looked for "trips.v1.TripService", a service that does not exist, and passed
// vacuously. The agent-only service is trips.v1.TripPlannerService.
func TestAnAgentOnlyServiceGetsNoCredential(t *testing.T) {
	out := generate(t, "studio")
	got := names(out)
	want := []string{"ops", "rund", "studio", "weather.v1.WeatherService"}
	if len(got) != len(want) {
		t.Fatalf("credentials issued: %v, want exactly %v", got, want)
	}
	for i := range want {
		if got[i] != want[i] {
			t.Fatalf("credentials issued: %v, want exactly %v", got, want)
		}
	}
}

// Property 12: every credential carries the catalogue digest and generation.
func TestEveryCredentialCarriesItsCatalogueDigestAndGeneration(t *testing.T) {
	out := generate(t, "studio")
	cat := weatherCatalogue(t)
	for _, c := range out.Credentials {
		uc, err := jwt.DecodeUserClaims(c.JWT)
		if err != nil {
			t.Fatal(err)
		}
		var sawDigest, sawGen bool
		for _, tag := range uc.Tags {
			if tag == "catalogue:"+cat.SHA256 {
				sawDigest = true
			}
			if tag == "generation:1" {
				sawGen = true
			}
		}
		if !sawDigest || !sawGen {
			t.Errorf("%s: tags %v lack the digest or generation", c.Name, uc.Tags)
		}
	}
}

// Review Focus 4: a caller may not shadow an account name.
func TestACallerNamedLikeAnAccountIsRefused(t *testing.T) {
	for _, bad := range []string{"SYS", "GARM", "TOOLS", "sys"} {
		_, err := topology.Generate(topology.Input{
			Catalogue: weatherCatalogue(t), Callers: []string{bad},
			Previous: topology.Empty(), Keys: topology.FreshKeys([]string{bad}),
			Now: time.Now(),
		})
		if err == nil {
			t.Errorf("caller %q was accepted", bad)
		}
	}
}

// rund's own permissions (§4.5): the wildcard import, both run patterns, and the
// cross-account reply it owes callers.
func TestRundMayPublishEveryToolAndAnswerEveryCaller(t *testing.T) {
	out := generate(t, "studio")
	uc := credential(t, out, "rund")
	pub, sub := map[string]bool{}, map[string]bool{}
	for _, s := range uc.Permissions.Pub.Allow {
		pub[s] = true
	}
	for _, s := range uc.Permissions.Sub.Allow {
		sub[s] = true
	}
	if len(uc.Permissions.Pub.Allow) != 1 || !pub["garm.tool.>"] {
		t.Errorf("rund publishes %v; want exactly garm.tool.> -- callers are answered as replies", uc.Permissions.Pub.Allow)
	}
	if uc.Permissions.Resp == nil {
		t.Error("rund has no allow-responses permission; it could answer no caller")
	}
	for _, want := range []string{"garm.run.v1.*.>", "_INBOX.>", "$SRV.>"} {
		if !sub[want] {
			t.Errorf("rund cannot subscribe %s: %v", want, uc.Permissions.Sub.Allow)
		}
	}
}

// The export that the whole design rests on, as the account JWT actually encodes it.
func TestGARMExportsTheRunServiceWithTheAccountTokenAtPositionFour(t *testing.T) {
	out := generate(t, "studio")
	ac, err := jwt.DecodeAccountClaims(out.Accounts[topology.AccountGARM])
	if err != nil {
		t.Fatal(err)
	}
	var found bool
	for _, e := range ac.Exports {
		if e.Subject == "garm.run.v1.*.>" {
			found = true
			if e.AccountTokenPosition != 4 {
				t.Errorf("token position is %d, want 4", e.AccountTokenPosition)
			}
			if e.Type != jwt.Service {
				t.Errorf("export is %v, want a service", e.Type)
			}
		}
	}
	if !found {
		t.Fatalf("GARM does not export garm.run.v1.*.>: %v", ac.Exports)
	}
}

func TestTOOLSExportsPrivatelyAndOnlyGARMImportsIt(t *testing.T) {
	out := generate(t, "studio")
	tools, err := jwt.DecodeAccountClaims(out.Accounts[topology.AccountTOOLS])
	if err != nil {
		t.Fatal(err)
	}
	if len(tools.Exports) != 1 || tools.Exports[0].Subject != "garm.tool.>" || !tools.Exports[0].TokenReq {
		t.Fatalf("TOOLS exports %v; want one private service export of garm.tool.>", tools.Exports)
	}
	for name, encoded := range out.Accounts {
		ac, err := jwt.DecodeAccountClaims(encoded)
		if err != nil {
			t.Fatal(err)
		}
		for _, im := range ac.Imports {
			if im.Subject == "garm.tool.>" && name != topology.AccountGARM {
				t.Errorf("%s imports garm.tool.>; only GARM may", name)
			}
		}
	}
}
