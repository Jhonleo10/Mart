import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { AUTH_PATHS } from "@/lib/auth-paths";
import { companyRepository } from "@/repositories/company.repository";
import { productRepository } from "@/repositories/product.repository";
import { bookingRepository } from "@/repositories/booking.repository";
import { companyAvailabilityRepository } from "@/repositories/company-availability.repository";
import { parseDateOnly } from "@/lib/date-utils";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { DonutStatusCard } from "@/components/dashboard/dynamic-dashboard-widgets";
import { ActivityFeed, type ActivityItem } from "@/components/dashboard/activity-feed";
import { QuickActionsCard } from "@/components/dashboard/dashboard-panels";
import { CompanyDashboardCompactBar } from "@/components/company/company-dashboard-compact-bar";
import { AiScoreBadge } from "@/components/company/ai-insight-strip";
import { Package, Users, Eye, BarChart3, Plus, Calendar, AlertTriangle, ExternalLink } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { buildCompanySetupSteps } from "@/lib/company-setup";
import { getCompanyEffectivePlan, companyHasFeature, productLimitForPlan } from "@/lib/plans/company-plan";
import {
  getCompanyDashboardAiInsight,
  getCompanyAiProductScores,
} from "@/lib/company-ai-dashboard";
import { buildCompanyOperationalSuggestions } from "@/lib/company-ai-suggestions";
import { LEAD_STAGE_STATUSES } from "@/lib/lead-stages";
import { getPrimaryProductPublicPath } from "@/lib/vendor-public-url";

