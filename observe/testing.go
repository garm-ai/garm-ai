package observe

// ResetInstrumentsForTest drops the instrument set so the next Instruments()
// binds to whatever meter is global NOW. For tests that swap the global meter
// provider -- otlptest.Install -- and for nothing else; a process has one meter
// for its whole life. Named for what it is, as topology.FreshKeys is.
func ResetInstrumentsForTest() {
	instrumentsMu.Lock()
	defer instrumentsMu.Unlock()
	instruments = nil
}
