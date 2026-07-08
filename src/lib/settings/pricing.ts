import type { PricingPlan } from "./defaults";
import { DEFAULT_PRICING_PLANS } from "./defaults";

/** Merge stored plans with defaults — restores missing built-in plans without wiping admin edits. */
export function mergePricingPlans(
  stored: PricingPlan[],
  defaults: PricingPlan[] = DEFAULT_PRICING_PLANS,
): PricingPlan[] {
  const byId = new Map(stored.map((plan) => [plan.id, plan]));
  const defaultIds = new Set(defaults.map((plan) => plan.id));

  for (const def of defaults) {
    const existing = byId.get(def.id);
    if (!existing) {
      byId.set(def.id, { ...def });
      continue;
    }

    byId.set(def.id, {
      ...def,
      ...existing,
      features: existing.features?.length ? existing.features : def.features,
      active: existing.active ?? def.active ?? true,
      razorpayEnabled: existing.razorpayEnabled ?? def.razorpayEnabled,
      priceAmount: existing.priceAmount ?? def.priceAmount,
      price: existing.price || def.price,
      period: existing.period || def.period,
      description: existing.description || def.description,
      name: existing.name || def.name,
      audience: existing.audience || def.audience,
      cta: existing.cta || def.cta,
      href: existing.href || def.href,
      highlighted: existing.highlighted ?? def.highlighted,
      accent: existing.accent ?? def.accent,
    });
  }

  const ordered = defaults.map((def) => byId.get(def.id)!).filter(Boolean);
  for (const [id, plan] of byId) {
    if (!defaultIds.has(id)) ordered.push(plan);
  }

  return ordered;
}

/** All active marketplace plans (Explorer + vendor tiers). */
export function getActivePricingPlans(plans: PricingPlan[]): PricingPlan[] {
  return plans.filter((plan) => plan.active !== false);
}

/** Plans shown on the public homepage pricing section (active vendor plans, sorted by price). */
export function getVendorDisplayPlans(plans: PricingPlan[]): PricingPlan[] {
  const active = getActivePricingPlans(plans);
  const vendorPlans = active.filter(
    (plan) =>
      plan.id !== "explorer" &&
      plan.audience.toLowerCase().includes("vendor"),
  );

  if (vendorPlans.length > 0) {
    return [...vendorPlans].sort((a, b) => (a.priceAmount ?? 0) - (b.priceAmount ?? 0));
  }

  const vendorIds = ["vendor-basic", "vendor-growth", "vendor-pro"] as const;
  return vendorIds
    .map((id) => active.find((p) => p.id === id))
    .filter((p): p is PricingPlan => Boolean(p));
}

/** Paid seller checkout plans — Razorpay-enabled with a price. */
export function isSellerCheckoutPlan(plan: PricingPlan): boolean {
  return (
    plan.active !== false &&
    plan.razorpayEnabled &&
    typeof plan.priceAmount === "number" &&
    plan.priceAmount > 0
  );
}

export function getSellerCheckoutPlans(plans: PricingPlan[]): PricingPlan[] {
  return getActivePricingPlans(plans).filter(isSellerCheckoutPlan);
}

/** @deprecated Use getSellerCheckoutPlans */
export function getVendorPlans(plans: PricingPlan[]): PricingPlan[] {
  return getSellerCheckoutPlans(plans);
}
