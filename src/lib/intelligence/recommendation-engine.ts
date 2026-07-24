import { prisma } from "@/lib/prisma";
import type {
  IntelligenceProduct,
  ProductRecommendation,
  UserRecommendationsResult,
  UserRequirements,
} from "@/lib/intelligence/types";
import {
  buildProsCons,
  buildWhyThis,
  computeFinalScore,
  computeScoreBreakdown,
} from "@/lib/intelligence/scoring";

const PRODUCT_INCLUDE = {
  company: {
    select: {
      name: true,
      slug: true,
      logo: true,
      status: true,
      industry: true,
    },
  },
  category: { select: { name: true, slug: true } },
  images: { take: 1, orderBy: { order: "asc" as const } },
  reviews: { select: { rating: true, comment: true } },
  industries: { include: { industry: { select: { name: true, slug: true } } } },
};

export async function loadPublishedProducts(limit = 120): Promise<IntelligenceProduct[]> {
  return prisma.product.findMany({
    where: { status: "PUBLISHED", company: { status: "APPROVED" } },
    take: limit,
    orderBy: [{ featured: "desc" }, { viewCount: "desc" }],
    include: PRODUCT_INCLUDE,
  }) as Promise<IntelligenceProduct[]>;
}

function toRecommendation(
  product: IntelligenceProduct,
  requirements: UserRequirements,
  allScored: { product: IntelligenceProduct; score: number }[],
  extras?: Partial<Pick<ProductRecommendation, "matchLabel" | "profileScored" | "matchScore" | "whyThis">>,
): ProductRecommendation {
  const breakdown = computeScoreBreakdown(requirements, product);
  const score = extras?.matchScore ?? computeFinalScore(breakdown);
  const { pros, cons } = buildProsCons(product);
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;

  const alternatives = allScored
    .filter((s) => s.product.id !== product.id)
    .filter(
      (s) =>
        s.product.category.slug === product.category.slug || s.score >= score - 15,
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => ({
      id: s.product.id,
      slug: s.product.slug,
      name: s.product.name,
      matchScore: s.score,
    }));

  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    companyName: product.company.name,
    companySlug: product.company.slug,
    companyLogo: product.company.logo,
    categoryName: product.category.name,
    price: product.price,
    pricingModel: product.pricingModel,
    imageUrl: product.images[0]?.url ?? null,
    avgRating: Math.round(avgRating * 10) / 10,
    reviewCount: product.reviews.length,
    matchScore: score,
    breakdown,
    whyThis: extras?.whyThis ?? buildWhyThis(breakdown, product),
    pros,
    cons,
    suitableFor:
      product.suitableFor.length > 0
        ? product.suitableFor
        : [`${product.category.name} teams`, product.company.industry ?? "Growing businesses"].filter(
            Boolean,
          ) as string[],
    alternatives,
    ...extras,
  };
}

export async function generateRecommendations(
  requirements: UserRequirements,
  limit = 12,
): Promise<ProductRecommendation[]> {
  const products = await loadPublishedProducts(150);

  const scored = products.map((product) => {
    const breakdown = computeScoreBreakdown(requirements, product);
    return { product, score: computeFinalScore(breakdown) };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ product }) => {
    const breakdown = computeScoreBreakdown(requirements, product);
    const score = computeFinalScore(breakdown);
    return toRecommendation(
      product,
      requirements,
      scored.map((s) => ({ product: s.product, score: s.score })),
      { profileScored: true },
    );
  });
}

async function loadBehavioralProducts(
  userId: string,
  limit: number,
): Promise<{ products: IntelligenceProduct[]; hasBehavioralSignal: boolean }> {
  const [wishlist, bookings, featured] = await Promise.all([
    prisma.wishlist.findMany({
      where: { userId },
      take: 5,
      include: { product: { select: { categoryId: true } } },
    }),
    prisma.booking.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { product: { select: { categoryId: true } } },
    }),
    loadPublishedProducts(limit),
  ]);

  const categoryIds = [
    ...wishlist.map((w) => w.product.categoryId),
    ...bookings.map((b) => b.product?.categoryId).filter(Boolean),
  ].filter(Boolean) as string[];

  if (categoryIds.length === 0) {
    return {
      products: featured,
      hasBehavioralSignal: false,
    };
  }

  const topCategory = categoryIds.reduce(
    (acc, id) => {
      acc[id] = (acc[id] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const preferredCategory = Object.entries(topCategory).sort((a, b) => b[1] - a[1])[0]?.[0];

  const personalized = preferredCategory
    ? await prisma.product.findMany({
        where: {
          status: "PUBLISHED",
          company: { status: "APPROVED" },
          categoryId: preferredCategory,
          id: { notIn: wishlist.map((w) => w.productId) },
        },
        take: limit,
        orderBy: [{ featured: "desc" }, { viewCount: "desc" }],
        include: PRODUCT_INCLUDE,
      })
    : [];

  const merged = [...personalized, ...featured];
  const seen = new Set<string>();
  const products = merged.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  }).slice(0, limit);

  return { products, hasBehavioralSignal: true };
}

export async function getRecommendationsForUser(
  userId: string,
  limit = 8,
): Promise<UserRecommendationsResult> {
  const profile = await prisma.userRequirementProfile.findUnique({ where: { userId } });

  if (profile) {
    const requirements: UserRequirements = {
      industry: profile.industry ?? undefined,
      businessSize: profile.businessSize ?? undefined,
      budgetMax: profile.budgetMax ?? undefined,
      requiredFeatures: profile.requiredFeatures,
      preferredIntegrations: profile.preferredIntegrations,
      companyType: profile.companyType ?? undefined,
      deploymentPreference: profile.deploymentPreference ?? undefined,
      country: profile.country ?? undefined,
    };

    return {
      recommendations: await generateRecommendations(requirements, limit),
      hasProfile: true,
      source: "profile",
    };
  }

  const { products, hasBehavioralSignal } = await loadBehavioralProducts(userId, limit);
  const source = hasBehavioralSignal ? "behavioral" : "popular";
  const matchLabel = hasBehavioralSignal ? "Suggested" : "Trending";
  const whyThis = hasBehavioralSignal
    ? ["Based on categories from your saved products and demo requests"]
    : ["Popular picks across the marketplace — build your requirement profile for personalized scores"];

  const scored = products.map((product) => ({
    product,
    score: computeFinalScore(computeScoreBreakdown({}, product)),
  }));

  const recommendations = products.map((product) =>
    toRecommendation(product, {}, scored, {
      matchLabel,
      profileScored: false,
      matchScore: 0,
      whyThis,
    }),
  );

  return {
    recommendations,
    hasProfile: false,
    source,
  };
}
