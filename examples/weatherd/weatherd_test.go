package weatherd_test

import (
	"context"
	"testing"

	weatherv1 "github.com/garm-ai/garm-ai/examples/gen/weather/v1"
	"github.com/garm-ai/garm-ai/examples/weatherd"
)

func TestTheExampleAnswers(t *testing.T) {
	out, err := weatherd.Service{}.GetForecast(context.Background(),
		&weatherv1.GetForecastRequest{Place: "Ghent", Days: 3})
	if err != nil {
		t.Fatalf("GetForecast: %v", err)
	}
	if out.GetSummary() == "" || out.GetHighCelsius() == 0 {
		t.Fatalf("the example answered nothing useful: %v", out)
	}
}

func TestTheExampleRefusesAnEmptyPlace(t *testing.T) {
	if _, err := (weatherd.Service{}).GetForecast(context.Background(),
		&weatherv1.GetForecastRequest{}); err == nil {
		t.Fatal("GetForecast accepted an empty place")
	}
}

// The declared NAME, read off the generated list rather than retyped. If the
// .proto's name changed, this fails -- which is what stops the guide's prose from
// citing a name the tree no longer declares.
func TestTheServiceAnswersTheDeclaredName(t *testing.T) {
	want := "weather.v1.get_forecast"
	if got := weatherv1.WeatherServiceTools; len(got) != 1 || got[0] != want {
		t.Fatalf("WeatherServiceTools is %v, want exactly [%s]", got, want)
	}
}
