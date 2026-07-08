/**
 * Returns true when a DATABASE_URL is set and is not a local-only URL on Vercel.
 * Prevents build/deploy from targeting localhost:5432 in production.
 */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;

  const isLocalhost = /localhost|127\.0\.0\.1/i.test(url);
  if (isLocalhost && process.env.VERCEL === "1") {
    return false;
  }

  return true;
}
