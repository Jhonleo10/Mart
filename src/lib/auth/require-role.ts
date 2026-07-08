import { auth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import type { Role } from "@prisma/client";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new AppError("Unauthorized", 401);
  return session;
}

export async function requireRole(...roles: Role[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) {
    throw new AppError("Forbidden", 403);
  }
  return session;
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}

export async function requireCompany() {
  return requireRole("COMPANY");
}

export async function requireUser() {
  return requireRole("USER");
}
