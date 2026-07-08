"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { approveCompany } from "@/actions/company.actions";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

export function ApproveCompanyButton({
  companyId,
  companyName,
}: {
  companyId: string;
  companyName?: string;
}) {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [pending, startTransition] = useTransition();

  async function handleApprove() {
    const ok = await confirm({
      title: companyName ? `Approve ${companyName}?` : "Approve this company?",
      description: "The vendor will be notified by email and can publish products on the marketplace.",
      confirmLabel: "Approve company",
      variant: "default",
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await approveCompany(companyId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Company approved. The seller has been notified by email.");
      router.refresh();
    });
  }

  return (
    <>
      {confirmDialog}
      <Button type="button" size="sm" variant="green" className="h-8" disabled={pending} onClick={handleApprove}>
        {pending ? "Approving..." : "Approve"}
      </Button>
    </>
  );
}
