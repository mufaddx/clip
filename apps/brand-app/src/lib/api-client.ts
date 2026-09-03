import { cookies } from "next/headers";
import type { ApiErrorShape } from "@clip/types";

/**
 * Typed fetch wrapper over api.domain.in — see
 * docs/architecture/FRONTEND_ARCHITECTURE.md "Data fetching rules".
 * Server Components use `apiFetch` (forwards the incoming request's
 * session cookie explicitly, since server-side fetch doesn't do that
 * automatically); Client Components use `apiFetchClient` (the browser
 * attaches the cookie itself via `credentials: "include"`).
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function parseOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorShape | null;
    throw new Error(body?.error?.message ?? `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Server Component / Server Action fetch — forwards the session cookie explicitly. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieStore.toString(),
      ...init?.headers,
    },
    cache: "no-store",
  });
  return parseOrThrow<T>(res);
}

/** Client Component fetch — the browser sends the cookie automatically. */
export async function apiFetchClient<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  return parseOrThrow<T>(res);
}
