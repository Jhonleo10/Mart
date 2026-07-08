"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormPrefill } from "@/hooks/use-form-prefill";

const selectClass =
  "mt-1.5 flex h-10 w-full rounded-xl border border-white/60 bg-white/70 px-3 text-sm text-slate-800 shadow-sm backdrop-blur-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20";

export function ProductFilterForm({
  categories,
  initial,
}: {
  categories: { id: string; name: string; slug: string }[];
  initial: { q?: string; category?: string; sort?: string };
}) {
  const { ready, bind } = useFormPrefill("product-filters", {
    q: initial.q,
    category: initial.category,
    sort: initial.sort ?? "latest",
  });

  if (!ready) return null;

  return (
    <form className="space-y-4">
      <div>
        <label htmlFor="q" className="text-sm font-medium text-slate-700">
          Search
        </label>
        <Input {...bind("q")} placeholder="Search products..." className="mt-1.5" />
      </div>
      <div>
        <label htmlFor="category" className="text-sm font-medium text-slate-700">
          Category
        </label>
        <select {...bind("category")} className={selectClass}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="sort" className="text-sm font-medium text-slate-700">
          Sort By
        </label>
        <select {...bind("sort")} className={selectClass}>
          <option value="latest">Latest</option>
          <option value="popular">Popular</option>
        </select>
      </div>
      <Button type="submit" className="w-full">
        Apply Filters
      </Button>
    </form>
  );
}
