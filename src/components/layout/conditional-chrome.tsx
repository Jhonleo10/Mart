"use client";

import { usePathname } from "next/navigation";

function isDashboard(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/company") ||
    pathname.startsWith("/user")
  );
}

function isProductLanding(pathname: string) {
  return pathname.startsWith("/product/");
}

function isVendorLanding(pathname: string) {
  return pathname.startsWith("/vendor/");
}

function isStandaloneLanding(pathname: string) {
  return isProductLanding(pathname) || isVendorLanding(pathname);
}

function isAuthRoute(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/seller/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/verify-user" ||
    pathname === "/verify-company"
  );
}

export function ConditionalHeader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isDashboard(pathname) || isStandaloneLanding(pathname)) return null;
  return <>{children}</>;
}

export function ConditionalFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isDashboard(pathname) || isAuthRoute(pathname) || isStandaloneLanding(pathname)) return null;
  return <>{children}</>;
}
