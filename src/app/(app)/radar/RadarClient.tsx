"use client";

import { useEffect, useState } from "react";
import { Cpu, Briefcase, Compass, type LucideIcon } from "lucide-react";
import posthog from "posthog-js";
import { getRadarLens, setRadarLens, type RadarLens } from "@/lib/storage";
import type { RadarTool, RadarItem } from "@/lib/knowledge";

interface RadarData {
  tools: RadarTool[];
  entities: RadarItem[];
  essentials: RadarTool[];
}

const LENSES: { id: RadarLens; label: string; tagline: string; Icon: LucideIcon }[] = [
  { id: "builder", label: "Builder", tagline: "I build with AI", Icon: Cpu },
  { id: "founder", label: "Founder / Operator", tagline: "I run a product or business", Icon: Briefcase },
  { id: "curious", label: "Curious", tagline: "I want to understand AI", Icon: Compass },
];

// ─── Row + Section ───────────────────────────────────────────────────────────
interface RowData {
  key: string;
  name: string;
  valueLine: string;
  meta?: string | null;
  badge?: string | null;
  href?: string | null;
}

const panel: React.CSSProperties = {
  background: "#111111",
  borderTop: "1px solid rgba(255,255,255,0.04)",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};

function Row({ name, valueLine, meta, badge, href }: Omit<RowData, "key">) {
  const inner = (
    <>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "10px" }}>
        <span style={{ fontSize: "15px", fontWeight: 600, color: "#ededed", letterSpacing: "-0.01em" }}>{name}</span>
        {badge && (
          <span style={{ flexShrink: 0, fontSize: "10px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#737373", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "100px", padding: "2px 8px" }}>
            {badge}
          </span>
        )}
      </div>
      <p style={{ fontSize: "14px", color: "#9a9a9a", lineHeight: 1.5, margin: "4px 0 0" }}>{valueLine}</p>
      {meta && <span style={{ display: "block", fontSize: "11px", color: "#525252", marginTop: "6px", fontVariantNumeric: "tabular-nums" }}>{meta}</span>}
    </>
  );
  const style: React.CSSProperties = { display: "block", padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", textDecoration: "none", color: "inherit" };
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" style={style} className="radar-row">{inner}</a>
  ) : (
    <div style={style}>{inner}</div>
  );
}

interface SectionData { label: string; sub: string; rows: RowData[] }

function Section({ label, sub, rows }: SectionData) {
  if (rows.length === 0) return null;
  return (
    <section style={{ marginBottom: "28px" }}>
      <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#525252", margin: "0 0 2px", padding: "0 24px" }}>{label}</p>
      <p style={{ fontSize: "12px", color: "#404040", margin: "0 0 10px", padding: "0 24px" }}>{sub}</p>
      <div style={panel}>{rows.map(({ key, ...rest }) => <Row key={key} {...rest} />)}</div>
    </section>
  );
}

// ─── Mappers ─────────────────────────────────────────────────────────────────
function toolRow(t: RadarTool): RowData {
  const badge = t.source === "github" ? "GitHub" : t.source === "producthunt" ? "Product Hunt" : null;
  return { key: `t-${t.url}`, name: t.name, valueLine: t.valueLine, badge, meta: t.meta, href: t.url };
}
function essRow(t: RadarTool): RowData {
  return { key: `e-${t.url}`, name: t.name, valueLine: t.valueLine, href: t.url };
}
function canonRow(t: RadarTool): RowData {
  return { key: `c-${t.url}`, name: t.name, valueLine: t.valueLine, meta: t.meta, href: t.url };
}
function entRow(e: RadarItem): RowData {
  return {
    key: `en-${e.entity.id}`,
    name: e.entity.canonicalName,
    valueLine: e.valueLine ?? "",
    badge: e.entity.entityType,
    meta: `${e.entity.mentionCount} ${e.entity.mentionCount === 1 ? "source" : "sources"}`,
    href: e.latestStory?.sourceUrl,
  };
}

