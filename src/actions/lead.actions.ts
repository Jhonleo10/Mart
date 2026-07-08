"use server";

import { auth } from "@/lib/auth";
import { AppError, handleActionError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { emailService } from "@/lib/email";
import { companyRepository } from "@/repositories/company.repository";
import { notificationRepository } from "@/repositories/notification.repository";
import { bookingRepository } from "@/repositories/booking.repository";
import { sanitizeText } from "@/lib/security/sanitize";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/lib/action-types";
import { contactVendorSchema } from "@/lib/validations";

export async function contactVendor(formData: FormData): Promise<ActionResult> {
  try {
    const raw = {
      companyId: formData.get("companyId"),
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message"),
    };

    const parsed = contactVendorSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const limit = await rateLimit(parsed.data.email, "api");
    if (!limit.success) throw new AppError("Too many requests. Please try again later.", 429);

    const company = await companyRepository.findById(parsed.data.companyId);
    if (!company || company.status !== "APPROVED") {
      throw new AppError("Company not found", 404);
    }

    const session = await auth();

    await bookingRepository.create({
      type: "CONTACT",
      name: sanitizeText(parsed.data.name),
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: sanitizeText(parsed.data.message),
      company: { connect: { id: company.id } },
      ...(session?.user ? { user: { connect: { id: session.user.id } } } : {}),
    });

    await emailService.newLead(company.contactEmail, {
      productName: "General enquiry",
      companyName: company.name,
      leadName: parsed.data.name,
      leadEmail: parsed.data.email,
      leadPhone: parsed.data.phone,
      message: parsed.data.message,
    });

    await notificationRepository.create(
      company.userId,
      "New Contact Enquiry",
      `${parsed.data.name} sent a message via your vendor page.`,
      "/company/leads",
    );

    revalidatePath("/company/leads");
    revalidatePath(`/companies/${company.slug}`);

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
