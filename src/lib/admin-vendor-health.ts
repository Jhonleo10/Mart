import { prisma } from "@/lib/prisma";
import { computeVendorHealthScore } from "@/lib/vendor-health-score";
import { getCompanyEffectivePlan } from "@/lib/plans/company-plan";
import { parseDateOnly } from "@/lib/date-utils";

export async function getVendorHealthScores(companyIds: string[]) {
  if (companyIds.length === 0) return new Map<string, ReturnType<typeof computeVendorHealthScore>>();

  const today = parseDateOnly(new Date().toISOString().slice(0, 10));

  const companies = await prisma.company.findMany({
    where: { id: { in: companyIds } },
    select: {
      id: true,
      status: true,
      description: true,
      logo: true,
      website: true,
      landingEnabled: true,
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      selectedPlan: true,
      _count: { select: { products: true, bookings: true } },
      products: {
        where: { status: "PUBLISHED" },
        select: { id: true, landingPage: { select: { status: true } } },
      },
      bookings: { select: { status: true } },
      availability: {
        where: { date: { gte: today } },
        take: 1,
        select: { id: true },
      },
    },
  });

  const map = new Map<string, ReturnType<typeof computeVendorHealthScore>>();

  for (const c of companies) {
    const contactedLeadCount = c.bookings.filter((b) =>
      ["CONTACTED", "QUALIFIED", "CONVERTED"].includes(b.status),
    ).length;

    map.set(
      c.id,
      computeVendorHealthScore({
        status: c.status,
        description: c.description,
        logo: c.logo,
        website: c.website,
        landingEnabled: c.landingEnabled,
        publishedLandingCount: c.products.filter((p) => p.landingPage?.status === "PUBLISHED").length,
        productCount: c._count.products,
        publishedCount: c.products.length,
        leadCount: c._count.bookings,
        contactedLeadCount,
        hasAvailability: c.availability.length > 0,
        plan: getCompanyEffectivePlan(c),
      }),
    );
  }

  return map;
}
