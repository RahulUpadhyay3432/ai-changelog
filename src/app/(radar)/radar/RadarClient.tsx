"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Cpu, Compass, Clapperboard, MessageSquare, Check, ArrowRight, ArrowUpRight, Plug, Trophy, type LucideIcon } from "lucide-react";
import posthog from "posthog-js";
import { getRadarLens, setRadarLens, type RadarLens } from "@/lib/storage";
import type { RadarTool, RadarItem } from "@/lib/knowledge";
import type { Hackathon } from "@/lib/hackathons";
import { radarVariants, lensIndicatorSpring } from "@/lib/radar-motion";
import { FaceMark, MetricChip, CoverImage, usePressTap, GOLD, GOLD_SOFT, GOLD_BORDER, SG, TEXT, CANVAS, SURFACE, HAIRLINE, INNER_HIGHLIGHT, type RadarThing } from "./radar-shared";
import { toolThing, essThing, canonThing, entThing, categorizeTool, logoFor, WHATS_NEW_CATEGORY_ORDER } from "./radar-map";
import { RadarDetailSheet } from "./RadarDetailSheet";
import { SectionAllSheet } from "./SectionAllSheet";
import { HackathonDetailSheet } from "./HackathonDetailSheet";
import { FeedbackSheet } from "@/components/feedback/FeedbackSheet";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

const DesktopCtx = createContext(false);

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

interface RadarData {
  tools: RadarTool[];
  entities: RadarItem[];
  essentials: RadarTool[];
  hackathons: Hackathon[];
}

// ─── Lenses (Builder + Exploring + Creator) ──────────────────────────────────
const HEADLINE: { id: RadarLens; label: string; tagline: string; Icon: LucideIcon }[] = [
  { id: "builder", label: "Builder", tagline: "I build with AI — code, agents, UI, infra", Icon: Cpu },
  { id: "creator", label: "Creator", tagline: "I create with AI — video, voice, image, content", Icon: Clapperboard },
  { id: "curious", label: "Just exploring", tagline: "Keep me current across AI, broadly", Icon: Compass },
];
const PILLS: { id: RadarLens; label: string; Icon: LucideIcon }[] = [
  { id: "builder", label: "Builder", Icon: Cpu },
  { id: "creator", label: "Creator", Icon: Clapperboard },
  { id: "curious", label: "Exploring", Icon: Compass },
];

// The top headline shuffles on each visit — a small delight. Held stable for
// the session (sessionStorage) so hopping between radar tabs doesn't reshuffle
// it; a fresh load/visit picks a new one.
const HEADER_PHRASES = [
  "Let's build", "Let's explore", "What's new today",
  "Let's learn something", "Find your next tool", "What moved today",
];
const HEADLINE_KEY = "kapyn_radar_headline";

function sessionHeadline(): string {
  if (typeof window === "undefined") return HEADER_PHRASES[0];
  try {
    const saved = window.sessionStorage.getItem(HEADLINE_KEY);
    if (saved) return saved;
    const pick = HEADER_PHRASES[Math.floor(Math.random() * HEADER_PHRASES.length)];
    window.sessionStorage.setItem(HEADLINE_KEY, pick);
    return pick;
  } catch {
    return HEADER_PHRASES[0];
  }
}

// Play the entrance animation only on the first radar mount of a session — so
// returning to Today from another tab doesn't replay it (the "reload" feel).
let introPlayed = false;


// ─── Shared bits ─────────────────────────────────────────────────────────────
// SectionKicker: muted — for section headers above rows/rails.
function SectionKicker({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily: SG, fontSize: "14px", fontWeight: 700, lineHeight: 1.1, letterSpacing: "0.04em", textTransform: "uppercase", color: TEXT.body }}>{children}</span>;
}

