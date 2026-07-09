import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type UserSessionRecord = Prisma.UserSessionGetPayload<{
  include: { user: { select: { id: true; name: true; email: true; role: true } } };
}>;

export const userSessionRepository = {
  findActiveByUserId(userId: string) {
    return prisma.userSession.findFirst({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });
  },

  findValidByIdAndHash(sessionId: string, sessionTokenHash: string) {
    return prisma.userSession.findFirst({
      where: {
        id: sessionId,
        sessionTokenHash,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });
  },

  findByTokenHash(sessionTokenHash: string) {
    return prisma.userSession.findFirst({
      where: {
        sessionTokenHash,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });
  },

  create(data: Prisma.UserSessionCreateInput) {
    return prisma.userSession.create({ data });
  },

  touchSession(sessionId: string, expiresAt: Date) {
    return prisma.userSession.update({
      where: { id: sessionId },
      data: {
        lastActivity: new Date(),
        expiresAt,
      },
    });
  },

  deactivate(sessionId: string) {
    return prisma.userSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
  },

  deactivateAllForUser(userId: string) {
    return prisma.userSession.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
  },

  deactivateExpired() {
    return prisma.userSession.updateMany({
      where: {
        isActive: true,
        expiresAt: { lt: new Date() },
      },
      data: { isActive: false },
    });
  },

  listActive() {
    return prisma.userSession.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { lastActivity: "desc" },
    });
  },
};
