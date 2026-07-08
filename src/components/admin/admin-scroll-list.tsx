import { cn } from "@/lib/utils";

/** @deprecated Prefer AdminTableShell — kept for gradual migration */
export function AdminScrollList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("admin-table-shell", className)}>
      <div className="admin-table-shell-scroll">{children}</div>
    </div>
  );
}
