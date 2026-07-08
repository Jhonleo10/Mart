import { prisma } from "@/lib/prisma";
import {
  formatProductLimit,
  getCompanyEffectivePlan,
  productLimitForPlan,
  spotlightLimitForPlan,
} from "@/lib/plans/company-plan";
import { companyHasFeature } from "@/lib/plans/company-plan";
import type { CompanyPlanContext } from "@/lib/plans/company-plan";

export type CompanyAiSuggestion = {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
  href: string;
  actionLabel: string;
};

export async function buildCompanyOperationalSuggestions(
  companyId: string,
  company: CompanyPlanContext,
  options?: { upcomingSlots?: number },
): Promise<CompanyAiSuggestion[]> {
  const suggestions: CompanyAiSuggestion[] = [];
  const plan = getCompanyEffectivePlan(company);
  const limit = productLimitForPlan(plan);

  const [products, newLeads, publishedCount, avgViews] = await Promise.all([
    prisma.product.count({ where: { companyId } }),
    prisma.booking.count({ where: { companyId, status: "NEW" } }),
    prisma.product.count({ where: { companyId, status: "PUBLISHED" } }),
    prisma.product.aggregate({
      where: { companyId, status: "PUBLISHED" },
      _avg: { viewCount: true },
    }),
  ]);

  if (newLeads > 0) {
    suggestions.push({
      id: "new-leads",
      priority: "high",
      title: `${newLeads} new demo request${newLeads === 1 ? "" : "s"} waiting`,
      detail: "Respond quickly to improve conversion — move leads to Contacted or schedule a meeting.",
      href: "/company/leads",
      actionLabel: "Open leads",
    });
  }

  if (publishedCount > 0 && (options?.upcomingSlots ?? 0) === 0) {
    suggestions.push({
      id: "no-availability",
      priority: "high",
      title: "No demo slots open",
      detail: "Buyers cannot book until you open availability. Use bulk scheduling for all upcoming days.",
      href: "/company/availability",
      actionLabel: "Set availability",
    });
  }

  if (limit !== null && products >= limit * 0.8) {
    suggestions.push({
      id: "product-limit",
      priority: products >= limit ? "high" : "medium",
      title:
        products >= limit
          ? `Product limit reached (${products}/${limit})`
          : `Approaching product limit (${products}/${limit})`,
      detail: `Your ${plan ?? "current"} plan allows ${formatProductLimit(plan).toLowerCase()}. Upgrade for more listings.`,
      href: "/company/settings?tab=plan",
      actionLabel: "View plans",
    });
  }

  const lowViewProducts = await prisma.product.findMany({
    where: { companyId, status: "PUBLISHED", viewCount: { lt: 10 } },
    take: 3,
    select: { name: true, slug: true },
  });

  if (lowViewProducts.length > 0 && (avgViews._avg.viewCount ?? 0) < 15) {
    suggestions.push({
      id: "low-visibility",
      priority: "medium",
      title: "Boost product visibility",
      detail: `"${lowViewProducts[0]!.name}" has low views — refresh copy, enable spotlight, or check AI marketing tips.`,
      href: "/company/ai",
      actionLabel: "AI suggestions",
    });
  }

  if (!companyHasFeature(company, "ai_marketing_assistant")) {
    suggestions.push({
      id: "upgrade-ai",
      priority: "low",
      title: "Unlock Genius AI on Pro",
      detail: "Get marketing copy, audience insights, competitor benchmarks, and growth scores.",
      href: "/company/settings?tab=plan",
      actionLabel: "Upgrade",
    });
  } else if (publishedCount === 0) {
    suggestions.push({
      id: "publish-first",
      priority: "medium",
      title: "Publish your first product",
      detail: "AI insights activate once you have live listings on the marketplace.",
      href: "/company/products/new",
      actionLabel: "Add product",
    });
  }

  const spotlightLimit = spotlightLimitForPlan(plan);
  if (companyHasFeature(company, "featured_products") && spotlightLimit > 0) {
    const featured = await prisma.product.count({
      where: { companyId, featured: true, status: "PUBLISHED" },
    });
    if (featured < spotlightLimit && publishedCount > featured) {
      suggestions.push({
        id: "spotlight",
        priority: "low",
        title: "Use product spotlight slots",
        detail: `You have ${spotlightLimit - featured} Pro spotlight slot${spotlightLimit - featured === 1 ? "" : "s"} available on the homepage carousel.`,
        href: "/company/products",
        actionLabel: "Manage products",
      });
    }
  }

  const order = { high: 0, medium: 1, low: 2 };
  return suggestions.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 6);
}
