"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Cpu, Briefcase, Compass, Bell, Check, ArrowRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import posthog from "posthog-js";
import { getRadarLens, setRadarLens, type RadarLens } from "@/lib/storage";
import type { RadarTool, RadarItem } from "@/lib/knowledge";
import { formatTimeAgo } from "@/lib/mock-data";
import { radarVariants, lensIndicatorSpring } from "@/lib/radar-motion";
import { FaceMark, MetricChip, GOLD, GOLD_SOFT, GOLD_BORDER, SG, type Face, type RadarThing } from "./radar-shared";
import { RadarDetailSheet } from "./RadarDetailSheet";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

interface RadarData {
  tools: RadarTool[];
  entities: RadarItem[];
  essentials: RadarTool[];
}

// ─── Lenses (Builder + Founder headline; "Exploring" = curious) ───────────────
const HEADLINE: { id: RadarLens; label: string; tagline: string; Icon: LucideIcon }[] = [
  { id: "builder", label: "Builder", tagline: "I build with AI", Icon: Cpu },
  { id: "founder", label: "Founder / Operator", tagline: "I run a product or business", Icon: Briefcase },
];
const PILLS: { id: RadarLens; label: string; Icon: LucideIcon }[] = [
  { id: "builder", label: "Builder", Icon: Cpu },
  { id: "founder", label: "Founder", Icon: Briefcase },
  { id: "curious", label: "Exploring", Icon: Compass },
];

// ─── Mappers: source objects → the normalized RadarThing ─────────────────────
function toolThing(t: RadarTool): RadarThing {
  return {
    id: t.url, kind: "tool", name: t.name, valueLine: t.valueLine,
    face: t.source === "producthunt" ? "producthunt" : "github",
    metric: t.meta, typeLabel: t.source === "producthunt" ? "Product Hunt" : "GitHub",
    category: null, url: t.url, recency: null, storyTitle: null, storySource: null,
  };
}
function essThing(t: RadarTool): RadarThing {
  return {
    id: t.url, kind: "tool", name: t.name, valueLine: t.valueLine, face: "essential",
    metric: null, typeLabel: null, category: t.meta ?? "Essentials",
    url: t.url, recency: null, storyTitle: null, storySource: null,
  };
}
function canonThing(t: RadarTool): RadarThing {
  return {
    id: t.url, kind: "tool", name: t.name, valueLine: t.valueLine, face: "github",
    metric: t.meta, typeLabel: "Open source", category: "Open source",
    url: t.url, recency: null, storyTitle: null, storySource: null,
  };
}
function entThing(e: RadarItem): RadarThing {
  const n = e.entity.mentionCount;
  const et = e.entity.entityType;
  return {
    id: `entity:${e.entity.id}`, kind: "entity", name: e.entity.canonicalName, valueLine: e.valueLine ?? "",
    face: (["model", "tool", "company"].includes(et) ? et : "concept") as Face,
    metric: `${n} ${n === 1 ? "source" : "sources"}`,
    typeLabel: et.charAt(0).toUpperCase() + et.slice(1),
    category: et === "model" ? "Models" : et === "tool" ? "Tools" : et === "company" ? "Companies" : "Concepts",
    url: e.latestStory?.sourceUrl ?? null,
    recency: e.latestStory?.publishedAt ? formatTimeAgo(e.latestStory.publishedAt) : null,
    storyTitle: e.latestStory?.title ?? null,
    storySource: e.latestStory?.sourceName ?? null,
  };
}

// ─── Shared bits ─────────────────────────────────────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily: SG, fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em", color: GOLD }}>{children}</span>;
}

// ─── Hero deck (swipeable; ends on "Caught up") ──────────────────────────────
type HeroCard =
  | { kind: "thing"; eyebrow: string; thing: RadarThing; imageUrl: string | null }
  | { kind: "closer"; count: number };

const CARD_W = "84%";

