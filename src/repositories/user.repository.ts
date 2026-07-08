import { prisma } from "@/lib/prisma";
import type { Prisma, Role, UserStatus } from "@prisma/client";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email }, include: { company: true } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id }, include: { company: true } });
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  },

  list(params: { page: number; limit: number; role?: Role; status?: UserStatus; q?: string }) {
    const { page, limit, role, status, q } = params;
    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    return Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { company: true },
      }),
      prisma.user.count({ where }),
    ]);
  },
};
