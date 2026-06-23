"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
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

// Shared card chrome — used by the full front card and the static peeks behind it.
const CARD_STYLE = {
  background: "linear-gradient(180deg, rgba(27,26,23,0.92), rgba(18,17,15,0.92))",
  border: `1px solid ${HAIRLINE}`,
  borderRadius: "18px",
  boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.4)",
};

function SingleCapabilityCard({
  Icon, title, line, toolCount, mcpCount, skillCount,
}: { Icon: LucideIcon; title: string; line: string; toolCount: number; mcpCount: number; skillCount: number }) {
  return (
    <div style={{ ...CARD_STYLE, padding: "18px 18px 14px" }}>
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

      {/* single capability row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 0 12px", borderBottom: `1px solid ${HAIRLINE}` }}>
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
  }, [reduce]); // startTimer only uses refs — no stale closure

  // ─── Reduced motion: static 4-row list ────────────────────────────────────
  if (reduce) {
    const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } } };
    const row: Variants = { hidden: { opacity: 0 }, show: { opacity: 1 } };
    return (
      <motion.div initial="hidden" animate="show" variants={container} style={{ ...CARD_STYLE, width: "100%", maxWidth: "440px", marginLeft: "auto", padding: "18px 18px 14px" }}>
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

  // ─── Animated card deck ────────────────────────────────────────────────────
  const { Icon, title, line } = CAPABILITIES[activeIndex];

  return (
    // paddingBottom creates visible space for the 2 peeking cards behind the front.
    <div style={{ position: "relative", width: "100%", maxWidth: "440px", marginLeft: "auto", paddingBottom: "16px" }}>

      {/* Peeking card — furthest back (most inset, most shifted down) */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, zIndex: 1,
          ...CARD_STYLE,
          transform: "translateY(14px) scaleX(0.91)",
          transformOrigin: "top center",
          opacity: 0.7,
        }}
      />

      {/* Peeking card — middle */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, zIndex: 2,
          ...CARD_STYLE,
          transform: "translateY(7px) scaleX(0.96)",
          transformOrigin: "top center",
          opacity: 0.85,
        }}
      />

      {/* Front card — rotates through capabilities */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeIndex}
          style={{ position: "relative", zIndex: 3 }}
          // Enter: rises from the mid-card position (feels like it came from the stack)
          initial={{ y: 8, scaleX: 0.96, opacity: 0 }}
          animate={{ y: 0, scaleX: 1, opacity: 1, transition: { type: "spring", stiffness: 320, damping: 30 } }}
          // Exit: slides up and off the deck
          exit={{ y: -55, opacity: 0, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }}
        >
          <SingleCapabilityCard
            Icon={Icon} title={title} line={line}
            toolCount={toolCount} mcpCount={mcpCount} skillCount={skillCount}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
