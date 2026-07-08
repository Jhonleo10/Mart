import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { JWT } from "@auth/core/jwt";
import type { User } from "next-auth";
import { configureAuthUrlForRuntime } from "@/lib/app-url";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth/config";
import {
  authorizedCallback,
  edgeJwtCallback,
  edgeSessionCallback,
} from "@/auth/callbacks";
import { createCredentialsProvider } from "@/auth/providers";
import type { Role } from "@prisma/client";
import "@/auth/types";

configureAuthUrlForRuntime();

/**
 * Node.js JWT callback — validates session version against the database.
 * Only runs in Node.js runtime (Server Components, Route Handlers, Server Actions).
 */
async function nodeJwtCallback({
  token,
  user,
}: {
  token: JWT;
  user?: User | null;
}): Promise<JWT> {
  if (user) {
    return edgeJwtCallback({ token, user });
  }

  if (token.id) {
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
}

const { handlers, auth: defaultAuth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [createCredentialsProvider()],
  callbacks: {
    authorized: authorizedCallback,
    jwt: nodeJwtCallback,
    session: edgeSessionCallback,
  },
});

/**
 * Gracefully handle stale/invalid JWT cookies instead of crashing pages.
 */
export const auth: typeof defaultAuth = (async (...args: unknown[]) => {
  try {
    return await (defaultAuth as (...a: unknown[]) => ReturnType<typeof defaultAuth>)(...args);
  } catch (error: unknown) {
    const errString =
      String((error as Error)?.name || "") +
      String((error as Error)?.message || "") +
      String((error as { cause?: unknown })?.cause || "") +
      String((error as { type?: string })?.type || "");
    if (
      args.length === 0 ||
      errString.includes("JWTSessionError") ||
      errString.includes("decryption")
    ) {
      return null;
    }
    throw error;
  }
}) as typeof defaultAuth;

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
