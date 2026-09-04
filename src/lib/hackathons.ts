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
  description?: string | null; // longer brief for the in-app detail sheet (where a source provides one)
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
    description: null, // Devpost's listing JSON carries no blurb
  };
}

// ─── AI / tech relevance ─────────────────────────────────────────────────────
// Sources that aren't pre-themed (Devpost's broad pass, Unstop, MLH) span every
// domain. We keep only the AI/tech-relevant ones so a finance or biology
// hackathon doesn't dilute the radar. Word-boundary match on the short acronyms
// (so "ai" doesn't fire on "captain"), substring on the multi-word phrases.
const AI_WORD = /\b(ai|a\.i\.|ml|ai\/ml|ml\/ai|llm|llms|gpt|nlp|rag|genai)\b/i;
const AI_PHRASE = [
  "artificial intelligence", "machine learning", "deep learning", "generative",
  "agent", "agentic", "neural", "computer vision", "data science", "chatbot",
  "large language", "multimodal", "diffusion", "voice ai", "automation", "robotics",
];

function isAiRelevant(h: HackathonInput): boolean {
  const hay = `${h.title} ${h.themes.join(" ")} ${h.organization ?? ""}`.toLowerCase();
  return AI_WORD.test(hay) || AI_PHRASE.some((p) => hay.includes(p));
}

// Format an ISO timestamp → "Jul 05, 2026" (used by sources that give a raw date).
function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

