"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import TokenSync from "./TokenSync";
import SessionWarning from "./SessionWarning";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TokenSync>
        {children}
        <SessionWarning />
      </TokenSync>
    </AuthProvider>
  );
}
