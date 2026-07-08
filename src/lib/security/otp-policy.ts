export const OTP_MAX_ATTEMPTS = 3;
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_LOCKOUT_MINUTES = 5;

export function otpLockoutUntil(from = new Date()): Date {
  return new Date(from.getTime() + OTP_LOCKOUT_MINUTES * 60 * 1000);
}

export function isOtpLocked(lockedUntil: Date | null | undefined, now = new Date()): boolean {
  return Boolean(lockedUntil && lockedUntil > now);
}

export function otpAttemptsRemaining(attempts: number): number {
  return Math.max(0, OTP_MAX_ATTEMPTS - attempts);
}

export function formatOtpLockoutMessage(lockedUntil: Date, now = new Date()): string {
  const ms = Math.max(0, lockedUntil.getTime() - now.getTime());
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `Too many failed attempts. Wait ${minutes}m ${seconds}s, then request a new code.`;
  }
  return `Too many failed attempts. Wait ${seconds}s, then request a new code.`;
}

export function formatOtpExpiryMessage(expires: Date, now = new Date()): string {
  const ms = Math.max(0, expires.getTime() - now.getTime());
  const minutes = Math.ceil(ms / 60000);
  if (minutes <= 0) return "Verification code expired. Request a new one.";
  return `Code expires in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

export type OtpVerificationStatus = {
  maxAttempts: number;
  attemptsUsed: number;
  attemptsRemaining: number;
  lockedUntil: string | null;
  expiresAt: string | null;
  isLocked: boolean;
  requiresResend: boolean;
  expiryMinutes: number;
  lockoutMinutes: number;
};
