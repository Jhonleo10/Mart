import { prisma } from "@/lib/prisma";
import type { SubscriptionPlan } from "@prisma/client";
import { SELLER_REGISTRATION_PLAN_IDS } from "@/lib/settings/defaults";

export { SELLER_REGISTRATION_PLAN_IDS };

const PLAN_DURATION_DAYS: Record<SubscriptionPlan, number> = {
  BASIC: 365,
  GROWTH: 365,
  PROFESSIONAL: 365,
  ENTERPRISE: 365,
};

export async function activateSubscription(
  companyId: string,
  plan: SubscriptionPlan,
) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + PLAN_DURATION_DAYS[plan]);

  const existing = await prisma.subscription.findFirst({
    where: { companyId, status: "ACTIVE" },
  });

  if (existing) {
    return prisma.subscription.update({
      where: { id: existing.id },
      data: { plan, status: "ACTIVE", endDate },
    });
  }

  return prisma.subscription.create({
    data: { companyId, plan, status: "ACTIVE", endDate },
  });
}

export function mapPlanIdToSubscription(planId?: string | null): SubscriptionPlan {
  switch (planId) {
    case "vendor-basic":
    case "company-starter":
    case "explorer":
    case "basic":
      return "BASIC";
    case "vendor-growth":
    case "growth":
    case "professional":
      return "GROWTH";
    case "vendor-pro":
    case "pro":
      return "PROFESSIONAL";
    case "enterprise":
      return "ENTERPRISE";
    default:
      return "BASIC";
  }
}

export function isSellerRegistrationPlan(planId?: string | null): boolean {
  return Boolean(planId && SELLER_REGISTRATION_PLAN_IDS.has(planId));
}
