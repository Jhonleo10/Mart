import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getVendorPublicPath } from "@/lib/vendor-public-url";
import { Badge } from "@/components/ui/badge";
import { PageHeader, PageSection } from "@/components/layout/page-shell";
import { buildPageMetadata } from "@/lib/seo";
import { safeDbQuery } from "@/lib/db/safe-query";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Software Companies",
    description:
      "Browse verified B2B software vendors on Genius Mart. Compare companies, explore products, and book live demos.",
    path: "/companies",
  });
}

export default async function CompaniesPage() {
  const companies = await safeDbQuery(
    "companiesList",
    () =>
      prisma.company.findMany({
        where: { status: "APPROVED" },
        include: {
          _count: { select: { products: { where: { status: "PUBLISHED" } } } },
          subscriptions: {
            where: { status: "ACTIVE", endDate: { gt: new Date() } },
            orderBy: { endDate: "desc" },
            take: 1,
          },
        },
        orderBy: { name: "asc" },
      }),
    [],
  );

  return (
    <PageSection>
      <PageHeader
        title="Software Companies"
        description="Browse verified software companies on our platform"
      />

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {companies.map((company) => (
          <Link
            key={company.id}
            href={getVendorPublicPath(company)}
            className="glass-card block rounded-2xl p-5 transition-all hover:-translate-y-0.5 sm:p-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-blue/10 font-bold text-brand-blue">
                {company.logo ? (
                  <Image src={company.logo} alt={company.name} width={48} height={48} />
                ) : (
                  company.name.charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <h3 className="break-safe font-heading font-semibold text-slate-900">{company.name}</h3>
                <Badge variant="secondary" className="mt-1">
                  {company.industry}
                </Badge>
              </div>
            </div>
            <p className="mt-4 line-clamp-2 text-sm text-slate-500">{company.description}</p>
            <p className="mt-3 text-xs text-slate-400">
              {company._count.products} product{company._count.products !== 1 ? "s" : ""}
            </p>
          </Link>
        ))}
      </div>
    </PageSection>
  );
}
