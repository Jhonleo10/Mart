import { google } from "googleapis";
import { encryptToken, decryptToken } from "./crypto";

export const GOOGLE_CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
];

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/$/, "");
}

function resolveGoogleRedirectUri(): string {
  if (process.env.GOOGLE_REDIRECT_URI?.trim()) {
    return normalizeBaseUrl(process.env.GOOGLE_REDIRECT_URI);
  }

  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.AUTH_URL,
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ];

  for (const candidate of candidates) {
    if (!candidate?.trim()) continue;
    const base = normalizeBaseUrl(candidate.startsWith("http") ? candidate : `https://${candidate}`);
    if (process.env.VERCEL === "1" && /localhost|127\.0\.0\.1/i.test(base)) {
      continue;
    }
    return `${base}/api/google/calendar/callback`;
  }

  return "http://localhost:3000/api/google/calendar/callback";
}

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = resolveGoogleRedirectUri();

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getGoogleAuthUrl(state: string): string {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_CALENDAR_SCOPES,
    state,
    include_granted_scopes: true,
  });
}

export async function exchangeGoogleCode(code: string) {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.access_token) {
    throw new Error("Google did not return an access token");
  }
  if (!tokens.refresh_token) {
    throw new Error(
      "Google did not return a refresh token. Disconnect the app from your Google Account permissions and reconnect with consent.",
    );
  }

  client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: "v2", auth: client });
  const profile = await oauth2.userinfo.get();

  return {
    googleEmail: profile.data.email ?? "unknown@google.com",
    accessToken: encryptToken(tokens.access_token),
    refreshToken: encryptToken(tokens.refresh_token),
    tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    scope: tokens.scope ?? GOOGLE_CALENDAR_SCOPES.join(" "),
  };
}

export function createAuthorizedClient(accessTokenEnc: string, refreshTokenEnc: string) {
  const client = getOAuthClient();
  client.setCredentials({
    access_token: decryptToken(accessTokenEnc),
    refresh_token: decryptToken(refreshTokenEnc),
  });
  return client;
}

export async function refreshGoogleTokens(
  accessTokenEnc: string,
  refreshTokenEnc: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date | null;
}> {
  const client = createAuthorizedClient(accessTokenEnc, refreshTokenEnc);
  const { credentials } = await client.refreshAccessToken();
  if (!credentials.access_token) {
    throw new Error("Failed to refresh Google access token");
  }

  return {
    accessToken: encryptToken(credentials.access_token),
    refreshToken: credentials.refresh_token
      ? encryptToken(credentials.refresh_token)
      : refreshTokenEnc,
    tokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
  };
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function getGoogleRedirectUriForDiagnostics(): string {
  return resolveGoogleRedirectUri();
}
