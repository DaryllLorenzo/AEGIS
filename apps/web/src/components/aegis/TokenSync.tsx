"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { setAuthToken, setTokenRefresher, setAuthFailureHandler } from "@/lib/api";
import { refreshAccessToken } from "@/lib/api";

/**
 * Syncs the auth token from React state into the module-level variable
 * that api.ts uses for Bearer headers. Also registers the token refresher
 * and auth failure handler for automatic 401 recovery.
 */
export default function TokenSync({ children }: { children: React.ReactNode }) {
  const { token, refreshTokenValue } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    if (!refreshTokenValue) return;

    setTokenRefresher(async () => {
      try {
        const result = await refreshAccessToken(refreshTokenValue);
        // Update the module-level token
        setAuthToken(result.token);
        // Store new tokens in localStorage
        localStorage.setItem("aegis_token", result.token);
        localStorage.setItem("aegis_refresh_token", result.refreshToken);
        return result.token;
      } catch {
        return null;
      }
    });

    return () => {
      setTokenRefresher(async () => null);
    };
  }, [refreshTokenValue]);

  useEffect(() => {
    setAuthFailureHandler(() => {
      router.push("/login");
    });

    return () => {
      setAuthFailureHandler(() => {});
    };
  }, [router]);

  return <>{children}</>;
}
