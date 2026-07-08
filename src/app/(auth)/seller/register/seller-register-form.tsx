"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailInput } from "@/components/ui/email-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { useRazorpayScript } from "@/hooks/use-razorpay";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  Phone,
  Globe,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import type { PricingPlan } from "@/lib/settings/defaults";
import { getSellerCheckoutPlans } from "@/lib/settings/pricing";
import { prepareCompanyRegistrationOrder } from "@/actions/payment.actions";
import { completeCompanyRegistration } from "@/actions/auth.actions";
import { FIELD_LIMITS, PASSWORD_HINT, EMAIL_HINT, PHONE_HINT } from "@/lib/validations/client";
import { companyRegisterSchema, companyRegisterStep1Schema } from "@/lib/validations";
import { RegistrationSuccessDialog } from "@/components/auth/registration-success-dialog";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { getValidatedForm } from "@/lib/validations/form-submit";
import { RegistrationSteps } from "@/components/auth/registration-steps";
import { AUTH_PATHS } from "@/lib/auth-paths";
import { AuthFormField } from "@/components/ui/auth-form-field";
import { useZodFormErrors } from "@/hooks/use-zod-form-errors";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function SellerRegisterForm({
  pricingPlans,
  paymentConfigured,
}: {
  pricingPlans: PricingPlan[];
  paymentConfigured: boolean;
}) {
  const router = useRouter();
  const checkoutPlans = getSellerCheckoutPlans(pricingPlans);
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { ready: razorpayReady, loading: razorpayLoading, ensureReady } = useRazorpayScript(true);
  const [selectedPlanId, setSelectedPlanId] = useState(
    checkoutPlans.find((p) => p.highlighted)?.id ?? checkoutPlans[0]?.id ?? "",
  );
  const [success, setSuccess] = useState<{ email: string } | null>(null);
  const { fieldError, validateAll, validateField } = useZodFormErrors(companyRegisterSchema);

  const selectedPlan = pricingPlans.find((p) => p.id === selectedPlanId);

  function blurField(fieldName: string) {
    const form = formRef.current;
    if (form) validateField(form, fieldName, companyRegisterStep1Schema);
  }

  useEffect(() => {
    const payable = getSellerCheckoutPlans(pricingPlans);
    if (payable.length === 0) {
      setSelectedPlanId("");
      return;
    }
    if (!payable.some((p) => p.id === selectedPlanId)) {
      setSelectedPlanId(payable.find((p) => p.highlighted)?.id ?? payable[0]?.id ?? "");
    }
  }, [pricingPlans, selectedPlanId]);

  useEffect(() => {
    if (step >= 2) void ensureReady();
  }, [step, ensureReady]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = getValidatedForm(e);
    if (!form) return;

    const formData = new FormData(form);
    if (!validateAll(formData)) return;

    if (!selectedPlanId) {
      toast.error("Please select a seller plan");
      return;
    }

    if (!paymentConfigured) {
      toast.error(
        "Payment gateway is not configured. Add Razorpay keys in .env or Admin → Settings.",
      );
      return;
    }

    const gatewayReady = await ensureReady();
    if (!gatewayReady || typeof window.Razorpay === "undefined") {
      toast.error("Could not load the payment gateway. Check your connection and try again.");
      return;
    }

    setLoading(true);

    const orderResult = await prepareCompanyRegistrationOrder(formData, selectedPlanId);

    if ("error" in orderResult) {
      toast.error(orderResult.error);
      setLoading(false);
      return;
    }

    if (!orderResult.data) {
      toast.error("Failed to start payment process");
      setLoading(false);
      return;
    }

    const { orderId, keyId, email } = orderResult.data;

    const options = {
      key: keyId,
      currency: "INR",
      name: "Genius Mart",
      description: `Seller registration — ${selectedPlan?.name ?? "plan"}`,
      order_id: orderId,
      prefill: { email },
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        const result = await completeCompanyRegistration({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          planId: selectedPlanId,
        });
        setLoading(false);

        if ("error" in result) {
          toast.error(result.error);
          return;
        }

        if (!result.data) {
          toast.error("Registration failed after payment");
          return;
        }

        toast.success("Payment successful! Please verify your email.");
        setSuccess({ email: result.data!.email });
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
          toast.info("Payment cancelled. Account was not created.");
        },
      },
      theme: { color: "#0076df" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  return (
    <>
      <RegistrationSuccessDialog
        open={!!success}
        title="Payment Successful!"
        message="Your seller account has been registered. We sent a 6-digit OTP to your email. Enter it to verify and activate your account."
        actionLabel="Verify with OTP"
        onAction={() =>
          router.push(`/verify-user?email=${encodeURIComponent(success!.email)}&role=company`)
        }
      />

      <AuthPageShell
        badge="Seller Registration"
        badgeTone="green"
        activeTab="seller"
        compact
        fitViewport
        centerHeader
        title="Become a Seller"
        subtitle="List your software, choose a plan, and pay securely."
        footer={
          <p className="text-center text-xs text-slate-500">
            Already a seller?{" "}
            <Link href={AUTH_PATHS.login} className="font-semibold text-brand-green hover:underline">
              Sign in
            </Link>
            {" · "}
            <Link href={AUTH_PATHS.userRegister} className="font-semibold text-brand-blue hover:underline">
              Register as Buyer
            </Link>
          </p>
        }
      >
        <RegistrationSteps current={step} />

        <form ref={formRef} onSubmit={handleSubmit} className="auth-form-compact auth-form-tight" noValidate>
          <div className={step === 1 ? "contents" : "hidden"} aria-hidden={step !== 1}>
            <div className="auth-form-row auth-form-row-seller">
                <AuthFormField label="Company Name" htmlFor="companyName" error={fieldError("companyName")}>
                  <div className="auth-input-wrap">
                    <Building2 className="auth-input-icon" />
                    <Input
                      id="companyName"
                      name="companyName"
                      required
                      minLength={FIELD_LIMITS.companyName.min}
                      maxLength={FIELD_LIMITS.companyName.max}
                      className={cn("auth-input", fieldError("companyName") && "border-red-500")}
                      aria-invalid={!!fieldError("companyName")}
                      onBlur={() => blurField("companyName")}
                    />
                  </div>
                </AuthFormField>
                <AuthFormField label="Owner Name" htmlFor="ownerName" error={fieldError("ownerName")}>
                  <div className="auth-input-wrap">
                    <User className="auth-input-icon" />
                    <Input
                      id="ownerName"
                      name="ownerName"
                      required
                      minLength={FIELD_LIMITS.ownerName.min}
                      maxLength={FIELD_LIMITS.ownerName.max}
                      className={cn("auth-input", fieldError("ownerName") && "border-red-500")}
                      aria-invalid={!!fieldError("ownerName")}
                      onBlur={() => blurField("ownerName")}
                    />
                  </div>
                </AuthFormField>
                <AuthFormField label="Email" htmlFor="email" error={fieldError("email")}>
                  <div className="auth-input-wrap">
                    <Mail className="auth-input-icon" />
                    <EmailInput
                      id="email"
                      name="email"
                      required
                      className={cn("auth-input", fieldError("email") && "border-red-500")}
                      aria-invalid={!!fieldError("email")}
                      onBlur={() => blurField("email")}
                    />
                  </div>
                </AuthFormField>
                <p className="text-[10px] leading-snug text-slate-400">{EMAIL_HINT}</p>
                <AuthFormField label="Phone" htmlFor="phone" error={fieldError("phone")}>
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
                <p className="text-[10px] leading-snug text-slate-400">{PHONE_HINT}</p>
                <AuthFormField
                  label="Website (optional)"
                  htmlFor="website"
                  error={fieldError("website")}
                  hint="Must include https://"
                >
                  <div className="auth-input-wrap">
                    <Globe className="auth-input-icon" />
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="https://example.com"
                      className={cn("auth-input", fieldError("website") && "border-red-500")}
                      aria-invalid={!!fieldError("website")}
                      onBlur={() => blurField("website")}
                    />
                  </div>
                </AuthFormField>
                <AuthFormField label="Industry" htmlFor="industry" error={fieldError("industry")}>
                  <div className="auth-input-wrap">
                    <Building2 className="auth-input-icon" />
                    <Input
                      id="industry"
                      name="industry"
                      required
                      minLength={FIELD_LIMITS.industry.min}
                      maxLength={FIELD_LIMITS.industry.max}
                      className={cn("auth-input", fieldError("industry") && "border-red-500")}
                      aria-invalid={!!fieldError("industry")}
                      onBlur={() => blurField("industry")}
                    />
                  </div>
                </AuthFormField>
              </div>

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

              <Button
                type="button"
                className="w-full"
                size="default"
                onClick={(e) => {
                  const form = formRef.current ?? (e.currentTarget as HTMLButtonElement).form;
                  if (!form?.reportValidity()) return;
                  const formData = new FormData(form);
                  if (validateAll(formData, companyRegisterStep1Schema)) setStep(2);
                }}
              >
                Continue to Plan
                <ArrowRight className="h-4 w-4" />
              </Button>
          </div>

          {step === 2 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Select Seller Plan
              </p>
              <p className="text-[11px] text-slate-400">
                Same three plans as the homepage — select a paid seller plan to continue.
              </p>
              {checkoutPlans.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  No paid seller plans are configured yet. An admin must enable Razorpay checkout on
                  vendor plans in settings before registration can continue.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
                    {checkoutPlans.map((plan) => {
                      const isSelected = selectedPlanId === plan.id;

                      return (
                        <button
                          key={plan.id}
                          type="button"
                          disabled={loading}
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`rounded-xl border p-3 text-left transition-all ${
                            isSelected
                              ? "border-brand-green bg-brand-green/10 ring-2 ring-brand-green/25"
                              : "border-slate-200 bg-slate-50/80 hover:border-brand-blue/30"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-900">{plan.name}</span>
                            {plan.highlighted ? (
                              <span className="shrink-0 rounded-full bg-brand-green/15 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-green">
                                Popular
                              </span>
                            ) : null}
                          </div>
                          <span className="mt-1 block text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            {plan.audience}
                          </span>
                          <span className="mt-1 block text-xs font-bold text-brand-green">
                            {plan.price}
                            <span className="font-normal text-slate-500"> / {plan.period}</span>
                          </span>
                          {plan.description ? (
                            <p className="mt-2 text-[11px] leading-snug text-slate-500">
                              {plan.description}
                            </p>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                  {selectedPlan?.features?.length ? (
                    <ul className="mt-3 space-y-1 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                      {selectedPlan.features.map((feature) => (
                        <li key={feature} className="text-xs text-slate-600">
                          • {feature}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </>
              )}

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={checkoutPlans.length === 0}
                  onClick={() => {
                    if (!selectedPlanId) {
                      toast.error("Please select a plan");
                      return;
                    }
                    setStep(3);
                  }}
                >
                  Review & Pay
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="rounded-xl border border-brand-green/20 bg-brand-green/5 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Ready to complete registration</p>
                <p className="mt-1">
                  Plan: <strong>{selectedPlan?.name ?? "Selected"}</strong>
                  {selectedPlan?.price ? (
                    <span className="text-brand-green">
                      {" "}
                      — {selectedPlan.price}
                      {selectedPlan.period ? ` / ${selectedPlan.period}` : ""}
                    </span>
                  ) : null}
                </p>
                {selectedPlan?.description ? (
                  <p className="mt-1 text-xs text-slate-500">{selectedPlan.description}</p>
                ) : null}
                <p className="mt-1 text-xs text-slate-500">
                  After payment, verify your email with the OTP we send you.
                </p>
                {razorpayLoading && !razorpayReady ? (
                  <p className="mt-2 text-xs text-amber-600">Loading secure checkout…</p>
                ) : null}
                {!paymentConfigured ? (
                  <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
                    Razorpay is not configured. Set <code>RAZORPAY_KEY_ID</code> and{" "}
                    <code>RAZORPAY_KEY_SECRET</code> in your environment or admin settings.
                  </p>
                ) : null}
              </div>

              <AuthFormField label="" htmlFor="terms" error={fieldError("terms")}>
                <label className="auth-terms">
                  <input
                    id="terms"
                    type="checkbox"
                    name="terms"
                    required
                    className="mt-0.5 rounded border-slate-300 text-brand-green"
                    aria-invalid={!!fieldError("terms")}
                    onBlur={() => {
                      const form = formRef.current;
                      if (form) validateField(form, "terms");
                    }}
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/terms-of-service" className="font-semibold text-brand-green hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy-policy" className="font-semibold text-brand-green hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </AuthFormField>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="green"
                  disabled={loading || razorpayLoading || !paymentConfigured}
                  className="flex-1"
                >
                  {loading
                    ? "Processing..."
                    : razorpayLoading
                      ? "Loading checkout…"
                      : "Pay & Register"}
                </Button>
              </div>
            </>
          )}
        </form>
      </AuthPageShell>
    </>
  );
}
