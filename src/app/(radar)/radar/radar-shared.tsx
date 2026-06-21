"use client";

import { useRef, useState } from "react";
import { Brain, Wrench, Building2, Lightbulb, Rocket, Code2, Sparkles, type LucideIcon } from "lucide-react";
import { getCategoryBySlug } from "@/lib/categories";
import type { CategorySlug } from "@/lib/types";
import {
  GOLD, GOLD_SOFT, GOLD_BORDER, SG,
  CANVAS, SURFACE, SURFACE_RAISED, HAIRLINE, INNER_HIGHLIGHT, TEXT,
} from "@/lib/design-tokens";

// ─── Tap-vs-scroll guard ─────────────────────────────────────────────────────
// Cards inside a scroll container must open ONLY on a deliberate tap — not when
// a finger brushes them mid-scroll. Records the pointer-down position; fires the
// handler on pointer-up only if the finger barely moved (< ~10px). A scroll
// gesture moves further (or fires pointercancel), so it never triggers. Spread
// the returned props on the element instead of using a bare onClick.
export function usePressTap(handler: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);
  return {
    onPointerDown: (e: React.PointerEvent) => {
      start.current = { x: e.clientX, y: e.clientY };
      moved.current = false;
    },
    onPointerMove: (e: React.PointerEvent) => {
      const s = start.current;
      if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 10) moved.current = true;
    },
    onPointerUp: (e: React.PointerEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      if (!moved.current && Math.hypot(e.clientX - s.x, e.clientY - s.y) < 10) handler();
    },
    onPointerCancel: () => { start.current = null; },
  };
}

// ─── Tokens ──────────────────────────────────────────────────────────────────
// Canonical values live in @/lib/design-tokens (non-client, server-importable).
// Re-exported here so every existing radar import site keeps working unchanged.
export {
  GOLD, GOLD_SOFT, GOLD_BORDER, SG,
  CANVAS, SURFACE, SURFACE_RAISED, HAIRLINE, INNER_HIGHLIGHT, TEXT,
};

