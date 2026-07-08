import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getRequirementProfile } from "@/actions/intelligence.actions";
import { RequirementWizard } from "@/components/intelligence/dynamic-requirement-wizard";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-stat-card";

export default async function UserRequirementsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await getRequirementProfile();

  return (
    <div className="dash-page-enter">
      <DashboardPageHeader
        title="Requirement Builder"
        description="Answer a few questions — we turn your needs into a smart search query and scored product matches."
      />
      <RequirementWizard
        initial={
          profile
            ? {
                industry: profile.industry ?? undefined,
                businessSize: profile.businessSize ?? undefined,
                budgetMax: profile.budgetMax ?? undefined,
                requiredFeatures: profile.requiredFeatures,
                preferredIntegrations: profile.preferredIntegrations,
                companyType: profile.companyType ?? undefined,
                deploymentPreference: profile.deploymentPreference ?? undefined,
                country: profile.country ?? undefined,
              }
            : null
        }
      />
    </div>
  );
}
