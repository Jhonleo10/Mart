import { prisma } from "@/lib/prisma";

export const wishlistRepository = {
  listByUser(userId: string) {
    return prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: { company: true, category: true, images: { take: 1 } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  toggle(userId: string, productId: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.wishlist.findUnique({
        where: { userId_productId: { userId, productId } },
      });
      if (existing) {
        await tx.wishlist.delete({ where: { id: existing.id } });
        return { added: false };
      }
      await tx.wishlist.create({ data: { userId, productId } });
      return { added: true };
    });
  },

  listProductIds(userId: string) {
    return prisma.wishlist.findMany({
      where: { userId },
      select: { productId: true },
    });
  },
};
