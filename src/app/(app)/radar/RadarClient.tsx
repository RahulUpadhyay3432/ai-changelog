"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Cpu, Compass, Bell, Check, ArrowRight, ArrowUpRight, Plug, type LucideIcon } from "lucide-react";
import posthog from "posthog-js";
import { getRadarLens, setRadarLens, type RadarLens } from "@/lib/storage";
import type { RadarTool, RadarItem } from "@/lib/knowledge";
import { radarVariants, lensIndicatorSpring } from "@/lib/radar-motion";
import { FaceMark, MetricChip, GOLD, GOLD_SOFT, GOLD_BORDER, SG, TEXT, CANVAS, SURFACE, HAIRLINE, type RadarThing } from "./radar-shared";
import { toolThing, essThing, canonThing, entThing, categorizeTool, WHATS_NEW_CATEGORY_ORDER } from "./radar-map";
import { RadarDetailSheet } from "./RadarDetailSheet";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

interface RadarData {
  tools: RadarTool[];
  entities: RadarItem[];
  essentials: RadarTool[];
}

// ─── Lenses (Builder + Exploring) ─────────────────────────────────────────────
const HEADLINE: { id: RadarLens; label: string; tagline: string; Icon: LucideIcon }[] = [
  { id: "builder", label: "Builder", tagline: "I build with AI — code, agents, UI, infra", Icon: Cpu },
  { id: "curious", label: "Just exploring", tagline: "Keep me current across AI, broadly", Icon: Compass },
];
const PILLS: { id: RadarLens; label: string; Icon: LucideIcon }[] = [
  { id: "builder", label: "Builder", Icon: Cpu },
  { id: "curious", label: "Exploring", Icon: Compass },
];

// ─── Shared bits ─────────────────────────────────────────────────────────────
// Eyebrow: gold — for hero overlay context (image backdrop).
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily: SG, fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em", color: GOLD }}>{children}</span>;
}
// SectionKicker: muted — for section headers above rows/rails.
function SectionKicker({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily: SG, fontSize: "12px", fontWeight: 700, lineHeight: 1, letterSpacing: "0.06em", textTransform: "uppercase", color: TEXT.muted }}>{children}</span>;
}

// ─── What's new (filter pills over one ranked feed) ──────────────────────────
// The builder's first question: what shipped across GitHub & Product Hunt.
// Two pill rows (source + category) filter one ranked list in place.
const WN_SOURCES: { id: "all" | "github" | "producthunt"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "github", label: "GitHub" },
  { id: "producthunt", label: "Product Hunt" },
];

