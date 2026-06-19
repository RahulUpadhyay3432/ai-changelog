"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { FaceMark, MetricChip, usePressTap, SG, TEXT, HAIRLINE, type RadarThing } from "./radar-shared";

// One full-height row — same content shape as the inline Row, but the value line
// is never clamped, so every tool in the section reads in full.
function DetailRow({ thing, onOpen }: { thing: RadarThing; onOpen: (t: RadarThing) => void }) {
  const tap = usePressTap(() => onOpen(thing));
  return (
    <motion.button
      {...tap}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 440, damping: 28 }}
      style={{ display: "flex", alignItems: "flex-start", gap: "13px", width: "100%", textAlign: "left", padding: "15px 20px", background: "transparent", border: "none", borderBottom: `1px solid ${HAIRLINE}`, cursor: "pointer", color: "inherit" }}
    >
      <FaceMark face={thing.face} category={thing.categorySlug} logoUrl={thing.logoUrl} label={thing.name} size={42} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontFamily: SG, fontSize: "15.5px", fontWeight: 600, color: TEXT.primary, letterSpacing: "-0.01em", lineHeight: 1.25 }}>{thing.name}</span>
        <p style={{ fontSize: "14px", fontWeight: 450, color: TEXT.body, lineHeight: 1.5, margin: "4px 0 0" }}>{thing.valueLine}</p>
        {thing.metric && <span style={{ display: "inline-block", marginTop: "9px" }}><MetricChip>{thing.metric}</MetricChip></span>}
      </div>
    </motion.button>
  );
}

function Sheet({
  emoji,
  title,
  sub,
  things,
  onClose,
  onOpenThing,
}: {
  emoji?: string;
  title: string;
  sub: string;
  things: RadarThing[];
  onClose: () => void;
  onOpenThing: (t: RadarThing) => void;
}) {
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
        style={{ position: "relative", background: "#111111", borderRadius: "20px 20px 0 0", padding: "0 0 calc(env(safe-area-inset-bottom, 0px) + 8px)", pointerEvents: "all", minHeight: "62dvh", maxHeight: "94dvh", display: "flex", flexDirection: "column" }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 6px", flexShrink: 0 }}>
          <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.15)" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "6px 20px 14px", flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontFamily: SG, fontSize: "20px", fontWeight: 700, color: "#f3efe9", margin: 0, letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "8px" }}>
              {emoji && <span style={{ fontSize: "18px" }}>{emoji}</span>}{title}
            </h2>
            <p style={{ fontSize: "13px", color: TEXT.muted, margin: "5px 0 0", lineHeight: 1.4 }}>{sub}</p>
            <span style={{ display: "inline-block", marginTop: "7px", fontFamily: SG, fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: TEXT.muted }}>{things.length} tool{things.length === 1 ? "" : "s"}</span>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <X size={16} color="#888" strokeWidth={2} />
          </button>
        </div>

        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />

        {/* Full list */}
        <div className="scrollbar-none" style={{ overflowY: "auto", flex: 1 }}>
          {things.map((t) => <DetailRow key={t.id} thing={t} onOpen={onOpenThing} />)}
        </div>
      </motion.div>
    </div>
  );
}

// Standalone props (no SectionData import) to avoid a circular import with
// RadarClient. Mirrors RadarDetailSheet's portal + drag-to-dismiss shell.
export function SectionAllSheet({
  open,
  emoji,
  title,
  sub,
  things,
  onClose,
  onOpenThing,
}: {
  open: boolean;
  emoji?: string;
  title: string;
  sub: string;
  things: RadarThing[];
  onClose: () => void;
  onOpenThing: (t: RadarThing) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  const container = document.getElementById("phone-overlay-root") ?? document.body;
  return createPortal(
    <AnimatePresence>
      {open && <Sheet emoji={emoji} title={title} sub={sub} things={things} onClose={onClose} onOpenThing={onOpenThing} />}
    </AnimatePresence>,
    container,
  );
}
