"use server";

import { auth } from "@/lib/auth";
import { requirementRepository } from "@/repositories/intelligence.repository";
import type { UserRequirements } from "@/lib/intelligence/types";
import { userRequirementsSchema } from "@/lib/validations/intelligence";
import { revalidatePath } from "next/cache";
import { AppError, handleActionError } from "@/lib/errors";
import type { ActionResult } from "@/lib/action-types";

export async function saveRequirementProfile(data: UserRequirements) {
  const session = await auth();
  if (!session?.user) throw new AppError("Unauthorized", 401);

  const parsed = userRequirementsSchema.safeParse(data);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? "Invalid requirements");
  }

  await requirementRepository.upsert(session.user.id, parsed.data);
  revalidatePath("/user/dashboard");
  revalidatePath("/user/requirements");
  revalidatePath("/user/recommendations");
  revalidatePath("/user/discover");
  return { success: true };
}

export async function getRequirementProfile() {
  const session = await auth();
  if (!session?.user) return null;
  return requirementRepository.getByUserId(session.user.id);
}

export async function removeRequirementChipsAction(chipsToRemove: string[]): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) throw new AppError("Unauthorized", 401);

    const profile = await requirementRepository.getByUserId(session.user.id);
    if (!profile) return { success: true };

    // Map chips back to profile fields and remove them
    const sizeLabels = new Set(["Solo", "2–50 team", "51–500 team", "Enterprise"]);
    const removeSet = new Set(chipsToRemove);

    let { industry, businessSize, budgetMax, requiredFeatures, preferredIntegrations, deploymentPreference } = profile;

    if (industry && removeSet.has(industry)) industry = null;
    if (businessSize) {
      const sizeLabel: Record<string, string> = { solo: "Solo", small: "2–50 team", medium: "51–500 team", enterprise: "Enterprise" };
      for (const [key, label] of Object.entries(sizeLabel)) {
        if (removeSet.has(label) && businessSize === key) {
          businessSize = null;
          break;
        }
      }
    }
    if (budgetMax && chipsToRemove.some(c => c.startsWith("≤ ₹"))) budgetMax = null;
    requiredFeatures = requiredFeatures.filter(f => !removeSet.has(f));
    preferredIntegrations = preferredIntegrations.filter(i => !removeSet.has(i));
    if (deploymentPreference && deploymentPreference !== "any" && removeSet.has(deploymentPreference.replace("_", " "))) {
      deploymentPreference = "any";
    }

    await requirementRepository.upsert(session.user.id, {
      industry: industry ?? undefined,
      businessSize: businessSize ?? undefined,
      budgetMax: budgetMax ?? undefined,
      requiredFeatures,
      preferredIntegrations,
      deploymentPreference: deploymentPreference ?? undefined,
      companyType: profile.companyType ?? undefined,
      country: profile.country ?? undefined,
    });

    revalidatePath("/user/discover");
    revalidatePath("/user/recommendations");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function clearAllRequirementsAction(): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) throw new AppError("Unauthorized", 401);

    const { prisma } = await import("@/lib/prisma");
    await prisma.userRequirementProfile.deleteMany({ where: { userId: session.user.id } });

    revalidatePath("/user/discover");
    revalidatePath("/user/recommendations");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
