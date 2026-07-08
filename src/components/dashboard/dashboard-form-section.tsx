import { cn } from "@/lib/utils";

interface DashboardFormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  accent?: "blue" | "green";
}

export function DashboardFormSection({
  title,
  description,
  children,
  className,
  accent = "blue",
}: DashboardFormSectionProps) {
  return (
    <section
      className={cn(
        "dash-panel relative overflow-hidden rounded-2xl p-5 sm:p-6",
        accent === "green" ? "border-brand-green/15" : "border-brand-blue/15",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl",
          accent === "green" ? "bg-brand-green" : "bg-brand-blue",
        )}
        aria-hidden
      />
      <div className="relative mb-5 border-b border-slate-100 pb-4">
        <h2 className="font-heading text-lg font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}
