import { cookies } from "next/headers";
import type { ApiErrorShape } from "@clip/types";

/**
 * Server Component / Server Action fetch wrapper — forwards the incoming
 * request's session cookie explicitly, since server-side fetch doesn't do
 * that automatically. Imported ONLY by Server Components — see
 * ./api-client.ts for the Client Component twin, and the split's rationale
 * there (Next.js forbids next/headers in any client-bundled module).
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorShape | null;
    throw new Error(body?.error?.message ?? `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
