import { prisma } from "@/lib/prisma";
import { LEAD_STAGE_STATUSES, type LeadStage } from "@/lib/lead-stages";
import type { BookingStatus, Prisma } from "@prisma/client";

export const bookingRepository = {
  create(data: Prisma.BookingCreateInput) {
    return prisma.booking.create({ data });
  },

  findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: { product: true, company: true, user: true },
    });
  },

  listByCompany(companyId: string, status?: BookingStatus, take?: number) {
    return prisma.booking.findMany({
      where: { companyId, ...(status ? { status } : {}) },
      include: { product: true, user: true, demoMeeting: true },
      orderBy: { createdAt: "desc" },
      ...(take ? { take } : {}),
    });
  },

  listByCompanyPaginated(
    companyId: string,
    params: {
      page: number;
      limit: number;
      status?: BookingStatus;
      stage?: LeadStage;
      q?: string;
    },
  ) {
    const { page, limit, status, stage, q } = params;
    const stageStatuses = stage ? LEAD_STAGE_STATUSES[stage] : undefined;
    const where: Prisma.BookingWhereInput = {
      companyId,
      ...(stageStatuses
        ? { status: { in: stageStatuses } }
        : status
          ? { status }
          : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { product: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    return Promise.all([
      prisma.booking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { product: true, user: true, demoMeeting: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.count({ where }),
    ]);
  },

  listByUser(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      include: { product: { include: { company: true, images: { take: 1 } } } },
      orderBy: { createdAt: "desc" },
    });
  },

  listByUserPaginated(userId: string, params: { page: number; limit: number; status?: BookingStatus }) {
    const { page, limit, status } = params;
    const where: Prisma.BookingWhereInput = {
      userId,
      ...(status ? { status } : {}),
    };

    return Promise.all([
      prisma.booking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { product: { include: { company: true, images: { take: 1 } } }, demoMeeting: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.count({ where }),
    ]);
  },

  updateStatus(id: string, status: BookingStatus, meetingLink?: string | null) {
    return prisma.booking.update({
      where: { id },
      data: {
        status,
        ...(meetingLink !== undefined ? { meetingLink } : {}),
      },
    });
  },

  adminList(params: { page: number; limit: number }) {
    const { page, limit } = params;
    return Promise.all([
      prisma.booking.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { product: true, company: true, user: true },
      }),
      prisma.booking.count(),
    ]);
  },
};
