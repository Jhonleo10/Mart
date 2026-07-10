import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { calendarService } from "@/services/calendar.service";
import { meetingEmailService } from "@/services/meeting-email.service";
import { meetingProviderService } from "@/services/meeting-provider.service";
import { meetingRepository } from "@/repositories/meeting.repository";
import { bookingRepository } from "@/repositories/booking.repository";
import { notificationRepository } from "@/repositories/notification.repository";
import { resolveMeetingLink, resolveMeetingProvider } from "@/lib/meetings/meeting-link";
import { canCompleteMeeting } from "@/lib/meetings/meeting-window";
import type { MeetingProvider, MeetingStatus } from "@prisma/client";

function buildMeetingEnd(start: Date, durationMinutes: number) {
  return new Date(start.getTime() + durationMinutes * 60 * 1000);
}

function formatMeetingContext(booking: {
  name: string;
  email: string;
  product?: { name: string } | null;
  company: { name: string; contactEmail: string };
}) {
  const productName = booking.product?.name ?? "Product Demo";
  return {
    productName,
    companyName: booking.company.name,
    leadName: booking.name,
    leadEmail: booking.email,
    vendorEmail: booking.company.contactEmail,
  };
}

function meetingEmailPayload(
  ctx: ReturnType<typeof formatMeetingContext>,
  meeting: {
    meetingLink?: string | null;
    googleMeetLink?: string | null;
    scheduledAt: Date;
    durationMinutes: number;
    timezone: string;
    notes?: string | null;
    id?: string;
  },
  extras?: {
    cancelledReason?: string | null;
    previousScheduledAt?: Date;
    reminderLabel?: string;
  },
) {
  return {
    ...ctx,
    meetLink: resolveMeetingLink(meeting) ?? "",
    scheduledAt: meeting.scheduledAt,
    durationMinutes: meeting.durationMinutes,
    timezone: meeting.timezone,
    notes: meeting.notes,
    meetingId: meeting.id,
    ...extras,
  };
}

