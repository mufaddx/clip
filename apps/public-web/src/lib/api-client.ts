import type { ApiErrorShape } from "@clip/types";

/**
 * Thin typed fetch wrapper over api.domain.in — see
 * docs/architecture/FRONTEND_ARCHITECTURE.md "Data fetching rules".
 * Every Server/Client Component calls the API through this, never a raw
 * `fetch` scattered through components.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorShape | null;
    throw new Error(body?.error?.message ?? `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}
