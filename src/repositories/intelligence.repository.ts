import { prisma } from "@/lib/prisma";
import type { UserRequirements } from "@/lib/intelligence/types";

export const requirementRepository = {
  getByUserId(userId: string) {
    return prisma.userRequirementProfile.findUnique({ where: { userId } });
  },

  upsert(userId: string, data: UserRequirements) {
    return prisma.userRequirementProfile.upsert({
      where: { userId },
      create: {
        userId,
        industry: data.industry,
        businessSize: data.businessSize,
        budgetMax: data.budgetMax,
        requiredFeatures: data.requiredFeatures ?? [],
        preferredIntegrations: data.preferredIntegrations ?? [],
        companyType: data.companyType,
        deploymentPreference: data.deploymentPreference,
        country: data.country ?? "IN",
      },
      update: {
        industry: data.industry,
        businessSize: data.businessSize,
        budgetMax: data.budgetMax,
        requiredFeatures: data.requiredFeatures ?? [],
        preferredIntegrations: data.preferredIntegrations ?? [],
        companyType: data.companyType,
        deploymentPreference: data.deploymentPreference,
        country: data.country ?? "IN",
      },
    });
  },
};

export const recentlyViewedRepository = {
  async record(userId: string, productId: string) {
    await prisma.productRecentlyViewed.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: { viewedAt: new Date() },
    });
  },

  list(userId: string, limit = 8) {
    return prisma.productRecentlyViewed.findMany({
      where: { userId },
      orderBy: { viewedAt: "desc" },
      take: limit,
      include: {
        product: {
          include: {
            company: { select: { name: true, slug: true, logo: true } },
            category: true,
            images: { take: 1 },
            reviews: { select: { rating: true } },
          },
        },
      },
    });
  },
};
