package observe_test

import (
	"context"
	"net/http"
	"testing"
	"time"

	"github.com/garm-ai/garm-ai/observe"
)

// The ctx handed to ServeHealth is honoured: cancelling it takes the listener
// down, so a main that ties it to its signal context needs nothing else. Found
// in review: the first version used ctx only as the requests' base context.
func TestCancellingTheContextStopsTheHealthListener(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	bound, stop, err := observe.ServeHealth(ctx, "127.0.0.1:0", func() bool { return true })
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = stop(context.Background()) })

	resp, err := http.Get("http://" + bound + "/livez")
	if err != nil || resp.StatusCode != 200 {
		t.Fatalf("before cancel: %v %v", err, resp)
	}
	resp.Body.Close()

	cancel()
	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		if _, err := http.Get("http://" + bound + "/livez"); err != nil {
			return // the listener is gone
		}
		time.Sleep(10 * time.Millisecond)
	}
	t.Fatal("the listener still answers after its context was cancelled")
}