// One Devpost listing page → normalized items.
async function fetchDevpostPage(params: URLSearchParams): Promise<HackathonInput[]> {
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

// Devpost, two passes: (1) the themed Machine-Learning/AI listing — every item is
// already on-topic — and (2) a broad, prize-ranked listing AI-filtered down, which
// catches AI hackathons that simply weren't tagged ML/AI. Merged + deduped here.
export async function fetchDevpostHackathons(): Promise<HackathonInput[]> {
  const base = () => {
    const p = new URLSearchParams();
    p.append("challenge_type[]", "online");
    p.append("challenge_type[]", "in-person");
    p.append("status[]", "open");
    p.append("status[]", "upcoming");
    return p;
  };

  const themed = base();
  themed.append("themes[]", "Machine Learning/AI");
  themed.set("order_by", "deadline");

  const broad = base();
  broad.set("order_by", "prize-amount");

  const [a, b] = await Promise.allSettled([fetchDevpostPage(themed), fetchDevpostPage(broad)]);
  const themedItems = a.status === "fulfilled" ? a.value : [];
  const broadItems = (b.status === "fulfilled" ? b.value : []).filter(isAiRelevant);

  const seen = new Set<string>();
  const out: HackathonInput[] = [];
  for (const h of [...themedItems, ...broadItems]) {
    if (seen.has(h.externalId)) continue;
    seen.add(h.externalId);
    out.push(h);
  }
  return out;
}

// ─── Unstop source (India's largest hackathon aggregator) ────────────────────
// Public search JSON, no auth. Spans every domain, so we AI-filter it.

interface UnstopOpportunity {
  id: number;
  title: string;
  seo_url: string | null;
  logoUrl2: string | null;
  region: string | null;
  registerCount: number | null;
  regn_open: number | null;
  end_date: string | null;
  organisation: { name?: string } | null;
  prizes: Array<{ cash?: number; currency?: string }> | null;
  required_skills: Array<{ skill?: string; skill_name?: string }> | null;
  details: string | null;
}

function unstopPrize(prizes: UnstopOpportunity["prizes"]): string | null {
  if (!prizes?.length) return null;
  const total = prizes.reduce((sum, p) => sum + (Number(p.cash) || 0), 0);
  if (total <= 0) return null;
  const cur = prizes[0].currency ?? "";
  const sym = /rupee/i.test(cur) ? "₹" : /dollar/i.test(cur) ? "$" : "";
  return `${sym}${total.toLocaleString(sym === "₹" ? "en-IN" : "en-US")}`;
}

export async function fetchUnstopHackathons(): Promise<HackathonInput[]> {
  const url =
    "https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&oppstatus=open&per_page=30";
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Unstop API ${res.status}`);
  const json = (await res.json()) as { data?: { data?: UnstopOpportunity[] } };
  const rows = json.data?.data ?? [];
  return rows
    .map((o): HackathonInput | null => {
      if (!o.title || !o.seo_url) return null;
      const isOnline = /online/i.test(o.region ?? "");
      const brief = stripHtml(o.details);
      return {
        source: "unstop",
        externalId: String(o.id),
        title: o.title.trim(),
        url: o.seo_url,
        imageUrl: o.logoUrl2 ?? null,
        dates: o.end_date ? `Ends ${fmtDate(o.end_date)}` : "",
        prize: unstopPrize(o.prizes),
        location: isOnline ? "Online" : "In-person",
        isOnline,
        themes: (o.required_skills ?? [])
          .map((s) => s.skill ?? s.skill_name ?? "")
          .filter(Boolean)
          .slice(0, 6),
        participants: o.registerCount ?? null,
        openState: o.regn_open ? "open" : "upcoming",
        organization: o.organisation?.name ?? null,
        description: brief ? brief.slice(0, 360) : null,
      };
    })
    .filter((h): h is HackathonInput => !!h)
    .filter(isAiRelevant);
}

// ─── MLH source (Major League Hacking, 2026 season) ──────────────────────────
// MLH is a static HTML page; each event is an <a> wrapping image, title, and two
// info rows (date, location). Best-effort + AI-filtered — mostly student events,
// so only the AI-themed ones (e.g. "Global Hack Week: Agents") survive the filter.

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ");
}

export async function fetchMlhEvents(): Promise<HackathonInput[]> {
  const res = await fetch(`https://mlh.com/seasons/${new Date().getFullYear()}/events`, {
    headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0" },
    redirect: "follow",
    next: { revalidate: 21600 },
  });
  if (!res.ok) throw new Error(`MLH ${res.status}`);
  const html = await res.text();
  const cards = [...html.matchAll(/<a\b[^>]*href="(https?:\/\/[^"]*utm_source=mlh[^"]*)"[^>]*>([\s\S]*?)<\/a>/g)];
  const out: HackathonInput[] = [];
  const seen = new Set<string>();
  for (const [, rawHref, inner] of cards) {
    const titleM = inner.match(/line-clamp-2[^>]*>([\s\S]*?)<\//);
    const imgM = inner.match(/src="(https?:\/\/[^"]+)"/);
    const infos = [...inner.matchAll(/text-sm truncate[^>]*>([\s\S]*?)<\//g)].map((m) =>
      decodeEntities(m[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()),
    );
    const title = titleM ? decodeEntities(titleM[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()) : "";
    if (!title) continue;
    const url = decodeEntities(rawHref).split("?")[0];
    const id = url.replace(/^https?:\/\//, "").replace(/[^a-z0-9]/gi, "-").slice(0, 80);
    if (seen.has(id)) continue;
    seen.add(id);
    const location = infos[1] ?? "";
    out.push({
      source: "mlh",
      externalId: id,
      title,
      url,
      imageUrl: imgM ? imgM[1] : null,
      dates: infos[0] ?? "",
      prize: null,
      location: /everywhere|worldwide|online|virtual/i.test(location) ? "Online" : location || "In-person",
      isOnline: /everywhere|worldwide|online|virtual/i.test(location),
      themes: [],
      participants: null,
      openState: "upcoming",
      organization: "Major League Hacking",
      description: null,
    });
  }
  return out.filter(isAiRelevant);
}

// ─── Curated marquee backbone ────────────────────────────────────────────────
// A small, hand-verified set of flagship events that the generic scrapers
// structurally miss — e.g. Devpost subdomain microsites the themed listing can't
// see, and national programmes off Devpost entirely. Mirrors CURATED_ESSENTIALS.
// These are guaranteed present and ranked first. Keep tight + currently-live.
// Marquee events the Devpost and MLH feeds miss. Nothing expires these automatically, so a
// dated entry here goes wrong silently. `npm run check:freshness` fails when an openState
// contradicts its own dates; verify against the organiser's page before adding or reviving one.
const CURATED_HACKATHONS: HackathonInput[] = [
  {
    source: "curated",
    externalId: "smart-india-hackathon-2026",
    title: "Smart India Hackathon 2026",
    url: "https://www.sih.gov.in",
    imageUrl: null,
    dates: "2026 edition, registrations open",
    prize: null,
    location: "India",
    isOnline: false,
    themes: ["AI", "Innovation", "Government"],
    participants: null,
    openState: "open",
    organization: "Government of India",
    description:
      "India's flagship nationwide hackathon, where student teams build solutions, many AI-driven , for problem statements posed by ministries and industry.",
  },
];

// Rank: curated marquee first, then open before upcoming, then by registrations.
function rankHackathons(items: HackathonInput[]): HackathonInput[] {
  const stateRank = (s: string) => (s.toLowerCase() === "open" ? 0 : s.toLowerCase() === "upcoming" ? 1 : 2);
  return [...items].sort((a, b) => {
    if ((a.source === "curated") !== (b.source === "curated")) return a.source === "curated" ? -1 : 1;
    const sr = stateRank(a.openState) - stateRank(b.openState);
    if (sr !== 0) return sr;
    return (b.participants ?? 0) - (a.participants ?? 0);
  });
}

// ─── Kaggle source (official public API, free auth) ──────────────────────────
// Requires KAGGLE_USERNAME + KAGGLE_KEY env vars (from kaggle.com → Settings →
// API → Create New Token). Falls back gracefully to [] if missing.

interface KaggleCompetition {
  ref: string;        // slug, e.g. "titanic"
  title: string;
  deadline: string;   // ISO 8601
  reward: string;     // e.g. "$50,000" or "Swag" or ""
  teamCount: number;
  category: string;   // "featured" | "research" | "community" | "playground" | ...
}

export async function fetchKaggleCompetitions(): Promise<HackathonInput[]> {
  const user = process.env.KAGGLE_USERNAME;
  const key = process.env.KAGGLE_KEY;
  if (!user || !key) return [];

  const auth = Buffer.from(`${user}:${key}`).toString("base64");
  const params = new URLSearchParams({ sortBy: "latestDeadline", pageSize: "30", group: "general" });
  const res = await fetch(`https://www.kaggle.com/api/v1/competitions/list?${params}`, {
    headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
    next: { revalidate: 21600 },
  });
  if (!res.ok) return [];

  const comps = (await res.json()) as KaggleCompetition[];
  const now = Date.now();
  return comps
    .filter((c) => {
      if (!c.ref || !c.title) return false;
      if (c.category === "playground") return false; // skip getting-started toy comps
      const dl = new Date(c.deadline).getTime();
      return dl > now; // only active
    })
    .map((c): HackathonInput => {
      const deadline = fmtDate(c.deadline);
      const prize = c.reward && !/^(knowledge|kudos|swag)$/i.test(c.reward.trim()) ? c.reward : null;
      return {
        source: "kaggle",
        externalId: c.ref,
        title: c.title,
        url: `https://www.kaggle.com/c/${c.ref}`,
        imageUrl: null,
        dates: deadline ? `Deadline ${deadline}` : "",
        prize,
        location: "Online",
        isOnline: true,
        themes: ["Machine Learning", "Data Science"],
        participants: c.teamCount || null,
        openState: "open",
        organization: "Kaggle",
        description: null,
      };
    })
    .filter(isAiRelevant);
}

// All sources, curated first, deduped by source+externalId AND normalized title
// (the same event can surface on Devpost + Unstop). Any failing source drops out.
export async function fetchAllHackathons(): Promise<HackathonInput[]> {
  const settled = await Promise.allSettled([
    fetchDevpostHackathons(),
    fetchUnstopHackathons(),
    fetchMlhEvents(),
    fetchKaggleCompetitions(),
  ]);
  const idSeen = new Set<string>();
  const titleSeen = new Set<string>();
  const out: HackathonInput[] = [];
  const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, "");

  const consider = (h: HackathonInput) => {
    const idKey = `${h.source}:${h.externalId}`;
    const titleKey = norm(h.title);
    if (idSeen.has(idKey) || titleSeen.has(titleKey)) return;
    idSeen.add(idKey);
    titleSeen.add(titleKey);
    out.push(h);
  };

  // Curated first so it wins title-dedup over a live duplicate.
  CURATED_HACKATHONS.forEach(consider);
  for (const r of settled) {
    if (r.status !== "fulfilled") continue;
    r.value.forEach(consider);
  }
  return rankHackathons(out);
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
    description: null, // table has no blurb column yet (migration 0008)
  };
}

// Reads the stored hackathons, most-subscribed first. The table (migration 0008 +
// the cron) is the primary, durable path. If it isn't there yet — or is still empty
// — we fall back to a live Devpost fetch so the feature shows immediately with zero
// Supabase setup. Both paths degrade to [] on failure, so the app never breaks.
export async function getHackathons(limit = 40): Promise<Hackathon[]> {
  const { data, error } = await supabase
    .from("radar_hackathons")
    .select(HACKATHON_COLS)
    .order("participants", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (!error && data && data.length > 0) {
    return data.map((r) => toHackathon(r as HackathonRow));
  }
  // Table missing or empty → live multi-source fallback (Devpost + Unstop + MLH +
  // curated marquee). Already ranked; just cap. HackathonInput extends Hackathon.
  try {
    const live = await fetchAllHackathons();
    return live.slice(0, limit);
  } catch {
    return [];
  }
}