// ─── What's new (filter pills over one ranked feed) ──────────────────────────
// The builder's first question: what shipped across GitHub & Product Hunt.
// Two pill rows (source + category) filter one ranked list in place.
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
        color: active ? "#ffffff" : "#a3a3a3",
        background: active ? GOLD : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? GOLD : "rgba(255,255,255,0.08)"}`,
        borderRadius: "100px", padding: "6px 13px", cursor: "pointer", whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function WhatsNewCard({ thing, onOpen }: { thing: RadarThing; onOpen: (t: RadarThing) => void }) {
  const tap = usePressTap(() => onOpen(thing));
  return (
    <motion.button {...tap} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 440, damping: 28 }} style={{ display: "flex", flexDirection: "column", textAlign: "left", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "16px", padding: "13px", cursor: "pointer", color: "inherit", boxShadow: INNER_HIGHLIGHT, minWidth: 0, overflow: "hidden", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <FaceMark face={thing.face} category={thing.categorySlug} logoUrl={thing.logoUrl} label={thing.name} size={34} />
        <SourceMark face={thing.face} size={14} />
      </div>
      <span style={{ display: "block", fontSize: "14.5px", fontWeight: 600, color: TEXT.primary, letterSpacing: "-0.01em", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{thing.name}</span>
      <span style={{ fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.4, marginTop: "3px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "35px" }}>{thing.valueLine}</span>
      {thing.metric && <span style={{ marginTop: "9px" }}><MetricChip>{thing.metric}</MetricChip></span>}
    </motion.button>
  );
}

function WhatsNew({ tools, onOpen }: { tools: RadarTool[]; onOpen: (t: RadarThing) => void }) {
  const isDesktop = useContext(DesktopCtx);
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

  const setSrc = (s: "all" | "github" | "producthunt") => { setSource(s); posthog.capture("radar_whatsnew_source", { source: s }); };

  return (
    <section style={{ marginBottom: "30px" }}>
      <div style={{ padding: "0 24px", marginBottom: "12px" }}>
        <h2 style={{ fontFamily: SG, fontSize: "20px", fontWeight: 700, color: TEXT.primary, margin: 0, letterSpacing: "-0.02em" }}>New on the radar</h2>
        <p style={{ fontSize: "12.5px", color: TEXT.muted, margin: "3px 0 0" }}>The latest launches we&apos;re tracking</p>
      </div>

      {/* Source row: MCP and skills first (gold wayfinding → its own view), then the
          in-place filters — All · GitHub · Product Hunt. */}
      <div className="scrollbar-none" style={{ display: "flex", gap: "8px", padding: "0 24px 10px", overflowX: "auto" }}>
        <Link href="/radar/mcp" onClick={() => posthog.capture("radar_mcp_pill_tapped")} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: SG, fontSize: "13px", fontWeight: 600, color: GOLD, background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: "100px", padding: "6px 13px", whiteSpace: "nowrap", textDecoration: "none" }}>
          <Plug size={13} strokeWidth={2.2} /> MCP and skills
        </Link>
        <Pill active={source === "all"} onClick={() => setSrc("all")}>All</Pill>
        <Pill active={source === "github"} onClick={() => setSrc("github")}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><SourceMark face="github" size={13} color={source === "github" ? "#ffffff" : TEXT.body} />GitHub</span>
        </Pill>
        <Pill active={source === "producthunt"} onClick={() => setSrc("producthunt")}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><SourceMark face="producthunt" size={13} />Product Hunt</span>
        </Pill>
      </div>

      <div className="scrollbar-none" style={{ display: "flex", gap: "8px", padding: "0 24px 14px", overflowX: "auto" }}>
        {cats.map((c) => (
          <Pill key={c} active={cat === c} onClick={() => { setCat(c); posthog.capture("radar_whatsnew_category", { category: c }); }}>{c}</Pill>
        ))}
      </div>

      {visible.length === 0 ? (
        <p style={{ padding: "8px 24px", color: TEXT.muted, fontSize: "13.5px" }}>Nothing new in this filter yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr 1fr" : "1fr 1fr", gap: "10px", padding: "4px 20px 16px" }}>
          {visible.slice(0, 20).map((tool) => <WhatsNewCard key={tool.url} thing={toolThing(tool)} onOpen={onOpen} />)}
        </div>
      )}
    </section>
  );
}

// ─── Hackathons rail (Pulse: opportunities to go build) ──────────────────────
// Cards open an in-app brief (HackathonDetailSheet); only its "Register" button
// leaves the app. Tap-guarded so a vertical scroll never opens the sheet.
function HackathonRailCard({ h, onOpen }: { h: Hackathon; onOpen: (h: Hackathon) => void }) {
  const open = h.openState.toLowerCase() === "open";
  const tap = usePressTap(() => onOpen(h));
  return (
    <motion.button
      {...tap}
      whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 440, damping: 28 }}
      style={{ flexShrink: 0, scrollSnapAlign: "start", width: "228px", textAlign: "left", color: "inherit", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "16px", overflow: "hidden", boxShadow: INNER_HIGHLIGHT, cursor: "pointer", padding: 0 }}
    >
      <div style={{ position: "relative" }}>
        <CoverImage src={h.imageUrl ?? logoFor(h.url)} category="startups" fallbackIcon={Trophy} height={98} radius={0} />
        <span style={{ position: "absolute", top: "8px", left: "8px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: open ? "#ffffff" : TEXT.primary, background: open ? GOLD : "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", borderRadius: "100px", padding: "3px 8px" }}>{open ? "Open" : "Upcoming"}</span>
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <span style={{ display: "-webkit-box", fontSize: "13.5px", fontWeight: 600, color: TEXT.primary, lineHeight: 1.25, letterSpacing: "-0.01em", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "34px" }}>{h.title}</span>
        <span style={{ display: "block", fontSize: "12px", color: TEXT.muted, marginTop: "5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.isOnline ? "Online" : h.location || "In-person"}{h.prize ? ` · ${h.prize}` : ""}</span>
      </div>
    </motion.button>
  );
}

function HackathonsRail({ items, onOpen }: { items: Hackathon[]; onOpen: (h: Hackathon) => void }) {
  if (items.length === 0) return null;
  return (
    <section style={{ marginBottom: "30px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", marginBottom: "12px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
          <span style={{ fontSize: "14px" }}>🏆</span>
          <SectionKicker>Hackathons happening now</SectionKicker>
        </span>
        <Link href="/radar/hackathons" style={{ fontFamily: SG, fontSize: "12.5px", fontWeight: 600, color: GOLD, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px" }}>
          See all <ArrowUpRight size={13} strokeWidth={2.3} />
        </Link>
      </div>
      <div className="scrollbar-none radar-rail" style={{ display: "flex", gap: "12px", padding: "0 24px", overflowX: "auto", scrollSnapType: "x proximity" }}>
        {items.map((h, i) => <HackathonRailCard key={`${h.source}-${i}`} h={h} onOpen={onOpen} />)}
      </div>
    </section>
  );
}

// ─── High-level category tiles — the builder's branching, top of Today ───────
// Replaces the old swipeable hero deck: instead of 3 passive cards, the same
// vertical space becomes navigable entry points into the radar's categories.
// One tile per non-empty section; tap → smooth-scroll to that section below.
// A faint per-category tint adds life while honoring radar-shared's monochrome
// discipline (GOLD stays wayfinding-only; the tints are corner glows, not fills).
const SECTION_ACCENT: Record<string, string> = {
  // builder lens
  coding: "#3b82f6", ui: "#a855f7", agents: "#6366f1", models: "#06b6d4",
  data: "#f59e0b", safe: "#f43f5e", media: "#fb923c", moving: "#22c55e",
  ghtrending: "#7c8aa0", oss: "#94a3b8",
  // curious lens
  start: "#06b6d4", big: "#f59e0b", toolkit: "#3b82f6", notable: "#a855f7",
  // creator lens
  video: "#fb923c", voice: "#a855f7", image: "#06b6d4", marketing: "#22c55e",
  cbig: "#f59e0b", cnotable: "#ec4899",
};
const sectionAccent = (key: string) => SECTION_ACCENT[key] ?? GOLD;

function CategoryTile({ s, onJump }: { s: SectionData; onJump: (key: string) => void }) {
  const accent = sectionAccent(s.key);
  const tap = usePressTap(() => onJump(s.key));
  return (
    <motion.button
      {...tap}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 440, damping: 28 }}
      style={{ scrollSnapAlign: "start", display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left", minWidth: 0, overflow: "hidden", background: `linear-gradient(135deg, ${accent}1f 0%, ${SURFACE} 58%)`, border: `1px solid ${HAIRLINE}`, borderRadius: "16px", padding: "12px 13px", cursor: "pointer", color: "inherit", boxShadow: INNER_HIGHLIGHT }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: "9px" }}>
        <span style={{ flexShrink: 0, width: "30px", height: "30px", borderRadius: "9px", background: `${accent}24`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>{s.emoji ?? "✨"}</span>
        <span style={{ fontFamily: SG, fontSize: "12px", fontWeight: 700, color: accent, fontVariantNumeric: "tabular-nums" }}>{s.things.length}</span>
      </div>
      <span style={{ display: "block", width: "100%", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: TEXT.primary, letterSpacing: "-0.01em", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.eyebrow}</span>
      <span style={{ display: "block", width: "100%", fontSize: "11.5px", color: TEXT.muted, lineHeight: 1.3, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.sub}</span>
    </motion.button>
  );
}

function CategoryTiles({ sections }: { sections: SectionData[] }) {
  const isDesktop = useContext(DesktopCtx);
  const items = sections.filter((s) => s.things.length > 0);
  if (items.length === 0) return null;
  const jump = (key: string) => {
    document.getElementById(`sec-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    posthog.capture("radar_category_tile", { key });
  };
  return (
    <div
      className="scrollbar-none"
      style={isDesktop
        ? { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px", padding: "0 24px", margin: "0 0 24px" }
        : { display: "grid", gridAutoFlow: "column", gridTemplateRows: "1fr 1fr", gridAutoColumns: "168px", gap: "10px", overflowX: "auto", scrollSnapType: "x proximity", padding: "0 24px", margin: "0 0 24px" }}
    >
      {items.map((s) => <CategoryTile key={s.key} s={s} onJump={jump} />)}
    </div>
  );
}

