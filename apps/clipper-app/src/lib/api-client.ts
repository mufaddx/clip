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

export async function apiFetchClient<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorShape | null;
    throw new Error(body?.error?.message ?? `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
