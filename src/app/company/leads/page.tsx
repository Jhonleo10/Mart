import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AUTH_PATHS } from "@/lib/auth-paths";
import { companyRepository } from "@/repositories/company.repository";
import { bookingRepository } from "@/repositories/booking.repository";
import { LeadStatusButtons } from "@/components/company/lead-status-buttons";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-stat-card";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  DashboardPagination,
  DASHBOARD_PAGE_SIZE,
} from "@/components/dashboard/dashboard-pagination";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { LeadsViewToggle, LeadKanban } from "@/components/company/leads-workspace";
import { CompanyChipFilters } from "@/components/company/company-chip-filters";
import { Calendar, Clock, Inbox } from "lucide-react";
import { companyGoogleRepository } from "@/repositories/meeting.repository";
import { LEAD_STAGE_STATUSES, parseLeadStage } from "@/lib/lead-stages";

interface PageProps {
  searchParams: Promise<{ q?: string; stage?: string; page?: string }>;
}

export default async function CompanyLeadsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") redirect("/login");

  const company = await companyRepository.findByUserId(session.user.id);
  if (!company) redirect(AUTH_PATHS.companyRegister);

  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const stage = parseLeadStage(params.stage);
  const filterParams = { q: params.q, stage: params.stage };

  const [[leads, total], allLeadsForKanban, googleConnection] = await Promise.all([
    bookingRepository.listByCompanyPaginated(company.id, {
      page,
      limit: DASHBOARD_PAGE_SIZE,
      stage,
      q: params.q,
    }),
    bookingRepository.listByCompany(company.id),
    companyGoogleRepository.findByCompanyId(company.id),
  ]);

  const googleConnected = Boolean(googleConnection);
  const pendingCount = allLeadsForKanban.filter((lead) => lead.status === "NEW").length;

  const stageCounts = {
    new: allLeadsForKanban.filter((l) => LEAD_STAGE_STATUSES.new.includes(l.status)).length,
    contacted: allLeadsForKanban.filter((l) => LEAD_STAGE_STATUSES.contacted.includes(l.status)).length,
    closed: allLeadsForKanban.filter((l) => LEAD_STAGE_STATUSES.closed.includes(l.status)).length,
  };

  const kanbanLeads = allLeadsForKanban.slice(0, 100).map((lead) => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    status: lead.status,
    preferredDate: lead.preferredDate,
    preferredTime: lead.preferredTime,
    message: lead.message,
    createdAt: lead.createdAt,
    product: lead.product ? { name: lead.product.name } : null,
    hasScheduledMeeting: lead.demoMeeting?.status === "SCHEDULED",
    preferredDateIso: lead.preferredDate?.toISOString().slice(0, 10),
  }));

  const listView = (
    <>
      <div className="space-y-4">
        {leads.map((lead) => {
          const hasScheduledMeeting = lead.demoMeeting?.status === "SCHEDULED";
          return (
            <DashboardPanel key={lead.id} className="p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">{lead.name}</h3>
                  <p className="text-sm text-slate-500">
                    {lead.email} · {lead.phone}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Product: {lead.product?.name ?? "General enquiry"}
                  </p>
                  {(lead.preferredDate || lead.preferredTime) && (
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                      {lead.preferredDate && (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(lead.preferredDate)}
                        </span>
                      )}
                      {lead.preferredTime && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {lead.preferredTime}
                        </span>
                      )}
                    </div>
                  )}
                  {lead.message && (
                    <p className="mt-2 line-clamp-3 text-sm text-slate-500">{lead.message}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">Received {formatDate(lead.createdAt)}</p>
                </div>
                <StatusBadge status={lead.status} />
              </div>
              {["NEW", "CONTACTED", "QUALIFIED"].includes(lead.status) || hasScheduledMeeting ? (
                <LeadStatusButtons
                  bookingId={lead.id}
                  bookingStatus={lead.status}
                  googleConnected={googleConnected}
                  hasScheduledMeeting={hasScheduledMeeting}
                  preferredDate={lead.preferredDate?.toISOString().slice(0, 10)}
                  preferredTime={lead.preferredTime}
                />
              ) : null}
            </DashboardPanel>
          );
        })}
        {leads.length === 0 && (
          <DashboardEmptyState
            icon={Inbox}
            title="No leads yet"
            description="Share your product pages to start receiving demo requests from qualified buyers."
            actionLabel="View products"
            actionHref="/company/products"
          />
        )}
      </div>
      <DashboardPagination
        total={total}
        page={page}
        basePath="/company/leads"
        searchParams={filterParams}
      />
    </>
  );

  return (
    <div className="dash-page-enter animate-in fade-in">
      <DashboardPageHeader
        title="Lead Management"
        description={
          pendingCount > 0
            ? `${pendingCount} new demo request${pendingCount === 1 ? "" : "s"} awaiting response`
            : "Kanban pipeline — New Request, Contacted, and Closed"
        }
      />

      <CompanyChipFilters
        basePath="/company/leads"
        chipParam="stage"
        activeChip={params.stage}
        searchValue={params.q}
        searchPlaceholder="Name, email, or product..."
        resultCount={total}
        resultLabel="leads"
        title="Lead pipeline"
        chips={[
          { value: "new", label: "New request", count: stageCounts.new, tone: "blue" },
          { value: "contacted", label: "Contacted", count: stageCounts.contacted, tone: "amber" },
          { value: "closed", label: "Closed", count: stageCounts.closed, tone: "slate" },
        ]}
      />

      <div className="mt-4">
        <LeadsViewToggle
          listView={listView}
          kanbanView={<LeadKanban leads={kanbanLeads} googleConnected={googleConnected} />}
          defaultView="kanban"
        />
      </div>
    </div>
  );
}
