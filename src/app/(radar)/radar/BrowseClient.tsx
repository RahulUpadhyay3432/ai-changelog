"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, Compass, Plug, ArrowUpRight } from "lucide-react";
import posthog from "posthog-js";
import type { RadarTool, RadarItem } from "@/lib/knowledge";
import type { CategorySlug } from "@/lib/types";
import {
  FaceMark, MetricChip,
  GOLD, GOLD_SOFT, CANVAS, SURFACE, HAIRLINE, INNER_HIGHLIGHT, SG, TEXT,
  type RadarThing,
} from "./radar-shared";
import { toolThing, essThing, canonThing, entThing, categoryEmoji } from "./radar-map";
import { RadarDetailSheet } from "./RadarDetailSheet";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const ALL = "All";
const TRENDING = "New & trending";

// Preferred chip / group order.
const ORDER = [
  TRENDING,
  "Models", "Tools", "Companies",
  "Models & chat", "AI coding", "UI & design", "Agents & automation", "Orchestration",
  "Inference", "Data & RAG", "Security", "Eval & observability",
  "Video", "Voice & audio", "Image", "Marketing & content",
  "AI / Models", "Dev tools",
  "New on GitHub", "New on Product Hunt",
  "Open source", "Concepts",
];
const rank = (cat: string) => { const i = ORDER.indexOf(cat); return i === -1 ? ORDER.length : i; };

// Category display label → nearest CategorySlug for the card cover accent.
const CAT_SLUG: Record<string, CategorySlug | null> = {
  "Models": "ai-models", "Tools": "dev-tools", "Companies": "big-tech",
  "Models & chat": "ai-models", "AI coding": "dev-tools", "Inference": "infrastructure",
  "Data & RAG": "infrastructure", "Agents & automation": "ai-models",
  "UI & design": "dev-tools", "Orchestration": "ai-models", "Security": "infrastructure",
  "Eval & observability": "infrastructure",
  "Video": "ai-models", "Voice & audio": "ai-models", "Image": "ai-models",
  "Marketing & content": "startups",
  "AI / Models": "ai-models", "Dev tools": "dev-tools",
  "New on GitHub": "open-source", "New on Product Hunt": "startups",
  "Open source": "open-source", "Concepts": "research",
};

interface BrowseData {
  tools: RadarTool[];
  entities: RadarItem[];
  essentials: RadarTool[];
}

const PRESS = { type: "spring" as const, stiffness: 440, damping: 28 };

