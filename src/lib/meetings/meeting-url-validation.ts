import type { MeetingProvider } from "@prisma/client";

const BLOCKED_PROTOCOLS = ["javascript:", "data:", "vbscript:", "file:"];

export class MeetingUrlValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MeetingUrlValidationError";
  }
}

function parseHttpsUrl(raw: string): URL {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new MeetingUrlValidationError("Meeting URL is required");
  }

  const lower = trimmed.toLowerCase();
  for (const protocol of BLOCKED_PROTOCOLS) {
    if (lower.startsWith(protocol)) {
      throw new MeetingUrlValidationError("Invalid meeting URL protocol");
    }
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new MeetingUrlValidationError("Enter a valid meeting URL");
  }

  if (url.protocol !== "https:") {
    throw new MeetingUrlValidationError("Meeting URL must use HTTPS");
  }

  return url;
}

function isZoomHost(hostname: string): boolean {
  return hostname === "zoom.us" || hostname.endsWith(".zoom.us");
}

export function validateMeetingUrl(provider: MeetingProvider, rawUrl: string): string {
  const url = parseHttpsUrl(rawUrl);
  const host = url.hostname.toLowerCase();

  switch (provider) {
    case "TEAMS":
      if (!host.endsWith("teams.microsoft.com")) {
        throw new MeetingUrlValidationError(
          "Teams meeting URL must start with https://teams.microsoft.com/",
        );
      }
      break;
    case "ZOOM":
      if (!isZoomHost(host)) {
        throw new MeetingUrlValidationError(
          "Zoom meeting URL must use https://zoom.us/ or a https://*.zoom.us/ host",
        );
      }
      break;
    case "CUSTOM":
      break;
    case "GOOGLE":
      throw new MeetingUrlValidationError("Google Meet links are generated automatically");
    default: {
      const _exhaustive: never = provider;
      throw new MeetingUrlValidationError(`Unsupported provider: ${_exhaustive}`);
    }
  }

  return url.toString();
}

export function providerRequiresManualUrl(provider: MeetingProvider): boolean {
  return provider === "TEAMS" || provider === "ZOOM" || provider === "CUSTOM";
}
