"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { useFormPrefill } from "@/hooks/use-form-prefill";

export function RequestChangesButton({
  companyId,
  compact = false,
}: {
  companyId: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const { ready, bind, clearDraft, get } = useFormPrefill(`admin-request-changes-${companyId}`);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const note = get("note");
    if (!note.trim()) {
      toast.error("Please describe the required changes");
      return;
    }
    setLoading(true);
    const { requestCompanyChanges } = await import("@/actions/company.actions");
    const result = await requestCompanyChanges(companyId, note.trim());
    setLoading(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Change request sent to company");
    clearDraft();
    setOpen(false);
    router.refresh();
  }

  if (!ready) return null;

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8"
        onClick={() => setOpen(true)}
      >
        {compact ? "Changes" : "Request Changes"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <div className="h-1 w-full rounded-full bg-gradient-brand" />
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Describe what the company needs to update before approval.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input {...bind("note")} placeholder="Describe required changes..." />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
