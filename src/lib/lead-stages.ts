import type { BookingStatus } from "@prisma/client";

export type LeadStage = "new" | "contacted" | "closed";

export const LEAD_STAGE_STATUSES: Record<LeadStage, BookingStatus[]> = {
  new: ["NEW"],
  contacted: ["CONTACTED", "QUALIFIED"],
  closed: ["CONVERTED", "CLOSED"],
};

export const LEAD_KANBAN_COLUMNS: {
  stage: LeadStage;
  label: string;
  color: string;
  bg: string;
  borderTop: string;
}[] = [
  {
    stage: "new",
    label: "New Request",
    color: "text-brand-blue",
    bg: "bg-brand-blue/5 border-brand-blue/20",
    borderTop: "border-t-brand-blue",
  },
  {
    stage: "contacted",
    label: "Contacted",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    borderTop: "border-t-amber-500",
  },
  {
    stage: "closed",
    label: "Closed",
    color: "text-slate-600",
    bg: "bg-slate-50 border-slate-200",
    borderTop: "border-t-slate-400",
  },
];

export function leadMatchesStage(status: BookingStatus, stage: LeadStage) {
  return LEAD_STAGE_STATUSES[stage].includes(status);
}

export function parseLeadStage(value?: string): LeadStage | undefined {
  if (value === "new" || value === "contacted" || value === "closed") return value;
  return undefined;
}
