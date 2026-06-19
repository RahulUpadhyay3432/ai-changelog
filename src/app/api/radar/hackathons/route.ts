import type { NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { fetchAllHackathons } from "@/lib/hackathons";
import { isAuthorizedCron } from "@/lib/cron-auth";

// Pulls AI/tech hackathons into radar_hackathons (Devpost now; more sources
// later). Each row carries the registration URL so the app can show everything
// in-app and only send the user out when they tap Register. Cron-triggered.
export const runtime = "nodejs";
export const maxDuration = 60;

function getAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: "SUPABASE_SERVICE_ROLE_KEY required" }, { status: 500 });
  }

  const now = new Date().toISOString();
  const errors: string[] = [];

  let items;
  try {
    items = await fetchAllHackathons();
  } catch (e) {
    return Response.json({ error: `fetch failed: ${String(e).slice(0, 200)}` }, { status: 502 });
  }

  const rows = items.map((h) => ({
    source: h.source,
    external_id: h.externalId,
    title: h.title,
    url: h.url,
    image_url: h.imageUrl,
    dates: h.dates,
    prize: h.prize,
    location: h.location,
    is_online: h.isOnline,
    themes: h.themes,
    participants: h.participants,
    open_state: h.openState,
    organization: h.organization,
    last_seen_at: now,
  }));

  let upserted = 0;
  if (rows.length > 0) {
    const { error } = await getAdmin()
      .from("radar_hackathons")
      .upsert(rows, { onConflict: "source,external_id" });
    if (error) errors.push(`upsert: ${error.message}`);
    else upserted = rows.length;
  }

  return Response.json({ fetched: items.length, upserted, errors });
}
