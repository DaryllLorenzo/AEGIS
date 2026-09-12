"use client";

import type { ReactNode } from "react";
import AuthGuard from "@/components/aegis/AuthGuard";
import AppShell from "@/components/aegis/AppShell";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
