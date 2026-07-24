import { getAnalyticsData } from "@/lib/admin-analytics";
import { analyticsRepository } from "@/repositories/analytics.repository";
import { bookingRepository } from "@/repositories/booking.repository";
import { AdminPageHeader } from "@/components/admin/kanban-card";
import { AnalyticsExportButtons } from "@/components/admin/analytics-export-buttons";
import { AdminTableShell } from "@/components/admin/admin-table-shell";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { DonutStatusCard } from "@/components/dashboard/dynamic-dashboard-widgets";
import { AdminPagination, ADMIN_PAGE_SIZE } from "@/components/admin/admin-pagination";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TrendingUp,
  Building2,
  UserPlus,
  BarChart3,
  CalendarClock,
} from "lucide-react";
import Link from "next/link";

const PERIOD_DAYS = 30;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const [analytics, trending, [leads, totalLeads]] = await Promise.all([
    getAnalyticsData(PERIOD_DAYS),
    analyticsRepository.getTrendingProducts(10),
    bookingRepository.adminList({ page, limit: ADMIN_PAGE_SIZE }),
  ]);

  return (
    <div className="admin-page dash-page-enter space-y-5">
      <AdminPageHeader
        title="Analytics & Reports"
        description="Growth metrics, marketplace health, trending products, and demo leads"
      >
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <span className="admin-period-badge">Last {PERIOD_DAYS} days</span>
          <AnalyticsExportButtons days={PERIOD_DAYS} />
        </div>
      </AdminPageHeader>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Revenue"
          value={formatCurrency(analytics.revenue)}
          status={`${PERIOD_DAYS}-day total`}
          statusVariant="blue"
          icon={<TrendingUp className="h-5 w-5" />}
          href="/admin/payments"
        />
        <DashboardStatCard
          title="New Leads"
          value={analytics.bookings}
          status="Demo & contact requests"
          statusVariant="green"
          icon={<CalendarClock className="h-5 w-5" />}
          accent="green"
          href="#all-leads"
        />
        <DashboardStatCard
          title="New Companies"
          value={analytics.newCompanies}
          status="Vendor sign-ups"
          statusVariant="muted"
          icon={<Building2 className="h-5 w-5" />}
          href="/admin/companies"
        />
        <DashboardStatCard
          title="New Users"
          value={analytics.newUsers}
          status="Buyer accounts"
          statusVariant="muted"
          icon={<UserPlus className="h-5 w-5" />}
          accent="green"
          href="/admin/users"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <DonutStatusCard title="Company Status" data={analytics.companyStatus} />
        <DonutStatusCard title="Product Status" data={analytics.productStatus} />
        <DonutStatusCard title="Users by Role" data={analytics.roleCounts} />
      </div>

      <AdminTableShell
        title="Trending Products"
        description="Ranked by engagement score with vendor plan boost (30-day window)"
        action={
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <BarChart3 className="h-3.5 w-3.5" />
            Top {trending.length}
          </span>
        }
      >
        <table className="admin-table admin-table-premium">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Product</th>
              <th scope="col">Company</th>
              <th scope="col">Category</th>
              <th scope="col">Score</th>
              <th scope="col">Views</th>
            </tr>
          </thead>
          <tbody>
            {trending.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                  No published products yet.
                </td>
              </tr>
            ) : (
              trending.map((p, i) => (
                <tr key={p.id}>
                  <td className="tabular-nums text-slate-400">{i + 1}</td>
                  <td>
                    <Link
                      href={`/products/${p.slug}`}
                      className="font-medium text-brand-blue hover:underline"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="text-slate-600">{p.company.name}</td>
                  <td className="text-slate-600">{p.category.name}</td>
                  <td>
                    <span className="inline-flex rounded-md bg-brand-green/10 px-2 py-0.5 text-xs font-bold tabular-nums text-brand-green-light">
                      {p.trendingScore}
                    </span>
                  </td>
                  <td className="tabular-nums text-slate-700">{p.viewCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminTableShell>

      <AdminTableShell
        title="All Leads"
        description="Bookings and demo requests across the marketplace"
        className="scroll-mt-6"
        footer={
          <AdminPagination total={totalLeads} page={page} basePath="/admin/analytics" searchParams={{}} />
        }
      >
        <table className="admin-table admin-table-premium" id="all-leads">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Product</th>
              <th scope="col">Company</th>
              <th scope="col">Type</th>
              <th scope="col">Status</th>
              <th scope="col">Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                  No leads recorded yet.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <div className="font-medium text-slate-900">{lead.name}</div>
                    {lead.user?.email && (
                      <div className="text-xs text-slate-500">{lead.user.email}</div>
                    )}
                  </td>
                  <td>{lead.product?.name ?? "—"}</td>
                  <td>{lead.company.name}</td>
                  <td>
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {lead.type}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="whitespace-nowrap text-slate-600">{formatDate(lead.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminTableShell>
    </div>
  );
}
