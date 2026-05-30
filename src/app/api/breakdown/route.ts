import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Per-IP rate limit: 10 requests per minute
const ipMap = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 10;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

// Prune stale entries every 5 minutes to avoid memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipMap.entries()) {
    if (now > entry.resetAt) ipMap.delete(ip);
  }
}, 5 * 60_000);

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.title !== "string" || typeof body.summary !== "string") {
    return NextResponse.json({ error: "Missing title or summary" }, { status: 400 });
  }

  const { title, summary } = body;
  if (!title.trim() || !summary.trim()) {
    return NextResponse.json({ error: "Missing title or summary" }, { status: 400 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const result = await model.generateContent(
      `You are explaining a tech/AI news story to someone smart but not a specialist. Be concise and direct.

Headline: "${title}"
Summary: "${summary}"

Respond in exactly this format:

[2-3 sentences explaining what this is in plain English]

Why it matters: [1-2 sentences on the real-world significance or impact]

Rules:
- Use **bold** around 3-5 key technical terms, company names, or numbers that are most important
- No headers, no bullet points, no other markdown
- Bold only the most signal-rich words, not common words`
    );

    const text = result.response.text();
    return NextResponse.json({ explanation: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Breakdown API error:", message);
    return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
  }
}
