"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Loader2 } from "lucide-react";
import { useState } from "react";

import Brand from "@/components/aegis/Brand";
import { login as apiLogin, setAuthToken } from "@/lib/api";
import { useAuth, type AuthUser } from "@/lib/auth-context";

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
      setAuthToken(res.token);

      const payload = JSON.parse(atob(res.token.split(".")[1]));
      const user: AuthUser = {
        userId: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ?? "",
        email: res.email,
        displayName: res.displayName,
        roles: Array.isArray(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"])
          ? payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"]
          : payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"]
            ? [payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"]]
            : [],
      };

      ctxLogin(res.token, user);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page login-page--simple">
      <section className="login-form-panel">
        <div className="login-form-panel__inner">
          <div className="login-simple-brand"><Brand /></div>
          <h2>Sign in to AEGIS</h2>
          <p className="login-intro">Use your institutional account to continue.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Institutional email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@university.edu"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="login-form__label-row"><label htmlFor="password">Password</label><Link href="/login/forgot-password">Forgot password?</Link></div>
            <div className="password-field">
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <LockKeyhole size={17} />
            </div>
            {error && <p style={{ color: "red", fontSize: 14 }}>{error}</p>}
            <button className="button button--primary login-submit" type="submit" disabled={submitting}>
              {submitting ? (
                <><Loader2 size={17} className="animate-spin" /> Signing in...</>
              ) : (
                <>Sign in <ArrowRight size={17} /></>
              )}
            </button>
          </form>

          <div className="login-divider"><span>or</span></div>
          <button className="button button--secondary login-sso" type="button">Continue with university SSO</button>
          <p className="login-support">Need access? <a href="mailto:research-admin@aegis.local">Contact your research administrator</a></p>
        </div>
      </section>
    </main>
  );
}
