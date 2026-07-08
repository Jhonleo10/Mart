import type { SubscriptionPlan } from "@prisma/client";
import { mapPlanIdToSubscription } from "@/lib/payment/subscription";
import { SELLER_REGISTRATION_PLAN_IDS } from "@/lib/settings/defaults";
import type { PricingPlan } from "@/lib/settings/defaults";
import { getSellerCheckoutPlans } from "@/lib/settings/pricing";

export const SUBSCRIPTION_TIER: Record<SubscriptionPlan, number> = {
  BASIC: 1,
  GROWTH: 2,
  PROFESSIONAL: 3,
  ENTERPRISE: 4,
};

const PLAN_ID_TO_SUBSCRIPTION: Record<string, SubscriptionPlan> = {
  "vendor-basic": "BASIC",
  "company-starter": "BASIC",
  "vendor-growth": "GROWTH",
  "vendor-pro": "PROFESSIONAL",
};

export const PLAN_DISPLAY: Record<
  SubscriptionPlan,
  { label: string; color: string; gradient: string; tagline: string }
> = {
  BASIC: {
    label: "Basic",
    color: "text-slate-700",
    gradient: "from-slate-500/20 to-slate-600/10",
    tagline: "Up to 5 products & demo leads",
  },
  GROWTH: {
    label: "Growth",
    color: "text-brand-blue",
    gradient: "from-brand-blue/25 to-brand-green/15",
    tagline: "15 products & advanced analytics",
  },
  PROFESSIONAL: {
    label: "Pro",
    color: "text-brand-green-dark",
    gradient: "from-brand-green/25 to-emerald-500/15",
    tagline: "Unlimited products, Pro spotlight carousel & full AI",
  },
  ENTERPRISE: {
    label: "Enterprise",
    color: "text-violet-700",
    gradient: "from-violet-500/20 to-indigo-500/15",
    tagline: "Custom scale & priority support",
  },
};

export function planIdToTier(planId: string): number {
  const sub = PLAN_ID_TO_SUBSCRIPTION[planId] ?? mapPlanIdToSubscription(planId);
  return SUBSCRIPTION_TIER[sub] ?? 0;
}

export function subscriptionToVendorPlanId(plan: SubscriptionPlan | null): string | null {
  switch (plan) {
    case "BASIC":
      return "vendor-basic";
    case "GROWTH":
      return "vendor-growth";
    case "PROFESSIONAL":
    case "ENTERPRISE":
      return "vendor-pro";
    default:
      return null;
  }
}

/** Plans a company can purchase — registration or upgrade targets only. */
export function getVendorUpgradePlans(
  allPlans: PricingPlan[],
  currentPlan: SubscriptionPlan | null,
  paymentVerified: boolean,
): PricingPlan[] {
  const checkout = getSellerCheckoutPlans(allPlans);

  if (!paymentVerified) {
    return checkout;
  }

  const currentTier = currentPlan ? SUBSCRIPTION_TIER[currentPlan] : SUBSCRIPTION_TIER.BASIC;

  return checkout.filter((plan) => {
    if (SELLER_REGISTRATION_PLAN_IDS.has(plan.id)) return false;
    return planIdToTier(plan.id) > currentTier;
  });
}

export function canUpgradeToPlan(
  currentPlan: SubscriptionPlan | null,
  targetPlanId: string,
  paymentVerified: boolean,
): { ok: true } | { ok: false; reason: string } {
  if (SELLER_REGISTRATION_PLAN_IDS.has(targetPlanId) && paymentVerified) {
    return { ok: false, reason: "Registration plan already completed. Choose Growth or Pro to upgrade." };
  }

  const targetTier = planIdToTier(targetPlanId);
  if (targetTier === 0) {
    return { ok: false, reason: "Invalid plan selected" };
  }

  if (!paymentVerified) {
    return { ok: true };
  }

  const currentTier = currentPlan ? SUBSCRIPTION_TIER[currentPlan] : SUBSCRIPTION_TIER.BASIC;
  if (targetTier <= currentTier) {
    return { ok: false, reason: "You can only upgrade to a higher plan" };
  }

  return { ok: true };
}
