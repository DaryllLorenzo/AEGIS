"use client";

import type { ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import "@/lib/api-config";
import { AuthProvider } from "@/lib/auth-context";
import TokenSync from "./TokenSync";
import SessionWarning from "./SessionWarning";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TooltipProvider delayDuration={200}>
        <TokenSync>
          {children}
          <SessionWarning />
        </TokenSync>
      </TooltipProvider>
    </AuthProvider>
  );
}
