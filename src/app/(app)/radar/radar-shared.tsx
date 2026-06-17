"use client";

import { Brain, Wrench, Building2, Lightbulb, Rocket, Code2, Sparkles, type LucideIcon } from "lucide-react";

// ─── Tokens ──────────────────────────────────────────────────────────────────
export const GOLD = "#E8B25C";
export const GOLD_SOFT = "rgba(232,178,92,0.12)";
export const GOLD_BORDER = "rgba(232,178,92,0.28)";
export const SG = "var(--font-space-grotesk), -apple-system, sans-serif";

// ─── Faces (monochrome type/source icons) ────────────────────────────────────
export type Face = "model" | "tool" | "company" | "concept" | "github" | "producthunt" | "essential";

export const FACE_ICON: Record<Face, LucideIcon> = {
  model: Brain,
  tool: Wrench,
  company: Building2,
  concept: Lightbulb,
  github: Code2,
  producthunt: Rocket,
  essential: Sparkles,
};

export function FaceMark({ face, size = 38 }: { face: Face; size?: number }) {
  const Icon = FACE_ICON[face] ?? Sparkles;
  return (
    <span style={{ flexShrink: 0, width: `${size}px`, height: `${size}px`, borderRadius: `${Math.round(size * 0.26)}px`, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={Math.round(size * 0.47)} color="#9a9a9a" strokeWidth={1.7} />
    </span>
  );
}

export function MetricChip({ children }: { children: React.ReactNode }) {
  return <span style={{ flexShrink: 0, fontSize: "12px", fontWeight: 600, color: GOLD, background: GOLD_SOFT, borderRadius: "100px", padding: "3px 9px", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{children}</span>;
}

// ─── The normalized unit the radar + detail sheet share ──────────────────────
export interface RadarThing {
  id: string; // unique: tool url, or `entity:<id>`
  kind: "tool" | "entity";
  name: string;
  valueLine: string;
  face: Face;
  metric: string | null; // "12 sources" / "1.2k stars · Python"
  typeLabel: string | null; // "GitHub" / "Product Hunt" / "model" / "company"
  category: string | null; // auto-category for save
  url: string | null; // open-site target
  recency: string | null;
  storyTitle: string | null; // entities: the latest story behind it
  storySource: string | null;
}
