import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal("")),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().or(z.literal("")),
  CRON_SECRET: z.string().min(16).optional().or(z.literal("")),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().or(z.literal("")),
  AUTH_URL: z.string().url().optional().or(z.literal("")),
});

/**
 * Production requires a reachable DATABASE_URL (not localhost) and AUTH_SECRET.
 * Upstash is recommended but optional — rate limiting falls back to memory.
 */
const productionServerSchema = serverSchema.superRefine((data, ctx) => {
  if (/localhost|127\.0\.0\.1/i.test(data.DATABASE_URL)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["DATABASE_URL"],
      message: "Must be a hosted Postgres URL on Vercel (not localhost)",
    });
  }

  const appUrl = data.NEXT_PUBLIC_APP_URL || data.AUTH_URL;
  if (appUrl && /localhost|127\.0\.0\.1/i.test(appUrl) && process.env.VERCEL === "1") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["NEXT_PUBLIC_APP_URL"],
      message: "Must be your public https://…vercel.app URL (not localhost)",
    });
  }
});

export function validateEnv() {
  const schema =
    process.env.NODE_ENV === "production" ? productionServerSchema : serverSchema;
  const server = schema.safeParse(process.env);
  if (!server.success) {
    const message = server.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
    // Warn instead of crash when optional env is incomplete — Auth URL can be fixed at runtime.
    if (process.env.VERCEL === "1") {
      console.error(`[validateEnv] ${message}`);
      // Still hard-fail critical DB misconfig
      const critical = server.error.issues.some((i) =>
        ["DATABASE_URL", "AUTH_SECRET"].includes(String(i.path[0])),
      );
      if (critical) {
        throw new Error(`Environment validation failed:\n${message}`);
      }
      return null;
    }
    throw new Error(`Environment validation failed:\n${message}`);
  }

  if (
    process.env.ADMIN_BOOTSTRAP_ENABLED === "true" &&
    (!process.env.ADMIN_BOOTSTRAP_SECRET?.trim() ||
      process.env.ADMIN_BOOTSTRAP_SECRET.trim().length < 16)
  ) {
    throw new Error(
      "Environment validation failed:\nADMIN_BOOTSTRAP_SECRET must be at least 16 characters when ADMIN_BOOTSTRAP_ENABLED=true",
    );
  }

  if (
    process.env.NODE_ENV === "production" &&
    !(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ) {
    console.warn(
      "[validateEnv] Upstash Redis not configured — rate limiting will use in-memory fallback.",
    );
  }

  return server.data;
}

export type ServerEnv = z.infer<typeof serverSchema>;