// ─── Per-lens arrangement ────────────────────────────────────────────────────
function buildSections(lens: RadarLens, data: RadarData): SectionData[] {
  const curated = data.essentials.filter((e) => e.source === "curated");
  const canon = data.essentials.filter((e) => e.source === "github");
  const byCat = (cat: string) => curated.filter((e) => e.meta === cat);
  const entModelsTools = data.entities.filter((e) => e.entity.entityType === "model" || e.entity.entityType === "tool");
  const byTraction = [...data.entities].sort((a, b) => b.entity.mentionCount - a.entity.mentionCount);

  if (lens === "builder") {
    return [
      { label: "New tools", sub: "Fresh from GitHub & Product Hunt", rows: data.tools.slice(0, 8).map(toolRow) },
      { label: "For your stack", sub: "Coding, inference & data tools", rows: [...byCat("AI coding"), ...byCat("Inference"), ...byCat("Data & RAG"), ...byCat("Agents & automation")].map(essRow) },
      { label: "Models & tools moving", sub: "Gaining traction in AI now", rows: entModelsTools.slice(0, 10).map(entRow) },
      { label: "Popular open-source", sub: "Most-starred, still maintained", rows: canon.slice(0, 8).map(canonRow) },
    ];
  }
  if (lens === "founder") {
    return [
      { label: "What's moving", sub: "Companies & models gaining traction", rows: byTraction.slice(0, 10).map(entRow) },
      { label: "New launches", sub: "Worth a look", rows: data.tools.slice(0, 6).map(toolRow) },
      { label: "Worth an opinion", sub: "The tools shaping the space", rows: byCat("Models & chat").map(essRow) },
    ];
  }
  // curious
  return [
    { label: "Start here", sub: "The AI tools everyone's using", rows: byCat("Models & chat").map(essRow) },
    { label: "What's big right now", sub: "Most talked-about in AI", rows: byTraction.slice(0, 6).map(entRow) },
    { label: "Build your toolkit", sub: "When you're ready to go deeper", rows: [...byCat("AI coding"), ...byCat("Inference")].map(essRow) },
    { label: "New & notable", sub: "Fresh launches", rows: data.tools.slice(0, 5).map(toolRow) },
  ];
}

// ─── Lens chooser (first run) ────────────────────────────────────────────────
function LensChooser({ onChoose }: { onChoose: (l: RadarLens) => void }) {
  return (
    <div className="scrollbar-none" style={{ height: "100%", overflowY: "auto", background: "#0a0a0a", display: "flex", flexDirection: "column", justifyContent: "center", padding: "32px 24px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#f5f5f5", margin: 0, letterSpacing: "-0.02em" }}>Tune your radar</h1>
      <p style={{ fontSize: "14px", color: "#737373", margin: "6px 0 24px", lineHeight: 1.5 }}>
        What brings you to Kapyn? We&apos;ll lead with what matters to you.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {LENSES.map(({ id, label, tagline, Icon }) => (
          <button
            key={id}
            onClick={() => onChoose(id)}
            className="lens-option"
            style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%", textAlign: "left", background: "#111111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "16px 18px", cursor: "pointer" }}
          >
            <span style={{ flexShrink: 0, width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={20} color="#d4d4d4" strokeWidth={1.8} />
            </span>
            <span>
              <span style={{ display: "block", fontSize: "15px", fontWeight: 600, color: "#ededed" }}>{label}</span>
              <span style={{ display: "block", fontSize: "13px", color: "#737373", marginTop: "1px" }}>{tagline}</span>
            </span>
          </button>
        ))}
      </div>
      <button onClick={() => onChoose("builder")} style={{ marginTop: "20px", background: "none", border: "none", color: "#525252", fontSize: "13px", cursor: "pointer", padding: "8px" }}>
        Skip for now
      </button>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export function RadarClient(data: RadarData) {
  const [lens, setLens] = useState<RadarLens | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // ?lens= deep-link override (also persists the choice) — lets you share a
    // specific lens, and falls back to the stored one otherwise.
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

  const sections = buildSections(lens, data);

  return (
    <div className="scrollbar-none" style={{ height: "100%", overflowY: "auto", background: "#0a0a0a", paddingBottom: "24px" }}>
      {/* Header */}
      <div style={{ padding: "24px 24px 14px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#f5f5f5", margin: 0, letterSpacing: "-0.03em" }}>Radar</h1>
        <p style={{ fontSize: "13px", color: "#737373", margin: "4px 0 0", lineHeight: 1.5 }}>
          What is new and worth knowing in AI — tuned to you.
        </p>
      </div>

      {/* Lens switcher */}
      <div className="scrollbar-none" style={{ display: "flex", gap: "8px", padding: "0 24px 18px", overflowX: "auto" }}>
        {LENSES.map(({ id, label }) => {
          const active = id === lens;
          return (
            <button
              key={id}
              onClick={() => choose(id)}
              style={{ flexShrink: 0, fontSize: "13px", fontWeight: active ? 600 : 500, color: active ? "#0a0a0a" : "#a3a3a3", background: active ? "#ededed" : "rgba(255,255,255,0.04)", border: active ? "1px solid #ededed" : "1px solid rgba(255,255,255,0.08)", borderRadius: "100px", padding: "6px 14px", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {sections.map((s) => <Section key={s.label} {...s} />)}
    </div>
  );
}
