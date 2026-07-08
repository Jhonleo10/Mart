import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { verifyPassword } from "@/lib/security/password";
import { auditLog } from "@/lib/security/audit";

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_MINUTES = 15;

/**
 * Credentials provider — Node.js only (uses Prisma + bcrypt).
 * Never import this module from middleware or Edge runtime code.
 */
export function createCredentialsProvider(): Provider {
  return Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;

      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email },
      });

      if (!user?.password) return null;

      if (user.lockedUntil && user.lockedUntil > new Date()) {
        await auditLog({
          userId: user.id,
          action: "LOGIN_FAILED",
          entityType: "User",
          entityId: user.id,
          metadata: { reason: "account_locked" },
        });
        return null;
      }

      const valid = await verifyPassword(parsed.data.password, user.password);

      if (!valid) {
        const attempts = user.failedLoginAttempts + 1;
        const shouldLock = attempts >= LOCKOUT_THRESHOLD;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: attempts,
            lockedUntil: shouldLock
              ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
              : user.lockedUntil,
          },
        });

        if (shouldLock) {
          await auditLog({
            userId: user.id,
            action: "ACCOUNT_LOCKED",
            entityType: "User",
            entityId: user.id,
          });
        }

        await auditLog({
          userId: user.id,
          action: "LOGIN_FAILED",
          entityType: "User",
          entityId: user.id,
        });

        return null;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });

      await auditLog({
        userId: user.id,
        action: "LOGIN",
        entityType: "User",
        entityId: user.id,
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        sessionVersion: user.sessionVersion,
      };
    },
  });
}
