package main

import (
	"strings"
	"testing"

	"github.com/garm-ai/garm-ai/internal/estate"
)

// An issuance says when an account holds more credentials than the threshold:
// the moment to shard, before a rotation of that account is painful. The
// threshold is a flag; at its default the estate is far below it and silent.
func TestAnIssuanceWarnsPastTheAccountThreshold(t *testing.T) {
	e := estate.New(t)
	keys, manifest, out := keysFromEstate(t, e)
	_, stderr, err := runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", estateCallers,
		"--warn-account-credentials", "1", "--out", out)...)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(stderr, "holds") || !strings.Contains(stderr, "shard") {
		t.Fatalf("no account warning at threshold 1:\n%s", stderr)
	}
	_, stderr, err = runTopology(t, append(catalogueArgs(e), "--keys", keys, "--manifest", manifest, "--callers", estateCallers, "--out", out)...)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(stderr, "holds") {
		t.Fatalf("an account warning at the default threshold:\n%s", stderr)
	}
}

// --status says which credentials expire inside the window, naming the
// earliest with its date; the estate's one-year credentials are inside a
// 400-day window and outside a 90-day one.
func TestStatusWarnsOnExpiryInsideTheWindow(t *testing.T) {
	e := estate.New(t)
	keys, manifest, _ := keysFromEstate(t, e)
	stdout, stderr, err := runTopology(t, "--status", "--keys", keys, "--manifest", manifest, "--warn-expiry-days", "400")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(stderr, "expire within 400 days") || !strings.Contains(stderr, "the earliest is") {
		t.Fatalf("no expiry warning inside the window:\nstdout=%s\nstderr=%s", stdout, stderr)
	}
	_, stderr, err = runTopology(t, "--status", "--keys", keys, "--manifest", manifest)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(stderr, "expire within") {
		t.Fatalf("an expiry warning outside the default window:\n%s", stderr)
	}
}
