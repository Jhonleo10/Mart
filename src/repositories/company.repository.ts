import { prisma } from "@/lib/prisma";
import type { CompanyStatus, Prisma } from "@prisma/client";

export const companyRepository = {
  findByUserId(userId: string) {
    return prisma.company.findUnique({
      where: { userId },
      include: { user: true, subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
  },

  findById(id: string) {
    return prisma.company.findUnique({
      where: { id },
      include: { user: true, products: true },
    });
  },

  findBySlug(slug: string) {
    return prisma.company.findUnique({
      where: { slug },
      include: {
        subscriptions: {
          where: { status: "ACTIVE", endDate: { gt: new Date() } },
          orderBy: { endDate: "desc" },
          take: 1,
        },
        products: {
          where: { status: "PUBLISHED" },
          include: { category: true, images: { take: 1 } },
          orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
        },
      },
    });
  },

  create(data: Prisma.CompanyCreateInput) {
    return prisma.company.create({ data });
  },

  update(id: string, data: Prisma.CompanyUpdateInput) {
    return prisma.company.update({ where: { id }, data });
  },

  list(params: {
    page: number;
    limit: number;
    status?: CompanyStatus;
    q?: string;
    industry?: string;
    paymentVerified?: boolean;
  }) {
    const { page, limit, status, q, industry, paymentVerified } = params;
    const where: Prisma.CompanyWhereInput = {
      ...(status ? { status } : {}),
      ...(industry ? { industry: { contains: industry, mode: "insensitive" } } : {}),
      ...(paymentVerified !== undefined ? { paymentVerified } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { contactEmail: { contains: q, mode: "insensitive" } },
              { industry: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    return Promise.all([
      prisma.company.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: true, _count: { select: { products: true, bookings: true } } },
      }),
      prisma.company.count({ where }),
    ]);
  },

  countByStatus() {
    return prisma.company.groupBy({ by: ["status"], _count: true });
  },
};
