import Link from "next/link";
import { Filter, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const selectClass =
  "mt-1.5 flex h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 text-sm text-slate-800 shadow-sm transition focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/15";

export function ProductsExploreFilters({
  categories,
  industries,
  initial,
}: {
  categories: { id: string; name: string; slug: string }[];
  industries: { id: string; name: string; slug: string }[];
  initial: {
    q?: string;
    category?: string;
    industry?: string;
    sort?: string;
  };
}) {
  return (
    <div className="catalog-filter-shell">
      <div className="catalog-filter-head">
        <div className="catalog-filter-icon">
          <SlidersHorizontal className="h-4 w-4" />
        </div>
        <div>
          <p className="catalog-filter-title">Refine results</p>
          <p className="catalog-filter-sub">Filter the marketplace catalog</p>
        </div>
      </div>

      <form method="GET" action="/products" className="mt-5 space-y-4">
        <div>
          <label htmlFor="q" className="catalog-filter-label">
            <Search className="h-3.5 w-3.5" />
            Search
          </label>
          <Input
            id="q"
            name="q"
            defaultValue={initial.q ?? ""}
            placeholder="CRM, billing, HRMS..."
            className="mt-1.5 border-slate-200/90 bg-slate-50/80 focus:bg-white"
          />
        </div>

        <div>
          <label htmlFor="category" className="catalog-filter-label">
            <Filter className="h-3.5 w-3.5" />
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={initial.category ?? ""}
            className={selectClass}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="industry" className="catalog-filter-label">
            Industry
          </label>
          <select id="industry" name="industry" defaultValue={initial.industry ?? ""} className={selectClass}>
            <option value="">All industries</option>
            {industries.map((i) => (
              <option key={i.id} value={i.slug}>
                {i.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sort" className="catalog-filter-label">
            Sort by
          </label>
          <select id="sort" name="sort" defaultValue={initial.sort ?? "popular"} className={selectClass}>
            <option value="popular">Most popular</option>
            <option value="latest">Latest</option>
            <option value="featured">Featured first</option>
          </select>
        </div>

        <div className="flex gap-2 pt-1">
          <Button type="submit" className="flex-1 bg-gradient-brand">
            Apply filters
          </Button>
          <Link href="/products">
            <Button type="button" variant="outline" className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
