"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { applyAiCopyToLanding } from "@/actions/company-landing.actions";
import { Button } from "@/components/ui/button";

export function AiApplyToLandingButton({
  headline,
  tagline,
}: {
  headline: string;
  tagline?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleApply() {
    setLoading(true);
    const result = await applyAiCopyToLanding({ headline, tagline });
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success("Applied — review your company profile in Settings");
    router.push("/company/settings?tab=profile");
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleApply} disabled={loading}>
      {loading ? "Applying..." : "Apply to company page"}
    </Button>
  );
}
