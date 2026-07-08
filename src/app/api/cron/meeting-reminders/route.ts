import { NextResponse } from "next/server";
import { meetingRepository } from "@/repositories/meeting.repository";
import { meetingEmailService } from "@/services/meeting-email.service";
import type { MeetingReminderType } from "@prisma/client";
import { resolveMeetingLink } from "@/lib/meetings/meeting-link";

const REMINDER_LABELS: Record<MeetingReminderType, string> = {
  REMINDER_24H: "in 24 hours",
  REMINDER_30M: "in 30 minutes",
  REMINDER_5M: "in 5 minutes",
};

/**
 * Windows (minutes of tolerance around the due time):
 * - 24h: wide enough for Hobby's once-daily Vercel cron
 * - 30m / 5m: need a frequent external cron (or Vercel Pro) to fire reliably
 */
const REMINDER_WINDOWS: Record<MeetingReminderType, number> = {
  REMINDER_24H: 14 * 60, // ±14h so a daily job still catches next-day demos
  REMINDER_30M: 3,
  REMINDER_5M: 3,
};

async function processReminders(type: MeetingReminderType) {
  const meetings = await meetingRepository.findDueForReminders(
    type,
    REMINDER_WINDOWS[type],
  );
  let sent = 0;

  for (const meeting of meetings) {
    const payload = {
      productName: meeting.booking.product?.name ?? "Product Demo",
      companyName: meeting.booking.company.name,
      leadName: meeting.booking.name,
      leadEmail: meeting.booking.email,
      vendorEmail: meeting.booking.company.contactEmail,
      meetLink: resolveMeetingLink(meeting) ?? "",
      scheduledAt: meeting.scheduledAt,
      durationMinutes: meeting.durationMinutes,
      timezone: meeting.timezone,
      reminderLabel: REMINDER_LABELS[type],
    };

    await Promise.all([
      meetingEmailService.meetingReminder(meeting.booking.email, payload),
      meetingEmailService.meetingReminder(meeting.booking.company.contactEmail, payload),
      meetingRepository.markReminderSent(meeting.id, type),
    ]);
    sent += 1;
  }

  return sent;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [r24, r30, r5] = await Promise.all([
    processReminders("REMINDER_24H"),
    processReminders("REMINDER_30M"),
    processReminders("REMINDER_5M"),
  ]);

  return NextResponse.json({
    success: true,
    sent: { REMINDER_24H: r24, REMINDER_30M: r30, REMINDER_5M: r5 },
  });
}
