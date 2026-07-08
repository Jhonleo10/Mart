import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import type { User } from "@prisma/client";

export async function assertLoginAllowed(
  user: User & {
    company?: {
      status: string;
      paymentVerified: boolean;
    } | null;
  },
) {
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
    throw new AppError(
      `Account temporarily locked. Try again in ${minutes} minute(s).`,
      423,
    );
  }

  if (user.role === "ADMIN") {
    return;
  }

  if (!user.emailVerified) {
    throw new AppError(
      "Please verify your email with the OTP sent to your inbox before logging in.",
      403,
    );
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("Your account is not active. Contact support.", 403);
  }

  if (user.role === "COMPANY") {
    if (user.company?.status === "SUSPENDED") {
      throw new AppError("Your company account has been suspended. Contact support.", 403);
    }
    if (user.company?.status === "REJECTED") {
      throw new AppError("Your company registration was not approved.", 403);
    }
    if (!user.company?.paymentVerified) {
      throw new AppError(
        "Complete your seller plan payment to access the company dashboard.",
        403,
      );
    }
  }
}

export async function loadUserForLogin(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { company: true },
  });
}

export function postLoginRedirectForUser(
  user: User & { company?: { paymentVerified: boolean; logo?: string | null; description?: string | null } | null },
): string {
  if (user.role === "ADMIN") return "/admin/dashboard";
  if (user.role === "COMPANY") {
    if (!user.emailVerified) {
      return `/verify-user?email=${encodeURIComponent(user.email)}&role=company`;
    }
    return "/company/dashboard";
  }
  if (!user.emailVerified) {
    return `/verify-user?email=${encodeURIComponent(user.email)}`;
  }
  return "/user/dashboard";
}
