package main

import (
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/spf13/cobra"

	"github.com/garm-ai/garm-ai/authority"
	"github.com/garm-ai/garm-ai/catalogue"
	"github.com/garm-ai/garm-ai/declared"
	"github.com/garm-ai/garm-ai/fetch"
	runpkg "github.com/garm-ai/garm-ai/run"
	"github.com/garm-ai/garm-ai/topology"
)

func grantsCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "grants",
		Short: "Work on a deployment's grant file: who may invoke what",
	}
	cmd.AddCommand(grantsCheckCmd())
	return cmd
}

func grantsCheckCmd() *cobra.Command {
	var grants, callers, catURI, catSHA, catDir string
	cmd := &cobra.Command{
		Use:   "check",
		Short: "Check a grant file and print what it lets each principal invoke",
		Long: "check makes every refusal rund makes at boot, without starting rund:\n" +
			"a schema this build does not understand, a tool pattern that is not a\n" +
			"pattern, a compartment outside the deployment's declared vocabulary, a\n" +
			"principal no caller table knows, and -- with --catalogue -- a declared\n" +
			"tool requiring a compartment the file never declares.\n\n" +
			"Then it prints what each principal MAY INVOKE, which is the question a\n" +
			"reviewer actually has. With a catalogue it names real tools and asks the\n" +
			"same decider rund asks, so the report cannot drift from the decision.\n" +
			"Without one it reports the grants as written, because a pattern is not a\n" +
			"tool list until there is a catalogue to resolve it against.",
		Args: cobra.NoArgs,
		RunE: func(cmd *cobra.Command, _ []string) error {
			return grantsCheck(cmd, grants, callers, catURI, catSHA, catDir)
		},
	}
	cmd.Flags().StringVar(&grants, "grants", "", "the grant file to check")
	cmd.Flags().StringVar(&callers, "callers", "", "callers.json as `garmctl topology` wrote it; a grant names a principal by name and this resolves it")
	cmd.Flags().StringVar(&catURI, "catalogue", "", "catalogue URI: file://, s3:// or https://; omit to check the file alone")
	cmd.Flags().StringVar(&catSHA, "catalogue-sha256", "", "hex digest the catalogue must have; REQUIRED for remote")
	cmd.Flags().StringVar(&catDir, "catalogue-dir", ".", "what a relative file:// catalogue resolves against")
	_ = cmd.MarkFlagRequired("grants")
	return cmd
}

// grantsCheck runs rund's boot checks and writes the report.
//
// The decision is never reimplemented here: the report asks the same
// authority.Allow rund asks, so a tool this prints as invocable is a tool that
// call would permit. A report with its own idea of the rules would be worse
// than no report -- it would be believed.
func grantsCheck(cmd *cobra.Command, grantsPath, callersPath, catURI, catSHA, catDir string) error {
	if callersPath == "" {
		return fmt.Errorf("a grant file names principals by name, so --callers is required to resolve them to account keys")
	}
	resolve, err := topology.CallerKeys(callersPath)
	if err != nil {
		return err
	}
	file, err := authority.LoadFile(grantsPath, resolve)
	if err != nil {
		return err
	}

	var tools []declared.Tool
	out := cmd.OutOrStdout()
	fmt.Fprintf(out, "%s  generation %s\n", file.Path(), file.Generation())
	fmt.Fprintf(out, "compartments: %s\n", list(file.Vocabulary()))
	if catURI != "" {
		cat, err := catalogue.Load(cmd.Context(), &fetch.Resolver{Dir: catDir},
			fetch.Artefact{URI: catURI, SHA256: catSHA})
		if err != nil {
			return err
		}
		// The §6 cross-check, the same call rund's boot makes.
		if err := file.CheckCatalogue(cat.Tools.Tools()); err != nil {
			return err
		}
		tools = cat.Tools.Tools()
		fmt.Fprintf(out, "catalogue: %s  %d tools\n", cat.Source, len(tools))
	} else {
		fmt.Fprintf(out, "catalogue: none -- pass --catalogue to resolve patterns to tools\n")
	}

	a := &authority.Authority{}
	a.Set(file)
	for _, p := range principals(file) {
		fmt.Fprintf(out, "\n%s  %s\n", p.name, p.principal)
		for _, g := range p.grants {
			fmt.Fprintf(out, "  grant %s  tools: %s  compartments: %s",
				g.ID, list(g.Tools), list(g.Compartments))
			if g.ActsFor != nil {
				fmt.Fprintf(out, "  acts for %s", g.ActsFor)
			}
			if !g.Expires.IsZero() {
				fmt.Fprintf(out, "  expires %s", g.Expires.Format("2006-01-02T15:04:05Z07:00"))
				// The most actionable fact about a grant that decides nothing.
				if !g.Live(time.Now()) {
					fmt.Fprintf(out, " (EXPIRED -- this grant decides nothing)")
				}
			}
			fmt.Fprintln(out)
		}
		if len(tools) == 0 {
			continue
		}
		report(cmd, out, a, p, tools)
	}
	return nil
}

// report writes one principal's two tool lists: what it may invoke, and what a
// grant claims but the decision refuses. The second list is the one a person
// debugging a DENIED comes here for; tools no grant names at all are the
// complement of the first list and are not worth a line each.
//
// The REASON is always the decider's own words. It was a sentence built here
// once, and it misreported an expired grant as a missing compartment -- the
// report may decide what to show, never why.
func report(cmd *cobra.Command, out io.Writer, a *authority.Authority, p principal, tools []declared.Tool) {
	var may, blocked []string
	for _, t := range tools {
		_, err := a.Allow(cmd.Context(), p.principal, t)
		if err == nil {
			line := t.Name
			if len(t.Requires) > 0 {
				line += "  requires " + list(t.Requires)
			}
			may = append(may, line)
			continue
		}
		for _, g := range p.grants {
			if g.Admits(t.Name) {
				blocked = append(blocked, err.Error())
				break
			}
		}
	}
	if len(may) == 0 {
		fmt.Fprintf(out, "  may invoke: nothing in this catalogue\n")
	} else {
		fmt.Fprintf(out, "  may invoke:\n")
		for _, line := range may {
			fmt.Fprintf(out, "    %s\n", line)
		}
	}
	if len(blocked) > 0 {
		fmt.Fprintf(out, "  named by a grant and refused anyway:\n")
		for _, line := range blocked {
			fmt.Fprintf(out, "    %s\n", line)
		}
	}
}

// principal is one principal's grants, as the file wrote them.
type principal struct {
	name      string // the grant file's own name for it, e.g. CALLER-studio
	principal runpkg.Principal
	grants    []authority.Grant
}

// principals groups the file's grants by principal, in first-appearance order:
// a reviewer reads the report beside the file.
func principals(f *authority.File) []principal {
	var out []principal
	at := map[string]int{}
	for _, g := range f.Grants() {
		i, seen := at[g.Principal.ID]
		if !seen {
			at[g.Principal.ID] = len(out)
			out = append(out, principal{name: nameOf(g.ID), principal: g.Principal})
			i = len(out) - 1
		}
		out[i].grants = append(out[i].grants, g)
	}
	return out
}

// nameOf recovers the file's name for a principal from the grant id the file
// built, "<name>#<index>".
func nameOf(grantID string) string {
	if i := strings.LastIndex(grantID, "#"); i > 0 {
		return grantID[:i]
	}
	return grantID
}

func list(items []string) string {
	if len(items) == 0 {
		return "none"
	}
	return strings.Join(items, ", ")
}
