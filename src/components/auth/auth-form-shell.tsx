"use client";

import { cn } from "@/lib/utils";

interface AuthFormShellProps {
  children: React.ReactNode;
  wide?: boolean;
}

export function AuthFormShell({ children, wide = false }: AuthFormShellProps) {
  return (
    <div className="relative flex h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden bg-gradient-to-br from-[#f0f7ff] via-white to-[#f4fff9] px-3 sm:h-[calc(100dvh-4.5rem)] sm:px-6">
      <div
        className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-brand-blue/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-brand-green/10 blur-3xl"
        aria-hidden
      />

      <div
        className={cn(
          "relative w-full",
          wide ? "max-w-4xl" : "max-w-md",
        )}
      >
        <div className="rounded-2xl border border-white/80 bg-white/95 shadow-xl shadow-brand-blue/10 backdrop-blur-sm">
          <div className="p-5 sm:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
