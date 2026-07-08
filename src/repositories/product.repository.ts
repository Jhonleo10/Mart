import { prisma } from "@/lib/prisma";
import type { Prisma, ProductStatus } from "@prisma/client";
import type { ProductSearchParams } from "@/lib/action-types";

export const productRepository = {
  findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        company: true,
        category: true,
        images: { orderBy: { order: "asc" } },
        tags: { include: { tag: true } },
        reviews: { include: { user: { select: { name: true, image: true } } } },
      },
    });
  },

  findBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        company: {
          include: {
            subscriptions: {
              where: { status: "ACTIVE", endDate: { gt: new Date() } },
              orderBy: { endDate: "desc" },
              take: 1,
            },
          },
        },
        category: true,
        images: { orderBy: { order: "asc" } },
        tags: { include: { tag: true } },
        industries: { include: { industry: true } },
        reviews: { include: { user: { select: { name: true, image: true } } } },
      },
    });
  },

  create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data });
  },

  update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data });
  },

  incrementViews(id: string) {
    return prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  },

  findFeatured(limit = 6) {
    return prisma.product.findMany({
      where: { status: "PUBLISHED", featured: true },
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        company: { select: { name: true, slug: true, logo: true } },
        category: true,
        images: { take: 1 },
        reviews: { select: { rating: true } },
      },
    });
  },

  async findProSpotlight(limit = 12) {
    const products = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        featured: true,
        company: { status: "APPROVED" },
      },
      orderBy: { updatedAt: "desc" },
      take: Math.max(limit * 3, 24),
      include: {
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
              select: { plan: true, status: true, endDate: true },
            },
          },
        },
        category: true,
        images: { take: 1, orderBy: { order: "asc" } },
        reviews: { select: { rating: true } },
      },
    });

    const { getCompanyEffectivePlan } = await import("@/lib/plans/company-plan");
    const { isProSpotlightPlan } = await import("@/lib/plans/spotlight-policy");

    return products
      .filter((product) => isProSpotlightPlan(getCompanyEffectivePlan(product.company)))
      .slice(0, limit);
  },

  async findTopRated(limit = 10) {
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      take: 80,
      include: {
        reviews: { select: { rating: true } },
        images: { take: 1 },
        company: { select: { name: true } },
      },
    });

    const ranked = products
      .map((product) => {
        const ratings = product.reviews.map((r) => r.rating);
        const avgRating =
          ratings.length > 0 ? ratings.reduce((s, r) => s + r, 0) / ratings.length : 0;
        return { product, avgRating, reviewCount: ratings.length };
      })
      .filter((item) => item.reviewCount > 0)
      .sort(
        (a, b) =>
          b.avgRating - a.avgRating ||
          b.reviewCount - a.reviewCount ||
          b.product.viewCount - a.product.viewCount,
      )
      .slice(0, limit)
      .map(({ product, avgRating, reviewCount }) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount,
        imageUrl: product.images[0]?.url ?? null,
        companyName: product.company.name,
      }));

    if (ranked.length >= limit) return ranked;

    const usedIds = new Set(ranked.map((p) => p.id));
    const fallback = await prisma.product.findMany({
      where: { status: "PUBLISHED", id: { notIn: [...usedIds] } },
      take: limit - ranked.length,
      orderBy: { viewCount: "desc" },
      include: {
        reviews: { select: { rating: true } },
        images: { take: 1 },
        company: { select: { name: true } },
      },
    });

    return [
      ...ranked,
      ...fallback.map((product) => {
        const ratings = product.reviews.map((r) => r.rating);
        const avgRating =
          ratings.length > 0 ? ratings.reduce((s, r) => s + r, 0) / ratings.length : 4.5;
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: ratings.length,
          imageUrl: product.images[0]?.url ?? null,
          companyName: product.company.name,
        };
      }),
    ];
  },

  listByCompany(companyId: string) {
    return prisma.product.findMany({
      where: { companyId },
      include: { category: true, images: { take: 1 }, _count: { select: { bookings: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  listByCompanyPaginated(
    companyId: string,
    params: { page: number; limit: number; q?: string; status?: ProductStatus },
  ) {
    const { page, limit, q, status } = params;
    const where: Prisma.ProductWhereInput = {
      companyId,
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { shortDescription: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    return Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true, images: { take: 1 }, _count: { select: { bookings: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);
  },

  async findHeroBubbleProducts(limit = 10) {
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED", company: { status: "APPROVED" } },
      include: {
        category: { select: { name: true } },
        images: { take: 1, orderBy: { order: "asc" } },
        reviews: { select: { rating: true } },
        _count: { select: { bookings: true } },
      },
    });

    if (products.length === 0) return [];

    const maxViews = Math.max(...products.map((p) => p.viewCount), 1);
    const maxBookings = Math.max(...products.map((p) => p._count.bookings), 1);

    return products
      .map((product) => {
        const ratings = product.reviews.map((r) => r.rating);
        const reviewCount = ratings.length;
        const avgRating =
          reviewCount > 0 ? ratings.reduce((s, r) => s + r, 0) / reviewCount : 0;

        const ratingScore =
          reviewCount > 0
            ? (avgRating / 5) * (0.55 + 0.45 * Math.min(reviewCount, 25) / 25)
            : 0;
        const viewScore = product.viewCount / maxViews;
        const bookingScore = product._count.bookings / maxBookings;

        const score = ratingScore * 0.38 + viewScore * 0.34 + bookingScore * 0.28;

        return { product, score };
      })
      .sort(
        (a, b) =>
          b.score - a.score ||
          b.product.viewCount - a.product.viewCount ||
          b.product._count.bookings - a.product._count.bookings,
      )
      .slice(0, limit)
      .map(({ product }) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        categoryName: product.category.name,
        imageUrl: product.images[0]?.url ?? null,
      }));
  },

  search(params: ProductSearchParams) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 12;
    const where: Prisma.ProductWhereInput = {
      status: "PUBLISHED",
      company: { status: "APPROVED" },
    };

    if (params.q) {
      const needle = params.q.trim();
      where.OR = [
        { name: { contains: needle, mode: "insensitive" } },
        { shortDescription: { contains: needle, mode: "insensitive" } },
        { fullDescription: { contains: needle, mode: "insensitive" } },
        { category: { name: { contains: needle, mode: "insensitive" } } },
        { category: { slug: { contains: needle, mode: "insensitive" } } },
        { company: { name: { contains: needle, mode: "insensitive" } } },
      ];
    }
    if (params.category) where.category = { slug: params.category };
    if (params.company) where.company = { slug: params.company };
    if (params.industry) {
      where.industries = { some: { industry: { slug: params.industry } } };
    }
    if (params.featured) where.featured = true;
    if (params.pricingModel) where.pricingModel = params.pricingModel as Prisma.EnumPricingModelFilter["equals"];
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.price = {};
      if (params.minPrice !== undefined) where.price.gte = params.minPrice;
      if (params.maxPrice !== undefined) where.price.lte = params.maxPrice;
    }
    if (params.tag) {
      where.tags = { some: { tag: { slug: params.tag } } };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = {
      createdAt: "desc",
    };
    if (params.sort === "popular") orderBy = { viewCount: "desc" };
    if (params.sort === "latest") orderBy = { createdAt: "desc" };
    if (params.sort === "featured") {
      orderBy = [{ featured: "desc" }, { updatedAt: "desc" }];
    }

    return Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          company: { select: { name: true, slug: true, logo: true } },
          category: true,
          images: { take: 1 },
          reviews: { select: { rating: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);
  },

  adminList(params: {
    page: number;
    limit: number;
    status?: ProductStatus;
    verified?: "true" | "false";
    q?: string;
    categoryId?: string;
  }) {
    const { page, limit, status, verified, q, categoryId } = params;
    const where: Prisma.ProductWhereInput = {
      ...(status ? { status } : {}),
      ...(verified === "true" ? { adminVerified: true } : {}),
      ...(verified === "false" ? { adminVerified: false, status: "PUBLISHED" } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { shortDescription: { contains: q, mode: "insensitive" } },
              { company: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    };
    return Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { company: true, category: true, images: { take: 1, orderBy: { order: "asc" } } },
      }),
      prisma.product.count({ where }),
    ]);
  },
};
