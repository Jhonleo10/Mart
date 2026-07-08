import { prisma } from "@/lib/prisma";

export const categoryRepository = {
  list() {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  },

  listWithProductCounts() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: {
              where: { status: "PUBLISHED", company: { status: "APPROVED" } },
            },
          },
        },
      },
    });
  },

  findBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } });
  },

  create(name: string, slug: string, description?: string) {
    return prisma.category.create({ data: { name, slug, description } });
  },
};