// Mobile type scale. One big jump (20px title vs 15px body) IS the hierarchy.
export const TYPE = {
  sectionTitle: { fontFamily: SG, fontSize: "20px", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", color: TEXT.primary },
  sectionKicker: { fontFamily: SG, fontSize: "12px", fontWeight: 700, lineHeight: 1, letterSpacing: "0.06em", textTransform: "uppercase", color: TEXT.muted },
  heroHeadline: { fontFamily: SG, fontSize: "24px", fontWeight: 600, lineHeight: 1.12, letterSpacing: "-0.02em", color: TEXT.primary },
  itemTitle: { fontFamily: SG, fontSize: "16px", fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.01em", color: TEXT.primary },
  body: { fontSize: "15px", fontWeight: 450, lineHeight: 1.45, color: TEXT.body },
  meta: { fontSize: "13px", fontWeight: 500, lineHeight: 1.3, color: TEXT.muted },
} as const;

// ─── Category accent system (mirrors categories.ts — never re-declares hues) ──
// fg = on-dark text/icon (WCAG-safe), bg = fills/tints, ring = borders + glow only.
export interface Accent {
  fg: string;
  bg: string;
  ring: string;
}

const NEUTRAL: Accent = { fg: TEXT.body, bg: "rgba(255,255,255,0.05)", ring: "rgba(255,255,255,0.16)" };

export function accentFor(slug: CategorySlug | string | null | undefined): Accent {
  if (!slug) return NEUTRAL;
  const cat = getCategoryBySlug(slug as CategorySlug);
  if (!cat) return NEUTRAL;
  return { fg: cat.colorLabel, bg: cat.colorBg, ring: cat.colorAccent };
}

// ─── Faces (the icon-fallback layer; color comes from the mapped category) ────
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

// Face → category, so a mark gets a real hue even when no categorySlug is set.
const FACE_CATEGORY: Record<Face, CategorySlug> = {
  model: "ai-models",
  tool: "dev-tools",
  company: "big-tech",
  concept: "research",
  github: "open-source",
  producthunt: "startups",
  essential: "startups",
};

export function accentForFace(face: Face): Accent {
  return accentFor(FACE_CATEGORY[face]);
}

// The mark: a real brand logo on a light chip, or NOTHING. When no logo resolves
// (or it fails to load) we render no mark at all — no monogram, no icon, no box —
// so logo-less cards (e.g. a Product Hunt product with no thumbnail) lead with
// their name instead of a stray letter. Only the colourful real logos remain.
export function FaceMark({
  logoUrl,
  size = 40,
}: {
  // `face`, `category` and `label` are accepted (callers still pass them) but no
  // longer drive any fallback — kept in the type so call sites need no change.
  face?: Face;
  category?: CategorySlug | null;
  logoUrl?: string | null;
  label?: string | null;
  size?: number;
}) {
  const radius = Math.round(size * 0.28);
  const [failed, setFailed] = useState(false);
  const showLogo = !!logoUrl && !failed;
  // No logo → no mark at all (the deliberate "don't keep anything" choice).
  if (!showLogo) return null;
  return (
    <span
      style={{
        flexShrink: 0,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${radius}px`,
        background: "#faf9f7",
        border: "1px solid rgba(0,0,0,0.10)",
        boxShadow: INNER_HIGHLIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl!}
        alt=""
        loading="lazy"
        draggable={false}
        onError={() => setFailed(true)}
        style={{ width: "100%", height: "100%", objectFit: "contain", padding: `${Math.round(size * 0.16)}px`, boxSizing: "border-box" }}
      />
    </span>
  );
}

// Cover image with a category-gradient fallback. Branches on falsy src BEFORE
// mounting an <img> (an empty/null src does not reliably fire onError).
export function CoverImage({
  src,
  category,
  face,
  fallbackIcon,
  height = 180,
  radius = 18,
  style,
}: {
  src?: string | null;
  category?: CategorySlug | null;
  face?: Face;
  // Branded placeholder icon for the null-src state (e.g. Trophy for hackathons)
  // so an image-less cover looks intentional, not broken.
  fallbackIcon?: LucideIcon;
  height?: number;
  radius?: number;
  style?: React.CSSProperties;
}) {
  const accent = category ? accentFor(category) : face ? accentForFace(face) : NEUTRAL;
  const Icon = fallbackIcon ?? (face ? FACE_ICON[face] ?? Sparkles : Sparkles);
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: `${height}px`,
        borderRadius: `${radius}px`,
        overflow: "hidden",
        background: "#0c0c0c",
        ...style,
      }}
    >
      {src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            loading="lazy"
            draggable={false}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.9)" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,8,0.94) 22%, rgba(8,8,8,0.1) 60%, transparent 100%)" }} />
        </>
      ) : (
        <>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 90% at 70% -10%, ${accent.ring}40 0%, ${accent.bg} 45%, #0c0c0c 100%)` }} />
          <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.5 }}>
            <Icon size={Math.round(height * 0.26)} color={accent.fg} strokeWidth={1.4} />
          </span>
        </>
      )}
    </div>
  );
}

// Metric chip. Defaults to a calm grey so star/upvote counts don't compete with
// the colourful real logos on each card; pass a colour to override per-call.
export function MetricChip({ children, color = TEXT.body }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      style={{
        flexShrink: 0,
        fontSize: "12px",
        fontWeight: 600,
        color,
        background: `${color}1f`,
        borderRadius: "100px",
        padding: "3px 9px",
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

// ─── The normalized unit the radar + detail sheet share ──────────────────────
export interface RadarThing {
  id: string; // unique: tool url, or `entity:<id>`
  kind: "tool" | "entity";
  name: string;
  valueLine: string;
  face: Face;
  metric: string | null; // display string e.g. "12 sources" / "1.2k stars · Python"
  typeLabel: string | null; // "GitHub" / "Product Hunt" / "model" / "company"
  category: string | null; // auto-category for save (display bucket)
  url: string | null; // open-site target
  recency: string | null;
  storyTitle: string | null; // entities: the latest story behind it
  storySource: string | null;
  // ── redesign fields (optional; older constructors omit them) ──
  imageUrl?: string | null; // real cover (entities only, from latestStory)
  logoUrl?: string | null; // curated brand logo (rare)
  entityId?: string | null; // raw UUID (stop string-baking into id)
  categorySlug?: CategorySlug | null; // drives the accent
  metricValue?: number | null; // raw number behind `metric`, for count-up
  subtype?: string | null; // "70B · open weights" / "stdio" / "arXiv"
  description?: string | null; // longer body for the detail sheet (e.g. PH description)
  topics?: string[]; // source topics → chips in the detail sheet
}
