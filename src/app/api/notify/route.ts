import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";
import { isAuthorizedCron } from "@/lib/cron-auth";

// The daily push: one notification pointing at the freshest story.
//
// Cron-triggered (see vercel.json, 0 7 * * *). Vercel Cron invokes the path with
// GET, so GET is the entry point every other cron route in this repo uses; POST
// stays for manual triggers. This route used to export POST only, which meant the
// morning cron got a 405 and the push never went out.
//
// Gated on the VAPID keys the same way the digest is gated on RESEND_API_KEY:
// no keys → no-op that SAYS so, rather than a silent zero.

const vapidConfigured = Boolean(
  process.env.VAPID_SUBJECT && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
);

if (vapidConfigured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

export const runtime = "nodejs";
export const maxDuration = 60;

async function sendDailyPush(req: Request): Promise<Response> {
  if (!isAuthorizedCron(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!vapidConfigured) {
    return Response.json({ sent: 0, expired: 0, skipped: "vapid_not_configured" });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Grab the freshest story as the notification hook
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: stories } = await supabase
    .from("news_items")
    .select("id, title")
    .gte("published_at", cutoff)
    .order("published_at", { ascending: false })
    .limit(1);

  const story = stories?.[0];
  const payload = JSON.stringify({
    title: "Kapyn",
    body: story?.title ?? "New AI dispatches are ready.",
    url: story?.id ? `/?story=${story.id}` : "/",
  });

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth");

  if (!subs?.length) {
    return Response.json({ sent: 0, expired: 0 });
  }

  const expiredIds: string[] = [];
  let sent = 0;

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        // 410 Gone / 404 = subscription expired, remove it
        if (status === 410 || status === 404) {
          expiredIds.push(sub.id);
        }
      }
    })
  );

  if (expiredIds.length) {
    await supabase.from("push_subscriptions").delete().in("id", expiredIds);
  }

  return Response.json({ sent, expired: expiredIds.length });
}

export async function GET(req: Request) {
  return sendDailyPush(req);
}

export async function POST(req: Request) {
  return sendDailyPush(req);
}
