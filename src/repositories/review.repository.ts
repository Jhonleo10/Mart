import { prisma } from "@/lib/prisma";

export const reviewRepository = {
  upsertFromMeetingFeedback(input: {
    productId: string;
    userId: string;
    rating: number;
    comment: string;
  }) {
    return prisma.review.upsert({
      where: {
        productId_userId: {
          productId: input.productId,
          userId: input.userId,
        },
      },
      create: {
        productId: input.productId,
        userId: input.userId,
        rating: input.rating,
        comment: input.comment,
      },
      update: {
        rating: input.rating,
        comment: input.comment,
      },
    });
  },

  findByProductAndUser(productId: string, userId: string) {
    return prisma.review.findUnique({
      where: {
        productId_userId: { productId, userId },
      },
    });
  },
};
