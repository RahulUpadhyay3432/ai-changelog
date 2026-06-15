// Centralized rate limiting. On Vercel, in-memory per-instance counters don't
// hold — each serverless instance has its own memory and many run concurrently,
// so a per-instance limit silently multiplies by the number of warm instances.
// This routes limits through Upstash Redis (shared across all instances) using a
// sliding window, so the limit is enforced globally.
//
// Graceful fallback: if the Upstash env vars are absent (local dev, or before
// they're set in Vercel), we fall back to a best-effort in-memory limiter so
// nothing breaks — but that fallback is per-instance and should NOT be relied on
// in production. Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in Vercel.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

let warnedNoUpstash = false;
if (!redis && !warnedNoUpstash) {
  warnedNoUpstash = true;
  console.warn(
    "[ratelimit] Upstash not configured — using best-effort in-memory fallback. " +
      "Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for real rate limiting."
  );
}

// Cache one Ratelimit instance per (limit, window) so we don't rebuild on every call.
const limiterCache = new Map<string, Ratelimit>();

function getUpstashLimiter(limit: number, windowSeconds: number): Ratelimit | null {
  if (!redis) return null;
  const cacheKey = `${limit}:${windowSeconds}`;
  let limiter = limiterCache.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: "kapyn_rl",
      analytics: false,
    });
    limiterCache.set(cacheKey, limiter);
  }
  return limiter;
}

// ── In-memory fallback (per-instance, best-effort only) ──────────────────────
const memStore = new Map<string, { count: number; resetAt: number }>();

function memLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  // Lazy prune so a long-lived instance doesn't grow unbounded.
  if (memStore.size > 5000) {
    for (const [k, v] of memStore) if (now > v.resetAt) memStore.delete(k);
  }
  const entry = memStore.get(key);
  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    memStore.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, reset: resetAt };
  }
  if (entry.count >= limit) return { ok: false, remaining: 0, reset: entry.resetAt };
  entry.count++;
  return { ok: true, remaining: limit - entry.count, reset: entry.resetAt };
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Epoch ms when the window resets (for Retry-After / retryInSeconds). */
  reset: number;
}

/**
 * Check (and consume) one unit against a sliding-window limit.
 * @param key  Unique identifier — typically `${route}:${ip}`, or a constant for a global limit.
 */
export async function rateLimit(opts: {
  key: string;
  limit: number;
  windowSeconds: number;
}): Promise<RateLimitResult> {
  const { key, limit, windowSeconds } = opts;
  const upstash = getUpstashLimiter(limit, windowSeconds);
  if (upstash) {
    const { success, remaining, reset } = await upstash.limit(key);
    return { ok: success, remaining, reset };
  }
  return memLimit(key, limit, windowSeconds * 1000);
}

/** Best-effort client IP from proxy headers. */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}

export function rateLimitConfigured(): boolean {
  return redis !== null;
}
