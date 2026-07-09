import { cookies } from "next/headers";

function useSecureCookies(): boolean {
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

export const SESSION_COOKIE_NAME = secure ? "__Secure-dgm.session" : "dgm.session";

const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure,
};

export async function getSessionTokenFromCookies(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function setSessionCookie(rawToken: string, expiresAt: Date): Promise<void> {
  const store = await cookies();
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  store.set(SESSION_COOKIE_NAME, rawToken, {
    ...baseCookieOptions,
    maxAge,
    expires: expiresAt,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, "", {
    ...baseCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
}
