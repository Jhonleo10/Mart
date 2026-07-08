import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DiscoveryHub } from "@/components/user/discovery-hub";
import { getRecommendationsForUser } from "@/lib/intelligence/recommendation-engine";
import { requirementRepository, recentlyViewedRepository } from "@/repositories/intelligence.repository";
import { productRepository } from "@/repositories/product.repository";
import { categoryRepository } from "@/repositories/category.repository";

export default async function UserDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [profile, recommendationResult, trendingResult, categories, recentlyViewed, newProducts] =
    await Promise.all([
      requirementRepository.getByUserId(session.user.id),
      getRecommendationsForUser(session.user.id, 6),
      productRepository.search({ page: 1, limit: 8, sort: "popular" }),
      categoryRepository.listWithProductCounts(),
      recentlyViewedRepository.list(session.user.id, 4),
      prisma.product.findMany({
        where: { status: "PUBLISHED", company: { status: "APPROVED" } },
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          company: { select: { name: true, slug: true, logo: true } },
          category: true,
          images: { take: 1 },
          reviews: { select: { rating: true } },
        },
      }),
    ]);

  const [trending] = trendingResult;
  const { recommendations, source: recommendationSource } = recommendationResult;
  const topRated = recommendations.filter((r) => r.avgRating >= 4).slice(0, 4);

  return (
    <div className="dash-page-enter">
      <DiscoveryHub
        userName={session.user.name ?? "User"}
        recommendations={recommendations}
        recommendationSource={recommendationSource}
        trending={trending}
        categories={categories}
        recentlyViewed={recentlyViewed}
        topRated={topRated.length > 0 ? topRated : recommendations.slice(0, 4)}
        newLaunches={newProducts.map((p) => ({ ...p, features: p.features ?? [] }))}
        hasRequirements={!!profile}
      />
    </div>
  );
}
