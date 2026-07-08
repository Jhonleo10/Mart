import { prisma } from "@/lib/prisma";
import { paymentRepository } from "@/repositories/payment.repository";
import { getAdminActivity } from "@/lib/admin-activity";
export async function getAdminDashboardStats() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    companies,
    users,
    products,
    bookings,
    revenue,
    pendingCompanies,
    pendingProducts,
    approvedCompanies,
    publishedProducts,
    usersToday,
    companyStatus,
    productStatus,
    pendingCompanyRows,
    pendingProductRows,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.user.count(),
    prisma.product.count(),
    prisma.booking.count(),
    paymentRepository.totalRevenue(),
    prisma.company.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { status: "PUBLISHED", adminVerified: false } }),
    prisma.company.count({ where: { status: "APPROVED" } }),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.company.groupBy({ by: ["status"], _count: true }),
    prisma.product.groupBy({ by: ["status"], _count: true }),
    prisma.company.findMany({
      where: { status: "PENDING" },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        ownerName: true,
        industry: true,
        createdAt: true,
        selectedPlan: true,
      },
    }),
    prisma.product.findMany({
      where: { status: "PUBLISHED", adminVerified: false },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        company: { select: { name: true, slug: true } },
      },
    }),
  ]);
  const { items: activity } = await getAdminActivity({ limit: 3 });

  return {
    counts: {
      companies,
      users,
      products,
      bookings,
      revenue: revenue._sum.amount ?? 0,
      pendingCompanies,
      pendingProducts,
      approvedCompanies,
      publishedProducts,
      usersToday,
    },
    companyStatus: companyStatus.map((s) => ({ name: s.status, value: s._count })),
    productStatus: productStatus.map((s) => ({ name: s.status, value: s._count })),
    activity,
    pendingTotal: pendingCompanies + pendingProducts,
    pendingCompanyRows,
    pendingProductRows,
  };
}

export async function getAnalyticsData(days = 30) {
  const since = new Date(Date.now() - days * 86400000);

  const [companyStatus, productStatus, roleCounts, revenue, bookings, newUsers, newCompanies] =
    await Promise.all([
      prisma.company.groupBy({ by: ["status"], _count: true }),
      prisma.product.groupBy({ by: ["status"], _count: true }),
      prisma.user.groupBy({ by: ["role"], _count: true }),
      prisma.payment.aggregate({
        where: { status: "COMPLETED", createdAt: { gte: since } },
        _sum: { amount: true },
      }),
      prisma.booking.count({ where: { createdAt: { gte: since } } }),
      prisma.user.count({ where: { createdAt: { gte: since } } }),
      prisma.company.count({ where: { createdAt: { gte: since } } }),
    ]);

  return {
    companyStatus: companyStatus.map((s) => ({ name: s.status, value: s._count })),
    productStatus: productStatus.map((s) => ({ name: s.status, value: s._count })),
    roleCounts: roleCounts.map((r) => ({ name: r.role, value: r._count })),
    revenue: revenue._sum.amount ?? 0,
    bookings,
    newUsers,
    newCompanies,
  };
}
