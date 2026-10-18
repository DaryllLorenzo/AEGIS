"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Brand from "@/components/aegis/Brand";
import { login as apiLogin } from "@aegis/api-client";
import { useAuth, decodeJwtPayload } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login: ctxLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await apiLogin({ email, password });

      const user = decodeJwtPayload(res.token);
      if (!user) {
        throw new Error("Failed to decode token.");
      }

      ctxLogin(res.token, res.refreshToken, user);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <Brand className="mb-9" />
        <h2 className="font-heading text-2xl font-bold">Sign in to AEGIS</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Use your institutional account to continue.
        </p>

        <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="email">Institutional email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@university.edu"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/login/forgot-password"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                className="pr-10"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <LockKeyhole className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="mt-1 w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Signing in...
              </>
            ) : (
              <>
                Sign in <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Need access?{" "}
          <a href="mailto:research-admin@aegis.local" className="font-semibold text-primary">
            Contact your research administrator
          </a>
        </p>
      </div>
    </main>
  );
}
