import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

const TRENDING_WEIGHTS = {
  views: 1,
  clicks: 2,
  demoRequests: 5,
  leads: 10,
} as const;

export function computeTrendingScore(metrics: {
  views: number;
  clicks: number;
  demoRequests: number;
  leads: number;
}) {
  return (
    metrics.views * TRENDING_WEIGHTS.views +
    metrics.clicks * TRENDING_WEIGHTS.clicks +
    metrics.demoRequests * TRENDING_WEIGHTS.demoRequests +
    metrics.leads * TRENDING_WEIGHTS.leads
  );
}

function hashIp(ip: string | null) {
  if (!ip) return null;
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export const analyticsRepository = {
  async recordView(productId: string, ip?: string | null, userAgent?: string | null) {
    await prisma.$transaction([
      prisma.productView.create({
        data: {
          productId,
          ipHash: hashIp(ip ?? null),
          userAgent: userAgent ?? null,
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { viewCount: { increment: 1 } },
      }),
    ]);
  },

  async recordClick(productId: string, clickType: "website" | "demo", ip?: string | null) {
    await prisma.$transaction([
      prisma.productClick.create({
        data: {
          productId,
          clickType,
          ipHash: hashIp(ip ?? null),
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { clickCount: { increment: 1 } },
      }),
    ]);
  },

  async getTrendingProducts(limit = 6) {
    const { getTrendingWithPlanBoost } = await import("@/lib/company-analytics");
    return getTrendingWithPlanBoost(limit);
  },

  async getFeaturedProducts(limit = 6) {
    return prisma.product.findMany({
      where: { status: "PUBLISHED", featured: true },
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        company: { select: { name: true, slug: true, logo: true } },
        category: true,
        images: { take: 1, orderBy: { order: "asc" } },
        reviews: { select: { rating: true } },
      },
    });
  },

  async getLatestProducts(limit = 6) {
    return prisma.product.findMany({
      where: { status: "PUBLISHED" },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { name: true, slug: true, logo: true } },
        category: true,
        images: { take: 1, orderBy: { order: "asc" } },
        reviews: { select: { rating: true } },
      },
    });
  },

  async getOrCreateComparison(productAId: string, productBId: string, slug: string) {
    const [a, b] = productAId < productBId ? [productAId, productBId] : [productBId, productAId];
    return prisma.comparison.upsert({
      where: { productAId_productBId: { productAId: a, productBId: b } },
      create: { productAId: a, productBId: b, slug },
      update: { viewCount: { increment: 1 } },
    });
  },
};
