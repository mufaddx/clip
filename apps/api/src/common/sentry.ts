import * as Sentry from "@sentry/node";
import { getEnv } from "@clip/config";

/**
 * Error monitoring — see docs/architecture/SECURITY_ARCHITECTURE.md.
 * Optional: both the HTTP entrypoint (main.ts) and the worker entrypoint
 * (worker.ts) call this first; every app runs fine with SENTRY_DSN unset.
 */
export function initSentry(): void {
  const env = getEnv();
  if (!env.SENTRY_DSN) return;

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1.0,
  });
}

export { Sentry };
