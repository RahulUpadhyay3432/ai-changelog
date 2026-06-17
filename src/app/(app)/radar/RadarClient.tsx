"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Brain, Wrench, Building2, Lightbulb, Rocket, Code2, Sparkles, ArrowUpRight,
  Cpu, Briefcase,
  type LucideIcon,
} from "lucide-react";
import posthog from "posthog-js";
import { getRadarLens, setRadarLens, type RadarLens } from "@/lib/storage";
import type { RadarTool, RadarItem } from "@/lib/knowledge";
import { radarVariants, lensIndicatorSpring } from "@/lib/radar-motion";

// ─── Tokens ──────────────────────────────────────────────────────────────────
const GOLD = "#E8B25C";
const GOLD_SOFT = "rgba(232,178,92,0.12)";
const GOLD_BORDER = "rgba(232,178,92,0.28)";
const SG = "var(--font-space-grotesk), -apple-system, sans-serif";
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

interface RadarData {
  tools: RadarTool[];
  entities: RadarItem[];
  essentials: RadarTool[];
}

// ─── Lenses (model B: Builder + Founder headline; "exploring" = curious) ──────
const HEADLINE: { id: RadarLens; label: string; tagline: string; Icon: LucideIcon }[] = [
  { id: "builder", label: "Builder", tagline: "I build with AI", Icon: Cpu },
  { id: "founder", label: "Founder / Operator", tagline: "I run a product or business", Icon: Briefcase },
];
const PILLS: { id: RadarLens; label: string }[] = [
  { id: "builder", label: "Builder" },
  { id: "founder", label: "Founder" },
  { id: "curious", label: "Exploring" },
];

// ─── Faces (monochrome type/source icons — consistent, calm, no favicons) ─────
type Face = "model" | "tool" | "company" | "concept" | "github" | "producthunt" | "essential";
const FACE_ICON: Record<Face, LucideIcon> = {
  model: Brain,
  tool: Wrench,
  company: Building2,
  concept: Lightbulb,
  github: Code2,
  producthunt: Rocket,
  essential: Sparkles,
};

