import { prisma } from "@/lib/prisma";
import type { MeetingStatus, MeetingReminderType, Prisma } from "@prisma/client";

const meetingInclude = {
  booking: {
    include: {
      product: true,
      company: true,
      user: true,
    },
  },
  history: { orderBy: { createdAt: "desc" as const }, take: 20 },
  reminders: true,
} satisfies Prisma.DemoMeetingInclude;

export const companyGoogleRepository = {
  findByCompanyId(companyId: string) {
    return prisma.companyGoogleCalendar.findUnique({ where: { companyId } });
  },

  upsert(
    companyId: string,
    data: {
      googleEmail: string;
      accessToken: string;
      refreshToken: string;
      tokenExpiry: Date | null;
      scope: string;
    },
  ) {
    return prisma.companyGoogleCalendar.upsert({
      where: { companyId },
      create: { companyId, ...data },
      update: { ...data, connectedAt: new Date() },
    });
  },

  updateTokens(
    companyId: string,
    data: { accessToken: string; refreshToken: string; tokenExpiry: Date | null },
  ) {
    return prisma.companyGoogleCalendar.update({
      where: { companyId },
      data,
    });
  },

  delete(companyId: string) {
    return prisma.companyGoogleCalendar.delete({ where: { companyId } });
  },
};

