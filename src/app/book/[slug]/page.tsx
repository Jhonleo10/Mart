import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productRepository } from "@/repositories/product.repository";
import { recentlyViewedRepository } from "@/repositories/intelligence.repository";
import { ProductBookDemoView } from "@/components/products/product-book-demo-view";
import { buildPageMetadata, breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { resolveAppBaseUrl } from "@/lib/app-url";
import { JsonLdScript } from "@/components/seo/json-ld-script";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await productRepository.findBySlug(slug);
  if (!product || product.status !== "PUBLISHED" || product.company.status !== "APPROVED") {
    return { title: "Product Not Found" };
  }

  return buildPageMetadata({
    title: `${product.name} — Book demo`,
    description: product.shortDescription,
    path: `/book/${slug}`,
    image: product.images[0]?.url,
  });
}

export default async function BookDemoPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await productRepository.findBySlug(slug);

  if (!product || product.status !== "PUBLISHED" || product.company.status !== "APPROVED") {
    notFound();
  }

  const session = await auth();
  const buyerUserId = session?.user?.role === "USER" ? session.user.id : null;
  const buyerUser = buyerUserId
    ? await prisma.user.findUnique({
        where: { id: buyerUserId },
        select: { name: true, email: true, phone: true },
      })
    : null;

  if (buyerUserId) {
    await recentlyViewedRepository.record(buyerUserId, product.id);
  }

  void productRepository.incrementViews(product.id);

  const baseUrl = await resolveAppBaseUrl();
  const productSchema = productJsonLd({
    name: product.name,
    shortDescription: product.shortDescription,
    slug: product.slug,
    pricingModel: product.pricingModel,
    price: product.price,
    company: { name: product.company.name },
    category: { name: product.category.name },
    images: product.images,
    reviews: product.reviews,
  });
  const breadcrumbSchema = breadcrumbJsonLd(
    [
      { name: "Products", path: "/products" },
      { name: product.name, path: `/book/${product.slug}` },
    ],
    baseUrl,
  );

  return (
    <>
      <JsonLdScript data={[productSchema, breadcrumbSchema]} />
      <ProductBookDemoView
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          shortDescription: product.shortDescription,
          fullDescription: product.fullDescription,
          pricingModel: product.pricingModel,
          price: product.price,
          companyId: product.companyId,
          features: product.features,
          integrations: product.integrations,
          deploymentTypes: product.deploymentTypes,
          securityFeatures: product.securityFeatures,
          suitableFor: product.suitableFor,
          businessSizes: product.businessSizes,
          hasMobileApp: product.hasMobileApp,
          hasApiAccess: product.hasApiAccess,
          websiteUrl: product.websiteUrl,
          company: {
            name: product.company.name,
            logo: product.company.logo,
            status: product.company.status,
            industry: product.company.industry,
            description: product.company.description,
          },
          category: product.category,
          images: product.images,
          tags: product.tags,
          industries: product.industries,
          reviews: product.reviews,
        }}
        isLoggedIn={!!session?.user && session.user.role === "USER"}
        userDefaults={
          buyerUser
            ? {
                name: buyerUser.name ?? undefined,
                email: buyerUser.email,
                phone: buyerUser.phone ?? undefined,
              }
            : undefined
        }
      />
    </>
  );
}
