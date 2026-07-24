"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailInput } from "@/components/ui/email-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { FIELD_LIMITS, PASSWORD_HINT, PHONE_HINT } from "@/lib/validations/client";
import { registerSchema } from "@/lib/validations";
import { getValidatedForm } from "@/lib/validations/form-submit";
import { AUTH_PATHS, isSafeCallbackUrl } from "@/lib/auth-paths";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { AuthFormField } from "@/components/ui/auth-form-field";
import { useZodFormErrors } from "@/hooks/use-zod-form-errors";
import { cn } from "@/lib/utils";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { fieldError, validateAll, validateField } = useZodFormErrors(registerSchema);

  function blurField(fieldName: string) {
    const form = formRef.current;
    if (form) validateField(form, fieldName);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = getValidatedForm(e);
    if (!form) return;

    const formData = new FormData(form);
    if (!validateAll(formData)) return;

    setLoading(true);
    const { registerUser } = await import("@/actions/auth.actions");
    const result = await registerUser(formData);
    setLoading(false);

    if (result && "error" in result) {
      toast.error(result.error);
      return;
    }

    const email = result.data?.email ?? (formData.get("email") as string);
    toast.success("Check your email for the 6-digit verification code.");
    const callbackUrl = searchParams.get("callbackUrl");
    const verifyParams = new URLSearchParams({ email });
    if (callbackUrl && isSafeCallbackUrl(callbackUrl)) {
      verifyParams.set("callbackUrl", callbackUrl);
    }
    router.push(`/verify-user?${verifyParams.toString()}`);
  }

  return (
    <AuthPageShell
      badge="Buyer Account"
      activeTab="buyer"
      compact
      fitViewport
      centerHeader
      title="Create your account"
      subtitle="Browse software, save favourites, and book demos."
      footer={
        <div className="text-center text-xs text-slate-500">
          <p>
            Already registered?{" "}
            <Link
              href={
                searchParams.get("callbackUrl") && isSafeCallbackUrl(searchParams.get("callbackUrl")!)
                  ? `/login?callbackUrl=${encodeURIComponent(searchParams.get("callbackUrl")!)}`
                  : AUTH_PATHS.login
              }
              className="font-semibold text-brand-blue hover:underline"
            >
              Sign in
            </Link>
            {" · "}
            <Link href={AUTH_PATHS.companyRegister} className="font-semibold text-brand-green hover:underline">
              Become a Vendor
            </Link>
            {" · "}
            <Link href="/terms-of-service" className="hover:text-brand-blue hover:underline">
              Terms
            </Link>
            {" · "}
            <Link href="/privacy-policy" className="hover:text-brand-blue hover:underline">
              Privacy
            </Link>
          </p>
        </div>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit} className="auth-form-compact auth-form-tight" noValidate>
        <div className="auth-form-row auth-form-row-2">
          <AuthFormField label="Full Name" htmlFor="name" error={fieldError("name")}>
            <div className="auth-input-wrap">
              <User className="auth-input-icon" />
              <Input
                id="name"
                name="name"
                required
                minLength={FIELD_LIMITS.name.min}
                maxLength={FIELD_LIMITS.name.max}
                placeholder="John Doe"
                className={cn("auth-input", fieldError("name") && "border-red-500")}
                aria-invalid={!!fieldError("name")}
                onBlur={() => blurField("name")}
              />
            </div>
          </AuthFormField>

          <AuthFormField
            label="Email"
            htmlFor="email"
            error={fieldError("email")}
          >
            <div className="auth-input-wrap">
              <Mail className="auth-input-icon" />
              <EmailInput
                id="email"
                name="email"
                required
                placeholder="you@example.com"
                className={cn("auth-input", fieldError("email") && "border-red-500")}
                aria-invalid={!!fieldError("email")}
                onBlur={() => blurField("email")}
              />
            </div>
          </AuthFormField>
        </div>

        <AuthFormField
          label="Phone"
          htmlFor="phone"
          error={fieldError("phone")}
          hint={PHONE_HINT}
        >
          <div className="auth-input-wrap">
            <Phone className="auth-input-icon" />
            <PhoneInput
              id="phone"
              name="phone"
              required
              minDigits={FIELD_LIMITS.phone.exact}
              placeholder="9876543210"
              className={cn("auth-input", fieldError("phone") && "border-red-500")}
              aria-invalid={!!fieldError("phone")}
              onBlur={() => blurField("phone")}
            />
          </div>
        </AuthFormField>

        <div className="auth-form-row auth-form-row-password">
          <AuthFormField label="Password" htmlFor="password" error={fieldError("password")}>
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
                className={cn("auth-input", fieldError("password") && "border-red-500")}
                aria-invalid={!!fieldError("password")}
                onBlur={() => blurField("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-input-toggle"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </AuthFormField>
          <AuthFormField
            label="Confirm Password"
            htmlFor="confirmPassword"
            error={fieldError("confirmPassword")}
          >
            <div className="auth-input-wrap">
              <Lock className="auth-input-icon" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={FIELD_LIMITS.password.min}
                maxLength={FIELD_LIMITS.password.max}
                placeholder="••••••••"
                className={cn("auth-input", fieldError("confirmPassword") && "border-red-500")}
                aria-invalid={!!fieldError("confirmPassword")}
                onBlur={() => blurField("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="auth-input-toggle"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </AuthFormField>
        </div>
        <p className="text-[10px] leading-snug text-slate-400">{PASSWORD_HINT}</p>

        <AuthFormField label="" htmlFor="terms" error={fieldError("terms")}>
          <label className="auth-terms">
            <input
              id="terms"
              type="checkbox"
              name="terms"
              required
              className="mt-0.5 rounded border-slate-300 text-brand-blue"
              aria-invalid={!!fieldError("terms")}
              onBlur={() => blurField("terms")}
            />
            <span>
              I agree to the{" "}
              <Link href="/terms-of-service" className="font-semibold text-brand-blue hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="font-semibold text-brand-blue hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>
        </AuthFormField>

        <Button type="submit" disabled={loading} className="w-full" size="default">
          {loading ? "Creating..." : "Create Buyer Account"}
        </Button>
      </form>
    </AuthPageShell>
  );
}
