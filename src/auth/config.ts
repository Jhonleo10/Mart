import type { NextAuthConfig } from "next-auth";

const secureCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

/**
 * Shared Auth.js configuration — Edge-safe.
 * No Prisma, no providers, no adapters, no filesystem access.
 */
export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  logger: {
    error(error: unknown) {
      const errString =
        String((error as Error)?.name || "") +
        String((error as Error)?.message || "") +
        String((error as { cause?: unknown })?.cause || "") +
        String((error as { type?: string })?.type || "");
      if (errString.includes("JWTSessionError") || errString.includes("decryption")) {
        return;
      }
      console.error(error);
    },
  },
  pages: {
    signIn: "/login",
  },
  providers: [],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: secureCookieOptions,
    },
  },
} satisfies NextAuthConfig;
