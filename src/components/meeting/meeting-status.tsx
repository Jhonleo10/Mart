import type { MeetingStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<MeetingStatus, string> = {
  PENDING_SCHEDULE: "bg-amber-100 text-amber-800",
  SCHEDULED: "bg-brand-blue/10 text-brand-blue",
  COMPLETED: "bg-brand-green/10 text-brand-green",
  CANCELLED: "bg-red-100 text-red-700",
  RESCHEDULED: "bg-purple-100 text-purple-700",
  NO_SHOW: "bg-slate-100 text-slate-700",
};

const STATUS_LABELS: Record<MeetingStatus, string> = {
  PENDING_SCHEDULE: "Pending",
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  RESCHEDULED: "Rescheduled",
  NO_SHOW: "No show",
};

export function MeetingStatusBadge({
  status,
  className,
}: {
  status: MeetingStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
