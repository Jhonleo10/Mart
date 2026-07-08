import { isDatabaseConfigured } from "./is-database-configured";

export class DatabaseUnavailableError extends Error {
  constructor(message = "Database is not available", cause?: unknown) {
    super(message);
    this.name = "DatabaseUnavailableError";
    if (cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = cause;
    }
  }
}

function isPrismaConnectivityError(error: unknown): boolean {
  if (error instanceof Error) {
    if (error.name === "PrismaClientInitializationError") return true;
    const message = error.message;
    return (
      message.includes("Can't reach database server") ||
      message.includes("P1001") ||
      message.includes("P1000") ||
      message.includes("P1017") ||
      message.includes("ECONNREFUSED")
    );
  }

  const message = String(error);
  return (
    message.includes("Can't reach database server") ||
    message.includes("P1001") ||
    message.includes("P1000") ||
    message.includes("P1017") ||
    message.includes("ECONNREFUSED")
  );
}

/**
 * Run a database query with a typed fallback when the DB is unavailable.
 * Non-connectivity errors are rethrown — never swallowed silently.
 */
export async function safeDbQuery<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  if (!isDatabaseConfigured()) {
    return fallback;
  }

  try {
    return await fn();
  } catch (error) {
    if (isPrismaConnectivityError(error)) {
      console.warn(`[safeDbQuery:${label}] Database unavailable, using fallback.`, error);
      return fallback;
    }
    throw error;
  }
}

/**
 * Run a database query that must succeed when the DB is configured.
 */
export async function requireDbQuery<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (!isDatabaseConfigured()) {
    throw new DatabaseUnavailableError(`[${label}] DATABASE_URL is not configured`);
  }

  try {
    return await fn();
  } catch (error) {
    if (isPrismaConnectivityError(error)) {
      throw new DatabaseUnavailableError(`[${label}] Could not reach database`, error);
    }
    throw error;
  }
}
