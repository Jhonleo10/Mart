import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const memoryStore = new Map<string, { count: number; resetAt: number }>();

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

function createLimiter(requests: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  });
}

const upstashLimiters = {
  login: createLimiter(5, "1 m"),
  register: createLimiter(3, "1 m"),
  forgotPassword: createLimiter(3, "1 m"),
  booking: createLimiter(10, "1 m"),
  api: createLimiter(100, "1 m"),
  search: createLimiter(40, "1 m"),
};

function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count };
}

export type RateLimitPreset = "login" | "register" | "forgotPassword" | "booking" | "api" | "search";

const PRESET_CONFIG: Record<RateLimitPreset, { limit: number; windowMs: number }> = {
  login: { limit: 5, windowMs: 60_000 },
  register: { limit: 3, windowMs: 60_000 },
  forgotPassword: { limit: 3, windowMs: 60_000 },
  booking: { limit: 10, windowMs: 60_000 },
  api: { limit: 100, windowMs: 60_000 },
  search: { limit: 40, windowMs: 60_000 },
};

let warnedMissingUpstash = false;

/**
 * Rate limit with Upstash when configured; otherwise in-memory fallback.
 * Never throws — login must not hang/fail solely due to missing Redis.
 */
export async function rateLimit(
  key: string,
  preset: RateLimitPreset = "api",
): Promise<{ success: boolean; remaining: number }> {
  const config = PRESET_CONFIG[preset];
  const limiter = upstashLimiters[preset];

  if (limiter) {
    try {
      const result = await limiter.limit(key);
      return { success: result.success, remaining: result.remaining };
    } catch (error) {
      console.warn(`[rateLimit:${preset}] Upstash error, using in-memory fallback.`, error);
      return memoryRateLimit(`${preset}:${key}`, config.limit, config.windowMs);
    }
  }

  if (process.env.NODE_ENV === "production" && !warnedMissingUpstash) {
    warnedMissingUpstash = true;
    console.warn(
      "[rateLimit] UPSTASH_REDIS_REST_URL / TOKEN not set — using in-memory rate limits (not shared across serverless instances).",
    );
  }

  return memoryRateLimit(`${preset}:${key}`, config.limit, config.windowMs);
}

/** @deprecated Use rateLimit(key, preset) */
export function rateLimitSync(
  key: string,
  limit = 10,
  windowMs = 60_000,
): { success: boolean; remaining: number } {
  return memoryRateLimit(key, limit, windowMs);
}
