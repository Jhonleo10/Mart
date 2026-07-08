import { cn } from "@/lib/utils";

export function CompanyThemedTable({
  children,
  className,
  accent = "blue",
}: {
  children: React.ReactNode;
  className?: string;
  accent?: "blue" | "green";
}) {
  return (
    <div
      className={cn(
        "company-themed-table dash-data-table overflow-hidden rounded-2xl border shadow-sm",
        accent === "green"
          ? "border-brand-green/15 bg-gradient-to-b from-brand-green/[0.03] to-white"
          : "border-brand-blue/15 bg-gradient-to-b from-brand-blue/[0.03] to-white",
        className,
      )}
    >
      <table className="company-table w-full">{children}</table>
    </div>
  );
}
