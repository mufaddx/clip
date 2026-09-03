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

  PAYMENT_PROVIDER_KEY: z.string().optional(),
  PAYMENT_PROVIDER_SECRET: z.string().optional(),
  PAYMENT_WEBHOOK_SECRET: z.string().optional(),

  EMAIL_FROM: z.string().optional(),
  EMAIL_PROVIDER_API_KEY: z.string().optional(),
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
