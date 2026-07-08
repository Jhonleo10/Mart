import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { meetingRepository } from "@/repositories/meeting.repository";
import { MeetingCard } from "@/components/meeting/meeting-card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-stat-card";
import { DashboardFilterBar } from "@/components/dashboard/dashboard-filter-bar";
import { DashboardPagination, DASHBOARD_PAGE_SIZE } from "@/components/dashboard/dashboard-pagination";
import { BuyerFlowCallout } from "@/components/user/buyer-flow-callout";
import { Button } from "@/components/ui/button";
import type { MeetingStatus } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{ tab?: string; status?: string; page?: string }>;
}

const TABS = [
  { value: "", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "today", label: "Today" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default async function UserMeetingsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const tab = params.tab ?? "";
  const status = params.status as MeetingStatus | undefined;

  const [meetings, total] = await meetingRepository.listByUserPaginated(session.user.id, {
    page,
    limit: DASHBOARD_PAGE_SIZE,
    status: status || undefined,
    tab: tab || undefined,
  });

  return (
    <div className="dash-page-enter animate-in fade-in">
      <DashboardPageHeader
        title="My Meetings"
        description="Confirmed demo calls with join links — created after a vendor schedules your request."
      />

      <BuyerFlowCallout className="mb-4" />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.value || "all"}
            href={t.value ? `/user/meetings?tab=${t.value}` : "/user/meetings"}
            className={`buyer-pill rounded-full px-3 py-1.5 text-sm font-medium transition ${
              tab === t.value
                ? "bg-brand-blue text-white shadow-sm"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <DashboardFilterBar
        basePath="/user/meetings"
        values={{ status: params.status, tab: params.tab }}
        resultCount={total}
        resultLabel="meetings"
        fields={[
          {
            name: "status",
            type: "select",
            label: "Status",
            options: [
              { value: "SCHEDULED", label: "Scheduled" },
              { value: "COMPLETED", label: "Completed" },
              { value: "CANCELLED", label: "Cancelled" },
            ],
          },
        ]}
      />

      <div className="mt-4 space-y-4">
        {meetings.map((meeting) => (
          <MeetingCard key={meeting.id} meeting={meeting} role="USER" />
        ))}
        {meetings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center text-slate-500">
            <p>No meetings in this view.</p>
            <Link href="/user/bookings" className="mt-3 inline-block">
              <Button variant="outline">View demo requests</Button>
            </Link>
          </div>
        )}
      </div>

      <DashboardPagination
        total={total}
        page={page}
        basePath="/user/meetings"
        searchParams={{ status: params.status, tab: params.tab }}
      />
    </div>
  );
}
