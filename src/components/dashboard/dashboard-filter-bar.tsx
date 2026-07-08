"use client";

import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { FilterPanel, SelectField } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type DashboardFilterField =
  | {
    name: string;
    type: "search";
    label: string;
    placeholder?: string;
  }
  | {
    name: string;
    type: "select";
    label: string;
    options: { value: string; label: string }[];
  }
  | {
    name: string;
    type: "date";
    label: string;
  };

interface DashboardFilterBarProps {
  basePath: string;
  values: Record<string, string | undefined>;
  resultCount?: number;
  resultLabel?: string;
  fields: DashboardFilterField[];
  className?: string;
  /** Compact single-row layout for admin tables */
  compact?: boolean;
}

function hasActiveFilters(values: Record<string, string | undefined>) {
  return Object.values(values).some((v) => v && v.length > 0);
}

export function DashboardFilterBar({
  basePath,
  values,
  resultCount,
  resultLabel = "results",
  fields,
  className,
  compact = false,
}: DashboardFilterBarProps) {
  const active = hasActiveFilters(values);

  return (
    <div
      className={cn(
        "dash-filter-bar rounded-2xl border border-slate-200/50 bg-white/60 shadow-sm backdrop-blur-md",
        compact ? "p-3" : "p-4",
        className,
      )}
    >
      {!compact && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <span className="font-heading text-sm font-semibold text-slate-800">Advanced Filters</span>
          </div>
          {typeof resultCount === "number" ? (
            <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
              {resultCount} {resultLabel}
            </div>
          ) : null}
        </div>
      )}

      <form
        action={basePath}
        method="get"
        className={cn(
          "flex flex-col gap-3",
          compact
            ? "lg:flex-row lg:flex-wrap lg:items-end"
            : "gap-5 sm:grid sm:grid-cols-12",
        )}
      >
        {compact && typeof resultCount === "number" ? (
          <p className="w-full text-xs font-medium text-slate-500 lg:mr-auto lg:w-auto lg:pb-2.5">
            {resultCount} {resultLabel}
          </p>
        ) : null}

        {fields.map((field) => {
          if (field.type === "search") {
            return (
              <div
                key={field.name}
                className={cn(compact ? "min-w-0 flex-1 lg:min-w-[12rem]" : "col-span-12 lg:col-span-4")}
              >
                {!compact && (
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {field.label}
                  </label>
                )}
                <div className="group relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-hover:text-brand-blue" />
                  <Input
                    name={field.name}
                    defaultValue={values[field.name] ?? ""}
                    placeholder={field.placeholder ?? field.label}
                    className={cn(
                      "rounded-xl border-slate-200/80 bg-slate-50 pl-9 transition-all hover:bg-white focus:bg-white focus:ring-2 focus:ring-brand-blue/20",
                      compact ? "h-10" : "h-11",
                    )}
                  />
                </div>
              </div>
            );
          }

          if (field.type === "date") {
            return (
              <div
                key={field.name}
                className={cn(compact ? "w-full lg:w-auto lg:min-w-[9.5rem]" : "col-span-12 sm:col-span-6 lg:col-span-2")}
              >
                {!compact && (
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {field.label}
                  </label>
                )}
                <Input
                  type="date"
                  name={field.name}
                  defaultValue={values[field.name] ?? ""}
                  className={cn(
                    "rounded-xl border-slate-200/80 bg-slate-50",
                    compact ? "h-10" : "h-11",
                  )}
                />
              </div>
            );
          }

          return (
            <div
              key={field.name}
              className={cn(compact ? "w-full lg:w-auto lg:min-w-[9.5rem]" : "col-span-12 sm:col-span-6 lg:col-span-3")}
            >
              {!compact && (
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {field.label}
                </label>
              )}
              <SelectField name={field.name} label="" defaultValue={values[field.name]}>
                <option value="">{compact ? field.label : "All options"}</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </SelectField>
            </div>
          );
        })}

        <div
          className={cn(
            "flex items-center gap-2",
            compact ? "w-full lg:w-auto" : "col-span-12 justify-end gap-3 lg:col-span-2",
          )}
        >
          {active ? (
            <Link href={basePath} className="flex-1 sm:flex-none">
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 sm:w-auto",
                  compact ? "h-10" : "h-11",
                )}
              >
                Clear
              </Button>
            </Link>
          ) : null}
          <Button
            type="submit"
            className={cn(
              "w-full rounded-xl bg-brand-blue text-white shadow-sm hover:bg-brand-blue/90 sm:w-auto",
              compact ? "h-10 flex-1 sm:flex-none" : "h-11",
            )}
          >
            {compact ? "Filter" : "Apply Filters"}
          </Button>
        </div>
      </form>
    </div>
  );
}
