import { z } from "zod";

/**
 * Validated environment schema — see .env.example and
 * docs/development/ENVIRONMENT_SETUP.md. Import `getEnv()` instead of
 * reading `process.env.X` ad hoc, so a missing/malformed variable fails
 * fast at startup rather than deep inside a request handler.
 */
const envSchema = z.object({
  PRIMARY_DOMAIN: z.string().default("domain.in"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  PUBLIC_APP_URL: z.string().url(),
  CLIPPER_APP_URL: z.string().url(),
  BRAND_APP_URL: z.string().url(),
  ADMIN_APP_URL: z.string().url(),
  API_URL: z.string().url(),

  AUTH_SECRET: z.string().min(16),
  AUTH_COOKIE_DOMAIN: z.string(),
  AUTH_ACCESS_TOKEN_TTL: z.string().default("15m"),
  AUTH_REFRESH_TOKEN_TTL: z.string().default("30d"),

  DATABASE_URL: z.string(),
  // Only needed when DATABASE_URL is a pooled (pgbouncer) connection, e.g.
  // Supabase — `prisma migrate` uses this direct connection instead. See
  // docs/deployment/ENVIRONMENT_STRATEGY.md.
  DIRECT_URL: z.string().optional(),
  REDIS_URL: z.string(),

  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  META_REDIRECT_URI: z.string().optional(),
  META_GRAPH_API_VERSION: z.string().default("v21.0"),

  // AES-256-GCM key (32 raw bytes, base64-encoded) for encrypting
  // instagram_tokens at rest — see docs/architecture/SECURITY_ARCHITECTURE.md
  // "Token storage (Meta/Instagram)". Deliberately separate from AUTH_SECRET.
  TOKEN_ENCRYPTION_KEY: z.string().optional(),

  // Razorpay — PAYMENT_PROVIDER_KEY/SECRET are the Key ID/Key Secret from
  // the Razorpay dashboard; PAYMENT_WEBHOOK_SECRET is set when configuring
  // the webhook endpoint there. RAZORPAY_ACCOUNT_NUMBER is the platform's
  // own RazorpayX virtual account, needed only for creator payouts — see
  // docs/finance/WITHDRAWAL_SYSTEM.md and PaymentsService.
  PAYMENT_PROVIDER_KEY: z.string().optional(),
  PAYMENT_PROVIDER_SECRET: z.string().optional(),
  PAYMENT_WEBHOOK_SECRET: z.string().optional(),
  RAZORPAY_ACCOUNT_NUMBER: z.string().optional(),
  // Not consumed by any code yet — recorded for when a feature actually needs it.
  RAZORPAY_MERCHANT_ID: z.string().optional(),

  // Resend — see docs/operations/NOTIFICATION_SYSTEM.md "Email".
  EMAIL_FROM: z.string().optional(),
  EMAIL_PROVIDER_API_KEY: z.string().optional(),

  // Cloudflare R2 — campaign asset uploads (brand-uploaded video/image
  // creative for a campaign). S3-compatible: R2_ENDPOINT is the
  // account-level API endpoint, R2_BUCKET_NAME is passed separately to the
  // S3 client per-request. R2_PUBLIC_URL is the public r2.dev prefix used
  // to build the mediaUrl clients actually view. See UploadsService.
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_ENDPOINT: z.string().optional(),
  R2_PUBLIC_URL: z.string().optional(),

  // Sentry — see docs/architecture/SECURITY_ARCHITECTURE.md and the
  // per-app sentry config files. Optional: apps run fine without it.
  SENTRY_DSN: z.string().optional(),
  // Browser-bundled twin of SENTRY_DSN for the four Next.js apps' client
  // config — NEXT_PUBLIC_ prefixed since it ships to the browser (a DSN is
  // safe to expose; it's write-only for error reports, not a secret).
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/** Validates process.env once and caches the result for the process lifetime. */
export function getEnv(): Env {
  if (!cached) {
    cached = envSchema.parse(process.env);
  }
  return cached;
}
