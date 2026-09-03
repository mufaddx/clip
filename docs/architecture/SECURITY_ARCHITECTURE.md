# Security Architecture

## Purpose

Defines the security controls that protect accounts, money movement, and platform integrity. These are requirements, not suggestions — a feature that skips one of these is not done.

## Authentication

- Passwords hashed with Argon2id (never stored plaintext, never MD5/SHA1).
- Access tokens: short-lived JWT (default 15m, `AUTH_ACCESS_TOKEN_TTL`), signed with `AUTH_SECRET`. Refresh tokens: long-lived (30d), stored hashed server-side so a leaked DB dump can't be replayed as valid refresh tokens.
- Session cookie is `HttpOnly`, `Secure` (prod), `SameSite=Lax`, scoped to `AUTH_COOKIE_DOMAIN` (the shared parent domain, e.g. `.domain.in`) so it is readable across all four subdomains but never accessible to page JavaScript.
- Rate limiting on `/v1/auth/login` and `/v1/auth/reset-password` (per-IP and per-account) to slow credential stuffing.

## Authorization

- Every API route is guarded by role/permission checks server-side — see [`../api/API_AUTHORIZATION.md`](../api/API_AUTHORIZATION.md). Frontend role checks (middleware redirects) are a UX convenience only; they are never the actual security boundary.
- Object-level checks (e.g., "does this campaign belong to this brand?") happen in the service layer on every read/write, not just route-level role checks — a `BRAND_OWNER` role alone doesn't prove ownership of a specific campaign.

## Secrets

Never exposed to any frontend bundle or response body: `DATABASE_URL`, `AUTH_SECRET`, `META_APP_SECRET`, `PAYMENT_PROVIDER_SECRET`, `PAYMENT_WEBHOOK_SECRET`. Only `NEXT_PUBLIC_*`-prefixed variables (e.g. app URLs) are permitted in frontend bundles — enforced by convention and reviewed whenever a new env var is added, see [`../development/ENVIRONMENT_SETUP.md`](../development/ENVIRONMENT_SETUP.md).

## Input validation

Every API DTO uses `class-validator` decorators with a whitelist `ValidationPipe` (unknown fields stripped, not silently accepted) — prevents mass-assignment of fields like `role` or `walletBalance` from a crafted request body.

## Webhook security

Meta webhooks and payment provider webhooks are verified via HMAC signature (`X-Hub-Signature-256` for Meta, provider-specific header for payments) before the payload is trusted — see [`../api/WEBHOOKS.md`](../api/WEBHOOKS.md).

## Token storage (Meta/Instagram)

Long-lived Instagram access tokens are encrypted at rest (AES-256-GCM, key from a dedicated `TOKEN_ENCRYPTION_KEY`, never `AUTH_SECRET`) in `instagram_tokens`. Decrypted only inside the `instagram` module, in memory, for the duration of a Graph API call.

## Audit logging

Every mutating admin action writes to `audit_logs` (actor, action, target, before/after, IP, timestamp) — see [`../admin/AUDIT_LOGS.md`](../admin/AUDIT_LOGS.md). Audit logs are append-only; no update/delete path exists for them in the application layer.

## Fraud & abuse controls

- Referral fraud signals (self-referral, duplicate device/payment fingerprints, abnormal reward velocity) flag accounts for human review rather than auto-banning — see [`../referrals/REFERRAL_FRAUD_PROTECTION.md`](../referrals/REFERRAL_FRAUD_PROTECTION.md).
- Performance anomalies (metric spikes inconsistent with account history) flag a submission for `RISK_REVIEW` before qualified performance is finalized.

## Transport & headers

TLS everywhere (terminated at the load balancer/CDN in production), HSTS, `Content-Security-Policy` restricting script/style sources, `X-Frame-Options: DENY` on all authenticated apps (dashboards should never be iframed).

## Related documents

[`../api/API_AUTHORIZATION.md`](../api/API_AUTHORIZATION.md), [`../users/AUTHENTICATION_FLOW.md`](../users/AUTHENTICATION_FLOW.md), [`../admin/AUDIT_LOGS.md`](../admin/AUDIT_LOGS.md), [`../deployment/DOMAIN_DEPLOYMENT.md`](../deployment/DOMAIN_DEPLOYMENT.md).
