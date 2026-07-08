"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function RejectCompanyButton({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  function handleReject() {
    startTransition(async () => {
      const { rejectCompany } = await import("@/actions/company.actions");
      const result = await rejectCompany(companyId, note.trim() || undefined);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Company rejected. The seller has been notified.");
      setOpen(false);
      setNote("");
      router.refresh();
    });
  }

  return (
    <>
      <Button type="button" size="sm" variant="destructive" className="h-8" onClick={() => setOpen(true)}>
        Reject
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <div className="h-1 w-full rounded-full bg-gradient-brand" />
          <DialogHeader>
            <DialogTitle>Reject Company</DialogTitle>
            <DialogDescription>
              Optionally add a reason. The company owner will receive a notification email.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Reason for rejection (optional)..."
            className="border-brand-blue/15"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleReject} disabled={pending}>
              {pending ? "Rejecting..." : "Confirm Reject"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
