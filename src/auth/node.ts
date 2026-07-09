import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { JWT } from "@auth/core/jwt";
import type { User } from "next-auth";
import { headers } from "next/headers";
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
import {
  clearSessionCookie,
  getSessionTokenFromCookies,
  setSessionCookie,
} from "@/lib/auth/session/cookie";
import { getSessionMaxAgeMs } from "@/lib/auth/session/constants";
import {
  SessionConflictError,
  userSessionService,
} from "@/services/user-session.service";
import "@/auth/types";

configureAuthUrlForRuntime();

function invalidateToken(token: JWT): JWT {
  return { ...token, exp: 0, userSessionId: undefined };
}

/**
 * Node.js JWT callback — validates session version and UserSession against the database.
 * Only runs in Node.js runtime (Server Components, Route Handlers, Server Actions, middleware).
 */
async function nodeJwtCallback({
  token,
  user,
}: {
  token: JWT;
  user?: User | null;
}): Promise<JWT> {
  if (user) {
    try {
      const hdrs = await headers();
      const created = await userSessionService.createSession({
        userId: user.id!,
        headers: hdrs,
      });
      await setSessionCookie(created.rawToken, created.expiresAt);
      const next = edgeJwtCallback({ token, user });
      next.userSessionId = created.id;
      return next;
    } catch (error) {
      if (error instanceof SessionConflictError) {
        await clearSessionCookie();
        return invalidateToken(token);
      }
      throw error;
    }
  }

  if (!token.id) {
    return token;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: token.id as string },
    select: { sessionVersion: true, role: true },
  });
  if (!dbUser || dbUser.sessionVersion !== (token.sessionVersion ?? 0)) {
    await clearSessionCookie();
    if (token.userSessionId) {
      await userSessionService.revokeSession(token.userSessionId as string).catch(() => undefined);
    }
    return invalidateToken(token);
  }
  token.role = dbUser.role;

  const sessionId = token.userSessionId as string | undefined;
  if (!sessionId) {
    await clearSessionCookie();
    return invalidateToken(token);
  }

  const rawToken = await getSessionTokenFromCookies();
  if (!rawToken) {
    // Cookie may not be readable in the same request it was set (Server Actions).
    // Invalidate the JWT locally without revoking the DB session — another request may still hold the cookie.
    return invalidateToken(token);
  }

  const valid = await userSessionService.validateSession(sessionId, rawToken);
  if (!valid) {
    await clearSessionCookie().catch(() => undefined);
    return invalidateToken(token);
  }

  try {
    await setSessionCookie(rawToken, new Date(Date.now() + getSessionMaxAgeMs()));
  } catch {
    // Rolling refresh is best-effort (e.g. middleware may not allow cookie mutation).
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
  events: {
    async signOut(message) {
      if ("token" in message && message.token?.userSessionId) {
        await userSessionService
          .revokeSession(message.token.userSessionId as string)
          .catch(() => undefined);
      }
      await clearSessionCookie().catch(() => undefined);
    },
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
  await userSessionService.revokeAllForUser(userId);
  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId } }),
    prisma.user.update({
      where: { id: userId },
      data: { sessionVersion: { increment: 1 } },
    }),
  ]);
}
