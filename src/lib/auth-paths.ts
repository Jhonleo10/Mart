export const AUTH_PATHS = {
  login: "/login",
  userRegister: "/register",
  companyRegister: "/seller/register",
} as const;

/** Safe internal redirect after login (blocks open redirects). */
export function isSafeCallbackUrl(url: string): boolean {
  if (!url.startsWith("/") || url.startsWith("//")) return false;
  if (url.includes("://") || url.includes("\\")) return false;

  try {
    const appOrigin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const allowedHost = new URL(appOrigin).hostname;
    const parsed = new URL(url, appOrigin);
    if (parsed.hostname !== allowedHost && parsed.hostname !== "localhost") return false;
    if (parsed.pathname !== url.split("?")[0]?.split("#")[0]) return false;
    return true;
  } catch {
    return false;
  }
}

export function loginWithCallback(callbackUrl: string): string {
  return `${AUTH_PATHS.login}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

export function registerWithCallback(callbackUrl: string): string {
  return `${AUTH_PATHS.userRegister}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

export type RegisterRole = "user" | "company";

export function parseRegisterRole(role: string | null): RegisterRole {
  return role === "company" ? "company" : "user";
}

export function dashboardForRole(role: string): string {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "COMPANY") return "/company/dashboard";
  return "/user/dashboard";
}
