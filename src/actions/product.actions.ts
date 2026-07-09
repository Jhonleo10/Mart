"use server";

import { auth } from "@/lib/auth";
import { AppError, handleActionError } from "@/lib/errors";
import { createUniqueSlug } from "@/lib/slug";
import { productSchema, productDraftSchema } from "@/lib/validations";
import { companyRepository } from "@/repositories/company.repository";
import { productRepository } from "@/repositories/product.repository";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/slug";
import { auditLog } from "@/lib/security/audit";
import { sanitizeText } from "@/lib/security/sanitize";
import { getProductPublicPath } from "@/lib/product-public-url";
import type { ActionResult } from "@/lib/action-types";

export async function createProduct(
  formData: FormData,
): Promise<ActionResult<{ productId: string }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COMPANY") {
      throw new AppError("Unauthorized", 401);
    }

    const company = await companyRepository.findByUserId(session.user.id);
    if (!company || company.status !== "APPROVED") {
      throw new AppError("Company must be approved to create products", 403);
    }

    const { getCompanyEffectivePlan, productLimitForPlan } = await import("@/lib/plans/company-plan");
    const plan = getCompanyEffectivePlan(company);
    const productLimit = productLimitForPlan(plan);
    if (productLimit === 0) {
      throw new AppError("Activate a subscription plan to list products", 403);
    }
    if (productLimit !== null) {
      const currentCount = await prisma.product.count({ where: { companyId: company.id } });
      if (currentCount >= productLimit) {
        throw new AppError(
          `Your plan allows up to ${productLimit} product${productLimit === 1 ? "" : "s"}. Upgrade your plan to add more.`,
          403,
        );
      }
    }

    const features = formData.getAll("features").map(String).filter(Boolean);
    const tags = formData.getAll("tags").map(String).filter(Boolean);
    const images = formData.getAll("images").map(String).filter(Boolean);

    const raw = {
      name: formData.get("name"),
      shortDescription: formData.get("shortDescription"),
      fullDescription: formData.get("fullDescription"),
      categoryId: formData.get("categoryId"),
      pricingModel: formData.get("pricingModel"),
      price: formData.get("price") || undefined,
      features,
      websiteUrl: formData.get("websiteUrl") || "",
      demoUrl: formData.get("demoUrl") || "",
      supportEmail: formData.get("supportEmail") || "",
      tags,
      images,
    };

    const parsed = productSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const slug = await createUniqueSlug(parsed.data.name, "product");

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: sanitizeText(parsed.data.name),
          slug,
          shortDescription: sanitizeText(parsed.data.shortDescription),
          fullDescription: sanitizeText(parsed.data.fullDescription),
          pricingModel: parsed.data.pricingModel,
          price: parsed.data.price ?? null,
          features: parsed.data.features,
          websiteUrl: parsed.data.websiteUrl || null,
          demoUrl: parsed.data.demoUrl || null,
          supportEmail: parsed.data.supportEmail || null,
          status: "PUBLISHED",
          adminVerified: false,
          company: { connect: { id: company.id } },
          category: { connect: { id: parsed.data.categoryId } },
        },
      });

      if (parsed.data.images?.length) {
        await tx.productImage.createMany({
          data: parsed.data.images.map((url, i) => ({
            productId: created.id,
            url,
            order: i,
          })),
        });
      }

      if (parsed.data.tags?.length) {
        for (const tagName of parsed.data.tags) {
          const tagSlug = createSlug(tagName);
          const tag = await tx.tag.upsert({
            where: { slug: tagSlug },
            create: { name: tagName, slug: tagSlug },
            update: {},
          });
          await tx.productTag.create({
            data: { productId: created.id, tagId: tag.id },
          });
        }
      }

      return created;
    });

    await auditLog({
      userId: session.user.id,
      action: "PRODUCT_CREATED",
      entityType: "Product",
      entityId: product.id,
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/company/products");
    revalidatePath("/company/dashboard");
    revalidatePath("/products");
    revalidatePath(getProductPublicPath(slug));

    return { success: true, data: { productId: product.id } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COMPANY") {
      throw new AppError("Unauthorized", 401);
    }

    const company = await companyRepository.findByUserId(session.user.id);
    const product = await productRepository.findById(productId);
    if (!product || product.companyId !== company?.id) {
      throw new AppError("Product not found", 404);
    }

    await prisma.product.delete({ where: { id: productId } });

    await auditLog({
      userId: session.user.id,
      action: "PRODUCT_DELETED",
      entityType: "Product",
      entityId: productId,
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/company/products");
    revalidatePath("/company/dashboard");
    revalidatePath("/products");

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function approveProduct(productId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (session?.user.role !== "ADMIN") throw new AppError("Forbidden", 403);

    const product = await productRepository.findById(productId);
    if (!product) throw new AppError("Product not found", 404);

    if (product.status !== "PUBLISHED") {
      throw new AppError("Only live products can receive the verified badge", 400);
    }

    await productRepository.update(productId, { adminVerified: true, rejectionNote: null });

    await auditLog({
      userId: session.user.id,
      action: "PRODUCT_VERIFIED",
      entityType: "Product",
      entityId: productId,
    });

    const { emailService } = await import("@/lib/email");
    const { notificationRepository } = await import("@/repositories/notification.repository");

    await emailService.productApproved(product.company.contactEmail, product.name);
    await notificationRepository.create(
      product.company.userId,
      "Verified Badge Granted",
      `"${product.name}" now displays the admin verified badge on the marketplace.`,
      `/company/products`,
    );

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(getProductPublicPath(product.slug));
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function unverifyProduct(productId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (session?.user.role !== "ADMIN") throw new AppError("Forbidden", 403);

    const product = await productRepository.findById(productId);
    if (!product) throw new AppError("Product not found", 404);

    await productRepository.update(productId, { adminVerified: false });

    await auditLog({
      userId: session.user.id,
      action: "PRODUCT_UNVERIFIED",
      entityType: "Product",
      entityId: productId,
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(getProductPublicPath(product.slug));
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function rejectProduct(
  productId: string,
  note?: string,
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (session?.user.role !== "ADMIN") throw new AppError("Forbidden", 403);

    const product = await productRepository.findById(productId);
    if (!product) throw new AppError("Product not found", 404);

    await productRepository.update(productId, {
      status: "REJECTED",
      featured: false,
      rejectionNote: note ?? null,
    });

    await auditLog({
      userId: session.user.id,
      action: "PRODUCT_REJECTED",
      entityType: "Product",
      entityId: productId,
      metadata: { note },
    });

    const { emailService } = await import("@/lib/email");
    const { getSupportEmail } = await import("@/repositories/settings.repository");
    const supportEmail = await getSupportEmail();
    await emailService.productRejected(product.company.contactEmail, product.name, note, supportEmail);

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(getProductPublicPath(product.slug));

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function approveProductFormAction(productId: string) {
  await approveProduct(productId);
}

export async function rejectProductFormAction(formData: FormData) {
  const productId = String(formData.get("productId"));
  const note = String(formData.get("note") ?? "");
  await rejectProduct(productId, note || undefined);
}

export async function deleteProductFormAction(productId: string) {
  await deleteProduct(productId);
}

export async function updateProduct(
  productId: string,
  formData: FormData,
  options?: { asDraft?: boolean },
): Promise<ActionResult<{ productId: string }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COMPANY") {
      throw new AppError("Unauthorized", 401);
    }

    const company = await companyRepository.findByUserId(session.user.id);
    const existing = await productRepository.findById(productId);
    if (!existing || existing.companyId !== company?.id) {
      throw new AppError("Product not found", 404);
    }

    const features = formData.getAll("features").map(String).filter(Boolean);
    const tags = formData.getAll("tags").map(String).filter(Boolean);
    const images = formData.getAll("images").map(String).filter(Boolean);

    const raw = {
      name: formData.get("name"),
      shortDescription: formData.get("shortDescription"),
      fullDescription: formData.get("fullDescription"),
      categoryId: formData.get("categoryId"),
      pricingModel: formData.get("pricingModel"),
      price: formData.get("price") || undefined,
      features,
      websiteUrl: formData.get("websiteUrl") || "",
      demoUrl: formData.get("demoUrl") || "",
      supportEmail: formData.get("supportEmail") || "",
      tags,
      images: images.length > 0 ? images : existing.images.map((i) => i.url),
    };

    const schema = options?.asDraft ? productDraftSchema : productSchema;
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const normalized = {
      ...parsed.data,
      shortDescription: parsed.data.shortDescription || "Draft product",
      fullDescription:
        parsed.data.fullDescription || "Draft description — complete before publishing.",
      features:
        parsed.data.features && parsed.data.features.length > 0
          ? parsed.data.features.filter(Boolean)
          : options?.asDraft
            ? ["Draft feature"]
            : [],
      images: parsed.data.images ?? existing.images.map((i) => i.url),
    };

    if (!options?.asDraft) {
      const publishCheck = productSchema.safeParse({
        ...raw,
        shortDescription: normalized.shortDescription,
        fullDescription: normalized.fullDescription,
        features: normalized.features,
        images: normalized.images,
      });
      if (!publishCheck.success) {
        throw new AppError(publishCheck.error.issues[0]?.message ?? "Invalid input");
      }
    }

    const nextStatus = options?.asDraft
      ? "DRAFT"
      : existing.status === "REJECTED" || existing.status === "DRAFT"
        ? "PUBLISHED"
        : existing.status === "PUBLISHED"
          ? "PUBLISHED"
          : "PUBLISHED";

    const clearSpotlight = nextStatus !== "PUBLISHED" && existing.featured;

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          name: sanitizeText(normalized.name),
          shortDescription: sanitizeText(normalized.shortDescription),
          fullDescription: sanitizeText(normalized.fullDescription),
          pricingModel: normalized.pricingModel,
          price: normalized.price ?? null,
          features: normalized.features,
          websiteUrl: normalized.websiteUrl || null,
          demoUrl: normalized.demoUrl || null,
          supportEmail: normalized.supportEmail || null,
          status: nextStatus,
          ...(clearSpotlight ? { featured: false } : {}),
          category: { connect: { id: normalized.categoryId } },
        },
      });

      if (images.length > 0) {
        await tx.productImage.deleteMany({ where: { productId } });
        await tx.productImage.createMany({
          data: normalized.images!.map((url, i) => ({
            productId,
            url,
            order: i,
          })),
        });
      }

      if (normalized.tags) {
        await tx.productTag.deleteMany({ where: { productId } });
        for (const tagName of normalized.tags) {
          const tagSlug = createSlug(tagName);
          const tag = await tx.tag.upsert({
            where: { slug: tagSlug },
            create: { name: tagName, slug: tagSlug },
            update: {},
          });
          await tx.productTag.create({ data: { productId, tagId: tag.id } });
        }
      }
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/company/products");
    revalidatePath(getProductPublicPath(existing.slug));
    revalidatePath("/products");

    return { success: true, data: { productId } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function toggleProductFeatured(productId: string): Promise<ActionResult<{ featured: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user) throw new AppError("Unauthorized", 401);

    const product = await productRepository.findById(productId);
    if (!product) throw new AppError("Product not found", 404);

    if (session.user.role === "ADMIN") {
      const updated = await productRepository.update(productId, {
        featured: !product.featured,
      });
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/");
      revalidatePath("/admin/products");
      revalidatePath(getProductPublicPath(product.slug));
      return { success: true, data: { featured: updated.featured } };
    }

    if (session.user.role !== "COMPANY") throw new AppError("Forbidden", 403);

    const company = await companyRepository.findByUserId(session.user.id);
    if (!company || product.companyId !== company.id) {
      throw new AppError("Forbidden", 403);
    }

    const { companyHasFeature, getCompanyEffectivePlan, spotlightLimitForPlan } = await import(
      "@/lib/plans/company-plan"
    );

    if (!companyHasFeature(company, "featured_products")) {
      if (product.featured) {
        const updated = await productRepository.update(productId, { featured: false });
        const { revalidatePath } = await import("next/cache");
        revalidatePath("/");
        revalidatePath("/company/products");
        revalidatePath(getProductPublicPath(product.slug));
        return { success: true, data: { featured: updated.featured } };
      }
      throw new AppError(
        "Product spotlight is exclusive to the Pro plan. Upgrade in Settings → Plan & limits.",
        403,
      );
    }

    if (product.status !== "PUBLISHED") {
      throw new AppError("Only live products can be added to spotlight. Publish the product first.", 400);
    }

    const plan = getCompanyEffectivePlan(company);
    const limit = spotlightLimitForPlan(plan);

    if (!product.featured) {
      const currentFeatured = await prisma.product.count({
        where: { companyId: company.id, featured: true, status: "PUBLISHED" },
      });
      if (limit === 0) {
        throw new AppError("Your current plan does not include product spotlight.", 403);
      }
      if (currentFeatured >= limit) {
        throw new AppError(
          `Spotlight limit reached (${limit} on ${plan ?? "your"} plan). Remove spotlight from another live product or upgrade for more slots.`,
          400,
        );
      }
    }

    const updated = await productRepository.update(productId, {
      featured: !product.featured,
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
    revalidatePath("/company/products");
    revalidatePath(getProductPublicPath(product.slug));
    revalidatePath(`/vendor/${company.slug}`);

    return { success: true, data: { featured: updated.featured } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function toggleProductFeaturedFormAction(productId: string) {
  await toggleProductFeatured(productId);
}
