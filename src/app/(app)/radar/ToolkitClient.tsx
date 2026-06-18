"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Copy, ChevronDown, Bookmark, ArrowRight, Share2 } from "lucide-react";
import posthog from "posthog-js";
import { getSavedRadarTools, type SavedRadarTool } from "@/lib/storage";
import { FaceMark, GOLD, GOLD_SOFT, SG, type Face, type RadarThing } from "./radar-shared";
import { RadarDetailSheet } from "./RadarDetailSheet";

function toThing(s: SavedRadarTool): RadarThing {
  return {
    id: s.id, kind: s.id.startsWith("entity:") ? "entity" : "tool",
    name: s.name, valueLine: s.valueLine, face: (s.face as Face) ?? "essential",
    metric: null, typeLabel: null, category: s.category, url: s.url,
    recency: null, storyTitle: null, storySource: null,
  };
}

function copyLine(s: SavedRadarTool): string {
  return `${s.name} — ${s.valueLine}${s.url ? ` ${s.url}` : ""}`;
}

export function ToolkitClient() {
  const [saved, setSaved] = useState<SavedRadarTool[]>([]);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [detail, setDetail] = useState<RadarThing | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(() => setSaved(getSavedRadarTools()), []);
  useEffect(() => { refresh(); }, [refresh]);

  const flash = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 1600); };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return saved;
    return saved.filter((s) => s.name.toLowerCase().includes(q) || s.valueLine.toLowerCase().includes(q));
  }, [saved, query]);

  const groups = useMemo(() => {
    const m = new Map<string, SavedRadarTool[]>();
    for (const s of filtered) {
      const c = s.category ?? "Saved";
      if (!m.has(c)) m.set(c, []);
      m.get(c)!.push(s);
    }
    return [...m.entries()];
  }, [filtered]);

  const copyOne = async (s: SavedRadarTool) => {
    try { await navigator.clipboard.writeText(`${copyLine(s)} (via Kapyn Radar)`); flash("Copied"); } catch { flash("Couldn't copy"); }
  };
  const shareAll = async () => {
    const lines = saved.map(copyLine).join("\n");
    const text = `My AI toolkit via Kapyn Radar:\n\n${lines}\n\nkapyn.app/radar/toolkit`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text });
        posthog.capture("radar_toolkit_share", { channel: "system", count: saved.length, scope: "all" });
      } catch { /* user cancelled */ }
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    posthog.capture("radar_toolkit_share", { channel: "whatsapp", count: saved.length, scope: "all" });
  };

  const copyGroup = async (cat: string, items: SavedRadarTool[]) => {
    try {
      await navigator.clipboard.writeText(`${cat} — via Kapyn Radar\n\n${items.map(copyLine).join("\n")}`);
      flash(`Copied ${items.length}`);
      posthog.capture("radar_toolkit_copy_group", { category: cat, count: items.length });
    } catch { flash("Couldn't copy"); }
  };

  const empty = saved.length === 0;

  return (
    <div className="scrollbar-none" style={{ position: "relative", height: "100%", overflowY: "auto", background: "#0a0a0a", paddingBottom: "28px" }}>
      {/* Header */}
      <div style={{ padding: "24px 24px 14px" }}>
        <span style={{ fontFamily: SG, fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", color: GOLD, textTransform: "uppercase" }}>Kapyn</span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2px" }}>
          <h1 style={{ fontFamily: SG, fontSize: "26px", fontWeight: 600, color: "#f5f5f5", margin: 0, letterSpacing: "-0.03em" }}>Toolkit</h1>
          {!empty && (
            <button onClick={shareAll} aria-label="Share toolkit" style={{ width: "38px", height: "38px", borderRadius: "100px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Share2 size={17} color="#a3a3a3" strokeWidth={1.8} />
            </button>
          )}
        </div>
        <p style={{ fontSize: "13px", color: "#737373", margin: "4px 0 0", lineHeight: 1.5 }}>
          {empty ? "Your saved AI tools, filed by category." : `${saved.length} saved · filed by category.`}
        </p>
      </div>

      {empty ? (
        <div style={{ padding: "40px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ width: "56px", height: "56px", borderRadius: "16px", background: GOLD_SOFT, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
            <Bookmark size={24} color={GOLD} strokeWidth={1.8} />
          </span>
          <p style={{ fontSize: "15px", color: "#c9c5bf", lineHeight: 1.5, margin: "0 0 6px", maxWidth: "260px" }}>Build your toolkit</p>
          <p style={{ fontSize: "13.5px", color: "#737373", lineHeight: 1.5, margin: "0 0 20px", maxWidth: "280px" }}>Tap any tool on Today and hit Save. It files itself by category — so you never lose the one that mattered.</p>
          <Link href="/radar" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: "#0a0a0a", background: GOLD, borderRadius: "12px", padding: "11px 18px", textDecoration: "none" }}>
            Browse Today <ArrowRight size={16} strokeWidth={2.3} />
          </Link>
        </div>
      ) : (
        <>
          {/* Search */}
          <div style={{ padding: "0 24px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "10px 13px" }}>
              <Search size={16} color="#5c5c5c" strokeWidth={2} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter your toolkit" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#ededed", fontSize: "14px" }} />
            </div>
          </div>

          {groups.length === 0 && (
            <p style={{ padding: "0 24px", color: "#5c5c5c", fontSize: "14px" }}>No matches for &ldquo;{query}&rdquo;.</p>
          )}

          {groups.map(([cat, items]) => {
            const isCollapsed = collapsed[cat];
            return (
              <section key={cat} style={{ marginBottom: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", marginBottom: "10px" }}>
                  <button onClick={() => setCollapsed((c) => ({ ...c, [cat]: !c[cat] }))} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <ChevronDown size={15} color="#737373" strokeWidth={2.2} style={{ transform: isCollapsed ? "rotate(-90deg)" : "none", transition: "transform 0.15s ease" }} />
                    <span style={{ fontFamily: SG, fontSize: "12px", fontWeight: 600, letterSpacing: "0.03em", color: GOLD }}>{cat}</span>
                    <span style={{ fontSize: "12px", color: "#525252", fontVariantNumeric: "tabular-nums" }}>{items.length}</span>
                  </button>
                  <button onClick={() => copyGroup(cat, items)} aria-label={`Copy all ${cat}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", color: "#737373", fontSize: "12px", fontWeight: 500, padding: "2px 4px" }}>
                    <Copy size={13} strokeWidth={2} /> Copy all
                  </button>
                </div>
                {!isCollapsed && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    {items.map((s) => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <button onClick={() => setDetail(toThing(s))} className="radar-row" style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "12px", background: "transparent", border: "none", textAlign: "left", cursor: "pointer", padding: 0, color: "inherit" }}>
                          <FaceMark face={(s.face as Face) ?? "essential"} size={34} />
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ display: "block", fontSize: "15px", fontWeight: 600, color: "#ededed", letterSpacing: "-0.01em" }}>{s.name}</span>
                            <span style={{ display: "block", fontSize: "13.5px", color: "#9a9a9a", lineHeight: 1.4, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.valueLine}</span>
                          </span>
                        </button>
                        <button onClick={() => copyOne(s)} aria-label="Copy" style={{ flexShrink: 0, width: "34px", height: "34px", borderRadius: "9px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <Copy size={15} color="#9a9a9a" strokeWidth={2} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </>
      )}

      <RadarDetailSheet thing={detail} onClose={() => { setDetail(null); refresh(); }} />

      {toast && (
        <div style={{ position: "fixed", left: "50%", bottom: "70px", transform: "translateX(-50%)", background: "rgba(255,255,255,0.10)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", color: "#ededed", fontSize: "12.5px", fontWeight: 500, padding: "7px 16px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.10)", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 60 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
