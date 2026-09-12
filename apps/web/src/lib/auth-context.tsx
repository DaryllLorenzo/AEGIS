"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getMe, refreshAccessToken } from "@/lib/api";

export type AuthUser = {
  userId: string;
  email: string;
  displayName: string;
  roles: string[];
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string, refreshToken: string, user: AuthUser, expiresAt: string) => void;
  logout: () => void;
  refreshTokenValue: string | null;
  onSessionWarning: (callback: () => void) => () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "aegis_token";
const REFRESH_TOKEN_KEY = "aegis_refresh_token";
const EXPIRES_AT_KEY = "aegis_expires_at";

const REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes before expiry

export function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json);
    return {
      userId: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ?? "",
      email: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ?? "",
      displayName: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ?? "",
      roles: Array.isArray(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"])
        ? payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"]
        : payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"]
          ? [payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"]]
          : [],
    };
  } catch {
    return null;
  }
}

function getTokenExpiry(token: string): number | null {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json);
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningCallbacksRef = useRef<Set<() => void>>(new Set());

  // Schedule proactive token refresh
  const scheduleRefresh = useCallback((expiresAtMs: number) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const now = Date.now();
    const refreshAt = expiresAtMs - REFRESH_BUFFER_MS;
    const delay = Math.max(refreshAt - now, 0);

    if (delay === 0) {
      // Already past the refresh window, try immediately
      return;
    }

    refreshTimerRef.current = setTimeout(async () => {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!storedRefreshToken) return;

      try {
        const result = await refreshAccessToken(storedRefreshToken);
        localStorage.setItem(TOKEN_KEY, result.token);
        localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
        setToken(result.token);
        setRefreshToken(result.refreshToken);

        // Re-schedule with new expiry
        const newExpiry = getTokenExpiry(result.token);
        if (newExpiry) {
          scheduleRefresh(newExpiry);
        }
      } catch {
        // Refresh failed, will be caught on next API call
      }
    }, delay);
  }, []);

  // Initialize auth state from localStorage and validate with server
  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!storedToken) {
        setLoading(false);
        return;
      }

      // Check if token is expired locally
      const expiry = getTokenExpiry(storedToken);
      if (expiry && expiry < Date.now()) {
        // Token expired locally, try refresh
        if (storedRefreshToken) {
          try {
            const result = await refreshAccessToken(storedRefreshToken);
            if (!cancelled) {
              localStorage.setItem(TOKEN_KEY, result.token);
              localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
              setToken(result.token);
              setRefreshToken(result.refreshToken);
              setUser(decodeJwtPayload(result.token));

              const newExpiry = getTokenExpiry(result.token);
              if (newExpiry) scheduleRefresh(newExpiry);
            }
          } catch {
            // Refresh failed, clear everything
            if (!cancelled) {
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(REFRESH_TOKEN_KEY);
              localStorage.removeItem(EXPIRES_AT_KEY);
            }
          }
        } else {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(EXPIRES_AT_KEY);
        }
        if (!cancelled) setLoading(false);
        return;
      }

      // Token not expired locally, validate with server
      try {
        const me = await getMe();
        if (!cancelled) {
          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setUser({
            userId: me.id,
            email: me.email,
            displayName: me.displayName,
            roles: [],
          });
          if (expiry) scheduleRefresh(expiry);
        }
      } catch {
        // Server rejected the token (401), clear everything
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem(EXPIRES_AT_KEY);
        }
      }

      if (!cancelled) setLoading(false);
    }

    initAuth();

    return () => {
      cancelled = true;
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [scheduleRefresh]);

  function login(newToken: string, newRefreshToken: string, newUser: AuthUser, expiresAt: string) {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    localStorage.setItem(EXPIRES_AT_KEY, expiresAt);
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    setUser(newUser);

    const expiry = getTokenExpiry(newToken);
    if (expiry) scheduleRefresh(expiry);
  }

  function logout() {
    // Call the backend logout endpoint to revoke the refresh token
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (storedRefreshToken && token) {
      import("@/lib/api").then(({ logoutUser }) => {
        logoutUser(storedRefreshToken).catch(() => {});
      });
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
    setToken(null);
    setRefreshToken(null);
    setUser(null);

    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }

  const onSessionWarning = useCallback((callback: () => void) => {
    warningCallbacksRef.current.add(callback);
    return () => {
      warningCallbacksRef.current.delete(callback);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      refreshTokenValue: refreshToken,
      onSessionWarning,
    }),
    [user, token, loading, refreshToken, onSessionWarning],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
