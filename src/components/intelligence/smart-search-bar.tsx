"use client";



import { useEffect, useState, useTransition, useCallback } from "react";

import { useRouter } from "next/navigation";

import Link from "next/link";

import { Search, Sparkles, Target, TrendingUp, LayoutGrid, SlidersHorizontal, X, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { toast } from "sonner";

import { removeRequirementChipsAction, clearAllRequirementsAction } from "@/actions/intelligence.actions";

import {

  Dialog,

  DialogContent,

  DialogTitle,

} from "@/components/ui/dialog";

import dynamic from "next/dynamic";



const RequirementWizard = dynamic(

  () => import("./requirement-wizard").then((m) => m.RequirementWizard),

  {

    ssr: false,

    loading: () => (

      <div className="flex min-h-[20rem] items-center justify-center p-8">

        <div

          className="h-8 w-8 animate-spin rounded-full border-2 border-brand-blue border-t-transparent"

          aria-hidden

        />

      </div>

    ),

  },

);

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

  const [requirementsOpen, setRequirementsOpen] = useState(false);

  const [localChips, setLocalChips] = useState(requirementChips);

  const [removingChips, setRemovingChips] = useState(false);

  useEffect(() => {
    setLocalChips((prev) => {
      if (prev.length === requirementChips.length && prev.every((c, i) => c === requirementChips[i])) {
        return prev;
      }
      return requirementChips;
    });
  }, [requirementChips]);

  const handleRemoveChip = useCallback(async (chip: string) => {
    setRemovingChips(true);
    const result = await removeRequirementChipsAction([chip]);
    setRemovingChips(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setLocalChips((prev) => prev.filter((c) => c !== chip));
    router.refresh();
  }, [router]);

  const handleClearAll = useCallback(async () => {
    setRemovingChips(true);
    const result = await clearAllRequirementsAction();
    setRemovingChips(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setLocalChips([]);
    router.refresh();
  }, [router]);

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

            onClick={() => setRequirementsOpen(true)}

            className="gap-1.5 border-slate-200"

          >

            <SlidersHorizontal className="h-3.5 w-3.5" />

            Requirements

          </Button>

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

      <Dialog open={requirementsOpen} onOpenChange={setRequirementsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <DialogTitle className="sr-only">Requirement Builder</DialogTitle>
          <RequirementWizard />
        </DialogContent>
      </Dialog>

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

      {localChips.length > 0 ? (

        <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">

          {localChips.map((chip) => (

            <span

              key={chip}

              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"

            >

              {chip}

              <button

                type="button"

                onClick={() => handleRemoveChip(chip)}

                className="ml-0.5 rounded-full p-0.5 text-slate-400 hover:bg-red-100 hover:text-red-600 transition-colors"

                aria-label={`Remove ${chip}`}

              >

                <X className="h-2.5 w-2.5" />

              </button>

            </span>

          ))}

          <button

            type="button"

            onClick={handleClearAll}

            className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium text-red-600 hover:bg-red-50 transition-colors"

          >

            <RotateCcw className="h-2.5 w-2.5" />

            Clear all

          </button>

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
