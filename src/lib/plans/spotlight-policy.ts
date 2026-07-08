import type { SubscriptionPlan } from "@prisma/client";
import { companyHasFeature, getCompanyEffectivePlan, type CompanyPlanContext } from "./company-plan";
import { requiredPlanLabel } from "./vendor-features";

const PRO_SPOTLIGHT_PLANS = new Set<SubscriptionPlan>(["PROFESSIONAL", "ENTERPRISE"]);

export function isProSpotlightPlan(plan: SubscriptionPlan | null): boolean {
  return plan !== null && PRO_SPOTLIGHT_PLANS.has(plan);
}

/** Max live products a Pro vendor can mark for homepage spotlight. */
export function spotlightLimitForPlan(plan: SubscriptionPlan | null): number {
  if (!isProSpotlightPlan(plan)) return 0;
  return plan === "ENTERPRISE" ? 5 : 3;
}

export function spotlightSlotsLabel(plan: SubscriptionPlan | null): string {
  const limit = spotlightLimitForPlan(plan);
  if (limit === 0) return "Pro plan exclusive";
  if (limit === 1) return "1 Pro spotlight slot";
  return `Up to ${limit} Pro spotlight slots`;
}

export function canCompanyUseSpotlight(company: CompanyPlanContext): boolean {
  return companyHasFeature(company, "featured_products");
}

export function getSpotlightUpgradePlan(): string {
  return requiredPlanLabel("featured_products");
}

export type SpotlightUsage = {
  used: number;
  limit: number;
  remaining: number;
  atLimit: boolean;
};

export function resolveSpotlightUsage(
  plan: SubscriptionPlan | null,
  publishedFeaturedCount: number,
): SpotlightUsage {
  const limit = spotlightLimitForPlan(plan);
  const used = publishedFeaturedCount;
  const remaining = Math.max(0, limit - used);
  return {
    used,
    limit,
    remaining,
    atLimit: limit > 0 && used >= limit,
  };
}

export function getCompanySpotlightUsage(
  company: CompanyPlanContext,
  publishedFeaturedCount: number,
): SpotlightUsage & { canUse: boolean; plan: SubscriptionPlan | null } {
  const plan = getCompanyEffectivePlan(company);
  return {
    ...resolveSpotlightUsage(plan, publishedFeaturedCount),
    canUse: canCompanyUseSpotlight(company),
    plan,
  };
}
