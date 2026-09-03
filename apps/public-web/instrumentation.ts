// Sentry's recommended hook for the Edge runtime. public-web has no
// middleware.ts today, so this rarely triggers, but it's here for
// consistency with the other three apps and in case that changes.
export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
