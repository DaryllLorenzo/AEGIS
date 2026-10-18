import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Brand from "@/components/aegis/Brand";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <Brand className="mb-9" />
        <p className="eyebrow">Reset password</p>
        <h2 className="font-heading mt-1 text-2xl font-bold">Recover your account</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the institutional email associated with your AEGIS profile.
        </p>

        <form className="mt-7 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="recovery-email">Institutional email</Label>
            <Input id="recovery-email" type="email" placeholder="you@university.edu" required />
          </div>
          <Button type="submit" className="w-full">
            <Mail className="size-4" />
            Send recovery link
          </Button>
        </form>

        <Link
          className="mt-5 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          href="/login"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
