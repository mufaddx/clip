# Folder Structure

## Repository root

```
C:\Clip
├── docs/                     ← this documentation tree (source of truth)
├── apps/
│   ├── public-web/           ← domain.in (Next.js)
│   ├── clipper-app/          ← clipper.domain.in (Next.js)
│   ├── brand-app/            ← brand.domain.in (Next.js)
│   ├── admin-app/            ← admin.domain.in (Next.js)
│   └── api/                  ← api.domain.in (NestJS)
├── packages/
│   ├── ui/                   ← @clip/ui shared components
│   ├── config/                ← @clip/config shared tailwind/eslint/env-schema
│   ├── types/                  ← @clip/types shared DTOs/types
│   ├── utilities/               ← @clip/utilities shared pure functions
│   └── db/                       ← @clip/db Prisma schema + client
├── package.json               ← workspace root, turbo scripts
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── .env.example
└── .gitignore
```

## Inside each Next.js app (`apps/{public-web,clipper-app,brand-app,admin-app}`)

```
app-name/
├── src/
│   ├── app/
│   │   ├── (public)/...        ← unauthenticated routes (public-web only)
│   │   ├── (auth)/login, signup
│   │   ├── (dashboard)/...     ← authenticated, role-specific routes
│   │   ├── layout.tsx
│   │   └── middleware.ts       ← session check + role redirect
│   ├── components/              ← app-specific components (not shared)
│   ├── lib/
│   │   ├── api-client.ts        ← typed fetch wrapper over @clip/types
│   │   └── auth.ts              ← server-side session helpers
│   └── styles/globals.css
├── next.config.js
├── package.json
└── tsconfig.json                ← extends ../../tsconfig.base.json
```

## Inside `apps/api`

```
api/
├── src/
│   ├── modules/
│   │   └── <name>/
│   │       ├── <name>.controller.ts
│   │       ├── <name>.service.ts
│   │       ├── <name>.module.ts
│   │       ├── dto/
│   │       └── entities/
│   ├── workers/                  ← BullMQ worker entrypoints (see ../architecture/BACKGROUND_JOBS.md)
│   ├── common/                    ← guards, filters, pipes, decorators shared across modules
│   ├── main.ts                     ← HTTP entrypoint
│   └── worker.ts                    ← worker process entrypoint (separate from HTTP)
├── package.json
└── tsconfig.json
```

## Inside `packages/db`

```
db/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   └── index.ts                    ← exports the Prisma client singleton
└── package.json
```

## Rule

A file's location should be guessable from this document without opening the file — if a new kind of file doesn't fit an existing folder, that's a signal to either extend this document deliberately or reconsider the file's placement, not to drop it wherever is convenient.

## Related documents

[`../architecture/APPLICATION_ARCHITECTURE.md`](../architecture/APPLICATION_ARCHITECTURE.md), [`CODING_STANDARDS.md`](CODING_STANDARDS.md).