// ─── Row + RailCard (buttons → open the sheet) ───────────────────────────────
function Row({ thing, onOpen }: { thing: RadarThing; onOpen: (t: RadarThing) => void }) {
  const tap = usePressTap(() => onOpen(thing));
  return (
    <motion.button {...tap} whileTap={{ scale: 0.975 }} transition={{ type: "spring", stiffness: 440, damping: 28 }} className="radar-row" style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", textAlign: "left", padding: "13px 24px", background: "transparent", border: "none", borderBottom: `1px solid ${HAIRLINE}`, cursor: "pointer", color: "inherit" }}>
      <FaceMark face={thing.face} category={thing.categorySlug} logoUrl={thing.logoUrl} label={thing.name} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: "15px", fontWeight: 600, color: TEXT.primary, letterSpacing: "-0.01em" }}>{thing.name}</span>
        <p style={{ fontSize: "14px", fontWeight: 450, color: TEXT.body, lineHeight: 1.4, margin: "2px 0 0" }}>{thing.valueLine}</p>
      </div>
      {thing.metric && <MetricChip>{thing.metric}</MetricChip>}
    </motion.button>
  );
}

function RailCard({ thing, wide, onOpen }: { thing: RadarThing; wide: boolean; onOpen: (t: RadarThing) => void }) {
  const tap = usePressTap(() => onOpen(thing));
  return (
    <motion.button {...tap} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 440, damping: 28 }} className="radar-railcard" style={{ flexShrink: 0, scrollSnapAlign: "start", width: wide ? "262px" : "210px", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "16px", padding: "14px", textAlign: "left", cursor: "pointer", color: "inherit" }}>
      <FaceMark face={thing.face} category={thing.categorySlug} logoUrl={thing.logoUrl} label={thing.name} />
      <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: TEXT.primary, margin: "10px 0 3px", letterSpacing: "-0.01em" }}>{thing.name}</span>
      <p style={{ fontSize: "13px", color: TEXT.body, lineHeight: 1.4, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{thing.valueLine}</p>
      {thing.metric && <span style={{ display: "block", marginTop: "10px" }}><MetricChip>{thing.metric}</MetricChip></span>}
    </motion.button>
  );
}

