import { prisma } from "@/lib/prisma";

export const auditLogRepository = {
  create(data: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    metadata?: object;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.auditLog.create({ data });
  },
};