export default async function CompanyDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") redirect("/login");

  const company = await companyRepository.findByUserId(session.user.id);
  if (!company) redirect(AUTH_PATHS.companyRegister);

  const products = await productRepository.listByCompany(company.id);
  const leads = await bookingRepository.listByCompany(company.id);
  const today = parseDateOnly(new Date().toISOString().slice(0, 10));
  const upcomingAvailability = await companyAvailabilityRepository.countUpcoming(
    company.id,
    today,
  );
  const totalViews = products.reduce((sum, p) => sum + p.viewCount, 0);
  const published = products.filter((p) => p.status === "PUBLISHED").length;
  const pending = products.filter((p) => p.status === "PUBLISHED" && !p.adminVerified).length;
  const plan = getCompanyEffectivePlan(company);
  const hasAi = companyHasFeature(company, "ai_marketing_assistant");

  const [aiInsight, aiScores, operationalSuggestions] = await Promise.all([
    getCompanyDashboardAiInsight(company.id, hasAi),
    hasAi ? getCompanyAiProductScores(company.id) : Promise.resolve([]),
    buildCompanyOperationalSuggestions(
      company.id,
      {
        selectedPlan: company.selectedPlan,
        subscriptions: company.subscriptions,
      },
      { upcomingSlots: upcomingAvailability },
    ),
  ]);

  if (company.status !== "APPROVED") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <StatusBadge status={company.status} />
        <h1 className="mt-4 font-heading text-2xl font-bold text-slate-900">Account Pending Approval</h1>
        <p className="mt-2 max-w-md text-slate-500">
          Your company registration is being reviewed. You&apos;ll receive an email once approved.
        </p>
        {company.status === "PENDING" && (
          <Link href="/company/settings" className="mt-6">
            <Button>Complete registration in Settings</Button>
          </Link>
        )}
      </div>
    );
  }

  const setupSteps = buildCompanySetupSteps({
    id: company.id,
    slug: company.slug,
    description: company.description,
    logo: company.logo,
    products: products.map((p) => ({ id: p.id, status: p.status })),
    publishedCount: published,
    hasAvailability: upcomingAvailability > 0,
    plan,
  });

  const firstPublished = products.find((p) => p.status === "PUBLISHED");
  const previewHref = firstPublished
    ? getPrimaryProductPublicPath(firstPublished.slug)
    : undefined;

  const productStatus = [
    { name: "Published", value: published },
    { name: "Awaiting badge", value: pending },
    { name: "Other", value: Math.max(0, products.length - published - pending) },
  ].filter((s) => s.value > 0);

  const activity: ActivityItem[] = [
    ...leads.slice(0, 4).map((l) => ({
      id: l.id,
      initials: getInitials(l.name),
      title: l.name,
      description: `Lead for ${l.product?.name ?? "General inquiry"}`,
      status: l.status,
      createdAt: l.createdAt,
      href: "/company/leads",
    })),
    ...products.slice(0, 3).map((p) => ({
      id: p.id,
      initials: getInitials(p.name),
      title: p.name,
      description: `${p.viewCount} views · ${p._count.bookings} leads`,
      status: p.status,
      createdAt: p.createdAt,
      href: `/company/products/${p.id}/edit`,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  const conversionRate = totalViews > 0 ? ((leads.length / totalViews) * 100).toFixed(1) : "0";
  const publishedProducts = published > 0;
  const needsAvailabilitySetup = publishedProducts && upcomingAvailability === 0;

  const leadPipeline = {
    new: leads.filter((l) => LEAD_STAGE_STATUSES.new.includes(l.status)).length,
    contacted: leads.filter((l) => LEAD_STAGE_STATUSES.contacted.includes(l.status)).length,
    closed: leads.filter((l) => LEAD_STAGE_STATUSES.closed.includes(l.status)).length,
  };

  return (
    <div className="dash-page-enter animate-in fade-in">
      <div className="company-dashboard-hero relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-brand-blue-dark to-brand-blue px-6 py-8 text-white sm:px-8">
        <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-brand-green/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-white/75">Genius Mart · Vendor dashboard</p>
            <h1 className="font-heading mt-1 text-2xl font-bold sm:text-3xl">Welcome back, {company.name}</h1>
            <p className="mt-2 max-w-lg text-sm text-white/85">
              {published} live product{published === 1 ? "" : "s"} · {leads.length} lead{leads.length === 1 ? "" : "s"} · {plan ?? "No"} plan
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {previewHref && (
              <Link
                href={previewHref}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/25"
              >
                <ExternalLink className="h-4 w-4" />
                Marketplace preview
              </Link>
            )}
            <Link
              href="/company/products/new"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-green/25 hover:bg-brand-green-dark"
            >
              <Plus className="h-4 w-4" />
              Add product
            </Link>
          </div>
        </div>
      </div>

      {needsAvailabilitySetup && (
        <div className="mb-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium">Set up demo availability</p>
            <p className="mt-1 text-amber-800/90">
              You have published products but no open demo slots. Buyers cannot book demos until
              you schedule availability.
            </p>
            <Link href="/company/availability" className="mt-2 inline-block font-medium text-amber-900 underline">
              Open availability settings
            </Link>
          </div>
        </div>
      )}

      <div className="company-pipeline-strip mb-5 grid grid-cols-3 gap-3">
        <Link href="/company/leads?stage=new" className="company-pipeline-card company-pipeline-new">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">New request</p>
          <p className="font-heading mt-1 text-2xl font-bold">{leadPipeline.new}</p>
        </Link>
        <Link href="/company/leads?stage=contacted" className="company-pipeline-card company-pipeline-active">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">Contacted</p>
          <p className="font-heading mt-1 text-2xl font-bold">{leadPipeline.contacted}</p>
        </Link>
        <Link href="/company/leads?stage=closed" className="company-pipeline-card company-pipeline-closed">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">Closed</p>
          <p className="font-heading mt-1 text-2xl font-bold">{leadPipeline.closed}</p>
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardStatCard
          title="Products"
          value={products.length}
          status={
            productLimitForPlan(plan) !== null
              ? `${published} published · ${products.length}/${productLimitForPlan(plan)}`
              : `${published} published · unlimited`
          }
          statusVariant="green"
          icon={<Package className="h-5 w-5" />}
        />
        <DashboardStatCard
          title="Total Leads"
          value={leads.length}
          status={leads.length > 0 ? "Active" : "No leads yet"}
          statusVariant={leads.length > 0 ? "green" : "muted"}
          icon={<Users className="h-5 w-5" />}
          accent="green"
          href="/company/leads"
        />
        <DashboardStatCard
          title="Product Views"
          value={totalViews}
          status="All time"
          statusVariant="muted"
          icon={<Eye className="h-5 w-5" />}
        />
        <DashboardStatCard
          title="Conversion"
          value={`${conversionRate}%`}
          status="Views to leads"
          statusVariant="blue"
          icon={<BarChart3 className="h-5 w-5" />}
          accent="green"
        />
        <DashboardStatCard
          title="Awaiting Verified Badge"
          value={pending}
          status={pending === 0 ? "All verified" : "Optional admin badge"}
          statusVariant={pending === 0 ? "green" : "blue"}
          icon={<Package className="h-5 w-5" />}
        />
        <DashboardStatCard
          title="Subscription"
          value={plan ?? "None"}
          status="Current plan"
          statusVariant="muted"
          icon={<BarChart3 className="h-5 w-5" />}
          accent="green"
          href="/company/settings"
        />
      </div>

      <CompanyDashboardCompactBar
        setupSteps={setupSteps}
        previewHref={previewHref}
        suggestions={operationalSuggestions}
        aiLocked={aiInsight.locked}
        aiHeadline={aiInsight.headline}
        aiHref={aiInsight.href}
      />

      {aiScores.length > 0 && (
        <div className="mt-6 dash-panel">
          <h3 className="font-heading text-base font-semibold text-slate-900">AI product scores</h3>
          <p className="mt-1 text-sm text-slate-500">Listing health based on views, copy, and conversions</p>
          <ul className="mt-4 space-y-2">
            {aiScores.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-violet-100 bg-violet-50/30 px-4 py-3"
              >
                <span className="truncate font-medium text-slate-800">{p.name}</span>
                <AiScoreBadge score={p.score} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {productStatus.length > 0 && (
          <DonutStatusCard title="Product Status" data={productStatus} />
        )}
        <div className={productStatus.length > 0 ? "lg:col-span-1" : "lg:col-span-2"}>
          <ActivityFeed title="Recent Activity" items={activity} emptyMessage="No activity yet. Add products to get started." />
        </div>
        <div className={productStatus.length > 0 ? "lg:col-span-1" : "lg:col-span-1"}>
          <QuickActionsCard
            actions={[
              { label: "Add new product", href: "/company/products/new", icon: <Plus className="h-4 w-4" /> },
              { label: "Account settings", href: "/company/settings", icon: <Package className="h-4 w-4" /> },
              { label: "Demo availability", href: "/company/availability", icon: <Calendar className="h-4 w-4" /> },
              { label: "AI intelligence", href: "/company/ai", icon: <BarChart3 className="h-4 w-4" /> },
              { label: "View leads", href: "/company/leads", icon: <Users className="h-4 w-4" /> },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
