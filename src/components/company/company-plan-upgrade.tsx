"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { toast } from "sonner";
import {
  Check,
  Crown,
  Loader2,
  Rocket,
  Sparkles,
  Zap,
} from "lucide-react";
import { createPlanOrder, verifyPlanPayment } from "@/actions/payment.actions";
import { Button } from "@/components/ui/button";
import type { PricingPlan } from "@/lib/settings/defaults";
import type { SubscriptionPlan } from "@prisma/client";
import {
  PLAN_DISPLAY,
  subscriptionToVendorPlanId,
} from "@/lib/plans/plan-catalog";
import { cn } from "@/lib/utils";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const PLAN_ICONS: Record<string, typeof Zap> = {
  "vendor-basic": Zap,
  "vendor-growth": Rocket,
  "vendor-pro": Crown,
};

export function CompanyPlanUpgrade({
  allVendorPlans,
  upgradePlans,
  currentPlan,
  paymentVerified,
  paymentConfigured,
  subscriptionEndDate,
}: {
  allVendorPlans: PricingPlan[];
  upgradePlans: PricingPlan[];
  currentPlan: SubscriptionPlan | null;
  paymentVerified: boolean;
  paymentConfigured: boolean;
  subscriptionEndDate?: string | null;
}) {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  const currentPlanId = subscriptionToVendorPlanId(currentPlan);
  const currentPricing = allVendorPlans.find((p) => p.id === currentPlanId);

  const [selectedPlanId, setSelectedPlanId] = useState(
    upgradePlans[0]?.id ?? "",
  );

  useEffect(() => {
    if (upgradePlans.length > 0 && !upgradePlans.some((p) => p.id === selectedPlanId)) {
      setSelectedPlanId(upgradePlans[0].id);
    }
  }, [upgradePlans, selectedPlanId]);

  const selectedPlan = upgradePlans.find((p) => p.id === selectedPlanId);
  const planMeta = currentPlan ? PLAN_DISPLAY[currentPlan] : PLAN_DISPLAY.BASIC;
  const atTopTier = paymentVerified && upgradePlans.length === 0;

  const comparisonPlans = useMemo(
    () => allVendorPlans.filter((p) => p.id.startsWith("vendor-")),
    [allVendorPlans],
  );

  async function handleUpgrade() {
    if (!selectedPlanId) {
      toast.error("Select a plan to upgrade");
      return;
    }
    if (!paymentConfigured) {
      toast.error("Payment gateway is not configured. Contact support.");
      return;
    }

    const ok = await confirm({
      title: `Upgrade to ${selectedPlan?.name ?? "selected plan"}?`,
      description: `You will be charged ${selectedPlan?.price ?? ""} via Razorpay to upgrade your vendor plan.`,
      confirmLabel: "Proceed to payment",
      variant: "warning",
    });
    if (!ok) return;

    setLoading(true);
    const result = await createPlanOrder(selectedPlanId);
    setLoading(false);

    if ("error" in result || !result.data) {
      toast.error(("error" in result && result.error) || "Failed to create order");
      return;
    }

    const { orderId, amount, keyId } = result.data;

    const options = {
      key: keyId,
      amount: amount * 100,
      currency: "INR",
      name: "Genius Mart",
      description: `Upgrade to ${selectedPlan?.name ?? "plan"}`,
      order_id: orderId,
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        const verify = await verifyPlanPayment({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          planId: selectedPlanId,
        });

        if ("error" in verify) {
          toast.error(verify.error);
          return;
        }

        toast.success("Plan upgraded successfully!");
        router.refresh();
      },
      theme: { color: "#0076df" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  return (
    <>
      {confirmDialog}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptReady(true)}
      />

      <div className="space-y-6">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br p-6 shadow-sm",
            planMeta.gradient,
          )}
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/30 blur-2xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Current plan
              </p>
              <h3 className={cn("mt-1 font-heading text-2xl font-bold", planMeta.color)}>
                {planMeta.label}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{planMeta.tagline}</p>
              {currentPricing ? (
                <p className="mt-2 text-sm font-medium text-slate-700">
                  {currentPricing.price}
                  <span className="font-normal text-slate-500"> / {currentPricing.period}</span>
                </p>
              ) : null}
              {subscriptionEndDate ? (
                <p className="mt-1 text-xs text-slate-500">
                  Renews / active until {subscriptionEndDate}
                </p>
              ) : null}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 shadow-sm">
              <Sparkles className="h-6 w-6 text-brand-blue" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-heading text-sm font-semibold text-slate-900">Plan comparison</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {comparisonPlans.map((plan) => {
              const Icon = PLAN_ICONS[plan.id] ?? Zap;
              const isCurrent = plan.id === currentPlanId;
              const tierOrder = ["vendor-basic", "vendor-growth", "vendor-pro"];
              const isPast =
                currentPlanId &&
                tierOrder.indexOf(plan.id) < tierOrder.indexOf(currentPlanId);

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "rounded-xl border p-4 transition-all",
                    isCurrent
                      ? "border-brand-blue/40 bg-brand-blue/5 ring-2 ring-brand-blue/20"
                      : isPast
                        ? "border-slate-200 bg-slate-50/80 opacity-80"
                        : "border-slate-200 bg-white/80",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-brand-blue" />
                    <span className="font-medium text-slate-900">{plan.name}</span>
                    {isCurrent ? (
                      <span className="ml-auto rounded-full bg-brand-blue px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Current
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {plan.price}
                    <span className="text-xs font-normal text-slate-500"> / {plan.period}</span>
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {plan.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex gap-2 text-xs text-slate-600">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-green" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {atTopTier ? (
          <div className="rounded-xl border border-brand-green/20 bg-brand-green/5 p-5 text-center text-sm text-brand-green-dark">
            <Crown className="mx-auto h-8 w-8 text-brand-green" />
            <p className="mt-2 font-medium">You&apos;re on the highest vendor plan</p>
            <p className="mt-1 text-slate-600">Enjoy unlimited listings, AI tools, and spotlight placement.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm">
            <h4 className="font-heading font-semibold text-slate-900">
              {paymentVerified ? "Upgrade your plan" : "Complete registration payment"}
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              {paymentVerified
                ? "Unlock more visibility, analytics, and AI features instantly after payment."
                : "Select a seller plan to activate your vendor account."}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {upgradePlans.map((plan) => {
                const selected = selectedPlanId === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-all",
                      selected
                        ? "border-brand-green bg-brand-green/10 ring-2 ring-brand-green/25"
                        : "border-slate-200 hover:border-brand-blue/30 hover:bg-brand-blue/5",
                    )}
                  >
                    <p className="font-semibold text-slate-900">{plan.name}</p>
                    <p className="mt-1 text-lg font-bold text-brand-green">
                      {plan.price}
                      <span className="text-xs font-normal text-slate-500"> / {plan.period}</span>
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs text-slate-500">{plan.description}</p>
                  </button>
                );
              })}
            </div>

            {!paymentConfigured ? (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Razorpay is not configured. Add keys in admin settings to enable upgrades.
              </p>
            ) : null}

            <Button
              className="mt-4 w-full sm:w-auto"
              onClick={handleUpgrade}
              disabled={loading || !scriptReady || !selectedPlanId || !paymentConfigured}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : paymentVerified ? (
                `Upgrade to ${selectedPlan?.name ?? "plan"}`
              ) : (
                `Pay for ${selectedPlan?.name ?? "plan"}`
              )}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
