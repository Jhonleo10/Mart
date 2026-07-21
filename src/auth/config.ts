import type { NextAuthConfig } from "next-auth";

function useSecureCookies(): boolean {
  if (process.env.NODE_ENV === "development") return false;

  // Prefer explicit public URL protocol; fall back to production NODE_ENV.
  const url =
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "";
  if (url.startsWith("https://")) return true;
  if (url.startsWith("http://")) return false;
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

const secure = useSecureCookies();

const secureCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure,
};

/**
 * Shared Auth.js configuration — Edge-safe.
 * No Prisma, no providers, no adapters, no filesystem access.
 * trustHost: true lets Auth.js use the incoming Host / x-forwarded-host
 * when AUTH_URL is not set correctly.
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
      name: secure ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: secureCookieOptions,
    },
  },
} satisfies NextAuthConfig;
