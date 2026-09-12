/**
 * Base URL of the AEGIS API.
 *
 * API_URL is the address reachable from the Next.js server (the Aspire endpoint in
 * development, the compose service name in Docker). NEXT_PUBLIC_API_URL is the address the
 * browser uses and is the only one inlined into client bundles.
 */
export const apiBaseUrl =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5180";

// ---------------------------------------------------------------------------
// Auth token management
// ---------------------------------------------------------------------------

let _authToken: string | null = null;

export function setAuthToken(token: string | null) {
  _authToken = token;
}

export function getAuthToken(): string | null {
  return _authToken;
}

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${apiBaseUrl}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...init?.headers as Record<string, string>,
  };

  if (_authToken) {
    headers["Authorization"] = `Bearer ${_authToken}`;
  }

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
