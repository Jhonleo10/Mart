import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { meetingRepository } from "@/repositories/meeting.repository";
import { MeetingCard } from "@/components/meeting/meeting-card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-stat-card";
import { DashboardPagination, DASHBOARD_PAGE_SIZE } from "@/components/dashboard/dashboard-pagination";
import { BuyerFlowCallout } from "@/components/user/buyer-flow-callout";
import { Button } from "@/components/ui/button";

interface PageProps {
  searchParams: Promise<{ tab?: string; page?: string }>;
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

  const [meetings, total] = await meetingRepository.listByUserPaginated(session.user.id, {
    page,
    limit: DASHBOARD_PAGE_SIZE,
    tab: tab || undefined,
  });

  return (
    <div className="dash-page-enter animate-in fade-in">
      <DashboardPageHeader
        title="My Meetings"
        description="Confirmed demo calls with join links — created after a vendor schedules your request."
      />

      <BuyerFlowCallout className="mb-4" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <Link
              key={t.value || "all"}
              href={t.value ? `/user/meetings?tab=${t.value}` : "/user/meetings"}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                tab === t.value
                  ? "bg-brand-blue text-white shadow-sm shadow-brand-blue/20"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <span className="text-sm text-slate-400">
          {total} {total === 1 ? "meeting" : "meetings"}
        </span>
      </div>

      <div className="space-y-4">
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
        searchParams={{ tab: params.tab }}
      />
    </div>
  );
}
