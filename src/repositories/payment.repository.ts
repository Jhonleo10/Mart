import { prisma } from "@/lib/prisma";
import type { PaymentStatus, PaymentType, Prisma } from "@prisma/client";

export const paymentRepository = {
  create(data: Prisma.PaymentCreateInput) {
    return prisma.payment.create({ data });
  },

  findByOrderId(orderId: string) {
    return prisma.payment.findUnique({ where: { razorpayOrderId: orderId } });
  },

  update(id: string, data: Prisma.PaymentUpdateInput) {
    return prisma.payment.update({ where: { id }, data });
  },

  listByCompany(companyId: string) {
    return prisma.payment.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
  },

  adminList(params: {
    page: number;
    limit: number;
    status?: PaymentStatus;
    type?: PaymentType;
    companyId?: string;
  }) {
    const { page, limit, status, type, companyId } = params;
    const where: Prisma.PaymentWhereInput = {
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
      ...(companyId ? { companyId } : {}),
    };
    return Promise.all([
      prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { company: true },
      }),
      prisma.payment.count({ where }),
    ]);
  },

  totalRevenue(companyId?: string) {
    return prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
        ...(companyId ? { companyId } : {}),
      },
      _sum: { amount: true },
    });
  },

  revenueByCompany() {
    return prisma.payment.groupBy({
      by: ["companyId"],
      where: { status: "COMPLETED" },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 10,
    });
  },
};
