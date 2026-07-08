"use server";

import { auth } from "@/lib/auth";
import { AppError, handleActionError } from "@/lib/errors";
import { createUniqueSlug } from "@/lib/slug";
import { adminNoteSchema, companyProfileSchema } from "@/lib/validations";
import { companyRepository } from "@/repositories/company.repository";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/security/audit";
import { sanitizeText } from "@/lib/security/sanitize";
import type { ActionResult } from "@/lib/action-types";

export async function saveCompanyProfile(
  formData: FormData,
): Promise<ActionResult<{ companyId: string }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COMPANY") {
      throw new AppError("Unauthorized", 401);
    }

    const raw = {
      name: formData.get("name"),
      website: formData.get("website") || "",
      description: formData.get("description"),
      industry: formData.get("industry"),
      contactEmail: formData.get("contactEmail"),
      contactPhone: formData.get("contactPhone"),
      logo: formData.get("logo") || "",
    };

    const parsed = companyProfileSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const existing = await companyRepository.findByUserId(session.user.id);
    const slug = await createUniqueSlug(parsed.data.name, "company", existing?.id);

    const data = {
      name: sanitizeText(parsed.data.name),
      slug,
      website: parsed.data.website || null,
      description: sanitizeText(parsed.data.description),
      industry: sanitizeText(parsed.data.industry),
      contactEmail: parsed.data.contactEmail,
      contactPhone: parsed.data.contactPhone,
      logo: parsed.data.logo || null,
      user: { connect: { id: session.user.id } },
    };

    const company = existing
      ? await companyRepository.update(existing.id, data)
      : await companyRepository.create(data);

    await auditLog({
      userId: session.user.id,
      action: "COMPANY_PROFILE_SAVED",
      entityType: "Company",
      entityId: company.id,
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/company/settings");
    revalidatePath("/company/dashboard");
    revalidatePath(`/companies/${company.slug}`);
    revalidatePath(`/vendor/${company.slug}`);

    return { success: true, data: { companyId: company.id } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function approveCompany(
  companyId: string,
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (session?.user.role !== "ADMIN") throw new AppError("Forbidden", 403);

    const company = await companyRepository.findById(companyId);
    if (!company) throw new AppError("Company not found", 404);

    await prisma.$transaction([
      prisma.company.update({
        where: { id: companyId },
        data: {
          status: "APPROVED",
          adminApproved: true,
          rejectionNote: null,
        },
      }),
      prisma.user.update({
        where: { id: company.userId },
        data: { status: "ACTIVE", emailVerified: new Date() },
      }),
    ]);

    await auditLog({
      userId: session.user.id,
      action: "COMPANY_APPROVED",
      entityType: "Company",
      entityId: companyId,
    });

    const { emailService } = await import("@/lib/email");
    const { notificationRepository } = await import("@/repositories/notification.repository");
    const { revalidatePath } = await import("next/cache");

    await emailService.companyApproved(
      company.contactEmail,
      company.ownerName ?? company.user?.name ?? "there",
      company.name,
    );
    await notificationRepository.create(
      company.userId,
      "Company Approved",
      `Your company "${company.name}" has been verified. You can now explore and sell products.`,
      "/company/dashboard",
    );

    revalidatePath("/admin/companies");
    revalidatePath("/admin/dashboard");
    revalidatePath("/company/dashboard");

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function rejectCompany(
  companyId: string,
  note?: string,
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (session?.user.role !== "ADMIN") throw new AppError("Forbidden", 403);

    if (note?.trim()) {
      const parsed = adminNoteSchema.safeParse(note.trim());
      if (!parsed.success) {
        throw new AppError(parsed.error.issues[0]?.message ?? "Invalid note");
      }
    }

    const company = await companyRepository.findById(companyId);
    if (!company) throw new AppError("Company not found", 404);

    await companyRepository.update(companyId, {
      status: "REJECTED",
      rejectionNote: note ?? null,
    });

    await auditLog({
      userId: session.user.id,
      action: "COMPANY_REJECTED",
      entityType: "Company",
      entityId: companyId,
      metadata: { note },
    });

    const { emailService } = await import("@/lib/email");
    await emailService.companyRejected(
      company.contactEmail,
      company.ownerName ?? company.user?.name ?? "there",
      company.name,
      note,
    );

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function requestCompanyChanges(
  companyId: string,
  note: string,
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (session?.user.role !== "ADMIN") throw new AppError("Forbidden", 403);

    const parsed = adminNoteSchema.safeParse(note.trim());
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid note");
    }

    const company = await companyRepository.findById(companyId);
    if (!company) throw new AppError("Company not found", 404);

    await companyRepository.update(companyId, {
      rejectionNote: parsed.data,
      status: "PENDING",
      adminApproved: false,
    });

    const { emailService } = await import("@/lib/email");
    await emailService.companyRejected(
      company.contactEmail,
      company.ownerName ?? company.user?.name ?? "there",
      company.name,
      `Changes requested: ${parsed.data}`,
    );

    await auditLog({
      userId: session.user.id,
      action: "COMPANY_CHANGES_REQUESTED",
      entityType: "Company",
      entityId: companyId,
      metadata: { note },
    });

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function requestCompanyChangesFormAction(companyId: string, note: string) {
  await requestCompanyChanges(companyId, note);
}

export async function suspendCompany(companyId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (session?.user.role !== "ADMIN") throw new AppError("Forbidden", 403);

    await companyRepository.update(companyId, { status: "SUSPENDED" });
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function approveCompanyFormAction(companyId: string) {
  await approveCompany(companyId);
}

export async function rejectCompanyFormAction(companyId: string) {
  await rejectCompany(companyId);
}

export async function suspendCompanyFormAction(companyId: string) {
  await suspendCompany(companyId);
}

export async function toggleCompanyActive(companyId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (session?.user.role !== "ADMIN") throw new AppError("Forbidden", 403);

    const company = await companyRepository.findById(companyId);
    if (!company) throw new AppError("Company not found", 404);

    if (company.status === "APPROVED") {
      await companyRepository.update(companyId, { status: "SUSPENDED" });
    } else if (company.status === "SUSPENDED") {
      await companyRepository.update(companyId, { status: "APPROVED" });
    } else {
      throw new AppError("Only approved or suspended companies can be toggled", 400);
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/companies");

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function toggleCompanyActiveAction(companyId: string) {
  await toggleCompanyActive(companyId);
}
