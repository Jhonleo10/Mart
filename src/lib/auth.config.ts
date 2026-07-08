import type { NextAuthConfig } from "next-auth";

const secureCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  logger: {
    error(error: any) {
      const errString = String(error?.name || "") + String(error?.message || "") + String(error?.cause || "") + String(error?.type || "");
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
  callbacks: {
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false;
        return auth?.user?.role === "ADMIN";
      }

      if (pathname.startsWith("/company") && !pathname.startsWith("/company/register") && !pathname.startsWith("/company/status")) {
        if (!isLoggedIn) return false;
        return auth?.user?.role === "COMPANY";
      }

      if (pathname.startsWith("/user")) {
        if (!isLoggedIn) return false;
        return auth?.user?.role === "USER";
      }

      const isServerAction = request.headers.has("next-action");

      if (
        isLoggedIn &&
        ["/login", "/register", "/forgot-password"].includes(pathname) &&
        !isServerAction
      ) {
        const role = auth?.user?.role;
        if (role === "USER") return Response.redirect(new URL("/user/dashboard", nextUrl));
        if (role === "ADMIN") return Response.redirect(new URL("/admin/dashboard", nextUrl));
        if (role === "COMPANY") return Response.redirect(new URL("/company/dashboard", nextUrl));
        return Response.redirect(new URL("/", nextUrl));
      }

      if (
        isLoggedIn &&
        ["/verify-user", "/verify-company", "/reset-password"].includes(pathname)
      ) {
        return true;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion ?? 0;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "COMPANY" | "USER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
