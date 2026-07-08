import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { companyRepository } from "@/repositories/company.repository";
import { AUTH_PATHS } from "@/lib/auth-paths";
import { getPricingPlansForDisplay } from "@/services/site-settings.service";
import { getRazorpayCredentials } from "@/lib/razorpay";
import { getCompanyEffectivePlan } from "@/lib/plans/company-plan";
import { getVendorUpgradePlans } from "@/lib/plans/plan-catalog";
import { getVendorDisplayPlans } from "@/lib/settings/pricing";
import { CompanySettingsTabs } from "@/components/company/company-settings-tabs";
import { getVendorPublicPath, getPrimaryProductPublicPath } from "@/lib/vendor-public-url";
import { productRepository } from "@/repositories/product.repository";
import { companyGoogleRepository } from "@/repositories/meeting.repository";
import { isGoogleOAuthConfigured } from "@/lib/google/oauth";

function formatDate(date: Date | null | undefined) {
  if (!date) return null;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function CompanySettingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") redirect("/login");

  const company = await companyRepository.findByUserId(session.user.id);
  if (!company) redirect(AUTH_PATHS.companyRegister);

  const [pricingPlans, creds, googleConnection, allProducts] = await Promise.all([
    getPricingPlansForDisplay(),
    getRazorpayCredentials(),
    companyGoogleRepository.findByCompanyId(company.id),
    productRepository.listByCompany(company.id),
  ]);

  const publishedProducts = allProducts.filter((p) => p.status === "PUBLISHED");
  const paymentConfigured = Boolean(creds.keyId && creds.keySecret);
  const currentPlan = getCompanyEffectivePlan(company);
  const allVendorPlans = getVendorDisplayPlans(pricingPlans);
  const upgradePlans = getVendorUpgradePlans(
    pricingPlans,
    currentPlan,
    company.paymentVerified,
  );
  const activeSub = company.subscriptions?.[0];

  const publicProfileHref = getVendorPublicPath(company);
  const marketplacePreviewHref = publishedProducts[0]
    ? getPrimaryProductPublicPath(publishedProducts[0].slug)
    : null;

  return (
    <div className="dash-page-enter company-settings-page animate-in fade-in">
      <CompanySettingsTabs
        companyName={company.name}
        publicProfileHref={publicProfileHref}
        marketplacePreviewHref={marketplacePreviewHref}
        profileDefaults={{
          name: company.name,
          website: company.website ?? "",
          description: company.description ?? "",
          industry: company.industry ?? "",
          contactEmail: company.contactEmail,
          contactPhone: company.contactPhone ?? "",
          logo: company.logo ?? "",
          ownerName: company.ownerName ?? session.user.name ?? undefined,
        }}
        planProps={{
          allVendorPlans,
          upgradePlans,
          currentPlan,
          paymentVerified: company.paymentVerified,
          paymentConfigured,
          subscriptionEndDate: formatDate(activeSub?.endDate),
        }}
        usage={{
          plan: currentPlan,
          productCount: allProducts.length,
          publishedCount: publishedProducts.length,
          spotlightUsed: allProducts.filter((p) => p.featured && p.status === "PUBLISHED").length,
        }}
        googleProps={{
          connected: Boolean(googleConnection),
          googleEmail: googleConnection?.googleEmail,
          configured: isGoogleOAuthConfigured(),
        }}
      />
    </div>
  );
}
