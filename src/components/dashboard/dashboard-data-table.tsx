import { cn } from "@/lib/utils";
import { DataTable, EmptyState } from "@/components/layout/page-shell";

export function DashboardDataTable({
  children,
  emptyMessage,
  isEmpty,
  className,
}: {
  children: React.ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
  className?: string;
}) {
  if (isEmpty && emptyMessage) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <DataTable className={cn("dash-data-table", className)}>
      <table className="data-table">{children}</table>
    </DataTable>
  );
}
