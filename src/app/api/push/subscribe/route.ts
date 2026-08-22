import { createClient } from "@supabase/supabase-js";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { isSafePublicUrl } from "@/lib/url-guard";

// Unauthenticated by necessity — Kapyn has no accounts, so a browser must be
// able to register its own push endpoint. That makes this route a capability
// worth fencing carefully: it writes with the service-role key, and the stored
// endpoints are later dereferenced server-side by web-push, so junk rows become
// outbound requests we pay for.
//
// Fences: shared Upstash limiter (per-instance Maps do not hold on Vercel),
// endpoint must be an https URL that passes the SSRF guard and belongs to a real
// push service, and length caps on every field. DELETE additionally requires the
// subscription's own auth key, so one caller cannot unsubscribe another.

const RATE_LIMIT = 10;
const RATE_WINDOW_SECONDS = 60;

const MAX_ENDPOINT = 512;
const MAX_KEY = 256;

// The push services browsers actually use. An endpoint outside these is either a
// mistake or an attempt to aim our outbound requests somewhere of their choosing.
const ALLOWED_PUSH_HOSTS = [
  /(^|\.)push\.services\.mozilla\.com$/i,
  /(^|\.)fcm\.googleapis\.com$/i,
  /(^|\.)android\.googleapis\.com$/i,
  /(^|\.)notify\.windows\.com$/i,
  /(^|\.)push\.apple\.com$/i,
  /(^|\.)web\.push\.apple\.com$/i,
];

function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey ?? anonKey);
}

function validEndpoint(endpoint: unknown): endpoint is string {
  if (typeof endpoint !== "string" || !endpoint || endpoint.length > MAX_ENDPOINT) return false;
  if (!isSafePublicUrl(endpoint)) return false;
  let u: URL;
  try {
    u = new URL(endpoint);
  } catch {
    return false;
  }
  if (u.protocol !== "https:") return false;
  return ALLOWED_PUSH_HOSTS.some((re) => re.test(u.hostname));
}

function validKey(k: unknown): k is string {
  return typeof k === "string" && k.length > 0 && k.length <= MAX_KEY;
}

async function limited(request: Request): Promise<boolean> {
  const { ok } = await rateLimit({
    key: `push-sub:${clientIp(request.headers)}`,
    limit: RATE_LIMIT,
    windowSeconds: RATE_WINDOW_SECONDS,
  });
  return !ok;
}

export async function POST(request: Request) {
  try {
    if (await limited(request)) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const { endpoint, keys } = body as {
      endpoint: unknown;
      keys?: { p256dh?: unknown; auth?: unknown };
    };

    if (!validEndpoint(endpoint) || !validKey(keys?.p256dh) || !validKey(keys?.auth)) {
      return Response.json({ error: "Invalid subscription" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("push_subscriptions").upsert(
      { endpoint, p256dh: keys.p256dh, auth: keys.auth },
      { onConflict: "endpoint" }
    );

    if (error) {
      console.error("push_subscriptions upsert:", error);
      return Response.json({ error: "DB error" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (await limited(request)) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const { endpoint, keys } = body as { endpoint: unknown; keys?: { auth?: unknown } };

    if (!validEndpoint(endpoint) || !validKey(keys?.auth)) {
      return Response.json({ error: "Invalid subscription" }, { status: 400 });
    }

    // Match on the auth key as well as the endpoint: knowing someone else's
    // endpoint URL must not be enough to unsubscribe them.
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint)
      .eq("auth", keys.auth);

    if (error) {
      console.error("push_subscriptions delete:", error);
      return Response.json({ error: "DB error" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
}
