"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StatusToggle } from "@/components/admin/status-toggle";
import { toggleCompanyActiveAction } from "@/actions/company.actions";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

export function CompanyActiveToggle({
  companyId,
  active,
  companyName,
}: {
  companyId: string;
  active: boolean;
  companyName?: string;
}) {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [pending, startTransition] = useTransition();

  async function handleToggle() {
    const ok = await confirm({
      title: active
        ? companyName
          ? `Suspend ${companyName}?`
          : "Suspend this company?"
        : companyName
          ? `Activate ${companyName}?`
          : "Activate this company?",
      description: active
        ? "Their products will be hidden from the marketplace until reactivated."
        : "Their approved products can appear on the marketplace again.",
      confirmLabel: active ? "Suspend" : "Activate",
      variant: active ? "destructive" : "default",
    });
    if (!ok) return;

    startTransition(async () => {
      await toggleCompanyActiveAction(companyId);
      toast.success(active ? "Company suspended" : "Company activated");
      router.refresh();
    });
  }

  return (
    <>
      {confirmDialog}
      <div className="flex items-center gap-2">
        <StatusToggle
          checked={active}
          disabled={pending}
          label={active ? "Active" : "Inactive"}
          onChange={handleToggle}
        />
        <span className="text-xs font-medium text-slate-500">{active ? "Active" : "Inactive"}</span>
      </div>
    </>
  );
}