function HeroCardThing({ card, onOpen }: { card: Extract<HeroCard, { kind: "thing" }>; onOpen: (t: RadarThing) => void }) {
  const t = card.thing;
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
            <h2 style={{ fontFamily: SG, fontSize: "21px", fontWeight: 600, lineHeight: 1.15, letterSpacing: "-0.02em", color: "#f5f3ef", margin: "5px 0 4px", textWrap: "balance" }}>{t.name}</h2>
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
    <button onClick={() => onOpen(thing)} className="radar-row" style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", textAlign: "left", padding: "13px 24px", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", color: "inherit" }}>
      <FaceMark face={thing.face} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: "15px", fontWeight: 600, color: "#ededed", letterSpacing: "-0.01em" }}>{thing.name}</span>
        <p style={{ fontSize: "14px", fontWeight: 450, color: "#9a9a9a", lineHeight: 1.4, margin: "2px 0 0" }}>{thing.valueLine}</p>
      </div>
      {thing.metric && <MetricChip>{thing.metric}</MetricChip>}
    </button>
  );
}

function RailCard({ thing, wide, onOpen }: { thing: RadarThing; wide: boolean; onOpen: (t: RadarThing) => void }) {
  return (
    <button onClick={() => onOpen(thing)} className="radar-railcard" style={{ flexShrink: 0, scrollSnapAlign: "start", width: wide ? "262px" : "210px", background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "14px", textAlign: "left", cursor: "pointer", color: "inherit" }}>
      <FaceMark face={thing.face} />
      <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#ededed", margin: "10px 0 3px", letterSpacing: "-0.01em" }}>{thing.name}</span>
      <p style={{ fontSize: "13px", color: "#9a9a9a", lineHeight: 1.4, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{thing.valueLine}</p>
      {thing.metric && <span style={{ display: "block", marginTop: "10px" }}><MetricChip>{thing.metric}</MetricChip></span>}
    </button>
  );
}

interface SectionData { key: string; eyebrow: string; sub: string; variant: "list" | "rail"; things: RadarThing[] }

function Section({ eyebrow, sub, variant, things, onOpen }: SectionData & { onOpen: (t: RadarThing) => void }) {
  if (things.length === 0) return null;
  return (
    <section style={{ marginBottom: "30px" }}>
      <div style={{ padding: "0 24px", marginBottom: "12px" }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <p style={{ fontSize: "12.5px", color: "#5c5c5c", margin: "2px 0 0" }}>{sub}</p>
      </div>
      {variant === "rail" ? (
        <div className="scrollbar-none radar-rail" style={{ display: "flex", gap: "12px", padding: "0 24px", overflowX: "auto", scrollSnapType: "x proximity" }}>
          {things.map((t, i) => <RailCard key={t.id} thing={t} wide={i === 0} onOpen={onOpen} />)}
        </div>
      ) : (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
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
    cards.push({ kind: "thing", eyebrow: lens === "founder" ? "What's moving" : "The big move", thing: t, imageUrl: big.latestStory?.imageUrl ?? null });
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
  } else if (lens === "founder") {
    const co = byTraction.find((e) => e.entity.entityType === "company" && !used.has(`entity:${e.entity.id}`));
    if (co) pick = { thing: entThing(co), img: co.latestStory?.imageUrl ?? null, eyebrow: "Worth an opinion" };
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
    raw = [
      { key: "stack", eyebrow: "For your stack", sub: "Coding, inference & data tools", variant: "rail", things: [...byCat("AI coding"), ...byCat("Inference"), ...byCat("Data & RAG"), ...byCat("Agents & automation")].map(essThing) },
      { key: "new", eyebrow: "New tools", sub: "Fresh from GitHub & Product Hunt", variant: "rail", things: data.tools.slice(0, 10).map(toolThing) },
      { key: "moving", eyebrow: "Models & tools moving", sub: "Gaining traction in AI now", variant: "list", things: modelsTools.slice(0, 10).map(entThing) },
      { key: "oss", eyebrow: "Popular open-source", sub: "Most-starred, still maintained", variant: "list", things: canon.slice(0, 8).map(canonThing) },
    ];
  } else if (lens === "founder") {
    raw = [
      { key: "moving", eyebrow: "What's moving", sub: "Companies & models gaining traction", variant: "list", things: byTraction.slice(0, 10).map(entThing) },
      { key: "new", eyebrow: "New launches", sub: "Worth a look", variant: "rail", things: data.tools.slice(0, 8).map(toolThing) },
      { key: "opinion", eyebrow: "Worth an opinion", sub: "The tools shaping the space", variant: "rail", things: byCat("Models & chat").map(essThing) },
    ];
  } else {
    raw = [
      { key: "start", eyebrow: "Start here", sub: "The AI tools everyone's using", variant: "rail", things: byCat("Models & chat").map(essThing) },
      { key: "big", eyebrow: "What's big right now", sub: "Most talked-about in AI", variant: "list", things: byTraction.slice(0, 6).map(entThing) },
      { key: "toolkit", eyebrow: "Build your toolkit", sub: "When you're ready to go deeper", variant: "rail", things: [...byCat("AI coding"), ...byCat("Inference")].map(essThing) },
      { key: "notable", eyebrow: "New & notable", sub: "Fresh launches", variant: "rail", things: data.tools.slice(0, 6).map(toolThing) },
    ];
  }
  // De-dup: nothing in the hero deck repeats in the lists below.
  return raw.map((s) => ({ ...s, things: s.things.filter((t) => !heroIds.has(t.id)) }));
}

// ─── Lens chooser (2 headline + "Just exploring") ────────────────────────────
function LensChooser({ onChoose }: { onChoose: (l: RadarLens) => void }) {
  const [sel, setSel] = useState<RadarLens | null>(null);
  return (
    <div className="scrollbar-none" style={{ height: "100%", overflowY: "auto", background: "#0a0a0a", display: "flex", flexDirection: "column", justifyContent: "center", padding: "32px 24px" }}>
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
      <button onClick={() => onChoose("curious")} style={{ marginTop: "14px", alignSelf: "center", display: "inline-flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: "#8a8a8a", fontSize: "13.5px", cursor: "pointer", padding: "8px" }}>
        Just exploring <ArrowUpRight size={14} strokeWidth={2} style={{ transform: "rotate(45deg)" }} />
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
    if (override === "builder" || override === "founder" || override === "curious") {
      setRadarLens(override);
      setLens(override);
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

  if (!ready) return <div style={{ height: "100%", background: "#0a0a0a" }} />;
  if (!lens) return <LensChooser onChoose={choose} />;

  const heroCards = buildHeroCards(lens, data);
  const heroIds = new Set(heroCards.flatMap((c) => (c.kind === "thing" ? [c.thing.id] : [])));
  const sections = buildSections(lens, data, heroIds);

  return (
    <div className="scrollbar-none" style={{ position: "relative", height: "100%", overflowY: "auto", background: "#0a0a0a", paddingBottom: "28px" }}>
      <div aria-hidden style={{ position: "fixed", inset: 0, backgroundImage: GRAIN, opacity: 0.035, mixBlendMode: "overlay", pointerEvents: "none", zIndex: 1 }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 14px" }}>
          <div>
            <span style={{ fontFamily: SG, fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", color: GOLD, textTransform: "uppercase" }}>Kapyn</span>
            <h1 style={{ fontFamily: SG, fontSize: "26px", fontWeight: 600, color: "#f5f5f5", margin: "2px 0 0", letterSpacing: "-0.03em" }}>Radar</h1>
            <p style={{ fontSize: "13px", color: "#737373", margin: "4px 0 0", lineHeight: 1.5 }}>What is new and worth knowing in AI — tuned to you.</p>
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
            {sections.map((s) => (
              <motion.div key={s.key} variants={V.item}><Section {...s} onOpen={onOpen} /></motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <RadarDetailSheet thing={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
