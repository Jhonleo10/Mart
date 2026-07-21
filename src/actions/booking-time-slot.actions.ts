"use server";

import { auth } from "@/lib/auth";
import { AppError, handleActionError } from "@/lib/errors";
import { companyRepository } from "@/repositories/company.repository";
import { bookingTimeSlotRepository } from "@/repositories/booking-time-slot.repository";
import type { ActionResult } from "@/lib/action-types";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const saveCompanySlotsSchema = z.object({
  slotIds: z.array(z.string().min(1)).min(1, "Select at least one time slot"),
});

const createCustomSlotSchema = z.object({
  label: z.string().min(1, "Label is required"),
  value: z.string().min(1, "Value is required"),
});

/** Parse a custom slot value in "HH:mm-HH:mm" format into [startMinutes, endMinutes] */
function parseCustomSlotRange(value: string): { start: number; end: number } | null {
  const parts = value.split("-");
  if (parts.length !== 2) return null;
  const [startStr, endStr] = parts;
  const startMatch = startStr!.match(/^(\d{2}):(\d{2})$/);
  const endMatch = endStr!.match(/^(\d{2}):(\d{2})$/);
  if (!startMatch || !endMatch) return null;
  const start = parseInt(startMatch[1]) * 60 + parseInt(startMatch[2]);
  const end = parseInt(endMatch[1]) * 60 + parseInt(endMatch[2]);
  if (end <= start) return null;
  return { start, end };
}

export async function createCustomTimeSlot(label: string, value: string): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COMPANY") {
      throw new AppError("Unauthorized", 401);
    }

    const company = await companyRepository.findByUserId(session.user.id);
    if (!company) throw new AppError("Company not found", 404);

    const parsed = createCustomSlotSchema.safeParse({ label, value });
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    // Parse and validate the range for custom slots
    const range = parseCustomSlotRange(parsed.data.value);
    if (!range) {
      throw new AppError("Invalid time range format. Expected HH:mm-HH:mm with end after start");
    }

    // Sort order uses the start time
    const sortOrder = range.start;

    const { prisma } = await import("@/lib/prisma");

    // Check for exact duplicate
    const existing = await prisma.bookingTimeSlot.findFirst({
      where: { OR: [{ label }, { value }] }
    });

    if (existing) {
      return { success: true, data: { id: existing.id } };
    }

    // Check for overlapping slots
    const allSlots = await prisma.bookingTimeSlot.findMany({ select: { id: true, value: true } });
    for (const slot of allSlots) {
      const existingRange = parseCustomSlotRange(slot.value);
      if (existingRange && range.start < existingRange.end && range.end > existingRange.start) {
        throw new AppError("This time slot overlaps with an existing slot");
      }
    }

    const newSlot = await prisma.bookingTimeSlot.create({
      data: {
        label,
        value,
        sortOrder
      }
    });

    revalidatePath("/company/availability");

    return { success: true, data: { id: newSlot.id } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function saveCompanyBookingSlots(
  slotIds: string[],
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COMPANY") {
      throw new AppError("Unauthorized", 401);
    }

    const company = await companyRepository.findByUserId(session.user.id);
    if (!company) throw new AppError("Company not found", 404);
    if (company.status !== "APPROVED") {
      throw new AppError("Company must be approved to manage booking slots", 403);
    }

    const parsed = saveCompanySlotsSchema.safeParse({ slotIds });
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const allSlots = await bookingTimeSlotRepository.listAll();
    const validIds = new Set(allSlots.map((slot) => slot.id));
    const invalid = parsed.data.slotIds.filter((id) => !validIds.has(id));
    if (invalid.length > 0) {
      throw new AppError("One or more selected time slots are invalid", 400);
    }

    await bookingTimeSlotRepository.setCompanySlots(company.id, parsed.data.slotIds);

    revalidatePath("/company/dashboard");
    revalidatePath("/company/availability");
    revalidatePath("/products");

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
