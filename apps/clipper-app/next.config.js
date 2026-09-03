const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@clip/ui", "@clip/types", "@clip/config", "@clip/utilities"],
};

// withSentryConfig no-ops cleanly at build time when SENTRY_AUTH_TOKEN/ORG/PROJECT
// aren't set (no source-map upload) — see docs/architecture/SECURITY_ARCHITECTURE.md.
module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: false,
  disableLogger: true,
});
