import type { ApiErrorShape } from "@clip/types";

/**
 * Client Component fetch wrapper over api.domain.in — the browser attaches
 * the session cookie itself via `credentials: "include"`. See
 * docs/architecture/FRONTEND_ARCHITECTURE.md "Data fetching rules".
 *
 * Deliberately does NOT import next/headers — Next.js forbids that in any
 * module a Client Component's bundle touches, even transitively. The
 * server-side twin (`apiFetch`, which does use next/headers) lives in
 * ./api-client.server.ts instead, imported only by Server Components.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// The access token is only good for 15 minutes; someone can easily sit on
// one dashboard page (no navigation, so middleware never gets a chance to
// silently refresh it) for longer than that. On a 401, swap it out via the
// 30d refresh token cookie and retry once instead of surfacing a spurious
// error — see docs/users/AUTHENTICATION_FLOW.md "Silent refresh".
async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/v1/auth/refresh`, { method: "POST", credentials: "include" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiFetchClient<T>(path: string, init?: RequestInit): Promise<T> {
  const doFetch = () =>
    fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init?.headers },
    });

  let res = await doFetch();

  if (res.status === 401 && !path.startsWith("/v1/auth/")) {
    if (await tryRefresh()) {
      res = await doFetch();
    }
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorShape | null;
    throw new Error(body?.error?.message ?? `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
