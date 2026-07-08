"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SetupStep } from "@/lib/company-setup";
import { setupProgress } from "@/lib/company-setup";

export function CompanySetupChecklist({
  steps,
  previewHref,
}: {
  steps: SetupStep[];
  previewHref?: string;
}) {
  const progress = setupProgress(steps);
  const allDone = progress >= 100;

  if (allDone) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-brand-green/20 bg-gradient-to-br from-brand-green/5 via-white to-brand-blue/5 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-green-dark">
            Setup checklist
          </p>
          <h2 className="mt-1 font-heading text-lg font-semibold text-slate-900">
            {progress}% complete — finish your vendor profile
          </h2>
        </div>
        {previewHref && (
          <Link
            href={previewHref}
            target="_blank"
            className="text-sm font-medium text-brand-blue hover:underline"
          >
            Preview public page →
          </Link>
        )}
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-green to-brand-blue transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {steps.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                step.done
                  ? "border-brand-green/20 bg-brand-green/5 text-slate-600"
                  : "border-slate-200 bg-white hover:border-brand-green/30 hover:bg-brand-green/[0.03]",
              )}
            >
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-green" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-slate-300" />
              )}
              <span className={cn(step.done && "line-through opacity-70")}>{step.label}</span>
              {step.optional && (
                <span className="ml-auto text-[10px] font-semibold uppercase text-slate-400">
                  Optional
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
