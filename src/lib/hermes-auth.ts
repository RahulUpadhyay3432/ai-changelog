import { timingSafeEqual } from "crypto";

// Fail-CLOSED auth for the HERMES connection routes (/api/hermes/*). Same
// shape as isAuthorizedCron (src/lib/cron-auth.ts): returns true ONLY when
// HERMES_SECRET is configured AND the request presents the exact matching
// value (constant-time compared). If HERMES_SECRET is unset, this DENIES.
//
// HERMES holds only this secret — never the Supabase service-role key — so a
// compromised laptop can at most poll/submit backlog tasks, never touch the
// database directly.
//
// Accepts the secret via `Authorization: Bearer <secret>` only (no header/query
// fallbacks — this is a machine-to-machine credential, not a browser-triggered
// cron ping).
export function isAuthorizedHermes(req: Request): boolean {
  const secret = process.env.HERMES_SECRET;
  if (!secret) return false; // fail closed

  const provided = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