export const meetingService = {
  async scheduleMeeting(input: {
    bookingId: string;
    companyId: string;
    actorId: string;
    scheduledAt: Date;
    durationMinutes: number;
    timezone: string;
    notes?: string;
    provider: MeetingProvider;
    meetingUrl?: string;
  }) {
    const booking = await bookingRepository.findById(input.bookingId);
    if (!booking) throw new AppError("Booking not found", 404);
    if (booking.companyId !== input.companyId) throw new AppError("Forbidden", 403);
    if (!["NEW", "CONTACTED", "QUALIFIED"].includes(booking.status)) {
      throw new AppError("This demo request cannot be scheduled", 400);
    }

    const existing = await meetingRepository.findByBookingId(input.bookingId);
    if (existing?.status === "SCHEDULED") {
      throw new AppError("A meeting is already scheduled for this demo request", 409);
    }

    // Claim the booking row early so concurrent schedule attempts fail cleanly.
    const claim = await prisma.booking.updateMany({
      where: {
        id: input.bookingId,
        companyId: input.companyId,
        status: { in: ["NEW", "CONTACTED", "QUALIFIED"] },
      },
      data: { updatedAt: new Date() },
    });
    if (claim.count === 0) {
      throw new AppError("This demo request cannot be scheduled", 400);
    }

    // Re-check after claim to reduce duplicate Google events under concurrent clicks.
    const existingAfterClaim = await meetingRepository.findByBookingId(input.bookingId);
    if (existingAfterClaim?.status === "SCHEDULED") {
      throw new AppError("A meeting is already scheduled for this demo request", 409);
    }

    if (input.scheduledAt.getTime() <= Date.now()) {
      throw new AppError("Meeting time must be in the future", 400);
    }

    if (![15, 30, 45, 60, 90, 120].includes(input.durationMinutes)) {
      throw new AppError("Invalid meeting duration", 400);
    }

    const end = buildMeetingEnd(input.scheduledAt, input.durationMinutes);
    const overlap = await meetingRepository.hasOverlap(input.companyId, input.scheduledAt, end);
    if (overlap) {
      throw new AppError("This time slot overlaps with another scheduled meeting", 409);
    }

    const ctx = formatMeetingContext(booking);
    const description = [
      `Demo for ${ctx.productName}`,
      booking.message ? `Notes from buyer: ${booking.message}` : null,
      input.notes ? `Vendor notes: ${input.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    let resolved: Awaited<ReturnType<typeof meetingProviderService.resolveScheduleLink>> | undefined;

    try {
      const scheduleLink = await meetingProviderService.resolveScheduleLink({
        companyId: input.companyId,
        provider: input.provider,
        meetingUrl: input.meetingUrl,
        summary: `${ctx.productName} — Demo with ${ctx.leadName}`,
        description,
        start: input.scheduledAt,
        end,
        timezone: input.timezone,
        attendeeEmails: [booking.email, ctx.vendorEmail].filter(Boolean),
      });
      resolved = scheduleLink;

      const meeting = await prisma.$transaction(async (tx) => {
      const created = await tx.demoMeeting.upsert({
        where: { bookingId: input.bookingId },
        create: {
          bookingId: input.bookingId,
          companyId: input.companyId,
          meetingProvider: scheduleLink.meetingProvider,
          meetingLink: scheduleLink.meetingLink,
          googleEventId: scheduleLink.googleEventId ?? null,
          googleMeetLink: scheduleLink.meetingProvider === "GOOGLE" ? scheduleLink.meetingLink : null,
          googleCalendarId: scheduleLink.googleCalendarId ?? "primary",
          scheduledAt: input.scheduledAt,
          durationMinutes: input.durationMinutes,
          timezone: input.timezone,
          status: "SCHEDULED",
          notes: input.notes ?? null,
          icsUid: scheduleLink.icsUid ?? null,
          createdById: input.actorId,
          updatedById: input.actorId,
        },
        update: {
          meetingProvider: scheduleLink.meetingProvider,
          meetingLink: scheduleLink.meetingLink,
          googleEventId: scheduleLink.googleEventId ?? null,
          googleMeetLink: scheduleLink.meetingProvider === "GOOGLE" ? scheduleLink.meetingLink : null,
          scheduledAt: input.scheduledAt,
          durationMinutes: input.durationMinutes,
          timezone: input.timezone,
          status: "SCHEDULED",
          notes: input.notes ?? null,
          icsUid: scheduleLink.icsUid ?? null,
          updatedById: input.actorId,
          cancelledReason: null,
        },
        include: {
          booking: { include: { product: true, company: true, user: true } },
        },
      });

      await tx.booking.update({
        where: { id: input.bookingId },
        data: { status: "CONTACTED", meetingLink: scheduleLink.meetingLink },
      });

      await tx.meetingHistory.create({
        data: {
          meetingId: created.id,
          action: "SCHEDULED",
          actorId: input.actorId,
          actorRole: "COMPANY",
          metadata: {
            scheduledAt: input.scheduledAt.toISOString(),
            durationMinutes: input.durationMinutes,
            timezone: input.timezone,
            provider: scheduleLink.meetingProvider,
          },
        },
      });

      return created;
    });

      const emailPayload = meetingEmailPayload(ctx, meeting);

      await Promise.all([
        meetingEmailService.meetingScheduled(booking.email, emailPayload),
        meetingEmailService.demoConfirmed(ctx.vendorEmail, emailPayload),
        booking.userId
          ? notificationRepository.create(
              booking.userId,
              "Meeting Confirmed",
              `Your demo for ${ctx.productName} is scheduled for ${input.scheduledAt.toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                timeZone: input.timezone,
              })}. Join from My Meetings when it's time.`,
              `/user/meetings/${meeting.id}`,
            )
          : Promise.resolve(),
      ]);

      return meeting;
    } catch (error) {
      if (resolved?.googleEventId && input.provider === "GOOGLE") {
        try {
          await calendarService.cancelEvent(
            input.companyId,
            resolved.googleEventId,
            resolved.googleCalendarId ?? "primary",
          );
        } catch (rollbackError) {
          console.error("Failed to roll back Google Calendar event after scheduling error", rollbackError);
        }
      }
      throw error;
    }
  },

  async cancelMeeting(input: {
    meetingId: string;
    companyId?: string;
    userId?: string;
    actorId: string;
    actorRole: string;
    reason?: string;
  }) {
    const meeting = await meetingRepository.findById(input.meetingId);
    if (!meeting) throw new AppError("Meeting not found", 404);

    if (input.companyId && meeting.companyId !== input.companyId) {
      throw new AppError("Forbidden", 403);
    }
    if (input.userId && meeting.booking.userId !== input.userId) {
      throw new AppError("Forbidden", 403);
    }
    if (meeting.status !== "SCHEDULED") {
      throw new AppError("Only scheduled meetings can be cancelled", 400);
    }

    const provider = resolveMeetingProvider(meeting);
    if (provider === "GOOGLE" && meeting.googleEventId) {
      await calendarService.cancelEvent(
        meeting.companyId,
        meeting.googleEventId,
        meeting.googleCalendarId,
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.demoMeeting.update({
        where: { id: meeting.id },
        data: {
          status: "CANCELLED",
          cancelledReason: input.reason ?? null,
          updatedById: input.actorId,
        },
        include: {
          booking: { include: { product: true, company: true, user: true } },
        },
      });

      // Return lead to an actionable pipeline stage so Schedule Meeting can be used again.
      if (["CONTACTED", "QUALIFIED"].includes(result.booking.status)) {
        await tx.booking.update({
          where: { id: result.bookingId },
          data: { meetingLink: null },
        });
      }

      await tx.meetingHistory.create({
        data: {
          meetingId: meeting.id,
          action: "CANCELLED",
          actorId: input.actorId,
          actorRole: input.actorRole,
          metadata: { reason: input.reason ?? null },
        },
      });

      return result;
    });

    const ctx = formatMeetingContext(updated.booking);
    const emailPayload = meetingEmailPayload(ctx, meeting, {
      cancelledReason: input.reason,
    });

    await Promise.all([
      meetingEmailService.meetingCancelled(updated.booking.email, emailPayload),
      meetingEmailService.meetingCancelled(ctx.vendorEmail, emailPayload),
    ]);

    return updated;
  },

  async rescheduleMeeting(input: {
    meetingId: string;
    companyId: string;
    actorId: string;
    scheduledAt: Date;
    durationMinutes: number;
    timezone: string;
    notes?: string;
    meetingUrl?: string;
  }) {
    const meeting = await meetingRepository.findById(input.meetingId);
    if (!meeting) throw new AppError("Meeting not found", 404);
    if (meeting.companyId !== input.companyId) throw new AppError("Forbidden", 403);
    if (meeting.status !== "SCHEDULED") {
      throw new AppError("Only scheduled meetings can be rescheduled", 400);
    }
    if (input.scheduledAt.getTime() <= Date.now()) {
      throw new AppError("Meeting time must be in the future", 400);
    }

    const end = buildMeetingEnd(input.scheduledAt, input.durationMinutes);
    const overlap = await meetingRepository.hasOverlap(
      input.companyId,
      input.scheduledAt,
      end,
      meeting.id,
    );
    if (overlap) {
      throw new AppError("This time slot overlaps with another scheduled meeting", 409);
    }

    const booking = meeting.booking;
    const ctx = formatMeetingContext(booking);
    const provider = resolveMeetingProvider(meeting) ?? "CUSTOM";
    const description = [
      `Rescheduled demo for ${ctx.productName}`,
      input.notes ? `Notes: ${input.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const resolved = await meetingProviderService.resolveRescheduleLink({
      companyId: input.companyId,
      provider,
      meetingUrl: input.meetingUrl,
      summary: `${ctx.productName} — Demo with ${ctx.leadName}`,
      description,
      start: input.scheduledAt,
      end,
      timezone: input.timezone,
      attendeeEmails: [booking.email, ctx.vendorEmail].filter(Boolean),
      existingGoogleEventId: meeting.googleEventId,
      existingGoogleCalendarId: meeting.googleCalendarId,
      existingMeetingLink: resolveMeetingLink(meeting),
    });

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.demoMeeting.update({
        where: { id: meeting.id },
        data: {
          scheduledAt: input.scheduledAt,
          durationMinutes: input.durationMinutes,
          timezone: input.timezone,
          meetingProvider: resolved.meetingProvider,
          meetingLink: resolved.meetingLink,
          googleMeetLink: resolved.meetingProvider === "GOOGLE" ? resolved.meetingLink : null,
          googleEventId: resolved.googleEventId ?? meeting.googleEventId,
          icsUid: resolved.icsUid ?? meeting.icsUid,
          notes: input.notes ?? meeting.notes,
          status: "SCHEDULED",
          updatedById: input.actorId,
        },
        include: {
          booking: { include: { product: true, company: true, user: true } },
        },
      });

      await tx.booking.update({
        where: { id: booking.id },
        data: { meetingLink: resolved.meetingLink },
      });

      await tx.meetingHistory.create({
        data: {
          meetingId: meeting.id,
          action: "RESCHEDULED",
          actorId: input.actorId,
          actorRole: "COMPANY",
          metadata: {
            from: meeting.scheduledAt.toISOString(),
            to: input.scheduledAt.toISOString(),
            provider: resolved.meetingProvider,
          },
        },
      });

      return result;
    });

    const emailPayload = meetingEmailPayload(ctx, updated, {
      previousScheduledAt: meeting.scheduledAt,
    });

    await Promise.all([
      meetingEmailService.meetingRescheduled(booking.email, emailPayload),
      meetingEmailService.meetingRescheduled(ctx.vendorEmail, emailPayload),
      booking.userId
        ? notificationRepository.create(
            booking.userId,
            "Meeting Rescheduled",
            `Your demo for ${ctx.productName} has a new time.`,
            "/user/meetings",
          )
        : Promise.resolve(),
    ]);

    return updated;
  },

  async completeMeeting(input: {
    meetingId: string;
    companyId: string;
    actorId: string;
    notes?: string;
  }) {
    const meeting = await meetingRepository.findById(input.meetingId);
    if (!meeting) throw new AppError("Meeting not found", 404);
    if (meeting.companyId !== input.companyId) throw new AppError("Forbidden", 403);
    if (meeting.status !== "SCHEDULED") {
      throw new AppError("Only scheduled meetings can be completed", 400);
    }

    if (!canCompleteMeeting(meeting.scheduledAt, meeting.durationMinutes)) {
      throw new AppError(
        "Meetings can only be marked complete during the scheduled time window",
        400,
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.demoMeeting.update({
        where: { id: meeting.id },
        data: {
          status: "COMPLETED",
          notes: input.notes ?? meeting.notes,
          updatedById: input.actorId,
        },
        include: {
          booking: { include: { product: true, company: true, user: true } },
        },
      });

      await tx.booking.update({
        where: { id: meeting.bookingId },
        data: { status: "CONVERTED", availabilityId: null },
      });

      await tx.meetingHistory.create({
        data: {
          meetingId: meeting.id,
          action: "COMPLETED",
          actorId: input.actorId,
          actorRole: "COMPANY",
        },
      });

      return result;
    });

    const ctx = formatMeetingContext(updated.booking);
    const emailPayload = meetingEmailPayload(ctx, meeting);

    await Promise.all([
      meetingEmailService.meetingCompleted(updated.booking.email, emailPayload),
      meetingEmailService.feedbackRequest(updated.booking.email, {
        ...emailPayload,
        meetingId: meeting.id,
      }),
    ]);

    return updated;
  },

  async submitFeedback(input: {
    meetingId: string;
    userId: string;
    feedback: string;
    rating: number;
  }) {
    const meeting = await meetingRepository.findById(input.meetingId);
    if (!meeting) throw new AppError("Meeting not found", 404);
    if (meeting.booking.userId !== input.userId) throw new AppError("Forbidden", 403);
    if (meeting.status !== "COMPLETED") {
      throw new AppError("Feedback is only available after the meeting is completed", 400);
    }
    if (meeting.feedback) {
      throw new AppError("You have already submitted a review for this meeting", 400);
    }

    const productId = meeting.booking.productId;
    if (!productId) {
      throw new AppError("This meeting is not linked to a product review", 400);
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.demoMeeting.update({
        where: { id: input.meetingId },
        data: {
          feedback: input.feedback,
          feedbackRating: input.rating,
          updatedById: input.userId,
        },
        include: {
          booking: {
            include: { product: true, company: true, user: true },
          },
        },
      });

      await tx.review.upsert({
        where: {
          productId_userId: { productId, userId: input.userId },
        },
        create: {
          productId,
          userId: input.userId,
          rating: input.rating,
          comment: input.feedback,
        },
        update: {
          rating: input.rating,
          comment: input.feedback,
        },
      });

      return updated;
    });
  },

  filterMeetingsByTab<T extends { status: MeetingStatus; scheduledAt: Date }>(
    meetings: T[],
    tab: string,
  ): T[] {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    switch (tab) {
      case "today":
        return meetings.filter(
          (m) =>
            m.status === "SCHEDULED" &&
            m.scheduledAt >= startOfDay &&
            m.scheduledAt <= endOfDay,
        );
      case "upcoming":
        return meetings.filter((m) => m.status === "SCHEDULED" && m.scheduledAt >= now);
      case "completed":
        return meetings.filter((m) => m.status === "COMPLETED");
      case "cancelled":
        return meetings.filter((m) => m.status === "CANCELLED" || m.status === "NO_SHOW");
      default:
        return meetings;
    }
  },
};
