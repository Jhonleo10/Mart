"use server";

import { AppError, handleActionError } from "@/lib/errors";
import { emailService } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { auditLog } from "@/lib/security/audit";
import { verifyOtpSchema } from "@/lib/validations";
import { userRepository } from "@/repositories/user.repository";
import { companyRepository } from "@/repositories/company.repository";
import { otpRepository } from "@/repositories/otp.repository";
import { prisma } from "@/lib/prisma";
import { generateOtp, otpExpiry } from "@/lib/security/tokens";
import {
  formatOtpLockoutMessage,
  isOtpLocked,
  OTP_EXPIRY_MINUTES,
  OTP_LOCKOUT_MINUTES,
  OTP_MAX_ATTEMPTS,
  otpAttemptsRemaining,
  otpLockoutUntil,
  type OtpVerificationStatus,
} from "@/lib/security/otp-policy";
import type { ActionResult } from "@/lib/action-types";

async function getUserForOtp(email: string) {
  const user = await userRepository.findByEmail(email);
  if (!user || (user.role !== "USER" && user.role !== "COMPANY")) {
    return null;
  }
  return user;
}

function buildOtpStatus(
  record: {
    attempts: number;
    lockedUntil: Date | null;
    expires: Date;
  } | null,
): OtpVerificationStatus {
  const now = new Date();
  if (!record) {
    return {
      maxAttempts: OTP_MAX_ATTEMPTS,
      attemptsUsed: 0,
      attemptsRemaining: OTP_MAX_ATTEMPTS,
      lockedUntil: null,
      expiresAt: null,
      isLocked: false,
      requiresResend: true,
      expiryMinutes: OTP_EXPIRY_MINUTES,
      lockoutMinutes: OTP_LOCKOUT_MINUTES,
    };
  }

  const isLocked = isOtpLocked(record.lockedUntil, now);
  const attemptsRemaining = otpAttemptsRemaining(record.attempts);
  const requiresResend =
    record.expires <= now ||
    (record.attempts >= OTP_MAX_ATTEMPTS && !isLocked);

  return {
    maxAttempts: OTP_MAX_ATTEMPTS,
    attemptsUsed: record.attempts,
    attemptsRemaining,
    lockedUntil: record.lockedUntil?.toISOString() ?? null,
    expiresAt: record.expires.toISOString(),
    isLocked,
    requiresResend,
    expiryMinutes: OTP_EXPIRY_MINUTES,
    lockoutMinutes: 5,
  };
}

export async function getOtpVerificationStatus(
  email: string,
): Promise<ActionResult<OtpVerificationStatus>> {
  try {
    if (!email) throw new AppError("Email is required", 400);

    const user = await getUserForOtp(email);
    if (!user) {
      return {
        success: true,
        data: buildOtpStatus(null),
      };
    }

    const record = await otpRepository.findByUserId(user.id);
    return { success: true, data: buildOtpStatus(record) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function verifyCompanyEmail(
  token: string,
): Promise<ActionResult<{ redirectTo: string }>> {
  try {
    if (!token) throw new AppError("Invalid verification link", 400);

    const company = await prisma.company.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!company) {
      throw new AppError("Verification link is invalid or has expired", 400);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: company.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.company.update({
        where: { id: company.id },
        data: { verificationToken: null, verificationTokenExpiry: null },
      }),
    ]);

    await auditLog({
      userId: company.userId,
      action: "COMPANY_EMAIL_VERIFIED",
      entityType: "Company",
      entityId: company.id,
    });

    return { success: true, data: { redirectTo: "/company/dashboard" } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function verifyUserOtp(formData: FormData): Promise<ActionResult> {
  try {
    const parsed = verifyOtpSchema.safeParse({
      email: formData.get("email"),
      otp: formData.get("otp"),
    });
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const limit = await rateLimit(parsed.data.email, "register");
    if (!limit.success) throw new AppError("Too many attempts. Try again later.", 429);

    const user = await getUserForOtp(parsed.data.email);
    if (!user) throw new AppError("Invalid verification request", 400);

    const record = await otpRepository.findByUserId(user.id);
    if (!record) throw new AppError("No OTP found. Request a new one.", 400);

    const now = new Date();
    if (record.expires < now) {
      throw new AppError("OTP has expired. Request a new verification code.", 400);
    }

    if (isOtpLocked(record.lockedUntil, now)) {
      throw new AppError(formatOtpLockoutMessage(record.lockedUntil!, now), 429);
    }

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      throw new AppError("Too many failed attempts. Request a new verification code.", 429);
    }

    if (record.otp !== parsed.data.otp) {
      const updated = await otpRepository.incrementAttempts(user.id);

      if (updated.attempts >= OTP_MAX_ATTEMPTS) {
        const lockedUntil = otpLockoutUntil(now);
        await otpRepository.setLockedUntil(user.id, lockedUntil);
        throw new AppError(formatOtpLockoutMessage(lockedUntil, now), 429);
      }

      const remaining = otpAttemptsRemaining(updated.attempts);
      throw new AppError(
        `Invalid OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
        400,
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date(), status: "ACTIVE" },
    });
    await otpRepository.delete(user.id);

    if (user.role === "COMPANY") {
      const company = await companyRepository.findByUserId(user.id);
      if (company) {
        await emailService.companyApproved(user.email, user.name ?? "Seller", company.name);
        await emailService.adminNewCompany({
          companyName: company.name,
          ownerName: user.name ?? company.ownerName ?? "Owner",
          email: user.email,
          phone: user.phone,
          website: company.website,
          industry: company.industry,
        });
      }
    } else {
      await emailService.userWelcome(user.email, user.name ?? "User");
      await emailService.adminNewUser(user.name ?? "User", user.email, user.phone);
    }

    await auditLog({
      userId: user.id,
      action: "USER_EMAIL_VERIFIED",
      entityType: "User",
      entityId: user.id,
    });

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function resendUserOtp(email: string): Promise<ActionResult> {
  try {
    const limit = await rateLimit(email, "register");
    if (!limit.success) throw new AppError("Too many attempts. Try again later.", 429);

    const user = await getUserForOtp(email);
    if (!user || user.emailVerified) {
      return { success: true };
    }

    const record = await otpRepository.findByUserId(user.id);
    const now = new Date();

    if (record && isOtpLocked(record.lockedUntil, now)) {
      throw new AppError(formatOtpLockoutMessage(record.lockedUntil!, now), 429);
    }

    const otp = generateOtp();
    await otpRepository.upsert(user.id, otp, otpExpiry(OTP_EXPIRY_MINUTES));
    const mailResult = await emailService.userOtp(email, user.name ?? "User", otp);
    if (!mailResult.success) {
      throw new AppError(mailResult.error ?? "Could not resend verification email", 503);
    }

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
