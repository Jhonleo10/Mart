"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SmartSearchBar } from "@/components/intelligence/smart-search-bar";
import { ModernProductCard } from "@/components/products/modern-product-card";
import type { SmartSearchResult } from "@/lib/intelligence/types";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-stat-card";
import { buildDashboardPageHref } from "@/components/dashboard/dashboard-pagination";
import { Sparkles, LayoutGrid } from "lucide-react";

const PAGE_SIZE = 24;

type DiscoverClientProps = {
  requirementChips?: string[];
  suggestedQuery?: string;
  hasRequirements?: boolean;
};

export default function UserDiscoverPage({
  requirementChips = [],
  suggestedQuery = "",
  hasRequirements = false,
}: DiscoverClientProps) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? undefined;
  const sort = searchParams.get("sort") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));

  const [results, setResults] = useState<SmartSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [requirementApplied, setRequirementApplied] = useState(false);
  const [pending, startTransition] = useTransition();

  const sortOptions = [
    { value: "", label: "Relevance" },
    { value: "popular", label: "Popular" },
    { value: "latest", label: "Newest" },
  ];

  const paginationParams = { q: q || undefined, category, sort, tab: undefined };

  useEffect(() => {
    let cancelled = false;

    async function runSearch() {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category) params.set("category", category);
      if (sort) params.set("sort", sort);
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));

      try {
        const res = await fetch(`/api/intelligence/search?${params.toString()}`, {
          credentials: "same-origin",
        });
        if (cancelled) return;

        if (!res.ok) {
          if (res.status === 429) {
            setError("Too many searches. Please wait a moment and try again.");
          } else {
            setError(
              res.status === 401
                ? "Please sign in to use Smart Search."
                : "Search failed. Please try again.",
            );
          }
          setResults([]);
          setTotal(0);
          setRequirementApplied(false);
          return;
        }

        const data = await res.json();
        setError(null);
        setResults(data.results ?? []);
        setTotal(data.total ?? 0);
        setRequirementApplied(Boolean(data.requirementApplied));
      } catch {
        if (!cancelled) {
          setError("Search failed. Please try again.");
          setResults([]);
          setTotal(0);
          setRequirementApplied(false);
        }
      }
    }

    startTransition(() => {
      void runSearch();
    });

    return () => {
      cancelled = true;
    };
  }, [q, category, sort, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="dash-page-enter space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <DashboardPageHeader
          title="Smart Search"
          description="Natural language search boosted by your requirement profile — synonyms, budget, features, integrations, and vendor data."
        />

        <Link
          href="/products"
          className="buyer-action-chip inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-white px-4 py-2 text-sm font-semibold text-brand-blue shadow-sm transition hover:border-brand-blue/40 hover:bg-brand-blue/5"
        >
          <LayoutGrid className="h-4 w-4" />
          View all products
        </Link>
      </div>

      {hasRequirements && requirementApplied ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-green/20 bg-brand-green/[0.06] px-4 py-3 text-sm">
          <p className="flex items-center gap-2 font-medium text-brand-green-dark">
            <Sparkles className="h-4 w-4" />
            Results ranked using your saved requirements
          </p>
        </div>
      ) : null}

      <div className="dash-sticky-subheader buyer-glass-panel space-y-2 rounded-2xl border border-slate-200/60 p-3 backdrop-blur-md">
        <SmartSearchBar
          initialQuery={q}
          requirementChips={requirementChips}
          suggestedQuery={suggestedQuery}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-1">
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((opt) => {
              const params = new URLSearchParams();
              if (q) params.set("q", q);
              if (category) params.set("category", category);
              if (opt.value) params.set("sort", opt.value);
              const href = params.toString() ? `/user/discover?${params}` : "/user/discover";
              const active = (sort ?? "") === opt.value;
              return (
                <Link
                  key={opt.value || "relevance"}
                  href={href}
                  className={`buyer-pill rounded-full px-3 py-1 text-xs font-medium transition ${
                    active
                      ? "bg-brand-blue text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>
          <p className="text-xs text-slate-400">
            Tip: try budget, category, or feature names — e.g. &quot;CRM under 5000 WhatsApp&quot;
          </p>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {pending && results.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="discovery-skeleton h-64 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-500">
              {total} result{total !== 1 ? "s" : ""}
              {q ? ` for "${q}"` : hasRequirements ? " matched to your profile" : ""}
              {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}
            </p>
            {!q && total > 0 ? (
              <Link href="/products" className="text-xs font-semibold text-brand-blue hover:underline">
                Browse full marketplace →
              </Link>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => (
              <div key={p.id} className="buyer-card-hover">
                <ModernProductCard
                  product={{
                    id: p.id,
                    slug: p.slug,
                    name: p.name,
                    shortDescription: p.shortDescription,
                    pricingModel: p.pricingModel,
                    price: p.price,
                    company: {
                      name: p.companyName,
                      slug: p.companySlug,
                      logo: p.companyLogo,
                      status: "APPROVED",
                    },
                    category: { name: p.categoryName },
                    images: p.imageUrl ? [{ url: p.imageUrl }] : [],
                    reviews: Array.from({ length: p.reviewCount }, () => ({ rating: p.avgRating })),
                    matchScore: p.relevanceScore,
                    featureTags: p.matchReasons.slice(0, 2),
                  }}
                />
              </div>
            ))}
          </div>

          {totalPages > 1 ? (
            <nav className="flex flex-wrap items-center justify-center gap-2 pt-2" aria-label="Search pagination">
              {page > 1 ? (
                <Link
                  href={buildDashboardPageHref("/user/discover", page - 1, paginationParams)}
                  className="buyer-pill rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Previous
                </Link>
              ) : null}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 7) {
                  const start = Math.max(1, Math.min(page - 3, totalPages - 6));
                  p = start + i;
                }
                return (
                  <Link
                    key={p}
                    href={buildDashboardPageHref("/user/discover", p, paginationParams)}
                    className={`buyer-pill min-w-[2.25rem] rounded-lg px-3 py-1.5 text-center text-sm font-medium transition ${
                      p === page
                        ? "bg-brand-blue text-white shadow-sm"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
              {page < totalPages ? (
                <Link
                  href={buildDashboardPageHref("/user/discover", page + 1, paginationParams)}
                  className="buyer-pill rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Next
                </Link>
              ) : null}
            </nav>
          ) : null}

          {results.length === 0 && !pending && (
            <div className="discovery-glass rounded-2xl border border-dashed p-12 text-center text-sm text-slate-500">
              No matches yet.{" "}
              {hasRequirements ? (
                <>Try broadening your query or update your requirements for smarter results.</>
              ) : (
                <>Try &quot;CRM under 10000&quot; or use the Requirements button to build a profile for smarter results.</>
              )}
              <div className="mt-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <LayoutGrid className="h-4 w-4" />
                  View all products
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
