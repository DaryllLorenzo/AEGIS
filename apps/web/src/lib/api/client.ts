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
let _refreshTokenFn: (() => Promise<string | null>) | null = null;
let _onAuthFailure: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  _authToken = token;
}

export function getAuthToken(): string | null {
  return _authToken;
}

/**
 * Register a function that will attempt to refresh the auth token.
 * Called automatically when a 401 is received.
 */
export function setTokenRefresher(refreshFn: () => Promise<string | null>) {
  _refreshTokenFn = refreshFn;
}

/**
 * Register a callback that fires when authentication fails permanently
 * (refresh token also expired/invalid). Used to redirect to login.
 */
export function setAuthFailureHandler(handler: () => void) {
  _onAuthFailure = handler;
}

// ---------------------------------------------------------------------------
// Core fetch helper with 401 handling and auto-refresh
// ---------------------------------------------------------------------------

let _isRefreshing = false;
let _refreshPromise: Promise<string | null> | null = null;

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

  // Handle 401 Unauthorized — attempt token refresh
  if (res.status === 401 && _refreshTokenFn) {
    // If already refreshing, wait for the existing refresh
    if (_isRefreshing && _refreshPromise) {
      const newToken = await _refreshPromise;
      if (newToken) {
        return retryWithNewToken<T>(url, init, newToken);
      }
    }

    // Start a new refresh attempt
    _isRefreshing = true;
    _refreshPromise = attemptTokenRefresh();

    try {
      const newToken = await _refreshPromise;
      if (newToken) {
        return retryWithNewToken<T>(url, init, newToken);
      }
    } finally {
      _isRefreshing = false;
      _refreshPromise = null;
    }

    // Refresh failed — notify auth failure
    if (_onAuthFailure) {
      _onAuthFailure();
    }
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

async function attemptTokenRefresh(): Promise<string | null> {
  if (!_refreshTokenFn) return null;

  try {
    const newToken = await _refreshTokenFn();
    return newToken;
  } catch {
    return null;
  }
}

async function retryWithNewToken<T>(
  url: string,
  init: RequestInit | undefined,
  newToken: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...init?.headers as Record<string, string>,
  };
  headers["Authorization"] = `Bearer ${newToken}`;

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
