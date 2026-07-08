"use client";

import { Clock, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OtpVerificationStatus } from "@/lib/security/otp-policy";

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function OtpAttemptMeter({
  status,
  lockSeconds,
  expirySeconds,
  isSeller = false,
  compact = false,
}: {
  status: OtpVerificationStatus | null;
  lockSeconds: number;
  expirySeconds: number;
  isSeller?: boolean;
  compact?: boolean;
}) {
  const maxAttempts = status?.maxAttempts ?? 3;
  const attemptsUsed = status?.attemptsUsed ?? 0;
  const attemptsRemaining = status?.attemptsRemaining ?? maxAttempts;
  const isLocked = lockSeconds > 0;
  const isExpired = expirySeconds === 0 && Boolean(status?.expiresAt);
  const requiresResend = Boolean(status?.requiresResend) || isExpired;
  const accent = isSeller ? "green" : "blue";

  const expiryPercent =
    status?.expiresAt && expirySeconds > 0
      ? Math.min(100, Math.max(0, (expirySeconds / (status.expiryMinutes * 60)) * 100))
      : 0;

  const policyText = isLocked
    ? `Locked ${formatCountdown(lockSeconds)} · request new code after`
    : requiresResend
      ? "Attempts used · request a new code below"
      : `${maxAttempts} tries · ${status?.lockoutMinutes ?? 5}m cooldown`;

  const accentRing = accent === "green" ? "otp-attempt-orb-green" : "otp-attempt-orb-blue";
  const accentFill = accent === "green" ? "otp-attempt-segment-green" : "otp-attempt-segment-blue";

  return (
    <div
      className={cn(
        "otp-attempt-meter relative overflow-hidden rounded-2xl border",
        compact ? "p-2.5" : "p-4",
        isLocked
          ? "border-red-200 bg-gradient-to-br from-red-50 to-orange-50"
          : requiresResend
            ? "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50"
            : accent === "green"
              ? "border-brand-green/20 bg-gradient-to-br from-brand-green/5 via-white to-brand-blue/5"
              : "border-brand-blue/20 bg-gradient-to-br from-brand-blue/5 via-white to-brand-green/5",
      )}
    >
      <div className="otp-attempt-meter-glow" aria-hidden />

      <div className="relative z-[1] flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Verification attempts
          </p>
          <p className={cn("truncate font-semibold text-slate-900", compact ? "text-xs" : "text-sm")}>
            {isLocked
              ? "Temporarily locked"
              : requiresResend
                ? "Fresh code required"
                : `${attemptsRemaining} ${attemptsRemaining === 1 ? "try" : "tries"} remaining`}
          </p>
        </div>
        {!isLocked && !requiresResend ? (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
              accent === "green"
                ? "bg-brand-green/10 text-brand-green"
                : "bg-brand-blue/10 text-brand-blue",
            )}
          >
            <Sparkles className="h-3 w-3" />
            Active
          </span>
        ) : isLocked ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-600">
            <Lock className="h-3 w-3" />
            Locked
          </span>
        ) : null}
      </div>

      <div
        className={cn("relative z-[1]", compact ? "mt-2.5" : "mt-4")}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={maxAttempts}
        aria-valuenow={attemptsRemaining}
        aria-label={`${attemptsRemaining} verification attempts remaining`}
      >
        <div className="flex items-center justify-center gap-0">
          {Array.from({ length: maxAttempts }).map((_, index) => {
            const isConsumed = index < attemptsUsed;
            const isLive = index >= attemptsUsed && !isLocked && !requiresResend;
            const isNext = index === attemptsUsed && isLive;

            return (
              <div key={index} className="flex items-center">
                <div
                  className={cn(
                    "otp-attempt-orb relative rounded-full transition-all duration-300",
                    compact ? "h-3.5 w-3.5" : "h-4 w-4",
                    isConsumed && "otp-attempt-orb-used",
                    isLive && accentRing,
                    isNext && "otp-attempt-orb-pulse",
                    isLocked && !isConsumed && "otp-attempt-orb-locked",
                    requiresResend && !isConsumed && "otp-attempt-orb-exhausted",
                  )}
                >
                  <span className="otp-attempt-orb-core absolute inset-[3px] rounded-full" />
                </div>
                {index < maxAttempts - 1 ? (
                  <div
                    className={cn(
                      "otp-attempt-bridge",
                      compact ? "w-8" : "w-10",
                      attemptsUsed > index
                        ? "otp-attempt-bridge-used"
                        : isLive
                          ? accentFill
                          : "otp-attempt-bridge-idle",
                    )}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {compact ? (
        <div className="relative z-[1] mt-2.5 flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-2.5 py-2 backdrop-blur-sm">
          <div className="relative h-9 w-9 shrink-0">
            <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36" aria-hidden>
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke={isExpired ? "#ef4444" : accent === "green" ? "#00C367" : "#0076DF"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${expiryPercent} 100`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-700">
              {expirySeconds > 0 ? formatCountdown(expirySeconds) : "0:00"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <Clock className="h-3 w-3" />
              {isExpired ? "Code expired" : "Code timer"}
            </div>
            <p className="truncate text-[11px] leading-snug text-slate-600">{policyText}</p>
          </div>
        </div>
      ) : (
        <div className="relative z-[1] mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-white/80 bg-white/70 px-3 py-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              Code timer
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="relative h-11 w-11 shrink-0">
                <svg className="h-11 w-11 -rotate-90" viewBox="0 0 36 36" aria-hidden>
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke={isExpired ? "#ef4444" : accent === "green" ? "#00C367" : "#0076DF"}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${expiryPercent} 100`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">
                  {expirySeconds > 0 ? formatCountdown(expirySeconds) : "0:00"}
                </span>
              </div>
              <p className="text-xs leading-snug text-slate-600">
                {isExpired
                  ? "This code has expired. Request a new one to continue."
                  : `Valid for ${status?.expiryMinutes ?? 10} minutes from send.`}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/80 bg-white/70 px-3 py-2.5 backdrop-blur-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Cooldown policy
            </div>
            <p className="mt-2 text-xs leading-snug text-slate-600">{policyText}</p>
          </div>
        </div>
      )}
    </div>
  );
}
