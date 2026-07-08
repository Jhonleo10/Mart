"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { applyAiMarketingToProduct } from "@/actions/product-landing.actions";
import { Button } from "@/components/ui/button";

export function AiApplyToProductButton({
  productId,
  headline,
  tagline,
  cta,
}: {
  productId: string;
  headline: string;
  tagline?: string;
  cta?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleApply() {
    setLoading(true);
    const result = await applyAiMarketingToProduct({ productId, headline, tagline, cta });
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success("AI copy applied to product listing — review and publish when ready");
    router.push(`/company/products/${productId}/edit`);
    router.refresh();
  }

  return (
    <Button type="button" size="sm" onClick={handleApply} disabled={loading}>
      {loading ? "Applying..." : "Apply to product"}
    </Button>
  );
}
