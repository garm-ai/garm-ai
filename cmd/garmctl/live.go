package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/nats-io/nats.go"
)

// liveSigners asks the cluster, with the ops credential, which signing key each
// live connection's credential was issued by: issuer key -> connection names.
// This is the evidence step two of a rotation refuses without (spec §4): the
// manifest knows what was issued, the bus knows what is in use.
//
// Every server answers a SERVER.PING once, so the replies are collected for a
// window rather than taken from the first responder -- a cluster is counted
// whole, and a laptop's single server answers the same way.
func liveSigners(nc *nats.Conn, window time.Duration) (map[string][]string, error) {
	inbox := nats.NewInbox()
	sub, err := nc.SubscribeSync(inbox)
	if err != nil {
		return nil, err
	}
	defer func() { _ = sub.Unsubscribe() }()
	req, _ := json.Marshal(map[string]any{"auth": true})
	if err := nc.PublishRequest("$SYS.REQ.SERVER.PING.CONNZ", inbox, req); err != nil {
		return nil, fmt.Errorf("asking the cluster for its connections: %w", err)
	}
	by := map[string][]string{}
	deadline := time.Now().Add(window)
	var answered int
	for {
		remaining := time.Until(deadline)
		if remaining <= 0 {
			break
		}
		msg, err := sub.NextMsg(remaining)
		if err != nil {
			break // the window closed
		}
		var resp struct {
			Data struct {
				Conns []struct {
					Name      string `json:"name"`
					IssuerKey string `json:"issuer_key"`
				} `json:"connections"`
			} `json:"data"`
		}
		if err := json.Unmarshal(msg.Data, &resp); err != nil {
			return nil, fmt.Errorf("the cluster's CONNZ reply: %w", err)
		}
		answered++
		for _, c := range resp.Data.Conns {
			if c.IssuerKey != "" {
				by[c.IssuerKey] = append(by[c.IssuerKey], c.Name)
			}
		}
	}
	if answered == 0 {
		return nil, fmt.Errorf("no server answered CONNZ within %s; is this the ops credential, and is it in the system account?", window)
	}
	return by, nil
}
