"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, ChevronLeft, Compass } from "lucide-react";
import posthog from "posthog-js";
import type { RadarTool, RadarItem } from "@/lib/knowledge";
import type { CategorySlug } from "@/lib/types";
import {
  FaceMark, MetricChip,
  accentFor, GOLD, GOLD_SOFT, GOLD_BORDER, INNER_HIGHLIGHT, SG, TEXT,
  type RadarThing,
} from "./radar-shared";
import { toolThing, essThing, canonThing, entThing } from "./radar-map";
import { RadarDetailSheet } from "./RadarDetailSheet";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const TRENDING = "New & trending";

// Preferred section order in the bento grid.
const ORDER = [
  TRENDING,
  "Models", "Tools", "Companies",
  "Models & chat", "AI coding", "Inference", "Data & RAG", "Agents & automation",
  "Open source", "Concepts",
];
const rank = (cat: string) => { const i = ORDER.indexOf(cat); return i === -1 ? ORDER.length : i; };

// Category display label → nearest CategorySlug for color accents.
const CAT_SLUG: Record<string, CategorySlug | null> = {
  [TRENDING]: null,
  "Models": "ai-models",
  "Tools": "dev-tools",
  "Companies": "big-tech",
  "Models & chat": "ai-models",
  "AI coding": "dev-tools",
  "Inference": "infrastructure",
  "Data & RAG": "infrastructure",
  "Agents & automation": "ai-models",
  "Open source": "open-source",
  "Concepts": "research",
};

interface BrowseData {
  tools: RadarTool[];
  entities: RadarItem[];
  essentials: RadarTool[];
}

