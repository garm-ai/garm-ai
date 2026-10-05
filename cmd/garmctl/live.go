package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/nats-io/nats.go"
)

// connzPageSize is how many connections one CONNZ request asks for. The server
// caps a request at 1024 and treats 0 as that cap, NOT as "all" -- so a page is
// asked for explicitly and the next page requested until a server's total is
// reached. A variable so a test can shrink it and prove the paging.
var connzPageSize = 1024

// liveSigners asks the cluster, with the ops credential, which signing key each
// live connection's credential was issued by: issuer key -> connection names.
// This is the evidence step two of a rotation refuses without (spec §4): the
// manifest knows what was issued, the bus knows what is in use.
//
// It FAILS CLOSED. Every server answers a SERVER.PING once, so replies are
// collected for a window and counted: fewer servers than expected is not
// evidence, it is a server that did not answer. And each server's reply is paged
// until its own total is reached, so a server with more connections than a page
// cannot hide one.
func liveSigners(nc *nats.Conn, window time.Duration, expectServers int) (map[string][]string, error) {
	type connz struct {
		Server struct {
			ID string `json:"id"`
		} `json:"server"`
		Data struct {
			Total  int `json:"total"`
			Offset int `json:"offset"`
			Conns  []struct {
				Name      string `json:"name"`
				IssuerKey string `json:"issuer_key"`
			} `json:"connections"`
		} `json:"data"`
	}
	ask := func(offset int) ([]connz, error) {
		inbox := nats.NewInbox()
		sub, err := nc.SubscribeSync(inbox)
		if err != nil {
			return nil, err
		}
		defer func() { _ = sub.Unsubscribe() }()
		req, _ := json.Marshal(map[string]any{"auth": true, "limit": connzPageSize, "offset": offset})
		if err := nc.PublishRequest("$SYS.REQ.SERVER.PING.CONNZ", inbox, req); err != nil {
			return nil, fmt.Errorf("asking the cluster for its connections: %w", err)
		}
		var pages []connz
		deadline := time.Now().Add(window)
		for {
			remaining := time.Until(deadline)
			if remaining <= 0 {
				return pages, nil
			}
			msg, err := sub.NextMsg(remaining)
			if err != nil {
				return pages, nil // the window closed
			}
			var page connz
			if err := json.Unmarshal(msg.Data, &page); err != nil {
				return nil, fmt.Errorf("the cluster's CONNZ reply: %w", err)
			}
			pages = append(pages, page)
		}
	}

	by := map[string][]string{}
	// First page, from every server that answers in the window.
	first, err := ask(0)
	if err != nil {
		return nil, err
	}
	if len(first) < expectServers {
		return nil, fmt.Errorf("%d server(s) answered CONNZ within %s, %d expected; a server that did not answer is not evidence (is this the ops credential, and is --servers right?)",
			len(first), window, expectServers)
	}
	totals := map[string]int{}
	seen := map[string]int{}
	add := func(p connz) {
		totals[p.Server.ID] = p.Data.Total
		seen[p.Server.ID] += len(p.Data.Conns)
		for _, c := range p.Data.Conns {
			if c.IssuerKey != "" {
				by[c.IssuerKey] = append(by[c.IssuerKey], c.Name)
			}
		}
	}
	for _, p := range first {
		add(p)
	}
	// Then the rest of each server's connections, page by page, until every
	// server has shown its total.
	for offset := connzPageSize; ; offset += connzPageSize {
		var more bool
		for id, total := range totals {
			if seen[id] < total {
				more = true
			}
		}
		if !more {
			break
		}
		pages, err := ask(offset)
		if err != nil {
			return nil, err
		}
		if len(pages) == 0 {
			return nil, fmt.Errorf("a server stopped answering CONNZ at offset %d; its connections could not all be checked", offset)
		}
		for _, p := range pages {
			if seen[p.Server.ID] < p.Data.Total {
				add(p)
			}
		}
	}
	for id, total := range totals {
		if seen[id] < total {
			return nil, fmt.Errorf("server %s reports %d connections and showed %d; its connections could not all be checked", id, total, seen[id])
		}
	}
	return by, nil
}
