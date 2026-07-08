/**
 * UploadThing v7 expects a single UPLOADTHING_TOKEN (base64 JSON with apiKey, appId, regions).
 * Also supports legacy UPLOADTHING_SECRET + UPLOADTHING_APP_ID for local dev.
 */
export function getUploadthingToken(): string | undefined {
  const direct = process.env.UPLOADTHING_TOKEN?.trim();
  if (direct) {
    if (isValidUploadthingToken(direct)) return direct;
    console.warn(
      "[uploadthing] UPLOADTHING_TOKEN is set but invalid. Get a V7 token from https://uploadthing.com/dashboard → API Keys → V7.",
    );
  }

  const secret = process.env.UPLOADTHING_SECRET?.trim();
  const appId = process.env.UPLOADTHING_APP_ID?.trim();
  const region = process.env.UPLOADTHING_REGION?.trim() || "sea1";

  if (secret && appId) {
    return Buffer.from(
      JSON.stringify({
        apiKey: secret,
        appId,
        regions: [region],
      }),
    ).toString("base64");
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
