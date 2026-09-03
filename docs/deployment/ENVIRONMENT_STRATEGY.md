# Environment Strategy

## Purpose

How configuration (not code) differs across Local / Preview / Staging / Production, and how secrets are managed per environment.

## Variable sourcing per environment

| Environment | Source of env vars |
|---|---|
| Local | `.env` (gitignored), copied from `.env.example` and filled in manually |
| Preview | The hosting provider's per-PR/per-branch environment variable set, pointed at a shared preview database/Redis or an ephemeral one per PR |
| Staging | The hosting provider's staging environment variable set, using its own database/Redis, its own Meta app (test mode) and payment provider sandbox credentials |
| Production | The hosting provider's production environment variable set/secrets manager, real `PRIMARY_DOMAIN`, live Meta app and payment provider credentials |

## Promotion flow

```
Local development → PR opened → Preview deployment (all 5 units) → review/QA
      → merge to main → Staging deployment (automatic) → manual verification
      → manual promotion to Production (gated approval, see ../deployment/CI_CD.md)
```

Nothing skips Staging on the way to Production except a documented, explicitly-approved hotfix path for a production-down incident.

## Meta/Instagram and payment provider environments

- Staging uses Meta's test app mode and the payment provider's sandbox — real user data/money is never exercised outside Production.
- `META_REDIRECT_URI` and `PAYMENT_WEBHOOK_SECRET` are environment-specific values, never shared between Staging and Production (a Staging webhook must not be able to trigger a Production-side effect and vice versa).

## Secrets management

Production secrets (`AUTH_SECRET`, `META_APP_SECRET`, `PAYMENT_PROVIDER_SECRET`, `DATABASE_URL`, `TOKEN_ENCRYPTION_KEY`) are stored in the hosting provider's secrets manager, injected as environment variables at deploy time — never committed, never logged, never present in a build artifact's client-side bundle (see [`../architecture/SECURITY_ARCHITECTURE.md`](../architecture/SECURITY_ARCHITECTURE.md)).

## Related documents

[`DEPLOYMENT_ARCHITECTURE.md`](DEPLOYMENT_ARCHITECTURE.md), [`CI_CD.md`](CI_CD.md), [`../development/ENVIRONMENT_SETUP.md`](../development/ENVIRONMENT_SETUP.md).
