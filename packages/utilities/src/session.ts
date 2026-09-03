import { jwtVerify } from "jose";
import type { SessionUser } from "@clip/types";

/**
 * Verifies the access token cookie in Next.js middleware (Edge runtime) —
 * shared by clipper-app/brand-app/admin-app's middleware.ts so the same
 * verification logic isn't reimplemented per app. This is a UX convenience
 * only; the API independently re-verifies on every request — see
 * docs/architecture/SECURITY_ARCHITECTURE.md.
 */
export async function verifySessionToken(
  token: string | undefined,
  secret: string
): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export const ACCESS_TOKEN_COOKIE = "clip_access_token";
