import { emailService } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { mapPlanIdToSubscription } from "@/lib/payment/subscription";
import { auditLog } from "@/lib/security/audit";
import { verifyPaymentSignature } from "@/lib/razorpay";
import type { Prisma, SubscriptionPlan } from "@prisma/client";

const PLAN_DURATION_DAYS: Record<SubscriptionPlan, number> = {
  BASIC: 365,
  GROWTH: 365,
  PROFESSIONAL: 365,
  ENTERPRISE: 365,
};

type TxClient = Prisma.TransactionClient;

async function activateSubscriptionInTx(tx: TxClient, companyId: string, plan: SubscriptionPlan) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + PLAN_DURATION_DAYS[plan]);

  const existing = await tx.subscription.findFirst({
    where: { companyId, status: "ACTIVE" },
  });

  if (existing) {
    return tx.subscription.update({
      where: { id: existing.id },
      data: { plan, status: "ACTIVE", endDate },
    });
  }

  return tx.subscription.create({
    data: { companyId, plan, status: "ACTIVE", endDate },
  });
}

export async function fulfillCapturedPayment(
  orderId: string,
  paymentId: string,
  paymentSignature: string,
  source: "client" | "webhook",
) {
  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId } });
  if (!payment) {
    return { ok: false as const, reason: "payment_not_found" };
  }
  if (payment.status === "COMPLETED") {
    return { ok: true as const, alreadyCompleted: true };
  }

  if (source === "client") {
    const valid = await verifyPaymentSignature(orderId, paymentId, paymentSignature);
    if (!valid) {
      return { ok: false as const, reason: "invalid_signature" };
    }
  }

  const metadata = payment.metadata as { planId?: string } | null;
  const plan = mapPlanIdToSubscription(metadata?.planId);

  type TxResult =
    | { kind: "already_completed" }
    | { kind: "company_not_found" }
    | {
      kind: "fulfilled";
      company: NonNullable<Awaited<ReturnType<TxClient["company"]["findUnique"]>>>;
      ownerName: string;
      wasAlreadyPaid: boolean;
    };

  const txResult = await prisma.$transaction(async (tx): Promise<TxResult> => {
    const updated = await tx.payment.updateMany({
      where: { id: payment.id, status: { not: "COMPLETED" } },
      data: {
        status: "COMPLETED",
        razorpayPaymentId: paymentId,
        razorpaySignature: paymentSignature,
      },
    });

    if (updated.count === 0) {
      return { kind: "already_completed" };
    }

    const company = await tx.company.findUnique({
      where: { id: payment.companyId },
      include: { user: true },
    });
    if (!company) {
      return { kind: "company_not_found" };
    }

    const wasAlreadyPaid = company.paymentVerified;

    await tx.company.update({
      where: { id: company.id },
      data: {
        paymentVerified: true,
        selectedPlan: plan,
      },
    });

    await activateSubscriptionInTx(tx, company.id, plan);

    return { kind: "fulfilled", company, ownerName: company.ownerName ?? company.user?.name ?? "there", wasAlreadyPaid };
  });

  if (txResult.kind === "already_completed") {
    return { ok: true as const, alreadyCompleted: true };
  }
  if (txResult.kind === "company_not_found") {
    return { ok: false as const, reason: "company_not_found" };
  }

  const { company, ownerName, wasAlreadyPaid } = txResult;

  if (!wasAlreadyPaid) {
    if (!company.adminApproved) {
      await emailService.companyPendingApproval(company.contactEmail, ownerName, company.name);
    }
  }

  await auditLog({
    action: source === "webhook" ? "PAYMENT_WEBHOOK_CAPTURED" : "PAYMENT_CLIENT_FULFILLED",
    entityType: "Payment",
    entityId: payment.id,
    metadata: { companyId: company.id, plan, source },
  });

  return { ok: true as const, alreadyCompleted: false };
}

export async function markPaymentFailed(orderId: string) {
  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId } });
  if (!payment || payment.status === "FAILED") return;

  await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });

  await auditLog({
    action: "PAYMENT_WEBHOOK_FAILED",
    entityType: "Payment",
    entityId: payment.id,
  });
}

/** Verify the authenticated company owns the payment before fulfillment. */
export async function assertPaymentOwnership(orderId: string, companyId: string) {
  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId } });
  if (!payment) {
    return { ok: false as const, reason: "payment_not_found" };
  }
  if (payment.companyId !== companyId) {
    return { ok: false as const, reason: "forbidden" };
  }
  return { ok: true as const, payment };
}