interface SectionData { key: string; emoji?: string; eyebrow: string; sub: string; variant: "list" | "rail"; things: RadarThing[] }

function Section({ emoji, eyebrow, sub, variant, things, onOpen, onSeeAll }: SectionData & { onOpen: (t: RadarThing) => void; onSeeAll?: () => void }) {
  const isDesktop = useContext(DesktopCtx);
  if (things.length === 0) return null;
  // Rails hide most cards off the right edge — offer a focused full view. List
  // sections already show everything inline, so no "See all" there.
  const showSeeAll = !isDesktop && variant === "rail" && things.length > 3 && !!onSeeAll;
  return (
    <section style={{ marginBottom: "30px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "0 24px", marginBottom: "12px" }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
            {emoji && <span style={{ fontSize: "16px" }}>{emoji}</span>}
            <SectionKicker>{eyebrow}</SectionKicker>
          </span>
          <p style={{ fontSize: "12.5px", color: TEXT.muted, margin: "3px 0 0" }}>{sub}</p>
        </div>
        {showSeeAll && (
          <button onClick={onSeeAll} style={{ flexShrink: 0, fontFamily: SG, fontSize: "12.5px", fontWeight: 600, color: GOLD, background: "transparent", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "3px", padding: 0 }}>
            See all <ArrowUpRight size={13} strokeWidth={2.3} />
          </button>
        )}
      </div>
      {variant === "rail" ? (
        isDesktop ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", padding: "0 24px" }}>
            {things.map((t) => <RailCard key={t.id} thing={t} wide={false} onOpen={onOpen} />)}
          </div>
        ) : (
          <div className="scrollbar-none radar-rail" style={{ display: "flex", gap: "12px", padding: "0 24px", overflowX: "auto", scrollSnapType: "x proximity" }}>
            {things.map((t, i) => <RailCard key={t.id} thing={t} wide={i === 0} onOpen={onOpen} />)}
          </div>
        )
      ) : (
        <div style={{ borderTop: `1px solid ${HAIRLINE}` }}>
          {things.map((t) => <Row key={t.id} thing={t} onOpen={onOpen} />)}
        </div>
      )}
    </section>
  );
}

// ─── Section arrangement per lens ────────────────────────────────────────────
function buildSections(lens: RadarLens, data: RadarData): SectionData[] {
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
      { key: "media", emoji: "🎬", eyebrow: "Generate media", sub: "Voice, image, and video models", variant: "rail", things: [...byCat("Video"), ...byCat("Voice & audio"), ...byCat("Image")].map(essThing) },
      { key: "moving", emoji: "📈", eyebrow: "Models & tools moving", sub: "Gaining traction in AI now", variant: "list", things: modelsTools.slice(0, 10).map(entThing) },
      { key: "ghtrending", emoji: "🐙", eyebrow: "Trending on GitHub", sub: "Repos gaining stars fast right now", variant: "rail", things: data.tools.filter((t) => t.source === "github").sort((a, b) => b.score - a.score).map(toolThing) },
      { key: "oss", emoji: "📦", eyebrow: "Popular open source", sub: "Most-starred, still maintained", variant: "list", things: canon.slice(0, 8).map(canonThing) },
    ];
  } else if (lens === "creator") {
    // For makers & marketers: generate, then distribute. Video → voice → image
    // → marketing content, plus what's big and what's newly launched.
    raw = [
      { key: "video", emoji: "🎥", eyebrow: "Generate video", sub: "Text-to-video & motion models", variant: "rail", things: byCat("Video").map(essThing) },
      { key: "voice", emoji: "🎙️", eyebrow: "Voice & audio", sub: "Speech, music & sound generation", variant: "rail", things: byCat("Voice & audio").map(essThing) },
      { key: "image", emoji: "🖼️", eyebrow: "Generate images", sub: "Image & design generation", variant: "rail", things: byCat("Image").map(essThing) },
      { key: "marketing", emoji: "📣", eyebrow: "Marketing & content", sub: "Avatars, clips & decks that sell", variant: "rail", things: byCat("Marketing & content").map(essThing) },
      { key: "cbig", emoji: "🔥", eyebrow: "What's big right now", sub: "Most talked-about in AI", variant: "list", things: byTraction.slice(0, 6).map(entThing) },
      { key: "cnotable", emoji: "✨", eyebrow: "New & notable", sub: "Fresh launches", variant: "rail", things: data.tools.slice(0, 6).map(toolThing) },
    ];
  } else {
    raw = [
      { key: "start", emoji: "🚀", eyebrow: "Start here", sub: "The AI tools everyone's using", variant: "rail", things: byCat("Models & chat").map(essThing) },
      { key: "big", emoji: "🔥", eyebrow: "What's big right now", sub: "Most talked-about in AI", variant: "list", things: byTraction.slice(0, 6).map(entThing) },
      { key: "toolkit", emoji: "🧰", eyebrow: "Build your toolkit", sub: "When you're ready to go deeper", variant: "rail", things: [...byCat("AI coding"), ...byCat("Inference")].map(essThing) },
      { key: "notable", emoji: "✨", eyebrow: "New & notable", sub: "Fresh launches", variant: "rail", things: data.tools.slice(0, 6).map(toolThing) },
    ];
  }
  return raw;
}

