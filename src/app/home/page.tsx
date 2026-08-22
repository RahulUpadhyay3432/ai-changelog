import type { Metadata } from "next";
import Link from "next/link";
import {
  Cpu, Brain, Plug, Sparkles, GitBranch, Trophy,
  ArrowRight, ArrowUpRight, Compass, Bookmark, Search,
} from "lucide-react";
import { fetchNewsItems } from "@/lib/supabase";
import { FEED_WINDOW_LABEL } from "@/lib/feed-window";
import { getRadarTools } from "@/lib/knowledge";
import { CURATED_ESSENTIALS } from "@/lib/radar-essentials";
import { MCP_SERVERS } from "@/lib/radar-mcp";
import { AI_SKILLS } from "@/lib/radar-skills";
import { CATEGORIES } from "@/lib/categories";
import { BLOG_POSTS } from "@/lib/blog-content";
import {
  GOLD, GOLD_SOFT, GOLD_BORDER, CANVAS, SURFACE, SURFACE_RAISED, HAIRLINE, TEXT, SG,
} from "@/lib/design-tokens";
import { QRCodeBlock } from "@/components/landing/QRCodeBlock";
import { CommandPalette } from "@/components/CommandPalette";
import { TopNav } from "./TopNav";
import { type MarqueeItem } from "./HeroMarquee";
import { HeroRadarPanel } from "./HeroRadarPanel";
import { HeroHeadline } from "./HeroHeadline";
import { HeroPill } from "./HeroPill";
import styles from "./landing.module.css";
import { serializeJsonLd } from "@/lib/json-ld";

export const revalidate = 1800;

const APP_URL = "https://kapyn.app";
const DESC =
  "The calm map of the AI worth using, agents, models, tools, MCP servers and skills. Curated, kept current by a daily signal, never behind a paywall.";

export const metadata: Metadata = {
  title: "Discover the AI worth using: agents, models, tools, MCP servers & skills",
  description: DESC,
  alternates: { canonical: `${APP_URL}/home` },
  openGraph: {
    title: "Kapyn, Find the AI worth using",
    description: DESC,
    url: `${APP_URL}/home`,
    siteName: "Kapyn",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Kapyn, Find the AI worth using", description: DESC },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function faviconFor(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "github.com") {
      const owner = u.pathname.split("/").filter(Boolean)[0];
      return owner ? `/api/favicon?github=${encodeURIComponent(owner)}` : `/api/favicon?domain=github.com`;
    }
    return `/api/favicon?domain=${encodeURIComponent(host)}`;
  } catch {
    return null;
  }
}

