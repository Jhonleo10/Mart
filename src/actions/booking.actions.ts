"use server";

import { auth } from "@/lib/auth";
import { AppError, handleActionError } from "@/lib/errors";
import { emailService, type BookingEmailDetails } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { bookingSchema } from "@/lib/validations";
import { bookingRepository } from "@/repositories/booking.repository";
import { productRepository } from "@/repositories/product.repository";
import { notificationRepository } from "@/repositories/notification.repository";
import { companyAvailabilityRepository } from "@/repositories/company-availability.repository";
import { prisma } from "@/lib/prisma";
import { parseDateOnly } from "@/lib/date-utils";
import { isSlotInPast } from "@/lib/meetings/booking-schedule-defaults";
import { releaseTerminalAvailabilityHold } from "@/lib/booking-availability";
import type { ActionResult } from "@/lib/action-types";
import type { BookingStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { bookingTimeSlotRepository } from "@/repositories/booking-time-slot.repository";
import { revalidatePath } from "next/cache";
import { z } from "zod";

function formatPreferredDate(value: Date | null | undefined) {
  if (!value) return null;
  return value.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function toEmailDetails(
  product: { name: string; company: { name: string } },
  data: {
    name: string;
    email: string;
    phone: string;
    preferredDate?: Date | null;
    preferredTime?: string | null;
    message?: string | null;
    meetingLink?: string | null;
  },
): BookingEmailDetails {
  return {
    productName: product.name,
    companyName: product.company.name,
    leadName: data.name,
    leadEmail: data.email,
    leadPhone: data.phone,
    preferredDate: formatPreferredDate(data.preferredDate) ?? undefined,
    preferredTime: data.preferredTime ?? undefined,
    message: data.message ?? undefined,
  };
}

async function resolveCompanyRecipientEmail(company: { contactEmail: string; userId: string }) {
  if (company.contactEmail) return company.contactEmail;
  const owner = await prisma.user.findUnique({
    where: { id: company.userId },
    select: { email: true },
  });
  return owner?.email ?? null;
}

export async function createBooking(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AppError("Please register or sign in to book a demo", 401);
    }
    if (session.user.role !== "USER") {
      throw new AppError("Only registered buyers can book product demos", 403);
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.emailVerified || user.status !== "ACTIVE") {
      throw new AppError("Please verify your email before booking a demo", 403);
    }

    const raw = {
      productId: formData.get("productId"),
      name: formData.get("name"),
      email: session.user.email,
      phone: formData.get("phone"),
      preferredDate: formData.get("preferredDate"),
      preferredTime: formData.get("preferredTime"),
      message: formData.get("message") || undefined,
    };

    const parsed = bookingSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const limit = await rateLimit(parsed.data.email, "booking");
    if (!limit.success) throw new AppError("Too many booking requests", 429);

    const product = await productRepository.findById(parsed.data.productId);
    if (!product || product.status !== "PUBLISHED") {
      throw new AppError("Product not available", 404);
    }

    const preferredDate = parseDateOnly(parsed.data.preferredDate);
    const today = parseDateOnly(new Date().toISOString().slice(0, 10));
    if (preferredDate < today) {
      throw new AppError("Cannot book a date in the past", 400);
    }

    const companySlots = await bookingTimeSlotRepository.listByCompany(product.companyId);
    if (companySlots.length === 0) {
      throw new AppError(
        "This vendor has not configured demo time slots yet. Please contact them directly.",
        400,
      );
    }
    const matchedSlot = companySlots.find((slot) => slot.value === parsed.data.preferredTime);
    if (!matchedSlot) {
      throw new AppError("Selected time slot is not available for this company", 400);
    }

    if (isSlotInPast(parsed.data.preferredDate, matchedSlot.value)) {
      throw new AppError("This time slot has already passed. Please choose a future slot.", 400);
    }

    const slotStatuses = await companyAvailabilityRepository.listSlotsWithStatus(
      product.companyId,
      preferredDate,
    );
    const selectedSlot = slotStatuses.find((slot) => slot.value === matchedSlot.value);
    if (!selectedSlot || selectedSlot.status !== "available") {
      throw new AppError(
        selectedSlot?.status === "booked"
          ? "This time slot was just booked. Please choose another."
          : "This time slot is no longer available. Please refresh and try again.",
        409,
      );
    }

    const availability = await companyAvailabilityRepository.findAvailabilityForSlot(
      product.companyId,
      preferredDate,
      matchedSlot.id,
    );
    if (!availability) {
      throw new AppError("This time slot is not scheduled on the selected date", 400);
    }

    await prisma.$transaction(
      async (tx) => {
        const locked = await tx.companyAvailability.findUnique({
          where: { id: availability.id },
          include: { booking: { select: { id: true, status: true } } },
        });

        if (!locked) {
          throw new AppError("This time slot is no longer available", 409);
        }

        if (
          locked.booking &&
          ["NEW", "CONTACTED", "QUALIFIED"].includes(locked.booking.status)
        ) {
          throw new AppError(
            "This time slot was just booked by another user. Please choose another.",
            409,
          );
        }

        await releaseTerminalAvailabilityHold(tx, locked.id);

        const activeHold = await tx.booking.findFirst({
          where: {
            availabilityId: locked.id,
            status: { in: ["NEW", "CONTACTED", "QUALIFIED"] },
          },
          select: { id: true },
        });

        if (activeHold) {
          throw new AppError(
            "This time slot was just booked by another user. Please choose another.",
            409,
          );
        }

        const legacyConflict = await tx.booking.findFirst({
          where: {
            companyId: product.companyId,
            preferredDate,
            preferredTime: matchedSlot.label,
            status: { in: ["NEW", "CONTACTED", "QUALIFIED"] },
            availabilityId: null,
          },
        });

        if (legacyConflict) {
          throw new AppError(
            "This time slot was just booked by another user. Please choose another.",
            409,
          );
        }

        try {
          await tx.booking.create({
            data: {
              name: parsed.data.name,
              email: parsed.data.email,
              phone: parsed.data.phone,
              preferredDate,
              preferredTime: matchedSlot.label,
              message: parsed.data.message ?? null,
              availabilityId: locked.id,
              productId: product.id,
              companyId: product.companyId,
              userId: session.user.id,
            },
          });
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
          ) {
            throw new AppError(
              "This time slot was just booked by another user. Please choose another.",
              409,
            );
          }
          throw err;
        }
      },
    );

    const emailDetails = toEmailDetails(product, {
      ...parsed.data,
      preferredDate,
      preferredTime: matchedSlot.label,
      message: parsed.data.message ?? null,
    });

    const companyEmail = await resolveCompanyRecipientEmail(product.company);
    if (companyEmail) {
      await emailService.newLead(companyEmail, emailDetails);
    }
    await emailService.bookingConfirmation(parsed.data.email, emailDetails);

    await notificationRepository.create(
      product.company.userId,
      "New Demo Booking",
      `${parsed.data.name} booked a demo for ${product.name} on ${formatPreferredDate(preferredDate)} at ${matchedSlot.label}. Review your availability if you need to adjust open slots.`,
      "/company/leads",
    );

    await notificationRepository.create(
      session.user.id,
      "Demo Request Submitted",
      `Your demo request for ${product.name} on ${formatPreferredDate(preferredDate)} at ${matchedSlot.label} was sent to the vendor. You'll get a meeting invite once they confirm.`,
      "/user/bookings",
    );

    revalidatePath("/company/leads");
    revalidatePath("/company/dashboard");
    revalidatePath("/company/analytics");
    revalidatePath("/user/bookings");
    revalidatePath("/user/meetings");
    revalidatePath("/user/dashboard");
    revalidatePath(`/book/${product.slug}`);
    revalidatePath("/products");

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

const updateStatusSchema = z.object({
  meetingLink: z.string().url("Enter a valid meeting URL").optional().or(z.literal("")),
});

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  meetingLink?: string,
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COMPANY") {
      throw new AppError("Unauthorized", 401);
    }

    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new AppError("Booking not found", 404);

    const { companyRepository } = await import("@/repositories/company.repository");
    const company = await companyRepository.findByUserId(session.user.id);
    if (booking.companyId !== company?.id) throw new AppError("Forbidden", 403);

    let resolvedMeetingLink: string | null = null;
    if (status === "CONTACTED" && meetingLink) {
      const parsed = updateStatusSchema.safeParse({ meetingLink });
      if (!parsed.success) {
        throw new AppError(parsed.error.issues[0]?.message ?? "Invalid meeting link");
      }
      resolvedMeetingLink = parsed.data.meetingLink || null;
    }

    await bookingRepository.updateStatus(bookingId, status, resolvedMeetingLink);

    if (status === "CLOSED") {
      await prisma.booking.updateMany({
        where: { id: bookingId, availabilityId: { not: null } },
        data: { availabilityId: null },
      });
    }

    if (status === "CONTACTED" || status === "CLOSED") {
      const productName = booking.product?.name ?? "General enquiry";
      const emailDetails = toEmailDetails(
        { name: productName, company: { name: booking.company.name } },
        {
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          preferredDate: booking.preferredDate,
          preferredTime: booking.preferredTime,
          message: booking.message,
          meetingLink: resolvedMeetingLink,
        },
      );

      await emailService.bookingStatusUpdate(booking.email, {
        ...emailDetails,
        status,
      });

      if (booking.userId && status === "CONTACTED" && booking.product) {
        const linkedMeeting = await prisma.demoMeeting.findUnique({
          where: { bookingId: booking.id },
          select: { id: true },
        });
        await notificationRepository.create(
          booking.userId,
          linkedMeeting ? "Meeting Confirmed" : "Vendor Responded",
          resolvedMeetingLink
            ? `Your demo call link for ${booking.product.name} is ready.`
            : `The vendor has confirmed your demo request for ${booking.product.name}.`,
          linkedMeeting ? `/user/meetings/${linkedMeeting.id}` : "/user/bookings",
        );
      }
    }

    revalidatePath("/company/leads");
    revalidatePath("/company/dashboard");
    revalidatePath("/company/analytics");
    revalidatePath("/user/bookings");
    revalidatePath("/user/meetings");

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateBookingStatusFormAction(
  bookingId: string,
  status: BookingStatus,
  meetingLink?: string,
) {
  await updateBookingStatus(bookingId, status, meetingLink);
}
