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

// The signup flow's "one last thing" name step calls this a while after
// verify-email issued its (15m) access token — long enough, between
// checking email for the OTP and typing a name, that it can already be
// expired. Rather than surfacing that as an error, silently swap it out for
// a fresh one via the 30d refresh token cookie and retry once — see
// docs/users/AUTHENTICATION_FLOW.md "Silent refresh".
async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/v1/auth/refresh`, { method: "POST", credentials: "include" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
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
    throw new ApiError(
      body?.error?.message ?? `Request failed with status ${res.status}`,
      body?.error?.code ?? "UNKNOWN"
    );
  }

  return res.json() as Promise<T>;
}
