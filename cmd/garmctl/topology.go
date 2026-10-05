package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/nats-io/jwt/v2"
	"github.com/nats-io/nkeys"
	"github.com/spf13/cobra"

	"github.com/garm-ai/garm-ai/catalogue"
	"github.com/garm-ai/garm-ai/fetch"
	"github.com/garm-ai/garm-ai/internal/devtls"
	"github.com/garm-ai/garm-ai/topology"
)

func topologyCmd() *cobra.Command {
	var (
		catURI, catSHA, catDir string
		callers                []string
		keysDir, manifestPath  string
		first, dev, rotate     bool
		out                    string
	)
	cmd := &cobra.Command{
		Use:   "topology",
		Short: "Emit the NATS operator-mode topology the catalogue implies",
		Long: "topology reads the catalogue and the issuance manifest and writes the\n" +
			"operator, every account, one credential per process, and the\n" +
			"revocations a removal requires. The same generator the tests run.\n\n" +
			"KEYS ARE AN INPUT. --keys names a directory of seeds the generator signs\n" +
			"with and never produces; a deployment keeps that directory where the\n" +
			"spec's §5.1 says. --dev mints throwaway keys instead, and says so.\n\n" +
			"THE MANIFEST IS REQUIRED. It is the previous topology, and a removal is\n" +
			"only visible as a difference against it. A missing manifest is refused;\n" +
			"a first issuance says --first on purpose, and --first against an\n" +
			"existing manifest is refused, because it would forget what was issued.",
		RunE: func(cmd *cobra.Command, _ []string) error {
			if catURI == "" || out == "" {
				return errors.New("--catalogue and --out are required")
			}
			if !dev && (keysDir == "" || manifestPath == "") {
				return errors.New("--keys and --manifest are required (or --dev for a throwaway topology)")
			}
			cat, err := catalogue.Load(context.Background(), &fetch.Resolver{Dir: catDir},
				fetch.Artefact{URI: catURI, SHA256: catSHA})
			if err != nil {
				return err
			}

			var keys topology.Keys
			var previous *topology.Manifest
			switch {
			case dev:
				keys = topology.FreshKeys(callers)
				previous = topology.Empty()
				fmt.Fprintln(cmd.ErrOrStderr(),
					"--dev: minting THROWAWAY keys and writing them beside the output; never deploy these")
			default:
				keys, err = readKeys(keysDir, callers)
				if err != nil {
					return err
				}
				opPub, err := keys.Operator.PublicKey()
				if err != nil {
					return err
				}
				_, statErr := os.Stat(manifestPath)
				switch {
				case statErr != nil && !errors.Is(statErr, fs.ErrNotExist):
					// Only "does not exist" means absent. Anything else -- a path under
					// a file, a permission -- is a manifest that may well exist and
					// cannot be read, and the one thing NOT to say is "pass --first".
					return fmt.Errorf("cannot read the manifest at %s: %w", manifestPath, statErr)
				case statErr == nil && first:
					return fmt.Errorf("%s exists; --first would forget every credential it records", manifestPath)
				case statErr == nil:
					if previous, err = topology.Load(manifestPath, opPub); err != nil {
						return err
					}
				case first:
					previous = topology.Empty()
				default:
					return fmt.Errorf("no manifest at %s: the generator refuses to run without the previous topology, "+
						"because a removal is only visible as a difference. For a FIRST issuance pass --first", manifestPath)
				}
			}

			res, err := topology.Generate(topology.Input{
				Catalogue: cat, Callers: callers, Previous: previous, Keys: keys, Now: time.Now(),
				Rotate: rotate,
			})
			if err != nil {
				return err
			}
			// The manifest FIRST. A manifest entry for a credential that then never
			// reaches disk yields a harmless revocation on the next run; a credential
			// on disk that no manifest records is one nothing will ever revoke. Found
			// in review, with the order the other way round.
			if !dev {
				if err := res.Manifest.Save(manifestPath, keys.Operator); err != nil {
					return err
				}
			}
			if err := writeOutput(out, res, keys.Operator); err != nil {
				return err
			}
			if dev {
				if err := writeKeys(filepath.Join(out, "keys"), keys); err != nil {
					return err
				}
				if err := writeDevServer(out, res); err != nil {
					return err
				}
			}
			fmt.Fprintf(cmd.OutOrStdout(),
				"ok: generation %d from catalogue %s -- %d accounts, %d credentials, %d revocations, written to %s\n",
				res.Manifest.Generation, cat.SHA256[:12], len(res.Accounts), len(res.Credentials), len(res.Revoke), out)
			return nil
		},
	}
	cmd.Flags().StringVar(&catURI, "catalogue", "", "catalogue URI: file://, s3:// or https://")
	cmd.Flags().StringVar(&catSHA, "catalogue-sha256", "", "hex digest the catalogue must have; REQUIRED for remote")
	cmd.Flags().StringVar(&catDir, "catalogue-dir", ".", "what a relative file:// catalogue resolves against")
	cmd.Flags().StringSliceVar(&callers, "callers", nil, "caller accounts to issue, by name: studio,batch-x")
	cmd.Flags().StringVar(&keysDir, "keys", "", "directory of signing seeds: operator.nk and <ACCOUNT>.nk")
	cmd.Flags().StringVar(&manifestPath, "manifest", "", "the issuance manifest; read as the previous topology, written back after")
	cmd.Flags().BoolVar(&first, "first", false, "this is the first issuance and there is no manifest yet")
	cmd.Flags().BoolVar(&dev, "dev", false, "mint throwaway keys for a local estate; never for a deployment")
	cmd.Flags().BoolVar(&rotate, "rotate", false, "reissue EVERY credential and revoke every previous one; otherwise only what changed is issued")
	cmd.Flags().StringVarP(&out, "out", "o", "", "directory to write the topology into")
	return cmd
}

