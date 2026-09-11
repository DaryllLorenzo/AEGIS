"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { setAuthToken } from "@/lib/api";

/**
 * Syncs the auth token from React state into the module-level variable
 * that api.ts uses for Bearer headers. Also renders children.
 */
export default function TokenSync({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  return <>{children}</>;
}
