"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export type ChipFilterOption = {
  value: string;
  label: string;
  count?: number;
  tone?: "blue" | "green" | "amber" | "slate" | "violet";
};

const TONE_ACTIVE: Record<NonNullable<ChipFilterOption["tone"]>, string> = {
  blue: "company-segment-tab-tone-blue",
  green: "company-segment-tab-tone-green",
  amber: "company-segment-tab-tone-amber",
  slate: "company-segment-tab-tone-slate",
  violet: "company-segment-tab-tone-violet",
};

export function CompanyChipFilters({
  basePath,
  chipParam,
  chips,
  activeChip,
  searchParam = "q",
  searchValue,
  searchPlaceholder = "Search...",
  resultCount,
  resultLabel = "results",
  title = "Browse",
}: {
  basePath: string;
  chipParam: string;
  chips: ChipFilterOption[];
  activeChip?: string;
  searchParam?: string;
  searchValue?: string;
  searchPlaceholder?: string;
  resultCount?: number;
  resultLabel?: string;
  title?: string;
}) {
  const router = useRouter();
  const hasFilters = Boolean(activeChip || searchValue);

  function chipHref(value: string) {
    const params = new URLSearchParams();
    if (value) params.set(chipParam, value);
    if (searchValue) params.set(searchParam, searchValue);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get(searchParam) ?? "").trim();
    const params = new URLSearchParams();
    if (activeChip) params.set(chipParam, activeChip);
    if (q) params.set(searchParam, q);
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  const allHref = searchValue
    ? `${basePath}?${searchParam}=${encodeURIComponent(searchValue)}`
    : basePath;

  return (
    <div className="company-segment-shell">
      <div className="company-segment-header">
        <div className="flex items-center gap-2">
          <span className="company-segment-header-icon">
            <LayoutGrid className="h-4 w-4" />
          </span>
          <div>
            <p className="company-segment-header-title">{title}</p>
            {typeof resultCount === "number" && (
              <p className="company-segment-header-meta">
                {resultCount} {resultLabel}
                {hasFilters ? " · filtered" : ""}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSearch} className="company-segment-search">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            name={searchParam}
            defaultValue={searchValue ?? ""}
            placeholder={searchPlaceholder}
            className="h-10 rounded-xl border-slate-200/80 bg-white/90 pl-9 shadow-sm"
          />
        </form>
      </div>

      <div className="company-segment-track" role="tablist">
        <Link
          href={allHref}
          role="tab"
          aria-selected={!activeChip}
          className={cn(
            "company-segment-tab",
            !activeChip && "company-segment-tab-active company-segment-tab-tone-blue",
          )}
        >
          <span>All</span>
          {!activeChip && typeof resultCount === "number" && (
            <span className="company-segment-count">{resultCount}</span>
          )}
        </Link>

        {chips.map((chip) => {
          const active = activeChip === chip.value;
          return (
            <Link
              key={chip.value}
              href={chipHref(chip.value)}
              role="tab"
              aria-selected={active}
              className={cn(
                "company-segment-tab",
                active && "company-segment-tab-active",
                active && chip.tone && TONE_ACTIVE[chip.tone],
              )}
            >
              <span>{chip.label}</span>
              {chip.count != null && (
                <span className={cn("company-segment-count", active && "company-segment-count-active")}>
                  {chip.count}
                </span>
              )}
            </Link>
          );
        })}

        {hasFilters && (
          <Link href={basePath} className="company-segment-clear" title="Clear filters">
            <X className="h-3.5 w-3.5" />
            Clear
          </Link>
        )}
      </div>
    </div>
  );
}
