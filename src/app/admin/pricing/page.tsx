import { settingsRepository } from "@/repositories/settings.repository";
import { AdminPageHeader } from "@/components/admin/kanban-card";
import { PricingAdminForm } from "@/components/admin/pricing-admin-form";
import { requireDbQuery } from "@/lib/db/safe-query";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const plans = await requireDbQuery("adminPricing", () =>
    settingsRepository.getPricingPlansReadOnly(),
  );

  return (
    <div className="admin-page dash-page-enter space-y-5">
      <AdminPageHeader
        title="Pricing Management"
        description="Update plan details — changes reflect instantly on the home page"
      />
      <PricingAdminForm initialPlans={plans} />
    </div>
  );
}
