// forecast is a caller. It knows a tool's NAME and nothing else.
//
// Compare it with examples/cmd/weatherd: that one declares no subject either, and
// between them sits rund. Neither end names the other.
package main

import (
	"context"
	"flag"
	"fmt"
	"io"
	"os"

	"github.com/nats-io/nats.go"

	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	"github.com/garm-ai/garm-ai/natscall"
	"github.com/garm-ai/garm-ai/natsconn"
	"github.com/garm-ai/garm-ai/serve"
)

func main() {
	url := flag.String("nats", nats.DefaultURL, "NATS URL")
	creds := flag.String("creds", "", "this caller's credentials file, as `garmctl topology` wrote it")
	ca := flag.String("tls-ca", "", "PEM the server's certificate chains to; empty means the system roots")
	place := flag.String("place", "Ghent", "where")
	days := flag.Int("days", 3, "how many days")
	flag.Parse()
	os.Exit(forecast(*url, natsconn.Options{Creds: *creds, CA: *ca}, *place, *days, os.Stdout, os.Stderr))
}

// forecast is main with its edges passed in, so a test can RUN the example rather
// than only compile it.
//
// It was one closure around os.Exit until an audit found that this example was
// built by CI and never executed -- so "the only two lines that matter" were a
// claim nothing checked. An example nobody runs is documentation that compiles.
func forecast(url string, conn natsconn.Options, place string, days int, stdout, stderr io.Writer) int {
	nc, err := natsconn.Connect(url, conn)
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	defer nc.Close()

	// The only two lines that matter. No subject, no timeout, no catalogue: the
	// deadline is the budget weather.proto declared, which the generated client
	// read from the same declaration rund did.
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: nc})
	out, err := client.GetForecast(context.Background(),
		&weatherv1.GetForecastRequest{Place: place, Days: int32(days)})

	if err != nil {
		// Kind first, because it is what a caller decides on: retry, fix the
		// request, or go and deploy something.
		fmt.Fprintln(stderr, serve.Describe(err))
		return 1
	}
	fmt.Fprintf(stdout, "%s (high %d°C)\n", out.GetSummary(), out.GetHighCelsius())
	return 0
}
