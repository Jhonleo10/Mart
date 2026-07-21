"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { AppError, handleActionError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { companyRepository } from "@/repositories/company.repository";
import { meetingRepository } from "@/repositories/meeting.repository";
import { meetingService } from "@/services/meeting.service";
import type { ActionResult } from "@/lib/action-types";
import {
  cancelMeetingSchema,
  feedbackSchema,
  parseScheduledDateTime,
  rescheduleMeetingSchema,
  scheduleMeetingSchema,
} from "@/lib/validations/meeting";

async function requireCompany() {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    throw new AppError("Unauthorized", 401);
  }
  const company = await companyRepository.findByUserId(session.user.id);
  if (!company) throw new AppError("Company not found", 404);
  return { session, company };
}

async function requireUser() {
  const session = await auth();
  if (!session?.user || session.user.role !== "USER") {
    throw new AppError("Unauthorized", 401);
  }
  return session;
}

export async function scheduleMeetingAction(formData: FormData): Promise<ActionResult> {
  try {
    const { session, company } = await requireCompany();
    const limit = await rateLimit(session.user.id, "api");
    if (!limit.success) throw new AppError("Too many requests", 429);

    const raw = {
      bookingId: formData.get("bookingId"),
      meetingDate: formData.get("meetingDate"),
      meetingTime: formData.get("meetingTime"),
      durationMinutes: formData.get("durationMinutes"),
      timezone: formData.get("timezone"),
      notes: formData.get("notes") || undefined,
      provider: formData.get("provider") || "GOOGLE",
      meetingUrl: formData.get("meetingUrl") || undefined,
    };

    const parsed = scheduleMeetingSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const scheduledAt = parseScheduledDateTime(
      parsed.data.meetingDate,
      parsed.data.meetingTime,
      parsed.data.timezone,
    );

    await meetingService.scheduleMeeting({
      bookingId: parsed.data.bookingId,
      companyId: company.id,
      actorId: session.user.id,
      scheduledAt,
      durationMinutes: parsed.data.durationMinutes,
      timezone: parsed.data.timezone,
      notes: parsed.data.notes,
      provider: parsed.data.provider,
      meetingUrl: parsed.data.meetingUrl,
    });

    revalidatePath("/company/leads");
    revalidatePath("/company/meetings");
    revalidatePath("/user/bookings");
    revalidatePath("/user/meetings");
    revalidatePath("/admin/meetings");

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function rescheduleMeetingAction(
  meetingId: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { session, company } = await requireCompany();
    const raw = {
      meetingDate: formData.get("meetingDate"),
      meetingTime: formData.get("meetingTime"),
      durationMinutes: formData.get("durationMinutes"),
      timezone: formData.get("timezone"),
      notes: formData.get("notes") || undefined,
      meetingUrl: formData.get("meetingUrl") || undefined,
    };

    const parsed = rescheduleMeetingSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const scheduledAt = parseScheduledDateTime(
      parsed.data.meetingDate,
      parsed.data.meetingTime,
      parsed.data.timezone,
    );

    await meetingService.rescheduleMeeting({
      meetingId,
      companyId: company.id,
      actorId: session.user.id,
      scheduledAt,
      durationMinutes: parsed.data.durationMinutes,
      timezone: parsed.data.timezone,
      notes: parsed.data.notes,
      meetingUrl: parsed.data.meetingUrl,
    });

    revalidatePath("/company/meetings");
    revalidatePath("/user/meetings");

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function cancelMeetingAction(
  meetingId: string,
  reason?: string,
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) throw new AppError("Unauthorized", 401);

    const parsed = cancelMeetingSchema.safeParse({ meetingId, reason });
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const asRole = session.user.role === "USER" ? "USER" : "COMPANY";

    if (asRole === "COMPANY") {
      if (session.user.role !== "COMPANY") {
        throw new AppError("Forbidden", 403);
      }
      const company = await companyRepository.findByUserId(session.user.id);
      if (!company) throw new AppError("Company not found", 404);
      await meetingService.cancelMeeting({
        meetingId,
        companyId: company.id,
        actorId: session.user.id,
        actorRole: "COMPANY",
        reason: parsed.data.reason,
      });
    } else {
      await meetingService.cancelMeeting({
        meetingId,
        userId: session.user.id,
        actorId: session.user.id,
        actorRole: "USER",
        reason: parsed.data.reason,
      });
    }

    revalidatePath("/company/meetings");
    revalidatePath("/company/leads");
    revalidatePath("/user/meetings");
    revalidatePath("/admin/meetings");

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function completeMeetingAction(
  meetingId: string,
  notes?: string,
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) throw new AppError("Unauthorized", 401);

    if (session.user.role === "COMPANY") {
      const company = await companyRepository.findByUserId(session.user.id);
      if (!company) throw new AppError("Company not found", 404);
      await meetingService.completeMeeting({
        meetingId,
        companyId: company.id,
        actorId: session.user.id,
        notes,
      });
    } else if (session.user.role === "USER") {
      await meetingService.completeMeeting({
        meetingId,
        userId: session.user.id,
        actorId: session.user.id,
        notes,
      });
    } else {
      throw new AppError("Unauthorized", 401);
    }

    revalidatePath("/company/meetings");
    revalidatePath("/user/meetings");

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function submitMeetingFeedbackAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireUser();
    const raw = {
      meetingId: formData.get("meetingId"),
      feedback: formData.get("feedback"),
      rating: formData.get("rating") || undefined,
    };

    const parsed = feedbackSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await meetingService.submitFeedback({
      meetingId: parsed.data.meetingId,
      userId: session.user.id,
      feedback: parsed.data.feedback,
      rating: parsed.data.rating,
    });

    const meeting = await meetingRepository.findById(parsed.data.meetingId);
    const productSlug = meeting?.booking.product?.slug;

    revalidatePath("/user/meetings");
    revalidatePath(`/user/meetings/${parsed.data.meetingId}`);
    revalidatePath("/products");
    if (productSlug) {
      revalidatePath(`/products/${productSlug}`);
      revalidatePath(`/products/${productSlug}/book-demo`);
    }

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function disconnectGoogleCalendarAction(): Promise<ActionResult> {
  try {
    const { company } = await requireCompany();
    const { companyGoogleRepository } = await import("@/repositories/meeting.repository");
    const connection = await companyGoogleRepository.findByCompanyId(company.id);
    if (connection) {
      await companyGoogleRepository.delete(company.id);
    }
    revalidatePath("/company/settings");
    revalidatePath("/company/meetings");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getGoogleCalendarConnection(companyId: string) {
  const session = await auth();
  if (!session?.user) throw new AppError("Unauthorized", 401);
  if (session.user.role !== "COMPANY" && session.user.role !== "ADMIN") {
    throw new AppError("Forbidden", 403);
  }
  if (session.user.role === "COMPANY") {
    const company = await companyRepository.findByUserId(session.user.id);
    if (!company || company.id !== companyId) {
      throw new AppError("Forbidden", 403);
    }
  }

  const { companyGoogleRepository } = await import("@/repositories/meeting.repository");
  const connection = await companyGoogleRepository.findByCompanyId(companyId);
  if (!connection) return null;
  return {
    connected: true,
    calendarEmail: connection.googleEmail,
    connectedAt: connection.connectedAt,
  };
}
