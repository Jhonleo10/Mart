"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cancelUserBooking } from "@/actions/booking.actions";
import { ConfirmDialogUI, type ConfirmOptions } from "@/components/ui/confirm-dialog";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [pending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);

  const confirmOptions: ConfirmOptions = {
    title: "Cancel booking?",
    description: "This demo request will be closed and the vendor will be notified.",
    confirmLabel: "Cancel booking",
    cancelLabel: "Keep booking",
    variant: "destructive",
  };

  function handleConfirm() {
    setDialogOpen(false);
    startTransition(async () => {
      const result = await cancelUserBooking(bookingId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Booking cancelled");
    });
  }

  return (
    <>
      <ConfirmDialogUI
        open={dialogOpen}
        options={confirmOptions}
        onConfirm={handleConfirm}
        onCancel={() => setDialogOpen(false)}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => setDialogOpen(true)}
        className="text-red-600 hover:text-red-700"
      >
        {pending ? "Cancelling..." : "Cancel"}
      </Button>
    </>
  );
}
