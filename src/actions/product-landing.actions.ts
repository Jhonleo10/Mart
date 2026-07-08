"use server";

import { auth } from "@/lib/auth";
import { AppError, handleActionError } from "@/lib/errors";
import type { ActionResult } from "@/lib/action-types";
import { companyRepository } from "@/repositories/company.repository";
import { productRepository } from "@/repositories/product.repository";
import { productLandingRepository } from "@/repositories/product-landing.repository";
import type { ProductLandingConfig } from "@/lib/product-landing/types";
import { resolveDraftLandingConfig } from "@/lib/product-landing/resolve-config";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getProductPublicPath } from "@/lib/product-public-url";
import { sanitizeText } from "@/lib/security/sanitize";

async function assertProductOwner(productId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    throw new AppError("Unauthorized", 401);
  }
  const company = await companyRepository.findByUserId(session.user.id);
  if (!company) throw new AppError("Company not found", 404);

  const product = await productRepository.findById(productId);
  if (!product || product.companyId !== company.id) {
    throw new AppError("Product not found", 404);
  }

  return { product, company };
}

const configSchema = z.object({
  config: z.string().min(2),
});

export async function saveProductLandingDraft(
  productId: string,
  configJson: string,
): Promise<ActionResult> {
  try {
    const { product } = await assertProductOwner(productId);
    const parsed = configSchema.safeParse({ config: configJson });
    if (!parsed.success) throw new AppError("Invalid configuration");

    const config = JSON.parse(parsed.data.config) as ProductLandingConfig;
    await productLandingRepository.saveDraft(productId, config);

    revalidatePath(`/company/products/${productId}/landing`);
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function publishProductLanding(
  productId: string,
  configJson: string,
): Promise<ActionResult> {
  try {
    const { product } = await assertProductOwner(productId);
    const parsed = configSchema.safeParse({ config: configJson });
    if (!parsed.success) throw new AppError("Invalid configuration");

    const config = JSON.parse(parsed.data.config) as ProductLandingConfig;
    await productLandingRepository.publish(productId, config);

    revalidatePath(`/product/${product.slug}`);
    revalidatePath(`/products/${product.slug}`);
    revalidatePath(`/company/products/${productId}/landing`);
    revalidatePath("/company/products");
    revalidatePath("/company/landing");

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function applyAiMarketingToProduct(input: {
  productId: string;
  headline: string;
  tagline?: string;
  cta?: string;
}): Promise<ActionResult> {
  try {
    const { product } = await assertProductOwner(input.productId);
    const headline = sanitizeText(input.headline).slice(0, 120);
    const tagline = input.tagline ? sanitizeText(input.tagline).slice(0, 200) : undefined;
    const cta = input.cta ? sanitizeText(input.cta).slice(0, 40) : "Schedule a free demo";

    await productRepository.update(product.id, {
      metaTitle: headline,
      ...(product.shortDescription.length < 80 && tagline
        ? { shortDescription: tagline }
        : {}),
    });

    const landingProduct = await productLandingRepository.findForLandingByProductId(product.id);
    if (landingProduct) {
      await productLandingRepository.ensureForProduct(product.id);
      const landingPage = await productLandingRepository.findByProductId(product.id);
      const config = resolveDraftLandingConfig(landingProduct, landingPage);
      config.sections.hero = {
        ...config.sections.hero,
        tagline: headline,
        shortDescription: tagline ?? config.sections.hero.shortDescription,
        primaryCtaLabel: cta,
      };
      config.seo = {
        ...config.seo,
        title: headline,
        ogTitle: headline,
        ...(tagline
          ? {
              description: tagline,
              ogDescription: tagline,
            }
          : {}),
      };
      await productLandingRepository.saveDraft(product.id, config);
    }

    revalidatePath(`/company/products/${product.id}/edit`);
    revalidatePath("/company/ai");
    revalidatePath(getProductPublicPath(product.slug));

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function restoreProductLandingVersion(
  productId: string,
  versionId: string,
): Promise<ActionResult> {
  try {
    const { product } = await assertProductOwner(productId);
    const restored = await productLandingRepository.restoreVersion(versionId, productId);
    if (!restored) throw new AppError("Version not found", 404);

    revalidatePath(`/product/${product.slug}`);
    revalidatePath(`/company/products/${productId}/landing`);

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getProductLandingEditorData(productId: string) {
  const { product, company } = await assertProductOwner(productId);
  const landingPage = await productLandingRepository.ensureForProduct(productId);
  const fullProduct =
    (await productLandingRepository.findForLandingByProductId(productId)) ?? product;
  const config = resolveDraftLandingConfig(fullProduct, landingPage);
  const versions = landingPage
    ? await productLandingRepository.listVersions(landingPage.id)
    : [];

  return {
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      status: product.status,
    },
    config,
    versions: versions.map((v) => ({
      id: v.id,
      label: v.label,
      createdAt: v.createdAt.toISOString(),
    })),
    landingStatus: landingPage?.status ?? "DRAFT",
    hasSeoAccess: false,
    requiredPlan: "N/A",
  };
}
