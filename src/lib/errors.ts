import { logger } from "@/lib/logger";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleActionError(error: unknown): { error: string } {
  if (error instanceof AppError) {
    return { error: error.message };
  }
  logger.error("Unhandled action error", {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  }, "actions");
  return { error: "An unexpected error occurred" };
}

export function assertFound<T>(value: T | null | undefined, message = "Not found"): T {
  if (!value) throw new AppError(message, 404);
  return value;
}
