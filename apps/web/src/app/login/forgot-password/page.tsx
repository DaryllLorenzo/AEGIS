import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

import Brand from "@/components/aegis/Brand";

export default function ForgotPasswordPage() {
  return (
    <main className="login-page login-page--simple">
      <section className="login-form-panel"><div className="login-form-panel__inner"><div className="login-simple-brand"><Brand /></div><p className="eyebrow">Reset password</p><h2>Recover your account</h2><p className="login-intro">Enter the institutional email associated with your AEGIS profile.</p><form className="login-form"><label htmlFor="recovery-email">Institutional email</label><input id="recovery-email" type="email" placeholder="you@university.edu" required /><button className="button button--primary login-submit" type="submit"><Mail size={17} />Send recovery link</button></form><Link className="login-back" href="/login"><ArrowLeft size={14} />Back to sign in</Link></div></section>
    </main>
  );
}
