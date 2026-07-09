import type { NextAuthConfig } from "next-auth";
import type { JWT } from "@auth/core/jwt";
import type { Session, User } from "next-auth";

/** Compare tray requires a buyer account; product browse & book pages are public. */
const AUTH_GATED_DISCOVERY = ["/compare/"];

function isAuthGatedDiscoveryPath(pathname: string) {
  return AUTH_GATED_DISCOVERY.some((p) => pathname === p || pathname.startsWith(p));
}

/**
 * Route protection — Edge-safe (no database).
 * Used by middleware and merged into the Node.js auth instance.
 */
export const authorizedCallback: NonNullable<NextAuthConfig["callbacks"]>["authorized"] = ({
  auth,
  request,
}) => {
  const { nextUrl } = request;
  const isLoggedIn = !!auth?.user;
  const pathname = nextUrl.pathname;

  if (isAuthGatedDiscoveryPath(pathname)) {
    if (!isLoggedIn) return false;
    return true;
  }

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) return false;
    return auth?.user?.role === "ADMIN";
  }

  if (
    pathname.startsWith("/company") &&
    !pathname.startsWith("/company/register") &&
    !pathname.startsWith("/company/status")
  ) {
    if (!isLoggedIn) return false;
    return auth?.user?.role === "COMPANY";
  }

  if (pathname.startsWith("/user")) {
    if (!isLoggedIn) return false;
    return auth?.user?.role === "USER";
  }

  if (isLoggedIn && ["/verify-user", "/verify-company", "/reset-password"].includes(pathname)) {
    return true;
  }

  return true;
};

/** JWT callback without database — Edge-safe (no UserSession DB validation). */
export function edgeJwtCallback({
  token,
  user,
}: {
  token: JWT;
  user?: User | null;
}): JWT {
  if (user) {
    token.id = user.id!;
    token.role = user.role;
    token.sessionVersion = user.sessionVersion ?? 0;
  }
  return token;
}

/** Session callback — Edge-safe. */
export function edgeSessionCallback({
  session,
  token,
}: {
  session: Session;
  token: JWT;
}): Session {
  if (session.user) {
    session.user.id = token.id as string;
    session.user.role = token.role;
  }
  return session;
}

/** Edge-only callbacks for middleware. */
export const edgeCallbacks = {
  authorized: authorizedCallback,
  jwt: edgeJwtCallback,
  session: edgeSessionCallback,
} satisfies NextAuthConfig["callbacks"];
