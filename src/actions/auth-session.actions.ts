"use server";

import { signIn, signOut, logoutAllDevices } from "@/lib/auth";
import { AppError, handleActionError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { hashPassword } from "@/lib/security/password";
import { auditLog } from "@/lib/security/audit";
import { resetPasswordSchema, forgotPasswordSchema } from "@/lib/validations";
import { passwordResetRepository } from "@/repositories/password-reset.repository";
import { prisma } from "@/lib/prisma";
import { generateToken, resetTokenExpiry } from "@/lib/security/tokens";
import { dashboardForRole } from "@/lib/auth-paths";
import {
  assertLoginAllowed,
  loadUserForLogin,
  postLoginRedirectForUser,
} from "@/lib/auth/login-guards";
import type { ActionResult } from "@/lib/action-types";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";

function isBenignAuthRedirect(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { message?: string; digest?: string };
  const digest = String(err.digest ?? "");
  const message = String(err.message ?? "");
  return (
    message === "NEXT_REDIRECT" ||
    digest.startsWith("NEXT_REDIRECT") ||
    message.toLowerCase().includes("redirect")
  );
}

export async function loginUser(
  formData: FormData,
): Promise<ActionResult<{ role: string; redirectTo: string }>> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const limit = await rateLimit(email, "login");
    if (!limit.success) throw new AppError("Too many login attempts. Please wait a minute.", 429);

    const user = await loadUserForLogin(email);
    if (user?.password) {
      await assertLoginAllowed(user);
    }

    try {
      await signIn("credentials", { email, password, redirect: false });
    } catch (e: unknown) {
      if (isBenignAuthRedirect(e)) {
        // Auth.js / Next.js may throw redirect even with redirect:false — treat as success.
      } else {
        throw e;
      }
    }

    const loggedIn = await loadUserForLogin(email);
    const role = loggedIn?.role ?? "USER";
    const redirectTo = loggedIn ? postLoginRedirectForUser(loggedIn) : dashboardForRole(role);

    return { success: true, data: { role, redirectTo } };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    return handleActionError(error);
  }
}

export async function signOutAction() {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (session?.user) {
    await auditLog({
      userId: session.user.id,
      action: "LOGOUT",
      entityType: "User",
      entityId: session.user.id,
    });
  }
  await signOut({ redirectTo: "/" });
}

export async function logoutAllDevicesAction() {
  const { requireAuth } = await import("@/lib/auth");
  const session = await requireAuth();
  await logoutAllDevices(session.user.id);
  await auditLog({
    userId: session.user.id,
    action: "LOGOUT_ALL_DEVICES",
    entityType: "User",
    entityId: session.user.id,
  });
  await signOut({ redirectTo: "/" });
}

export async function requestPasswordReset(formData: FormData): Promise<ActionResult> {
  try {
    const parsed = forgotPasswordSchema.safeParse({
      email: formData.get("email"),
    });
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid email");
    }

    const limit = await rateLimit(parsed.data.email, "forgotPassword");
    if (!limit.success) throw new AppError("Too many requests. Try again later.", 429);

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (user) {
      const { emailService } = await import("@/lib/email");
      await passwordResetRepository.invalidateForUser(user.id);
      const token = generateToken();
      await passwordResetRepository.create(user.id, token, resetTokenExpiry(30));
      await emailService.forgotPassword(parsed.data.email, user.name ?? "User", token);
      await auditLog({
        userId: user.id,
        action: "PASSWORD_RESET_REQUESTED",
        entityType: "User",
        entityId: user.id,
      });
    }

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function resetPassword(formData: FormData): Promise<ActionResult> {
  try {
    const parsed = resetPasswordSchema.safeParse({
      token: formData.get("token"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const record = await passwordResetRepository.findValid(parsed.data.token);
    if (!record) {
      throw new AppError("Reset link is invalid, expired, or already used", 400);
    }

    const hashed = await hashPassword(parsed.data.password);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { password: hashed, sessionVersion: { increment: 1 } },
      }),
      prisma.session.deleteMany({ where: { userId: record.userId } }),
    ]);
    await passwordResetRepository.markUsed(record.id);
    const { emailService } = await import("@/lib/email");
    await emailService.passwordChanged(record.user.email, record.user.name ?? "User");

    await auditLog({
      userId: record.userId,
      action: "PASSWORD_RESET_COMPLETED",
      entityType: "User",
      entityId: record.userId,
    });

    revalidatePath("/login");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
