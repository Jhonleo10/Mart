"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/security/password";

export async function changeCompanyPassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user) return { error: "User not found" };

  if (user.password) {
    const valid = await verifyPassword(currentPassword, user.password);
    if (!valid) return { error: "Current password is incorrect" };
  }

  if (newPassword.length < 6) {
    return { error: "New password must be at least 6 characters" };
  }

  const hashed = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return { success: true };
}
