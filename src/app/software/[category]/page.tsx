import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { productRepository } from "@/repositories/product.repository";
import { categoryRepository } from "@/repositories/notification.repository";
import { analyticsRepository } from "@/repositories/analytics.repository";
import { buildPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { resolveAppBaseUrl } from "@/lib/app-url";
import { PageHeader, PageSection } from "@/components/layout/page-shell";
import { getProductBookDemoPath } from "@/lib/product-public-url";

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await categoryRepository.findBySlug(slug);
  if (!category) return { title: "Category Not Found" };

  return buildPageMetadata({
    title: category.metaTitle ?? `${category.name} Software`,
    description:
      category.metaDescription ??
      category.description ??
      `Discover top ${category.name} software solutions. Compare features, pricing, and reviews.`,
    path: `/software/${slug}`,
  });
}

export default async function CategorySoftwarePage({ params, searchParams }: PageProps) {
  const { category: slug } = await params;
  const query = await searchParams;
  const category = await categoryRepository.findBySlug(slug);
  if (!category) notFound();

  const page = Math.max(1, Number(query.page) || 1);
  const [productsResult, featured, trending, baseUrl] = await Promise.all([
    productRepository.search({
      page,
      limit: 12,
      category: slug,
      sort: (query.sort as "popular" | "latest") || "popular",
    }),
    productRepository.findFeatured(4),
    analyticsRepository.getTrendingProducts(4),
    resolveAppBaseUrl(),
  ]);

  const [products, total] = productsResult;
  const totalPages = Math.max(1, Math.ceil(total / 12));
  const featuredInCategory = featured.filter((p) => p.category.slug === slug);

  const jsonLd = breadcrumbJsonLd(
    [
      { name: "Home", path: "/" },
      { name: "Software", path: "/products" },
      { name: category.name, path: `/software/${slug}` },
    ],
    baseUrl,
  );

  return (
    <PageSection>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        title={`${category.name} Software`}
        description={category.description ?? `Browse verified ${category.name} solutions`}
      />

      {featuredInCategory.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-xl font-bold text-slate-900">Featured in {category.name}</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {featuredInCategory.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-heading text-xl font-bold text-slate-900">All {category.name} Products</h2>
          <span className="text-sm text-slate-500">{total} results</span>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {page > 1 && (
              <Link href={`/software/${slug}?page=${page - 1}`}>
                <Button variant="outline">Previous</Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/software/${slug}?page=${page + 1}`}>
                <Button variant="outline">Next</Button>
              </Link>
            )}
          </div>
        )}
      </section>

      {trending.length > 0 && (
        <section className="mt-12 rounded-2xl border border-slate-100 bg-slate-50 p-6">
          <h2 className="font-heading text-lg font-bold text-slate-900">Trending in this category</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {trending
              .filter((p) => p.category.slug === slug)
              .map((p) => (
                <Link
                  key={p.id}
                  href={getProductBookDemoPath(p.slug)}
                  className="rounded-full bg-white px-4 py-2 text-sm font-medium text-brand-blue shadow-sm"
                >
                  {p.name}
                </Link>
              ))}
          </div>
        </section>
      )}
    </PageSection>
  );
}
