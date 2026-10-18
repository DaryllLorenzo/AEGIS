"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/lib/auth-context";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
