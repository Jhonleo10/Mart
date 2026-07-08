import { z } from "zod";
import type { MeetingProvider } from "@prisma/client";
import { MEETING_DURATIONS, MEETING_TIMEZONES } from "@/lib/meetings/timezones";
import { validateMeetingUrl } from "@/lib/meetings/meeting-url-validation";

const timezoneValues = MEETING_TIMEZONES.map((t) => t.value) as [string, ...string[]];
const providerValues = ["GOOGLE", "TEAMS", "ZOOM", "CUSTOM"] as const;

export const meetingProviderSchema = z.enum(providerValues);

const scheduleFields = {
  meetingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  meetingTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
  durationMinutes: z.coerce
    .number()
    .refine((v) => (MEETING_DURATIONS as readonly number[]).includes(v), "Invalid duration"),
  timezone: z.enum(timezoneValues),
  notes: z.string().max(2000).optional(),
  provider: meetingProviderSchema.default("GOOGLE"),
  meetingUrl: z.string().max(2048).optional(),
};

export const scheduleMeetingSchema = z
  .object({
    bookingId: z.string().min(1),
    ...scheduleFields,
  })
  .superRefine((data, ctx) => {
    if (data.provider === "GOOGLE") return;
    if (!data.meetingUrl?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Meeting URL is required for the selected provider",
        path: ["meetingUrl"],
      });
      return;
    }
    try {
      validateMeetingUrl(data.provider as MeetingProvider, data.meetingUrl);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error instanceof Error ? error.message : "Invalid meeting URL",
        path: ["meetingUrl"],
      });
    }
  });

export const apiScheduleMeetingSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
    duration: z.coerce
      .number()
      .refine((v) => (MEETING_DURATIONS as readonly number[]).includes(v), "Invalid duration"),
    provider: meetingProviderSchema,
    meetingUrl: z.string().max(2048).optional(),
    notes: z.string().max(2000).optional(),
    timezone: z.enum(timezoneValues).default("Asia/Kolkata"),
    bookingId: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    if (data.provider === "GOOGLE") return;
    if (!data.meetingUrl?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "meetingUrl is required for this provider",
        path: ["meetingUrl"],
      });
      return;
    }
    try {
      validateMeetingUrl(data.provider, data.meetingUrl);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error instanceof Error ? error.message : "Invalid meeting URL",
        path: ["meetingUrl"],
      });
    }
  });

export const rescheduleMeetingSchema = z.object({
  meetingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  meetingTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
  durationMinutes: z.coerce
    .number()
    .refine((v) => (MEETING_DURATIONS as readonly number[]).includes(v), "Invalid duration"),
  timezone: z.enum(timezoneValues),
  notes: z.string().max(2000).optional(),
  meetingUrl: z.string().max(2048).optional(),
});

export const cancelMeetingSchema = z.object({
  meetingId: z.string().min(1),
  reason: z.string().max(1000).optional(),
});

export const feedbackSchema = z.object({
  meetingId: z.string().min(1),
  feedback: z.string().min(10, "Please write at least 10 characters").max(2000),
  rating: z.coerce.number().min(1, "Please select a star rating").max(5),
});

export function parseScheduledDateTime(date: string, time: string, timezone: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(utcGuess);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const tzAsUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
  );
  const offset = tzAsUtc - utcGuess.getTime();
  return new Date(utcGuess.getTime() - offset);
}