// ─── Lens chooser (Builder · Creator · Just exploring) ───────────────────────
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
            <button key={id} onClick={() => setSel(id)} className="lens-option" style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%", textAlign: "left", background: active ? "rgba(59,130,246,0.06)" : "#111111", border: `1px solid ${active ? GOLD_BORDER : "rgba(255,255,255,0.08)"}`, borderRadius: "16px", padding: "16px 18px", cursor: "pointer" }}>
              <span style={{ flexShrink: 0, width: "42px", height: "42px", borderRadius: "11px", background: GOLD_SOFT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={20} color={GOLD} strokeWidth={1.8} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: SG, fontSize: "15px", fontWeight: 600, color: "#ededed" }}>{label}</span>
                <span style={{ display: "block", fontSize: "13px", color: "#8a8a8a", marginTop: "2px", lineHeight: 1.4 }}>{tagline}</span>
              </span>
              <span style={{ flexShrink: 0, width: "20px", height: "20px", borderRadius: "100px", border: `1.5px solid ${active ? GOLD : "rgba(255,255,255,0.18)"}`, background: active ? GOLD : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {active && <Check size={12} color="#ffffff" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
      <button onClick={() => sel && onChoose(sel)} disabled={!sel} style={{ marginTop: "20px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", fontFamily: SG, fontSize: "15px", fontWeight: 600, color: "#ffffff", background: sel ? GOLD : "rgba(255,255,255,0.10)", border: "none", borderRadius: "14px", padding: "15px", cursor: sel ? "pointer" : "default", opacity: sel ? 1 : 0.55, transition: "background 0.2s ease, opacity 0.2s ease" }}>
        Enter your Radar <ArrowRight size={17} strokeWidth={2.3} />
      </button>
    </div>
  );
}

// Lens switcher + Hackathons entry. The row scrolls horizontally; on phones the
// gold Hackathons CTA can sit off the right edge, so we add (a) a right-edge
// fade so it dissolves instead of hard-clipping, and (b) a slim gold
// scroll-progress bar — shown only when the row overflows — so it reads as
// "there's more to the right." A progress bar (not dots) is honest for a
// free-scrolling row: dots would imply discrete pages.
function LensRail({ lens, choose }: { lens: RadarLens; choose: (l: RadarLens) => void }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 along the scrollable range

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setOverflow(max > 2);
    setProgress(max > 0 ? Math.min(1, Math.max(0, el.scrollLeft / max)) : 0);
  }, []);

  useEffect(() => {
    measure();
    const el = scrollerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const TRACK = 44; // px — track width; thumb is a third of it
  const thumb = TRACK / 3;
  return (
    <div style={{ padding: "0 24px 14px" }}>
      <div
        ref={scrollerRef}
        onScroll={measure}
        className={overflow ? "scrollbar-none radar-rail" : "scrollbar-none"}
        style={{ display: "flex", alignItems: "center", gap: "8px", overflowX: "auto" }}
      >
        {PILLS.map(({ id, label, Icon }) => {
          const active = id === lens;
          return (
            <button key={id} onClick={() => choose(id)} style={{ position: "relative", flexShrink: 0, fontFamily: SG, fontSize: "15px", fontWeight: active ? 600 : 500, color: active ? "#ffffff" : "#a3a3a3", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "100px", padding: "9px 18px", cursor: "pointer", whiteSpace: "nowrap" }}>
              {active && <motion.span layoutId="lensPill" transition={lensIndicatorSpring} style={{ position: "absolute", inset: 0, background: GOLD, borderRadius: "100px", zIndex: 0 }} />}
              <span style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon size={15} strokeWidth={2.2} />{label}</span>
            </button>
          );
        })}
        <span aria-hidden style={{ flexShrink: 0, width: "1px", height: "22px", background: "rgba(255,255,255,0.12)", margin: "0 2px" }} />
        <Link href="/radar/hackathons" onClick={() => posthog.capture("radar_hackathon_pill_tapped")} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: SG, fontSize: "15px", fontWeight: 600, color: GOLD, background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: "100px", padding: "9px 18px", whiteSpace: "nowrap", textDecoration: "none" }}>
          <Trophy size={15} strokeWidth={2.2} /> Hackathons
        </Link>
      </div>
      {overflow && (
        <div aria-hidden style={{ width: `${TRACK}px`, height: "3px", margin: "10px 0 0", borderRadius: "2px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div style={{ width: `${thumb}px`, height: "100%", borderRadius: "2px", background: GOLD, opacity: 0.7, transform: `translateX(${progress * (TRACK - thumb)}px)`, transition: "transform 0.08s linear" }} />
        </div>
      )}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export function RadarClient(data: RadarData) {
  const [lens, setLens] = useState<RadarLens | null>(null);
  const [ready, setReady] = useState(false);
  const [detail, setDetail] = useState<RadarThing | null>(null);
  const [hackDetail, setHackDetail] = useState<Hackathon | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [allSection, setAllSection] = useState<SectionData | null>(null);
  // Default to the first phrase so SSR + first client render match; a fresh
  // delightful one is picked on mount (each visit).
  const [headline, setHeadline] = useState(HEADER_PHRASES[0]);
  // Skip the entrance animation when returning to Today from another radar tab
  // (introPlayed is true after the first mount of the session). Lazy state, not
  // a ref, so it's safe to read during render.
  const [skipIntro] = useState(() => introPlayed);
  const reduced = !!useReducedMotion();
  const isDesktop = useIsDesktop();
  const V = radarVariants(reduced);

  useEffect(() => {
    const override = new URLSearchParams(window.location.search).get("lens");
    if (override === "builder" || override === "creator" || override === "curious" || override === "vibe" || override === "founder") {
      // Retired lenses (vibe/founder) collapse into builder.
      const mapped: RadarLens = override === "curious" ? "curious" : override === "creator" ? "creator" : "builder";
      setRadarLens(mapped);
      setLens(mapped);
    } else {
      setLens(getRadarLens());
    }
    setHeadline(sessionHeadline());
    introPlayed = true;
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

  const onOpenHackathon = (h: Hackathon) => {
    setHackDetail(h);
    posthog.capture("radar_hackathon_brief_opened", { source: h.source, scope: "today" });
  };

  if (!ready) return <div style={{ height: "100%", background: CANVAS }} />;
  if (!lens) return <LensChooser onChoose={choose} />;

  const sections = buildSections(lens, data);

  return (
    <DesktopCtx.Provider value={isDesktop}>
      <div className="scrollbar-none" style={{ position: "relative", height: "100%", overflowY: "auto", overflowX: "hidden", background: CANVAS, paddingBottom: "28px" }}>
        <div aria-hidden style={{ position: "fixed", inset: 0, backgroundImage: GRAIN, opacity: 0.035, mixBlendMode: "overlay", pointerEvents: "none", zIndex: 1 }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "26px 24px 16px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontFamily: SG, fontSize: "32px", fontWeight: 700, color: TEXT.primary, margin: 0, letterSpacing: "-0.035em", lineHeight: 1.02 }}>{headline}</h1>
              <p style={{ fontSize: "15px", color: TEXT.body, margin: "8px 0 0", lineHeight: 1.45, maxWidth: "300px" }}>What&apos;s new and worth knowing in AI, tuned to you.</p>
            </div>
            <button
              onClick={() => { setShowFeedback(true); posthog.capture("radar_feedback_opened", { from: "today_header" }); }}
              aria-label="Send feedback"
              style={{ flexShrink: 0, marginTop: "2px", display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "100px", background: SURFACE, border: `1px solid ${HAIRLINE}`, padding: "8px 14px", cursor: "pointer", fontFamily: SG, fontSize: "13px", fontWeight: 600, color: TEXT.body, boxShadow: INNER_HIGHLIGHT }}
            >
              <MessageSquare size={15} strokeWidth={2} /> Feedback
            </button>
          </div>

          {/* Lens switcher + Hackathons entry. The two toggles tune the content
              lens; the gold Hackathons pill (right of a divider) is wayfinding to
              a separate events view — a different kind of thing, kept distinct. */}
          <LensRail lens={lens} choose={choose} />

          {/* Lens content */}
          <AnimatePresence mode="wait">
            <motion.div key={lens} variants={V.block} initial={skipIntro ? false : "hidden"} animate="show" exit="exit">
              <motion.div variants={V.hero}><CategoryTiles sections={sections} /></motion.div>
              {lens === "builder" && (
                <motion.div variants={V.item}><WhatsNew tools={data.tools} onOpen={onOpen} /></motion.div>
              )}
              {data.hackathons.length > 0 && (
                <motion.div variants={V.item}><HackathonsRail items={data.hackathons} onOpen={onOpenHackathon} /></motion.div>
              )}
              {sections.map((s) => (
                <motion.div key={s.key} id={`sec-${s.key}`} variants={V.item}>
                  <Section
                    {...s}
                    onOpen={onOpen}
                    onSeeAll={() => { setAllSection(s); posthog.capture("radar_section_see_all", { key: s.key, count: s.things.length }); }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <RadarDetailSheet thing={detail} onClose={() => setDetail(null)} />
        <SectionAllSheet
          open={!!allSection}
          emoji={allSection?.emoji}
          title={allSection?.eyebrow ?? ""}
          sub={allSection?.sub ?? ""}
          things={allSection?.things ?? []}
          onClose={() => setAllSection(null)}
          onOpenThing={(t) => { setAllSection(null); onOpen(t); }}
        />
        <HackathonDetailSheet hackathon={hackDetail} onClose={() => setHackDetail(null)} />
        <FeedbackSheet open={showFeedback} onClose={() => setShowFeedback(false)} />
      </div>
    </DesktopCtx.Provider>
  );
}
