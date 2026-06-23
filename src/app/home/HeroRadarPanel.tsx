"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, Compass, Sparkles, Layers, Bookmark, type LucideIcon } from "lucide-react";
import { GOLD, HAIRLINE, TEXT, SG } from "@/lib/design-tokens";

const CAPABILITIES: { Icon: LucideIcon; title: string; line: string }[] = [
  { Icon: Compass,  title: "Discover by what you're building", line: "The tool worth using, filed by the job — not buried in a feed." },
  { Icon: Sparkles, title: "See what's new, daily",            line: "Fresh launches and what's trending, kept current by a calm signal." },
  { Icon: Layers,   title: "The whole stack, one map",         line: "Models, tools, MCP servers and skills — curated, not 12,000." },
  { Icon: Bookmark, title: "Make it your map",                 line: "Save any tool into a named Loadout — your stack, on device." },
];

const N = CAPABILITIES.length;
const INTERVAL_MS = 3200;

const CARD_STYLE: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(27,26,23,0.95), rgba(18,17,15,0.95))",
  border: `1px solid ${HAIRLINE}`,
  borderRadius: "18px",
  boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.4)",
  padding: "18px 18px 14px",
};

// One feature, rendered as a full self-contained card (header + capability + footer).
function CapabilityCard({
  Icon, title, line, toolCount, mcpCount, skillCount,
}: { Icon: LucideIcon; title: string; line: string; toolCount: number; mcpCount: number; skillCount: number }) {
  return (
    <div style={CARD_STYLE}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "9px", fontFamily: SG, fontSize: "11px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: TEXT.muted }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: GOLD, boxShadow: "0 0 0 4px rgba(59,130,246,0.18)" }} />
          What the Radar does
        </span>
      </div>
      <p style={{ margin: "0 0 6px", fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.4 }}>
        The calm map of the AI worth using.
      </p>
      <div style={{ height: "1px", background: HAIRLINE }} />

      {/* single capability row — minHeight keeps every card the same size */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 0 12px", borderBottom: `1px solid ${HAIRLINE}`, minHeight: "78px" }}>
        <span style={{ width: "34px", height: "34px", borderRadius: "9px", background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.22)", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={17} strokeWidth={2} color={GOLD} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: TEXT.primary, lineHeight: 1.25 }}>{title}</span>
          <span style={{ display: "block", fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.4, marginTop: "2px" }}>{line}</span>
        </span>
      </div>

      {/* footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px" }}>
        <span style={{ fontSize: "12px", color: TEXT.muted }}>{toolCount} tools · {mcpCount} MCP · {skillCount} skills</span>
        <Link href="/radar" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: SG, fontSize: "13px", fontWeight: 600, color: GOLD, textDecoration: "none" }}>
          Open the Radar <ArrowRight size={13} strokeWidth={2.4} />
        </Link>
      </div>
    </div>
  );
}

// Depth → visual slot in the deck. depth 0 = front, 1/2 = peeks behind, ≥3 hidden.
function slotFor(depth: number) {
  return {
    y: -depth * 11,
    scale: 1 - depth * 0.05,
    opacity: depth === 0 ? 1 : depth === 1 ? 0.7 : depth === 2 ? 0.4 : 0,
    zIndex: N - depth,
  };
}

export function HeroRadarPanel({
  toolCount,
  mcpCount,
  skillCount,
}: {
  toolCount: number;
  mcpCount: number;
  skillCount: number;
}) {
  const reduce = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setActiveIndex((i) => (i + 1) % N), INTERVAL_MS);
  };

  useEffect(() => {
    if (reduce) return;
    startTimer();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [reduce]); // startTimer only touches refs — no stale closure

  const jumpTo = (i: number) => {
    setActiveIndex(i);
    startTimer();
  };

  // ─── Reduced motion: original static 4-row list ───────────────────────────
  if (reduce) {
    const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } } };
    const row: Variants = { hidden: { opacity: 0 }, show: { opacity: 1 } };
    return (
      <motion.div initial="hidden" animate="show" variants={container} style={{ ...CARD_STYLE, width: "100%", maxWidth: "440px", marginLeft: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "9px", fontFamily: SG, fontSize: "11px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: TEXT.muted }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: GOLD }} />
            What the Radar does
          </span>
        </div>
        <p style={{ margin: "0 0 6px", fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.4 }}>The calm map of the AI worth using.</p>
        <div style={{ height: "1px", background: HAIRLINE }} />
        {CAPABILITIES.map(({ Icon, title, line }) => (
          <motion.div key={title} variants={row} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 0", borderBottom: `1px solid ${HAIRLINE}` }}>
            <span style={{ width: "34px", height: "34px", borderRadius: "9px", background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.22)", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={17} strokeWidth={2} color={GOLD} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: TEXT.primary, lineHeight: 1.25 }}>{title}</span>
              <span style={{ display: "block", fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.4, marginTop: "2px" }}>{line}</span>
            </span>
          </motion.div>
        ))}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px" }}>
          <span style={{ fontSize: "12px", color: TEXT.muted }}>{toolCount} tools · {mcpCount} MCP · {skillCount} skills</span>
          <Link href="/radar" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: SG, fontSize: "13px", fontWeight: 600, color: GOLD, textDecoration: "none" }}>
            Open the Radar <ArrowRight size={13} strokeWidth={2.4} />
          </Link>
        </div>
      </motion.div>
    );
  }

  // ─── Animated deck — each feature is its own card, cycling forward ────────
  return (
    <div style={{ width: "100%", maxWidth: "440px", marginLeft: "auto" }}>
      {/* paddingTop reserves the room the peeking cards rise into */}
      <div style={{ position: "relative", paddingTop: "26px" }}>
        {/* invisible spacer — gives the absolutely-positioned deck its height */}
        <div style={{ visibility: "hidden" }} aria-hidden>
          <CapabilityCard {...CAPABILITIES[0]} toolCount={toolCount} mcpCount={mcpCount} skillCount={skillCount} />
        </div>

        {CAPABILITIES.map((cap, i) => {
          const depth = (i - activeIndex + N) % N;
          const slot = slotFor(depth);
          return (
            <motion.div
              key={i}
              style={{ position: "absolute", top: "26px", left: 0, right: 0, transformOrigin: "top center", zIndex: slot.zIndex, pointerEvents: depth === 0 ? "auto" : "none" }}
              animate={{ y: slot.y, scale: slot.scale, opacity: slot.opacity }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
            >
              <CapabilityCard {...cap} toolCount={toolCount} mcpCount={mcpCount} skillCount={skillCount} />
            </motion.div>
          );
        })}
      </div>

      {/* progress dots */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "16px" }}>
        {CAPABILITIES.map((_, i) => (
          <button
            key={i}
            onClick={() => jumpTo(i)}
            aria-label={`Show capability ${i + 1}`}
            style={{
              width: i === activeIndex ? "22px" : "6px",
              height: "6px",
              borderRadius: "100px",
              background: i === activeIndex ? GOLD : "rgba(255,255,255,0.2)",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "width 0.3s ease, background 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
