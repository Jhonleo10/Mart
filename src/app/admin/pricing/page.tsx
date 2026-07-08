import { settingsRepository } from "@/repositories/settings.repository";
import { AdminPageHeader } from "@/components/admin/kanban-card";
import { PricingAdminForm } from "@/components/admin/pricing-admin-form";

export default async function AdminPricingPage() {
  await settingsRepository.seedDefaults();
  const plans = await settingsRepository.getPricingPlans();

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
