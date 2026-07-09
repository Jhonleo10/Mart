/** Default session lifetime — 24 hours (seconds). Override with SESSION_MAX_AGE_SECONDS. */
export function getSessionMaxAgeSeconds(): number {
  const raw = process.env.SESSION_MAX_AGE_SECONDS;
  if (raw) {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return 24 * 60 * 60;
}

export function getSessionMaxAgeMs(): number {
  return getSessionMaxAgeSeconds() * 1000;
}

export const SESSION_ALREADY_ACTIVE_MESSAGE =
  "This account is already logged in on another device. Please logout from the existing session before signing in again.";
