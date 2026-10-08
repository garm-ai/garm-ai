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
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nkeys"
	"github.com/spf13/cobra"

	"github.com/garm-ai/garm-ai/catalogue"
	"github.com/garm-ai/garm-ai/fetch"
	"github.com/garm-ai/garm-ai/internal/devtls"
	"github.com/garm-ai/garm-ai/natsconn"
	"github.com/garm-ai/garm-ai/topology"
)

func topologyCmd() *cobra.Command {
	var (
		catURI, catSHA, catDir string
		callers                []string
		keysDir, keysOut       string
		manifestPath           string
		first, dev, rotate     bool
		out                    string
		rotateSigning          []string
		status, verifyLive     bool
		warnAccount            int
		warnExpiryDays         int
		noVerifyLive           bool
		servers                int
		natsURL, opsCreds, ca  string
		listen, monitor        string
	)
	cmd := &cobra.Command{
		Use:   "topology",
		Short: "Emit the NATS operator-mode topology the catalogue implies",
		Long: "topology reads the catalogue and the issuance manifest and writes the\n" +
			"operator, every account, one credential per process, and the\n" +
			"revocations a removal requires. The same generator the tests run.\n\n" +
			"THE ROOT IS NEVER HERE. --keys names the directory `garmctl operator init`\n" +
			"wrote under keys/: the root-signed operator.jwt, operator-signing.nk, and\n" +
			"each account's <ACCOUNT>.pub and <ACCOUNT>.signing.nk. A new caller's keys\n" +
			"are born here and written to --keys-out (default --keys; a scratch path\n" +
			"where --keys is a read-only mount). --dev mints a throwaway operator and\n" +
			"discards its root, and says so.\n\n" +
			"THE MANIFEST IS REQUIRED. It is the previous topology, and a removal is\n" +
			"only visible as a difference against it. A missing manifest is refused;\n" +
			"a first issuance says --first on purpose, and --first against an\n" +
			"existing manifest is refused, because it would forget what was issued.",
		RunE: func(cmd *cobra.Command, _ []string) error {
			if status {
				if catURI != "" || out != "" || first || dev || rotate || verifyLive || noVerifyLive || len(rotateSigning) > 0 || len(callers) > 0 {
					return errors.New("--status takes --keys and --manifest and nothing else; it issues nothing, so an issuance flag beside it would be silently ignored")
				}
				return printStatus(cmd, keysDir, manifestPath, warnAccount, warnExpiryDays)
			}
			if catURI == "" || out == "" {
				return errors.New("--catalogue and --out are required")
			}
			// They shape the server configuration only --dev writes. Accepted
			// without it they would do nothing, which is the one thing a flag
			// must never do.
			if !dev {
				for flag, set := range map[string]bool{"--listen": cmd.Flags().Changed("listen"), "--monitor": cmd.Flags().Changed("monitor")} {
					if set {
						return fmt.Errorf("%s shapes the nats-server.conf that only --dev writes; without --dev it would be silently ignored", flag)
					}
				}
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
					"--dev: minting a THROWAWAY operator (its root discarded) and keys, written beside the output; never deploy these")
			default:
				keys, err = readKeys(keysDir, callers)
				if err != nil {
					return err
				}
				// The manifest may be signed by any key the operator JWT lists -- so a
				// manifest signed before the operator signing key was replaced still
				// loads while the old key is listed (review finding 6).
				opClaims, err := jwt.DecodeOperatorClaims(keys.OperatorJWT)
				if err != nil {
					return fmt.Errorf("the operator JWT: %w", err)
				}
				signers := []string(opClaims.SigningKeys)
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
					if previous, err = topology.Load(manifestPath, signers...); err != nil {
						return err
					}
				case first:
					previous = topology.Empty()
				default:
					return fmt.Errorf("no manifest at %s: the generator refuses to run without the previous topology, "+
						"because a removal is only visible as a difference. For a FIRST issuance pass --first", manifestPath)
				}
			}

			// Step two of a rotation retires a key, and that is a DECISION, not a
			// side effect of the next catalogue bump: it needs --verify-live, which
			// asks the bus (spec §4), or --no-verify-live said on purpose. Found in
			// review: a routine issuance aimed at another account retired the key.
			wouldRetire := retiringKeys(previous, rotateSigning)
			switch {
			case len(wouldRetire) == 0:
				// nothing to decide
			case verifyLive && noVerifyLive:
				return errors.New("--verify-live and --no-verify-live together make no sense")
			case verifyLive:
				if err := verifyNothingLiveOnRetiringKeys(wouldRetire, natsURL, opsCreds, ca, servers); err != nil {
					return err
				}
			case noVerifyLive:
				// said on purpose; the retirement is announced below
			default:
				names := make([]string, 0, len(wouldRetire))
				for name := range wouldRetire {
					names = append(names, name)
				}
				sort.Strings(names)
				return fmt.Errorf("this issuance would retire a signing key on %s, which closes every connection still using it; pass --verify-live (asks the cluster first) or --no-verify-live (you have checked the rollout yourself)",
					strings.Join(names, ", "))
			}
			// A credential whose file never landed -- an output that failed after
			// the manifest was saved -- is reissued, by name, and said so. Only in
			// an output directory that has credentials at all: a fresh --out is a
			// new place, not a partial failure, and reissuing everything into it
			// would restart every process for nothing.
			var reissue []string
			if _, statErr := os.Stat(filepath.Join(out, "creds")); !dev && previous != nil && statErr == nil {
				for _, e := range previous.Entries {
					if _, statErr := os.Stat(filepath.Join(out, "creds", e.Name+".creds")); errors.Is(statErr, fs.ErrNotExist) {
						reissue = append(reissue, e.Name)
					}
				}
			}
			res, err := topology.Generate(topology.Input{
				Catalogue: cat, Callers: callers, Previous: previous, Keys: keys, Now: time.Now(),
				Rotate: rotate, RotateSigning: rotateSigning, Reissue: reissue,
			})
			if err != nil {
				return err
			}
			for _, name := range reissue {
				fmt.Fprintf(cmd.OutOrStdout(), "%s: credential file was missing; reissued\n", name)
			}
			for _, r := range res.Retired {
				fmt.Fprintf(cmd.OutOrStdout(), "%s: retired signing key %s; every credential it signed is now refused\n", r.Account, r.Key)
			}
			for name, rec := range res.Manifest.Accounts {
				if rec.Retiring != "" {
					fmt.Fprintf(cmd.ErrOrStderr(), "%s: signing key retiring; the old key %s is still listed -- roll the new credentials out, then run an issuance with --verify-live to retire it\n", name, rec.Retiring)
				}
			}
			// New account keys FIRST, then the manifest, then the output. A key that
			// never reached disk is an account nothing can ever issue for again --
			// worse than a manifest entry for a credential that never landed, which
			// is itself worse than a credential no manifest records. Found in review,
			// with the order the other way round.
			if !dev {
				if keysOut == "" {
					keysOut = keysDir
				}
				if err := writeNewKeys(keysOut, keysDir, res.NewKeys, res.Manifest.Accounts); err != nil {
					return err
				}
				if err := res.Manifest.Save(manifestPath, keys.OperatorSigning); err != nil {
					return err
				}
			}
			if err := writeOutput(out, res, keys.OperatorSigning); err != nil {
				return err
			}
			if dev {
				if err := writeKeys(filepath.Join(out, "keys"), keys); err != nil {
					return err
				}
				if err := writeDevServer(out, res, listen, monitor); err != nil {
					return err
				}
			}
			fmt.Fprintf(cmd.OutOrStdout(),
				"ok: generation %d from catalogue %s -- %d accounts, %d credentials, %d revocations, written to %s\n",
				res.Manifest.Generation, cat.SHA256[:12], len(res.Accounts), len(res.Credentials), len(res.Revoke), out)
			printWarnings(cmd, res.Manifest, warnAccount, warnExpiryDays)
			return nil
		},
	}
	cmd.Flags().StringVar(&catURI, "catalogue", "", "catalogue URI: file://, s3:// or https://")
	cmd.Flags().StringVar(&catSHA, "catalogue-sha256", "", "hex digest the catalogue must have; REQUIRED for remote")
	cmd.Flags().StringVar(&catDir, "catalogue-dir", ".", "what a relative file:// catalogue resolves against")
	cmd.Flags().StringSliceVar(&callers, "callers", nil, "caller accounts to issue, by name: studio,batch-x")
	cmd.Flags().StringVar(&keysDir, "keys", "", "directory operator init wrote under keys/: operator.jwt, operator-signing.nk, <ACCOUNT>.pub, <ACCOUNT>.signing.nk")
	cmd.Flags().StringVar(&keysOut, "keys-out", "", "where a new account's keys are written; default --keys (use a scratch path when --keys is read-only)")
	cmd.Flags().StringVar(&manifestPath, "manifest", "", "the issuance manifest; read as the previous topology, written back after")
	cmd.Flags().BoolVar(&first, "first", false, "this is the first issuance and there is no manifest yet")
	cmd.Flags().BoolVar(&dev, "dev", false, "mint throwaway keys for a local estate; never for a deployment")
	cmd.Flags().StringVar(&listen, "listen", "127.0.0.1:4222", "--dev only: where the emitted nats-server.conf listens for clients; a laptop has one 4222")
	cmd.Flags().StringVar(&monitor, "monitor", "127.0.0.1:8222", "--dev only: where it serves /healthz; the container config keeps 0.0.0.0:8222, which compose maps")
	cmd.Flags().BoolVar(&rotate, "rotate", false, "reissue EVERY credential and revoke every previous one; otherwise only what changed is issued")
	cmd.Flags().StringSliceVar(&rotateSigning, "rotate-signing", nil, "accounts whose SIGNING KEY is replaced: the new key is listed beside the old and every credential of the account reissued; the next issuance retires the old key")
	cmd.Flags().BoolVar(&status, "status", false, "print the manifest's state -- generation, accounts, any retiring key -- and issue nothing")
	cmd.Flags().IntVar(&warnAccount, "warn-account-credentials", 200, "warn when an account holds more credentials than this: rotating its signing key reissues all of them; 0 disables")
	cmd.Flags().IntVar(&warnExpiryDays, "warn-expiry-days", 90, "warn about credentials expiring within this many days, naming the earliest; nothing renews a credential; 0 disables")
	cmd.Flags().BoolVar(&verifyLive, "verify-live", false, "before retiring a signing key, ask the cluster (with --ops-creds) and refuse if any live connection still uses it")
	cmd.Flags().BoolVar(&noVerifyLive, "no-verify-live", false, "retire a signing key WITHOUT asking the cluster; you have checked the rollout yourself")
	cmd.Flags().IntVar(&servers, "servers", 1, "how many servers must answer --verify-live; fewer is refused")
	cmd.Flags().StringVar(&natsURL, "nats", "", "NATS URL, for --verify-live")
	cmd.Flags().StringVar(&opsCreds, "ops-creds", "", "the ops credential, for --verify-live")
	cmd.Flags().StringVar(&ca, "tls-ca", "", "PEM the server's certificate chains to, for --verify-live")
	cmd.Flags().StringVarP(&out, "out", "o", "", "directory to write the topology into")
	return cmd
}

