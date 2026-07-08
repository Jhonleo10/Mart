import type { SubscriptionPlan } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { computeTrendingScore } from "@/repositories/analytics.repository";
import { trendingBoostForPlan } from "@/lib/plans/company-plan";

const sinceDays = 30;

export async function buildCompanyAdvancedAnalytics(companyId: string) {
  const since = new Date(Date.now() - sinceDays * 86400000);

  const [products, leads, viewsByDay, leadsByDay, categoryBenchmarks] = await Promise.all([
    prisma.product.findMany({
      where: { companyId },
      include: {
        category: true,
        _count: {
          select: {
            views: { where: { createdAt: { gte: since } } },
            clicks: { where: { createdAt: { gte: since } } },
            bookings: { where: { createdAt: { gte: since } } },
          },
        },
      },
    }),
    prisma.booking.findMany({
      where: { companyId, createdAt: { gte: since } },
      select: { status: true, preferredTime: true, createdAt: true, productId: true },
    }),
    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT DATE(pv."createdAt") as day, COUNT(*)::bigint as count
      FROM "ProductView" pv
      INNER JOIN "Product" p ON p.id = pv."productId"
      WHERE p."companyId" = ${companyId} AND pv."createdAt" >= ${since}
      GROUP BY DATE(pv."createdAt")
      ORDER BY day ASC
    `,
    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT DATE(b."createdAt") as day, COUNT(*)::bigint as count
      FROM "Booking" b
      WHERE b."companyId" = ${companyId} AND b."createdAt" >= ${since}
      GROUP BY DATE(b."createdAt")
      ORDER BY day ASC
    `,
    prisma.product.groupBy({
      by: ["categoryId"],
      where: { status: "PUBLISHED", companyId: { not: companyId } },
      _avg: { viewCount: true },
      _count: true,
    }),
  ]);

  const productScores = products.map((product) => {
    const score = computeTrendingScore({
      views: product._count.views || product.viewCount,
      clicks: product._count.clicks || product.clickCount,
      demoRequests: product._count.bookings,
      leads: product._count.bookings,
    });
    const benchmark = categoryBenchmarks.find((b) => b.categoryId === product.categoryId);
    const categoryAvgViews = Math.round(benchmark?._avg.viewCount ?? 0);
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      status: product.status,
      views: product.viewCount,
      leads: product._count.bookings,
      score,
      categoryName: product.category.name,
      categoryAvgViews,
      vsCategory:
        categoryAvgViews > 0
          ? Math.round(((product.viewCount - categoryAvgViews) / categoryAvgViews) * 100)
          : null,
    };
  });

  const leadStatusBreakdown = leads.reduce(
    (acc, lead) => {
      acc[lead.status] = (acc[lead.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const preferredTimes = leads
    .map((l) => l.preferredTime)
    .filter(Boolean) as string[];
  const timeFrequency = preferredTimes.reduce(
    (acc, time) => {
      acc[time] = (acc[time] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const topBookingTimes = Object.entries(timeFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([time, count]) => ({ time, count }));

  return {
    productScores: productScores.sort((a, b) => b.score - a.score),
    leadStatusBreakdown,
    topBookingTimes,
    viewsTrend: viewsByDay.map((row) => ({
      day: row.day.toISOString().slice(0, 10),
      count: Number(row.count),
    })),
    leadsTrend: leadsByDay.map((row) => ({
      day: row.day.toISOString().slice(0, 10),
      count: Number(row.count),
    })),
    totalViews30d: viewsByDay.reduce((sum, row) => sum + Number(row.count), 0),
    totalLeads30d: leads.length,
  };
}

export async function buildAiMarketingInsights(companyId: string) {
  const products = await prisma.product.findMany({
    where: { companyId, status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      name: true,
      shortDescription: true,
      features: true,
      viewCount: true,
      _count: { select: { bookings: true } },
    },
  });

  return products.map((product) => {
    const tips: string[] = [];
    if (product.shortDescription.length < 80) {
      tips.push("Expand the short description to 120+ characters for better SEO and buyer trust.");
    }
    if (product.features.length < 4) {
      tips.push("Add at least 4 bullet features — buyers compare solutions by feature lists.");
    }
    if (product.viewCount > 10 && product._count.bookings === 0) {
      tips.push("High views but no demos — add a stronger CTA and schedule more availability slots.");
    }
    if (product._count.bookings > 0 && product.viewCount < 5) {
      tips.push("Strong conversion — consider featuring this product in your spotlight.");
    }
    if (tips.length === 0) {
      tips.push("Listing looks healthy — keep availability open and refresh screenshots quarterly.");
    }

    return {
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      tips,
      suggestedHeadline: `${product.name} — Book a personalized demo today`,
      suggestedCta: "Schedule a free demo",
      needsAvailability: product.viewCount > 10 && product._count.bookings === 0,
    };
  });
}

export async function buildAiAudienceInsights(companyId: string) {
  const leads = await prisma.booking.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      name: true,
      email: true,
      preferredTime: true,
      preferredDate: true,
      status: true,
      product: { select: { name: true, category: { select: { name: true } } } },
    },
  });

  const categoryInterest = leads.reduce(
    (acc, lead) => {
      const cat = lead.product?.category.name ?? "General";
      acc[cat] = (acc[cat] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const topCategories = Object.entries(categoryInterest)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const qualifiedRate =
    leads.length > 0
      ? Math.round(
          (leads.filter((l) => ["QUALIFIED", "CONVERTED"].includes(l.status)).length /
            leads.length) *
            100,
        )
      : 0;

  const timeFrequency = leads
    .map((l) => l.preferredTime)
    .filter(Boolean)
    .reduce(
      (acc, time) => {
        acc[time as string] = (acc[time as string] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

  const topBookingTimes = Object.entries(timeFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([time, count]) => ({ time, count }));

  return {
    totalLeads: leads.length,
    qualifiedRate,
    topCategories,
    topBookingTimes,
    recentLeads: leads.slice(0, 8).map((l, index) => ({
      id: `${l.email}-${l.product?.name ?? "general"}-${l.preferredTime ?? "na"}-${index}`,
      name: l.name,
      product: l.product?.name ?? "General",
      status: l.status,
      preferredTime: l.preferredTime,
    })),
    insight:
      topCategories.length > 0
        ? `Most interest is coming from ${topCategories[0][0]} products — double down on demos in that category.`
        : "Publish products and promote demo booking to build audience intelligence.",
  };
}

export async function buildAiCompetitorInsights(companyId: string) {
  const companyProducts = await prisma.product.findMany({
    where: { companyId, status: "PUBLISHED" },
    include: { category: true },
  });

  if (companyProducts.length === 0) {
    return { comparisons: [], summary: "Publish products to unlock competitor benchmarks." };
  }

  const comparisons = await Promise.all(
    companyProducts.map(async (product) => {
      const peers = await prisma.product.findMany({
        where: {
          status: "PUBLISHED",
          categoryId: product.categoryId,
          NOT: { companyId },
        },
        take: 5,
        orderBy: { viewCount: "desc" },
        select: { name: true, viewCount: true, clickCount: true, price: true, pricingModel: true },
      });

      const peerAvgViews =
        peers.length > 0
          ? Math.round(peers.reduce((s, p) => s + p.viewCount, 0) / peers.length)
          : 0;

      return {
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        category: product.category.name,
        yourViews: product.viewCount,
        peerAvgViews,
        gapPercent:
          peerAvgViews > 0
            ? Math.round(((product.viewCount - peerAvgViews) / peerAvgViews) * 100)
            : null,
        topPeers: peers.slice(0, 3).map((p) => ({
          name: p.name,
          views: p.viewCount,
          pricingModel: p.pricingModel,
        })),
        recommendation:
          product.viewCount < peerAvgViews
            ? "Below category average visibility — enable spotlight placement and keep demo slots open."
            : "Above category average — maintain demo availability to convert interest.",
      };
    }),
  );

  return {
    comparisons,
    summary: "Benchmarks compare your published products to top peers in the same category.",
  };
}

export async function getTrendingWithPlanBoost(limit = 6) {
  const since = new Date(Date.now() - 30 * 86400000);
  const published = await prisma.product.findMany({
    where: { status: "PUBLISHED", company: { status: "APPROVED" } },
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      pricingModel: true,
      price: true,
      viewCount: true,
      clickCount: true,
      featured: true,
      company: {
        select: {
          name: true,
          slug: true,
          logo: true,
          selectedPlan: true,
          subscriptions: {
            where: { status: "ACTIVE", endDate: { gt: new Date() } },
            orderBy: { endDate: "desc" },
            take: 1,
            select: { plan: true },
          },
        },
      },
      category: { select: { name: true, slug: true } },
      images: { take: 1, orderBy: { order: "asc" } },
      reviews: { select: { rating: true } },
      _count: {
        select: {
          views: { where: { createdAt: { gte: since } } },
          clicks: { where: { createdAt: { gte: since } } },
          bookings: { where: { createdAt: { gte: since }, type: "DEMO" } },
        },
      },
    },
  });

  const scored = published
    .map((product) => {
      const plan =
        product.company.subscriptions[0]?.plan ?? product.company.selectedPlan ?? null;
      const boost = trendingBoostForPlan(plan);
      const base = computeTrendingScore({
        views: product._count.views || product.viewCount,
        clicks: product._count.clicks || product.clickCount,
        demoRequests: product._count.bookings,
        leads: product._count.bookings,
      });
      return { product, score: Math.round(base * boost) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ product, score }) => ({ ...product, trendingScore: score }));
}
