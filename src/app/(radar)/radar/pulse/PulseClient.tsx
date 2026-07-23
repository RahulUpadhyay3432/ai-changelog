"use client";

import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import type { RadarTool, RadarItem, DiscoveredMcp } from "@/lib/knowledge";
import { entityHref, type EntityType } from "@/lib/entities";
import type { TrendingStory } from "@/lib/trending";
import {
  FaceMark, MetricChip, CoverImage, accentFor, accentForFace,
  GOLD, GOLD_SOFT, SG, TEXT, CANVAS, SURFACE, HAIRLINE, INNER_HIGHLIGHT,
  type RadarThing,
} from "../radar-shared";
import { toolThing, logoFor, brandLogoFor } from "../radar-map";
import { EmailCapture } from "@/components/EmailCapture";
import { ThemeToggle } from "@/components/ThemeToggle";
import styles from "./pulse.module.css";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function isLearnType(t: EntityType): boolean {
  return t === "technique" || t === "concept";
}

// ── Section kicker (typographic, no raw-emoji heading) ──
function Kicker({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "9px", margin: "0 0 14px" }}>
      <h2 style={{ fontFamily: SG, fontSize: "13px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: TEXT.muted, margin: 0 }}>
        {children}
      </h2>
      {count != null && (
        <span style={{ fontFamily: SG, fontSize: "13px", fontWeight: 700, color: GOLD, fontVariantNumeric: "tabular-nums" }}>{count}</span>
      )}
    </div>
  );
}

