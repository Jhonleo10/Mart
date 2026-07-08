import Link from "next/link";
import { Sparkles } from "lucide-react";
import { HomeProductCarousel } from "@/components/landing/home-product-carousel";
import { SpotlightCarousel } from "@/components/landing/spotlight-carousel";
import { HomeMarketplaceGrid } from "@/components/landing/home-marketplace-grid";
import { type ShopProductCardData } from "@/components/landing/shop-product-card";
import { productRepository } from "@/repositories/product.repository";
import { categoryRepository } from "@/repositories/notification.repository";

function mapProduct(
  p: Awaited<ReturnType<typeof productRepository.search>>[0][number],
  featured = false,
): ShopProductCardData {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
    price: p.price,
    company: { name: p.company.name },
    category: { name: p.category.name },
    images: p.images,
    reviews: p.reviews,
    featured,
    adminVerified: p.adminVerified,
  };
}

export async function HomeProductCatalog() {
  const [categories, spotlightProducts, [allProducts, totalCount], [latest]] = await Promise.all([
    categoryRepository.list(),
    productRepository.findProSpotlight(12),
    productRepository.search({ limit: 100, sort: "popular" }),
    productRepository.search({ limit: 12, sort: "latest" }),
  ]);

  const spotlightIds = new Set(spotlightProducts.map((p) => p.id));
  const carouselProducts = [
    ...allProducts.filter((p) => !spotlightIds.has(p.id)),
    ...latest.filter((p) => !spotlightIds.has(p.id) && !allProducts.some((x) => x.id === p.id)),
  ].slice(0, 20);

  if (totalCount === 0) {
    return (
      <section id="products" className="section-anchor safe-container py-14 sm:py-16">
        <div className="shop-showcase shop-showcase-empty">
          <span className="shop-showcase-eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Marketplace
          </span>
          <h2 className="shop-showcase-title mt-2">Shop software</h2>
          <p className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white/80 p-10 text-center text-sm text-slate-500">
            No published products yet. Vendors can list software after registration and admin approval.
          </p>
        </div>
      </section>
    );
  }

  const gridProducts = allProducts.map((product) =>
    mapProduct(product, spotlightIds.has(product.id)),
  );

  return (
    <>
      {spotlightProducts.length > 0 ? (
        <SpotlightCarousel products={spotlightProducts.map((p) => mapProduct(p, true))} />
      ) : null}

      <section id="products" className="section-anchor safe-container py-14 sm:py-16 lg:py-24">
        <HomeProductCarousel
          products={carouselProducts.map((p) => mapProduct(p, false))}
          totalCount={totalCount}
          categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
        />

        <div className="relative mt-14 lg:mt-16">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="font-heading text-xl font-bold text-slate-900 sm:text-2xl">
                Browse the <span className="text-gradient">marketplace</span>
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Open any listing to read features, pricing, and book a demo with the vendor.
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-semibold text-brand-blue hover:text-brand-blue-dark"
            >
              View all {totalCount} products →
            </Link>
          </div>

          <HomeMarketplaceGrid products={gridProducts} />
        </div>
      </section>
    </>
  );
}
