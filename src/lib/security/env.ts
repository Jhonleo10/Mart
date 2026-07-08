import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  CRON_SECRET: z.string().min(16).optional(),
});

const productionServerSchema = serverSchema.extend({
  UPSTASH_REDIS_REST_URL: z.string().url("UPSTASH_REDIS_REST_URL is required in production"),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, "UPSTASH_REDIS_REST_TOKEN is required in production"),
});

const publicSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export function validateEnv() {
  const schema =
    process.env.NODE_ENV === "production" ? productionServerSchema : serverSchema;
  const server = schema.safeParse(process.env);
  if (!server.success) {
    const message = server.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
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

  publicSchema.safeParse(process.env);
  return server.data;
}

export type ServerEnv = z.infer<typeof serverSchema>;
