package natsserve

import "regexp"

// Copied from nats.go's micro package, which does not export them.
//
// Copied deliberately rather than approximated: New exists to refuse a Config
// micro would reject, and a looser pattern here would let a process start and fail
// at AddService instead. A test asserts micro agrees, so a change on their side
// shows up as a failure rather than as a divergence nobody notices.
var (
	microName = regexp.MustCompile(`^[A-Za-z0-9\-_]+$`)
	semver    = regexp.MustCompile(`^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$`)
)