// readKeys loads the seeds a deployment keeps. Each file is one seed, as nsc
// writes them; the generator never produces one.
func readKeys(dir string, callers []string) (topology.Keys, error) {
	read := func(name string) (nkeys.KeyPair, error) {
		raw, err := os.ReadFile(filepath.Join(dir, name+".nk"))
		if err != nil {
			return nil, fmt.Errorf("signing key %s: %w", name, err)
		}
		kp, err := nkeys.FromSeed(bytes.TrimSpace(raw))
		if err != nil {
			return nil, fmt.Errorf("signing key %s: %w", name, err)
		}
		return kp, nil
	}
	k := topology.Keys{Accounts: map[string]nkeys.KeyPair{}}
	var err error
	if k.Operator, err = read("operator"); err != nil {
		return k, err
	}
	names := []string{topology.AccountSYS, topology.AccountGARM, topology.AccountTOOLS}
	for _, c := range callers {
		names = append(names, topology.CallerPrefix+c)
	}
	for _, n := range names {
		if k.Accounts[n], err = read(n); err != nil {
			return k, err
		}
	}
	return k, nil
}

// writeKeys is --dev only: it puts seeds on disk, which is exactly what a
// deployment must never let this command do.
func writeKeys(dir string, k topology.Keys) error {
	if err := os.MkdirAll(dir, 0o700); err != nil {
		return err
	}
	write := func(name string, kp nkeys.KeyPair) error {
		seed, err := kp.Seed()
		if err != nil {
			return err
		}
		return os.WriteFile(filepath.Join(dir, name+".nk"), seed, 0o600)
	}
	if err := write("operator", k.Operator); err != nil {
		return err
	}
	for name, kp := range k.Accounts {
		if err := write(name, kp); err != nil {
			return err
		}
	}
	return nil
}