// readKeys loads what the issuance environment keeps: the root-signed operator
// JWT, the operator signing seed, and each known account's identity public key
// and signing seed. An account with no .pub is NEW and left for Generate to mint.
func readKeys(dir string, callers []string) (topology.Keys, error) {
	// The one file that must NOT be here. Checked before anything is read, so a
	// copied-over ceremony directory is refused by name rather than used.
	if _, err := os.Stat(filepath.Join(dir, "root.nk")); err == nil {
		return topology.Keys{}, fmt.Errorf("%s holds root.nk: the root must never be where topology runs; it belongs in custody (operator init wrote it under root/)", dir)
	}
	k := topology.Keys{Accounts: map[string]topology.AccountKeys{}}
	raw, err := os.ReadFile(filepath.Join(dir, "operator.jwt"))
	if err != nil {
		return k, fmt.Errorf("the operator JWT: %w", err)
	}
	k.OperatorJWT = string(bytes.TrimSpace(raw))
	if k.OperatorSigning, err = readSeed(filepath.Join(dir, "operator-signing.nk")); err != nil {
		return k, fmt.Errorf("the operator signing key: %w", err)
	}
	names := []string{topology.AccountSYS, topology.AccountGARM, topology.AccountTOOLS}
	for _, c := range callers {
		names = append(names, topology.CallerPrefix+c)
	}
	for _, n := range names {
		pub, err := os.ReadFile(filepath.Join(dir, n+".pub"))
		if errors.Is(err, fs.ErrNotExist) {
			continue // new: Generate mints it
		}
		if err != nil {
			return k, err
		}
		sign, err := readSeed(filepath.Join(dir, n+".signing.nk"))
		if err != nil {
			return k, fmt.Errorf("%s has %s.pub but no usable signing seed: %w", dir, n, err)
		}
		k.Accounts[n] = topology.AccountKeys{Identity: strings.TrimSpace(string(pub)), Signing: sign}
	}
	return k, nil
}

