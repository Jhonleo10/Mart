import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AUTH_PATHS } from "@/lib/auth-paths";
import { companyRepository } from "@/repositories/company.repository";
import { companyHasFeature } from "@/lib/plans/company-plan";
import { requiredPlanLabel } from "@/lib/plans/vendor-features";
import {
  buildAiAudienceInsights,
  buildAiCompetitorInsights,
  buildAiMarketingInsights,
  buildCompanyAdvancedAnalytics,
} from "@/lib/company-analytics";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-stat-card";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { CompanyAiIntelligenceHub } from "@/components/company/company-ai-intelligence-hub";
import { buildCompanyOperationalSuggestions } from "@/lib/company-ai-suggestions";
import { companyAvailabilityRepository } from "@/repositories/company-availability.repository";
import { parseDateOnly } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default async function CompanyAiPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") redirect("/login");

  const company = await companyRepository.findByUserId(session.user.id);
  if (!company) redirect(AUTH_PATHS.companyRegister);
  if (company.status !== "APPROVED") redirect("/company/dashboard");

  const hasAi = companyHasFeature(company, "ai_marketing_assistant");
  const today = parseDateOnly(new Date().toISOString().slice(0, 10));
  const upcomingSlots = await companyAvailabilityRepository.countUpcoming(company.id, today);

  if (!hasAi) {
    return (
      <div className="animate-in fade-in">
        <DashboardPageHeader
          title="AI Intelligence"
          description="Pro plan tools for marketing, audience, and growth insights"
        />
        <DashboardPanel className="p-8 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-brand-blue" />
          <h2 className="mt-4 font-heading text-lg font-semibold text-slate-900">
            Upgrade to {requiredPlanLabel("ai_marketing_assistant")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Unlock AI Product Marketing Assistant, Audience Intelligence, Competitor Analysis, and
            AI Growth Dashboard.
          </p>
          <Link href="/company/settings?tab=plan" className="mt-6 inline-block">
            <Button>Upgrade plan</Button>
          </Link>
        </DashboardPanel>
      </div>
    );
  }

  const [marketing, audience, competitors, growth, operationalSuggestions] = await Promise.all([
    buildAiMarketingInsights(company.id),
    buildAiAudienceInsights(company.id),
    buildAiCompetitorInsights(company.id),
    buildCompanyAdvancedAnalytics(company.id),
    buildCompanyOperationalSuggestions(
      company.id,
      { selectedPlan: company.selectedPlan, subscriptions: company.subscriptions },
      { upcomingSlots },
    ),
  ]);

  return (
    <div className="dash-page-enter animate-in fade-in">
      <DashboardPageHeader
        title="AI Intelligence"
        description="Data-driven recommendations powered by your product and lead activity"
      />

      <CompanyAiIntelligenceHub
        suggestions={operationalSuggestions}
        marketing={marketing}
        audience={audience}
        competitors={competitors}
        growth={growth}
      />
    </div>
  );
}
