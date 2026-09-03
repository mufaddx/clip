import * as Sentry from "@sentry/nextjs";

// Error monitoring — see docs/architecture/SECURITY_ARCHITECTURE.md. Empty
// dsn (no NEXT_PUBLIC_SENTRY_DSN set) makes the SDK a safe no-op, so this
// is fine to leave unconfigured in local dev.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
});
