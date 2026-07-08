import { cn } from "@/lib/utils";

interface KanbanCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accent?: "blue" | "green";
  className?: string;
  trend?: string;
}

export function KanbanCard({
  title,
  value,
  subtitle,
  icon,
  accent = "blue",
  className,
  trend,
}: KanbanCardProps) {
  return (
    <div
      className={cn(
        "glass-card group relative min-w-0 overflow-hidden rounded-2xl p-5 transition-shadow duration-300 hover:shadow-xl sm:p-6",
        accent === "green"
          ? "hover:border-brand-green/30 hover:shadow-brand-green/10"
          : "hover:border-brand-blue/30 hover:shadow-brand-blue/10",
        className,
      )}
    >
      <div
        className={cn(
          "absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40",
          accent === "green" ? "bg-brand-green" : "bg-brand-blue",
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 break-safe font-heading text-2xl font-bold text-slate-900 sm:text-3xl">
            {value}
          </p>
          {subtitle && <p className="mt-1 truncate text-xs text-slate-400">{subtitle}</p>}
          {trend && (
            <p
              className={cn(
                "mt-2 text-xs font-semibold",
                accent === "green" ? "text-brand-green" : "text-brand-blue",
              )}
            >
              {trend}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              accent === "green" ? "bg-brand-green/10 text-brand-green" : "bg-brand-blue/10 text-brand-blue",
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="admin-page-header">
      <div className="min-w-0 flex-1">
        <p className="admin-page-eyebrow">Admin Panel</p>
        <h1 className="font-heading break-safe text-2xl font-bold text-slate-900 sm:text-3xl">
          <span className="text-gradient">{title}</span>
        </h1>
        {description && (
          <p className="mt-1.5 break-safe text-sm leading-relaxed text-slate-500 sm:text-base">
            {description}
          </p>
        )}
      </div>
      {children && <div className="admin-page-header-actions shrink-0">{children}</div>}
    </div>
  );
}
