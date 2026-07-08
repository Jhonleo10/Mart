"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import { AUTH_PATHS } from "@/lib/auth-paths";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { resetPasswordSchema } from "@/lib/validations";
import { getValidatedForm, parseFormWithSchema } from "@/lib/validations/form-submit";
import { FIELD_LIMITS, PASSWORD_HINT } from "@/lib/validations/client";
import { resetPassword } from "@/actions/auth.actions";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = getValidatedForm(e);
    if (!form) return;

    if (!token) {
      toast.error("Reset link is invalid or missing");
      return;
    }

    const formData = new FormData(form);
    formData.set("token", token);
    const parsed = parseFormWithSchema(resetPasswordSchema, formData);
    if (!parsed.success) {
      toast.error(parsed.error);
      return;
    }

    setLoading(true);
    const result = await resetPassword(formData);
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    setDone(true);
    toast.success("Password updated successfully");
  }

  if (!token) {
    return (
      <AuthPageShell
        badge="Account Recovery"
        activeTab="login"
        title="Invalid reset link"
        subtitle="This password reset link is missing or malformed."
        footer={
          <p className="text-center text-xs text-slate-500">
            <Link href="/forgot-password" className="font-semibold text-brand-blue hover:underline">
              Request a new reset link
            </Link>
          </p>
        }
      >
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-600">
          Please request a new password reset email and use the latest link within 30 minutes.
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      badge="Account Recovery"
      activeTab="login"
      title="Set a new password"
      subtitle="Choose a strong password to secure your Genius Mart account."
      footer={
        <p className="text-center text-xs text-slate-500">
          <Link href={AUTH_PATHS.login} className="inline-flex items-center gap-1 font-semibold text-brand-blue hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </p>
      }
    >
      {done ? (
        <div className="rounded-xl border border-brand-green/20 bg-brand-green/5 p-4 text-sm text-slate-600">
          <p>Your password has been updated. You can now sign in with your new credentials.</p>
          <Link href={AUTH_PATHS.login} className="mt-4 inline-block font-semibold text-brand-blue hover:underline">
            Go to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form-compact">
          <div className="auth-field">
            <Label htmlFor="password">New password</Label>
            <div className="auth-input-wrap">
              <Lock className="auth-input-icon" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={FIELD_LIMITS.password.min}
                maxLength={FIELD_LIMITS.password.max}
                placeholder="••••••••"
                className="auth-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-input-toggle"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="auth-field">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="auth-input-wrap">
              <Lock className="auth-input-icon" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                required
                minLength={FIELD_LIMITS.password.min}
                maxLength={FIELD_LIMITS.password.max}
                placeholder="••••••••"
                className="auth-input"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="auth-input-toggle"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">{PASSWORD_HINT}</p>
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      )}
    </AuthPageShell>
  );
}
