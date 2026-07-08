import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { productRepository } from "@/repositories/product.repository";
import { getPricingPlansForDisplay } from "@/services/site-settings.service";
import { getVendorDisplayPlans } from "@/lib/settings/pricing";
import { safeDbQuery } from "@/lib/db/safe-query";

const getHomeStats = unstable_cache(
  async () =>
    Promise.all([
      prisma.company.count({ where: { status: "APPROVED" } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.product.count({ where: { status: "PUBLISHED" } }),
      prisma.category.count(),
    ]),
  ["home-page-stats"],
  { revalidate: 300, tags: ["home-page", "stats"] },
);

const getHomeCompanies = unstable_cache(
  async () =>
    prisma.company.findMany({
      where: { status: "APPROVED" },
      take: 12,
      orderBy: { createdAt: "desc" },
      select: { name: true, logo: true, industry: true },
    }),
  ["home-page-companies"],
  { revalidate: 300, tags: ["home-page", "companies"] },
);

const getHomeBubbleProducts = unstable_cache(
  async () => productRepository.findHeroBubbleProducts(10),
  ["home-page-bubble-products"],
  { revalidate: 300, tags: ["home-page", "products"] },
);

export async function getHomePageData() {
  const [stats, pricingPlans, companies, bubbleProducts] = await Promise.all([
    safeDbQuery("homeStats", () => getHomeStats(), [0, 0, 0, 0] as const),
    getPricingPlansForDisplay(),
    safeDbQuery("homeCompanies", () => getHomeCompanies(), []),
    safeDbQuery("homeBubbleProducts", () => getHomeBubbleProducts(), []),
  ]);

  const [companyCount, userCount, productCount, categoryCount] = stats;

  return {
    companyCount,
    userCount,
    productCount,
    categoryCount,
    pricingPlans: getVendorDisplayPlans(pricingPlans),
    companies,
    bubbleProducts,
  };
}
