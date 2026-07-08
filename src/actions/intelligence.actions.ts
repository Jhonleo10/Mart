"use server";

import { auth } from "@/lib/auth";
import { requirementRepository } from "@/repositories/intelligence.repository";
import type { UserRequirements } from "@/lib/intelligence/types";
import { userRequirementsSchema } from "@/lib/validations/intelligence";
import { revalidatePath } from "next/cache";
import { AppError } from "@/lib/errors";

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
