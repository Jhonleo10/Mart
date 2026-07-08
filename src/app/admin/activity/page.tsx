import Link from "next/link";
import { ACTIVITY_PAGE_SIZE, getAdminActivity } from "@/lib/admin-activity";
import { AdminActivityTimeline } from "@/components/admin/admin-activity-timeline";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/kanban-card";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { Activity } from "lucide-react";
import type { ActivityType } from "@/components/dashboard/activity-feed";

interface PageProps {
  searchParams: Promise<{ type?: string; q?: string; page?: string; dateFrom?: string; dateTo?: string }>;
}

export default async function AdminActivityPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const type = params.type as ActivityType | undefined;
  const filterParams = {
    type: params.type,
    q: params.q,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };

  const { items, total } = await getAdminActivity({
    page,
    type: type && ["company", "product", "booking"].includes(type) ? type : undefined,
    q: params.q,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });

  return (
    <div className="admin-page admin-activity-page dash-page-enter space-y-4">
      <AdminPageHeader
        title="Recent Activity"
        description="Live feed of registrations, listings, and demo requests"
      >
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-blue-dark"
        >
          Back to Dashboard
        </Link>
      </AdminPageHeader>

      <AdminFilterBar
        compact
        basePath="/admin/activity"
        values={filterParams}
        resultCount={total}
        resultLabel="events"
        fields={[
          {
            name: "q",
            type: "search",
            label: "Search",
            placeholder: "Search activity...",
          },
          {
            name: "type",
            type: "select",
            label: "Type",
            options: [
              { value: "company", label: "Companies" },
              { value: "product", label: "Products" },
              { value: "booking", label: "Bookings" },
            ],
          },
          { name: "dateFrom", type: "date", label: "From" },
          { name: "dateTo", type: "date", label: "To" },
        ]}
      />

      <section className="admin-activity-shell">
        <div className="admin-activity-shell-header">
          <div>
            <h2 className="admin-table-shell-title">Activity timeline</h2>
            <p className="admin-table-shell-desc">Latest platform events in chronological order</p>
          </div>
          <span className="admin-activity-count">{total} events</span>
        </div>

        {items.length === 0 ? (
          <DashboardEmptyState
            icon={Activity}
            title="No activity found"
            description="No activity matches your filters."
          />
        ) : (
          <AdminActivityTimeline items={items} />
        )}

        {items.length > 0 && (
          <div className="admin-activity-shell-footer">
            <AdminPagination
              total={total}
              page={page}
              basePath="/admin/activity"
              searchParams={filterParams}
              pageSize={ACTIVITY_PAGE_SIZE}
            />
          </div>
        )}
      </section>
    </div>
  );
}
