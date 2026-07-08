import type { MeetingProvider } from "@prisma/client";

/** Canonical join URL — prefers meetingLink, falls back to legacy googleMeetLink. */
export function resolveMeetingLink(meeting: {
  meetingLink?: string | null;
  googleMeetLink?: string | null;
}): string | null {
  return meeting.meetingLink ?? meeting.googleMeetLink ?? null;
}

/** Infer provider for legacy rows that only have googleMeetLink. */
export function resolveMeetingProvider(meeting: {
  meetingProvider?: MeetingProvider | null;
  meetingLink?: string | null;
  googleMeetLink?: string | null;
}): MeetingProvider | null {
  if (meeting.meetingProvider) return meeting.meetingProvider;
  if (meeting.meetingLink || meeting.googleMeetLink) return "GOOGLE";
  return null;
}

export const MEETING_PROVIDER_LABELS: Record<MeetingProvider, string> = {
  GOOGLE: "Google Meet",
  TEAMS: "Microsoft Teams",
  ZOOM: "Zoom",
  CUSTOM: "Custom URL",
};

export const MEETING_PROVIDER_OPTIONS: { value: MeetingProvider; label: string }[] = [
  { value: "GOOGLE", label: MEETING_PROVIDER_LABELS.GOOGLE },
  { value: "TEAMS", label: MEETING_PROVIDER_LABELS.TEAMS },
  { value: "ZOOM", label: MEETING_PROVIDER_LABELS.ZOOM },
  { value: "CUSTOM", label: MEETING_PROVIDER_LABELS.CUSTOM },
];
