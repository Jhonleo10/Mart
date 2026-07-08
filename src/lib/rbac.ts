import type { Role } from "@prisma/client";

export const ROLE_ROUTES: Record<Role, string> = {
  ADMIN: "/admin/dashboard",
  COMPANY: "/company/dashboard",
  USER: "/user/dashboard",
};

export function canAccessRoute(role: Role, pathname: string): boolean {
  if (pathname.startsWith("/admin")) return role === "ADMIN";
  if (pathname.startsWith("/company")) return role === "COMPANY";
  if (pathname.startsWith("/user")) return role === "USER";
  return true;
}

export const PUBLIC_ROUTES = [
  "/",
  "/products",
  "/companies",
  "/about",
  "/contact",
  "/login",
  "/register",
  "/forgot-password",
];

export const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];
