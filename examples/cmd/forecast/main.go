// forecast is a caller. It knows a tool's NAME and nothing else.
//
// Compare it with examples/cmd/weatherd: that one declares no subject either, and
// between them sits rund. Neither end names the other.
package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"os"

	"github.com/nats-io/nats.go"

	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	"github.com/garm-ai/garm-ai/natscall"
	"github.com/garm-ai/garm-ai/serve"
)

func main() {
	url := flag.String("nats", nats.DefaultURL, "NATS URL")
	place := flag.String("place", "Ghent", "where")
	days := flag.Int("days", 3, "how many days")
	flag.Parse()

	nc, err := nats.Connect(*url)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	defer nc.Close()

	// The only two lines that matter. No subject, no timeout, no catalogue: the
	// deadline is the budget weather.proto declared, which the generated client
	// read from the same declaration rund did.
	client := weatherv1.NewWeatherServiceClient(natscall.Client{NC: nc})
	out, err := client.GetForecast(context.Background(),
		&weatherv1.GetForecastRequest{Place: *place, Days: int32(*days)})

	if err != nil {
		// The KIND first, because it is what a caller decides on: retry, fix the
		// request, or go and deploy something.
		var e *serve.Error
		if errors.As(err, &e) {
			fmt.Fprintf(os.Stderr, "%s: %s\n", serve.Code(e.Kind), e.Message)
		} else {
			fmt.Fprintln(os.Stderr, err)
		}
		os.Exit(1)
	}
	fmt.Printf("%s (high %d°C)\n", out.GetSummary(), out.GetHighCelsius())
}
