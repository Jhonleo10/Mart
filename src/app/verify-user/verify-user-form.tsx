"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { AUTH_PATHS, isSafeCallbackUrl } from "@/lib/auth-paths";
import {
  verifyUserOtp,
  resendUserOtp,
  getOtpVerificationStatus,
} from "@/actions/auth.actions";
import type { OtpVerificationStatus } from "@/lib/security/otp-policy";
import { OtpAttemptMeter } from "@/components/auth/otp-attempt-meter";

function getSecondsUntil(iso: string | null | undefined): number {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 1000));
}

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function VerifyUserForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const role = searchParams.get("role");
  const isSeller = role === "company";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [status, setStatus] = useState<OtpVerificationStatus | null>(null);
  const [lockSeconds, setLockSeconds] = useState(0);
  const [expirySeconds, setExpirySeconds] = useState(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const refreshStatus = useCallback(async () => {
    if (!email) return;
    const result = await getOtpVerificationStatus(email);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    if (result.data) {
      setStatus(result.data);
      setLockSeconds(getSecondsUntil(result.data.lockedUntil));
      setExpirySeconds(getSecondsUntil(result.data.expiresAt));
    }
  }, [email]);

  useEffect(() => {
    if (!email) {
      toast.error("Missing email. Please register or sign in again.");
      return;
    }
    void refreshStatus();
  }, [email, refreshStatus]);

  useEffect(() => {
    if (lockSeconds <= 0 && expirySeconds <= 0) return;
    const timer = setInterval(() => {
      setLockSeconds((current) => Math.max(0, current - 1));
      setExpirySeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockSeconds, expirySeconds]);

  useEffect(() => {
    if (lockSeconds === 0 && status?.isLocked) {
      void refreshStatus();
    }
  }, [lockSeconds, status?.isLocked, refreshStatus]);

  const isLocked = lockSeconds > 0;
  const isExpired = expirySeconds === 0 && Boolean(status?.expiresAt);
  const requiresResend = Boolean(status?.requiresResend) || isExpired;
  const canVerify = Boolean(email) && !isLocked && !requiresResend && !verifying;

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(next);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code from your email");
      return;
    }
    if (!email || !canVerify) return;

    setVerifying(true);
    const formData = new FormData();
    formData.set("email", email);
    formData.set("otp", code);
    const result = await verifyUserOtp(formData);
    setVerifying(false);

    if ("error" in result) {
      toast.error(result.error);
      await refreshStatus();
      return;
    }

    toast.success("Email verified! You can sign in now.");
    const callbackUrl = searchParams.get("callbackUrl");
    const loginParams = new URLSearchParams({ verified: "1", email });
    if (callbackUrl && isSafeCallbackUrl(callbackUrl)) {
      loginParams.set("callbackUrl", callbackUrl);
    }
    router.push(`${AUTH_PATHS.login}?${loginParams.toString()}`);
  }

  async function handleResend() {
    if (!email || isLocked || resending) return;
    setResending(true);
    const result = await resendUserOtp(email);
    setResending(false);

    if ("error" in result) {
      toast.error(result.error);
      await refreshStatus();
      return;
    }

    setOtp(["", "", "", "", "", ""]);
    toast.success("A new verification code was sent. You have 3 fresh attempts.");
    await refreshStatus();
    inputsRef.current[0]?.focus();
  }

  return (
    <AuthPageShell
      badge={isSeller ? "Seller Verification" : "Email Verification"}
      badgeTone={isSeller ? "green" : "blue"}
      activeTab="verify"
      compact
      fitViewport
      centerHeader
      title="Verify your email"
      subtitle="Enter the 6-digit code from your inbox."
      footer={
        <div className="auth-verify-footer text-center text-xs text-slate-500">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || isLocked || !email}
            className="font-semibold text-brand-blue hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {resending
              ? "Sending..."
              : isLocked
                ? `New code in ${formatCountdown(lockSeconds)}`
                : requiresResend
                  ? "Request new code"
                  : "Resend code"}
          </button>
          <span className="mx-2 text-slate-300">·</span>
          <Link href={AUTH_PATHS.login} className="font-semibold text-brand-blue hover:underline">
            Login
          </Link>
          <span className="mx-2 text-slate-300">·</span>
          <Link
            href={isSeller ? AUTH_PATHS.companyRegister : AUTH_PATHS.userRegister}
            className="font-semibold text-brand-blue hover:underline"
          >
            Register again
          </Link>
        </div>
      }
    >
      {email ? (
        <div className="auth-verify-email mb-2 flex items-center gap-2 rounded-lg border border-brand-blue/15 bg-brand-blue/5 px-2.5 py-1.5 text-xs text-slate-600">
          <Mail className="h-3.5 w-3.5 shrink-0 text-brand-blue" />
          <span className="truncate">{email}</span>
        </div>
      ) : null}

      <OtpAttemptMeter
        status={status}
        lockSeconds={lockSeconds}
        expirySeconds={expirySeconds}
        isSeller={isSeller}
        compact
      />

      <form onSubmit={handleVerify} className="auth-form-compact auth-form-tight auth-verify-form mt-2">
        <div className="auth-field">
          <Label className="text-xs">Verification code</Label>
          <div className="mt-1.5 grid grid-cols-6 gap-1 sm:gap-1.5" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <Input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                disabled={!canVerify}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="auth-otp-digit h-10 w-full min-w-0 px-0 text-center text-base font-bold tracking-widest disabled:opacity-50"
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <Button type="submit" disabled={!canVerify} className="w-full gap-2" size="default">
          {verifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Verify Email
            </>
          )}
        </Button>
      </form>
    </AuthPageShell>
  );
}
