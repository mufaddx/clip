import type { ApiErrorShape } from "@clip/types";

/**
 * Thin typed fetch wrapper over api.domain.in — see
 * docs/architecture/FRONTEND_ARCHITECTURE.md "Data fetching rules".
 * Every Server/Client Component calls the API through this, never a raw
 * `fetch` scattered through components.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Carries the backend's error `code` (see HttpExceptionFilter) alongside
 * the message, so callers can branch on it (e.g. the signup flow's
 * register-then-fall-back-to-login on EMAIL_IN_USE) instead of matching
 * on message text. */
export class ApiError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorShape | null;
    throw new ApiError(
      body?.error?.message ?? `Request failed with status ${res.status}`,
      body?.error?.code ?? "UNKNOWN"
    );
  }

  return res.json() as Promise<T>;
}
