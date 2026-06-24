import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";

if (process.env.VAPID_SUBJECT && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function sendMorningNotification(
  supabase: SupabaseClient,
  insertedCount: number
): Promise<void> {
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth");

  if (error || !subscriptions?.length) return;

  const payload = JSON.stringify({
    title: "Kapyn",
    body: `${insertedCount} new AI dispatch${insertedCount !== 1 ? "es" : ""} ready`,
    url: "/",
  });

  const expiredIds: string[] = [];

  await Promise.allSettled(
    subscriptions.map(async (sub: PushSubscriptionRow) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) {
          expiredIds.push(sub.id);
        } else {
          console.error(`Push send failed for ${sub.endpoint}:`, err);
        }
      }
    })
  );

  if (expiredIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", expiredIds);
  }
}
