"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateBookingStatus } from "@/actions/booking.actions";
import { ScheduleMeetingDialog } from "@/components/meeting/schedule-meeting-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BookingStatus } from "@prisma/client";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { CheckCircle2 } from "lucide-react";

interface LeadStatusButtonsProps {
  bookingId: string;
  bookingStatus: BookingStatus;
  googleConnected: boolean;
  hasScheduledMeeting?: boolean;
  preferredDate?: string;
  preferredTime?: string | null;
}

/** Leads that can still be scheduled (aligned with meetingService allow-list). */
function canScheduleMeeting(status: BookingStatus, hasScheduledMeeting?: boolean) {
  return !hasScheduledMeeting && ["NEW", "CONTACTED", "QUALIFIED"].includes(status);
}

export function LeadStatusButtons({
  bookingId,
  bookingStatus,
  googleConnected,
  hasScheduledMeeting,
  preferredDate,
  preferredTime,
}: LeadStatusButtonsProps) {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [loading, setLoading] = useState<BookingStatus | null>(null);
  const [showMeetingLink, setShowMeetingLink] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");

  async function handleStatus(status: BookingStatus, link?: string) {
    if (status === "CLOSED") {
      const ok = await confirm({
        title: "Close this lead?",
        description:
          "The demo request will be marked closed. You can still view it in your leads history.",
        confirmLabel: "Close lead",
        variant: "destructive",
      });
      if (!ok) return;
    }

    if (status === "QUALIFIED") {
      const ok = await confirm({
        title: "Mark lead as qualified?",
        description: "This indicates the buyer is a good fit for a demo or follow-up.",
        confirmLabel: "Mark qualified",
        variant: "default",
      });
      if (!ok) return;
    }

    if (status === "CONTACTED") {
      const ok = await confirm({
        title: "Mark as contacted?",
        description: link
          ? "The buyer will be notified with your meeting link."
          : "The buyer will be notified that you have reached out.",
        confirmLabel: "Confirm contacted",
        variant: "default",
      });
      if (!ok) return;
    }

    setLoading(status);
    try {
      const result = await updateBookingStatus(bookingId, status, link);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Lead status updated");
      setShowMeetingLink(false);
      setMeetingLink("");
      router.refresh();
    } catch (error) {
      console.error("[lead-status]", error);
      toast.error("Could not update lead status. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  if (showMeetingLink) {
    return (
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <Label htmlFor={`meeting-link-${bookingId}`}>Meeting link (optional)</Label>
        <Input
          id={`meeting-link-${bookingId}`}
          type="url"
          placeholder="https://meet.google.com/..."
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
          className="mt-1.5"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={loading === "CONTACTED"}
            onClick={() => handleStatus("CONTACTED", meetingLink || undefined)}
          >
            {loading === "CONTACTED" ? "Saving..." : "Confirm contacted"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowMeetingLink(false);
              setMeetingLink("");
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  const showSchedule = canScheduleMeeting(bookingStatus, hasScheduledMeeting);
  const isClosed = ["CLOSED", "CONVERTED"].includes(bookingStatus);

  if (hasScheduledMeeting) {
    return (
      <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-brand-green/20 bg-brand-green/5 px-3 py-2 text-xs font-semibold text-brand-green">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Meeting scheduled — manage it from Meetings
        </div>
        <div>
          <Button size="sm" variant="outline" asChild>
            <a href="/company/meetings">Open Meetings</a>
          </Button>
        </div>
      </div>
    );
  }

  if (isClosed) return null;

  return (
    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
      {confirmDialog}
      {showSchedule ? (
        <ScheduleMeetingDialog
          bookingId={bookingId}
          googleConnected={googleConnected}
          defaultDate={preferredDate}
          defaultTime={preferredTime ?? undefined}
        />
      ) : null}

      <div className="flex flex-wrap gap-2">
        {bookingStatus !== "CONTACTED" ? (
          <Button
            size="sm"
            variant="outline"
            disabled={!!loading}
            onClick={() => setShowMeetingLink(true)}
          >
            Mark contacted (manual link)
          </Button>
        ) : null}
        {bookingStatus !== "QUALIFIED" ? (
          <Button
            size="sm"
            variant="outline"
            disabled={!!loading}
            onClick={() => handleStatus("QUALIFIED")}
          >
            {loading === "QUALIFIED" ? "Saving..." : "Mark qualified"}
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="ghost"
          className="text-slate-500"
          disabled={!!loading}
          onClick={() => handleStatus("CLOSED")}
        >
          {loading === "CLOSED" ? "Saving..." : "Close lead"}
        </Button>
      </div>
    </div>
  );
}
