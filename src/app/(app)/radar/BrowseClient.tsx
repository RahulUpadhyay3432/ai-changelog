"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, Compass } from "lucide-react";
import posthog from "posthog-js";
import type { RadarTool, RadarItem } from "@/lib/knowledge";
import { FaceMark, MetricChip, GOLD, SG, type RadarThing } from "./radar-shared";
import { toolThing, essThing, canonThing, entThing } from "./radar-map";
import { RadarDetailSheet } from "./RadarDetailSheet";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const TRENDING = "New & trending";

// Preferred section order — fresh launches first, then the knowledge-graph types,
// then curated stacks, then the evergreen canon. Anything else falls to the end.
const ORDER = [
  TRENDING,
  "Models", "Tools", "Companies",
  "Models & chat", "AI coding", "Inference", "Data & RAG", "Agents & automation",
  "Open source", "Concepts",
];
const rank = (cat: string) => {
  const i = ORDER.indexOf(cat);
  return i === -1 ? ORDER.length : i;
};

interface BrowseData {
  tools: RadarTool[];
  entities: RadarItem[];
  essentials: RadarTool[];
}

export function BrowseClient(data: BrowseData) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [detail, setDetail] = useState<RadarThing | null>(null);

  // Everything on the radar, normalized to one shape and de-duped by id.
  const things = useMemo(() => {
    const curated = data.essentials.filter((e) => e.source === "curated").map(essThing);
    const canon = data.essentials.filter((e) => e.source === "github").map(canonThing);
    const raw: RadarThing[] = [
      ...data.entities.map(entThing),
      ...curated,
      ...canon,
      ...data.tools.map(toolThing),
    ];
    const seen = new Set<string>();
    return raw.filter((t) => {
      if (!t.name || seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return things;
    return things.filter(
      (t) => t.name.toLowerCase().includes(q) || t.valueLine.toLowerCase().includes(q)
    );
  }, [things, query]);

  const groups = useMemo(() => {
    const m = new Map<string, RadarThing[]>();
    for (const t of filtered) {
      const c = t.category ?? TRENDING;
      if (!m.has(c)) m.set(c, []);
      m.get(c)!.push(t);
    }
    return [...m.entries()].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b));
  }, [filtered]);

  const open = (t: RadarThing) => {
    setDetail(t);
    posthog.capture("radar_browse_opened", { id: t.id, category: t.category });
  };

  return (
    <div className="scrollbar-none" style={{ position: "relative", height: "100%", overflowY: "auto", background: "#0a0a0a", paddingBottom: "28px" }}>
      <div aria-hidden style={{ position: "fixed", inset: 0, backgroundImage: GRAIN, opacity: 0.035, mixBlendMode: "overlay", pointerEvents: "none", zIndex: 1 }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Header */}
        <div style={{ padding: "24px 24px 14px" }}>
          <span style={{ fontFamily: SG, fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", color: GOLD, textTransform: "uppercase" }}>Kapyn</span>
          <h1 style={{ fontFamily: SG, fontSize: "26px", fontWeight: 600, color: "#f5f5f5", margin: "2px 0 0", letterSpacing: "-0.03em" }}>Browse</h1>
          <p style={{ fontSize: "13px", color: "#737373", margin: "4px 0 0", lineHeight: 1.5 }}>
            Everything on the radar — {things.length} tools, models &amp; companies, by category.
          </p>
        </div>

        {/* Search */}
        <div style={{ padding: "0 24px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px", background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "10px 13px" }}>
            <Search size={16} color="#5c5c5c" strokeWidth={2} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the radar" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#ededed", fontSize: "14px" }} />
          </div>
        </div>

        {groups.length === 0 ? (
          <div style={{ padding: "30px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Compass size={28} color="#3a3a3a" strokeWidth={1.6} style={{ marginBottom: "12px" }} />
            <p style={{ fontSize: "14px", color: "#737373", lineHeight: 1.5, margin: 0, maxWidth: "240px" }}>
              {query ? <>No matches for &ldquo;{query}&rdquo;.</> : <>Nothing on the radar yet. Check back after the next refresh.</>}
            </p>
            {!query && (
              <Link href="/radar" style={{ marginTop: "16px", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: "#0a0a0a", background: GOLD, borderRadius: "12px", padding: "10px 16px", textDecoration: "none" }}>
                Back to Today
              </Link>
            )}
          </div>
        ) : (
          groups.map(([cat, items]) => {
            const isCollapsed = collapsed[cat];
            return (
              <section key={cat} style={{ marginBottom: "22px" }}>
                <button onClick={() => setCollapsed((c) => ({ ...c, [cat]: !c[cat] }))} style={{ display: "flex", alignItems: "center", gap: "6px", width: "100%", background: "none", border: "none", cursor: "pointer", padding: "0 24px", marginBottom: "10px" }}>
                  <ChevronDown size={15} color="#737373" strokeWidth={2.2} style={{ transform: isCollapsed ? "rotate(-90deg)" : "none", transition: "transform 0.15s ease" }} />
                  <span style={{ fontFamily: SG, fontSize: "12px", fontWeight: 600, letterSpacing: "0.03em", color: GOLD }}>{cat}</span>
                  <span style={{ fontSize: "12px", color: "#525252", fontVariantNumeric: "tabular-nums" }}>{items.length}</span>
                </button>
                {!isCollapsed && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    {items.map((t) => (
                      <button key={t.id} onClick={() => open(t)} className="radar-row" style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", textAlign: "left", padding: "13px 24px", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", color: "inherit" }}>
                        <FaceMark face={t.face} />
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: 600, color: "#ededed", letterSpacing: "-0.01em" }}>{t.name}</span>
                          <span style={{ display: "block", fontSize: "14px", color: "#9a9a9a", lineHeight: 1.4, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.valueLine}</span>
                        </span>
                        {t.metric && <MetricChip>{t.metric}</MetricChip>}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>

      <RadarDetailSheet thing={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
