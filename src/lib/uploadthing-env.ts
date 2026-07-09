/**
 * UploadThing v7 — single UPLOADTHING_TOKEN (base64 JSON: apiKey, appId, regions).
 * https://docs.uploadthing.com
 */
function normalizeEnvValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  let trimmed = value.trim();
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  return trimmed || undefined;
}

function isValidUploadthingToken(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString("utf8")) as {
      apiKey?: string;
      appId?: string;
      regions?: unknown;
    };
    return Boolean(
      payload.apiKey?.startsWith("sk_") &&
        payload.appId &&
        Array.isArray(payload.regions) &&
        payload.regions.length > 0,
    );
  } catch {
    return false;
  }
}

export function getUploadthingToken(): string | undefined {
  const direct = normalizeEnvValue(process.env.UPLOADTHING_TOKEN);
  if (!direct) return undefined;

  if (isValidUploadthingToken(direct)) return direct;

  console.warn(
    "[uploadthing] UPLOADTHING_TOKEN is set but invalid. Paste the V7 token from UploadThing dashboard → API Keys (no quotes).",
  );
  return undefined;
}

export function isUploadthingConfigured(): boolean {
  return Boolean(getUploadthingToken());
}

export function assertUploadthingConfigured(): void {
  if (!isUploadthingConfigured()) {
    throw new Error(
      "UPLOADTHING_TOKEN is required in production. Add the UploadThing v7 token to Vercel environment variables (no quotes) and redeploy.",
    );
  }
}

export function getUploadthingConfigError(): string | null {
  if (isUploadthingConfigured()) return null;
  if (process.env.NODE_ENV === "development") {
    return "Optional in local dev — uploads use public/uploads when running on localhost.";
  }
  return "UPLOADTHING_TOKEN is missing or invalid. Add the V7 token in Vercel (no quotes) and redeploy.";
}

/** Normalize env at boot so UploadThing SDK reads a clean token. */
export function syncUploadthingEnv(): void {
  const token = getUploadthingToken();
  if (token) {
    process.env.UPLOADTHING_TOKEN = token;
  }
}
