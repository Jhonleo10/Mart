"use server";

import { AppError, handleActionError } from "@/lib/errors";
import { emailService } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { hashPassword } from "@/lib/security/password";
import { auditLog } from "@/lib/security/audit";
import { registerSchema, companyRegisterSchema, adminRegisterSchema } from "@/lib/validations";
import { userRepository } from "@/repositories/user.repository";
import { companyRepository } from "@/repositories/company.repository";
import { otpRepository } from "@/repositories/otp.repository";
import { prisma } from "@/lib/prisma";
import { createUniqueSlug } from "@/lib/slug";
import { generateOtp, otpExpiry } from "@/lib/security/tokens";
import { OTP_EXPIRY_MINUTES } from "@/lib/security/otp-policy";
import { sanitizeText } from "@/lib/security/sanitize";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { activateSubscription, mapPlanIdToSubscription } from "@/lib/payment/subscription";
import { pendingCompanyRegistrationRepository } from "@/repositories/pending-company-registration.repository";
import { settingsRepository } from "@/repositories/settings.repository";
import type { ActionResult } from "@/lib/action-types";

export async function registerUser(
  formData: FormData,
): Promise<ActionResult<{ email: string; requiresVerification: boolean }>> {
  try {
    const raw = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword") ?? formData.get("password"),
      role: "USER" as const,
      terms: formData.get("terms"),
    };

    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const limit = await rateLimit(parsed.data.email, "register");
    if (!limit.success) throw new AppError("Too many attempts. Try again later.", 429);

    const existing = await userRepository.findByEmail(parsed.data.email);
    if (existing) throw new AppError("Email already registered");

    const hashed = await hashPassword(parsed.data.password);
    const user = await userRepository.create({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      password: hashed,
      role: "USER",
      status: "INACTIVE",
    });

    const otp = generateOtp();
    await otpRepository.upsert(user.id, otp, otpExpiry(OTP_EXPIRY_MINUTES));
    const mailResult = await emailService.userOtp(parsed.data.email, parsed.data.name, otp);
    if (!mailResult.success) {
      throw new AppError(
        mailResult.error ?? "Could not send verification email. Check mail settings or try again.",
        503,
      );
    }

    await auditLog({
      action: "USER_REGISTERED",
      entityType: "User",
      metadata: { email: parsed.data.email, role: "USER" },
    });

    return {
      success: true,
      data: { email: parsed.data.email, requiresVerification: true },
    };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function registerAdmin(
  formData: FormData,
): Promise<ActionResult<{ email: string }>> {
  try {
    if (process.env.ADMIN_BOOTSTRAP_ENABLED !== "true") {
      throw new AppError("Admin registration is disabled", 403);
    }

    const parsed = adminRegisterSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      bootstrapSecret: formData.get("bootstrapSecret"),
    });
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const expected = process.env.ADMIN_BOOTSTRAP_SECRET?.trim();
    if (!expected || expected.length < 16) {
      throw new AppError("Admin bootstrap is not configured", 503);
    }

    if (parsed.data.bootstrapSecret !== expected) {
      throw new AppError("Invalid bootstrap key", 403);
    }

    const { name, email, password } = parsed.data;

    const limit = await rateLimit(email, "register");
    if (!limit.success) throw new AppError("Too many attempts. Try again later.", 429);

    const existing = await userRepository.findByEmail(email);
    if (existing) throw new AppError("Email already registered");

    const hashed = await hashPassword(password);
    await userRepository.create({
      name: sanitizeText(name),
      email,
      password: hashed,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    });

    await auditLog({
      action: "ADMIN_REGISTERED",
      entityType: "User",
      metadata: { email },
    });

    return { success: true, data: { email } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function completeCompanyRegistration(data: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  planId: string;
}): Promise<ActionResult<{ email: string }>> {
  try {
    const valid = await verifyPaymentSignature(
      data.razorpayOrderId,
      data.razorpayPaymentId,
      data.razorpaySignature,
    );
    if (!valid) throw new AppError("Invalid payment signature", 400);

    const pending = await pendingCompanyRegistrationRepository.findByOrderId(data.razorpayOrderId);
    if (!pending) throw new AppError("Registration session expired. Please try again.", 400);
    if (pending.expiresAt < new Date()) {
      await pendingCompanyRegistrationRepository.deleteByOrderId(data.razorpayOrderId);
      throw new AppError("Registration session expired. Please try again.", 400);
    }
    if (pending.planId !== data.planId) throw new AppError("Plan mismatch", 400);

    const existingUser = await userRepository.findByEmail(pending.email);
    if (existingUser) throw new AppError("Email already registered");

    const plan = mapPlanIdToSubscription(data.planId);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: pending.ownerName,
          email: pending.email,
          phone: pending.phone,
          password: pending.hashedPassword,
          role: "COMPANY",
          status: "INACTIVE",
        },
      });

      const company = await tx.company.create({
        data: {
          userId: createdUser.id,
          name: sanitizeText(pending.companyName),
          ownerName: sanitizeText(pending.ownerName),
          slug: pending.slug,
          website: pending.website,
          industry: sanitizeText(pending.industry),
          contactEmail: pending.email,
          contactPhone: pending.phone,
          description: `${pending.companyName} — ${pending.industry}`,
          status: "APPROVED",
          paymentVerified: true,
          adminApproved: true,
          selectedPlan: plan,
        },
      });

      await tx.payment.create({
        data: {
          type: "REGISTRATION",
          razorpayOrderId: data.razorpayOrderId,
          razorpayPaymentId: data.razorpayPaymentId,
          razorpaySignature: data.razorpaySignature,
          amount:
            (await settingsRepository.getPricingPlansReadOnly()).find((p) => p.id === data.planId)
              ?.priceAmount ?? 0,
          status: "COMPLETED",
          companyId: company.id,
          metadata: { planId: data.planId, source: "registration" },
        },
      });

      return createdUser;
    });

    await activateSubscription((await companyRepository.findByUserId(user.id))!.id, plan);

    const otp = generateOtp();
    await otpRepository.upsert(user.id, otp, otpExpiry(OTP_EXPIRY_MINUTES));
    const otpMail = await emailService.userOtp(pending.email, pending.ownerName, otp);
    if (!otpMail.success) {
      throw new AppError(
        otpMail.error ?? "Payment received but verification email could not be sent. Contact support.",
        503,
      );
    }
    await emailService.companyRegistered(pending.email, pending.ownerName, pending.companyName);

    await pendingCompanyRegistrationRepository.deleteByOrderId(data.razorpayOrderId);

    await auditLog({
      userId: user.id,
      action: "COMPANY_REGISTERED",
      entityType: "Company",
      metadata: { email: pending.email, companyName: pending.companyName, paidFirst: true },
    });

    return { success: true, data: { email: pending.email } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function registerCompany(
  formData: FormData,
): Promise<ActionResult<{ email: string; requiresVerification: boolean }>> {
  try {
    const raw = {
      companyName: formData.get("companyName"),
      ownerName: formData.get("ownerName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      website: formData.get("website") || "",
      industry: formData.get("industry"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      terms: formData.get("terms"),
    };

    const parsed = companyRegisterSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const limit = await rateLimit(parsed.data.email, "register");
    if (!limit.success) throw new AppError("Too many attempts. Try again later.", 429);

    const existingUser = await userRepository.findByEmail(parsed.data.email);
    if (existingUser) throw new AppError("Email already registered");

    const existingCompany = await prisma.company.findFirst({
      where: { name: { equals: parsed.data.companyName, mode: "insensitive" } },
    });
    if (existingCompany) throw new AppError("Company name already registered");

    const hashed = await hashPassword(parsed.data.password);
    const slug = await createUniqueSlug(parsed.data.companyName, "company");

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: parsed.data.ownerName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          password: hashed,
          role: "COMPANY",
          status: "INACTIVE",
        },
      });

      await tx.company.create({
        data: {
          userId: user.id,
          name: sanitizeText(parsed.data.companyName),
          ownerName: sanitizeText(parsed.data.ownerName),
          slug,
          website: parsed.data.website || null,
          industry: sanitizeText(parsed.data.industry),
          contactEmail: parsed.data.email,
          contactPhone: parsed.data.phone,
          description: `${parsed.data.companyName} — ${parsed.data.industry}`,
          status: "PENDING",
        },
      });
    });

    await emailService.companyRegistered(
      parsed.data.email,
      parsed.data.ownerName,
      parsed.data.companyName,
    );
    await emailService.adminNewCompany({
      companyName: parsed.data.companyName,
      ownerName: parsed.data.ownerName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      website: parsed.data.website || null,
      industry: parsed.data.industry,
    });

    await auditLog({
      action: "COMPANY_REGISTERED",
      entityType: "Company",
      metadata: { email: parsed.data.email, companyName: parsed.data.companyName },
    });

    return {
      success: true,
      data: { email: parsed.data.email, requiresVerification: false },
    };
  } catch (error) {
    return handleActionError(error);
  }
}
