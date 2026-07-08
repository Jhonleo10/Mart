import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AUTH_PATHS } from "@/lib/auth-paths";
import { companyRepository } from "@/repositories/company.repository";
import { productRepository } from "@/repositories/product.repository";
import { bookingRepository } from "@/repositories/booking.repository";
import { companyHasFeature } from "@/lib/plans/company-plan";
import { requiredPlanLabel } from "@/lib/plans/vendor-features";
import { buildCompanyAdvancedAnalytics } from "@/lib/company-analytics";
import { DashboardPageHeader, DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { Button } from "@/components/ui/button";
import { BarChart3, Eye, Users, Lock } from "lucide-react";

export default async function CompanyAnalyticsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") redirect("/login");

  const company = await companyRepository.findByUserId(session.user.id);
  if (!company) redirect(AUTH_PATHS.companyRegister);

  const products = await productRepository.listByCompany(company.id);
  const leads = await bookingRepository.listByCompany(company.id);
  const totalViews = products.reduce((sum, p) => sum + p.viewCount, 0);
  const conversionRate = totalViews > 0 ? ((leads.length / totalViews) * 100).toFixed(1) : "0";
  const popular = [...products].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);

  const hasAdvanced = companyHasFeature(company, "advanced_analytics");
  const advanced = hasAdvanced ? await buildCompanyAdvancedAnalytics(company.id) : null;

  return (
    <div className="animate-in fade-in">
      <DashboardPageHeader
        title="Analytics"
        description="Performance metrics for your products and leads"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardStatCard
          title="Product Views"
          value={totalViews}
          status="All time"
          statusVariant="muted"
          icon={<Eye className="h-5 w-5" />}
        />
        <DashboardStatCard
          title="Lead Count"
          value={leads.length}
          status={leads.length > 0 ? "Active" : "No leads yet"}
          statusVariant={leads.length > 0 ? "green" : "muted"}
          icon={<Users className="h-5 w-5" />}
          accent="green"
        />
        <DashboardStatCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          status="Views to leads"
          statusVariant="blue"
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </div>

      <DashboardPanel className="mt-6 p-5 sm:p-6">
        <h2 className="font-heading font-semibold text-slate-900">Popular Products</h2>
        <div className="mt-4 space-y-3">
          {popular.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap justify-between gap-2 border-b border-slate-100/80 pb-2 last:border-0"
            >
              <span className="font-medium text-slate-900">{p.name}</span>
              <span className="text-sm text-slate-500">
                {p.viewCount} views · {p._count.bookings} leads
              </span>
            </div>
          ))}
          {popular.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500">No product data yet.</p>
          )}
        </div>
      </DashboardPanel>

      {hasAdvanced && advanced ? (
        <div className="mt-6 space-y-4">
          <h2 className="font-heading text-lg font-semibold text-slate-900">Advanced analytics (Growth+)</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <DashboardPanel className="p-5">
              <p className="text-sm font-medium text-slate-700">Last 30 days</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{advanced.totalViews30d} views</p>
              <p className="text-lg text-brand-green">{advanced.totalLeads30d} demo leads</p>
            </DashboardPanel>
            <DashboardPanel className="p-5">
              <p className="text-sm font-medium text-slate-700">Lead pipeline</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {Object.entries(advanced.leadStatusBreakdown).map(([status, count]) => (
                  <li key={status}>
                    {status}: <strong>{count}</strong>
                  </li>
                ))}
              </ul>
            </DashboardPanel>
          </div>
          <DashboardPanel className="p-5">
            <p className="text-sm font-medium text-slate-700">Trending scores by product</p>
            <ul className="mt-3 space-y-2">
              {advanced.productScores.slice(0, 8).map((p) => (
                <li key={p.id} className="flex justify-between gap-2 text-sm">
                  <span>{p.name}</span>
                  <span className="text-slate-500">
                    Score {p.score}
                    {p.vsCategory !== null ? ` · ${p.vsCategory}% vs category avg` : null}
                  </span>
                </li>
              ))}
            </ul>
          </DashboardPanel>
          {companyHasFeature(company, "ai_growth_dashboard") && (
            <Link href="/company/ai">
              <Button variant="outline">Open full AI Growth Dashboard</Button>
            </Link>
          )}
        </div>
      ) : (
        <DashboardPanel className="mt-6 flex items-start gap-3 p-5 text-sm">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
          <div>
            <p className="font-medium text-slate-900">Advanced analytics locked</p>
            <p className="mt-1 text-slate-500">
              Upgrade to the {requiredPlanLabel("advanced_analytics")} plan for 30-day funnels,
              category benchmarks, and trending scores.
            </p>
            <Link href="/company/settings" className="mt-3 inline-block">
              <Button size="sm">Upgrade</Button>
            </Link>
          </div>
        </DashboardPanel>
      )}
    </div>
  );
}
