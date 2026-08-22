import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

// Global limit: one ingestion trigger per 5 minutes for everyone. This kicks off
// the heavy /api/news/fetch job (dozens of LLM calls), so the limit is global,
// not per-IP — otherwise many IPs could each fire ingestion. Enforced via Upstash
// so it holds across serverless instances (a module-level variable does not).
const TRIGGER_WINDOW_SECONDS = 5 * 60;

export async function POST() {
  // Deliberately unauthenticated: HomeFeed calls this on user refresh, and there
  // are no accounts to authenticate against. An audit flagged it as a free lever
  // for LLM cost abuse, but the limiter below is keyed GLOBALLY ("news-trigger",
  // not per-IP), so every caller on earth shares one run per 5 minutes — a
  // tighter bound than the 2-hourly cron already imposes. Adding cron auth here
  // would break pull-to-refresh to prevent something the limiter already
  // prevents. If the key ever becomes per-IP, revisit this.
  const { ok, reset } = await rateLimit({
    key: "news-trigger",
    limit: 1,
    windowSeconds: TRIGGER_WINDOW_SECONDS,
  });

  if (!ok) {
    const retryInSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    return NextResponse.json({ triggered: false, retryInSeconds });
  }

  // Fire-and-forget — don't await so the response returns immediately
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kapyn.app";
  fetch(`${baseUrl}/api/news/fetch`, {
    headers: process.env.CRON_SECRET
      ? { "x-cron-secret": process.env.CRON_SECRET }
      : {},
  }).catch(() => {});

  return NextResponse.json({ triggered: true });
}