// ─── Bento tile ──────────────────────────────────────────────────────────────
function BentoTile({
  cat, items, wide, onSelect,
}: {
  cat: string; items: RadarThing[]; wide: boolean; onSelect: () => void;
}) {
  const slug = CAT_SLUG[cat] ?? null;
  const accent = slug ? accentFor(slug) : { fg: GOLD, bg: GOLD_SOFT, ring: GOLD_BORDER };
  const samples = items.slice(0, 2).map((t) => t.name);
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 440, damping: 28 }}
      onClick={onSelect}
      style={{
        gridColumn: wide ? "span 2" : "span 1",
        display: "flex", flexDirection: "column", textAlign: "left",
        background: accent.bg, border: `1px solid ${accent.ring}44`,
        borderRadius: "18px", padding: "18px 18px 16px",
        cursor: "pointer", color: "inherit", width: "100%",
        boxShadow: INNER_HIGHLIGHT,
      }}
    >
      <span style={{ fontFamily: SG, fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: accent.fg, lineHeight: 1 }}>{cat}</span>
      <span style={{ fontFamily: SG, fontSize: "30px", fontWeight: 700, letterSpacing: "-0.03em", color: TEXT.primary, marginTop: "10px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{items.length}</span>
      <div style={{ marginTop: "10px" }}>
        {samples.map((name, i) => (
          <span key={i} style={{ display: "block", fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
        ))}
      </div>
    </motion.button>
  );
}

// ─── Item row (reused in drill-down + search results) ────────────────────────
function ItemRow({ thing, onOpen }: { thing: RadarThing; onOpen: (t: RadarThing) => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.975 }}
      transition={{ type: "spring", stiffness: 440, damping: 28 }}
      onClick={() => onOpen(thing)}
      className="radar-row"
      style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", textAlign: "left", padding: "13px 24px", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", color: "inherit" }}
    >
      <FaceMark face={thing.face} category={thing.categorySlug} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: "15px", fontWeight: 600, color: "#ededed", letterSpacing: "-0.01em" }}>{thing.name}</span>
        <span style={{ display: "block", fontSize: "14px", color: "#9a9a9a", lineHeight: 1.4, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{thing.valueLine}</span>
      </span>
      {thing.metric && <MetricChip>{thing.metric}</MetricChip>}
    </motion.button>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export function BrowseClient(data: BrowseData) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
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

  const groups = useMemo(() => {
    const m = new Map<string, RadarThing[]>();
    for (const t of things) {
      const c = t.category ?? TRENDING;
      if (!m.has(c)) m.set(c, []);
      m.get(c)!.push(t);
    }
    return [...m.entries()].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b));
  }, [things]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return things.filter((t) => t.name.toLowerCase().includes(q) || t.valueLine.toLowerCase().includes(q));
  }, [things, query]);

  const open = (t: RadarThing) => {
    setDetail(t);
    posthog.capture("radar_browse_opened", { id: t.id, category: t.category });
  };

  // Largest group gets the wide (2-col-span) tile.
  const wideGroup = useMemo(() => groups.reduce((best, [cat, items]) => items.length > (best[1].length ?? 0) ? [cat, items] : best, groups[0])?.[0] ?? null, [groups]);

  const drillItems = activeCategory ? (groups.find(([c]) => c === activeCategory)?.[1] ?? []) : [];

  return (
    <div className="scrollbar-none" style={{ position: "relative", height: "100%", overflowY: "auto", background: "#0a0a0a", paddingBottom: "28px" }}>
      <div aria-hidden style={{ position: "fixed", inset: 0, backgroundImage: GRAIN, opacity: 0.035, mixBlendMode: "overlay", pointerEvents: "none", zIndex: 1 }} />

      <div style={{ position: "relative", zIndex: 2 }}>

        {/* ── Drill-down: category selected ──────────────────────────────── */}
        {activeCategory && !searchResults ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "20px 20px 10px" }}>
              <button
                onClick={() => setActiveCategory(null)}
                style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", color: TEXT.muted, fontSize: "14px", padding: "4px 0" }}
              >
                <ChevronLeft size={18} strokeWidth={2} /> Browse
              </button>
            </div>
            <div style={{ padding: "0 24px 18px" }}>
              {(() => {
                const slug = CAT_SLUG[activeCategory] ?? null;
                const accent = slug ? accentFor(slug) : { fg: GOLD, bg: GOLD_SOFT, ring: GOLD_BORDER };
                return (
                  <>
                    <span style={{ fontFamily: SG, fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: accent.fg }}>{activeCategory}</span>
                    <h2 style={{ fontFamily: SG, fontSize: "24px", fontWeight: 600, color: TEXT.primary, margin: "4px 0 0", letterSpacing: "-0.02em" }}>
                      {drillItems.length} {drillItems.length === 1 ? "item" : "items"}
                    </h2>
                  </>
                );
              })()}
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {drillItems.map((t) => <ItemRow key={t.id} thing={t} onOpen={open} />)}
            </div>
          </>
        ) : (
          <>
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div style={{ padding: "24px 24px 12px" }}>
              <span style={{ fontFamily: SG, fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", color: GOLD, textTransform: "uppercase" }}>Kapyn</span>
              <h1 style={{ fontFamily: SG, fontSize: "26px", fontWeight: 600, color: "#f5f5f5", margin: "2px 0 0", letterSpacing: "-0.03em" }}>Browse</h1>
              <p style={{ fontSize: "13px", color: "#737373", margin: "4px 0 0", lineHeight: 1.5 }}>
                {things.length} tools, models &amp; companies — pick a category.
              </p>
            </div>

            {/* ── Search (ghost pill — secondary to the bento) ───────────── */}
            <div style={{ padding: "0 24px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "9px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "9px 13px" }}>
                <Search size={15} color="#5c5c5c" strokeWidth={2} />
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setActiveCategory(null); }}
                  placeholder="Search the radar"
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#ededed", fontSize: "14px" }}
                />
              </div>
            </div>

            {/* ── Search results ─────────────────────────────────────────── */}
            {searchResults ? (
              searchResults.length === 0 ? (
                <div style={{ padding: "30px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Compass size={28} color="#3a3a3a" strokeWidth={1.6} style={{ marginBottom: "12px" }} />
                  <p style={{ fontSize: "14px", color: "#737373", lineHeight: 1.5, margin: 0, maxWidth: "240px" }}>
                    No matches for &ldquo;{query}&rdquo;.
                  </p>
                </div>
              ) : (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  {searchResults.map((t) => <ItemRow key={t.id} thing={t} onOpen={open} />)}
                </div>
              )
            ) : (
              /* ── Category bento grid ─────────────────────────────────── */
              groups.length === 0 ? (
                <div style={{ padding: "30px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Compass size={28} color="#3a3a3a" strokeWidth={1.6} style={{ marginBottom: "12px" }} />
                  <p style={{ fontSize: "14px", color: "#737373", lineHeight: 1.5, margin: 0, maxWidth: "240px" }}>
                    Nothing on the radar yet. Check back after the next refresh.
                  </p>
                  <Link href="/radar" style={{ marginTop: "16px", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: "#0a0a0a", background: GOLD, borderRadius: "12px", padding: "10px 16px", textDecoration: "none" }}>
                    Back to Today
                  </Link>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "0 20px" }}>
                  {groups.map(([cat, items]) => (
                    <BentoTile
                      key={cat}
                      cat={cat}
                      items={items}
                      wide={cat === wideGroup}
                      onSelect={() => {
                        setActiveCategory(cat);
                        posthog.capture("radar_browse_category_tapped", { category: cat, count: items.length });
                      }}
                    />
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>

      <RadarDetailSheet thing={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
