# There is no config file of our own

**Decision.** No `garm.yaml`. Credentials, region and endpoint resolve the standard
AWS way: `AWS_*` variables, `~/.aws/config`, instance roles.

**Why.** Those are already an environment-level concern with a standard resolution
order. A file of our own duplicating them is a second place to look when it does not
work — and the expensive failures in the estate this replaces were config claiming
one thing while reality did another.

## The decision this forced into the open

**Path-style S3 addressing is derived, not hardcoded.** It follows from whether a
custom endpoint is configured:

```go
func usePathStyle(getenv func(string) string) bool {
	return getenv("AWS_ENDPOINT_URL_S3") != "" || getenv("AWS_ENDPOINT_URL") != ""
}
```

An earlier revision set it to `true` unconditionally, because the old estate's local
plane runs an S3-compatible store. That is a deployment-specific choice made
invisibly, and it is wrong against real AWS, where path-style is deprecated.

**The fix shipped without a test and that was caught by asking.** It is extracted as
a function taking `getenv` precisely so the test can prove it fails in **both**
directions — either hardcoded value is wrong for somebody, so a test pinning only
one direction would have let the other regress.
