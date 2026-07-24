import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { AUTH_PATHS } from "@/lib/auth-paths";
import { companyRepository } from "@/repositories/company.repository";
import { meetingRepository, companyGoogleRepository } from "@/repositories/meeting.repository";
import { isGoogleOAuthConfigured } from "@/lib/google/oauth";
import { MeetingCard } from "@/components/meeting/meeting-card";
import { GoogleCalendarConnect } from "@/components/meeting/google-calendar-connect";
import { GoogleConnectToast } from "@/components/meeting/google-connect-toast";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-stat-card";
import { DashboardPagination, DASHBOARD_PAGE_SIZE } from "@/components/dashboard/dashboard-pagination";

interface PageProps {
  searchParams: Promise<{ tab?: string; page?: string }>;
}

const TABS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "today", label: "Today" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default async function CompanyMeetingsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") redirect("/login");

  const company = await companyRepository.findByUserId(session.user.id);
  if (!company) redirect(AUTH_PATHS.companyRegister);

  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const tab = params.tab ?? "upcoming";

  const [[meetingRows, total], googleConnection] = await Promise.all([
    meetingRepository.listByCompanyPaginated(company.id, {
      page,
      limit: DASHBOARD_PAGE_SIZE,
      tab,
    }),
    companyGoogleRepository.findByCompanyId(company.id),
  ]);

  return (
    <div className="dash-page-enter animate-in fade-in">
      <Suspense fallback={null}>
        <GoogleConnectToast />
      </Suspense>
      <DashboardPageHeader
        title="Meetings"
        description="Manage scheduled demos, meeting links, and your calendar connection"
      />

      <div className="mb-6">
        <GoogleCalendarConnect
          connected={Boolean(googleConnection)}
          googleEmail={googleConnection?.googleEmail}
          configured={isGoogleOAuthConfigured()}
        />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="tablist">
          {TABS.map((t) => (
            <Link
              key={t.value}
              role="tab"
              aria-selected={tab === t.value}
              href={`/company/meetings?tab=${t.value}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                tab === t.value
                  ? "bg-brand-green text-white shadow-sm shadow-brand-green/20"
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
        {meetingRows.map((meeting) => (
          <MeetingCard key={meeting.id} meeting={meeting} role="COMPANY" showCustomer />
        ))}
        {meetingRows.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
            No meetings in this view. Schedule demos from your{" "}
            <Link href="/company/leads" className="text-brand-blue hover:underline">
              leads
            </Link>
            .
          </div>
        )}
      </div>

      <DashboardPagination
        total={total}
        page={page}
        basePath="/company/meetings"
        searchParams={{ tab: params.tab }}
      />
    </div>
  );
}
