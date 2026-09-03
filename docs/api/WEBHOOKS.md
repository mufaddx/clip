# Webhooks

## Purpose

Inbound webhooks from external providers (Meta, payment provider) that must be verified before being trusted, since they represent state changes that directly affect money and campaign data.

## Meta / Instagram webhooks

`POST /v1/instagram/webhook` — subscribed to media/account update events (as supported by the Instagram Platform's webhook offering) to speed up reel detection beyond the scheduled sync cadence.

- Verified via the `X-Hub-Signature-256` header (HMAC-SHA256 using `META_APP_SECRET`) before the payload is parsed/trusted.
- The verification (challenge/response) handshake required by Meta on webhook subscription setup is handled at `GET /v1/instagram/webhook` per Meta's standard verification protocol.
- A verified event enqueues a Reel Detection Worker job rather than being processed synchronously in the webhook handler — the handler's only job is "verify, enqueue, return 200 fast."

## Payment provider webhooks

`POST /v1/payments/webhook` — deposit confirmations, payout status updates, refund confirmations.

- Verified via the provider's signature scheme (header name/algorithm specific to the configured provider), using `PAYMENT_WEBHOOK_SECRET`.
- Deduplicated by provider event id — a redelivered webhook (providers commonly retry until they get a 200) must not double-post a `wallet_ledger` entry; the handler checks for an existing processed record for that event id before acting.
- On successful verification and processing, responds 200 quickly; heavy follow-up work (notification sending, aggregate updates) is enqueued rather than done inline.

## General webhook rules

1. **Verify the signature before doing anything else** — an unverified payload is discarded with a 401/400, never parsed for "just a peek."
2. **Respond fast, process async** — webhook handlers enqueue a background job and return 200 promptly; providers may retry aggressively on slow/timeout responses.
3. **Idempotent by event id** — every webhook handler records the provider's event id and skips reprocessing an already-handled one.
4. **Logged distinctly from regular API requests** — webhook traffic is logged with its own tag for easier debugging of integration issues, since it's not initiated by a logged-in user session.

## Related documents

[`../architecture/META_INSTAGRAM_INTEGRATION.md`](../architecture/META_INSTAGRAM_INTEGRATION.md), [`../finance/PAYMENT_SYSTEM.md`](../finance/PAYMENT_SYSTEM.md), [`../architecture/SECURITY_ARCHITECTURE.md`](../architecture/SECURITY_ARCHITECTURE.md).