// ─── Logo-led card (matches the MCP / Skills cards — real brand logo, no stock
//     covers). FaceMark renders the brand logo on a light chip, or nothing when
//     none resolves; the type tag stays right-aligned either way. ────────────────
function BrowseCard({ thing, catSlug, onOpen }: { thing: RadarThing; catSlug: CategorySlug | null; onOpen: (t: RadarThing) => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={PRESS}
      onClick={() => onOpen(thing)}
      style={{
        display: "flex", flexDirection: "column", textAlign: "left",
        background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "16px",
        padding: "13px", cursor: "pointer", color: "inherit", boxShadow: INNER_HIGHLIGHT,
        minWidth: 0, width: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "9px", minHeight: "20px" }}>
        <FaceMark face={thing.face} category={thing.categorySlug ?? catSlug} logoUrl={thing.logoUrl} label={thing.name} size={36} />
        {thing.typeLabel && (
          <span style={{ marginLeft: "auto", fontSize: "10px", fontWeight: 600, letterSpacing: "0.03em", color: TEXT.muted, background: "rgba(255,255,255,0.05)", border: `1px solid ${HAIRLINE}`, borderRadius: "100px", padding: "2px 8px", whiteSpace: "nowrap" }}>{thing.typeLabel}</span>
        )}
      </div>
      <span style={{ display: "block", fontSize: "14.5px", fontWeight: 600, color: "#ededed", letterSpacing: "-0.01em", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{thing.name}</span>
      <span style={{ fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.4, marginTop: "3px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "35px" }}>{thing.valueLine}</span>
      {thing.metric && <span style={{ display: "block", marginTop: "9px" }}><MetricChip>{thing.metric}</MetricChip></span>}
    </motion.button>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export function BrowseClient(data: BrowseData) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>(ALL);
  const [detail, setDetail] = useState<RadarThing | null>(null);

  const things = useMemo(() => {
    const curated = data.essentials.filter((e) => e.source === "curated").map(essThing);
    const canon = data.essentials.filter((e) => e.source === "github").map(canonThing);
    const raw: RadarThing[] = [
      ...data.entities.map(entThing),
      ...curated, ...canon,
      ...data.tools.map(toolThing),
    ];
    const seen = new Set<string>();
    return raw.filter((t) => { if (!t.name || seen.has(t.id)) return false; seen.add(t.id); return true; });
  }, [data]);

  // Ordered category groups.
  const groups = useMemo(() => {
    const m = new Map<string, RadarThing[]>();
    for (const t of things) {
      const c = t.category ?? TRENDING;
      if (!m.has(c)) m.set(c, []);
      m.get(c)!.push(t);
    }
    return [...m.entries()].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b));
  }, [things]);

  const chips = useMemo(
    () => [{ key: ALL, count: things.length }, ...groups.map(([cat, items]) => ({ key: cat, count: items.length }))],
    [things, groups],
  );

  // What renders in the grid: search > active category > everything.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) return things.filter((t) => t.name.toLowerCase().includes(q) || t.valueLine.toLowerCase().includes(q));
    if (activeCat === ALL) return groups.flatMap(([, items]) => items);
    return groups.find(([c]) => c === activeCat)?.[1] ?? [];
  }, [things, groups, query, activeCat]);

  const open = (t: RadarThing) => {
    setDetail(t);
    posthog.capture("radar_browse_opened", { id: t.id, category: t.category });
  };

  return (
    <div className="scrollbar-none" style={{ position: "relative", height: "100%", overflowY: "auto", overflowX: "hidden", background: CANVAS, paddingBottom: "28px" }}>
      <div aria-hidden style={{ position: "fixed", inset: 0, backgroundImage: GRAIN, opacity: 0.035, mixBlendMode: "overlay", pointerEvents: "none", zIndex: 1 }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Header */}
        <div style={{ padding: "26px 24px 14px" }}>
          <h1 style={{ fontFamily: SG, fontSize: "32px", fontWeight: 700, color: TEXT.primary, margin: 0, letterSpacing: "-0.035em", lineHeight: 1.02 }}>Explore the radar</h1>
          <p style={{ fontSize: "15px", color: TEXT.body, margin: "8px 0 0", lineHeight: 1.45, maxWidth: "300px" }}>
            Every tool, model and company in one place.
          </p>
        </div>

        {/* MCP market entry */}
        <Link href="/radar/mcp" onClick={() => posthog.capture("radar_browse_mcp_tapped")} style={{ display: "flex", alignItems: "center", gap: "12px", margin: "0 24px 14px", padding: "13px 14px", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "14px", textDecoration: "none", color: "inherit", boxShadow: INNER_HIGHLIGHT }}>
          <span style={{ flexShrink: 0, width: "38px", height: "38px", borderRadius: "10px", background: GOLD_SOFT, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plug size={18} color={GOLD} strokeWidth={2} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontFamily: SG, fontSize: "15px", fontWeight: 700, color: TEXT.primary }}>MCP and skills</span>
            <span style={{ display: "block", fontSize: "12.5px", color: TEXT.muted, marginTop: "1px" }}>Top MCP servers and AI skills</span>
          </span>
          <ArrowUpRight size={17} color={TEXT.muted} strokeWidth={2} />
        </Link>

        {/* Search — secondary ghost pill */}
        <div style={{ padding: "0 24px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px", background: "rgba(255,255,255,0.04)", border: `1px solid ${HAIRLINE}`, borderRadius: "12px", padding: "9px 13px" }}>
            <Search size={15} color="#5c5c5c" strokeWidth={2} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the radar"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#ededed", fontSize: "14px" }}
            />
          </div>
        </div>

        {/* Sticky category chips — the persistent nav */}
        <div
          className="scrollbar-none"
          style={{ position: "sticky", top: 0, zIndex: 4, display: "grid", gridAutoFlow: "column", gridTemplateRows: "auto auto", gridAutoColumns: "max-content", gap: "8px", padding: "8px 20px 12px", overflowX: "auto", background: `linear-gradient(to bottom, ${CANVAS} 75%, transparent)` }}
        >
          {chips.map((c) => {
            const active = c.key === activeCat && !query;
            const emoji = c.key === ALL ? "🧭" : categoryEmoji(c.key);
            return (
              <button
                key={c.key}
                onClick={() => { setActiveCat(c.key); setQuery(""); posthog.capture("radar_browse_category_tapped", { category: c.key, count: c.count }); }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  fontFamily: SG, fontSize: "13px", fontWeight: active ? 700 : 500,
                  color: active ? "#ffffff" : TEXT.body,
                  background: active ? GOLD : "rgba(255,255,255,0.05)",
                  border: `1px solid ${active ? GOLD : HAIRLINE}`,
                  borderRadius: "100px", padding: "7px 14px", cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                <span style={{ fontSize: "13px" }}>{emoji}</span>
                {c.key}
                <span style={{ fontSize: "11px", opacity: 0.65, fontVariantNumeric: "tabular-nums" }}>{c.count}</span>
              </button>
            );
          })}
        </div>

        {/* Card grid */}
        {visible.length === 0 ? (
          <div style={{ padding: "40px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Compass size={28} color="#3a3a3a" strokeWidth={1.6} style={{ marginBottom: "12px" }} />
            <p style={{ fontSize: "14px", color: "#737373", lineHeight: 1.5, margin: 0, maxWidth: "240px" }}>
              {query ? <>No matches for &ldquo;{query}&rdquo;.</> : <>Nothing on the radar yet. Check back after the next refresh.</>}
            </p>
            {!query && (
              <Link href="/radar" style={{ marginTop: "16px", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: "#ffffff", background: GOLD, borderRadius: "12px", padding: "10px 16px", textDecoration: "none" }}>
                Back to Today
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "4px 20px 16px" }}>
            {visible.map((t) => (
              <BrowseCard key={t.id} thing={t} catSlug={CAT_SLUG[t.category ?? ""] ?? null} onOpen={open} />
            ))}
          </div>
        )}
      </div>

      <RadarDetailSheet thing={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
