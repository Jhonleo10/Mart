"use server";

import { AppError, handleActionError } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth/require-role";
import type { GeneralSettings, PricingPlan } from "@/lib/settings/defaults";
import type { ActionResult } from "@/lib/action-types";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { generalSettingsSchema, pricingPlansSchema, smtpSettingsInputSchema } from "@/lib/validations";
import { settingsRepository } from "@/repositories/settings.repository";

const razorpaySettingsInputSchema = z.object({
  keyId: z.string().max(100),
  registrationFee: z.number().int().min(0).max(10_000_000),
  keySecret: z.string().optional(),
  webhookSecret: z.string().optional(),
});

function revalidateSiteWide() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  revalidatePath("/products");
  revalidatePath("/seller/register");
  revalidatePath("/terms-of-service");
  revalidatePath("/privacy-policy");
  revalidatePath("/about");
  revalidatePath("/contact");
}

export async function savePricingPlans(plans: PricingPlan[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = pricingPlansSchema.safeParse(plans);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid pricing plans");
    }
    await settingsRepository.setPricingPlans(parsed.data);
    revalidateSiteWide();
    revalidatePath("/admin/pricing");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function saveSmtpSettings(input: {
  fromEmail: string;
  apiKey?: string;
}): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = smtpSettingsInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const current = await settingsRepository.getSmtp();
    await settingsRepository.setSmtp({
      fromEmail: parsed.data.fromEmail,
      apiKey: parsed.data.apiKey?.trim() ? parsed.data.apiKey.trim() : current.apiKey,
    });
    revalidateSiteWide();
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function saveRazorpaySettings(input: {
  keyId: string;
  registrationFee: number;
  keySecret?: string;
  webhookSecret?: string;
}): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = razorpaySettingsInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const current = await settingsRepository.getRazorpay();
    await settingsRepository.setRazorpay({
      keyId: parsed.data.keyId,
      registrationFee: parsed.data.registrationFee,
      keySecret: parsed.data.keySecret?.trim() ? parsed.data.keySecret.trim() : current.keySecret,
      webhookSecret: parsed.data.webhookSecret?.trim()
        ? parsed.data.webhookSecret.trim()
        : current.webhookSecret,
    });
    revalidateSiteWide();
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function saveGeneralSettings(general: GeneralSettings): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = generalSettingsSchema.safeParse(general);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input");
    }
    await settingsRepository.setGeneral(parsed.data);
    revalidateSiteWide();
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
