"use client";

import { cn } from "@/lib/utils";

interface StatusToggleProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label?: string;
}

export function StatusToggle({ checked, onChange, disabled, label }: StatusToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ?? "Toggle status"}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 disabled:opacity-50",
        checked ? "bg-brand-green" : "bg-slate-300",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}
