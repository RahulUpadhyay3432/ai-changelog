import { timingSafeEqual } from "crypto";

// Fail-CLOSED auth for cron / admin endpoints.
//
// Returns true ONLY when CRON_SECRET is configured AND the request presents the
// exact matching value (constant-time compared). If CRON_SECRET is unset, this
// DENIES — it never silently opens the endpoint (the old
// `if (process.env.CRON_SECRET && ...)` pattern was fail-OPEN: a missing env var
// skipped auth entirely).
//
// Accepts the secret via `x-cron-secret` header, `Authorization: Bearer <secret>`,
// or `?secret=` query param (Vercel cron, GitHub Actions, and manual triggers).
export function isAuthorizedCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed

  let provided =
    req.headers.get("x-cron-secret") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    null;

  if (!provided) {
    try {
      provided = new URL(req.url).searchParams.get("secret");
    } catch {
      provided = null;
    }
  }
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
