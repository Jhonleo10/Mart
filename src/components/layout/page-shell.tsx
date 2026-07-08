import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, className, children }: PageHeaderProps) {
  return (
    <div className={cn("mb-8 sm:mb-10", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading break-safe text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
            <span className="text-gradient">{title}</span>
          </h1>
          {description && (
            <p className="mt-2 break-safe text-sm text-slate-500 sm:text-base">{description}</p>
          )}
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </div>
    </div>
  );
}

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageSection({ children, className }: PageSectionProps) {
  return (
    <section className={cn("safe-container py-8 sm:py-10 lg:py-12", className)}>
      {children}
    </section>
  );
}

export function FilterPanel({ children, className }: PageSectionProps) {
  return (
    <div className={cn("glass-card space-y-4 rounded-2xl p-4 sm:p-5", className)}>
      {children}
    </div>
  );
}

export function SelectField({
  name,
  defaultValue,
  label,
  children,
}: {
  name: string;
  defaultValue?: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="mt-1.5 flex h-10 w-full rounded-xl border border-white/60 bg-white/70 px-3 text-sm text-slate-800 shadow-sm backdrop-blur-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
      >
        {children}
      </select>
    </div>
  );
}

export function DataTable({ children, className }: PageSectionProps) {
  return (
    <div className={cn("glass-card min-w-0 overflow-hidden rounded-2xl", className)}>
      <div className="min-w-0 overflow-x-auto">{children}</div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="glass-card rounded-2xl px-6 py-12 text-center">
      <p className="text-slate-500">{message}</p>
    </div>
  );
}

export function PaginationLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex min-h-9 min-w-9 items-center justify-center rounded-xl px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-brand-blue text-white shadow-md shadow-brand-blue/25"
          : "glass text-slate-700 hover:border-brand-blue/30 hover:text-brand-blue"
      )}
    >
      {children}
    </a>
  );
}
