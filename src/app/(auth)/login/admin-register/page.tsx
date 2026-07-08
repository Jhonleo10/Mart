"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailInput } from "@/components/ui/email-input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail, Shield, User } from "lucide-react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { AUTH_PATHS } from "@/lib/auth-paths";
import { adminRegisterSchema } from "@/lib/validations";
import { getValidatedForm, parseFormWithSchema } from "@/lib/validations/form-submit";
import { FIELD_LIMITS, PASSWORD_HINT } from "@/lib/validations/client";
import { isAdminRegistrationUnlocked } from "@/lib/admin-easter-egg";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setAllowed(isAdminRegistrationUnlocked());
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = getValidatedForm(e);
    if (!form) return;

    const formData = new FormData(form);
    const parsed = parseFormWithSchema(adminRegisterSchema, formData);
    if (!parsed.success) {
      toast.error(parsed.error);
      return;
    }

    setLoading(true);
    const { registerAdmin } = await import("@/actions/auth.actions");
    const result = await registerAdmin(formData);
    setLoading(false);

    if (result && "error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success("Admin account created. You can sign in now.");
    router.push(AUTH_PATHS.login);
  }

  if (!allowed) {
    return (
      <AuthPageShell
        badge="Restricted"
        title="Staff registration locked"
        subtitle="This page is only available after unlocking the staff portal on the login screen."
        activeTab="login"
        footer={
          <p className="text-center text-xs text-slate-500">
            <Link href={AUTH_PATHS.login} className="font-semibold text-brand-blue hover:underline">
              Back to login
            </Link>
          </p>
        }
      >
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Hint: on the login page, tap the subtitle five times quickly — or visit{" "}
          <code className="text-xs">/login?staff=genius</code>
        </p>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      badge="Staff Portal"
      badgeTone="green"
      title="Create admin account"
      subtitle="Bootstrap key required. Use only for trusted staff."
      activeTab="login"
      footer={
        <p className="text-center text-xs text-slate-500">
          <Link href={AUTH_PATHS.login} className="font-semibold text-brand-blue hover:underline">
            Back to login
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="auth-form-compact">
        <div className="auth-field">
          <Label htmlFor="name">Full Name</Label>
          <div className="auth-input-wrap">
            <User className="auth-input-icon" />
            <Input id="name" name="name" required placeholder="Admin name" className="auth-input" />
          </div>
        </div>
        <div className="auth-field">
          <Label htmlFor="email">Work Email</Label>
          <div className="auth-input-wrap">
            <Mail className="auth-input-icon" />
            <EmailInput id="email" name="email" required placeholder="admin@company.com" className="auth-input" />
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
              minLength={8}
              placeholder="Strong password"
              className="auth-input"
            />
            <button
              type="button"
              className="auth-input-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="auth-field">
          <Label htmlFor="bootstrapSecret">Bootstrap Key</Label>
          <div className="auth-input-wrap">
            <Shield className="auth-input-icon" />
            <Input
              id="bootstrapSecret"
              name="bootstrapSecret"
              required
              placeholder="Staff bootstrap key"
              autoComplete="off"
              className="auth-input"
            />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Create Admin Account"}
        </Button>
      </form>
    </AuthPageShell>
  );
}
