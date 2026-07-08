import Link from "next/link";
import type { Metadata } from "next";
import { LayoutGrid } from "lucide-react";
import { ProductsCatalogHero } from "@/components/products/products-catalog-hero";
import { ModernProductCard } from "@/components/products/modern-product-card";
import { ProductsExploreFilters } from "@/components/products/products-explore-filters";
import { productRepository } from "@/repositories/product.repository";
import { categoryRepository } from "@/repositories/category.repository";
import { industryRepository } from "@/repositories/industry.repository";
import { buildPageMetadata } from "@/lib/seo";
import { getPaginationRange } from "@/lib/pagination";
import { EmptyState, PaginationLink } from "@/components/layout/page-shell";
import { safeDbQuery } from "@/lib/db/safe-query";

const PAGE_SIZE = 24;

interface PageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    category?: string;
    industry?: string;
    sort?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const query = await searchParams;
  const hasFilters = Boolean(query.q || query.category || query.industry || (query.page && query.page !== "1"));
  const title = query.q
    ? `Search: ${query.q}`
    : query.category
      ? `${query.category.replace(/-/g, " ")} software`
      : "Shop Software";

  return buildPageMetadata({
    title,
    description:
      "Browse and compare all verified SaaS products on Genius Mart. Filter by category, industry, and popularity.",
    path: "/products",
    noIndex: hasFilters,
  });
}

export default async function ProductsExplorePage({ searchParams }: PageProps) {
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const sort = (query.sort as "popular" | "latest" | "featured") || "popular";

  const [categories, industries, productsResult] = await Promise.all([
    safeDbQuery("productsCategories", () => categoryRepository.list(), []),
    safeDbQuery("productsIndustries", () => industryRepository.list(), []),
    safeDbQuery(
      "productsSearch",
      () =>
        productRepository.search({
          page,
          limit: PAGE_SIZE,
          q: query.q,
          category: query.category,
          industry: query.industry,
          sort,
        }),
      [[], 0] as const,
    ),
  ]);

  const [products, total] = productsResult;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageNumbers = getPaginationRange(page, totalPages);
  const hasActiveFilters = Boolean(query.q || query.category || query.industry);

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.category) params.set("category", query.category);
    if (query.industry) params.set("industry", query.industry);
    if (sort !== "popular") params.set("sort", sort);
    params.set("page", String(nextPage));
    return `/products?${params.toString()}`;
  }

  function filterHref(overrides: { category?: string; industry?: string; q?: string }) {
    const params = new URLSearchParams();
    const q = overrides.q !== undefined ? overrides.q : query.q;
    const category = overrides.category !== undefined ? overrides.category : query.category;
    const industry = overrides.industry !== undefined ? overrides.industry : query.industry;
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (industry) params.set("industry", industry);
    if (sort !== "popular") params.set("sort", sort);
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  return (
    <div className="catalog-page">
      <ProductsCatalogHero
        total={total}
        categories={categories}
        activeCategory={query.category}
      />

      <section className="catalog-body">
        <div className="safe-container">
          <div className="catalog-layout">
            <aside className="catalog-sidebar">
              <ProductsExploreFilters
                categories={categories}
                industries={industries}
                initial={{
                  q: query.q,
                  category: query.category,
                  industry: query.industry,
                  sort,
                }}
              />
            </aside>

            <div className="catalog-main">
              <div className="catalog-toolbar">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="catalog-toolbar-icon">
                    <LayoutGrid className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="catalog-toolbar-title">
                      {total === 0
                        ? "No products found"
                        : `${total} product${total === 1 ? "" : "s"} in catalog`}
                    </p>
                    <p className="catalog-toolbar-sub">
                      Showing {products.length} on this page
                      {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}
                    </p>
                  </div>
                </div>

                {hasActiveFilters ? (
                  <div className="catalog-active-filters">
                    {query.q ? (
                      <Link href={filterHref({ q: "" })} className="catalog-active-chip">
                        Search: {query.q} ×
                      </Link>
                    ) : null}
                    {query.category ? (
                      <Link href={filterHref({ category: "" })} className="catalog-active-chip">
                        {query.category.replace(/-/g, " ")} ×
                      </Link>
                    ) : null}
                    {query.industry ? (
                      <Link href={filterHref({ industry: "" })} className="catalog-active-chip">
                        {query.industry.replace(/-/g, " ")} ×
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {products.length === 0 ? (
                <EmptyState message="No published products match your filters yet. Try adjusting search or browse all categories." />
              ) : (
                <div className="catalog-grid">
                  {products.map((product) => (
                    <div key={product.id} className="catalog-grid-item">
                      <ModernProductCard
                        product={{
                          id: product.id,
                          slug: product.slug,
                          name: product.name,
                          shortDescription: product.shortDescription,
                          pricingModel: product.pricingModel,
                          price: product.price,
                          company: {
                            name: product.company.name,
                            slug: product.company.slug,
                            logo: product.company.logo,
                            status: "APPROVED",
                          },
                          category: { name: product.category.name },
                          images: product.images,
                          reviews: product.reviews,
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="catalog-pagination">
                  {page > 1 && <PaginationLink href={pageHref(page - 1)}>Previous</PaginationLink>}
                  {pageNumbers[0] > 1 && (
                    <>
                      <PaginationLink href={pageHref(1)}>1</PaginationLink>
                      {pageNumbers[0] > 2 && <span className="px-1 text-slate-400">…</span>}
                    </>
                  )}
                  {pageNumbers.map((p) => (
                    <PaginationLink key={p} href={pageHref(p)} active={p === page}>
                      {p}
                    </PaginationLink>
                  ))}
                  {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                      {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                        <span className="px-1 text-slate-400">…</span>
                      )}
                      <PaginationLink href={pageHref(totalPages)}>{totalPages}</PaginationLink>
                    </>
                  )}
                  {page < totalPages && (
                    <PaginationLink href={pageHref(page + 1)}>Next</PaginationLink>
                  )}
                </div>
              )}

              <div className="catalog-category-rail">
                <p className="catalog-category-rail-label">Explore by category</p>
                <div className="catalog-category-rail-chips">
                  {categories.slice(0, 10).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      className={`catalog-rail-chip ${
                        query.category === cat.slug ? "catalog-rail-chip--active" : ""
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
