/**
 * UploadThing v7 expects a single UPLOADTHING_TOKEN (base64 JSON with apiKey, appId, regions).
 * Also supports legacy UPLOADTHING_SECRET + UPLOADTHING_APP_ID for local dev.
 */
function normalizeEnvValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  let trimmed = value.trim();
  // Vercel / .env imports often include wrapping quotes — strip them.
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  return trimmed || undefined;
}

export function getUploadthingToken(): string | undefined {
  const direct = normalizeEnvValue(process.env.UPLOADTHING_TOKEN);
  if (direct) {
    if (isValidUploadthingToken(direct)) return direct;
    console.warn(
      "[uploadthing] UPLOADTHING_TOKEN is set but invalid. Use the V7 token from https://uploadthing.com/dashboard → API Keys (no quotes in Vercel).",
    );
  }

  const secret = normalizeEnvValue(process.env.UPLOADTHING_SECRET);
  const appId = normalizeEnvValue(process.env.UPLOADTHING_APP_ID);
  const region = normalizeEnvValue(process.env.UPLOADTHING_REGION) || "sea1";

  if (secret && appId) {
    const legacy = Buffer.from(
      JSON.stringify({
        apiKey: secret,
        appId,
        regions: [region],
      }),
    ).toString("base64");
    if (isValidUploadthingToken(legacy)) return legacy;
  }

  return undefined;
}

export function isUploadthingConfigured(): boolean {
  return Boolean(getUploadthingToken());
}

function isValidUploadthingToken(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString("utf8")) as {
      apiKey?: string;
      appId?: string;
      regions?: unknown;
    };
    return Boolean(
      payload.apiKey &&
        payload.appId &&
        Array.isArray(payload.regions) &&
        payload.regions.length > 0,
    );
  } catch {
    return false;
  }
}

export function getUploadthingConfigError(): string | null {
  if (isUploadthingConfigured()) return null;
  return "Image uploads are not configured. Add UPLOADTHING_TOKEN to your .env file (UploadThing dashboard → API Keys → V7 tab).";
}
