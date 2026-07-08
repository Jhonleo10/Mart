"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Sparkles, Target, TrendingUp, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const POPULAR = [
  "CRM under 5000",
  "HRMS with payroll",
  "ERP for manufacturing",
  "WhatsApp marketing",
  "Analytics dashboard",
  "Project management",
];
const TRENDING = ["CRM", "Analytics", "Automation", "Security", "Billing", "Support"];

export function SmartSearchBar({
  className,
  large,
  initialQuery = "",
  requirementChips = [],
  suggestedQuery = "",
}: {
  className?: string;
  large?: boolean;
  initialQuery?: string;
  requirementChips?: string[];
  suggestedQuery?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  function search(term?: string) {
    const q = (term ?? query).trim();
    startTransition(() => {
      if (!q) {
        router.push("/user/discover");
        return;
      }
      router.push(`/user/discover?q=${encodeURIComponent(q)}`);
    });
  }

  function browseAll() {
    startTransition(() => {
      router.push("/products");
    });
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "discovery-search buyer-glass-panel flex flex-col gap-2 rounded-2xl border border-slate-200/80 p-2 shadow-sm transition-shadow focus-within:border-brand-blue/30 focus-within:shadow-md focus-within:shadow-brand-blue/10 sm:flex-row sm:items-center",
          large && "p-2.5",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Search className={cn("shrink-0 text-slate-400", large ? "ml-2 h-5 w-5" : "ml-1 h-4 w-4")} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder='Try "CRM under 5000 with WhatsApp integration"'
            aria-label="Smart search"
            className={cn(
              "min-w-0 flex-1 bg-transparent text-slate-800 outline-none placeholder:text-slate-400",
              large ? "text-base" : "text-sm",
            )}
          />
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            size={large ? "default" : "sm"}
            variant="outline"
            onClick={browseAll}
            className="gap-1.5 border-slate-200"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            All products
          </Button>
          <Button
            type="button"
            size={large ? "default" : "sm"}
            onClick={() => search()}
            disabled={pending}
            className="gap-1.5 bg-gradient-brand"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Search
          </Button>
        </div>
      </div>

      {suggestedQuery ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-brand-green-dark">
            <Target className="h-3 w-3" />
            From your profile
          </span>
          <button
            type="button"
            onClick={() => search(suggestedQuery)}
            className="buyer-pill rounded-full border border-brand-green/25 bg-brand-green/10 px-2.5 py-0.5 text-xs font-medium text-brand-green-dark transition-colors hover:bg-brand-green/15"
          >
            {suggestedQuery}
          </button>
        </div>
      ) : null}

      {requirementChips.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {requirementChips.slice(0, 8).map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => search(chip)}
              className="buyer-pill rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 transition hover:bg-brand-blue/10 hover:text-brand-blue"
            >
              {chip}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <TrendingUp className="h-3 w-3" />
          Popular
        </span>
        {POPULAR.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => search(term)}
            className="buyer-pill rounded-full border border-slate-200/80 bg-white/80 px-2.5 py-0.5 text-xs text-slate-600 transition-colors hover:border-brand-blue/30 hover:text-brand-blue"
          >
            {term}
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        {TRENDING.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => search(cat)}
            className="text-xs font-medium text-brand-blue/80 transition hover:text-brand-blue hover:underline"
          >
            #{cat}
          </button>
        ))}
        <Link
          href="/products"
          className="ml-auto text-xs font-semibold text-slate-500 transition hover:text-brand-blue"
        >
          Full catalog →
        </Link>
      </div>
    </div>
  );
}
