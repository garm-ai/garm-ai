// Package weatherd is everything a tool author writes.
//
// Compare it with examples/gen/weather/v1/weather_garm.pb.go, which is
// everything they do not. There is no subject here, no marshalling, no broker, no
// registration table and no error mapping -- one method, taking a request and
// returning a response.
//
// The guide in docs/guide.md walks through this file. It is compiled by
// `mise run ci`, so it cannot drift from what the generator emits: rename the
// tool's method in the .proto and this package stops building.
package weatherd

import (
	"context"
	"fmt"

	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
)

// Service answers the weather tools.
type Service struct{}

// GetForecast answers "weather.v1.get_forecast".
//
// The tool's NAME appears nowhere in this file. It is in the .proto, the
// generator read it there, and the generated Serve function is what mounts it --
// so there is exactly one place the identity is written, and no second spelling
// to keep in step. A handler that hard-coded its own name would be the second.
func (Service) GetForecast(_ context.Context, in *weatherv1.GetForecastRequest) (*weatherv1.GetForecastResponse, error) {
	// A plain error, not a status code. The transport maps it; a tool author who
	// had to choose a code would be choosing one per transport.
	if in.GetPlace() == "" {
		return nil, fmt.Errorf("place is required")
	}
	days := in.GetDays()
	if days == 0 {
		days = 1
	}
	return &weatherv1.GetForecastResponse{
		Summary:     fmt.Sprintf("%d day(s) over %s: clear", days, in.GetPlace()),
		HighCelsius: 21,
	}, nil
}

// The one line that makes the example an example rather than a claim. Add a tool
// to weather.proto and this assignment fails to compile until Service answers it,
// which is the whole property the generator exists to give a tool author.
var _ weatherv1.WeatherServiceHandler = Service{}
