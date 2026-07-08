import { AsyncLocalStorage } from "node:async_hooks";
import { headers } from "next/headers";

const requestBaseUrl = new AsyncLocalStorage<string>();

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/$/, "");
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

function localhostBaseUrl(): string {
  const port = process.env.PORT ?? "3000";
  return `http://localhost:${port}`;
}

function configuredBaseUrl(): string | null {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  return configured ? normalizeBaseUrl(configured) : null;
}

/** Prefer the incoming request host so dev works on any port (3000, 3001, 3002, …). */
export async function resolveAppBaseUrl(): Promise<string> {
  const fromStore = requestBaseUrl.getStore();
  if (fromStore) return fromStore;

  if (process.env.NODE_ENV === "production") {
    const configured = configuredBaseUrl();
    if (configured) return configured;
  }

  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const proto =
        h.get("x-forwarded-proto") ??
        (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
      return `${proto}://${host}`;
    }
  } catch {
    // headers() is unavailable outside a request (seed scripts, webhooks, etc.)
  }

  return configuredBaseUrl() ?? localhostBaseUrl();
}

/** Sync helper for code running inside runWithAppBaseUrl (e.g. email template render). */
export function getAppBaseUrlSync(): string {
  return requestBaseUrl.getStore() ?? configuredBaseUrl() ?? localhostBaseUrl();
}

export function appUrl(path = ""): string {
  const base = getAppBaseUrlSync();
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function runWithAppBaseUrl<T>(fn: () => T | Promise<T>): Promise<T> {
  const baseUrl = await resolveAppBaseUrl();
  return requestBaseUrl.run(baseUrl, fn);
}

/**
 * In development, Auth.js must not pin callbacks to a fixed localhost port.
 * trustHost is enabled in auth.config; clearing AUTH_URL avoids port mismatches.
 */
export function configureAuthUrlForRuntime() {
  if (process.env.NODE_ENV !== "development") return;

  delete process.env.AUTH_URL;
  delete process.env.NEXTAUTH_URL;
}
