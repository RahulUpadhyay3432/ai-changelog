// Hackathons — aggregated, in-app. We pull AI/tech hackathons from public
// sources, store the full details + the registration link, and show them inside
// Kapyn. The only time a user leaves the app is when they tap "Register".
//
// Source 1 (live): Devpost's public JSON (no key). The architecture takes a
// `source` per item so Luma / MLH / DoraHacks / Devfolio scrapers plug in later.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Hackathon {
  source: string;
  title: string;
  url: string; // detail / registration page (the only external hop)
  imageUrl: string | null;
  dates: string; // human string, e.g. "Jun 01 - Jul 15, 2026"
  prize: string | null; // e.g. "$10,000"
  location: string; // "Online" / "San Francisco, CA"
  isOnline: boolean;
  themes: string[];
  participants: number | null;
  openState: string; // "open" | "upcoming" | "ended"
  organization: string | null;
}

// What the ingestion upserts (adds the dedup key).
export interface HackathonInput extends Hackathon {
  externalId: string;
}

// ─── Devpost source ──────────────────────────────────────────────────────────

const DEVPOST_API = "https://devpost.com/api/hackathons";

interface DevpostHackathon {
  id: number;
  title: string;
  url: string;
  thumbnail_url: string | null;
  submission_period_dates: string | null;
  prize_amount: string | null; // HTML
  displayed_location: { location: string } | null;
  themes: Array<{ name: string }> | null;
  registrations_count: number | null;
  open_state: string | null;
  organization_name: string | null;
}

function stripHtml(s: string | null): string {
  return (s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function absolutize(u: string | null): string | null {
  if (!u) return null;
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("http")) return u;
  return null;
}

function normalizeDevpost(h: DevpostHackathon): HackathonInput | null {
  if (!h.title || !h.url) return null;
  const location = h.displayed_location?.location ?? "";
  const prize = stripHtml(h.prize_amount);
  return {
    source: "devpost",
    externalId: String(h.id),
    title: h.title.trim(),
    url: absolutize(h.url) ?? h.url,
    imageUrl: absolutize(h.thumbnail_url),
    dates: (h.submission_period_dates ?? "").trim(),
    prize: prize || null,
    location,
    isOnline: /online/i.test(location),
    themes: (h.themes ?? []).map((t) => t.name).filter(Boolean),
    participants: h.registrations_count ?? null,
    openState: h.open_state ?? "",
    organization: h.organization_name ?? null,
  };
}

// Fetch open + upcoming AI/ML hackathons (online + in-person) from Devpost.
export async function fetchDevpostHackathons(): Promise<HackathonInput[]> {
  const params = new URLSearchParams();
  params.append("challenge_type[]", "online");
  params.append("challenge_type[]", "in-person");
  params.append("themes[]", "Machine Learning/AI");
  params.append("status[]", "open");
  params.append("status[]", "upcoming");
  params.set("order_by", "deadline");

  const res = await fetch(`${DEVPOST_API}?${params.toString()}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Devpost API ${res.status}`);
  const json = (await res.json()) as { hackathons?: DevpostHackathon[] };
  return (json.hackathons ?? [])
    .map(normalizeDevpost)
    .filter((h): h is HackathonInput => !!h);
}

// All sources, deduped by source+externalId. Add Luma/MLH/etc. here later.
export async function fetchAllHackathons(): Promise<HackathonInput[]> {
  const settled = await Promise.allSettled([fetchDevpostHackathons()]);
  const seen = new Set<string>();
  const out: HackathonInput[] = [];
  for (const r of settled) {
    if (r.status !== "fulfilled") continue;
    for (const h of r.value) {
      const key = `${h.source}:${h.externalId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(h);
    }
  }
  return out;
}

// ─── Reader (radar_hackathons table) ─────────────────────────────────────────

interface HackathonRow {
  source: string;
  title: string;
  url: string;
  image_url: string | null;
  dates: string | null;
  prize: string | null;
  location: string | null;
  is_online: boolean | null;
  themes: string[] | null;
  participants: number | null;
  open_state: string | null;
  organization: string | null;
}

const HACKATHON_COLS =
  "source, title, url, image_url, dates, prize, location, is_online, themes, participants, open_state, organization";

function toHackathon(r: HackathonRow): Hackathon {
  return {
    source: r.source,
    title: r.title,
    url: r.url,
    imageUrl: r.image_url,
    dates: r.dates ?? "",
    prize: r.prize,
    location: r.location ?? "",
    isOnline: !!r.is_online,
    themes: r.themes ?? [],
    participants: r.participants,
    openState: r.open_state ?? "",
    organization: r.organization,
  };
}

// Reads the stored hackathons, most-subscribed first. Degrades to [] if the
// table doesn't exist yet (pre-migration), so the app never breaks.
export async function getHackathons(limit = 40): Promise<Hackathon[]> {
  const { data, error } = await supabase
    .from("radar_hackathons")
    .select(HACKATHON_COLS)
    .order("participants", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []).map((r) => toHackathon(r as HackathonRow));
}
