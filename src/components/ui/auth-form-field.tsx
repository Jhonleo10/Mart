import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function AuthFormField({
  label,
  htmlFor,
  error,
  hint,
  reserveHintSpace = false,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  reserveHintSpace?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("auth-field", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="form-field-error">{error}</p> : null}
      {!error && hint ? <p className="text-[10px] leading-snug text-slate-400">{hint}</p> : null}
      {!error && !hint && reserveHintSpace ? (
        <p className="text-[10px] leading-snug text-transparent select-none" aria-hidden="true">
          &nbsp;
        </p>
      ) : null}
    </div>
  );
}
