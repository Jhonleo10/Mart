import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "secondary";
}

const variants = {
  default: "bg-brand-blue/15 text-brand-blue border-brand-blue/20",
  success: "bg-brand-green/15 text-brand-green-dark border-brand-green/25",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  destructive: "bg-red-100 text-red-700 border-red-200",
  secondary: "bg-slate-100 text-slate-600 border-slate-200",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center truncate rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeProps["variant"]> = {
    NEW: "warning",
    QUALIFIED: "success",
    PENDING: "warning",
    APPROVED: "success",
    PUBLISHED: "success",
    REJECTED: "destructive",
    SUSPENDED: "destructive",
    DRAFT: "secondary",
    PENDING_REVIEW: "warning",
    CONTACTED: "default",
    CLOSED: "secondary",
    COMPLETED: "success",
    FAILED: "destructive",
  };
  return (
    <Badge variant={map[status] ?? "secondary"}>
      {status.replace("_", " ")}
    </Badge>
  );
}
