package estate

import (
	"crypto/tls"
	"crypto/x509"
	"testing"
	"time"

	"github.com/garm-ai/garm-ai/internal/devtls"
)

// tlsPair is a self-signed server certificate, a client config that trusts it,
// and the CA as PEM for a command that takes a file. Tests run TLS because
// production requires it (spec §6), and the configuration that is tested must be
// the configuration that is deployed. The certificate itself comes from devtls,
// which `garmctl topology --dev` also uses -- the second consumer.
func tlsPair(t *testing.T) (server *tls.Config, client *tls.Config, caPEM []byte) {
	t.Helper()
	certPEM, keyPEM, err := devtls.SelfSigned(time.Hour, "127.0.0.1")
	if err != nil {
		t.Fatal(err)
	}
	cert, err := tls.X509KeyPair(certPEM, keyPEM)
	if err != nil {
		t.Fatal(err)
	}
	pool := x509.NewCertPool()
	if !pool.AppendCertsFromPEM(certPEM) {
		t.Fatal("the self-signed certificate did not parse")
	}
	return &tls.Config{Certificates: []tls.Certificate{cert}, MinVersion: tls.VersionTLS13},
		&tls.Config{RootCAs: pool, ServerName: "127.0.0.1", MinVersion: tls.VersionTLS13},
		certPEM
}
