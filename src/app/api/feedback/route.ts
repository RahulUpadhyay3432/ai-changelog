import { createClient } from "@supabase/supabase-js";
import { rateLimit, clientIp } from "@/lib/ratelimit";

// In-memory rate limit: 5 submissions per IP per 15-minute window.
// Resets on cold start — acceptable; the goal is blocking rapid spam floods,
// not defeating a determined prober who can wait.


// Strip null bytes and non-printable control characters.
// Keeps \t (0x09), \n (0x0a), \r (0x0d), space, and all printable/Unicode.
/* eslint-disable no-control-regex */
const CONTROL_RE = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g;
/* eslint-enable no-control-regex */
function sanitize(s: string): string {
  return s.replace(CONTROL_RE, "").trim();
}

function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  // Prefer service role — it bypasses RLS. Confirm that `feedback` RLS is set
  // to INSERT-only (no SELECT for anon) so users can't read each other's messages.
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey ?? anonKey);
}

export async function POST(request: Request) {
  try {
    const ip = clientIp(request.headers);

    const { ok: withinLimit } = await rateLimit({ key: `feedback:${ip}`, limit: 5, windowSeconds: 900 });
    if (!withinLimit) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const raw = typeof body?.message === "string" ? body.message.trim() : "";
    const message = sanitize(raw);

    if (!message || message.length < 2 || message.length > 2000) {
      return Response.json({ error: "Invalid message" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("feedback").insert({ message });

    if (error) {
      console.error("feedback insert:", error);
      return Response.json({ error: "DB error" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
}