// Real source brand marks — the user asked to see where each item came from.
// (lucide dropped brand glyphs, so the GitHub mark is inlined.)
function GitHubMark({ size = 15, color = TEXT.muted }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden style={{ flexShrink: 0 }}>
      <path d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.335-1.725-1.335-1.725-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.54-1.497.105-3.121 0 0 1.005-.316 3.3 1.209.96-.262 1.98-.392 3-.398 1.02.006 2.04.136 3 .398 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.24 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .315.21.689.825.572C20.565 21.917 24 17.495 24 12.292 24 5.78 18.63.5 12 .5z" />
    </svg>
  );
}
function PHMark({ size = 15 }: { size?: number }) {
  return <span style={{ flexShrink: 0, width: size, height: size, borderRadius: "50%", background: "#DA552F", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * 0.62), fontWeight: 700, fontFamily: SG }}>P</span>;
}
function SourceMark({ face, size = 15, color = TEXT.muted }: { face: string; size?: number; color?: string }) {
  if (face === "github") return <GitHubMark size={size} color={color} />;
  if (face === "producthunt") return <PHMark size={size} />;
  return null;
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0, fontFamily: SG, fontSize: "13px", fontWeight: active ? 700 : 500,
        color: active ? "#0a0a0a" : "#a3a3a3",
        background: active ? GOLD : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? GOLD : "rgba(255,255,255,0.08)"}`,
        borderRadius: "100px", padding: "6px 13px", cursor: "pointer", whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function WhatsNewRow({ thing, rank, onOpen }: { thing: RadarThing; rank: number; onOpen: (t: RadarThing) => void }) {
  return (
    <motion.button onClick={() => onOpen(thing)} whileTap={{ scale: 0.985 }} transition={{ type: "spring", stiffness: 440, damping: 28 }} className="radar-row" style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", textAlign: "left", padding: "11px 24px", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", color: "inherit" }}>
      <span style={{ flexShrink: 0, width: "16px", fontFamily: SG, fontSize: "13px", fontWeight: 600, color: TEXT.muted, fontVariantNumeric: "tabular-nums", textAlign: "center" }}>{rank}</span>
      <FaceMark face={thing.face} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: "15px", fontWeight: 600, color: TEXT.primary, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{thing.name}</span>
        <span style={{ display: "block", fontSize: "13px", color: TEXT.muted, lineHeight: 1.35, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{thing.valueLine}</span>
      </div>
      <span style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
        {thing.metric && <MetricChip>{thing.metric}</MetricChip>}
        <SourceMark face={thing.face} />
      </span>
    </motion.button>
  );
}

function WhatsNew({ tools, onOpen }: { tools: RadarTool[]; onOpen: (t: RadarThing) => void }) {
  const [source, setSource] = useState<"all" | "github" | "producthunt">("all");
  const [cat, setCat] = useState<string>("All");

  const tagged = useMemo(() => tools.map((t) => ({ tool: t, cat: categorizeTool(t.topics, t.source) })), [tools]);
  const cats = useMemo(() => {
    const present = new Set(tagged.map((w) => w.cat));
    const ordered = WHATS_NEW_CATEGORY_ORDER.filter((c) => present.has(c));
    const extra = [...present].filter((c) => !WHATS_NEW_CATEGORY_ORDER.includes(c)).sort();
    return ["All", ...ordered, ...extra];
  }, [tagged]);

  const visible = useMemo(
    () =>
      tagged
        .filter((w) => source === "all" || w.tool.source === source)
        .filter((w) => cat === "All" || w.cat === cat)
        .map((w) => w.tool),
    [tagged, source, cat],
  );

  if (tools.length === 0) return null;

  return (
    <section style={{ marginBottom: "30px" }}>
      <div style={{ padding: "0 24px", marginBottom: "12px" }}>
        <h2 style={{ fontFamily: SG, fontSize: "20px", fontWeight: 700, color: TEXT.primary, margin: 0, letterSpacing: "-0.02em" }}>What&apos;s new</h2>
        <p style={{ fontSize: "12.5px", color: TEXT.muted, margin: "3px 0 0" }}>Fresh from GitHub, Product Hunt &amp; the MCP market</p>
      </div>

      {/* MCP market — its own categorized, star-ranked destination */}
      <Link href="/radar/mcp" onClick={() => posthog.capture("radar_mcp_card_tapped")} style={{ display: "flex", alignItems: "center", gap: "12px", margin: "0 24px 14px", padding: "13px 14px", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "14px", textDecoration: "none", color: "inherit" }}>
        <span style={{ flexShrink: 0, width: "38px", height: "38px", borderRadius: "10px", background: GOLD_SOFT, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Plug size={18} color={GOLD} strokeWidth={2} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: SG, fontSize: "15px", fontWeight: 700, color: TEXT.primary }}>MCP market</span>
          <span style={{ display: "block", fontSize: "12.5px", color: TEXT.muted, marginTop: "1px" }}>Connect your AI to your tools — top servers by category</span>
        </span>
        <ArrowUpRight size={17} color={TEXT.muted} strokeWidth={2} />
      </Link>

      <div className="scrollbar-none" style={{ display: "flex", gap: "8px", padding: "0 24px 10px", overflowX: "auto" }}>
        {WN_SOURCES.map((s) => {
          const active = source === s.id;
          return (
            <Pill key={s.id} active={active} onClick={() => { setSource(s.id); posthog.capture("radar_whatsnew_source", { source: s.id }); }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                {s.id !== "all" && <SourceMark face={s.id} size={13} color={active ? "#0a0a0a" : TEXT.body} />}
                {s.label}
              </span>
            </Pill>
          );
        })}
      </div>

      <div className="scrollbar-none" style={{ display: "flex", gap: "8px", padding: "0 24px 14px", overflowX: "auto" }}>
        {cats.map((c) => (
          <Pill key={c} active={cat === c} onClick={() => { setCat(c); posthog.capture("radar_whatsnew_category", { category: c }); }}>{c}</Pill>
        ))}
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {visible.length === 0 ? (
          <p style={{ padding: "16px 24px", color: "#5c5c5c", fontSize: "13.5px" }}>Nothing new in this filter yet.</p>
        ) : (
          visible.slice(0, 20).map((tool, i) => <WhatsNewRow key={tool.url} thing={toolThing(tool)} rank={i + 1} onOpen={onOpen} />)
        )}
      </div>
    </section>
  );
}

// ─── Hero deck (swipeable; ends on "Caught up") ──────────────────────────────
type HeroCard =
  | { kind: "thing"; eyebrow: string; thing: RadarThing; imageUrl: string | null }
  | { kind: "closer"; count: number };

const CARD_W = "84%";

function HeroCardThing({ card, onOpen }: { card: Extract<HeroCard, { kind: "thing" }>; onOpen: (t: RadarThing) => void }) {
  const t = card.thing;
  // When an entity has a real news story, lead with the story (the move), not the entity name.
  const isStoryLed = t.kind === "entity" && !!t.storyTitle;
  const headline = isStoryLed ? t.storyTitle! : t.name;

  return (
    <button onClick={() => onOpen(t)} className="radar-hero" style={{ flex: `0 0 ${CARD_W}`, scrollSnapAlign: "start", display: "block", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
      <div style={{ padding: "6px", borderRadius: "28px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ position: "relative", height: "196px", borderRadius: "22px", overflow: "hidden", background: "#101010", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.12)" }}>
          {card.imageUrl ? (
            <img src={card.imageUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.85)" }} />
          ) : (
            <>
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(125% 95% at 72% -10%, ${GOLD}30 0%, #0a0a0a 58%)` }} />
              <span style={{ position: "absolute", top: "16px", left: "18px" }}><FaceMark face={t.face} size={40} /></span>
            </>
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,8,0.96) 18%, rgba(8,8,8,0.35) 55%, rgba(8,8,8,0.1) 100%)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "16px 18px" }}>
            <Eyebrow>{card.eyebrow}</Eyebrow>
            {isStoryLed && (
              <span style={{ display: "inline-block", marginTop: "5px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>{t.name}</span>
            )}
            <h2 style={{ fontFamily: SG, fontSize: "21px", fontWeight: 600, lineHeight: 1.15, letterSpacing: "-0.02em", color: "#f5f3ef", margin: isStoryLed ? "3px 0 4px" : "5px 0 4px", textWrap: "balance" }}>{headline}</h2>
            <p style={{ fontSize: "13.5px", color: "#c9c5bf", lineHeight: 1.4, margin: 0, maxWidth: "94%", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.valueLine}</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "11px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {t.metric && <MetricChip>{t.metric}</MetricChip>}
                {t.recency && <span style={{ fontSize: "12px", color: "#a7a39d" }}>{t.recency}</span>}
              </div>
              <span style={{ width: "32px", height: "32px", borderRadius: "100px", background: "rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ArrowUpRight size={16} color="#f5f3ef" strokeWidth={2} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function HeroCardCloser() {
  return (
    <div style={{ flex: `0 0 ${CARD_W}`, scrollSnapAlign: "start" }}>
      <div style={{ padding: "6px", borderRadius: "28px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ position: "relative", height: "196px", borderRadius: "22px", overflow: "hidden", background: `radial-gradient(120% 100% at 50% 0%, ${GOLD}1f 0%, #0d0d0d 60%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 26px", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.10)" }}>
          <span style={{ width: "44px", height: "44px", borderRadius: "100px", background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
            <Check size={22} color={GOLD} strokeWidth={2.4} />
          </span>
          <h2 style={{ fontFamily: SG, fontSize: "20px", fontWeight: 600, color: "#f5f3ef", margin: 0, letterSpacing: "-0.02em" }}>You&apos;re caught up</h2>
          <p style={{ fontSize: "13.5px", color: "#a7a39d", lineHeight: 1.45, margin: "7px 0 14px", maxWidth: "260px" }}>That&apos;s what moved in your world today. Nothing else worth your time.</p>
          <Link href="/radar/toolkit" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: SG, fontSize: "13.5px", fontWeight: 600, color: "#0a0a0a", background: GOLD, borderRadius: "100px", padding: "9px 16px", textDecoration: "none" }}>
            Open your Toolkit <ArrowUpRight size={15} strokeWidth={2.3} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Dots({ count, active }: { count: number; active: number }) {
  return (
    <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "14px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ width: i === active ? "18px" : "6px", height: "6px", borderRadius: "100px", background: i === active ? GOLD : "rgba(255,255,255,0.16)", transition: "width 0.25s ease, background 0.25s ease" }} />
      ))}
    </div>
  );
}

function HeroDeck({ cards, onOpen }: { cards: HeroCard[]; onOpen: (t: RadarThing) => void }) {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const onScroll = () => {
    const el = ref.current;
    if (!el || !el.firstElementChild) return;
    const step = (el.firstElementChild as HTMLElement).offsetWidth + 12;
    setActive(Math.round(el.scrollLeft / step));
  };
  return (
    <div style={{ margin: "0 0 26px" }}>
      <div ref={ref} onScroll={onScroll} className="scrollbar-none" style={{ display: "flex", gap: "12px", overflowX: "auto", scrollSnapType: "x mandatory", padding: "0 20px", scrollPaddingLeft: "20px" }}>
        {cards.map((c, i) => (c.kind === "thing" ? <HeroCardThing key={i} card={c} onOpen={onOpen} /> : <HeroCardCloser key={i} />))}
      </div>
      {cards.length > 1 && <Dots count={cards.length} active={Math.min(active, cards.length - 1)} />}
    </div>
  );
}

// ─── Row + RailCard (buttons → open the sheet) ───────────────────────────────
function Row({ thing, onOpen }: { thing: RadarThing; onOpen: (t: RadarThing) => void }) {
  return (
    <motion.button onClick={() => onOpen(thing)} whileTap={{ scale: 0.975 }} transition={{ type: "spring", stiffness: 440, damping: 28 }} className="radar-row" style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", textAlign: "left", padding: "13px 24px", background: "transparent", border: "none", borderBottom: `1px solid ${HAIRLINE}`, cursor: "pointer", color: "inherit" }}>
      <FaceMark face={thing.face} category={thing.categorySlug} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: "15px", fontWeight: 600, color: TEXT.primary, letterSpacing: "-0.01em" }}>{thing.name}</span>
        <p style={{ fontSize: "14px", fontWeight: 450, color: TEXT.body, lineHeight: 1.4, margin: "2px 0 0" }}>{thing.valueLine}</p>
      </div>
      {thing.metric && <MetricChip>{thing.metric}</MetricChip>}
    </motion.button>
  );
}

function RailCard({ thing, wide, onOpen }: { thing: RadarThing; wide: boolean; onOpen: (t: RadarThing) => void }) {
  return (
    <motion.button onClick={() => onOpen(thing)} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 440, damping: 28 }} className="radar-railcard" style={{ flexShrink: 0, scrollSnapAlign: "start", width: wide ? "262px" : "210px", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "16px", padding: "14px", textAlign: "left", cursor: "pointer", color: "inherit" }}>
      <FaceMark face={thing.face} category={thing.categorySlug} />
      <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: TEXT.primary, margin: "10px 0 3px", letterSpacing: "-0.01em" }}>{thing.name}</span>
      <p style={{ fontSize: "13px", color: TEXT.body, lineHeight: 1.4, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{thing.valueLine}</p>
      {thing.metric && <span style={{ display: "block", marginTop: "10px" }}><MetricChip>{thing.metric}</MetricChip></span>}
    </motion.button>
  );
}

