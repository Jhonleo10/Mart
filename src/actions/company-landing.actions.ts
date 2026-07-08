"use server";

import { auth } from "@/lib/auth";
import { AppError, handleActionError } from "@/lib/errors";
import { companyRepository } from "@/repositories/company.repository";
import { ensureMetaDescription, ensureMetaTitle } from "@/lib/seo-field-defaults";
import { sanitizeText } from "@/lib/security/sanitize";
import type { ActionResult } from "@/lib/action-types";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const themeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  heroHeadline: z.string().max(120).optional(),
});

const landingSchema = z.object({
  metaTitle: z.string().min(1).max(70),
  metaDescription: z.string().min(1).max(160),
  seoTagline: z.string().max(120).optional().or(z.literal("")),
  landingEnabled: z.preprocess(
    (v) => v === true || v === "true",
    z.boolean(),
  ),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  heroHeadline: z.string().optional(),
});

export async function saveCompanyLandingSettings(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COMPANY") {
      throw new AppError("Unauthorized", 401);
    }

    const company = await companyRepository.findByUserId(session.user.id);
    if (!company) throw new AppError("Company not found", 404);

    const rawTitle = String(formData.get("metaTitle") ?? "").trim();
    const rawDescription = String(formData.get("metaDescription") ?? "").trim();

    const metaTitle = ensureMetaTitle(rawTitle, company.name);
    const metaDescription = ensureMetaDescription(
      rawDescription,
      company.name,
      company.description,
    );

    if (metaTitle.length < 10) {
      throw new AppError("Meta title should be at least 10 characters");
    }
    if (metaDescription.length < 40) {
      throw new AppError("Meta description should be at least 40 characters");
    }

    const parsed = landingSchema.safeParse({
      metaTitle,
      metaDescription,
      seoTagline: formData.get("seoTagline") || "",
      landingEnabled: formData.get("landingEnabled"),
      primaryColor: formData.get("primaryColor") || undefined,
      accentColor: formData.get("accentColor") || undefined,
      heroHeadline: formData.get("heroHeadline") || undefined,
    });

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new AppError(issue?.message ?? "Invalid input");
    }

    const themeParsed = themeSchema.safeParse({
      primaryColor: parsed.data.primaryColor,
      accentColor: parsed.data.accentColor,
      heroHeadline: parsed.data.heroHeadline
        ? sanitizeText(parsed.data.heroHeadline)
        : undefined,
    });

    const vendorLandingTheme = themeParsed.success
      ? {
          primaryColor: themeParsed.data.primaryColor ?? "#2563eb",
          accentColor: themeParsed.data.accentColor ?? "#10b981",
          heroHeadline: themeParsed.data.heroHeadline ?? null,
        }
      : {
          primaryColor: "#2563eb",
          accentColor: "#10b981",
          heroHeadline: null,
        };

    await companyRepository.update(company.id, {
      metaTitle: sanitizeText(parsed.data.metaTitle),
      metaDescription: sanitizeText(parsed.data.metaDescription),
      seoTagline: parsed.data.seoTagline ? sanitizeText(parsed.data.seoTagline) : null,
      landingEnabled: parsed.data.landingEnabled,
      vendorLandingTheme,
    });

    revalidatePath("/company/landing");
    revalidatePath(`/vendor/${company.slug}`);
    revalidatePath(`/companies/${company.slug}`);

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function applyAiCopyToLanding(input: {
  tagline?: string;
  headline?: string;
}): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COMPANY") {
      throw new AppError("Unauthorized", 401);
    }

    const company = await companyRepository.findByUserId(session.user.id);
    if (!company) throw new AppError("Company not found", 404);

    const existingTheme = (company.vendorLandingTheme as Record<string, unknown> | null) ?? {};
    const tagline = input.tagline?.trim();
    const headline = input.headline?.trim();

    await companyRepository.update(company.id, {
      ...(tagline ? { seoTagline: sanitizeText(tagline) } : {}),
      vendorLandingTheme: {
        ...existingTheme,
        ...(headline ? { heroHeadline: sanitizeText(headline) } : {}),
        primaryColor: existingTheme.primaryColor ?? "#2563eb",
        accentColor: existingTheme.accentColor ?? "#10b981",
      },
    });

    revalidatePath("/company/landing");
    revalidatePath(`/vendor/${company.slug}`);

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
