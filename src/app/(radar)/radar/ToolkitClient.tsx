"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Copy, ChevronDown, Bookmark, ArrowRight, Share2, Plus, Trash2 } from "lucide-react";
import posthog from "posthog-js";
import {
  getSavedRadarTools, getRadarNotes, setRadarNotes,
  getLoadouts, createLoadout, deleteLoadout,
  type SavedRadarTool, type Loadout,
} from "@/lib/storage";
import { FaceMark, GOLD, GOLD_SOFT, GOLD_BORDER, CANVAS, SURFACE, HAIRLINE, INNER_HIGHLIGHT, SG, TEXT, type Face, type RadarThing } from "./radar-shared";
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

function LoadoutChip({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "6px",
        fontFamily: SG, fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap",
        color: active ? "#ffffff" : TEXT.body,
        background: active ? GOLD : "rgba(255,255,255,0.05)",
        border: `1px solid ${active ? GOLD : "rgba(255,255,255,0.08)"}`,
        borderRadius: "100px", padding: "8px 14px", cursor: "pointer",
      }}
    >
      {label}
      <span style={{ fontSize: "11.5px", fontVariantNumeric: "tabular-nums", opacity: active ? 0.7 : 0.55 }}>{count}</span>
    </button>
  );
}

export function ToolkitClient() {
  const [saved, setSaved] = useState<SavedRadarTool[]>([]);
  const [loadouts, setLoadouts] = useState<Loadout[]>([]);
  const [activeLoadout, setActiveLoadout] = useState<string | null>(null); // null = All
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [detail, setDetail] = useState<RadarThing | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const refresh = useCallback(() => {
    setSaved(getSavedRadarTools());
    setLoadouts(getLoadouts());
  }, []);
  useEffect(() => { refresh(); setNotes(getRadarNotes()); }, [refresh]);

  const flash = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 1600); };

  // Counts per loadout (from all saves, independent of search) for the chips.
  const loadoutCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of saved) if (s.loadoutId) m.set(s.loadoutId, (m.get(s.loadoutId) ?? 0) + 1);
    return m;
  }, [saved]);

  // Search first, then scope to the active loadout (null = show everything).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? saved.filter((s) => s.name.toLowerCase().includes(q) || s.valueLine.toLowerCase().includes(q))
      : saved;
    return activeLoadout ? base.filter((s) => s.loadoutId === activeLoadout) : base;
  }, [saved, query, activeLoadout]);

  const groups = useMemo(() => {
    const m = new Map<string, SavedRadarTool[]>();
    for (const s of filtered) {
      const c = s.category ?? "Saved";
      if (!m.has(c)) m.set(c, []);
      m.get(c)!.push(s);
    }
    return [...m.entries()];
  }, [filtered]);

  const onCreateLoadout = () => {
    const lo = createLoadout(newName);
    setNewName("");
    setCreating(false);
    if (!lo) return;
    refresh();
    setActiveLoadout(lo.id);
    posthog.capture("radar_loadout_created", { from: "toolkit" });
  };

  const onDeleteLoadout = (id: string) => {
    deleteLoadout(id);
    setActiveLoadout(null);
    refresh();
    flash("Loadout removed");
    posthog.capture("radar_loadout_deleted");
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
    <div className="scrollbar-none" style={{ position: "relative", height: "100%", overflowY: "auto", overflowX: "hidden", background: CANVAS, paddingBottom: "28px" }}>
      {/* Header */}
      <div style={{ padding: "24px 24px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontFamily: SG, fontSize: "32px", fontWeight: 700, color: TEXT.primary, margin: 0, letterSpacing: "-0.035em", lineHeight: 1.02 }}>Loadout</h1>
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
          <Link href="/radar" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: "#ffffff", background: GOLD, borderRadius: "12px", padding: "11px 18px", textDecoration: "none" }}>
            Browse Today <ArrowRight size={16} strokeWidth={2.3} />
          </Link>
        </div>
      ) : (
        <>
          {/* Loadout switcher — All · each loadout · ＋ New. Loadouts are the
              user's own named kits; "All" is every save, filed by category. */}
          <div className="scrollbar-none radar-rail" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 24px 14px", overflowX: "auto" }}>
            <LoadoutChip active={activeLoadout === null} label="All" count={saved.length} onClick={() => setActiveLoadout(null)} />
            {loadouts.map((l) => (
              <LoadoutChip key={l.id} active={activeLoadout === l.id} label={l.name} count={loadoutCounts.get(l.id) ?? 0} onClick={() => setActiveLoadout(l.id)} />
            ))}
            {creating ? (
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") onCreateLoadout(); if (e.key === "Escape") { setCreating(false); setNewName(""); } }}
                onBlur={() => { if (!newName.trim()) setCreating(false); }}
                placeholder="Name…"
                maxLength={40}
                autoFocus
                style={{ flexShrink: 0, width: "130px", background: "#111111", border: `1px solid ${GOLD_BORDER}`, borderRadius: "100px", padding: "8px 14px", color: "#ededed", fontSize: "13px", outline: "none" }}
              />
            ) : (
              <button onClick={() => setCreating(true)} aria-label="New loadout" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: SG, fontSize: "13px", fontWeight: 600, color: TEXT.body, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "100px", padding: "8px 13px", cursor: "pointer", whiteSpace: "nowrap" }}>
                <Plus size={14} strokeWidth={2.4} /> New
              </button>
            )}
          </div>

          {/* Search */}
          <div style={{ padding: "0 24px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "10px 13px" }}>
              <Search size={16} color="#5c5c5c" strokeWidth={2} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter your toolkit" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#ededed", fontSize: "14px" }} />
            </div>
          </div>

          {/* Active-loadout meta: delete control (its tools stay saved, unfiled) */}
          {activeLoadout && (
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 24px 12px" }}>
              <button onClick={() => onDeleteLoadout(activeLoadout)} style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "none", border: "none", cursor: "pointer", color: TEXT.muted, fontSize: "12px", fontWeight: 500, padding: "2px 4px" }}>
                <Trash2 size={13} strokeWidth={2} /> Delete loadout
              </button>
            </div>
          )}

          {groups.length === 0 && (
            <p style={{ padding: "0 24px", color: "#5c5c5c", fontSize: "14px" }}>
              {query
                ? <>No matches for &ldquo;{query}&rdquo;.</>
                : activeLoadout
                  ? "No tools in this loadout yet. Open any tool and tap “Add to loadout.”"
                  : "Nothing saved yet."}
            </p>
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
                      <button key={s.id} onClick={() => setDetail(toThing(s))} style={{ display: "flex", flexDirection: "column", textAlign: "left", background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: "14px", padding: "12px", cursor: "pointer", color: "inherit", boxShadow: INNER_HIGHLIGHT, minWidth: 0, width: "100%", overflow: "hidden" }}>
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
