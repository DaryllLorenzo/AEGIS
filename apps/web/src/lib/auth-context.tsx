"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

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
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "aegis_token";

function decodeJwtPayload(token: string): AuthUser | null {
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

function isTokenExpired(token: string): boolean {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json);
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && !isTokenExpired(stored)) {
      setToken(stored);
      setUser(decodeJwtPayload(stored));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  function login(newToken: string, newUser: AuthUser) {
    localStorage.setItem(STORAGE_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ user, token, loading, login, logout }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
