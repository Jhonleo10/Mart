"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  cancelMeetingAction,
  completeMeetingAction,
  rescheduleMeetingAction,
} from "@/actions/meeting.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MEETING_DURATIONS, MEETING_TIMEZONES } from "@/lib/meetings/timezones";
import { minBookableDate } from "@/lib/date-utils";
import { canCompleteMeeting } from "@/lib/meetings/meeting-window";
import { getValidatedForm } from "@/lib/validations/form-submit";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import type { MeetingStatus } from "@prisma/client";

interface MeetingActionsProps {
  meetingId: string;
  status: MeetingStatus;
  role: "COMPANY" | "USER";
  scheduledAt: string;
  timezone: string;
  durationMinutes: number;
}

export function MeetingActions({
  meetingId,
  status,
  role,
  scheduledAt,
  timezone,
  durationMinutes,
}: MeetingActionsProps) {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [mode, setMode] = useState<"none" | "reschedule" | "cancel">("none");
  const [loading, setLoading] = useState(false);
  const cancelReasonRef = useRef<HTMLInputElement>(null);

  const scheduledDate = new Date(scheduledAt);
  const completable = canCompleteMeeting(scheduledDate, durationMinutes);

  const date = scheduledAt.slice(0, 10);
  const time = scheduledAt.slice(11, 16);

  async function handleCancel(reason: string) {
    const ok = await confirm({
      title: role === "USER" ? "Request meeting cancellation?" : "Cancel this meeting?",
      description:
        role === "USER"
          ? "The vendor will be notified of your cancellation request."
          : "Attendees will be notified. This cannot be undone.",
      confirmLabel: "Cancel meeting",
      variant: "destructive",
    });
    if (!ok) return;

    setLoading(true);
    try {
      const result = await cancelMeetingAction(meetingId, reason);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Meeting cancelled");
      setMode("none");
      router.refresh();
    } catch (error) {
      console.error("[cancel-meeting]", error);
      toast.error("Could not cancel the meeting. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    if (!completable) {
      toast.error("Meetings can only be completed during the scheduled time window");
      return;
    }

    const ok = await confirm({
      title: "Mark meeting as complete?",
      description: "The lead will be marked converted and feedback may be requested from the buyer.",
      confirmLabel: "Complete meeting",
      variant: "default",
    });
    if (!ok) return;

    setLoading(true);
    try {
      const result = await completeMeetingAction(meetingId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Meeting marked complete");
      router.refresh();
    } catch (error) {
      console.error("[complete-meeting]", error);
      toast.error("Could not complete the meeting. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReschedule(e: React.FormEvent<HTMLFormElement>) {
    const form = getValidatedForm(e);
    if (!form) return;

    const ok = await confirm({
      title: "Reschedule meeting?",
      description: "Attendees will receive updated calendar details.",
      confirmLabel: "Reschedule",
      variant: "default",
    });
    if (!ok) return;

    setLoading(true);
    try {
      const formData = new FormData(form);
      const result = await rescheduleMeetingAction(meetingId, formData);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Meeting rescheduled");
      setMode("none");
      router.refresh();
    } catch (error) {
      console.error("[reschedule-meeting]", error);
      toast.error("Could not reschedule the meeting. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (status !== "SCHEDULED") return null;

  return (
    <>
      {confirmDialog}
      <div className="flex flex-wrap gap-2">
        {role === "COMPANY" ? (
          <>
            <Button size="sm" variant="outline" onClick={() => setMode("reschedule")}>
              Reschedule
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleComplete}
              disabled={loading || !completable}
              title={
                completable
                  ? "Mark this meeting as complete"
                  : "Available only during the scheduled meeting time"
              }
            >
              Complete
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setMode("cancel")}>
            Request cancel
          </Button>
        )}
        {role === "COMPANY" ? (
          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setMode("cancel")}>
            Cancel
          </Button>
        ) : null}

        {mode === "cancel" ? (
          <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3">
            <Label>Reason (optional)</Label>
            <Input ref={cancelReasonRef} id={`cancel-${meetingId}`} className="mt-1" />
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                disabled={loading}
                onClick={() => {
                  void handleCancel(cancelReasonRef.current?.value ?? "");
                }}
              >
                Confirm cancel
              </Button>
              <Button size="sm" variant="outline" onClick={() => setMode("none")}>
                Back
              </Button>
            </div>
          </div>
        ) : null}

        {mode === "reschedule" && role === "COMPANY" ? (
          <form onSubmit={handleReschedule} className="w-full grid gap-2 rounded-xl border p-3 sm:grid-cols-2">
            <Input name="meetingDate" type="date" min={minBookableDate()} defaultValue={date} required />
            <Input name="meetingTime" type="time" defaultValue={time} required />
            <select name="durationMinutes" defaultValue={String(durationMinutes)} className="h-10 rounded-md border px-2 text-sm">
              {MEETING_DURATIONS.map((d) => (
                <option key={d} value={d}>{d} min</option>
              ))}
            </select>
            <select name="timezone" defaultValue={timezone} className="h-10 rounded-md border px-2 text-sm">
              {MEETING_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
            <div className="flex gap-2 sm:col-span-2">
              <Button size="sm" type="submit" disabled={loading}>Save</Button>
              <Button size="sm" type="button" variant="outline" onClick={() => setMode("none")}>Cancel</Button>
            </div>
          </form>
        ) : null}
      </div>
    </>
  );
}
