"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, Check, Compass, Sparkles, Layers, Bookmark, type LucideIcon } from "lucide-react";
import { GOLD, HAIRLINE, TEXT, SG } from "@/lib/design-tokens";

type Capability = { Icon: LucideIcon; title: string; line: string; points: string[] };

const CAPABILITIES: Capability[] = [
  {
    Icon: Compass,
    title: "Discover by what you're building",
    line: "The tool worth using, filed by the job — not buried in a feed.",
    points: [
      "Browse by use-case: agents, RAG, vision, voice",
      "See what each tool is actually for, at a glance",
      "Skip the 12-tab comparison rabbit hole",
    ],
  },
  {
    Icon: Sparkles,
    title: "See what's new, daily",
    line: "Fresh launches and what's trending, kept current by a calm signal.",
    points: [
      "Today's launches and what's gaining traction",
      "30-second briefs on what actually changed",
      "A calm daily signal — no hype, no doomscroll",
    ],
  },
  {
    Icon: Layers,
    title: "The whole stack, one map",
    line: "Models, tools, MCP servers and skills — curated, not 12,000.",
    points: [
      "Models · dev tools · MCP servers · skills",
      "Hand-picked and cross-linked, all in one place",
      "Quality over quantity — every entry earns its spot",
    ],
  },
  {
    Icon: Bookmark,
    title: "Make it your map",
    line: "Save any tool into a named Loadout — your stack, on device.",
    points: [
      "Group tools into named Loadouts you control",
      "Yours, stored on device — no account needed",
      "Free forever, every claim linked to its source",
    ],
  },
];

const N = CAPABILITIES.length;
const INTERVAL_MS = 3200;

const CARD_STYLE: React.CSSProperties = {
  // Fully opaque — the deck stacks, so the front card must completely hide
  // whatever sits behind it (no translucency, no bleed-through).
  background: "linear-gradient(180deg, #201e1a, #161411)",
  border: `1px solid ${HAIRLINE}`,
  borderRadius: "18px",
  boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)",
  padding: "18px 18px 14px",
};

// One feature, rendered as a full self-contained, info-rich card.
function CapabilityCard({
  cap, toolCount, mcpCount, skillCount,
}: { cap: Capability; toolCount: number; mcpCount: number; skillCount: number }) {
  const { Icon, title, line, points } = cap;
  return (
    <div style={CARD_STYLE}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "9px", fontFamily: SG, fontSize: "11px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: TEXT.muted }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: GOLD, boxShadow: "0 0 0 4px rgba(59,130,246,0.18)" }} />
          What the Radar does
        </span>
      </div>
      <p style={{ margin: "0 0 12px", fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.4 }}>
        The calm map of the AI worth using.
      </p>
      <div style={{ height: "1px", background: HAIRLINE }} />

      {/* feature heading */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "13px", padding: "16px 0 12px" }}>
        <span style={{ width: "42px", height: "42px", borderRadius: "11px", background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.22)", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={21} strokeWidth={2} color={GOLD} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: SG, fontSize: "19px", fontWeight: 700, color: "#ffffff", lineHeight: 1.18, letterSpacing: "-0.015em" }}>{title}</span>
          <span style={{ display: "block", fontSize: "13px", color: TEXT.body, lineHeight: 1.45, marginTop: "5px" }}>{line}</span>
        </span>
      </div>

      {/* supporting detail points */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "4px 0 16px", borderBottom: `1px solid ${HAIRLINE}` }}>
        {points.map((p) => (
          <span key={p} style={{ display: "flex", alignItems: "flex-start", gap: "9px", fontSize: "13px", color: TEXT.body, lineHeight: 1.4 }}>
            <span style={{ width: "18px", height: "18px", borderRadius: "6px", background: "rgba(59,130,246,0.12)", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", marginTop: "1px" }}>
              <Check size={12} strokeWidth={2.6} color={GOLD} />
            </span>
            {p}
          </span>
        ))}
      </div>

      {/* footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "13px" }}>
        <span style={{ fontSize: "12px", color: TEXT.muted }}>{toolCount} tools · {mcpCount} MCP · {skillCount} skills</span>
        <Link href="/radar" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: SG, fontSize: "13px", fontWeight: 600, color: GOLD, textDecoration: "none" }}>
          Open the Radar <ArrowRight size={13} strokeWidth={2.4} />
        </Link>
      </div>
    </div>
  );
}

const PEEK_TOP = "26px"; // matches container paddingTop — the room peeks rise into

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
      <motion.div initial="hidden" animate="show" variants={container} style={{ ...CARD_STYLE, width: "100%", maxWidth: "460px", marginInline: "auto" }}>
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

  // ─── Animated deck — a front card cycles over two static peek shells ──────
  // The two peeks behind give the deck depth (they only show a top sliver, so
  // their content never matters). Only the front card animates — it rises in
  // from the deck and slides up & out — which keeps the motion smooth with no
  // zIndex flicker.
  const peeks = [
    { y: -26, scale: 0.90, opacity: 0.32, z: 1 },
    { y: -13, scale: 0.95, opacity: 0.55, z: 2 },
  ];
  return (
    <div style={{ width: "100%", maxWidth: "460px", marginInline: "auto" }}>
      {/* paddingTop reserves the room the peeking cards rise into */}
      <div style={{ position: "relative", paddingTop: PEEK_TOP }}>
        {/* invisible spacer — gives the absolutely-positioned deck its height */}
        <div style={{ visibility: "hidden" }} aria-hidden>
          <CapabilityCard cap={CAPABILITIES[0]} toolCount={toolCount} mcpCount={mcpCount} skillCount={skillCount} />
        </div>

        {/* static peek shells behind the front card */}
        {peeks.map((p) => (
          <div
            key={p.z}
            aria-hidden
            style={{ position: "absolute", top: PEEK_TOP, left: 0, right: 0, transformOrigin: "top center", transform: `translateY(${p.y}px) scale(${p.scale})`, opacity: p.opacity, zIndex: p.z, pointerEvents: "none" }}
          >
            <CapabilityCard cap={CAPABILITIES[0]} toolCount={toolCount} mcpCount={mcpCount} skillCount={skillCount} />
          </div>
        ))}

        {/* front card — cycles through the features */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={activeIndex}
            style={{ position: "absolute", top: PEEK_TOP, left: 0, right: 0, transformOrigin: "top center", zIndex: 3, willChange: "transform, opacity" }}
            initial={{ y: 14, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 32 } }}
            exit={{ y: -46, scale: 1, opacity: 0, transition: { duration: 0.32, ease: [0.4, 0, 1, 1] } }}
          >
            <CapabilityCard cap={CAPABILITIES[activeIndex]} toolCount={toolCount} mcpCount={mcpCount} skillCount={skillCount} />
          </motion.div>
        </AnimatePresence>
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
