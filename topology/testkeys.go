package topology

import "github.com/nats-io/nkeys"

// FreshKeys mints an operator signing key and one key per account. FOR TESTS AND
// `garmctl topology --dev` ONLY: a deployment's keys are an input the generator
// never produces (spec §5.1), and a caller of this function in production code is
// a bug.
func FreshKeys(callers []string) Keys {
	must := func(kp nkeys.KeyPair, err error) nkeys.KeyPair {
		if err != nil {
			panic(err)
		}
		return kp
	}
	k := Keys{Operator: must(nkeys.CreateOperator()), Accounts: map[string]nkeys.KeyPair{}}
	for _, a := range []string{AccountSYS, AccountGARM, AccountTOOLS} {
		k.Accounts[a] = must(nkeys.CreateAccount())
	}
	for _, c := range callers {
		k.Accounts[CallerPrefix+c] = must(nkeys.CreateAccount())
	}
	return k
}
