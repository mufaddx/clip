import * as Sentry from "@sentry/nextjs";

// Covers middleware.ts (see docs/architecture/DOMAIN_ARCHITECTURE.md
// "Routing enforcement") — the Edge runtime needs its own init.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
});
