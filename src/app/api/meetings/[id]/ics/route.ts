import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { companyRepository } from "@/repositories/company.repository";
import { meetingRepository } from "@/repositories/meeting.repository";
import { resolveMeetingLink } from "@/lib/meetings/meeting-link";
import { generateIcsContent } from "@/lib/meetings/ics";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const meeting = await meetingRepository.findById(id);
  if (!meeting) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let allowed = session.user.role === "ADMIN";
  if (session.user.role === "USER") {
    allowed = meeting.booking.userId === session.user.id;
  }
  if (session.user.role === "COMPANY") {
    const company = await companyRepository.findByUserId(session.user.id);
    allowed = company?.id === meeting.companyId;
  }

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const joinLink = resolveMeetingLink(meeting);
  const end = new Date(meeting.scheduledAt.getTime() + meeting.durationMinutes * 60 * 1000);
  const ics = generateIcsContent({
    uid: meeting.icsUid ?? meeting.id,
    title: `${meeting.booking.product?.name ?? "Demo"} — Genius Mart`,
    description: `Demo with ${meeting.booking.company.name}`,
    location: joinLink ?? undefined,
    start: meeting.scheduledAt,
    end,
    organizerEmail: meeting.booking.company.contactEmail,
    organizerName: meeting.booking.company.name,
    attendeeEmail: meeting.booking.email,
    attendeeName: meeting.booking.name,
    meetLink: joinLink ?? undefined,
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="meeting-${meeting.id}.ics"`,
    },
  });
}
