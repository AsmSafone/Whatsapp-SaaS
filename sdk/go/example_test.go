package zaptura_test

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	zaptura "github.com/AsmSafone/ZapturaWA/sdk/go"
)

func ExampleNew() {
	client, err := zaptura.New("http://localhost:2785", "zap_k1_…")
	if err != nil {
		log.Fatal(err)
	}

	ctx := context.Background()
	if _, err := client.Sessions.Start(ctx, "my-session"); err != nil {
		log.Fatal(err)
	}

	res, err := client.Messages.SendText(ctx, "my-session", zaptura.SendTextRequest{
		ChatID: "628123456789@c.us",
		Text:   "Hello from the Zaptura Go SDK!",
	})
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(res.MessageID)
}

func ExampleClient_typedErrors() {
	client, _ := zaptura.New("http://localhost:2785", "zap_k1_…")

	_, err := client.Messages.SendText(context.Background(), "my-session", zaptura.SendTextRequest{
		ChatID: "628123456789@c.us",
		Text:   "hi",
	})
	switch {
	case errors.Is(err, zaptura.ErrConflict):
		// Engine not ready (409) — retry after the session reaches "ready".
	case errors.Is(err, zaptura.ErrNotFound):
		// Unknown session (404).
	case err != nil:
		var apiErr *zaptura.APIError
		if errors.As(err, &apiErr) {
			log.Printf("API %d: %s", apiErr.StatusCode, apiErr.Message)
		}
	}
}

func ExampleWithRetry() {
	// Opt into automatic retries with exponential backoff, and inject a custom
	// per-request timeout — dependencies flow through functional options.
	client, _ := zaptura.New("http://localhost:2785", "zap_k1_…",
		zaptura.WithRetry(zaptura.DefaultRetryPolicy()),
		zaptura.WithTimeout(15*time.Second),
	)
	_ = client
}

func ExampleClient_webhookEvents() {
	client, _ := zaptura.New("http://localhost:2785", "zap_k1_…")

	// Subscribe to the group and call events with the Event* constants — they
	// are the exact wire values, so a typo is a compile error, not a silent
	// no-delivery.
	_, err := client.Webhooks.Create(context.Background(), "my-session", zaptura.CreateWebhookRequest{
		URL: "https://example.com/hook",
		Events: []string{
			zaptura.EventGroupJoin,
			zaptura.EventGroupLeave,
			zaptura.EventGroupUpdate,
			zaptura.EventCallReceived,
		},
	})
	if err != nil {
		log.Fatal(err)
	}
}
