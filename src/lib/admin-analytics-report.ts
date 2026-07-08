import { getAnalyticsData } from "@/lib/admin-analytics";
import { getTrendingWithPlanBoost } from "@/lib/company-analytics";
import { prisma } from "@/lib/prisma";

export type AdminAnalyticsReport = Awaited<ReturnType<typeof getAdminAnalyticsReport>>;

export async function getAdminAnalyticsReport(days = 30) {
  const safeDays = Math.min(365, Math.max(1, days));

  const [analytics, trending, leads] = await Promise.all([
    getAnalyticsData(safeDays),
    getTrendingWithPlanBoost(50),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true, slug: true } },
        company: { select: { name: true, slug: true } },
        user: { select: { email: true, name: true } },
      },
    }),
  ]);

  return {
    days: safeDays,
    generatedAt: new Date(),
    analytics,
    trending,
    leads,
  };
}
