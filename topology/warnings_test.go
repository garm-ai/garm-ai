package topology_test

import (
	"strings"
	"testing"
	"time"

	"github.com/garm-ai/garm-ai/topology"
)

func manifestWith(entries ...topology.Entry) topology.Manifest {
	return topology.Manifest{Generation: 3, Entries: entries}
}

// An account holding more credentials than the threshold is named: rotating
// its signing key reissues all of them, and the warning is the moment to shard
// before that is painful. At or under the threshold, silence.
func TestAnAccountPastTheCredentialThresholdIsWarned(t *testing.T) {
	now := time.Date(2026, 10, 6, 12, 0, 0, 0, time.UTC)
	far := now.Add(300 * 24 * time.Hour).Unix()
	m := manifestWith(
		topology.Entry{Name: "a", Account: "TOOLS", ExpiresAt: far},
		topology.Entry{Name: "b", Account: "TOOLS", ExpiresAt: far},
		topology.Entry{Name: "c", Account: "TOOLS", ExpiresAt: far},
		topology.Entry{Name: "rund", Account: "GARM", ExpiresAt: far},
	)
	w := topology.Warnings(m, now, 2, 90*24*time.Hour)
	if len(w) != 1 || !strings.Contains(w[0], "TOOLS holds 3 credentials") || !strings.Contains(w[0], "shard") {
		t.Fatalf("warnings: %q", w)
	}
	if w := topology.Warnings(m, now, 3, 90*24*time.Hour); len(w) != 0 {
		t.Fatalf("at the threshold: %q", w)
	}
}

// Credentials expiring inside the window are counted and the earliest is
// named with its date -- nothing renews a credential, so this is the only
// notice an operator gets. Outside the window, silence.
func TestCredentialsExpiringInsideTheWindowAreWarnedNamingTheEarliest(t *testing.T) {
	now := time.Date(2026, 10, 6, 12, 0, 0, 0, time.UTC)
	m := manifestWith(
		topology.Entry{Name: "rund", Account: "GARM", ExpiresAt: now.Add(40 * 24 * time.Hour).Unix()},
		topology.Entry{Name: "studio", Account: "CALLER-studio", ExpiresAt: now.Add(12 * 24 * time.Hour).Unix()},
		topology.Entry{Name: "ops", Account: "SYS", ExpiresAt: now.Add(200 * 24 * time.Hour).Unix()},
	)
	w := topology.Warnings(m, now, 1000, 90*24*time.Hour)
	if len(w) != 1 || !strings.Contains(w[0], "2 credentials expire within 90 days") || !strings.Contains(w[0], "studio on 2026-10-18") {
		t.Fatalf("warnings: %q", w)
	}
	if w := topology.Warnings(m, now, 1000, 10*24*time.Hour); len(w) != 0 {
		t.Fatalf("outside the window: %q", w)
	}
}

// A credential already past its expiry is said separately: it is not a
// warning about the future, it is a process that cannot reconnect.
func TestAnExpiredCredentialIsSaidPlainly(t *testing.T) {
	now := time.Date(2026, 10, 6, 12, 0, 0, 0, time.UTC)
	m := manifestWith(topology.Entry{Name: "rund", Account: "GARM", ExpiresAt: now.Add(-time.Hour).Unix()})
	w := topology.Warnings(m, now, 1000, 90*24*time.Hour)
	if len(w) != 1 || !strings.Contains(w[0], "1 credential has EXPIRED") || !strings.Contains(w[0], "rund") {
		t.Fatalf("warnings: %q", w)
	}
}

// An entry with no recorded expiry (a manifest from before the field) is named
// rather than silently treated as never expiring.
func TestAnEntryWithoutARecordedExpiryIsNamed(t *testing.T) {
	now := time.Date(2026, 10, 6, 12, 0, 0, 0, time.UTC)
	m := manifestWith(topology.Entry{Name: "legacy", Account: "GARM"})
	w := topology.Warnings(m, now, 1000, 90*24*time.Hour)
	if len(w) != 1 || !strings.Contains(w[0], "legacy") || !strings.Contains(w[0], "no recorded expiry") {
		t.Fatalf("warnings: %q", w)
	}
}
