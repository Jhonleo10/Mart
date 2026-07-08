import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  status?: string;
  statusVariant?: "green" | "muted" | "blue";
  icon: React.ReactNode;
  accent?: "blue" | "green";
  href?: string;
}

export function DashboardStatCard({
  title,
  value,
  status,
  statusVariant = "green",
  icon,
  accent = "blue",
  href,
}: DashboardStatCardProps) {
  const content = (
    <div className={cn("dash-stat-card group", href && "cursor-pointer")}>
      <div
        className={cn(
          "dash-stat-card-accent",
          accent === "green" ? "dash-stat-accent-green" : "dash-stat-accent-blue",
        )}
        aria-hidden
      />
      <div className="relative flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            accent === "green"
              ? "bg-brand-green/10 text-brand-green"
              : "bg-brand-blue/10 text-brand-blue",
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-0.5 truncate font-heading text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
            {value}
          </p>
          {status && (
            <p
              className={cn(
                "mt-0.5 truncate text-xs font-medium",
                statusVariant === "green" && "text-brand-green-dark",
                statusVariant === "blue" && "text-brand-blue",
                statusVariant === "muted" && "text-slate-400",
              )}
            >
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export function DashboardPageHeader({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("dash-page-header", className)}>
      <div className="relative pl-4">
        <span
          className="absolute left-0 top-1 h-[calc(100%-0.25rem)] w-1 rounded-full bg-gradient-to-b from-brand-blue to-brand-green"
          aria-hidden
        />
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
