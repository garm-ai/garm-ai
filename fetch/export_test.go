package fetch

// UsePathStyleForTest exposes the path-style decision to the package's external
// test. Exported here rather than in fetch.go so the production surface stays the
// two things a caller needs: a Resolver and Get.
func UsePathStyleForTest(getenv func(string) string) bool { return usePathStyle(getenv) }
