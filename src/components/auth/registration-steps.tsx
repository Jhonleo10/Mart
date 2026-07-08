"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Details", "Plan", "Payment"] as const;

export function RegistrationSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="auth-registration-steps" aria-label="Registration progress">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const done = step < current;
        const active = step === current;

        return (
          <li key={label} className="auth-registration-step">
            <div className="auth-registration-step-body">
              <span
                className={cn(
                  "auth-registration-step-badge",
                  done && "auth-registration-step-badge-done",
                  active && !done && "auth-registration-step-badge-active",
                  !done && !active && "auth-registration-step-badge-idle",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : step}
              </span>
              <span
                className={cn(
                  "auth-registration-step-label",
                  active ? "text-slate-900" : "text-slate-400",
                )}
              >
                {label}
              </span>
            </div>
            {step < STEPS.length ? (
              <div
                className={cn(
                  "auth-registration-step-line",
                  done ? "bg-brand-green/50" : "bg-slate-200",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
