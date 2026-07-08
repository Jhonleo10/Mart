import Link from "next/link";
import { Building2, CalendarClock, Package } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import type { ActivityItem, ActivityType } from "@/components/dashboard/activity-feed";

const TYPE_META: Record<
  ActivityType,
  { label: string; icon: typeof Building2; tone: string }
> = {
  company: { label: "Company", icon: Building2, tone: "admin-activity-tone-company" },
  product: { label: "Product", icon: Package, tone: "admin-activity-tone-product" },
  booking: { label: "Booking", icon: CalendarClock, tone: "admin-activity-tone-booking" },
};

export function AdminActivityTimeline({ items }: { items: ActivityItem[] }) {
  return (
    <div className="admin-activity-timeline">
      {items.map((item, index) => {
        const meta = item.type ? TYPE_META[item.type] : null;
        const Icon = meta?.icon ?? Package;
        const row = (
          <div className="admin-activity-item">
            <div className="admin-activity-rail" aria-hidden>
              <span className={`admin-activity-node ${meta?.tone ?? ""}`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              {index < items.length - 1 ? <span className="admin-activity-line" /> : null}
            </div>
            <div className="admin-activity-body min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {meta ? (
                  <span className={`admin-activity-type ${meta.tone}`}>{meta.label}</span>
                ) : null}
                <p className="truncate font-heading text-sm font-semibold text-slate-900">{item.title}</p>
                <StatusBadge status={item.status} />
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.description}</p>
              <p className="mt-1.5 text-xs font-medium text-slate-400">{formatRelativeTime(item.createdAt)}</p>
            </div>
            <div className="admin-activity-avatar hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue/12 to-brand-green/12 text-[10px] font-bold text-brand-blue sm:flex">
              {item.initials}
            </div>
          </div>
        );

        if (item.href) {
          return (
            <Link key={item.id} href={item.href} className="admin-activity-link">
              {row}
            </Link>
          );
        }

        return (
          <div key={item.id} className="admin-activity-link admin-activity-link-static">
            {row}
          </div>
        );
      })}
    </div>
  );
}
