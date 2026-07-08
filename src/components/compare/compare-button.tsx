"use client";

import { GitCompare } from "lucide-react";
import { toast } from "sonner";
import { useComparisonOptional } from "./comparison-tray-context";
import { cn } from "@/lib/utils";

export function CompareButton({
  product,
  className,
  compact,
}: {
  product: { id: string; name: string; slug: string };
  className?: string;
  compact?: boolean;
}) {
  const comparison = useComparisonOptional();

  if (!comparison) return null;

  const isAdded = comparison.items.some((p) => p.id === product.id);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!comparison) return;
    if (isAdded) {
      comparison.remove(product.id);
      toast.message("Removed from compare");
      return;
    }
    comparison.add(product);
    toast.success(
      comparison.items.length >= 1
        ? "Added — select one more product to compare"
        : "Added to compare tray",
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border transition-colors",
        compact ? "h-8 w-8" : "gap-1 px-2 py-1 text-[11px] font-semibold",
        isAdded
          ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
          : "border-slate-200 bg-white/90 text-slate-600 hover:border-brand-blue/30 hover:text-brand-blue",
        className,
      )}
    >
      <GitCompare className={cn("h-3 w-3", compact && "h-3.5 w-3.5")} />
      {!compact && (isAdded ? "In compare" : "Compare")}
    </button>
  );
}
