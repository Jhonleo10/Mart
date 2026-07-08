"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailInput } from "@/components/ui/email-input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { AUTH_PATHS } from "@/lib/auth-paths";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { forgotPasswordSchema } from "@/lib/validations";
import { getValidatedForm, parseFormWithSchema } from "@/lib/validations/form-submit";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = getValidatedForm(e);
    if (!form) return;

    const formData = new FormData(form);
    const parsed = parseFormWithSchema(forgotPasswordSchema, formData);
    if (!parsed.success) {
      toast.error(parsed.error);
      return;
    }

    setLoading(true);
    const { requestPasswordReset } = await import("@/actions/auth.actions");
    const result = await requestPasswordReset(formData);
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    setSent(true);
    toast.success("If that email exists, we sent reset instructions.");
  }

  return (
    <AuthPageShell
      badge="Account Recovery"
      activeTab="login"
      title="Forgot password?"
      subtitle="Enter your email and we'll send a secure reset link."
      footer={
        <p className="text-center text-xs text-slate-500">
          Remember your password?{" "}
          <Link href={AUTH_PATHS.login} className="font-semibold text-brand-blue hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="rounded-xl border border-brand-green/20 bg-brand-green/5 p-4 text-sm text-slate-600">
          <p>Check your inbox for password reset instructions. The link expires in 30 minutes.</p>
          <Link
            href={AUTH_PATHS.login}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form-compact">
          <div className="auth-field">
            <Label htmlFor="email">Email address</Label>
            <div className="auth-input-wrap">
              <Mail className="auth-input-icon" />
              <EmailInput
                id="email"
                name="email"
                required
                placeholder="you@example.com"
                className="auth-input"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      )}
    </AuthPageShell>
  );
}
