import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { companyRepository } from "@/repositories/company.repository";
import { meetingService } from "@/services/meeting.service";
import { apiScheduleMeetingSchema, parseScheduledDateTime } from "@/lib/validations/meeting";
import { resolveMeetingLink } from "@/lib/meetings/meeting-link";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COMPANY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await rateLimit(session.user.id, "api");
    if (!limit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const company = await companyRepository.findByUserId(session.user.id);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = apiScheduleMeetingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const scheduledAt = parseScheduledDateTime(
      parsed.data.date,
      parsed.data.time,
      parsed.data.timezone,
    );

    const meeting = await meetingService.scheduleMeeting({
      bookingId: parsed.data.bookingId,
      companyId: company.id,
      actorId: session.user.id,
      scheduledAt,
      durationMinutes: parsed.data.duration,
      timezone: parsed.data.timezone,
      notes: parsed.data.notes,
      provider: parsed.data.provider,
      meetingUrl: parsed.data.meetingUrl,
    });

    return NextResponse.json({
      id: meeting.id,
      meetingProvider: meeting.meetingProvider,
      meetingLink: resolveMeetingLink(meeting),
      meetingStatus: meeting.status,
      scheduledAt: meeting.scheduledAt,
      durationMinutes: meeting.durationMinutes,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("POST /api/meetings/schedule", error);
    return NextResponse.json({ error: "Failed to schedule meeting" }, { status: 500 });
  }
}
