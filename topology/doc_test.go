package topology_test

import (
	"testing"

	"github.com/garm-ai/garm-ai/topology"
)

func TestAccountNamesAreTheSpecs(t *testing.T) {
	for got, want := range map[string]string{
		topology.AccountSYS: "SYS", topology.AccountGARM: "GARM",
		topology.AccountTOOLS: "TOOLS", topology.CallerPrefix: "CALLER-",
	} {
		if got != want {
			t.Errorf("got %q want %q", got, want)
		}
	}
}
