import { prisma } from "@/lib/prisma";
import { buildAiMarketingInsights } from "@/lib/company-analytics";
import { companyHasFeature } from "@/lib/plans/company-plan";

export async function getCompanyDashboardAiInsight(companyId: string, hasAi: boolean) {
  if (!hasAi) {
    return {
      locked: true as const,
      headline: "Unlock Genius AI on Pro",
      detail: "Upgrade to Pro for marketing copy, audience intelligence, competitor analysis, and growth dashboards.",
      href: "/company/settings",
      score: null as number | null,
    };
  }

  const insights = await buildAiMarketingInsights(companyId);
  const top = insights[0];

  if (!top) {
    return {
      locked: false as const,
      headline: "Publish products to unlock AI recommendations",
      detail: "Once your first product is live, Genius AI will suggest headlines, CTAs, and growth tips.",
      href: "/company/products/new",
      score: null as number | null,
    };
  }

  const score = Math.min(100, 55 + top.tips.length * 8 + (top.tips[0]?.length ?? 0) / 4);

  return {
    locked: false as const,
    headline: top.suggestedHeadline,
    detail: top.tips[0] ?? "Your listings look healthy — keep optimizing.",
    productName: top.productName,
    href: "/company/ai",
    score: Math.round(score),
  };
}

export async function getCompanyAiProductScores(companyId: string) {
  const products = await prisma.product.findMany({
    where: { companyId, status: "PUBLISHED" },
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      viewCount: true,
      _count: { select: { bookings: true } },
    },
    take: 5,
  });

  return products.map((p) => {
    let score = 50;
    if (p.shortDescription.length >= 80) score += 15;
    if (p.viewCount > 20) score += 15;
    if (p._count.bookings > 0) score += 20;
    if (p._count.bookings > 0 && p.viewCount > 0) {
      const conv = (p._count.bookings / p.viewCount) * 100;
      if (conv > 5) score += 10;
    }
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      score: Math.min(100, score),
    };
  });
}

export function companyHasAiFeature(company: Parameters<typeof companyHasFeature>[0]) {
  return companyHasFeature(company, "ai_marketing_assistant");
}
