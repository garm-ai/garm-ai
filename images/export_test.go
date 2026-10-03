package images

// UsePathStyleForTest exposes the path-style decision to the package's external
// test. Exported here rather than in fetch.go so the production surface stays
// the three things a caller needs: Load, Fetch and Merge.
func UsePathStyleForTest(getenv func(string) string) bool { return usePathStyle(getenv) }
