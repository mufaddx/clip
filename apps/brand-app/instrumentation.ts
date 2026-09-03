// Sentry's recommended hook for the Edge runtime (middleware.ts) — see
// docs/architecture/DOMAIN_ARCHITECTURE.md "Routing enforcement". The
// Node.js runtime is still covered by sentry.server.config.ts's own
// auto-detection; only the edge config needs to move here.
export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
