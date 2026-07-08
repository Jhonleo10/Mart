import {
  Building2,
  Users,
  Package,
  TrendingUp,
  CreditCard,
  Clock,
} from "lucide-react";
import { getAdminDashboardStats } from "@/lib/admin-analytics";
import { AdminPageHeader } from "@/components/admin/kanban-card";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { DonutStatusCard } from "@/components/dashboard/dynamic-dashboard-widgets";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { QuickActionsCard } from "@/components/dashboard/dashboard-panels";
import { AdminApprovalQueue } from "@/components/admin/admin-approval-queue";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="admin-page dash-page-enter space-y-5">
      <AdminPageHeader
        title="Command Center"
        description="Platform oversight, approval queue, and live activity"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardStatCard
          title="Companies"
          value={stats.counts.companies}
          status="Active"
          statusVariant="green"
          icon={<Building2 className="h-5 w-5" />}
          href="/admin/companies"
        />
        <DashboardStatCard
          title="Users"
          value={stats.counts.users}
          status={stats.counts.usersToday > 0 ? `+${stats.counts.usersToday} today` : "No change"}
          statusVariant={stats.counts.usersToday > 0 ? "green" : "muted"}
          icon={<Users className="h-5 w-5" />}
          accent="green"
          href="/admin/users"
        />
        <DashboardStatCard
          title="Products"
          value={stats.counts.products}
          status="Published"
          statusVariant="green"
          icon={<Package className="h-5 w-5" />}
          href="/admin/products"
        />
        <DashboardStatCard
          title="Bookings"
          value={stats.counts.bookings}
          status={stats.counts.bookings > 0 ? "Active" : "No change"}
          statusVariant={stats.counts.bookings > 0 ? "green" : "muted"}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="green"
          href="/admin/analytics"
        />
        <DashboardStatCard
          title="Revenue"
          value={formatCurrency(stats.counts.revenue)}
          status={stats.counts.revenue > 0 ? "Collected" : "—"}
          statusVariant={stats.counts.revenue > 0 ? "green" : "muted"}
          icon={<CreditCard className="h-5 w-5" />}
          href="/admin/payments"
        />
        <DashboardStatCard
          title="Pending Verifications"
          value={stats.pendingTotal}
          status={stats.pendingTotal === 0 ? "All clear" : "Needs action"}
          statusVariant={stats.pendingTotal === 0 ? "green" : "blue"}
          icon={<Clock className="h-5 w-5" />}
          accent="green"
          href="/admin/products?verified=false"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <DonutStatusCard title="Company Status" data={stats.companyStatus} />
        <DonutStatusCard title="Product Status" data={stats.productStatus} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AdminApprovalQueue
            companies={stats.pendingCompanyRows}
            products={stats.pendingProductRows}
          />
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed title="Recent Activity" items={stats.activity} viewMoreHref="/admin/activity" />
        </div>
        <div className="lg:col-span-1">
          <QuickActionsCard
            actions={[
              { label: "Manage products", href: "/admin/products", icon: <Package className="h-4 w-4" /> },
              { label: "Manage companies", href: "/admin/companies", icon: <Building2 className="h-4 w-4" /> },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
