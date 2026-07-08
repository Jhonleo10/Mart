import { prisma } from "@/lib/prisma";

export const bookingTimeSlotRepository = {
  listAll() {
    return prisma.bookingTimeSlot.findMany({
      orderBy: { sortOrder: "asc" },
    });
  },

  listByCompany(companyId: string) {
    return prisma.bookingTimeSlot.findMany({
      where: { companies: { some: { companyId } } },
      orderBy: { sortOrder: "asc" },
    });
  },

  listSelectedIds(companyId: string) {
    return prisma.companyBookingSlot.findMany({
      where: { companyId },
      select: { bookingTimeSlotId: true },
    });
  },

  async setCompanySlots(companyId: string, slotIds: string[]) {
    await prisma.$transaction([
      prisma.companyBookingSlot.deleteMany({ where: { companyId } }),
      ...(slotIds.length > 0
        ? [
            prisma.companyBookingSlot.createMany({
              data: slotIds.map((bookingTimeSlotId) => ({
                companyId,
                bookingTimeSlotId,
              })),
            }),
          ]
        : []),
    ]);
  },
};
