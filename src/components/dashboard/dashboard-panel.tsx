import { cn } from "@/lib/utils";

export function DashboardPanel({
  children,
  className,
  interactive = true,
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "dash-panel",
        interactive && "dash-panel-interactive",
        className,
      )}
    >
      {children}
    </div>
  );
}