// writeOutput lays the topology out as files a deployment applies: the operator,
// one JWT per account, one creds file per process, the revocations, and a signed
// copy of the manifest (the committed one is written by the caller).
func writeOutput(dir string, res *topology.Output, signer nkeys.KeyPair) error {
	for _, sub := range []string{"accounts", "creds"} {
		if err := os.MkdirAll(filepath.Join(dir, sub), 0o700); err != nil {
			return err
		}
	}
	if err := res.Manifest.Save(filepath.Join(dir, "manifest.json"), signer); err != nil {
		return err
	}
	if err := os.WriteFile(filepath.Join(dir, "operator.jwt"), []byte(res.OperatorJWT), 0o600); err != nil {
		return err
	}
	for name, encoded := range res.Accounts {
		if err := os.WriteFile(filepath.Join(dir, "accounts", name+".jwt"), []byte(encoded), 0o600); err != nil {
			return err
		}
	}
	for _, c := range res.Credentials {
		body, err := jwt.FormatUserConfig(c.JWT, []byte(c.Seed))
		if err != nil {
			return fmt.Errorf("credential %s: %w", c.Name, err)
		}
		if err := os.WriteFile(filepath.Join(dir, "creds", c.Name+".creds"), body, 0o600); err != nil {
			return err
		}
	}
	// A retired credential's file is the one artefact a deployment must stop
	// deploying, and --out accumulates across generations -- so it is removed
	// here, by the name the revocation carries. A superseded one is overwritten
	// above under the same name; a carried-forward one is untouched.
	for _, r := range res.Revoke {
		if strings.HasPrefix(r.Why, "retired") {
			if err := os.Remove(filepath.Join(dir, "creds", r.Name+".creds")); err != nil && !errors.Is(err, fs.ErrNotExist) {
				return fmt.Errorf("removing the retired credential %s: %w", r.Name, err)
			}
		}
	}
	rev, err := json.MarshalIndent(res.Revoke, "", "  ")
	if err != nil {
		return err
	}
	if res.Revoke == nil {
		rev = []byte("[]")
	}
	if err := os.WriteFile(filepath.Join(dir, "revocations.json"), rev, 0o600); err != nil {
		return err
	}
	// callers.json is PUBLIC -- name -> account key, both already in the account
	// JWTs -- and 0o644 says so beside the 0o600 credentials. rund takes it as
	// --callers to label spans and counters with a name a person can read.
	names, err := topology.CallerNames(res)
	if err != nil {
		return err
	}
	callers, err := json.MarshalIndent(names, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(dir, "callers.json"), callers, 0o644)
}

// writeDevServer is --dev only: a server configuration a reader can start, and
// the self-signed certificate it refers to. The memory resolver with every
// account preloaded is the simplest server that honours the topology; a
// deployment runs the full resolver and its own CA, and the guide says so.
func writeDevServer(dir string, res *topology.Output) error {
	certPEM, keyPEM, err := devtls.SelfSigned(24*time.Hour, "127.0.0.1", "localhost")
	if err != nil {
		return err
	}
	for name, body := range map[string][]byte{"server.pem": certPEM, "server-key.pem": keyPEM, "ca.pem": certPEM} {
		if err := os.WriteFile(filepath.Join(dir, name), body, 0o600); err != nil {
			return err
		}
	}
	abs, err := filepath.Abs(dir)
	if err != nil {
		return err
	}
	var sysPub string
	var preload strings.Builder
	names := make([]string, 0, len(res.Accounts))
	for name := range res.Accounts {
		names = append(names, name)
	}
	sort.Strings(names)
	for _, name := range names {
		ac, err := jwt.DecodeAccountClaims(res.Accounts[name])
		if err != nil {
			return err
		}
		if name == topology.AccountSYS {
			sysPub = ac.Subject
		}
		fmt.Fprintf(&preload, "  %s: %q\n", ac.Subject, res.Accounts[name])
	}
	conf := fmt.Sprintf(`# Written by garmctl topology --dev: a LOCAL server for the topology beside it.
# A deployment runs the full resolver and a certificate from its own CA; this is
# the memory resolver with every account preloaded, and a self-signed cert.
listen: 127.0.0.1:4222
operator: %q
system_account: %s
resolver: MEMORY
resolver_preload: {
%s}
tls {
  cert_file: %q
  key_file: %q
}
`, filepath.Join(abs, "operator.jwt"), sysPub, preload.String(),
		filepath.Join(abs, "server.pem"), filepath.Join(abs, "server-key.pem"))
	return os.WriteFile(filepath.Join(dir, "nats-server.conf"), []byte(conf), 0o600)
}
