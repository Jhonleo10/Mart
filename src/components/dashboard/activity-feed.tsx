import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";

export type ActivityType = "company" | "product" | "booking";

export interface ActivityItem {
  id: string;
  type?: ActivityType;
  initials: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  href?: string;
}

const TYPE_LABELS: Record<ActivityType, string> = {
  company: "Company",
  product: "Product",
  booking: "Booking",
};

export function ActivityFeed({
  title,
  items,
  emptyMessage = "No recent activity.",
  viewMoreHref,
  viewMoreLabel = "View more",
}: {
  title: string;
  items: ActivityItem[];
  emptyMessage?: string;
  viewMoreHref?: string;
  viewMoreLabel?: string;
}) {
  return (
    <div className="dash-panel">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-heading text-sm font-semibold text-slate-800">{title}</h3>
        {viewMoreHref && items.length > 0 && (
          <Link
            href={viewMoreHref}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-blue hover:text-brand-blue-dark"
          >
            {viewMoreLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">{emptyMessage}</p>
        ) : (
          items.map((item) => {
            const content = (
              <>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue/15 to-brand-green/15 text-xs font-bold text-brand-blue">
                  {item.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.type && (
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {TYPE_LABELS[item.type]}
                      </span>
                    )}
                    <p className="truncate font-medium text-slate-900">{item.title}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{item.description}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatRelativeTime(item.createdAt)}</p>
                </div>
              </>
            );

            const rowClass =
              "dash-activity-row flex gap-3 rounded-xl border border-transparent p-2 transition-all duration-200 hover:border-brand-blue/10 hover:bg-brand-blue/[0.03]";

            if (item.href) {
              return (
                <Link key={item.id} href={item.href} className={rowClass}>
                  {content}
                </Link>
              );
            }

            return (
              <div key={item.id} className={rowClass}>
                {content}
              </div>
            );
          })
        )}
      </div>
      {viewMoreHref && items.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4 sm:hidden">
          <Link
            href={viewMoreHref}
            className="flex w-full items-center justify-center gap-1 rounded-xl border border-brand-blue/20 bg-brand-blue/5 py-2.5 text-sm font-semibold text-brand-blue"
          >
            {viewMoreLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