function FaceMark({ face }: { face: Face }) {
  const Icon = FACE_ICON[face] ?? Sparkles;
  return (
    <span style={{ flexShrink: 0, width: "38px", height: "38px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={18} color="#9a9a9a" strokeWidth={1.7} />
    </span>
  );
}

// ─── Data shapes ─────────────────────────────────────────────────────────────
interface RowData { key: string; name: string; valueLine: string; metric?: string | null; face: Face; href?: string | null }
interface SectionData { key: string; eyebrow: string; sub: string; variant: "list" | "rail"; rows: RowData[] }
interface HeroData { eyebrow: string; name: string; valueLine: string; metric: string; imageUrl: string | null; href: string | null }

// ─── Shared bits ─────────────────────────────────────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily: SG, fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em", color: GOLD }}>{children}</span>;
}
function MetricChip({ children }: { children: React.ReactNode }) {
  return <span style={{ flexShrink: 0, fontSize: "12px", fontWeight: 600, color: GOLD, background: GOLD_SOFT, borderRadius: "100px", padding: "3px 9px", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{children}</span>;
}

// ─── Hero (double-bezel featured card) ───────────────────────────────────────
function Hero({ hero }: { hero: HeroData }) {
  const inner = (
    <div style={{ position: "relative", height: "188px", borderRadius: "22px", overflow: "hidden", background: "#101010", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.12)" }}>
      {hero.imageUrl ? (
        <img src={hero.imageUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.85)" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(125% 95% at 72% -10%, ${GOLD}30 0%, #0a0a0a 58%)` }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,8,0.96) 18%, rgba(8,8,8,0.35) 55%, rgba(8,8,8,0.1) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "16px 18px" }}>
        <Eyebrow>{hero.eyebrow}</Eyebrow>
        <h2 style={{ fontFamily: SG, fontSize: "22px", fontWeight: 600, lineHeight: 1.15, letterSpacing: "-0.02em", color: "#f5f3ef", margin: "5px 0 4px", textWrap: "balance" }}>{hero.name}</h2>
        <p style={{ fontSize: "14px", color: "#c9c5bf", lineHeight: 1.4, margin: 0, maxWidth: "92%" }}>{hero.valueLine}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
          <MetricChip>{hero.metric}</MetricChip>
          <span style={{ width: "32px", height: "32px", borderRadius: "100px", background: "rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArrowUpRight size={16} color="#f5f3ef" strokeWidth={2} />
          </span>
        </div>
      </div>
    </div>
  );
  const shell: React.CSSProperties = { display: "block", margin: "0 20px 28px", padding: "6px", borderRadius: "28px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none" };
  return hero.href ? (
    <a href={hero.href} target="_blank" rel="noopener noreferrer" style={shell} className="radar-hero">{inner}</a>
  ) : (
    <div style={shell}>{inner}</div>
  );
}

// ─── Row (faced, hairline divider, right metric) ─────────────────────────────
function Row({ name, valueLine, metric, face, href }: Omit<RowData, "key">) {
  const inner = (
    <>
      <FaceMark face={face} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: "15px", fontWeight: 600, color: "#ededed", letterSpacing: "-0.01em" }}>{name}</span>
        <p style={{ fontSize: "14px", fontWeight: 450, color: "#9a9a9a", lineHeight: 1.4, margin: "2px 0 0" }}>{valueLine}</p>
      </div>
      {metric && <MetricChip>{metric}</MetricChip>}
    </>
  );
  const style: React.CSSProperties = { display: "flex", alignItems: "center", gap: "12px", padding: "13px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", textDecoration: "none", color: "inherit" };
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" style={style} className="radar-row">{inner}</a>
  ) : (
    <div style={style}>{inner}</div>
  );
}

// ─── Rail (horizontal browse cards, varied width + peek) ─────────────────────
function RailCard({ row, wide }: { row: RowData; wide: boolean }) {
  const inner = (
    <>
      <FaceMark face={row.face} />
      <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#ededed", margin: "10px 0 3px", letterSpacing: "-0.01em" }}>{row.name}</span>
      <p style={{ fontSize: "13px", color: "#9a9a9a", lineHeight: 1.4, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{row.valueLine}</p>
      {row.metric && <span style={{ display: "block", marginTop: "10px" }}><MetricChip>{row.metric}</MetricChip></span>}
    </>
  );
  const style: React.CSSProperties = { flexShrink: 0, scrollSnapAlign: "start", width: wide ? "262px" : "210px", background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "14px", textDecoration: "none", color: "inherit" };
  return row.href ? (
    <a href={row.href} target="_blank" rel="noopener noreferrer" style={style} className="radar-railcard">{inner}</a>
  ) : (
    <div style={style}>{inner}</div>
  );
}

function Section({ eyebrow, sub, variant, rows }: SectionData) {
  if (rows.length === 0) return null;
  return (
    <section style={{ marginBottom: "30px" }}>
      <div style={{ padding: "0 24px", marginBottom: "12px" }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <p style={{ fontSize: "12.5px", color: "#5c5c5c", margin: "2px 0 0" }}>{sub}</p>
      </div>
      {variant === "rail" ? (
        <div className="scrollbar-none radar-rail" style={{ display: "flex", gap: "12px", padding: "0 24px", overflowX: "auto", scrollSnapType: "x proximity" }}>
          {rows.map((r, i) => <RailCard key={r.key} row={r} wide={i === 0} />)}
        </div>
      ) : (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {rows.map(({ key, ...rest }) => <Row key={key} {...rest} />)}
        </div>
      )}
    </section>
  );
}

// ─── Mappers ─────────────────────────────────────────────────────────────────
function toolRow(t: RadarTool): RowData {
  return { key: `t-${t.url}`, name: t.name, valueLine: t.valueLine, metric: t.meta, face: t.source === "producthunt" ? "producthunt" : "github", href: t.url };
}
function essRow(t: RadarTool): RowData {
  return { key: `e-${t.url}`, name: t.name, valueLine: t.valueLine, metric: null, face: "essential", href: t.url };
}
function canonRow(t: RadarTool): RowData {
  return { key: `c-${t.url}`, name: t.name, valueLine: t.valueLine, metric: t.meta, face: "github", href: t.url };
}
function entRow(e: RadarItem): RowData {
  const n = e.entity.mentionCount;
  return {
    key: `en-${e.entity.id}`,
    name: e.entity.canonicalName,
    valueLine: e.valueLine ?? "",
    metric: `${n} ${n === 1 ? "source" : "sources"}`,
    face: (["model", "tool", "company"].includes(e.entity.entityType) ? e.entity.entityType : "concept") as Face,
    href: e.latestStory?.sourceUrl ?? null,
  };
}

// ─── Hero + section arrangement per lens ─────────────────────────────────────
function pickHero(lens: RadarLens, data: RadarData): HeroData | null {
  const byTraction = [...data.entities].sort((a, b) => b.entity.mentionCount - a.entity.mentionCount);
  const modelsTools = byTraction.filter((e) => e.entity.entityType === "model" || e.entity.entityType === "tool");
  const pool = lens === "builder" ? [...modelsTools, ...byTraction] : byTraction;
  const choice = pool.find((e) => e.latestStory?.imageUrl) ?? pool[0];
  if (!choice) return null;
  const n = choice.entity.mentionCount;
  return {
    eyebrow: lens === "builder" ? "Moving in your world" : lens === "founder" ? "What's moving" : "Big right now",
    name: choice.entity.canonicalName,
    valueLine: choice.valueLine ?? "",
    metric: `${n} ${n === 1 ? "source" : "sources"}`,
    imageUrl: choice.latestStory?.imageUrl ?? null,
    href: choice.latestStory?.sourceUrl ?? null,
  };
}

function buildSections(lens: RadarLens, data: RadarData, heroKey: string | null): SectionData[] {
  const curated = data.essentials.filter((e) => e.source === "curated");
  const canon = data.essentials.filter((e) => e.source === "github");
  const byCat = (cat: string) => curated.filter((e) => e.meta === cat);
  const byTraction = [...data.entities].sort((a, b) => b.entity.mentionCount - a.entity.mentionCount);
  const modelsTools = byTraction.filter((e) => e.entity.entityType === "model" || e.entity.entityType === "tool");
  const dropHero = (rows: RowData[]) => rows.filter((r) => r.key !== heroKey);

  if (lens === "builder") {
    return [
      { key: "stack", eyebrow: "For your stack", sub: "Coding, inference & data tools", variant: "rail", rows: [...byCat("AI coding"), ...byCat("Inference"), ...byCat("Data & RAG"), ...byCat("Agents & automation")].map(essRow) },
      { key: "new", eyebrow: "New tools", sub: "Fresh from GitHub & Product Hunt", variant: "rail", rows: data.tools.slice(0, 10).map(toolRow) },
      { key: "moving", eyebrow: "Models & tools moving", sub: "Gaining traction in AI now", variant: "list", rows: dropHero(modelsTools.slice(0, 10).map(entRow)) },
      { key: "oss", eyebrow: "Popular open-source", sub: "Most-starred, still maintained", variant: "list", rows: canon.slice(0, 8).map(canonRow) },
    ];
  }
  if (lens === "founder") {
    return [
      { key: "moving", eyebrow: "What's moving", sub: "Companies & models gaining traction", variant: "list", rows: dropHero(byTraction.slice(0, 10).map(entRow)) },
      { key: "new", eyebrow: "New launches", sub: "Worth a look", variant: "rail", rows: data.tools.slice(0, 8).map(toolRow) },
      { key: "opinion", eyebrow: "Worth an opinion", sub: "The tools shaping the space", variant: "rail", rows: byCat("Models & chat").map(essRow) },
    ];
  }
  return [
    { key: "start", eyebrow: "Start here", sub: "The AI tools everyone's using", variant: "rail", rows: byCat("Models & chat").map(essRow) },
    { key: "big", eyebrow: "What's big right now", sub: "Most talked-about in AI", variant: "list", rows: dropHero(byTraction.slice(0, 6).map(entRow)) },
    { key: "toolkit", eyebrow: "Build your toolkit", sub: "When you're ready to go deeper", variant: "rail", rows: [...byCat("AI coding"), ...byCat("Inference")].map(essRow) },
    { key: "notable", eyebrow: "New & notable", sub: "Fresh launches", variant: "rail", rows: data.tools.slice(0, 6).map(toolRow) },
  ];
}

// ─── Lens chooser (model B: 2 headline + "Just exploring") ───────────────────
function LensChooser({ onChoose }: { onChoose: (l: RadarLens) => void }) {
  return (
    <div className="scrollbar-none" style={{ height: "100%", overflowY: "auto", background: "#0a0a0a", display: "flex", flexDirection: "column", justifyContent: "center", padding: "32px 24px" }}>
      <h1 style={{ fontFamily: SG, fontSize: "25px", fontWeight: 600, color: "#f5f5f5", margin: 0, letterSpacing: "-0.02em" }}>Tune your radar</h1>
      <p style={{ fontSize: "14px", color: "#737373", margin: "7px 0 26px", lineHeight: 1.5 }}>What brings you to Kapyn? We&apos;ll lead with what matters to you.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {HEADLINE.map(({ id, label, tagline, Icon }) => (
          <button key={id} onClick={() => onChoose(id)} className="lens-option" style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%", textAlign: "left", background: "#111111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "16px 18px", cursor: "pointer" }}>
            <span style={{ flexShrink: 0, width: "42px", height: "42px", borderRadius: "11px", background: GOLD_SOFT, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={20} color={GOLD} strokeWidth={1.8} />
            </span>
            <span>
              <span style={{ display: "block", fontFamily: SG, fontSize: "15px", fontWeight: 600, color: "#ededed" }}>{label}</span>
              <span style={{ display: "block", fontSize: "13px", color: "#737373", marginTop: "2px" }}>{tagline}</span>
            </span>
          </button>
        ))}
      </div>
      <button onClick={() => onChoose("curious")} style={{ marginTop: "22px", alignSelf: "center", display: "inline-flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: "#8a8a8a", fontSize: "13.5px", cursor: "pointer", padding: "8px" }}>
        Just exploring <ArrowUpRight size={14} strokeWidth={2} style={{ transform: "rotate(45deg)" }} />
      </button>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export function RadarClient(data: RadarData) {
  const [lens, setLens] = useState<RadarLens | null>(null);
  const [ready, setReady] = useState(false);
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

  if (!ready) return <div style={{ height: "100%", background: "#0a0a0a" }} />;
  if (!lens) return <LensChooser onChoose={choose} />;

  const hero = pickHero(lens, data);
  const heroKey = hero ? `en-${data.entities.find((e) => e.entity.canonicalName === hero.name)?.entity.id ?? ""}` : null;
  const sections = buildSections(lens, data, heroKey);

  return (
    <div className="scrollbar-none" style={{ position: "relative", height: "100%", overflowY: "auto", background: "#0a0a0a", paddingBottom: "28px" }}>
      {/* Grain overlay */}
      <div aria-hidden style={{ position: "fixed", inset: 0, backgroundImage: GRAIN, opacity: 0.035, mixBlendMode: "overlay", pointerEvents: "none", zIndex: 1 }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Header */}
        <div style={{ padding: "24px 24px 14px" }}>
          <h1 style={{ fontFamily: SG, fontSize: "26px", fontWeight: 600, color: "#f5f5f5", margin: 0, letterSpacing: "-0.03em" }}>Radar</h1>
          <p style={{ fontSize: "13px", color: "#737373", margin: "4px 0 0", lineHeight: 1.5 }}>What is new and worth knowing in AI — tuned to you.</p>
        </div>

        {/* Lens switcher */}
        <div className="scrollbar-none" style={{ display: "flex", gap: "8px", padding: "0 24px 18px", overflowX: "auto" }}>
          {PILLS.map(({ id, label }) => {
            const active = id === lens;
            return (
              <button key={id} onClick={() => choose(id)} style={{ position: "relative", flexShrink: 0, fontFamily: SG, fontSize: "13px", fontWeight: active ? 600 : 500, color: active ? "#0a0a0a" : "#a3a3a3", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "100px", padding: "6px 15px", cursor: "pointer", whiteSpace: "nowrap" }}>
                {active && <motion.span layoutId="lensPill" transition={lensIndicatorSpring} style={{ position: "absolute", inset: 0, background: GOLD, borderRadius: "100px", zIndex: 0 }} />}
                <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Lens content */}
        <AnimatePresence mode="wait">
          <motion.div key={lens} variants={V.block} initial="hidden" animate="show" exit="exit">
            {hero && <motion.div variants={V.hero}><Hero hero={hero} /></motion.div>}
            {sections.map((s) => (
              <motion.div key={s.key} variants={V.item}><Section {...s} /></motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
