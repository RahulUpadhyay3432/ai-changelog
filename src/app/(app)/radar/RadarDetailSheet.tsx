"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Bookmark, Copy, ArrowUpRight, Check } from "lucide-react";
import posthog from "posthog-js";
import { FaceMark, MetricChip, GOLD, GOLD_SOFT, GOLD_BORDER, SG, TEXT, type RadarThing } from "./radar-shared";
import { toggleRadarTool, isRadarToolSaved } from "@/lib/storage";
import { getToolDepth } from "@/lib/radar-tool-depth";

// One labelled depth block — gold kicker + warm body. Mirrors the /learn
// section pattern (heading + paragraph) inside the dark sheet.
function Field({ label, body }: { label: string; body: string }) {
  return (
    <section style={{ marginTop: "20px" }}>
      <span style={{ fontFamily: SG, fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: GOLD }}>{label}</span>
      <p style={{ fontSize: "14.5px", lineHeight: 1.6, color: TEXT.body, margin: "7px 0 0" }}>{body}</p>
    </section>
  );
}

function Sheet({ thing, onClose }: { thing: RadarThing; onClose: () => void }) {
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const depth = getToolDepth(thing.url);

  useEffect(() => {
    setSaved(isRadarToolSaved(thing.id));
  }, [thing.id]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  const onSave = () => {
    const nowSaved = toggleRadarTool({
      id: thing.id, name: thing.name, valueLine: thing.valueLine,
      category: thing.category, face: thing.face, url: thing.url,
      savedAt: new Date().toISOString(),
    });
    setSaved(nowSaved);
    flash(nowSaved ? (thing.category ? `Saved to ${thing.category}` : "Saved to Toolkit") : "Removed");
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
    posthog.capture(nowSaved ? "radar_tool_saved" : "radar_tool_unsaved", { id: thing.id, category: thing.category });
  };

  const onCopy = async () => {
    const text = `${thing.name} — ${thing.valueLine}${thing.url ? ` ${thing.url}` : ""} (via Kapyn Radar)`;
    try {
      await navigator.clipboard.writeText(text);
      flash("Copied");
      posthog.capture("radar_tool_copied", { id: thing.id });
    } catch {
      flash("Couldn't copy");
    }
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 9999, display: "flex", flexDirection: "column", justifyContent: "flex-end", pointerEvents: "none" }}>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", pointerEvents: "all" }}
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 34 }}
        drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={(_, info) => { if (info.offset.y > 80) onClose(); }}
        style={{ position: "relative", background: "#111111", borderRadius: "20px 20px 0 0", padding: "0 0 calc(env(safe-area-inset-bottom, 0px) + 18px)", pointerEvents: "all", minHeight: "62dvh", maxHeight: "94dvh", display: "flex", flexDirection: "column" }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 6px", flexShrink: 0 }}>
          <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.15)" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "6px 20px 14px", flexShrink: 0 }}>
          <FaceMark face={thing.face} size={46} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <h2 style={{ fontFamily: SG, fontSize: "19px", fontWeight: 600, color: "#f3efe9", margin: 0, letterSpacing: "-0.01em" }}>{thing.name}</h2>
              {thing.typeLabel && <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#737373", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "100px", padding: "2px 8px" }}>{thing.typeLabel}</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "7px" }}>
              {thing.metric && <MetricChip>{thing.metric}</MetricChip>}
              {thing.recency && <span style={{ fontSize: "12px", color: "#8a8a8a" }}>{thing.recency}</span>}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <X size={16} color="#888" strokeWidth={2} />
          </button>
        </div>

        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />

        {/* Content */}
        <div style={{ padding: "18px 20px 0", overflowY: "auto", flex: 1 }}>
          <p style={{ fontSize: "15px", lineHeight: 1.6, color: "#cfcbc4", margin: 0 }}>{thing.valueLine}</p>
          {depth ? (
            <>
              <Field label="What it is" body={depth.whatItIs} />
              <Field label="How it works" body={depth.howItWorks} />
              <Field label="Who it's for" body={depth.whoItsFor} />
              <Field label="Where it's used" body={depth.whereUsed} />
            </>
          ) : (
            thing.description && thing.description.trim() && thing.description.trim() !== thing.valueLine.trim() && (
              <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#a7a39d", margin: "12px 0 0" }}>{thing.description.trim()}</p>
            )
          )}
          {thing.topics && thing.topics.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginTop: "16px" }}>
              {thing.topics.slice(0, 6).map((topic) => (
                <span key={topic} style={{ fontSize: "12px", fontWeight: 500, color: TEXT.body, background: "rgba(255,255,255,0.06)", border: `1px solid rgba(255,255,255,0.09)`, borderRadius: "100px", padding: "4px 11px", textTransform: "capitalize" }}>
                  {topic.replace(/-/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions — Save primary, Copy, then Open site (last) */}
        <div style={{ display: "flex", gap: "10px", padding: "16px 20px 0", flexShrink: 0 }}>
          <button onClick={onSave} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", fontFamily: SG, fontSize: "15px", fontWeight: 600, color: saved ? GOLD : "#0a0a0a", background: saved ? GOLD_SOFT : GOLD, border: saved ? `1px solid ${GOLD_BORDER}` : "none", borderRadius: "13px", padding: "13px", cursor: "pointer" }}>
            {saved ? <><Check size={17} strokeWidth={2.5} /> Saved</> : <><Bookmark size={17} strokeWidth={2} /> Save</>}
          </button>
          <button onClick={onCopy} aria-label="Copy" style={{ width: "50px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "13px", cursor: "pointer" }}>
            <Copy size={18} color="#c9c5bf" strokeWidth={2} />
          </button>
          {thing.url && (
            <a href={thing.url} target="_blank" rel="noopener noreferrer" onClick={() => posthog.capture("radar_tool_opened_site", { id: thing.id })} aria-label="Open site" style={{ width: "50px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "13px" }}>
              <ArrowUpRight size={18} color="#c9c5bf" strokeWidth={2} />
            </a>
          )}
        </div>

        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ position: "absolute", left: "50%", bottom: "82px", transform: "translateX(-50%)", background: "rgba(255,255,255,0.10)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", color: "#ededed", fontSize: "12.5px", fontWeight: 500, padding: "7px 16px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.10)", whiteSpace: "nowrap", pointerEvents: "none" }}>
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export function RadarDetailSheet({ thing, onClose }: { thing: RadarThing | null; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  const container = document.getElementById("phone-overlay-root") ?? document.body;
  return createPortal(
    <AnimatePresence>{thing && <Sheet thing={thing} onClose={onClose} />}</AnimatePresence>,
    container
  );
}
