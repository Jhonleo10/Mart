import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { resolveAppBaseUrl } from "@/lib/app-url";
import { getVendorPublicPath } from "@/lib/vendor-public-url";
import { getProductPublicPath } from "@/lib/product-public-url";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = await resolveAppBaseUrl();

  const [products, companies, categories, industries] = await Promise.all([
    prisma.product.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        updatedAt: true,
        landingPage: { select: { status: true, publishedAt: true } },
      },
    }),
    prisma.company.findMany({
      where: { status: "APPROVED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.industry.findMany({ select: { slug: true, updatedAt: true } }),
  ]);
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/companies`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  return [
    ...staticRoutes,
    ...products.map((p) => ({
      url: `${baseUrl}${getProductPublicPath(p.slug)}`,      lastModified: p.landingPage?.publishedAt ?? p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: p.landingPage?.status === "PUBLISHED" ? 0.95 : 0.85,
    })),
    ...companies.map((c) => ({
      url: `${baseUrl}${getVendorPublicPath(c)}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...categories.map((c) => ({
      url: `${baseUrl}/software/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...industries.map((i) => ({
      url: `${baseUrl}/industry/${i.slug}`,
      lastModified: i.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}