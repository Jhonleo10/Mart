import { prisma } from "@/lib/prisma";
import type { LandingPageStatus, Prisma } from "@prisma/client";
import { buildDefaultLandingConfig } from "@/lib/product-landing/defaults";
import type { ProductLandingConfig } from "@/lib/product-landing/types";

function asJson<T>(value: T): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

const productInclude = {
  company: true,
  category: true,
  images: { orderBy: { order: "asc" as const } },
  industries: { include: { industry: true } },
  reviews: {
    take: 5,
    include: { user: { select: { name: true } } },
  },
} satisfies Prisma.ProductInclude;

export const productLandingRepository = {
  findByProductId(productId: string) {
    return prisma.productLandingPage.findUnique({ where: { productId } });
  },

  findByProductSlug(slug: string) {
    return prisma.product.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: {
        ...productInclude,
        landingPage: true,
      },
    });
  },

  findForLandingByProductId(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
      include: {
        ...productInclude,
        landingPage: true,
      },
    });
  },

  async ensureForProduct(productId: string) {
    const existing = await prisma.productLandingPage.findUnique({ where: { productId } });
    if (existing) return existing;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: productInclude,
    });
    if (!product) return null;

    const config = buildDefaultLandingConfig(product);
    return prisma.productLandingPage.create({
      data: {
        productId,
        status: "DRAFT",
        sectionOrder: asJson(config.sectionOrder),
        sections: asJson(config.sections),
        theme: asJson(config.theme),
        seoTitle: config.seo.title,
        seoDescription: config.seo.description,
        focusKeywords: config.seo.focusKeywords,
        ogTitle: config.seo.ogTitle,
        ogDescription: config.seo.ogDescription,
        ogImage: config.seo.ogImage,
      },
    });
  },

  saveDraft(productId: string, config: ProductLandingConfig) {
    return prisma.productLandingPage.upsert({
      where: { productId },
      create: {
        productId,
        status: "DRAFT",
        sectionOrder: asJson(config.sectionOrder),
        sections: asJson(config.sections),
        theme: asJson(config.theme),
        draftSections: asJson(config.sections),
        draftSectionOrder: asJson(config.sectionOrder),
        draftTheme: asJson(config.theme),
        seoTitle: config.seo.title,
        seoDescription: config.seo.description,
        focusKeywords: config.seo.focusKeywords,
        canonicalUrl: config.seo.canonicalUrl,
        ogTitle: config.seo.ogTitle,
        ogDescription: config.seo.ogDescription,
        ogImage: config.seo.ogImage,
      },
      update: {
        draftSections: asJson(config.sections),
        draftSectionOrder: asJson(config.sectionOrder),
        draftTheme: asJson(config.theme),
        seoTitle: config.seo.title,
        seoDescription: config.seo.description,
        focusKeywords: config.seo.focusKeywords,
        canonicalUrl: config.seo.canonicalUrl,
        ogTitle: config.seo.ogTitle,
        ogDescription: config.seo.ogDescription,
        ogImage: config.seo.ogImage,
      },
    });
  },

  async publish(productId: string, config: ProductLandingConfig) {
    const page = await prisma.productLandingPage.upsert({
      where: { productId },
      create: {
        productId,
        status: "PUBLISHED",
        publishedAt: new Date(),
        sectionOrder: asJson(config.sectionOrder),
        sections: asJson(config.sections),
        theme: asJson(config.theme),
        draftSections: asJson(config.sections),
        draftSectionOrder: asJson(config.sectionOrder),
        draftTheme: asJson(config.theme),
        seoTitle: config.seo.title,
        seoDescription: config.seo.description,
        focusKeywords: config.seo.focusKeywords,
        canonicalUrl: config.seo.canonicalUrl,
        ogTitle: config.seo.ogTitle,
        ogDescription: config.seo.ogDescription,
        ogImage: config.seo.ogImage,
      },
      update: {
        status: "PUBLISHED",
        publishedAt: new Date(),
        sectionOrder: asJson(config.sectionOrder),
        sections: asJson(config.sections),
        theme: asJson(config.theme),
        draftSections: asJson(config.sections),
        draftSectionOrder: asJson(config.sectionOrder),
        draftTheme: asJson(config.theme),
        seoTitle: config.seo.title,
        seoDescription: config.seo.description,
        focusKeywords: config.seo.focusKeywords,
        canonicalUrl: config.seo.canonicalUrl,
        ogTitle: config.seo.ogTitle,
        ogDescription: config.seo.ogDescription,
        ogImage: config.seo.ogImage,
      },
    });

    await prisma.productLandingVersion.create({
      data: {
        landingPageId: page.id,
        label: `Published ${new Date().toISOString()}`,
        snapshot: asJson(config),
      },
    });

    return page;
  },

  listVersions(landingPageId: string, limit = 10) {
    return prisma.productLandingVersion.findMany({
      where: { landingPageId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async restoreVersion(versionId: string, productId: string) {
    const version = await prisma.productLandingVersion.findFirst({
      where: { id: versionId, landingPage: { productId } },
    });
    if (!version) return null;

    const config = version.snapshot as unknown as ProductLandingConfig;
    return this.publish(productId, config);
  },

  getRelatedProducts(categoryId: string, excludeProductId: string, limit = 3) {
    return prisma.product.findMany({
      where: {
        categoryId,
        status: "PUBLISHED",
        id: { not: excludeProductId },
      },
      take: limit,
      orderBy: [{ featured: "desc" }, { viewCount: "desc" }],
      include: {
        company: { select: { name: true, slug: true, logo: true } },
        category: true,
        images: { take: 1 },
        reviews: { select: { rating: true } },
      },
    });
  },

  listByCompanyId(companyId: string) {
    return prisma.product.findMany({
      where: { companyId },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      include: {
        images: { take: 1, orderBy: { order: "asc" } },
        landingPage: { select: { status: true, publishedAt: true, seoTitle: true } },
      },
    });
  },

  countPublishedForCompany(companyId: string) {
    return prisma.productLandingPage.count({
      where: {
        status: "PUBLISHED",
        product: { companyId, status: "PUBLISHED" },
      },
    });
  },

  findPrimaryPublishedSlug(companyId: string) {
    return prisma.product.findFirst({
      where: {
        companyId,
        status: "PUBLISHED",
        landingPage: { status: "PUBLISHED" },
      },
      orderBy: [{ featured: "desc" }, { viewCount: "desc" }],
      select: { slug: true },
    });
  },
};
