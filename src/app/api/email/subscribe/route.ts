import { createClient } from "@supabase/supabase-js";
import { rateLimit, clientIp } from "@/lib/ratelimit";

// Per-IP rate limit: 5 signups / 15 min (resets on cold start — blocks spam
// floods, not a determined actor). Mirrors the feedback endpoint.


// Deliberately simple + permissive — real validation is the confirmation, not a regex.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function getAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey ?? anonKey);
}

export async function POST(request: Request) {
  try {
    const ip = clientIp(request.headers);
    const { ok: withinLimit } = await rateLimit({ key: `email-sub:${ip}`, limit: 5, windowSeconds: 900 });
    if (!withinLimit) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const source = typeof body?.source === "string" ? body.source.slice(0, 40) : null;

    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    // Idempotent: a repeat signup is a success, not a duplicate error.
    const { error } = await getAdmin()
      .from("email_subscribers")
      .upsert({ email, source }, { onConflict: "email", ignoreDuplicates: true });

    if (error) {
      console.error("email subscribe:", error);
      return Response.json({ error: "DB error" }, { status: 500 });
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
}
