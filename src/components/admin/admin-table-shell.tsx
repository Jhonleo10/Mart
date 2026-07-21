import { cn } from "@/lib/utils";

interface AdminTableShellProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  empty?: React.ReactNode;
  isEmpty?: boolean;
  className?: string;
}

export function AdminTableShell({
  title,
  description,
  action,
  children,
  footer,
  empty,
  isEmpty = false,
  className,
}: AdminTableShellProps) {
  return (
    <div className={cn("admin-table-shell", className)}>
      {(title || description || action) && (
        <div className="admin-table-shell-header">
          <div className="min-w-0">
            {title && <h2 className="admin-table-shell-title">{title}</h2>}
            {description && <p className="admin-table-shell-desc hidden sm:block">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="admin-table-shell-scroll overflow-x-auto">
        {isEmpty && empty ? empty : children}
      </div>
      {footer && !isEmpty && <div className="admin-table-shell-footer">{footer}</div>}
    </div>
  );
}
