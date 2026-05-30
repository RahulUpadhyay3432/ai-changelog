import { NextResponse } from "next/server";

export const runtime = "nodejs";

// In-memory rate limit — one fetch per 5 minutes
let lastTriggerAt = 0;
const RATE_LIMIT_MS = 5 * 60 * 1000;

export async function POST() {
  const now = Date.now();

  if (now - lastTriggerAt < RATE_LIMIT_MS) {
    const secondsLeft = Math.ceil((RATE_LIMIT_MS - (now - lastTriggerAt)) / 1000);
    return NextResponse.json({ triggered: false, retryInSeconds: secondsLeft });
  }

  lastTriggerAt = now;

  // Fire-and-forget — don't await so the response returns immediately
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kapyn.vercel.app";
  fetch(`${baseUrl}/api/news/fetch`, {
    headers: process.env.CRON_SECRET
      ? { "x-cron-secret": process.env.CRON_SECRET }
      : {},
  }).catch(() => {});

  return NextResponse.json({ triggered: true });
}
