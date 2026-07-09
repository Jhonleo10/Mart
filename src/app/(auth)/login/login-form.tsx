"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailInput } from "@/components/ui/email-input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { FIELD_LIMITS } from "@/lib/validations/fields";
import { loginSchema } from "@/lib/validations";
import { getValidatedForm, parseFormWithSchema } from "@/lib/validations/form-submit";
import { AUTH_PATHS, isSafeCallbackUrl } from "@/lib/auth-paths";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import {
  ADMIN_UNLOCK_QUERY,
  ADMIN_UNLOCK_VALUE,
  unlockAdminRegistration,
} from "@/lib/admin-easter-egg";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      toast.success("Email verified! You can sign in now.");
    }
    if (searchParams.get(ADMIN_UNLOCK_QUERY) === ADMIN_UNLOCK_VALUE) {
      unlockAdminRegistration();
      setAdminUnlocked(true);
      toast.message("Staff portal unlocked");
    } else if (typeof window !== "undefined" && sessionStorage.getItem("dgm-admin-unlock") === "1") {
      setAdminUnlocked(true);
    }
  }, [searchParams]);

  function handleSubtitleTap() {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 2500);

    if (tapCountRef.current >= 5) {
      unlockAdminRegistration();
      setAdminUnlocked(true);
      tapCountRef.current = 0;
      toast.success("Staff portal unlocked");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = getValidatedForm(e);
    if (!form) return;

    const formData = new FormData(form);
    const parsed = parseFormWithSchema(loginSchema, formData);
    if (!parsed.success) {
      toast.error(parsed.error);
      return;
    }

    setLoading(true);
    const email = formData.get("email") as string;
    try {
      const { loginUser } = await import("@/actions/auth.actions");
      const result = await loginUser(formData);

      if (result && "error" in result) {
        toast.error(result.error);
        if (result.error.toLowerCase().includes("verify")) {
          router.push(`/verify-user?email=${encodeURIComponent(email)}`);
        }
        return;
      }

      toast.success("Welcome back!");
      const callbackUrl = searchParams.get("callbackUrl");
      const redirectTo =
        callbackUrl &&
        isSafeCallbackUrl(callbackUrl) &&
        result.data?.role === "USER"
          ? callbackUrl
          : (result.data?.redirectTo ?? AUTH_PATHS.login);
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error("[login]", error);
      toast.error("Sign-in failed. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell
      badge="Sign In"
      activeTab="login"
      title="Welcome back"
      subtitle="One login for buyers, sellers, and admins."
      onSubtitleClick={handleSubtitleTap}
      footer={
        <div className="space-y-3">
          <p className="text-center text-xs text-slate-500">
            New here?{" "}
            <Link href={AUTH_PATHS.userRegister} className="font-semibold text-brand-blue hover:underline">
              Create buyer account
            </Link>
            {" · "}
            <Link href={AUTH_PATHS.companyRegister} className="font-semibold text-brand-green hover:underline">
              Become a seller
            </Link>
          </p>
          {adminUnlocked ? (
            <p className="text-center text-xs">
              <Link
                href="/login/admin-register"
                className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-brand-blue"
              >
                <Shield className="h-3.5 w-3.5" />
                Register staff admin
              </Link>
            </p>
          ) : null}
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="auth-form-compact">
        <div className="auth-field">
          <Label htmlFor="email">Email</Label>
          <div className="auth-input-wrap">
            <Mail className="auth-input-icon" />
            <EmailInput
              id="email"
              name="email"
              required
              defaultValue={searchParams.get("email") ?? ""}
              placeholder="you@example.com"
              className="auth-input"
            />
          </div>
        </div>

        <div className="auth-field">
          <Label htmlFor="password">Password</Label>
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

        <div className="flex items-center justify-between text-xs">
          <label className="flex cursor-pointer items-center gap-1.5">
            <input type="checkbox" className="rounded border-slate-300 text-brand-blue" />
            <span className="text-slate-600">Remember me</span>
          </label>
          <Link href="/forgot-password" className="font-medium text-brand-blue hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </AuthPageShell>
  );
}