function timeAgo(iso?: string): string {
  if (!iso) return "updated today";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 2) return "updated just now";
  if (mins < 60) return `updated ${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `updated ${hrs}h ago`;
  return `updated ${Math.floor(hrs / 24)}d ago`;
}

function roundRobin<T>(...lists: T[][]): T[] {
  const out: T[] = [];
  const max = Math.max(...lists.map((l) => l.length));
  for (let i = 0; i < max; i++) for (const l of lists) if (l[i] !== undefined) out.push(l[i]);
  return out;
}

// ─── Small server building blocks ────────────────────────────────────────────
function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: SG, fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: GOLD }}>
      {children}
    </span>
  );
}

function SectionHead({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: "22px" }}>
      <Kicker>{kicker}</Kicker>
      <h2 style={{ fontFamily: SG, fontSize: "28px", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.025em", margin: "10px 0 0", lineHeight: 1.1 }}>{title}</h2>
      {sub && <p style={{ fontSize: "15px", color: TEXT.muted, margin: "8px 0 0", lineHeight: 1.5, maxWidth: "560px" }}>{sub}</p>}
    </div>
  );
}

function SeeAll({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: SG, fontSize: "13px", fontWeight: 600, color: GOLD, textDecoration: "none" }}>
      {children} <ArrowRight size={13} strokeWidth={2.3} />
    </Link>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default async function LandingPage() {
  const [news, tools] = await Promise.all([
    fetchNewsItems().catch(() => []),
    getRadarTools(40).catch(() => []),
  ]);

  const toolCount = CURATED_ESSENTIALS.length;
  const mcpCount = MCP_SERVERS.length;
  const skillCount = AI_SKILLS.length;
  const storyCount = news.length;

  const githubTools = tools.filter((t) => t.source === "github").slice(0, 5);
  const phTools = tools.filter((t) => t.source === "producthunt").slice(0, 5);
  const topStories = news.slice(0, 5);

  // Hero catalog wall — interleave tools / MCP / skills for variety.
  const marquee: MarqueeItem[] = roundRobin<MarqueeItem>(
    CURATED_ESSENTIALS.slice(0, 7).map((e) => ({ name: e.name, typeLabel: "tool", faviconHref: faviconFor(e.url), href: "/radar/browse" })),
    MCP_SERVERS.slice(0, 6).map((m) => ({ name: m.name, typeLabel: "MCP", faviconHref: faviconFor(m.url), href: "/radar/mcp" })),
    AI_SKILLS.slice(0, 5).map((s) => ({ name: s.name, typeLabel: "skill", faviconHref: faviconFor(s.url), href: "/radar/mcp?tab=skills" })),
  );

  const modelsCount = CURATED_ESSENTIALS.filter((e) => e.category === "Models & chat").length;

  const mapCards = [
    { Icon: Cpu, title: "Agents & Tools", line: "Coding agents, frameworks, automation", count: toolCount, chips: ["Cursor", "LangGraph", "n8n"], href: "/radar/browse" },
    { Icon: Brain, title: "Models & Chat", line: "Where to run what you build on", count: modelsCount, chips: ["Claude", "GPT", "Gemini"], href: "/radar/browse" },
    { Icon: Plug, title: "MCP servers", line: "Plug tools into your assistant", count: mcpCount, chips: ["GitHub", "Postgres", "Linear"], href: "/radar/mcp" },
    { Icon: Sparkles, title: "AI skills", line: "Reusable skills for Claude, GPT & Gemini", count: skillCount, chips: ["Writing", "Research", "Data"], href: "/radar/mcp?tab=skills" },
    { Icon: GitBranch, title: "Open source", line: "The OSS canon + what's trending now", count: githubTools.length || null, chips: ["Trending", "Canon", "48h"], href: "/radar" },
    { Icon: Trophy, title: "Hackathons", line: "Where to go build, online & in person", count: null, chips: ["Online", "In person", "Prizes"], href: "/radar/hackathons" },
  ];

  const learn = [
    { q: "What is MCP (Model Context Protocol)?", a: "An open standard that lets an AI assistant call external tools and data sources through a uniform interface, so one agent can reach your files, database, and APIs without bespoke glue for each.", slug: "mcp" },
    { q: "What is an AI agent?", a: "A system that uses a model to decide and act in a loop, calling tools, reading results, and continuing until a goal is met , rather than returning a single response.", slug: "agents" },
    { q: "What is RAG?", a: "Retrieval-augmented generation: fetch relevant documents at query time and feed them to the model as context, so answers are grounded in your data instead of the model's memory.", slug: "rag" },
    { q: "What is chain-of-thought?", a: "Prompting a model to reason step by step before answering. Working through intermediate steps tends to improve accuracy on math, logic, and multi-step tasks.", slug: "chain-of-thought" },
    { q: "What is fine-tuning?", a: "Continuing a model's training on your own examples so it adapts to a specific tone, format, or task, an alternative to packing everything into the prompt.", slug: "fine-tuning" },
    { q: "What is prompt engineering?", a: "The practice of shaping a model's input, instructions, examples, and structure , to get reliable, useful output without changing the model itself.", slug: "prompt-engineering" },
  ];

  const cardStyle: React.CSSProperties = {
    display: "block", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "16px", padding: "18px", textDecoration: "none", color: "inherit",
  };

  // Hand-picked 12 — 3 from each key category. Order matters (most recognisable first).
  const ESSENTIALS_SHOWCASE = [
    { name: "ChatGPT",       valueLine: "Reason, write, and prototype with OpenAI's frontier models.",          url: "https://chatgpt.com" },
    { name: "Claude",        valueLine: "Long-context reasoning and coding with Anthropic's models.",           url: "https://claude.ai" },
    { name: "Gemini",        valueLine: "Multimodal reasoning across text, image, and video.",                  url: "https://gemini.google.com" },
    { name: "Cursor",        valueLine: "AI-native editor that edits across your whole repo.",                  url: "https://cursor.com" },
    { name: "Claude Code",   valueLine: "Agentic coding in your terminal, plans and edits across files.",      url: "https://claude.com/claude-code" },
    { name: "Lovable",       valueLine: "Build and ship full web apps from a prompt.",                          url: "https://lovable.dev" },
    { name: "v0",            valueLine: "Generate polished UI components from text or a screenshot.",           url: "https://v0.dev" },
    { name: "Bolt",          valueLine: "Full-stack AI apps in your browser, no local setup needed.",          url: "https://bolt.new" },
    { name: "Figma",         valueLine: "The collaborative design tool, now with AI-powered features.",        url: "https://figma.com" },
    { name: "Supabase",      valueLine: "Postgres + auth + storage + pgvector, ready in minutes.",              url: "https://supabase.com" },
    { name: "Vercel",        valueLine: "Deploy and scale Next.js apps globally with zero config.",             url: "https://vercel.com" },
    { name: "OpenRouter",    valueLine: "One API for 100+ LLMs, switch models without code changes.",          url: "https://openrouter.ai" },
  ];

  // ── JSON-LD ──
  const navJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Kapyn navigation",
    itemListElement: [
      { name: "Feed", url: `${APP_URL}/` },
      { name: "Radar", url: `${APP_URL}/radar` },
      { name: "Tools & Agents", url: `${APP_URL}/radar/browse` },
      { name: "MCP servers", url: `${APP_URL}/radar/mcp` },
      { name: "Hackathons", url: `${APP_URL}/radar/hackathons` },
      { name: "Learn", url: `${APP_URL}/explore` },
    ].map((it, i) => ({ "@type": "SiteNavigationElement", position: i + 1, name: it.name, url: it.url })),
  };
  const catalogJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "The AI worth using, on Kapyn Radar",
    itemListElement: marquee.slice(0, 16).map((m, i) => ({ "@type": "ListItem", position: i + 1, name: m.name })),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: learn.map((l) => ({ "@type": "Question", name: l.q, acceptedAnswer: { "@type": "Answer", text: l.a } })),
  };

  const blogPosts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  return (
    <div className={styles.root}>
      <TopNav />
      <CommandPalette />

      {/* 1 · Hero ──────────────────────────────────────────────────────────── */}
      <header className={styles.heroWrap}>
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroGrid} aria-hidden />
        <div className={styles.inner} style={{ position: "relative", zIndex: 1 }}>
          <div className={styles.hero}>
            <div className={styles.fadeUp}>
              <HeroPill storyCount={storyCount} />
              <HeroHeadline />
              <p style={{ fontSize: "18px", color: TEXT.body, lineHeight: 1.55, margin: "20px 0 0", maxWidth: "480px" }}>
                Agents, models, tools, MCP servers and skills, curated, kept current by a calm daily signal. No noise, no paywall, ever.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", margin: "28px 0 0" }}>
                <Link className="kt-cta" href="/radar" style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: SG, fontSize: "15px", fontWeight: 600, color: "#ffffff", background: GOLD, borderRadius: "12px", padding: "13px 22px", textDecoration: "none" }}>
                  Open the Radar <ArrowRight size={17} strokeWidth={2.4} />
                </Link>
                <Link href="/?app=1" style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: SG, fontSize: "15px", fontWeight: 600, color: TEXT.body, background: "transparent", border: `1px solid ${HAIRLINE}`, borderRadius: "12px", padding: "13px 22px", textDecoration: "none" }}>
                  Today&apos;s feed
                </Link>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "26px 0 0" }}>
                <div style={{ background: "#fff", borderRadius: "10px", padding: "8px", display: "inline-flex", flexShrink: 0 }}>
                  <QRCodeBlock size={76} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  <span style={{ fontFamily: SG, fontSize: "14px", fontWeight: 600, color: TEXT.primary }}>Built for your phone</span>
                  <span style={{ fontSize: "13px", color: TEXT.muted, lineHeight: 1.45, maxWidth: "240px" }}>
                    Scan for the 30-second daily brief , or{" "}
                    <Link href="/?app=1" style={{ color: TEXT.body, fontWeight: 600, textDecoration: "none" }}>open it here →</Link>
                  </span>
                </div>
              </div>
            </div>
            <HeroRadarPanel toolCount={toolCount} mcpCount={mcpCount} skillCount={skillCount} />
          </div>

          {/* 2 · Stat strip */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 28px", padding: "16px 20px", margin: "0 0 8px", border: `1px solid ${HAIRLINE}`, borderRadius: "14px", background: SURFACE }}>
            {[
              { n: toolCount, l: "tools" },
              { n: mcpCount, l: "MCP servers" },
              { n: skillCount, l: "AI skills" },
              { n: storyCount, l: `stories / ${FEED_WINDOW_LABEL}` },
            ].map((s) => (
              <span key={s.l} style={{ display: "inline-flex", alignItems: "baseline", gap: "7px" }}>
                <span style={{ fontFamily: SG, fontSize: "20px", fontWeight: 700, color: TEXT.primary, fontVariantNumeric: "tabular-nums" }}>{s.n}</span>
                <span style={{ fontSize: "13.5px", color: TEXT.muted }}>{s.l}</span>
              </span>
            ))}
            <span style={{ marginLeft: "auto", fontSize: "13px", color: TEXT.muted, alignSelf: "center" }}>kept current · last {FEED_WINDOW_LABEL}</span>
          </div>
        </div>
      </header>

      {/* 3 · The Map ───────────────────────────────────────────────────────── */}
      <section className={styles.section} style={{ padding: "48px 24px" }}>
        <div className={styles.inner}>
          <SectionHead kicker="The map" title="Everything worth knowing, in one place" sub="Not a search box, a curated, current map of the AI ecosystem. Browse by what you're actually doing." />
          <div className={styles.mapGrid}>
            {mapCards.map(({ Icon, title, line, count, chips, href }) => (
              <Link key={title} href={href} style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <span style={{ width: "38px", height: "38px", borderRadius: "11px", background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={19} color={GOLD} strokeWidth={2} />
                  </span>
                  {count != null && <span style={{ fontFamily: SG, fontSize: "15px", fontWeight: 700, color: TEXT.muted, fontVariantNumeric: "tabular-nums" }}>{count}</span>}
                </div>
                <h3 style={{ fontFamily: SG, fontSize: "17px", fontWeight: 600, color: TEXT.primary, margin: 0, letterSpacing: "-0.01em" }}>{title}</h3>
                <p style={{ fontSize: "13.5px", color: TEXT.muted, margin: "5px 0 14px", lineHeight: 1.4 }}>{line}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {chips.map((c) => (
                    <span key={c} style={{ fontSize: "12px", fontWeight: 500, color: TEXT.body, background: SURFACE_RAISED, border: `1px solid ${HAIRLINE}`, borderRadius: "100px", padding: "3px 10px" }}>{c}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4 · Essential Toolkit ─────────────────────────────────────────────── */}
      <section className={styles.section} style={{ padding: "0 24px 48px" }}>
        <div className={styles.inner}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "22px", gap: "12px", flexWrap: "wrap" }}>
            <div>
              <Kicker>Essential toolkit</Kicker>
              <h2 style={{ fontFamily: SG, fontSize: "28px", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.025em", margin: "10px 0 0", lineHeight: 1.1 }}>
                The tools every AI builder uses
              </h2>
            </div>
            <SeeAll href="/radar/browse">See full toolkit</SeeAll>
          </div>
          <div className={styles.toolGrid}>
            {ESSENTIALS_SHOWCASE.map((tool) => {
              const fav = faviconFor(tool.url);
              return (
                <a
                  key={tool.name}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", flexDirection: "column", gap: "8px",
                    background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "14px",
                    padding: "12px 14px", textDecoration: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {fav && <img src={fav} alt="" width={20} height={20} style={{ borderRadius: "5px", flexShrink: 0 }} />}
                    <span style={{ fontFamily: SG, fontSize: "14px", fontWeight: 600, color: TEXT.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tool.name}</span>
                  </div>
                  <span style={{ fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{tool.valueLine}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5 · Moving Now ────────────────────────────────────────────────────── */}
      <section className={styles.section} style={{ padding: "0 24px 48px" }}>
        <div className={styles.inner}>
          <SectionHead kicker="Moving now" title="What changed this week" />
          <div className={styles.movingGrid}>
            {/* GitHub trending */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <GitBranch size={15} color={TEXT.muted} strokeWidth={2} />
                <span style={{ fontFamily: SG, fontSize: "13px", fontWeight: 600, color: TEXT.body }}>Trending on GitHub · 48h</span>
              </div>
              {githubTools.length === 0 ? (
                <p style={{ fontSize: "13.5px", color: TEXT.muted, margin: "0 0 10px" }}>Catching the next wave…</p>
              ) : githubTools.map((t) => (
                <a key={t.url} href={t.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: "10px 0", borderTop: `1px solid ${HAIRLINE}`, textDecoration: "none" }}>
                  <span style={{ fontFamily: SG, fontSize: "14.5px", fontWeight: 600, color: TEXT.primary }}>{t.name}</span>
                  {t.meta && <span style={{ display: "block", fontSize: "12.5px", color: TEXT.muted, marginTop: "2px" }}>{t.meta}</span>}
                </a>
              ))}
              <div style={{ marginTop: "10px" }}><SeeAll href="/radar">See all on the Radar</SeeAll></div>
            </div>
            {/* New on the radar */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <Sparkles size={15} color={TEXT.muted} strokeWidth={2} />
                <span style={{ fontFamily: SG, fontSize: "13px", fontWeight: 600, color: TEXT.body }}>New on the Radar</span>
              </div>
              {phTools.length === 0 ? (
                <p style={{ fontSize: "13.5px", color: TEXT.muted, margin: "0 0 10px" }}>Fresh launches land here daily.</p>
              ) : phTools.map((t) => (
                <a key={t.url} href={t.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: "10px 0", borderTop: `1px solid ${HAIRLINE}`, textDecoration: "none" }}>
                  <span style={{ fontFamily: SG, fontSize: "14.5px", fontWeight: 600, color: TEXT.primary }}>{t.name}</span>
                  {t.valueLine && <span style={{ display: "block", fontSize: "12.5px", color: TEXT.muted, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.valueLine}</span>}
                </a>
              ))}
              <div style={{ marginTop: "10px" }}><SeeAll href="/radar/browse">Browse the catalog</SeeAll></div>
            </div>
            {/* Top stories */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <Compass size={15} color={TEXT.muted} strokeWidth={2} />
                <span style={{ fontFamily: SG, fontSize: "13px", fontWeight: 600, color: TEXT.body }}>Top stories today</span>
              </div>
              {topStories.length === 0 ? (
                <p style={{ fontSize: "13.5px", color: TEXT.muted, margin: "0 0 10px" }}>The feed is warming up.</p>
              ) : topStories.map((s) => (
                <Link key={s.id} href={`/story/${s.id}`} style={{ display: "block", padding: "10px 0", borderTop: `1px solid ${HAIRLINE}`, textDecoration: "none" }}>
                  <span style={{ fontFamily: SG, fontSize: "14.5px", fontWeight: 600, color: TEXT.primary, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.title}</span>
                  <span style={{ display: "block", fontSize: "12.5px", color: TEXT.muted, marginTop: "3px" }}>{s.sourceName}</span>
                </Link>
              ))}
              <div style={{ marginTop: "10px" }}><SeeAll href="/?app=1">See the feed</SeeAll></div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 · Three Jobs ────────────────────────────────────────────────────── */}
      <section className={styles.section} style={{ padding: "8px 24px 48px" }}>
        <div className={styles.inner}>
          <div className={styles.jobsGrid}>
            {[
              { Icon: Search, title: "Discover", body: "Surface the agent, model, or MCP server you didn't know to ask for, filed by what you're building, not buried in a feed.", href: "/radar", cta: "Open the Radar" },
              { Icon: Compass, title: "Track", body: "See what launched, what's trending, and what got deprecated, a calm daily signal that keeps the map honest.", href: "/radar/browse", cta: "Browse what's new" },
              { Icon: Bookmark, title: "Build", body: "Save any tool into a named Loadout. Your RAG stack, your hackathon kit. The map becomes your map.", href: "/radar/toolkit", cta: "Open the Toolkit" },
            ].map(({ Icon, title, body, href, cta }) => (
              <div key={title} style={{ background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "16px", padding: "22px" }}>
                <span style={{ width: "40px", height: "40px", borderRadius: "11px", background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                  <Icon size={20} color={GOLD} strokeWidth={2} />
                </span>
                <h3 style={{ fontFamily: SG, fontSize: "19px", fontWeight: 700, color: TEXT.primary, margin: 0, letterSpacing: "-0.02em" }}>{title}</h3>
                <p style={{ fontSize: "14.5px", color: TEXT.body, lineHeight: 1.55, margin: "8px 0 16px" }}>{body}</p>
                <SeeAll href={href}>{cta}</SeeAll>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 · Get the app — pitched after the value props, where intent exists */}
      <section id="get-app" className={styles.section} style={{ padding: "0 24px 48px", scrollMarginTop: "84px" }}>
        <div className={styles.inner}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "16px", padding: "22px 24px" }}>
            <div style={{ background: "#fff", borderRadius: "12px", padding: "10px", display: "inline-flex", flexShrink: 0 }}>
              <QRCodeBlock />
            </div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <h3 style={{ fontFamily: SG, fontSize: "18px", fontWeight: 700, color: TEXT.primary, margin: 0 }}>Keep it in your pocket</h3>
              <p style={{ fontSize: "14px", color: TEXT.muted, margin: "6px 0 0", lineHeight: 1.5 }}>Add Kapyn to your home screen . Your 30-second daily brief and breaking alerts, one tap away.</p>
            </div>
            <Link href="/?app=1" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: TEXT.body, border: `1px solid ${HAIRLINE}`, borderRadius: "12px", padding: "11px 18px", textDecoration: "none", flexShrink: 0 }}>
              Open the app <ArrowUpRight size={15} strokeWidth={2.3} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7 · Loadout showcase ──────────────────────────────────────────────── */}
      <section className={styles.section} style={{ padding: "0 24px 48px" }}>
        <div className={styles.inner}>
          <div className={styles.loadoutGrid} style={{ background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "20px", padding: "32px" }}>
            <div>
              <Kicker>Your toolkit</Kicker>
              <h2 style={{ fontFamily: SG, fontSize: "26px", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.025em", margin: "10px 0 0", lineHeight: 1.12 }}>Make the map your map.</h2>
              <p style={{ fontSize: "15px", color: TEXT.body, lineHeight: 1.55, margin: "10px 0 18px", maxWidth: "420px" }}>
                Save any agent, model, MCP server or skill into a named <strong style={{ color: TEXT.primary, fontWeight: 600 }}>Loadout</strong> , a RAG stack, a hackathon kit, a video pipeline. Yours, on-device, no signup.
              </p>
              <Link className="kt-cta" href="/radar/toolkit" style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: "#ffffff", background: GOLD, borderRadius: "12px", padding: "11px 18px", textDecoration: "none" }}>
                Start a Loadout <ArrowRight size={16} strokeWidth={2.4} />
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { name: "RAG stack", items: "LlamaIndex · pgvector · Cohere · Ragas" },
                { name: "Hackathon kit", items: "Cursor · Supabase · Vercel · Resend" },
                { name: "Agent build", items: "LangGraph · MCP · Claude · n8n" },
              ].map((lo) => (
                <div key={lo.name} style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: "12px", padding: "13px 15px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: GOLD }}>
                    <Bookmark size={13} strokeWidth={2.2} /> {lo.name}
                  </span>
                  <span style={{ display: "block", fontSize: "12.5px", color: TEXT.muted, marginTop: "5px" }}>{lo.items}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8 · Learn / AEO ───────────────────────────────────────────────────── */}
      <section className={styles.section} style={{ padding: "0 24px 48px" }}>
        <div className={styles.inner}>
          <SectionHead kicker="Learn" title="Straight answers, grounded in the source" sub="The terms everyone uses and few explain, calm, current, and linked to who's actually shipping them." />
          <div className={styles.learnGrid}>
            {learn.map((l) => (
              <Link key={l.slug} href={`/learn/${l.slug}`} style={cardStyle}>
                <h3 style={{ fontFamily: SG, fontSize: "15.5px", fontWeight: 600, color: TEXT.primary, margin: "0 0 8px", lineHeight: 1.3 }}>{l.q}</h3>
                <p style={{ fontSize: "13.5px", color: TEXT.muted, lineHeight: 1.5, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{l.a}</p>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: "18px" }}><SeeAll href="/explore">Explore every concept</SeeAll></div>
        </div>
      </section>

      {/* 7.5 · From the blog ───────────────────────────────────────────────── */}
      {blogPosts.length > 0 && (
        <section className={styles.section} style={{ padding: "0 24px 48px" }}>
          <div className={styles.inner}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "22px" }}>
              <div>
                <Kicker>From the blog</Kicker>
                <h2 style={{ fontFamily: SG, fontSize: "28px", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.025em", margin: "10px 0 0", lineHeight: 1.1 }}>Guides and opinions worth reading</h2>
              </div>
              <SeeAll href="/blog">All posts</SeeAll>
            </div>
            <div className={styles.blogGrid}>
              {blogPosts.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} style={{ display: "block", textDecoration: "none", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "16px", padding: "20px 22px" }}>
                  <span style={{ display: "inline-block", fontFamily: SG, fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: GOLD, background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: "100px", padding: "3px 10px" }}>{p.tag}</span>
                  <h3 style={{ fontFamily: SG, fontSize: "17px", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.02em", lineHeight: 1.2, margin: "10px 0 0" }}>{p.title}</h3>
                  <p style={{ fontSize: "13.5px", color: TEXT.muted, lineHeight: 1.5, margin: "7px 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.deck}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px" }}>
                    <span style={{ fontSize: "12px", color: TEXT.muted }}>{p.readingMin} min read</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: SG, fontSize: "13px", fontWeight: 600, color: GOLD }}>
                      Read <ArrowRight size={13} strokeWidth={2.4} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9 · Categories ────────────────────────────────────────────────────── */}
      <section className={styles.section} style={{ padding: "0 24px 48px" }}>
        <div className={styles.inner}>
          <SectionHead kicker="By topic" title="Or follow what you care about" />
          <div className={styles.catRow}>
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/categories/${c.slug}`} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "8px", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "100px", padding: "8px 15px", textDecoration: "none" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: c.colorAccent, flexShrink: 0 }} />
                <span style={{ fontFamily: SG, fontSize: "13.5px", fontWeight: 500, color: TEXT.body, whiteSpace: "nowrap" }}>{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 10 · Trust band ───────────────────────────────────────────────────── */}
      <section className={styles.section} style={{ padding: "24px 24px 48px" }}>
        <div className={styles.inner}>
          <div style={{ textAlign: "center", borderTop: `1px solid ${HAIRLINE}`, borderBottom: `1px solid ${HAIRLINE}`, padding: "40px 24px" }}>
            <h2 style={{ fontFamily: SG, fontSize: "24px", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.025em", margin: 0 }}>Calm, source-grounded, free forever.</h2>
            <p style={{ fontSize: "15px", color: TEXT.muted, margin: "10px auto 0", maxWidth: "480px", lineHeight: 1.5 }}>
              No hype. No paywall. No signup wall. Every claim links to its source , so you can trust the map and move on with your day.
            </p>
          </div>
        </div>
      </section>

      {/* 11 · Footer ───────────────────────────────────────────────────────── */}
      <footer className={styles.section} style={{ padding: "40px 24px 64px", borderTop: `1px solid ${HAIRLINE}` }}>
        <div className={styles.inner}>
          <div className={styles.footerGrid}>
            <div>
              <span style={{ fontFamily: SG, fontSize: "20px", fontWeight: 800, letterSpacing: "-0.04em", color: TEXT.primary }}>kapyn</span>
              <p style={{ fontSize: "13.5px", color: TEXT.muted, margin: "10px 0 0", lineHeight: 1.5, maxWidth: "260px" }}>The calm map of the AI worth using. No paywall, ever.</p>
            </div>
            {[
              { h: "Discover", links: [["Radar", "/radar"], ["Tools & Agents", "/radar/browse"], ["MCP servers", "/radar/mcp"], ["Hackathons", "/radar/hackathons"]] },
              { h: "Stay current", links: [["Today's feed", "/?app=1"], ["Trending", "/trending"], ["Categories", "/categories"], ["RSS", "/feed.xml"]] },
              { h: "Learn", links: [["Blog", "/blog"], ["Explore concepts", "/explore"], ["For LLMs", "/llms.txt"], ["Open data", "/okf"]] },
            ].map((col) => (
              <div key={col.h}>
                <span style={{ fontFamily: SG, fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: TEXT.muted }}>{col.h}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "12px" }}>
                  {col.links.map(([label, href]) => (
                    <Link key={label} href={href} style={{ fontSize: "13.5px", color: TEXT.body, textDecoration: "none" }}>{label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(navJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(catalogJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }} />
    </div>
  );
}
