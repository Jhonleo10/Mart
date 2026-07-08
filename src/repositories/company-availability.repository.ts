import { prisma } from "@/lib/prisma";
import type { BookingSlotStatus, BookingSlotWithStatus } from "@/lib/booking-time-slots";
import { formatDateInput, minBookableDate, parseDateOnly } from "@/lib/date-utils";
import { ACTIVE_BOOKING_STATUSES } from "@/lib/booking-availability";
import { isSlotInPast } from "@/lib/meetings/booking-schedule-defaults";
import type { BookingStatus } from "@prisma/client";

const DAY_MS = 24 * 60 * 60 * 1000;

export const companyAvailabilityRepository = {
  listByCompany(companyId: string, fromDate?: Date) {
    return prisma.companyAvailability.findMany({
      where: {
        companyId,
        ...(fromDate ? { date: { gte: fromDate } } : {}),
      },
      include: {
        bookingTimeSlot: true,
        booking: {
          select: { id: true, status: true },
        },
      },
      orderBy: [{ date: "asc" }, { bookingTimeSlot: { sortOrder: "asc" } }],
    });
  },

  async addSlots(companyId: string, date: Date, slotIds: string[]) {
    if (slotIds.length === 0) return;

    await prisma.companyAvailability.createMany({
      data: slotIds.map((bookingTimeSlotId) => ({
        companyId,
        date,
        bookingTimeSlotId,
      })),
      skipDuplicates: true,
    });
  },

  async remove(id: string, companyId: string) {
    const entry = await prisma.companyAvailability.findFirst({
      where: { id, companyId },
      include: { booking: { select: { id: true, status: true } } },
    });

    if (!entry) return { count: 0, blocked: false };

    if (
      entry.booking &&
      ACTIVE_BOOKING_STATUSES.includes(entry.booking.status as BookingStatus)
    ) {
      return { count: 0, blocked: true };
    }

    const result = await prisma.companyAvailability.deleteMany({
      where: { id, companyId },
    });

    return { count: result.count, blocked: false };
  },

  async listSlotsWithStatus(companyId: string, date: Date): Promise<BookingSlotWithStatus[]> {
    const dayEnd = new Date(date.getTime() + 24 * 60 * 60 * 1000);

    const [scheduled, legacyBookings] = await Promise.all([
      prisma.companyAvailability.findMany({
        where: { companyId, date },
        include: {
          bookingTimeSlot: true,
          booking: { select: { id: true, status: true } },
        },
        orderBy: { bookingTimeSlot: { sortOrder: "asc" } },
      }),
      prisma.booking.findMany({
        where: {
          companyId,
          preferredDate: { gte: date, lt: dayEnd },
          status: { in: ACTIVE_BOOKING_STATUSES },
          availabilityId: null,
        },
        select: { preferredTime: true },
      }),
    ]);

    const legacyBookedLabels = new Set(
      legacyBookings.map((b) => b.preferredTime).filter(Boolean) as string[],
    );

    const dateStr = formatDateInput(date);

    return scheduled.map((entry) => {
      const isBooked =
        Boolean(
          entry.booking &&
            ACTIVE_BOOKING_STATUSES.includes(entry.booking.status as BookingStatus),
        ) || legacyBookedLabels.has(entry.bookingTimeSlot.label);

      const isPast = isSlotInPast(dateStr, entry.bookingTimeSlot.value);
      const status: BookingSlotStatus = isBooked ? "booked" : isPast ? "past" : "available";

      return {
        id: entry.bookingTimeSlot.id,
        label: entry.bookingTimeSlot.label,
        value: entry.bookingTimeSlot.value,
        availabilityId: entry.id,
        status,
      };
    });
  },

  async listAvailableSlots(companyId: string, date: Date) {
    const slots = await this.listSlotsWithStatus(companyId, date);
    return slots.filter((slot) => slot.status === "available");
  },

  findAvailabilityForSlot(companyId: string, date: Date, bookingTimeSlotId: string) {
    return prisma.companyAvailability.findUnique({
      where: {
        companyId_date_bookingTimeSlotId: {
          companyId,
          date,
          bookingTimeSlotId,
        },
      },
      include: {
        booking: { select: { id: true, status: true } },
      },
    });
  },

  async isSlotAvailable(companyId: string, date: Date, slotLabel: string) {
    const slots = await this.listSlotsWithStatus(companyId, date);
    return slots.some((slot) => slot.label === slotLabel && slot.status === "available");
  },

  async removeForDate(companyId: string, date: Date) {
    const entries = await prisma.companyAvailability.findMany({
      where: { companyId, date },
      include: { booking: { select: { id: true, status: true } } },
    });

    const blocked = entries.filter(
      (entry) =>
        entry.booking &&
        ACTIVE_BOOKING_STATUSES.includes(entry.booking.status as BookingStatus),
    );

    if (blocked.length > 0) {
      return { removed: 0, blocked: blocked.length };
    }

    const result = await prisma.companyAvailability.deleteMany({
      where: { companyId, date },
    });

    return { removed: result.count, blocked: 0 };
  },

  async findNextBookableDate(companyId: string, fromDate?: Date): Promise<string | null> {
    const start = fromDate ?? parseDateOnly(minBookableDate());
    const end = new Date(start.getTime() + 60 * DAY_MS);

    const [scheduled, legacyBookings] = await Promise.all([
      prisma.companyAvailability.findMany({
        where: { companyId, date: { gte: start, lt: end } },
        include: {
          bookingTimeSlot: true,
          booking: { select: { id: true, status: true } },
        },
        orderBy: [{ date: "asc" }, { bookingTimeSlot: { sortOrder: "asc" } }],
      }),
      prisma.booking.findMany({
        where: {
          companyId,
          preferredDate: { gte: start, lt: end },
          status: { in: ACTIVE_BOOKING_STATUSES },
          availabilityId: null,
        },
        select: { preferredDate: true, preferredTime: true },
      }),
    ]);

    const entriesByDate = new Map<string, typeof scheduled>();
    for (const entry of scheduled) {
      const key = formatDateInput(entry.date);
      const list = entriesByDate.get(key) ?? [];
      list.push(entry);
      entriesByDate.set(key, list);
    }

    for (let offset = 0; offset < 60; offset += 1) {
      const date = new Date(start.getTime() + offset * DAY_MS);
      const dateStr = formatDateInput(date);
      const dayEnd = new Date(date.getTime() + DAY_MS);
      const entries = entriesByDate.get(dateStr) ?? [];

      const legacyBookedLabels = new Set(
        legacyBookings
          .filter((booking) => booking.preferredDate && booking.preferredDate >= date && booking.preferredDate < dayEnd)
          .map((booking) => booking.preferredTime)
          .filter(Boolean) as string[],
      );

      const hasAvailable = entries.some((entry) => {
        const isBooked =
          Boolean(
            entry.booking &&
              ACTIVE_BOOKING_STATUSES.includes(entry.booking.status as BookingStatus),
          ) || legacyBookedLabels.has(entry.bookingTimeSlot.label);
        const isPast = isSlotInPast(dateStr, entry.bookingTimeSlot.value);
        return !isBooked && !isPast;
      });

      if (hasAvailable) return dateStr;
    }

    return null;
  },

  countUpcoming(companyId: string, fromDate: Date) {
    return prisma.companyAvailability.count({
      where: { companyId, date: { gte: fromDate } },
    });
  },
};
