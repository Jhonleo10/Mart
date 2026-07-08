import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { CompanyAiSuggestion } from "@/lib/company-ai-suggestions";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<CompanyAiSuggestion["priority"], string> = {
  high: "border-amber-200 bg-amber-50/80",
  medium: "border-brand-blue/20 bg-brand-blue/[0.04]",
  low: "border-slate-200 bg-slate-50/80",
};

export function CompanyAiSuggestionsPanel({
  suggestions,
  title = "AI action items",
  compact = false,
}: {
  suggestions: CompanyAiSuggestion[];
  title?: string;
  compact?: boolean;
}) {
  if (suggestions.length === 0) return null;

  return (
    <div className={cn("company-ai-suggestions dash-panel", compact ? "p-4" : "p-5 sm:p-6")}>
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-green text-white shadow-sm">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-heading text-base font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">Smart tips based on your leads, products, and availability</p>
        </div>
      </div>

      <ul className={cn("mt-4 space-y-2", compact && "mt-3")}>
        {suggestions.map((item) => (
          <li
            key={item.id}
            className={cn(
              "flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between",
              PRIORITY_STYLES[item.priority],
            )}
          >
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="mt-0.5 text-sm text-slate-600">{item.detail}</p>
            </div>
            <Link
              href={item.href}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-blue hover:text-brand-blue-dark"
            >
              {item.actionLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
