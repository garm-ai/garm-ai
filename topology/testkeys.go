package topology

import "github.com/nats-io/nkeys"

// FreshKeys mints a throwaway operator -- root discarded, because nothing may
// hold it -- and identity + signing keys for every account. FOR TESTS AND
// `garmctl topology --dev` ONLY: a deployment's operator comes from the root
// ceremony and its account keys from earlier issuances.
func FreshKeys(callers []string) Keys {
	op, err := InitOperator()
	if err != nil {
		panic(err)
	}
	return FreshKeysFor(op, callers)
}

// FreshKeysFor is FreshKeys under a given operator, for a test that keeps the
// root so it can sign something badly and watch the server refuse it.
func FreshKeysFor(op Operator, callers []string) Keys {
	k := Keys{OperatorJWT: op.JWT, OperatorSigning: op.Signing, Accounts: map[string]AccountKeys{}}
	names := []string{AccountSYS, AccountGARM, AccountTOOLS}
	for _, c := range callers {
		names = append(names, CallerPrefix+c)
	}
	for _, name := range names {
		id, err := nkeys.CreateAccount()
		if err != nil {
			panic(err)
		}
		pub, err := id.PublicKey()
		if err != nil {
			panic(err)
		}
		sign, err := nkeys.CreateAccount()
		if err != nil {
			panic(err)
		}
		k.Accounts[name] = AccountKeys{Identity: pub, Signing: sign}
	}
	return k
}
