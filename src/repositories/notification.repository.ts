import { prisma } from "@/lib/prisma";

export const notificationRepository = {
  create(userId: string, title: string, message: string, link?: string) {
    return prisma.notification.create({
      data: { userId, title, message, link },
    });
  },

  listByUser(userId: string, unreadOnly = false) {
    return prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { read: false } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  },

  markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  },

  markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },
};

export { auditLogRepository } from "@/repositories/audit-log.repository";
export { categoryRepository } from "@/repositories/category.repository";
export { wishlistRepository } from "@/repositories/wishlist.repository";
