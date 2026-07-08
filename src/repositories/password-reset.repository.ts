import { prisma } from "@/lib/prisma";

export const passwordResetRepository = {
  create(userId: string, token: string, expires: Date) {
    return prisma.passwordReset.create({
      data: { userId, token, expires },
    });
  },

  findValid(token: string) {
    return prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expires: { gt: new Date() },
      },
      include: { user: true },
    });
  },

  markUsed(id: string) {
    return prisma.passwordReset.update({
      where: { id },
      data: { used: true },
    });
  },

  invalidateForUser(userId: string) {
    return prisma.passwordReset.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });
  },
};
