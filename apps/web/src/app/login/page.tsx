import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";

import Brand from "@/components/aegis/Brand";

export default function LoginPage() {
  return (
    <main className="login-page login-page--simple">
      <section className="login-form-panel">
        <div className="login-form-panel__inner">
          <div className="login-simple-brand"><Brand /></div>
          <h2>Sign in to AEGIS</h2>
          <p className="login-intro">Use your institutional account to continue.</p>

          <form className="login-form" action="/">
            <label htmlFor="email">Institutional email</label>
            <input id="email" name="email" type="email" placeholder="you@university.edu" autoComplete="email" required />
            <div className="login-form__label-row"><label htmlFor="password">Password</label><Link href="/login/forgot-password">Forgot password?</Link></div>
            <div className="password-field"><input id="password" name="password" type="password" placeholder="Enter your password" autoComplete="current-password" required /><LockKeyhole size={17} /></div>
            <label className="checkbox-row"><input type="checkbox" name="remember" /> <span>Keep me signed in on this device</span></label>
            <button className="button button--primary login-submit" type="submit">Sign in <ArrowRight size={17} /></button>
          </form>

          <div className="login-divider"><span>or</span></div>
          <button className="button button--secondary login-sso" type="button">Continue with university SSO</button>
          <p className="login-support">Need access? <a href="mailto:research-admin@aegis.local">Contact your research administrator</a></p>
          <Link className="login-back" href="/">Back to dashboard preview</Link>
        </div>
      </section>
    </main>
  );
}
