import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { configureAuthUrlForRuntime } from "@/lib/app-url";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { authConfig } from "@/lib/auth.config";
import { verifyPassword } from "@/lib/security/password";
import { auditLog } from "@/lib/security/audit";
import type { Role } from "@prisma/client";

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_MINUTES = 15;

declare module "next-auth" {
  interface User {
    role: Role;
    sessionVersion?: number;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    sessionVersion?: number;
  }
}

configureAuthUrlForRuntime();

const { handlers, auth: defaultAuth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
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
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion ?? 0;
      } else if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { sessionVersion: true, role: true },
        });
        if (!dbUser || dbUser.sessionVersion !== (token.sessionVersion ?? 0)) {
          return { ...token, exp: 0 };
        }
        token.role = dbUser.role;
      }
      return token;
    },
  },
});

export const auth: typeof defaultAuth = (async (...args: any[]) => {
  try {
    return await (defaultAuth as any)(...args);
  } catch (error: any) {
    const errString = String(error?.name || "") + String(error?.message || "") + String(error?.cause || "") + String(error?.type || "");
    if (args.length === 0 || errString.includes("JWTSessionError") || errString.includes("decryption")) {
      return null;
    }
    throw error;
  }
}) as any;

export { handlers, signIn, signOut };

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(...roles: Role[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session;
}

export async function logoutAllDevices(userId: string) {
  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId } }),
    prisma.user.update({
      where: { id: userId },
      data: { sessionVersion: { increment: 1 } },
    }),
  ]);
}
