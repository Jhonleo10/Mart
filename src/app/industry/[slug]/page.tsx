import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductCard } from "@/components/products/product-card";
import { productRepository } from "@/repositories/product.repository";
import { industryRepository } from "@/repositories/industry.repository";
import { analyticsRepository } from "@/repositories/analytics.repository";
import { buildPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { resolveAppBaseUrl } from "@/lib/app-url";
import { PageHeader, PageSection } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const industry = await industryRepository.findBySlug(slug);
  if (!industry) return { title: "Industry Not Found" };

  return buildPageMetadata({
    title: industry.metaTitle ?? `Software for ${industry.name}`,
    description:
      industry.metaDescription ??
      industry.description ??
      `Discover software solutions built for the ${industry.name} industry.`,
    path: `/industry/${slug}`,
  });
}

export default async function IndustryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const industry = await industryRepository.findBySlug(slug);
  if (!industry) notFound();

  const page = Math.max(1, Number(query.page) || 1);
  const [productsResult, featured, trending, baseUrl] = await Promise.all([
    productRepository.search({ page, limit: 12, industry: slug, sort: "popular" }),
    analyticsRepository.getFeaturedProducts(6),
    analyticsRepository.getTrendingProducts(6),
    resolveAppBaseUrl(),
  ]);

  const [products, total] = productsResult;
  const totalPages = Math.max(1, Math.ceil(total / 12));

  const jsonLd = breadcrumbJsonLd(
    [
      { name: "Home", path: "/" },
      { name: "Industries", path: "/products" },
      { name: industry.name, path: `/industry/${slug}` },
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
        title={`Software for ${industry.name}`}
        description={industry.description ?? `Top software picks for ${industry.name} businesses`}
      />

      {featured.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-xl font-bold text-slate-900">Featured Products</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {featured.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-heading text-xl font-bold text-slate-900">All Products</h2>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.length > 0 ? (
            products.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <p className="col-span-full text-center text-slate-500 py-12">
              No products tagged for this industry yet.
            </p>
          )}
        </div>
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {page > 1 && (
              <Link href={`/industry/${slug}?page=${page - 1}`}>
                <Button variant="outline">Previous</Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/industry/${slug}?page=${page + 1}`}>
                <Button variant="outline">Next</Button>
              </Link>
            )}
          </div>
        )}
      </section>

      {trending.length > 0 && (
        <section className="mt-12">
          <h2 className="font-heading text-xl font-bold text-slate-900">Trending Now</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {trending.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </PageSection>
  );
}
