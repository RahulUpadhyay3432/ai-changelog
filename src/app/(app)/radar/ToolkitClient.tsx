"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Copy, ChevronDown, Bookmark, ArrowRight, Share2 } from "lucide-react";
import posthog from "posthog-js";
import { getSavedRadarTools, getRadarNotes, setRadarNotes, type SavedRadarTool } from "@/lib/storage";
import { FaceMark, GOLD, GOLD_SOFT, CANVAS, SURFACE, HAIRLINE, INNER_HIGHLIGHT, SG, TEXT, type Face, type RadarThing } from "./radar-shared";
import { logoFor } from "./radar-map";
import { RadarDetailSheet } from "./RadarDetailSheet";

function toThing(s: SavedRadarTool): RadarThing {
  const isEntity = s.id.startsWith("entity:");
  return {
    id: s.id, kind: isEntity ? "entity" : "tool",
    name: s.name, valueLine: s.valueLine, face: (s.face as Face) ?? "essential",
    metric: null, typeLabel: null, category: s.category, url: s.url,
    recency: null, storyTitle: null, storySource: null,
    logoUrl: isEntity ? null : logoFor(s.url),
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
  const [notes, setNotes] = useState("");

  const refresh = useCallback(() => setSaved(getSavedRadarTools()), []);
  useEffect(() => { refresh(); setNotes(getRadarNotes()); }, [refresh]);

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
    <div className="scrollbar-none" style={{ position: "relative", height: "100%", overflowY: "auto", overflowX: "hidden", background: CANVAS, paddingBottom: "28px" }}>
      {/* Header */}
      <div style={{ padding: "24px 24px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontFamily: SG, fontSize: "32px", fontWeight: 700, color: TEXT.primary, margin: 0, letterSpacing: "-0.035em", lineHeight: 1.02 }}>Toolkit</h1>
          {!empty && (
            <button onClick={shareAll} aria-label="Share toolkit" style={{ flexShrink: 0, width: "40px", height: "40px", borderRadius: "100px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Share2 size={18} color="#a3a3a3" strokeWidth={1.8} />
            </button>
          )}
        </div>
        <p style={{ fontSize: "15px", color: TEXT.body, margin: "8px 0 0", lineHeight: 1.45 }}>
          {empty ? "Your saved AI tools, filed by category." : `${saved.length} saved · filed by category.`}
        </p>
      </div>

      {/* Notes workspace — always visible */}
      <div style={{ padding: "0 24px 20px" }}>
        <textarea
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setRadarNotes(e.target.value); }}
          placeholder="Notes, ideas, things to try…"
          rows={4}
          style={{
            width: "100%",
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px",
            padding: "12px 14px",
            color: "#ededed",
            fontSize: "14px",
            lineHeight: 1.6,
            resize: "vertical",
            outline: "none",
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
            boxSizing: "border-box",
          }}
        />
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
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "0 24px" }}>
                    {items.map((s) => (
                      <button key={s.id} onClick={() => setDetail(toThing(s))} style={{ display: "flex", flexDirection: "column", textAlign: "left", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "14px", padding: "12px", cursor: "pointer", color: "inherit", boxShadow: INNER_HIGHLIGHT }}>
                        <FaceMark face={(s.face as Face) ?? "essential"} logoUrl={toThing(s).logoUrl} size={32} />
                        <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: TEXT.primary, letterSpacing: "-0.01em", marginTop: "9px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                        <span style={{ display: "-webkit-box", fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.4, marginTop: "3px", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "35px" }}>{s.valueLine}</span>
                      </button>
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