// ── #1 hero — compact split card: content left, slim media panel right.
//    Never a full-width cover band (an unresolved og-image made that a giant
//    empty slab). The media panel is a fixed ~150px accent, desktop-only.
function HeroCard({ thing }: { thing: RadarThing }) {
  // toolThing doesn't set categorySlug — fall back to the face-based accent so
  // the ring is a real hex (the `${ring}1f` alpha suffix needs hex, not var()).
  const accent = thing.categorySlug ? accentFor(thing.categorySlug) : accentForFace(thing.face);
  const cover = thing.imageUrl && thing.imageUrl.startsWith("http") ? thing.imageUrl : undefined;
  return (
    <a
      href={thing.url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={`radar-hero ${styles.heroSplit}`}
      style={{
        textDecoration: "none", color: "inherit", overflow: "hidden", borderRadius: "18px",
        background: `linear-gradient(135deg, ${accent.ring}1f 0%, ${SURFACE} 60%)`,
        border: `1px solid ${HAIRLINE}`, boxShadow: INNER_HIGHLIGHT, marginBottom: "28px",
      }}
    >
      <div style={{ padding: "18px 20px", minWidth: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
        <span
          style={{
            alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "5px",
            fontFamily: SG, fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase",
            color: "#fff", background: GOLD, borderRadius: "100px", padding: "4px 10px",
          }}
        >
          <Flame size={12} strokeWidth={2.4} /> #1 this week
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <FaceMark logoUrl={thing.logoUrl} label={thing.name} size={40} />
          <span style={{ fontFamily: SG, fontSize: "22px", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.02em", lineHeight: 1.1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {thing.name}
          </span>
        </div>
        <p style={{ fontSize: "14.5px", color: TEXT.body, lineHeight: 1.5, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {thing.valueLine}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginTop: "auto" }}>
          {thing.metric ? <MetricChip>{thing.metric}</MetricChip> : <span />}
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: GOLD }}>
            Take a look <ArrowRight size={15} strokeWidth={2.3} />
          </span>
        </div>
      </div>
      <div className={styles.heroMedia}>
        <CoverImage src={cover} category={thing.categorySlug} face={thing.face} height={150} radius={14} />
      </div>
    </a>
  );
}

// ── Trending tool card (#2…) — grid item ──
function ToolCard({ rank, thing }: { rank: number; thing: RadarThing }) {
  return (
    <a href={thing.url ?? "#"} target="_blank" rel="noopener noreferrer" className="radar-railcard" style={{ display: "flex", flexDirection: "column", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "16px", padding: "14px", textDecoration: "none", color: "inherit", boxShadow: INNER_HIGHLIGHT }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <FaceMark logoUrl={thing.logoUrl} label={thing.name} size={30} />
        <span style={{ fontFamily: SG, fontSize: "12px", fontWeight: 700, color: GOLD, fontVariantNumeric: "tabular-nums" }}>{String(rank).padStart(2, "0")}</span>
      </div>
      <span style={{ fontFamily: SG, fontSize: "14.5px", fontWeight: 600, color: TEXT.primary, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{thing.name}</span>
      <span style={{ fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.45, margin: "5px 0 12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{thing.valueLine}</span>
      {thing.metric && <div style={{ marginTop: "auto" }}><MetricChip>{thing.metric}</MetricChip></div>}
    </a>
  );
}

// ── MCP card ──
function McpCard({ m }: { m: DiscoveredMcp }) {
  const stars = m.score >= 1000 ? `${(m.score / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(m.score);
  return (
    <a href={m.url} target="_blank" rel="noopener noreferrer" className="radar-railcard" style={{ display: "flex", flexDirection: "column", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "16px", padding: "14px", textDecoration: "none", color: "inherit", boxShadow: INNER_HIGHLIGHT }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <FaceMark logoUrl={logoFor(m.url)} label={m.name} size={30} />
        <span style={{ fontFamily: SG, fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: GOLD, background: GOLD_SOFT, borderRadius: "100px", padding: "2px 8px" }}>New</span>
      </div>
      <span style={{ fontFamily: SG, fontSize: "14.5px", fontWeight: 600, color: TEXT.primary, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
      <span style={{ fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.45, margin: "5px 0 12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.tagline}</span>
      <div style={{ marginTop: "auto" }}><MetricChip>{stars} stars</MetricChip></div>
    </a>
  );
}

// ── Conversation card (news entity) ──
function EntCard({ e }: { e: RadarItem }) {
  const name = e.entity.canonicalName;
  const desc = e.valueLine ?? e.entity.shortDesc ?? "";
  const href = e.latestStory ? `/story/${e.latestStory.id}` : isLearnType(e.entity.entityType) ? entityHref(e.entity) : null;
  if (!href || !desc) return null;
  return (
    <Link href={href} className="radar-railcard" style={{ display: "flex", flexDirection: "column", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "16px", padding: "14px", textDecoration: "none", color: "inherit", boxShadow: INNER_HIGHLIGHT }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <FaceMark logoUrl={brandLogoFor(name)} label={name} size={30} />
        {e.isNew && <span style={{ fontFamily: SG, fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: GOLD, background: GOLD_SOFT, borderRadius: "100px", padding: "2px 8px" }}>New</span>}
      </div>
      <span style={{ fontFamily: SG, fontSize: "14.5px", fontWeight: 600, color: TEXT.primary, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
      <span style={{ fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.45, marginTop: "5px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{desc}</span>
    </Link>
  );
}

export function PulseClient({
  tools, mcp, entities, stories, stats, weekOf,
}: {
  tools: RadarTool[];
  mcp: DiscoveredMcp[];
  entities: RadarItem[];
  stories: TrendingStory[];
  stats: { n: number; label: string }[];
  weekOf: string;
}) {
  const things = tools.map(toolThing);
  const hero = things[0];
  const rest = things.slice(1, 9);

  return (
    // The (radar) layout shell is overflow:hidden — this page must own its own
    // scrolling (same contract as RadarClient's root).
    <div className="scrollbar-none" style={{ position: "relative", height: "100%", overflowY: "auto", overflowX: "hidden", background: CANVAS }}>
      <div aria-hidden style={{ position: "fixed", inset: 0, backgroundImage: GRAIN, opacity: 0.035, mixBlendMode: "overlay", pointerEvents: "none", zIndex: 1 }} />
      <div className={styles.wrap} style={{ position: "relative", zIndex: 2 }}>
        {/* Header — kicker left, theme toggle top-right */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ fontFamily: SG, fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: GOLD }}>
            Pulse · {weekOf} · refreshed daily
          </div>
          <ThemeToggle />
        </div>
        <h1 style={{ fontFamily: SG, fontSize: "clamp(30px, 5vw, 40px)", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.035em", lineHeight: 1.04, margin: "10px 0 0" }}>
          This week in AI
        </h1>
        <p style={{ fontSize: "15px", color: TEXT.body, lineHeight: 1.55, margin: "12px 0 0", maxWidth: "560px" }}>
          The tools, servers, and stories gaining momentum right now — ranked by movement, not popularity.
        </p>

        {/* Stat tiles */}
        {stats.length > 0 && (
          <div className={styles.statStrip}>
            {stats.map((s) => (
              <span key={s.label} style={{ display: "inline-flex", alignItems: "baseline", gap: "7px" }}>
                <span style={{ fontFamily: SG, fontSize: "22px", fontWeight: 700, color: TEXT.primary, fontVariantNumeric: "tabular-nums" }}>{s.n}</span>
                <span style={{ fontSize: "13px", color: TEXT.muted }}>{s.label}</span>
              </span>
            ))}
          </div>
        )}

        {/* The stories that mattered this week — the weekly recap, surfaced on a
            reachable page (was only findable at the end of the mobile feed). */}
        {stories.length > 0 && (
          <section style={{ marginBottom: "34px" }}>
            <Kicker count={stories.length}>The stories that mattered</Kicker>
            <div style={{ borderTop: `1px solid ${HAIRLINE}` }}>
              {stories.map((s, i) => (
                <Link key={s.id} href={`/story/${s.id}`} className="radar-row" style={{ display: "flex", alignItems: "flex-start", gap: "13px", width: "100%", textDecoration: "none", color: "inherit", borderBottom: `1px solid ${HAIRLINE}`, padding: "13px 6px" }}>
                  <span style={{ flexShrink: 0, width: "24px", fontFamily: SG, fontSize: "15px", fontWeight: 700, color: GOLD, fontVariantNumeric: "tabular-nums", textAlign: "center", paddingTop: "1px" }}>{String(i + 1).padStart(2, "0")}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "-webkit-box", fontFamily: SG, fontSize: "15px", fontWeight: 600, color: TEXT.primary, letterSpacing: "-0.01em", lineHeight: 1.3, WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.title}</span>
                    <span style={{ display: "block", fontSize: "12px", color: TEXT.muted, marginTop: "3px" }}>{s.sourceName}</span>
                  </div>
                </Link>
              ))}
            </div>
            <p style={{ fontSize: "12.5px", color: TEXT.muted, margin: "12px 0 0" }}>That&apos;s the week. You&apos;re caught up.</p>
          </section>
        )}

        {/* #1 hero */}
        {hero && <HeroCard thing={hero} />}

        {/* Trending tools — grid of cards */}
        {rest.length > 0 && (
          <section style={{ marginBottom: "34px" }}>
            <Kicker>Trending tools</Kicker>
            <div className={styles.grid}>{rest.map((t, i) => <ToolCard key={t.id} rank={i + 2} thing={t} />)}</div>
          </section>
        )}

        {/* New MCP servers */}
        {mcp.length > 0 && (
          <section style={{ marginBottom: "34px" }}>
            <Kicker count={mcp.length}>New MCP servers</Kicker>
            <div className={styles.grid}>{mcp.map((m) => <McpCard key={m.url} m={m} />)}</div>
          </section>
        )}

        {/* In the conversation */}
        {entities.length > 0 && (
          <section style={{ marginBottom: "34px" }}>
            <Kicker>In the conversation</Kicker>
            <div className={styles.grid}>{entities.map((e) => <EntCard key={e.entity.id} e={e} />)}</div>
          </section>
        )}

        {/* Weekly digest */}
        <section style={{ padding: "26px 24px", borderRadius: "18px", background: SURFACE, border: `1px solid ${HAIRLINE}`, boxShadow: INNER_HIGHLIGHT }}>
          <h2 style={{ fontFamily: SG, fontSize: "19px", fontWeight: 700, color: TEXT.primary, letterSpacing: "-0.02em", margin: 0 }}>Get this weekly, in your inbox</h2>
          <p style={{ fontSize: "14px", color: TEXT.muted, lineHeight: 1.55, margin: "8px 0 16px", maxWidth: "520px" }}>
            One calm email every Monday — the movement that mattered. No hype, no noise.
          </p>
          <EmailCapture source="pulse" />
        </section>

        <p style={{ marginTop: "28px", fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.6 }}>
          Refreshed daily from GitHub, Product Hunt, the official MCP registry, and Kapyn&apos;s news stream. Ranked by momentum — new and fast-rising, not just popular.
        </p>
      </div>
    </div>
  );
}
