export interface ParsedClientInfo {
  deviceName: string | null;
  browser: string | null;
  operatingSystem: string | null;
}

/** Lightweight user-agent parser — no external dependency. */
export function parseUserAgent(userAgent: string | null): ParsedClientInfo {
  if (!userAgent) {
    return { deviceName: null, browser: null, operatingSystem: null };
  }

  const ua = userAgent;

  let operatingSystem: string | null = null;
  if (/Windows NT/i.test(ua)) operatingSystem = "Windows";
  else if (/Mac OS X/i.test(ua)) operatingSystem = "macOS";
  else if (/Android/i.test(ua)) operatingSystem = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) operatingSystem = "iOS";
  else if (/Linux/i.test(ua)) operatingSystem = "Linux";

  let browser: string | null = null;
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari";

  let deviceName: string | null = null;
  if (/Mobile/i.test(ua)) deviceName = "Mobile";
  else if (/Tablet|iPad/i.test(ua)) deviceName = "Tablet";
  else deviceName = "Desktop";

  return { deviceName, browser, operatingSystem };
}

export function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }
  return headers.get("x-real-ip") ?? null;
}
