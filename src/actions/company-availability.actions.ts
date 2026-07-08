"use server";

import { auth } from "@/lib/auth";
import { AppError, handleActionError } from "@/lib/errors";
import { companyRepository } from "@/repositories/company.repository";
import { bookingTimeSlotRepository } from "@/repositories/booking-time-slot.repository";
import { companyAvailabilityRepository } from "@/repositories/company-availability.repository";
import { parseDateOnly } from "@/lib/date-utils";
import type { ActionResult } from "@/lib/action-types";
import type { BookingTimeSlotOption } from "@/lib/booking-time-slots";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const addAvailabilitySchema = z.object({
  date: z.string().min(1, "Date is required"),
  slotIds: z.array(z.string().min(1)).min(1, "Select at least one time slot"),
});

async function requireApprovedCompany() {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    throw new AppError("Unauthorized", 401);
  }

  const company = await companyRepository.findByUserId(session.user.id);
  if (!company) throw new AppError("Company not found", 404);
  if (company.status !== "APPROVED") {
    throw new AppError("Company must be approved to manage availability", 403);
  }

  return company;
}

export async function addCompanyAvailability(
  date: string,
  slotIds: string[],
): Promise<ActionResult> {
  try {
    const company = await requireApprovedCompany();

    const parsed = addAvailabilitySchema.safeParse({ date, slotIds });
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const availabilityDate = parseDateOnly(parsed.data.date);
    const today = parseDateOnly(new Date().toISOString().slice(0, 10));
    if (availabilityDate < today) {
      throw new AppError("Cannot schedule availability in the past", 400);
    }

    const companySlots = await bookingTimeSlotRepository.listByCompany(company.id);
    const validIds = new Set(companySlots.map((slot) => slot.id));
    const invalid = parsed.data.slotIds.filter((id) => !validIds.has(id));
    if (invalid.length > 0) {
      throw new AppError("Selected slots must be part of your configured time slots", 400);
    }

    await companyAvailabilityRepository.addSlots(
      company.id,
      availabilityDate,
      parsed.data.slotIds,
    );

    revalidatePath("/company/availability");
    revalidatePath("/company/dashboard");
    revalidatePath("/products");

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function removeCompanyAvailability(id: string): Promise<ActionResult> {
  try {
    const company = await requireApprovedCompany();
    const result = await companyAvailabilityRepository.remove(id, company.id);

    if (result.blocked) {
      throw new AppError("Cannot remove a slot that already has an active booking", 409);
    }

    revalidatePath("/company/availability");
    revalidatePath("/company/dashboard");
    revalidatePath("/products");

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function removeCompanyAvailabilityForDate(date: string): Promise<ActionResult> {
  try {
    const company = await requireApprovedCompany();
    const availabilityDate = parseDateOnly(date);
    const today = parseDateOnly(new Date().toISOString().slice(0, 10));
    if (availabilityDate < today) {
      throw new AppError("Cannot modify availability in the past", 400);
    }

    const result = await companyAvailabilityRepository.removeForDate(company.id, availabilityDate);
    if (result.blocked > 0) {
      throw new AppError(
        `Cannot close this day — ${result.blocked} slot(s) already have active bookings`,
        409,
      );
    }

    revalidatePath("/company/availability");
    revalidatePath("/company/dashboard");
    revalidatePath("/products");

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getNextBookableDate(companyId: string): Promise<{ date: string | null }> {
  try {
    if (!companyId) return { date: null };
    const date = await companyAvailabilityRepository.findNextBookableDate(companyId);
    return { date };
  } catch {
    return { date: null };
  }
}

export async function getAvailableBookingSlots(
  companyId: string,
  date: string,
): Promise<{ slots: import("@/lib/booking-time-slots").BookingSlotWithStatus[]; error?: string }> {
  try {
    if (!date) return { slots: [] };

    const availabilityDate = parseDateOnly(date);
    const today = parseDateOnly(new Date().toISOString().slice(0, 10));
    if (availabilityDate < today) return { slots: [] };

    const slots = await companyAvailabilityRepository.listSlotsWithStatus(
      companyId,
      availabilityDate,
    );

    return { slots };
  } catch {
    return { slots: [], error: "Failed to load available slots" };
  }
}