interface SectionData { key: string; emoji?: string; eyebrow: string; sub: string; variant: "list" | "rail"; things: RadarThing[] }

function Section({ emoji, eyebrow, sub, variant, things, onOpen }: SectionData & { onOpen: (t: RadarThing) => void }) {
  if (things.length === 0) return null;
  return (
    <section style={{ marginBottom: "30px" }}>
      <div style={{ padding: "0 24px", marginBottom: "12px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
          {emoji && <span style={{ fontSize: "14px" }}>{emoji}</span>}
          <SectionKicker>{eyebrow}</SectionKicker>
        </span>
        <p style={{ fontSize: "12.5px", color: TEXT.muted, margin: "3px 0 0" }}>{sub}</p>
      </div>
      {variant === "rail" ? (
        <div className="scrollbar-none radar-rail" style={{ display: "flex", gap: "12px", padding: "0 24px", overflowX: "auto", scrollSnapType: "x proximity" }}>
          {things.map((t, i) => <RailCard key={t.id} thing={t} wide={i === 0} onOpen={onOpen} />)}
        </div>
      ) : (
        <div style={{ borderTop: `1px solid ${HAIRLINE}` }}>
          {things.map((t) => <Row key={t.id} thing={t} onOpen={onOpen} />)}
        </div>
      )}
    </section>
  );
}

// ─── Hero cards + section arrangement per lens ───────────────────────────────
function buildHeroCards(lens: RadarLens, data: RadarData): HeroCard[] {
  const cards: HeroCard[] = [];
  const used = new Set<string>();
  const byTraction = [...data.entities].sort((a, b) => b.entity.mentionCount - a.entity.mentionCount);
  const modelsTools = byTraction.filter((e) => e.entity.entityType === "model" || e.entity.entityType === "tool");

  // 1. The big move — top-traction (prefer one with an image)
  const bigPool = lens === "builder" ? [...modelsTools, ...byTraction] : byTraction;
  const big = bigPool.find((e) => e.latestStory?.imageUrl) ?? bigPool[0];
  if (big) {
    const t = entThing(big);
    used.add(t.id);
    cards.push({ kind: "thing", eyebrow: lens === "curious" ? "What's moving" : "The big move", thing: t, imageUrl: big.latestStory?.imageUrl ?? null });
  }

  // 2. New & worth a look — freshest launch
  const newTool = data.tools[0];
  if (newTool) {
    const t = toolThing(newTool);
    if (!used.has(t.id)) { used.add(t.id); cards.push({ kind: "thing", eyebrow: "New & worth a look", thing: t, imageUrl: null }); }
  }

  // 3. For you — a lens-relevant pick
  let pick: { thing: RadarThing; img: string | null; eyebrow: string } | null = null;
  if (lens === "builder") {
    const cur = data.essentials.find((e) => e.source === "curated" && (e.meta === "AI coding" || e.meta === "Agents & automation"));
    if (cur) pick = { thing: essThing(cur), img: null, eyebrow: "For your stack" };
  } else {
    const cur = data.essentials.find((e) => e.source === "curated" && e.meta === "Models & chat");
    if (cur) pick = { thing: essThing(cur), img: null, eyebrow: "Start here" };
  }
  if (pick && !used.has(pick.thing.id)) {
    used.add(pick.thing.id);
    cards.push({ kind: "thing", eyebrow: pick.eyebrow, thing: pick.thing, imageUrl: pick.img });
  }

  // 4. Caught up — the closer (always last)
  cards.push({ kind: "closer", count: cards.length });
  return cards;
}

function buildSections(lens: RadarLens, data: RadarData, heroIds: Set<string>): SectionData[] {
  const curated = data.essentials.filter((e) => e.source === "curated");
  const canon = data.essentials.filter((e) => e.source === "github");
  const byCat = (cat: string) => curated.filter((e) => e.meta === cat);
  const byTraction = [...data.entities].sort((a, b) => b.entity.mentionCount - a.entity.mentionCount);
  const modelsTools = byTraction.filter((e) => e.entity.entityType === "model" || e.entity.entityType === "tool");

  let raw: SectionData[];
  if (lens === "builder") {
    // Everything a builder reaches for, in the order they reach for it:
    // write code → ship the UI → wire agents → pick models → store data →
    // ship it safely → see what's new / moving / canonical.
    raw = [
      { key: "coding", emoji: "⌨️", eyebrow: "Build with AI", sub: "AI coding tools & agentic editors", variant: "rail", things: byCat("AI coding").map(essThing) },
      { key: "ui", emoji: "🎨", eyebrow: "Ship the interface", sub: "UI, design & front-end generation", variant: "rail", things: byCat("UI & design").map(essThing) },
      { key: "agents", emoji: "🤖", eyebrow: "Agents & orchestration", sub: "Wire AI into workflows that run themselves", variant: "rail", things: [...byCat("Agents & automation"), ...byCat("Orchestration")].map(essThing) },
      { key: "models", emoji: "🧠", eyebrow: "Models & inference", sub: "Where to run the models you build on", variant: "rail", things: [...byCat("Models & chat"), ...byCat("Inference")].map(essThing) },
      { key: "data", emoji: "🗄️", eyebrow: "Data & RAG", sub: "Give your app memory and retrieval", variant: "rail", things: byCat("Data & RAG").map(essThing) },
      { key: "safe", emoji: "🔒", eyebrow: "Ship it safely", sub: "Security, evals & observability", variant: "rail", things: [...byCat("Security"), ...byCat("Eval & observability")].map(essThing) },
      { key: "media", emoji: "🎬", eyebrow: "Generate media", sub: "Voice, image, and video models", variant: "rail", things: byCat("Media").map(essThing) },
      { key: "moving", emoji: "📈", eyebrow: "Models & tools moving", sub: "Gaining traction in AI now", variant: "list", things: modelsTools.slice(0, 10).map(entThing) },
      { key: "oss", emoji: "📦", eyebrow: "Popular open source", sub: "Most-starred, still maintained", variant: "list", things: canon.slice(0, 8).map(canonThing) },
    ];
  } else {
    raw = [
      { key: "start", emoji: "🚀", eyebrow: "Start here", sub: "The AI tools everyone's using", variant: "rail", things: byCat("Models & chat").map(essThing) },
      { key: "big", emoji: "🔥", eyebrow: "What's big right now", sub: "Most talked-about in AI", variant: "list", things: byTraction.slice(0, 6).map(entThing) },
      { key: "toolkit", emoji: "🧰", eyebrow: "Build your toolkit", sub: "When you're ready to go deeper", variant: "rail", things: [...byCat("AI coding"), ...byCat("Inference")].map(essThing) },
      { key: "notable", emoji: "✨", eyebrow: "New & notable", sub: "Fresh launches", variant: "rail", things: data.tools.slice(0, 6).map(toolThing) },
    ];
  }
  // De-dup: nothing in the hero deck repeats in the lists below.
  return raw.map((s) => ({ ...s, things: s.things.filter((t) => !heroIds.has(t.id)) }));
}

// ─── Category quick-nav — the "where are the categories" answer ──────────────
// A flat-wrapped chip map of every populated section; tapping scrolls to it.
function CategoryNav({ sections }: { sections: SectionData[] }) {
  const items = sections.filter((s) => s.things.length > 0);
  if (items.length === 0) return null;
  const jump = (key: string) => {
    document.getElementById(`sec-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    posthog.capture("radar_category_jump", { key });
  };
  return (
    <div style={{ padding: "0 24px 22px" }}>
      <span style={{ fontFamily: SG, fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: TEXT.muted }}>Browse by</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "11px" }}>
        {items.map((s) => (
          <button key={s.key} onClick={() => jump(s.key)} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: SG, fontSize: "13px", fontWeight: 500, color: TEXT.body, background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "100px", padding: "7px 13px", cursor: "pointer", whiteSpace: "nowrap" }}>
            {s.emoji && <span style={{ fontSize: "13px" }}>{s.emoji}</span>}{s.eyebrow}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Lens chooser (2 headline + "Just exploring") ────────────────────────────
function LensChooser({ onChoose }: { onChoose: (l: RadarLens) => void }) {
  const [sel, setSel] = useState<RadarLens | null>(null);
  return (
    <div className="scrollbar-none" style={{ height: "100%", overflowY: "auto", background: CANVAS, display: "flex", flexDirection: "column", justifyContent: "center", padding: "32px 24px" }}>
      <span style={{ fontFamily: SG, fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", color: GOLD, textTransform: "uppercase" }}>Tune your radar</span>
      <h1 style={{ fontFamily: SG, fontSize: "26px", fontWeight: 600, color: "#f5f5f5", margin: "8px 0 0", letterSpacing: "-0.02em", lineHeight: 1.15 }}>How do you move through AI?</h1>
      <p style={{ fontSize: "14px", color: "#737373", margin: "8px 0 26px", lineHeight: 1.5 }}>Your lens shapes what Kapyn surfaces first. You can change it anytime.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {HEADLINE.map(({ id, label, tagline, Icon }) => {
          const active = sel === id;
          return (
            <button key={id} onClick={() => setSel(id)} className="lens-option" style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%", textAlign: "left", background: active ? "rgba(232,178,92,0.06)" : "#111111", border: `1px solid ${active ? GOLD_BORDER : "rgba(255,255,255,0.08)"}`, borderRadius: "16px", padding: "16px 18px", cursor: "pointer" }}>
              <span style={{ flexShrink: 0, width: "42px", height: "42px", borderRadius: "11px", background: GOLD_SOFT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={20} color={GOLD} strokeWidth={1.8} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: SG, fontSize: "15px", fontWeight: 600, color: "#ededed" }}>{label}</span>
                <span style={{ display: "block", fontSize: "13px", color: "#8a8a8a", marginTop: "2px", lineHeight: 1.4 }}>{tagline}</span>
              </span>
              <span style={{ flexShrink: 0, width: "20px", height: "20px", borderRadius: "100px", border: `1.5px solid ${active ? GOLD : "rgba(255,255,255,0.18)"}`, background: active ? GOLD : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {active && <Check size={12} color="#0a0a0a" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
      <button onClick={() => sel && onChoose(sel)} disabled={!sel} style={{ marginTop: "20px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", fontFamily: SG, fontSize: "15px", fontWeight: 600, color: "#0a0a0a", background: sel ? GOLD : "rgba(255,255,255,0.10)", border: "none", borderRadius: "14px", padding: "15px", cursor: sel ? "pointer" : "default", opacity: sel ? 1 : 0.55, transition: "background 0.2s ease, opacity 0.2s ease" }}>
        Enter your Radar <ArrowRight size={17} strokeWidth={2.3} />
      </button>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export function RadarClient(data: RadarData) {
  const [lens, setLens] = useState<RadarLens | null>(null);
  const [ready, setReady] = useState(false);
  const [detail, setDetail] = useState<RadarThing | null>(null);
  const reduced = !!useReducedMotion();
  const V = radarVariants(reduced);

  useEffect(() => {
    const override = new URLSearchParams(window.location.search).get("lens");
    if (override === "builder" || override === "curious" || override === "vibe" || override === "founder") {
      // Retired lenses (vibe/founder) collapse into builder.
      const mapped: RadarLens = override === "curious" ? "curious" : "builder";
      setRadarLens(mapped);
      setLens(mapped);
    } else {
      setLens(getRadarLens());
    }
    setReady(true);
  }, []);

  const choose = (l: RadarLens) => {
    setRadarLens(l);
    setLens(l);
    posthog.capture("radar_lens_selected", { lens: l });
  };

  const onOpen = (t: RadarThing) => {
    setDetail(t);
    posthog.capture("radar_detail_opened", { id: t.id, kind: t.kind });
  };

  if (!ready) return <div style={{ height: "100%", background: CANVAS }} />;
  if (!lens) return <LensChooser onChoose={choose} />;

  const heroCards = buildHeroCards(lens, data);
  const heroIds = new Set(heroCards.flatMap((c) => (c.kind === "thing" ? [c.thing.id] : [])));
  const sections = buildSections(lens, data, heroIds);

  return (
    <div className="scrollbar-none" style={{ position: "relative", height: "100%", overflowY: "auto", background: CANVAS, paddingBottom: "28px" }}>
      <div aria-hidden style={{ position: "fixed", inset: 0, backgroundImage: GRAIN, opacity: 0.035, mixBlendMode: "overlay", pointerEvents: "none", zIndex: 1 }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "26px 24px 16px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: SG, fontSize: "32px", fontWeight: 700, color: "#f5f3ef", margin: 0, letterSpacing: "-0.035em", lineHeight: 1.02 }}>Radar</h1>
            <p style={{ fontSize: "15px", color: TEXT.body, margin: "8px 0 0", lineHeight: 1.45, maxWidth: "300px" }}>What&apos;s new and worth knowing in AI, tuned to you.</p>
          </div>
          <Link href="/profile" aria-label="Settings & notifications" style={{ flexShrink: 0, marginTop: "2px", width: "38px", height: "38px", borderRadius: "100px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={17} color="#a3a3a3" strokeWidth={1.8} />
          </Link>
        </div>

        {/* Lens switcher */}
        <div className="scrollbar-none" style={{ display: "flex", gap: "8px", padding: "0 24px 18px", overflowX: "auto" }}>
          {PILLS.map(({ id, label, Icon }) => {
            const active = id === lens;
            return (
              <button key={id} onClick={() => choose(id)} style={{ position: "relative", flexShrink: 0, fontFamily: SG, fontSize: "13px", fontWeight: active ? 600 : 500, color: active ? "#0a0a0a" : "#a3a3a3", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "100px", padding: "6px 14px", cursor: "pointer", whiteSpace: "nowrap" }}>
                {active && <motion.span layoutId="lensPill" transition={lensIndicatorSpring} style={{ position: "absolute", inset: 0, background: GOLD, borderRadius: "100px", zIndex: 0 }} />}
                <span style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: "5px" }}><Icon size={13} strokeWidth={2.2} />{label}</span>
              </button>
            );
          })}
        </div>

        {/* Lens content */}
        <AnimatePresence mode="wait">
          <motion.div key={lens} variants={V.block} initial="hidden" animate="show" exit="exit">
            <motion.div variants={V.hero}><HeroDeck cards={heroCards} onOpen={onOpen} /></motion.div>
            {lens === "builder" && (
              <>
                <motion.div variants={V.item}><CategoryNav sections={sections} /></motion.div>
                <motion.div variants={V.item}><WhatsNew tools={data.tools} onOpen={onOpen} /></motion.div>
              </>
            )}
            {sections.map((s) => (
              <motion.div key={s.key} id={`sec-${s.key}`} variants={V.item}><Section {...s} onOpen={onOpen} /></motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <RadarDetailSheet thing={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
