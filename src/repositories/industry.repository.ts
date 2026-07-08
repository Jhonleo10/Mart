import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const industryRepository = {
  list() {
    return prisma.industry.findMany({ orderBy: { name: "asc" } });
  },

  findBySlug(slug: string) {
    return prisma.industry.findUnique({ where: { slug } });
  },

  create(data: Prisma.IndustryCreateInput) {
    return prisma.industry.create({ data });
  },

  update(id: string, data: Prisma.IndustryUpdateInput) {
    return prisma.industry.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.industry.delete({ where: { id } });
  },

  adminList(params: { page: number; limit: number; q?: string }) {
    const { page, limit, q } = params;
    const where: Prisma.IndustryWhereInput = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};
    return Promise.all([
      prisma.industry.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
      }),
      prisma.industry.count({ where }),
    ]);
  },
};
