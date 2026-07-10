"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { MeetingProvider } from "@prisma/client";
import { scheduleMeetingAction } from "@/actions/meeting.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseDateOnly } from "@/lib/date-utils";
import { resolveMeetingDefaultsFromBooking } from "@/lib/meetings/booking-schedule-defaults";
import { MEETING_DURATIONS, MEETING_TIMEZONES } from "@/lib/meetings/timezones";
import { MEETING_PROVIDER_OPTIONS } from "@/lib/meetings/meeting-link";
import { providerRequiresManualUrl } from "@/lib/meetings/meeting-url-validation";
import { getValidatedForm } from "@/lib/validations/form-submit";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { Calendar, Video } from "lucide-react";

interface ScheduleMeetingDialogProps {
  bookingId: string;
  googleConnected: boolean;
  defaultDate?: string;
  defaultTime?: string;
}

const PROVIDER_URL_PLACEHOLDERS: Record<MeetingProvider, string> = {
  GOOGLE: "",
  TEAMS: "https://teams.microsoft.com/l/meetup-join/...",
  ZOOM: "https://zoom.us/j/...",
  CUSTOM: "https://your-meeting-platform.com/...",
};

export function ScheduleMeetingDialog({
  bookingId,
  googleConnected,
  defaultDate,
  defaultTime,
}: ScheduleMeetingDialogProps) {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<MeetingProvider>(
    googleConnected ? "GOOGLE" : "CUSTOM",
  );
  const [meetingUrl, setMeetingUrl] = useState("");
  const submittingRef = useRef(false);
  const today = new Date().toISOString().slice(0, 10);

  const buyerDefaults = useMemo(
    () =>
      resolveMeetingDefaultsFromBooking({
        preferredDate: defaultDate ? parseDateOnly(defaultDate) : null,
        preferredTime: defaultTime,
      }),
    [defaultDate, defaultTime],
  );

  const [meetingDate, setMeetingDate] = useState(buyerDefaults.meetingDate);
  const [meetingTime, setMeetingTime] = useState(buyerDefaults.meetingTime);

  useEffect(() => {
    if (!open) return;
    setMeetingDate(buyerDefaults.meetingDate);
    setMeetingTime(buyerDefaults.meetingTime);
  }, [open, buyerDefaults.meetingDate, buyerDefaults.meetingTime]);

  const syncedWithBuyer = Boolean(defaultDate || defaultTime);

  const needsManualUrl = providerRequiresManualUrl(provider);
  const canOpen = provider === "GOOGLE" ? googleConnected : true;

  const providerHint = useMemo(() => {
    if (provider === "GOOGLE") {
      return googleConnected
        ? "A Google Calendar event and Meet link will be created automatically on the vendor's connected account."
        : "Connect Google Calendar in Company → Settings (or Meetings) to use automatic Google Meet scheduling.";
    }
    if (provider === "TEAMS") return "Paste the Microsoft Teams meeting link from your Teams calendar.";
    if (provider === "ZOOM") return "Paste the Zoom meeting join URL from your Zoom account.";
    return "Paste any secure HTTPS meeting link (Webex, Jitsi, etc.).";
  }, [provider, googleConnected]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = getValidatedForm(e);
    if (!form) return;

    if (submittingRef.current || loading) return;

    if (provider === "GOOGLE" && !googleConnected) {
      toast.error("Connect Google Calendar first, or choose Teams / Zoom / Custom URL.");
      return;
    }

    const ok = await confirm({
      title: "Schedule this meeting?",
      description: needsManualUrl
        ? "The buyer will be notified with your meeting link."
        : "A calendar event and meeting link will be created and the buyer will be notified.",
      confirmLabel: "Schedule meeting",
      variant: "default",
    });
    if (!ok) return;

    submittingRef.current = true;
    setLoading(true);
    try {
      const formData = new FormData(form);
      formData.set("bookingId", bookingId);
      formData.set("provider", provider);
      if (needsManualUrl) {
        formData.set("meetingUrl", meetingUrl);
      }
      const result = await scheduleMeetingAction(formData);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Meeting scheduled successfully");
      setOpen(false);
      setMeetingUrl("");
      router.refresh();
    } catch (error) {
      console.error("[schedule-meeting]", error);
      toast.error("Could not schedule the meeting. Please try again.");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button
        size="sm"
        className="bg-gradient-to-r from-brand-blue to-brand-blue-dark"
        onClick={() => setOpen(true)}
      >
        <Video className="mr-1.5 h-3.5 w-3.5" />
        Schedule Meeting
      </Button>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-brand-blue/20 bg-gradient-to-br from-white to-brand-blue/5 p-4 shadow-sm">
      {confirmDialog}
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-blue">
        <Calendar className="h-4 w-4" />
        Schedule demo meeting
      </div>
      {syncedWithBuyer ? (
        <p className="mb-3 rounded-lg border border-brand-blue/15 bg-brand-blue/5 px-3 py-2 text-xs text-slate-600">
          Date and time are pre-filled from the buyer&apos;s demo request. You can edit them before
          scheduling.
        </p>
      ) : null}
      {!googleConnected ? (
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Google Calendar is not connected. Use Teams, Zoom, or a custom URL — or{" "}
          <a href="/company/settings" className="font-semibold underline">
            connect Google
          </a>{" "}
          for automatic Meet links.
        </p>
      ) : null}
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor={`provider-${bookingId}`}>Meeting provider</Label>
          <select
            id={`provider-${bookingId}`}
            name="provider"
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value as MeetingProvider);
              setMeetingUrl("");
            }}
            className="mt-1 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            {MEETING_PROVIDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.value === "GOOGLE" && !googleConnected}>
                {opt.label}
                {opt.value === "GOOGLE" && !googleConnected ? " (connect calendar first)" : ""}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{providerHint}</p>
        </div>

        {needsManualUrl ? (
          <div className="sm:col-span-2">
            <Label htmlFor={`meeting-url-${bookingId}`}>
              {provider === "TEAMS"
                ? "Paste Teams URL"
                : provider === "ZOOM"
                  ? "Paste Zoom URL"
                  : "Paste Meeting URL"}
            </Label>
            <Input
              id={`meeting-url-${bookingId}`}
              name="meetingUrl"
              type="url"
              inputMode="url"
              autoComplete="off"
              placeholder={PROVIDER_URL_PLACEHOLDERS[provider]}
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              required
              className="mt-1"
            />
          </div>
        ) : null}

        <div>
          <Label htmlFor={`date-${bookingId}`}>Meeting date</Label>
          <Input
            id={`date-${bookingId}`}
            name="meetingDate"
            type="date"
            min={today}
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`time-${bookingId}`}>Meeting time</Label>
          <Input
            id={`time-${bookingId}`}
            name="meetingTime"
            type="time"
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`duration-${bookingId}`}>Duration</Label>
          <select
            id={`duration-${bookingId}`}
            name="durationMinutes"
            defaultValue="30"
            className="mt-1 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            {MEETING_DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d} minutes
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor={`tz-${bookingId}`}>Time zone</Label>
          <select
            id={`tz-${bookingId}`}
            name="timezone"
            defaultValue="Asia/Kolkata"
            className="mt-1 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            {MEETING_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`notes-${bookingId}`}>Meeting notes (optional)</Label>
          <Input
            id={`notes-${bookingId}`}
            name="notes"
            placeholder="Agenda, preparation, etc."
            className="mt-1"
          />
        </div>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" size="sm" disabled={loading || !canOpen}>
            {loading ? "Scheduling..." : "Schedule Meeting"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={() => {
              setOpen(false);
              setMeetingUrl("");
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
