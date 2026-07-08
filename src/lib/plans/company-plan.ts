import type { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { vendorHasFeature, type VendorFeature } from "./vendor-features";

export interface CompanyPlanContext {
  selectedPlan?: SubscriptionPlan | null;
  subscriptions?: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    endDate: Date;
  }[];
}

/** Resolve the active subscription plan for a company. */
export function getCompanyEffectivePlan(
  company: CompanyPlanContext,
): SubscriptionPlan | null {
  const now = new Date();
  const activeSub = company.subscriptions?.find(
    (sub) => sub.status === "ACTIVE" && sub.endDate > now,
  );
  if (activeSub) return activeSub.plan;
  return company.selectedPlan ?? null;
}

export function companyHasFeature(
  company: CompanyPlanContext,
  feature: VendorFeature,
): boolean {
  return vendorHasFeature(getCompanyEffectivePlan(company), feature);
}

/** Max products a vendor can create on their plan. `null` = unlimited. */
export function productLimitForPlan(plan: SubscriptionPlan | null): number | null {
  if (!plan) return 0;
  switch (plan) {
    case "BASIC":
      return 5;
    case "GROWTH":
      return 15;
    case "PROFESSIONAL":
    case "ENTERPRISE":
      return null;
    default:
      return 5;
  }
}

export function formatProductLimit(plan: SubscriptionPlan | null): string {
  const limit = productLimitForPlan(plan);
  return limit === null ? "Unlimited" : String(limit);
}

export function productLimitLabel(plan: SubscriptionPlan | null): string {
  const limit = productLimitForPlan(plan);
  if (limit === null) return "Unlimited product listings";
  return `Up to ${limit} product${limit === 1 ? "" : "s"}`;
}

export function trendingBoostForPlan(plan: SubscriptionPlan | null): number {
  if (!plan) return 1;
  switch (plan) {
    case "GROWTH":
      return 1.25;
    case "PROFESSIONAL":
    case "ENTERPRISE":
      return 1.5;
    default:
      return 1;
  }
}

export {
  spotlightLimitForPlan,
  spotlightSlotsLabel,
  canCompanyUseSpotlight,
  getSpotlightUpgradePlan,
  resolveSpotlightUsage,
  getCompanySpotlightUsage,
  type SpotlightUsage,
} from "./spotlight-policy";
