import { cn } from "@/lib/utils";

interface AnalyticsSectionProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AnalyticsSection({
  title,
  description,
  action,
  children,
  className,
}: AnalyticsSectionProps) {
  return (
    <section className={cn("dash-panel overflow-hidden !p-0", className)}>
      <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-heading text-base font-bold text-slate-900 sm:text-lg">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}
