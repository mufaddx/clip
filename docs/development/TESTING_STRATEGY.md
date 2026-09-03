# Testing Strategy

## Priority order

Testing effort is not spread evenly — critical financial and authorization paths get the deepest coverage, since a bug there means real money or a real security breach, not just a wrong pixel.

1. **Wallet & ledger** — every ledger invariant in [`../finance/LEDGER_ARCHITECTURE.md`](../finance/LEDGER_ARCHITECTURE.md) (append-only, balanced two-sided entries, idempotent job-driven writes) has a corresponding test that tries to violate it.
2. **Payments** — deposit/webhook idempotency (a redelivered webhook must not double-credit), refund correctness.
3. **Withdrawals** — the state machine in [`../finance/WITHDRAWAL_SYSTEM.md`](../finance/WITHDRAWAL_SYSTEM.md), especially the race condition where two concurrent requests must not both succeed against the same `AVAILABLE` balance.
4. **Role/permission authorization** — every guarded route has a test asserting the wrong role/permission is rejected (403) and the right one succeeds, plus object-level ownership checks (see [`../api/API_AUTHORIZATION.md`](../api/API_AUTHORIZATION.md)).
5. **Campaign funding** — the `APPROVED → FUNDED → LIVE` gate in [`../campaigns/CAMPAIGN_LIFECYCLE.md`](../campaigns/CAMPAIGN_LIFECYCLE.md) cannot be bypassed with a partial budget.

## Test types

| Type | Tooling | Scope |
|---|---|---|
| Unit tests | Vitest/Jest | Pure functions (`@clip/utilities`), service methods with mocked `@clip/db` |
| Integration tests | Jest + a real ephemeral test Postgres (via Testcontainers or a CI-provisioned DB) | Service + Prisma together, verifying actual DB constraints/transactions |
| API tests | Jest + Supertest (or NestJS's testing module) | Full request → guard → controller → service → DB round trip, including auth |
| Critical financial workflow tests | Integration-level, deliberately including concurrency scenarios | Double-withdrawal race, webhook replay, campaign funding partial-budget attempt |
| Role authorization tests | API-level | Every route matrix-tested against every role that should and shouldn't pass |
| Frontend component tests | Vitest + Testing Library | Shared `@clip/ui` components' interactive behavior and accessibility (keyboard nav, focus) |
| End-to-end tests (future) | Playwright | Full user journeys (brand creates+funds a campaign, clipper accepts+submits) once core flows stabilize |

## CI gate

Every PR runs: typecheck → lint → unit → integration → API tests, via Turborepo's task graph (`turbo run test`) — a PR touching `apps/api`'s financial modules cannot merge without its integration tests passing against a real ephemeral database, not just mocks.

## Test data

Integration/API tests seed their own isolated fixtures per test run (never reuse a shared mutable dataset across tests) so financial-path tests are deterministic and don't leak state between runs.

## Related documents

[`../finance/LEDGER_ARCHITECTURE.md`](../finance/LEDGER_ARCHITECTURE.md), [`../api/API_AUTHORIZATION.md`](../api/API_AUTHORIZATION.md), [`../deployment/CI_CD.md`](../deployment/CI_CD.md).
