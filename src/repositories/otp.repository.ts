import { prisma } from "@/lib/prisma";

export const otpRepository = {
  upsert(userId: string, otp: string, expires: Date) {
    return prisma.otpVerification.upsert({
      where: { userId },
      create: { userId, otp, expires, attempts: 0, lockedUntil: null },
      update: { otp, expires, attempts: 0, lockedUntil: null },
    });
  },

  findByUserId(userId: string) {
    return prisma.otpVerification.findUnique({ where: { userId } });
  },

  incrementAttempts(userId: string) {
    return prisma.otpVerification.update({
      where: { userId },
      data: { attempts: { increment: 1 } },
    });
  },

  setLockedUntil(userId: string, lockedUntil: Date) {
    return prisma.otpVerification.update({
      where: { userId },
      data: { lockedUntil },
    });
  },

  delete(userId: string) {
    return prisma.otpVerification.delete({ where: { userId } }).catch(() => null);
  },
};
