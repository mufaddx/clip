# Coding Standards

## Language & tooling

- TypeScript everywhere (`strict: true`, `noUncheckedIndexedAccess: true` per [`../../tsconfig.base.json`](../../tsconfig.base.json)). No implicit `any`.
- ESLint + Prettier, shared config from `@clip/config` — every app/package extends the shared config rather than defining its own rules.
- Imports use the `@clip/*` path aliases for shared packages, relative imports within an app's own `src`.

## Naming

- Files: `kebab-case.ts` / `kebab-case.tsx`. Components: `PascalCase` export matching a `PascalCase.tsx` filename when the file's primary export is a component.
- Database tables/columns: `snake_case` (Postgres convention); Prisma model fields exposed to TypeScript stay `camelCase` (Prisma's default mapping via `@map`).
- API DTOs: `SomethingRequestDto` / `SomethingResponseDto`.
- Booleans read as questions: `isActive`, `hasCompletedOnboarding`, not `active`/`flag`.

## Backend conventions

- Controllers thin, services own logic (see [`../architecture/BACKEND_ARCHITECTURE.md`](../architecture/BACKEND_ARCHITECTURE.md)).
- Every DTO uses `class-validator` decorators; every controller method has an explicit return type.
- Domain errors are typed exception classes (`CampaignNotFundedException extends DomainException`), never thrown as bare strings or generic `Error`.
- Prisma queries select only the fields a given use case needs — no blanket `include: { everything }` on hot paths.

## Frontend conventions

- Server Components by default; a Client Component is justified by a comment noting why (state, effect, browser API) when it isn't obvious.
- No inline hex colors/spacing values — use Tailwind utilities mapped to `@clip/config` tokens (see [`../ui-ux/DESIGN_TOKENS.md`](../ui-ux/DESIGN_TOKENS.md)).
- Data fetching goes through `lib/api-client.ts`, never a raw `fetch` scattered in a component (see [`../architecture/FRONTEND_ARCHITECTURE.md`](../architecture/FRONTEND_ARCHITECTURE.md)).
- Every component handles its loading/empty/error states per [`../ui-ux/LOADING_STATES.md`](../ui-ux/LOADING_STATES.md), [`../ui-ux/EMPTY_STATES.md`](../ui-ux/EMPTY_STATES.md), [`../ui-ux/ERROR_STATES.md`](../ui-ux/ERROR_STATES.md) — not just the happy path.

## Comments

Comment *why*, not *what* — code should read clearly enough that a comment restating it is redundant. A comment is warranted for a non-obvious business rule ("// fee is locked at funding time per BUSINESS_RULES.md, not the current rate") or a workaround for an external API quirk.

## Commits

Conventional, present-tense, scoped: `feat(campaigns): add funding gate to lifecycle transition`, `fix(wallet): correct ledger balance reconciliation off-by-one`.

## Related documents

[`DEVELOPMENT_RULES.md`](DEVELOPMENT_RULES.md), [`FOLDER_STRUCTURE.md`](FOLDER_STRUCTURE.md), [`../architecture/BACKEND_ARCHITECTURE.md`](../architecture/BACKEND_ARCHITECTURE.md), [`../architecture/FRONTEND_ARCHITECTURE.md`](../architecture/FRONTEND_ARCHITECTURE.md).
