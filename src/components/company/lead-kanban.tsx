"use client";

import { Calendar, Clock } from "lucide-react";
import type { BookingStatus } from "@prisma/client";
import { StatusBadge } from "@/components/ui/badge";
import { LeadStatusButtons } from "@/components/company/lead-status-buttons";
import { formatDate } from "@/lib/utils";
import { LEAD_KANBAN_COLUMNS, leadMatchesStage } from "@/lib/lead-stages";
import type { LeadRow } from "./leads-workspace";

function showLeadActions(status: BookingStatus, hasScheduledMeeting: boolean) {
  // Keep actions visible for CONTACTED leads without a scheduled meeting,
  // and for leads that already have a meeting (link to Meetings).
  if (hasScheduledMeeting) return true;
  return ["NEW", "CONTACTED", "QUALIFIED"].includes(status);
}

export function LeadKanban({
  leads,
  googleConnected,
}: {
  leads: LeadRow[];
  googleConnected: boolean;
}) {
  return (
    <div className="company-kanban-wrap">
      <div className="company-kanban-summary">
        {LEAD_KANBAN_COLUMNS.map((col) => {
          const count = leads.filter((l) => leadMatchesStage(l.status, col.stage)).length;
          return (
            <div key={col.stage} className={`company-kanban-summary-card ${col.bg}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${col.color}`}>{col.label}</p>
              <p className="mt-1 font-heading text-2xl font-bold text-slate-900">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="company-kanban-shell">
        <div className="company-kanban-board company-kanban">
          {LEAD_KANBAN_COLUMNS.map((col) => {
            const columnLeads = leads.filter((l) => leadMatchesStage(l.status, col.stage));
            return (
              <div
                key={col.stage}
                className={`company-kanban-column flex min-w-[min(100%,300px)] sm:min-w-[320px] max-w-[360px] shrink-0 snap-center flex-col rounded-3xl border-t-4 p-4 shadow-sm backdrop-blur-md ${col.bg} ${col.borderTop}`}
              >
            <div className={`mb-4 flex items-center justify-between ${col.color}`}>
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider">{col.label}</h3>
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-black shadow-sm">
                {columnLeads.length}
              </span>
            </div>
            <div className="company-kanban-column-scroll flex h-full max-h-[min(70vh,640px)] flex-col gap-3 overflow-y-auto pr-1">
              {columnLeads.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-white/50 bg-white/30">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">No leads</p>
                </div>
              ) : (
                columnLeads.map((lead) => (
                  <article
                    key={lead.id}
                    className="group relative flex flex-col rounded-2xl border border-white/80 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-slate-900 transition-colors group-hover:text-brand-blue">
                          {lead.name}
                        </p>
                        <p className="truncate text-xs font-medium text-slate-500">{lead.email}</p>
                      </div>
                      <div className="shrink-0">
                        <StatusBadge status={lead.status} />
                      </div>
                    </div>

                    <div className="mb-3 rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs font-medium text-slate-600">
                      <span className="text-slate-400">Product: </span>
                      {lead.product?.name ?? "General enquiry"}
                    </div>

                    {(lead.preferredDate || lead.preferredTime) && (
                      <div className="mb-3 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                        {lead.preferredDate && (
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5">
                            <Calendar className="h-3 w-3" />
                            {formatDate(lead.preferredDate)}
                          </span>
                        )}
                        {lead.preferredTime && (
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5">
                            <Clock className="h-3 w-3" />
                            {lead.preferredTime}
                          </span>
                        )}
                      </div>
                    )}

                    {lead.message && (
                      <p className="mb-3 line-clamp-2 border-l-2 border-brand-blue/20 pl-2 text-xs italic text-slate-500">
                        &ldquo;{lead.message}&rdquo;
                      </p>
                    )}

                    <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {formatDate(lead.createdAt)}
                      </p>
                    </div>

                    {showLeadActions(lead.status, lead.hasScheduledMeeting ?? false) ? (
                      <div className="mt-3">
                        <LeadStatusButtons
                          bookingId={lead.id}
                          bookingStatus={lead.status}
                          googleConnected={googleConnected}
                          hasScheduledMeeting={lead.hasScheduledMeeting}
                          preferredDate={lead.preferredDateIso}
                          preferredTime={lead.preferredTime}
                        />
                      </div>
                    ) : null}
                  </article>
                ))
              )}
            </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
