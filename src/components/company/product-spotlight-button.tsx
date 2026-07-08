"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, Star } from "lucide-react";
import { toggleProductFeatured } from "@/actions/product.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductSpotlightButton({
  productId,
  featured,
  canUse,
  atLimit,
  remaining,
  limit,
}: {
  productId: string;
  featured: boolean;
  canUse: boolean;
  atLimit: boolean;
  remaining: number;
  limit: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFeatured, setIsFeatured] = useState(featured);

  useEffect(() => {
    setIsFeatured(featured);
  }, [featured]);

  if (!canUse) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        asChild
        className="gap-1.5 text-slate-500"
        title="Product spotlight requires the Pro plan"
      >
        <Link href="/company/settings?tab=plan">
          <Lock className="h-3.5 w-3.5" />
          Pro spotlight
        </Link>
      </Button>
    );
  }

  const blocked = !isFeatured && atLimit;

  async function handleToggle() {
    if (blocked) {
      toast.error(
        limit > 0
          ? `All ${limit} spotlight slot${limit === 1 ? "" : "s"} are in use. Remove one or upgrade your plan.`
          : "Spotlight is not available on your current plan.",
      );
      return;
    }

    setLoading(true);
    const result = await toggleProductFeatured(productId);
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    const next = result.data?.featured ?? !isFeatured;
    setIsFeatured(next);
    toast.success(
      next
        ? `Added to spotlight${remaining > 1 ? ` · ${remaining - 1} slot${remaining - 1 === 1 ? "" : "s"} left` : ""}`
        : "Removed from spotlight",
    );
    router.refresh();
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={loading || blocked}
      onClick={handleToggle}
      title={
        blocked
          ? `Spotlight full (${limit}/${limit}). Remove one or upgrade for more slots.`
          : isFeatured
            ? "Remove from marketplace spotlight"
            : `Add to spotlight · ${remaining} of ${limit} slot${limit === 1 ? "" : "s"} free`
      }
      className={cn(
        "gap-1.5",
        isFeatured && "border-amber-300 bg-amber-50 text-amber-800",
        blocked && "opacity-60",
      )}
    >
      <Star className={cn("h-4 w-4", isFeatured && "fill-amber-400 text-amber-400")} />
      {loading ? "..." : isFeatured ? "In spotlight" : "Add spotlight"}
    </Button>
  );
}
