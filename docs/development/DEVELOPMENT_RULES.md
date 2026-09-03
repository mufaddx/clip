# Development Rules

## Before implementing any module

1. Read the relevant Markdown documentation under `/docs` — this repository's source of truth (see [`../README.md`](../README.md)).
2. Check existing architecture/code before adding new structure — don't duplicate a module, component, or utility that already exists.
3. Update documentation when architecture changes — a doc and the code it describes must never be left silently out of sync.
4. Keep database changes in migrations — no manual schema edits against any shared environment (see [`../database/MIGRATION_STRATEGY.md`](../database/MIGRATION_STRATEGY.md)).
5. Keep business logic in backend services — never in frontend components, and never duplicated between an API controller and a background worker when both need the same rule (see [`../architecture/BACKEND_ARCHITECTURE.md`](../architecture/BACKEND_ARCHITECTURE.md)).
6. Never place sensitive logic (authorization decisions, financial calculations, secret handling) only in the frontend.
7. Never hardcode important business rules (fee percentages, performance formulas, referral rules, campaign thresholds) — these live in admin-configurable settings (see [`../product/BUSINESS_RULES.md`](../product/BUSINESS_RULES.md)).
8. Build reusable components in `packages/ui` rather than one-off duplicates per app (see [`../ui-ux/COMPONENT_LIBRARY.md`](../ui-ux/COMPONENT_LIBRARY.md)).
9. Maintain consistent UI patterns — a new screen is checked against [`../ui-ux/UI_UX_OVERVIEW.md`](../ui-ux/UI_UX_OVERVIEW.md) before being considered done.
10. Never hardcode a production domain/URL in application code — always read from environment variables (see [`ENVIRONMENT_SETUP.md`](ENVIRONMENT_SETUP.md)).

## Workflow order for a new feature

Inspect existing code → confirm/extend the relevant doc → write/extend the database schema (migration) → implement the backend service + API route (with authorization) → implement the frontend (using shared components) → add tests for the critical paths (see [`TESTING_STRATEGY.md`](TESTING_STRATEGY.md)) → update the doc's "implementation status" if applicable.

## Non-negotiables

- No direct wallet balance mutation outside a `wallet_ledger` entry (see [`../finance/LEDGER_ARCHITECTURE.md`](../finance/LEDGER_ARCHITECTURE.md)).
- No Meta/Instagram access outside the `instagram` module (see [`../architecture/META_INSTAGRAM_INTEGRATION.md`](../architecture/META_INSTAGRAM_INTEGRATION.md)).
- No admin mutation without an `audit_logs` entry (see [`../admin/AUDIT_LOGS.md`](../admin/AUDIT_LOGS.md)).
- No frontend-only authorization check standing in for a server-side one (see [`../architecture/SECURITY_ARCHITECTURE.md`](../architecture/SECURITY_ARCHITECTURE.md)).

## Related documents

[`CODING_STANDARDS.md`](CODING_STANDARDS.md), [`FOLDER_STRUCTURE.md`](FOLDER_STRUCTURE.md), [`ENVIRONMENT_SETUP.md`](ENVIRONMENT_SETUP.md), [`TESTING_STRATEGY.md`](TESTING_STRATEGY.md).
