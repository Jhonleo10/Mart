import { prisma } from "@/lib/prisma";

export interface PendingCompanyRegistrationData {
  razorpayOrderId: string;
  planId: string;
  email: string;
  hashedPassword: string;
  companyName: string;
  ownerName: string;
  phone: string;
  website: string | null;
  industry: string;
  slug: string;
  expiresAt: Date;
}

export const pendingCompanyRegistrationRepository = {
  create(data: PendingCompanyRegistrationData) {
    return prisma.pendingCompanyRegistration.create({ data });
  },

  findByOrderId(orderId: string) {
    return prisma.pendingCompanyRegistration.findUnique({
      where: { razorpayOrderId: orderId },
    });
  },

  deleteByOrderId(orderId: string) {
    return prisma.pendingCompanyRegistration.delete({
      where: { razorpayOrderId: orderId },
    }).catch(() => null);
  },

  deleteExpired() {
    return prisma.pendingCompanyRegistration.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  },
};
