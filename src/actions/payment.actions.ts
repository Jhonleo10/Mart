"use server";

import { auth } from "@/lib/auth";
import { AppError, handleActionError } from "@/lib/errors";
import { createRazorpayOrder, getRazorpayCredentials } from "@/lib/razorpay";
import { fulfillCapturedPayment, assertPaymentOwnership } from "@/lib/payment/fulfill-payment";
import { isSellerRegistrationPlan } from "@/lib/payment/subscription";
import { canUpgradeToPlan } from "@/lib/plans/plan-catalog";
import { getCompanyEffectivePlan } from "@/lib/plans/company-plan";
import { companyRepository } from "@/repositories/company.repository";
import { paymentRepository } from "@/repositories/payment.repository";
import { settingsRepository, getRegistrationFee } from "@/repositories/settings.repository";
import { auditLog } from "@/lib/security/audit";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/action-types";
import { revalidatePath } from "next/cache";
import { companyRegisterSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { hashPassword } from "@/lib/security/password";
import { createUniqueSlug } from "@/lib/slug";
import { pendingCompanyRegistrationRepository } from "@/repositories/pending-company-registration.repository";

const PENDING_REGISTRATION_TTL_MS = 30 * 60 * 1000;

export async function getRegistrationFeeAction(): Promise<ActionResult<{ fee: number }>> {
  try {
    const fee = await getRegistrationFee();
    return { success: true, data: { fee } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function prepareCompanyRegistrationOrder(
  formData: FormData,
  planId: string,
): Promise<ActionResult<{ orderId: string; amount: number; keyId: string; email: string }>> {
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

    const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existingUser) throw new AppError("Email already registered");

    const existingCompany = await prisma.company.findFirst({
      where: { name: { equals: parsed.data.companyName, mode: "insensitive" } },
    });
    if (existingCompany) throw new AppError("Company name already registered");

    const plans = await settingsRepository.getPricingPlans();
    const plan = plans.find((p) => p.id === planId);
    if (!plan || plan.active === false || !plan.razorpayEnabled || !plan.priceAmount) {
      throw new AppError("Please select a valid seller plan", 400);
    }

    const creds = await getRazorpayCredentials();
    if (!creds.keyId || !creds.keySecret) {
      throw new AppError("Payment gateway not configured", 503);
    }

    const hashed = await hashPassword(parsed.data.password);
    const slug = await createUniqueSlug(parsed.data.companyName, "company");
    const receipt = `newco_${Date.now()}`;
    const order = await createRazorpayOrder(plan.priceAmount, receipt, {
      planId,
      type: "REGISTRATION",
      email: parsed.data.email,
    });

    await pendingCompanyRegistrationRepository.deleteExpired();
    await pendingCompanyRegistrationRepository.create({
      razorpayOrderId: order.id,
      planId,
      email: parsed.data.email,
      hashedPassword: hashed,
      companyName: parsed.data.companyName,
      ownerName: parsed.data.ownerName,
      phone: parsed.data.phone,
      website: parsed.data.website || null,
      industry: parsed.data.industry,
      slug,
      expiresAt: new Date(Date.now() + PENDING_REGISTRATION_TTL_MS),
    });

    return {
      success: true,
      data: {
        orderId: order.id,
        amount: plan.priceAmount,
        keyId: creds.keyId,
        email: parsed.data.email,
      },
    };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createRegistrationOrder(): Promise<
  ActionResult<{ orderId: string; amount: number; keyId: string }>
> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COMPANY") {
      throw new AppError("Unauthorized", 401);
    }

    const company = await companyRepository.findByUserId(session.user.id);
    if (!company) throw new AppError("Complete company profile first", 400);

    if (company.paymentVerified) {
      throw new AppError("Registration payment already completed", 400);
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) throw new AppError("User not found", 404);

    const amount = await getRegistrationFee();
    const creds = await getRazorpayCredentials();
    if (!creds.keyId || !creds.keySecret) {
      throw new AppError("Payment gateway not configured", 503);
    }

    const receipt = `reg_${company.id.slice(-8)}_${Date.now()}`;
    const order = await createRazorpayOrder(amount, receipt, {
      companyId: company.id,
      type: "REGISTRATION",
    });

    await paymentRepository.create({
      type: "REGISTRATION",
      razorpayOrderId: order.id,
      amount,
      status: "PENDING",
      company: { connect: { id: company.id } },
      metadata: { receipt },
    });

    return {
      success: true,
      data: { orderId: order.id, amount, keyId: creds.keyId },
    };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createPlanOrder(
  planId: string,
): Promise<ActionResult<{ orderId: string; amount: number; keyId: string }>> {
  try {
    const session = await auth();
    if (!session?.user) throw new AppError("Please login to continue", 401);

    if (session.user.role !== "COMPANY") {
      throw new AppError("Please register or login as a company to purchase this plan", 403);
    }

    const company = await companyRepository.findByUserId(session.user.id);
    if (!company) {
      throw new AppError("Complete your company profile before payment", 400);
    }

    const plans = await settingsRepository.getPricingPlans();
    const plan = plans.find((p) => p.id === planId);
    if (!plan || !plan.razorpayEnabled || !plan.priceAmount) {
      throw new AppError("This plan does not require payment", 400);
    }

    const currentPlan = getCompanyEffectivePlan(company);
    const upgradeCheck = canUpgradeToPlan(currentPlan, planId, company.paymentVerified);
    if (!upgradeCheck.ok) {
      throw new AppError(upgradeCheck.reason, 400);
    }

    const creds = await getRazorpayCredentials();
    if (!creds.keyId || !creds.keySecret) {
      throw new AppError("Payment gateway not configured", 503);
    }

    const receipt = `plan_${planId.slice(-8)}_${Date.now()}`;
    const paymentType = isSellerRegistrationPlan(planId) ? "REGISTRATION" : "SUBSCRIPTION";
    const order = await createRazorpayOrder(plan.priceAmount, receipt, {
      planId,
      type: paymentType,
      companyId: company.id,
    });

    await paymentRepository.create({
      type: paymentType,
      razorpayOrderId: order.id,
      amount: plan.priceAmount,
      status: "PENDING",
      company: { connect: { id: company.id } },
      metadata: { receipt, planId },
    });

    return {
      success: true,
      data: { orderId: order.id, amount: plan.priceAmount, keyId: creds.keyId },
    };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function verifyPlanPayment(data: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  planId: string;
}): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COMPANY") {
      throw new AppError("Unauthorized", 401);
    }

    const company = await companyRepository.findByUserId(session.user.id);
    if (!company) throw new AppError("Company not found", 404);

    const ownership = await assertPaymentOwnership(data.razorpayOrderId, company.id);
    if (!ownership.ok) {
      if (ownership.reason === "forbidden") throw new AppError("Forbidden", 403);
      throw new AppError("Payment record not found", 404);
    }

    const result = await fulfillCapturedPayment(
      data.razorpayOrderId,
      data.razorpayPaymentId,
      data.razorpaySignature,
      "client",
    );

    if (!result.ok) {
      if (result.reason === "invalid_signature") {
        throw new AppError("Invalid payment signature", 400);
      }
      throw new AppError("Payment record not found", 404);
    }

    await auditLog({
      userId: session.user.id,
      action: "PAYMENT_SIGNATURE_VERIFIED",
      entityType: "Payment",
      metadata: { planId: data.planId, orderId: data.razorpayOrderId },
    });

    revalidatePath("/company/dashboard");
    revalidatePath("/company/profile");
    revalidatePath("/company/settings");
    revalidatePath("/company/analytics");
    revalidatePath("/company/ai");
    revalidatePath("/company/landing");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function verifyRegistrationPayment(data: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COMPANY") {
      throw new AppError("Unauthorized", 401);
    }

    const company = await companyRepository.findByUserId(session.user.id);
    if (!company) throw new AppError("Company not found", 404);

    const ownership = await assertPaymentOwnership(data.razorpayOrderId, company.id);
    if (!ownership.ok) {
      if (ownership.reason === "forbidden") throw new AppError("Forbidden", 403);
      throw new AppError("Payment record not found", 404);
    }

    const result = await fulfillCapturedPayment(
      data.razorpayOrderId,
      data.razorpayPaymentId,
      data.razorpaySignature,
      "client",
    );

    if (!result.ok) {
      if (result.reason === "invalid_signature") {
        throw new AppError("Invalid payment signature", 400);
      }
      throw new AppError("Payment record not found", 404);
    }

    await auditLog({
      userId: session.user.id,
      action: "PAYMENT_SIGNATURE_VERIFIED",
      entityType: "Payment",
      metadata: { type: "REGISTRATION", orderId: data.razorpayOrderId },
    });

    revalidatePath("/company/dashboard");
    revalidatePath("/company/settings");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
