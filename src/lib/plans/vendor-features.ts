import type { SubscriptionPlan } from "@prisma/client";

export type VendorFeature =
  | "product_listing"
  | "lead_inbox"
  | "demo_scheduling"
  | "basic_analytics"
  | "trending_engine"
  | "featured_products"
  | "advanced_analytics"
  | "ai_marketing_assistant"
  | "ai_audience_intelligence"
  | "ai_competitor_analysis"
  | "ai_growth_dashboard";

const PLAN_FEATURES: Record<SubscriptionPlan, ReadonlySet<VendorFeature>> = {
  BASIC: new Set([
    "product_listing",
    "lead_inbox",
    "demo_scheduling",
    "basic_analytics",
  ]),
  GROWTH: new Set([
    "product_listing",
    "lead_inbox",
    "demo_scheduling",
    "basic_analytics",
    "trending_engine",
    "advanced_analytics",
  ]),
  PROFESSIONAL: new Set([
    "product_listing",
    "lead_inbox",
    "demo_scheduling",
    "basic_analytics",
    "trending_engine",
    "featured_products",
    "advanced_analytics",
    "ai_marketing_assistant",
    "ai_audience_intelligence",
    "ai_competitor_analysis",
    "ai_growth_dashboard",
  ]),
  ENTERPRISE: new Set([
    "product_listing",
    "lead_inbox",
    "demo_scheduling",
    "basic_analytics",
    "trending_engine",
    "featured_products",
    "advanced_analytics",
    "ai_marketing_assistant",
    "ai_audience_intelligence",
    "ai_competitor_analysis",
    "ai_growth_dashboard",
  ]),
};

export function vendorHasFeature(
  plan: SubscriptionPlan | null | undefined,
  feature: VendorFeature,
): boolean {
  if (!plan) return feature === "product_listing" || feature === "lead_inbox";
  return PLAN_FEATURES[plan]?.has(feature) ?? false;
}

export function requiredPlanLabel(feature: VendorFeature): string {
  if (PLAN_FEATURES.BASIC.has(feature)) return "Basic";
  if (PLAN_FEATURES.GROWTH.has(feature)) return "Growth";
  return "Pro";
}
