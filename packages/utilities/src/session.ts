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
export const REFRESH_TOKEN_COOKIE = "clip_refresh_token";

export interface EdgeRefreshResult {
  session: SessionUser;
  accessToken: string;
  refreshToken: string;
}

/**
 * Called from middleware when the access token (15m) is missing or expired
 * but the refresh token cookie (30d) is still present — see
 * docs/users/AUTHENTICATION_FLOW.md "Silent refresh". Without this, every
 * dashboard app bounced the user to /login the moment the access token's
 * short TTL passed, even though a perfectly valid 30-day session existed.
 *
 * This hits the real POST /v1/auth/refresh (so revocation/rotation still
 * goes through the DB — a logout elsewhere still ends the session here) but
 * identifies itself with AUTH_SECRET (shared only between the API and each
 * frontend's own server-side env, never sent by a browser) so the API also
 * returns the new tokens in the JSON body. That's necessary because a
 * generic `fetch()` response can't be trusted to expose more than one
 * Set-Cookie header reliably — the `Expires=Wed, 21 Oct...` attribute's own
 * comma makes naively splitting a combined header ambiguous.
 */
export async function refreshSessionAtEdge(
  apiUrl: string,
  refreshToken: string,
  authSecret: string
): Promise<EdgeRefreshResult | null> {
  try {
    const res = await fetch(`${apiUrl}/v1/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}`,
        "x-edge-refresh-secret": authSecret,
      },
    });
    if (!res.ok) return null;

    const body = (await res.json()) as Partial<EdgeRefreshResult> & { user?: SessionUser };
    if (!body.accessToken || !body.refreshToken || !body.user) return null;

    return { session: body.user, accessToken: body.accessToken, refreshToken: body.refreshToken };
  } catch {
    return null;
  }
}

/**
 * Rewrites specific cookies within a raw `Cookie` request header string,
 * leaving every other cookie untouched. Used by middleware after a silent
 * refresh (see refreshSessionAtEdge above) to forward the freshly minted
 * access/refresh tokens to *this same request's* Server Components — the
 * outgoing response's Set-Cookie only takes effect for the browser's next
 * request, not the one already in flight.
 */
export function buildCookieHeader(originalHeader: string | null | undefined, updates: Record<string, string>): string {
  const pairs = new Map<string, string>();
  for (const part of (originalHeader ?? "").split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    pairs.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
  }
  for (const [key, value] of Object.entries(updates)) {
    pairs.set(key, value);
  }
  return Array.from(pairs.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
}
