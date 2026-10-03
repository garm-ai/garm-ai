# Images resolve from a file, an S3 bucket, or a release asset

**Decision.** Three schemes, and a digest that is required for two of them.

```yaml
schema: v1
images:
  - uri: file://build/image.binpb
  - uri: s3://garm/images/accounts-v1.2.0.binpb
    sha256: 9f2c…
  - uri: https://github.com/acme/screening/releases/download/v1.4.0/screening.binpb
    sha256: 4a81…
```

**A git tag resolves as the `https://` form.** The URL already encodes the tag, so
there is no git client, no clone, and no credentials beyond whatever the forge
wants.

**Rejected, for now:** a `git+` fetcher that clones and reads a path from a tree. It
earns its place only if somebody's image is not published as an asset.

**`sha256` is required for remote and optional for `file://`.** The asymmetry
matches where the trust boundary is. An S3 object and a release asset can both be
replaced in place, so a remote URI without a digest pins a *location* and not bytes.
A local file is already in the tree under the same review as the code, and a digest
to update on every rebuild is friction people route around.

**It is checked at load and verified before unmarshalling.** A digest that only runs
on bytes which happened to parse is a digest protecting the easy case. The test for
this asserts the error does **not** mention `FileDescriptorSet`, which is how it
proves the order.
