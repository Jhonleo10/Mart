import { cn } from "@/lib/utils";

export function AdminMetricCell({
  value,
  label,
  tone = "default",
  className,
}: {
  value: string | number;
  label?: string;
  tone?: "default" | "blue" | "green";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "admin-metric-cell",
        tone === "blue" && "admin-metric-cell-blue",
        tone === "green" && "admin-metric-cell-green",
        className,
      )}
    >
      <span className="admin-metric-value">{value}</span>
      {label && <span className="admin-metric-label">{label}</span>}
    </div>
  );
}
