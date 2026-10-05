package observe

import (
	"context"
	"errors"
	"net"
	"net/http"
	"time"
)

// ServeHealth answers /livez (200 while the process runs) and /readyz (200 while
// ready() is true, else 503) on addr, which may end in :0. It exists because the
// thing that restarts or routes to a process speaks HTTP and holds no NATS
// credential; the bus's own view is $SRV.PING, and natsmicro.Ready is held to
// agree with it (spec §5).
func ServeHealth(ctx context.Context, addr string, ready func() bool) (bound string, stop func(context.Context) error, err error) {
	ln, err := net.Listen("tcp", addr)
	if err != nil {
		return "", nil, err
	}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /livez", func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusOK) })
	mux.HandleFunc("GET /readyz", func(w http.ResponseWriter, _ *http.Request) {
		if ready() {
			w.WriteHeader(http.StatusOK)
			return
		}
		w.WriteHeader(http.StatusServiceUnavailable)
	})
	srv := &http.Server{
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		BaseContext:       func(net.Listener) context.Context { return ctx },
	}
	go func() { _ = srv.Serve(ln) }()
	return ln.Addr().String(), func(ctx context.Context) error {
		if err := srv.Shutdown(ctx); err != nil && !errors.Is(err, http.ErrServerClosed) {
			return err
		}
		return nil
	}, nil
}