// writeNewKeys keeps what Generate minted: a new account's public identity and
// signing seed beside the others, its identity seed under archive/ where nothing
// reads it; a rotation's new signing seed in place of the old -- after the old
// one is ARCHIVED as archive/<ACCOUNT>.signing.<pub>.nk, because the old key is
// still listed on the live account and step one must stay recoverable. Written
// BEFORE the manifest, atomically, and fails -- naming the directory -- before
// anything else is written.
func writeNewKeys(dir, keysDir string, nk map[string]topology.NewAccountKeys, accounts map[string]topology.AccountRecord) error {
	if len(nk) == 0 {
		return nil
	}
	if err := os.MkdirAll(filepath.Join(dir, "archive"), 0o700); err != nil {
		return fmt.Errorf("writing new account keys to %s: %w", dir, err)
	}
	for name, k := range nk {
		if k.Identity == nil {
			// A rotation: the superseded seed first, intact, under its public key.
			old, err := os.ReadFile(filepath.Join(keysDir, name+".signing.nk"))
			if err != nil {
				return fmt.Errorf("archiving %s's superseded signing seed: %w", name, err)
			}
			if err := writeFileAtomic(filepath.Join(dir, "archive", name+".signing."+accounts[name].Retiring+".nk"), old, 0o600); err != nil {
				return fmt.Errorf("writing new account keys to %s: %w", dir, err)
			}
		}
		if err := writeSeed(filepath.Join(dir, name+".signing.nk"), k.Signing); err != nil {
			return fmt.Errorf("writing new account keys to %s: %w", dir, err)
		}
		if k.Identity == nil {
			continue
		}
		pub, err := k.Identity.PublicKey()
		if err != nil {
			return err
		}
		if err := writeFileAtomic(filepath.Join(dir, name+".pub"), []byte(pub+"\n"), 0o644); err != nil {
			return fmt.Errorf("writing new account keys to %s: %w", dir, err)
		}
		if err := writeSeed(filepath.Join(dir, "archive", name+".identity.nk"), k.Identity); err != nil {
			return fmt.Errorf("writing new account keys to %s: %w", dir, err)
		}
	}
	return nil
}