export const meetingRepository = {
  findById(id: string) {
    return prisma.demoMeeting.findUnique({
      where: { id },
      include: meetingInclude,
    });
  },

  findByBookingId(bookingId: string) {
    return prisma.demoMeeting.findUnique({
      where: { bookingId },
      include: meetingInclude,
    });
  },

  async hasOverlap(
    companyId: string,
    start: Date,
    end: Date,
    excludeMeetingId?: string,
  ): Promise<boolean> {
    const meetings = await prisma.demoMeeting.findMany({
      where: {
        companyId,
        status: "SCHEDULED",
        ...(excludeMeetingId ? { id: { not: excludeMeetingId } } : {}),
      },
      select: { scheduledAt: true, durationMinutes: true },
    });

    return meetings.some((m) => {
      const conflictEnd = new Date(m.scheduledAt.getTime() + m.durationMinutes * 60 * 1000);
      return m.scheduledAt < end && conflictEnd > start;
    });
  },

  create(data: Prisma.DemoMeetingCreateInput) {
    return prisma.demoMeeting.create({ data, include: meetingInclude });
  },

  update(id: string, data: Prisma.DemoMeetingUpdateInput) {
    return prisma.demoMeeting.update({
      where: { id },
      data,
      include: meetingInclude,
    });
  },

  addHistory(
    meetingId: string,
    action: string,
    actorId?: string,
    actorRole?: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    return prisma.meetingHistory.create({
      data: { meetingId, action, actorId, actorRole, metadata },
    });
  },

  markReminderSent(meetingId: string, type: MeetingReminderType) {
    return prisma.meetingReminder.upsert({
      where: { meetingId_type: { meetingId, type } },
      create: { meetingId, type },
      update: { sentAt: new Date() },
    });
  },

  listByCompany(
    companyId: string,
    params?: { status?: MeetingStatus; from?: Date; to?: Date },
  ) {
    return prisma.demoMeeting.findMany({
      where: {
        companyId,
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.from || params?.to
          ? {
              scheduledAt: {
                ...(params.from ? { gte: params.from } : {}),
                ...(params.to ? { lte: params.to } : {}),
              },
            }
          : {}),
      },
      include: meetingInclude,
      orderBy: { scheduledAt: "asc" },
    });
  },

  listByUser(userId: string, params?: { status?: MeetingStatus }) {
    return prisma.demoMeeting.findMany({
      where: {
        booking: { userId },
        ...(params?.status ? { status: params.status } : {}),
      },
      include: meetingInclude,
      orderBy: { scheduledAt: "desc" },
    });
  },

  listByUserPaginated(
    userId: string,
    params: { page: number; limit: number; status?: MeetingStatus; tab?: string },
  ) {
    const { page, limit, status, tab } = params;
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    let scheduledAtFilter: Prisma.DateTimeFilter | undefined;
    if (tab === "today") {
      scheduledAtFilter = { gte: startOfDay, lte: endOfDay };
    } else if (tab === "upcoming") {
      scheduledAtFilter = { gte: now };
    }

    const where: Prisma.DemoMeetingWhereInput = {
      booking: { userId },
      ...(status ? { status } : {}),
      ...(scheduledAtFilter ? { scheduledAt: scheduledAtFilter } : {}),
      ...(tab === "upcoming" ? { status: "SCHEDULED" } : {}),
      ...(tab === "completed" ? { status: "COMPLETED" } : {}),
      ...(tab === "cancelled" ? { status: "CANCELLED" } : {}),
    };

    return Promise.all([
      prisma.demoMeeting.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: meetingInclude,
        orderBy: { scheduledAt: "desc" },
      }),
      prisma.demoMeeting.count({ where }),
    ]);
  },

  listByCompanyPaginated(
    companyId: string,
    params: { page: number; limit: number; status?: MeetingStatus; tab?: string; q?: string },
  ) {
    const { page, limit, status, tab, q } = params;
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const where: Prisma.DemoMeetingWhereInput = {
      companyId,
      ...(status ? { status } : {}),
      ...(tab === "today"
        ? { scheduledAt: { gte: startOfDay, lte: endOfDay }, status: "SCHEDULED" }
        : {}),
      ...(tab === "upcoming" ? { scheduledAt: { gte: now }, status: "SCHEDULED" } : {}),
      ...(tab === "completed" ? { status: "COMPLETED" } : {}),
      ...(tab === "cancelled" ? { status: "CANCELLED" } : {}),
      ...(q
        ? {
            OR: [
              { booking: { name: { contains: q, mode: "insensitive" } } },
              { booking: { email: { contains: q, mode: "insensitive" } } },
              { booking: { product: { name: { contains: q, mode: "insensitive" } } } },
            ],
          }
        : {}),
    };

    return Promise.all([
      prisma.demoMeeting.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: meetingInclude,
        orderBy: { scheduledAt: "desc" },
      }),
      prisma.demoMeeting.count({ where }),
    ]);
  },

  adminList(params: { page: number; limit: number; status?: MeetingStatus; q?: string }) {
    const { page, limit, status, q } = params;
    const where: Prisma.DemoMeetingWhereInput = {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { booking: { name: { contains: q, mode: "insensitive" } } },
              { booking: { email: { contains: q, mode: "insensitive" } } },
              { company: { name: { contains: q, mode: "insensitive" } } },
              { booking: { product: { name: { contains: q, mode: "insensitive" } } } },
            ],
          }
        : {}),
    };

    return Promise.all([
      prisma.demoMeeting.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: meetingInclude,
        orderBy: { scheduledAt: "desc" },
      }),
      prisma.demoMeeting.count({ where }),
    ]);
  },

  findDueForReminders(type: MeetingReminderType, windowMinutes?: number) {
    const now = Date.now();
    const targetMs =
      type === "REMINDER_24H"
        ? 24 * 60 * 60 * 1000
        : type === "REMINDER_30M"
          ? 30 * 60 * 1000
          : 5 * 60 * 1000;
    const tolerance =
      (windowMinutes ?? (type === "REMINDER_5M" ? 3 : 10)) * 60 * 1000;
    const from = new Date(now + targetMs - tolerance);
    const to = new Date(now + targetMs + tolerance);

    return prisma.demoMeeting.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { gte: from, lte: to },
        reminders: { none: { type } },
      },
      include: meetingInclude,
    });
  },

  async getAnalytics() {
    const [total, scheduled, completed, cancelled] = await Promise.all([
      prisma.demoMeeting.count(),
      prisma.demoMeeting.count({ where: { status: "SCHEDULED" } }),
      prisma.demoMeeting.count({ where: { status: "COMPLETED" } }),
      prisma.demoMeeting.count({ where: { status: "CANCELLED" } }),
    ]);

    const byVendor = await prisma.demoMeeting.groupBy({
      by: ["companyId"],
      _count: { id: true },
      where: { status: "COMPLETED" },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    return {
      total,
      scheduled,
      completed,
      cancelled,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      cancellationRate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
      topVendors: byVendor,
    };
  },
};
