import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@/lib/auth";

import { signOutAction } from "@/actions/auth.actions";

import { companyRepository } from "@/repositories/company.repository";

import { productRepository } from "@/repositories/product.repository";

import { DashboardRouteShell } from "@/components/layout/dashboard-route-shell";

import { CompanyAccessGuard } from "@/components/layout/company-access-guard";

import { CompanyOnboardingGuard } from "@/components/layout/company-onboarding-guard";

import { COMPANY_NAV } from "@/lib/dashboard-nav";

import { getCompanyEffectivePlan } from "@/lib/plans/company-plan";

import { companyHasFeature } from "@/lib/plans/company-plan";

import { formatPlanLabel } from "@/lib/dashboard-themes";

import { getPrimaryProductPublicPath } from "@/lib/vendor-public-url";

import { getSiteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") redirect("/login");
  const site = await getSiteConfig();

  const company = await companyRepository.findByUserId(session.user.id);

  const plan = company ? getCompanyEffectivePlan(company) : null;

  const hasAi = company ? companyHasFeature(company, "ai_marketing_assistant") : false;

  const publishedProducts = company
    ? (await productRepository.listByCompany(company.id)).filter((p) => p.status === "PUBLISHED")
    : [];

  const previewHref =
    publishedProducts.length > 0
      ? getPrimaryProductPublicPath(publishedProducts[0]!.slug)
      : undefined;

  return (
    <>
      <CompanyOnboardingGuard paymentVerified={company?.paymentVerified ?? false} />
      <CompanyAccessGuard status={company?.status} />
      <DashboardRouteShell
        items={COMPANY_NAV}
        roleLabel="Growth Studio"
        profileHref="/company/settings"
        signOutAction={signOutAction}
        variant="company"
        siteName={site.name}
        topBar={{
          userName: company?.name,
          planLabel: formatPlanLabel(plan),
          previewHref,
          aiHref: hasAi ? "/company/ai" : "/company/settings",
        }}
      >
        {children}
      </DashboardRouteShell>
    </>
  );
}