// writeKeys is --dev only: it puts seeds on disk beside the output, which is
// exactly what a deployment must never let this command do. No root: --dev
// discards it, and no archive: FreshKeys holds no identity seeds.
func writeKeys(dir string, k topology.Keys) error {
	if err := os.MkdirAll(dir, 0o700); err != nil {
		return err
	}
	if err := os.WriteFile(filepath.Join(dir, "operator.jwt"), []byte(k.OperatorJWT), 0o600); err != nil {
		return err
	}
	if err := writeSeed(filepath.Join(dir, "operator-signing.nk"), k.OperatorSigning); err != nil {
		return err
	}
	for name, ak := range k.Accounts {
		if err := os.WriteFile(filepath.Join(dir, name+".pub"), []byte(ak.Identity+"\n"), 0o644); err != nil {
			return err
		}
		if err := writeSeed(filepath.Join(dir, name+".signing.nk"), ak.Signing); err != nil {
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
		if r.Kind == topology.Retired {
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
func writeDevServer(dir string, res *topology.Output, listen, monitor string) error {
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
	// Two copies of one config. nats-server resolves file paths against its
	// WORKING DIRECTORY, not the config's: the native copy carries absolute paths
	// so `nats-server -c build/topo/nats-server.conf` works from anywhere; the
	// container copy carries bare names and listens on every interface, for a
	// container whose working directory is the mounted topology (compose.yaml).
	render := func(listen, http, operator, cert, key string) string {
		return fmt.Sprintf(`# Written by garmctl topology --dev: a LOCAL server for the topology beside it.
# A deployment runs the full resolver and a certificate from its own CA; this is
# the memory resolver with every account preloaded, and a self-signed cert.
listen: %s
http: %s
operator: %q
system_account: %s
resolver: MEMORY
resolver_preload: {
%s}
tls {
  cert_file: %q
  key_file: %q
}
`, listen, http, operator, sysPub, preload.String(), cert, key)
	}
	native := render(listen, monitor,
		filepath.Join(abs, "operator.jwt"), filepath.Join(abs, "server.pem"), filepath.Join(abs, "server-key.pem"))
	if err := os.WriteFile(filepath.Join(dir, "nats-server.conf"), []byte(native), 0o600); err != nil {
		return err
	}
	container := render("0.0.0.0:4222", "0.0.0.0:8222", "operator.jwt", "server.pem", "server-key.pem")
	return os.WriteFile(filepath.Join(dir, "nats-server.docker.conf"), []byte(container), 0o600)
}

// retiringKeys is every signing key this issuance would drop: account -> key,
// for accounts retiring from a previous step one and not rotating again now.
func retiringKeys(previous *topology.Manifest, rotating []string) map[string]string {
	skip := map[string]bool{}
	for _, name := range rotating {
		skip[name] = true
	}
	by := map[string]string{}
	if previous == nil {
		return by
	}
	for name, rec := range previous.Accounts {
		if rec.Retiring != "" && !skip[name] {
			by[name] = rec.Retiring
		}
	}
	return by
}

// verifyNothingLiveOnRetiringKeys is --verify-live: ask the cluster which keys
// its live connections were signed by, and refuse to retire one still in use.
func verifyNothingLiveOnRetiringKeys(retiring map[string]string, natsURL, opsCreds, ca string, servers int) error {
	if natsURL == "" || opsCreds == "" {
		return errors.New("--verify-live needs --nats and --ops-creds")
	}
	const ownName = "garmctl topology --verify-live"
	nc, err := natsconn.Connect(natsURL, natsconn.Options{Creds: opsCreds, CA: ca}, nats.Name(ownName))
	if err != nil {
		return fmt.Errorf("--verify-live: %w", err)
	}
	defer nc.Close()
	live, err := liveSigners(nc, 2*time.Second, servers)
	if err != nil {
		return fmt.Errorf("--verify-live: %w", err)
	}
	for account, key := range retiring {
		if conns := live[key]; len(conns) > 0 {
			sort.Strings(conns)
			for i, c := range conns {
				if c == ownName {
					// Rotating SYS: the ops credential this command connected with is
					// itself signed by the retiring key. Said so, rather than listing a
					// connection the operator cannot find.
					conns[i] = c + " (this command's own; reissue the ops credential it was given)"
				}
			}
			return fmt.Errorf("--verify-live: %s's retiring key %s still signs %d live connection(s): %s -- roll them out first",
				account, key, len(conns), strings.Join(conns, ", "))
		}
	}
	return nil
}

// printStatus is --status: the manifest's state, and nothing issued.
func printStatus(cmd *cobra.Command, keysDir, manifestPath string, warnAccount, warnExpiryDays int) error {
	if keysDir == "" || manifestPath == "" {
		return errors.New("--status needs --keys and --manifest")
	}
	keys, err := readKeys(keysDir, nil)
	if err != nil {
		return err
	}
	opClaims, err := jwt.DecodeOperatorClaims(keys.OperatorJWT)
	if err != nil {
		return err
	}
	m, err := topology.Load(manifestPath, []string(opClaims.SigningKeys)...)
	if err != nil {
		return err
	}
	w := cmd.OutOrStdout()
	fmt.Fprintf(w, "generation %d from catalogue %s, issued %s; %d credentials\n",
		m.Generation, m.CatalogueSHA256[:12], m.IssuedAt.Format(time.RFC3339), len(m.Entries))
	names := make([]string, 0, len(m.Accounts))
	for name := range m.Accounts {
		names = append(names, name)
	}
	sort.Strings(names)
	for _, name := range names {
		rec := m.Accounts[name]
		fmt.Fprintf(w, "  %s  identity %s  signing %s\n", name, rec.Identity, rec.Signing)
		if rec.Retiring != "" {
			var still int
			for _, e := range m.Entries {
				if e.Account == name && e.SigningKey == rec.Retiring {
					still++
				}
			}
			fmt.Fprintf(w, "    RETIRING %s (%d credentials still name it): roll the new credentials out, then run an issuance with --verify-live to retire it\n", rec.Retiring, still)
		}
	}
	printWarnings(cmd, *m, warnAccount, warnExpiryDays)
	return nil
}

// printWarnings: what the manifest says about where the estate is heading --
// an account too large to rotate comfortably, credentials about to expire --
// one line each on stderr, after the facts. The thresholds are the flags.
func printWarnings(cmd *cobra.Command, m topology.Manifest, warnAccount, warnExpiryDays int) {
	for _, line := range topology.Warnings(m, time.Now(), warnAccount, time.Duration(warnExpiryDays)*24*time.Hour) {
		fmt.Fprintf(cmd.ErrOrStderr(), "warning: %s\n", line)
	}
}
