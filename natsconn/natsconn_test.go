package natsconn_test

import (
	"strings"
	"testing"
	"time"

	"github.com/garm-ai/garm-ai/internal/estate"
	"github.com/garm-ai/garm-ai/natsconn"
)

// A command connects with a credential file and a CA file, and with nothing else.
func TestACommandConnectsWithACredsFileAndACA(t *testing.T) {
	e := estate.New(t)
	nc, err := natsconn.Connect(e.URL, natsconn.Options{
		Creds: e.CredsFile(t, estate.RoleCaller), CA: e.CAFile(t),
	})
	if err != nil {
		t.Fatalf("Connect: %v", err)
	}
	defer nc.Close()
	if !nc.IsConnected() {
		t.Fatal("not connected")
	}
}

// Without a credential there is no identity, and the server says so. This is the
// case a command hits when someone forgets --creds, and the error must say what
// was missing rather than 'authorization violation'.
func TestWithoutACredentialTheErrorNamesTheFlag(t *testing.T) {
	e := estate.New(t)
	_, err := natsconn.Connect(e.URL, natsconn.Options{CA: e.CAFile(t)})
	if err == nil {
		t.Fatal("connected with no credential")
	}
	if !strings.Contains(err.Error(), "--creds") {
		t.Errorf("the error does not name --creds: %v", err)
	}
}

// A process can read its own credential's expiry at startup: the estate issues
// one-year credentials, and the date comes back from the file, not from a guess.
func TestCredentialExpiryIsReadFromTheFile(t *testing.T) {
	e := estate.New(t)
	exp, err := natsconn.CredentialExpiry(e.CredsFile(t, estate.RoleCaller))
	if err != nil {
		t.Fatal(err)
	}
	if left := time.Until(exp); left < 364*24*time.Hour || left > 366*24*time.Hour {
		t.Fatalf("expiry %v is %v away, want about a year", exp, left)
	}
	if _, err := natsconn.CredentialExpiry("/nonexistent.creds"); err == nil {
		t.Fatal("a missing file read as a date")
	}
}
