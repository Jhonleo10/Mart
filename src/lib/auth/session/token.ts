import { createHash, randomBytes } from "crypto";

/** Cryptographically secure opaque session token (stored in HttpOnly cookie). */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/** SHA-256 hash — only the hash is persisted in the database. */
export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
