import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/** Compare tray requires a buyer account; product browse & book pages are public. */
const AUTH_GATED_DISCOVERY = ["/compare/"];

function isAuthGatedDiscoveryPath(pathname: string) {
  return AUTH_GATED_DISCOVERY.some((p) => pathname === p || pathname.startsWith(p));
}

export default NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      if (isAuthGatedDiscoveryPath(pathname)) {
        if (!isLoggedIn) return false;
        return true;
      }

      return authConfig.callbacks.authorized({ auth, request });
    },
  },
}).auth;

export const config = {
  matcher: [
    "/admin/:path*",
    "/company/:path*",
    "/user/:path*",
    "/products",
    "/products/:path*",
    "/product/:path*",
    "/book/:path*",
    "/software/:path*",
    "/industry/:path*",
    "/compare/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-user",
    "/verify-company",
  ],
};
