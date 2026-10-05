package main

import (
	"bytes"
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/nats-io/jwt/v2"
	"github.com/nats-io/nkeys"
	"github.com/spf13/cobra"

	"github.com/garm-ai/garm-ai/topology"
)

func operatorCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "operator",
		Short: "The root ceremony: run OFFLINE, once",
	}
	cmd.AddCommand(operatorInitCmd(), operatorReplaceCmd())
	return cmd
}

func operatorInitCmd() *cobra.Command {
	var out string
	cmd := &cobra.Command{
		Use:   "init",
		Short: "Create the root and the operator signing key; write the root apart",
		Long: "init is the one place an operator key is created. It writes the root\n" +
			"seed under <out>/root and everything topology needs under <out>/keys.\n" +
			"The root signs nothing day to day: move root/ to custody now, and never\n" +
			"let it sit where topology runs -- topology refuses a --keys that holds it.",
		RunE: func(cmd *cobra.Command, _ []string) error {
			if out == "" {
				return errors.New("--out is required")
			}
			if _, err := os.Stat(out); err == nil {
				return fmt.Errorf("%s exists; a ceremony is not repeated by accident", out)
			}
			op, err := topology.InitOperator()
			if err != nil {
				return err
			}
			for _, d := range []string{"root", "keys"} {
				if err := os.MkdirAll(filepath.Join(out, d), 0o700); err != nil {
					return err
				}
			}
			if err := writeSeed(filepath.Join(out, "root", "root.nk"), op.Root); err != nil {
				return err
			}
			if err := writeSeed(filepath.Join(out, "keys", "operator-signing.nk"), op.Signing); err != nil {
				return err
			}
			if err := os.WriteFile(filepath.Join(out, "keys", "operator.jwt"), []byte(op.JWT), 0o600); err != nil {
				return err
			}
			rootPub, _ := op.Root.PublicKey()
			fmt.Fprintf(cmd.OutOrStdout(), "ok: operator %s; keys for topology in %s\n", rootPub, filepath.Join(out, "keys"))
			fmt.Fprintf(cmd.OutOrStdout(), "MOVE %s TO CUSTODY NOW: the root signs nothing day to day and must never be where topology runs\n", filepath.Join(out, "root"))
			return nil
		},
	}
	cmd.Flags().StringVarP(&out, "out", "o", "", "directory to create; must not exist")
	return cmd
}

func operatorReplaceCmd() *cobra.Command {
	var rootPath, operatorPath, out string
	cmd := &cobra.Command{
		Use:   "replace-signing-key",
		Short: "Mint a new operator signing key, listed beside the current one (run OFFLINE)",
		RunE: func(cmd *cobra.Command, _ []string) error {
			if rootPath == "" || operatorPath == "" || out == "" {
				return errors.New("--root, --operator and --out are required")
			}
			root, err := readSeed(rootPath)
			if err != nil {
				return err
			}
			raw, err := os.ReadFile(operatorPath)
			if err != nil {
				return err
			}
			current, err := jwt.DecodeOperatorClaims(string(bytes.TrimSpace(raw)))
			if err != nil {
				return err
			}
			keys := []string(current.SigningKeys)
			if len(keys) != 1 {
				return fmt.Errorf("%s lists %d signing keys; replace-signing-key expects exactly one (retiring the old one is not built yet)", operatorPath, len(keys))
			}
			signing, encoded, err := topology.ReplaceSigningKey(root, keys[0])
			if err != nil {
				return err
			}
			if err := os.MkdirAll(out, 0o700); err != nil {
				return err
			}
			if err := writeSeed(filepath.Join(out, "operator-signing.nk"), signing); err != nil {
				return err
			}
			return os.WriteFile(filepath.Join(out, "operator.jwt"), []byte(encoded), 0o600)
		},
	}
	cmd.Flags().StringVar(&rootPath, "root", "", "the root seed (root/root.nk)")
	cmd.Flags().StringVar(&operatorPath, "operator", "", "the current operator.jwt")
	cmd.Flags().StringVarP(&out, "out", "o", "", "directory for the new operator.jwt and operator-signing.nk")
	return cmd
}

func writeSeed(path string, kp nkeys.KeyPair) error {
	seed, err := kp.Seed()
	if err != nil {
		return err
	}
	return os.WriteFile(path, seed, 0o600)
}

func readSeed(path string) (nkeys.KeyPair, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	kp, err := nkeys.FromSeed(bytes.TrimSpace(raw))
	if err != nil {
		return nil, fmt.Errorf("%s: %w", path, err)
	}
	return kp, nil
}
