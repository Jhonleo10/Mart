import { prisma } from "@/lib/prisma";
import { getInitials } from "@/lib/utils";
import type { ActivityItem, ActivityType } from "@/components/dashboard/activity-feed";

const ACTIVITY_PAGE_SIZE = 20;

export { ACTIVITY_PAGE_SIZE };

function parseDateStart(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function parseDateEnd(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(`${value}T23:59:59.999Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function inDateRange(createdAt: Date, from?: Date, to?: Date) {
  if (from && createdAt < from) return false;
  if (to && createdAt > to) return false;
  return true;
}

export async function getAdminActivity(options: {
  limit?: number;
  page?: number;
  type?: ActivityType;
  q?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const { limit, page = 1, type, q, dateFrom, dateTo } = options;
  const fetchLimit = limit ?? ACTIVITY_PAGE_SIZE;
  const search = q?.trim().toLowerCase();
  const from = parseDateStart(dateFrom);
  const to = parseDateEnd(dateTo);

  const [recentCompanies, recentProducts, recentBookings] = await Promise.all([
    type && type !== "company"
      ? Promise.resolve([])
      : prisma.company.findMany({
          take: 100,
          orderBy: { createdAt: "desc" },
          include: { user: true },
        }),
    type && type !== "product"
      ? Promise.resolve([])
      : prisma.product.findMany({
          take: 100,
          orderBy: { createdAt: "desc" },
          include: { company: true },
        }),
    type && type !== "booking"
      ? Promise.resolve([])
      : prisma.booking.findMany({
          take: 100,
          orderBy: { createdAt: "desc" },
          include: { product: true, company: true, user: true },
        }),
  ]);

  let items: ActivityItem[] = [
    ...recentCompanies.map((c) => ({
      id: `company-${c.id}`,
      type: "company" as const,
      initials: getInitials(c.name),
      title: c.name,
      description: `Company registered by ${c.user.name ?? c.user.email}`,
      status: c.status,
      createdAt: c.createdAt,
      href: "/admin/companies",
    })),
    ...recentProducts.map((p) => ({
      id: `product-${p.id}`,
      type: "product" as const,
      initials: getInitials(p.name),
      title: p.name,
      description: `Product submitted by ${p.company.name}`,
      status: p.status,
      createdAt: p.createdAt,
      href: "/admin/products",
    })),
    ...recentBookings.map((b) => {
      const productName = b.product?.name ?? "General inquiry";
      return {
        id: `booking-${b.id}`,
        type: "booking" as const,
        initials: getInitials(productName),
        title: productName,
        description: `Demo request from ${b.user?.name ?? b.user?.email ?? "Guest"} · ${b.company.name}`,
        status: b.status,
        createdAt: b.createdAt,
        href: "/admin/analytics",
      };
    }),
  ]
    .filter((item) => inDateRange(item.createdAt, from, to))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  if (search) {
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search),
    );
  }

  const total = items.length;

  if (limit !== undefined && !page) {
    items = items.slice(0, limit);
  } else {
    const start = (page - 1) * fetchLimit;
    items = items.slice(start, start + fetchLimit);
  }

  return { items, total };
}
