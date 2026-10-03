package natsconn_test

import (
	"testing"

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
	if got := err.Error(); !contains(got, "--creds") {
		t.Errorf("the error does not name --creds: %v", err)
	}
}

func contains(s, sub string) bool {
	return len(s) >= len(sub) && (s == sub || len(sub) == 0 || indexOf(s, sub) >= 0)
}

func indexOf(s, sub string) int {
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return i
		}
	}
	return -1
}
