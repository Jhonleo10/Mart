"use server";

import { revalidatePath } from "next/cache";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { AppError, handleActionError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { auditLog } from "@/lib/security/audit";
import { passwordChangeSchema, userProfileUpdateSchema } from "@/lib/validations";
import { notificationRepository } from "@/repositories/notification.repository";
import { wishlistRepository } from "@/repositories/wishlist.repository";
import type { ActionResult } from "@/lib/action-types";

const USER_REVALIDATE_PATHS = [
  "/user/dashboard",
  "/user/discover",
  "/user/recommendations",
  "/user/wishlist",
  "/user/profile",
];

function assertBuyerSession(session: Session | null): Session {
  if (!session?.user) throw new AppError("Please login to continue", 401);
  if (session.user.role !== "USER") {
    throw new AppError("Only buyer accounts can perform this action", 403);
  }
  return session;
}

export async function toggleWishlist(productId: string): Promise<ActionResult<{ added: boolean }>> {
  try {
    const session = assertBuyerSession(await auth());

    const result = await wishlistRepository.toggle(session.user.id, productId);
    for (const path of USER_REVALIDATE_PATHS) {
      revalidatePath(path);
    }
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function markNotificationRead(notificationId: string): Promise<ActionResult> {
  try {
    const session = assertBuyerSession(await auth());

    await notificationRepository.markAsRead(notificationId, session.user.id);
    revalidatePath("/user", "layout");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  try {
    const session = assertBuyerSession(await auth());

    await notificationRepository.markAllAsRead(session.user.id);
    revalidatePath("/user", "layout");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateUserProfile(formData: FormData): Promise<ActionResult> {
  try {
    const session = assertBuyerSession(await auth());

    const parsed = userProfileUpdateSchema.safeParse({
      name: formData.get("name"),
      phone: formData.get("phone") ?? undefined,
    });
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone ? parsed.data.phone : null,
      },
    });

    for (const path of USER_REVALIDATE_PATHS) {
      revalidatePath(path);
    }
    revalidatePath("/user", "layout");

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function changeUserPassword(formData: FormData): Promise<ActionResult> {
  try {
    const session = assertBuyerSession(await auth());

    const parsed = passwordChangeSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.password) {
      throw new AppError("Password change is not available for this account", 400);
    }

    const valid = await verifyPassword(parsed.data.currentPassword, user.password);
    if (!valid) {
      throw new AppError("Current password is incorrect", 400);
    }

    const hashed = await hashPassword(parsed.data.newPassword);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed, sessionVersion: { increment: 1 } },
    });

    await auditLog({
      userId: session.user.id,
      action: "PASSWORD_CHANGED",
      entityType: "User",
      entityId: session.user.id,
    });

    revalidatePath("/user/profile");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
