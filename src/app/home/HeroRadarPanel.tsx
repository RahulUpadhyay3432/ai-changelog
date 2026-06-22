"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, Compass, Sparkles, Layers, Bookmark, type LucideIcon } from "lucide-react";
import { GOLD, HAIRLINE, TEXT, SG } from "@/lib/design-tokens";

// The hero's right-side visual: a "Radar" panel that summarises what the Radar is
// CAPABLE of — not a list of obvious tools (which sells nothing). Each row is a
// capability + a concrete one-liner; the footer shows the curated counts as proof.
// Rows stagger in on mount (calm easing, reduced-motion aware).

const CAPABILITIES: { Icon: LucideIcon; title: string; line: string }[] = [
  { Icon: Compass, title: "Discover by what you're building", line: "The tool worth using, filed by the job — not buried in a feed." },
  { Icon: Sparkles, title: "See what's new, daily", line: "Fresh launches and what's trending, kept current by a calm signal." },
  { Icon: Layers, title: "The whole stack, one map", line: "Models, tools, MCP servers and skills — curated, not 12,000." },
  { Icon: Bookmark, title: "Make it your map", line: "Save any tool into a named Loadout — your stack, on device." },
];

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
  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } } };
  const row: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "440px",
        marginLeft: "auto",
        background: "linear-gradient(180deg, rgba(27,26,23,0.92), rgba(18,17,15,0.92))",
        border: `1px solid ${HAIRLINE}`,
        borderRadius: "18px",
        padding: "18px 18px 14px",
        boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.4)",
      }}
    >
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "9px", fontFamily: SG, fontSize: "11px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: TEXT.muted }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: GOLD, boxShadow: "0 0 0 4px rgba(59,130,246,0.18)" }} />
          What the Radar does
        </span>
      </div>
      <p style={{ margin: "0 0 6px", fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.4 }}>
        The calm map of the AI worth using.
      </p>
      <div style={{ height: "1px", background: HAIRLINE }} />

      {/* capability rows */}
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

      {/* footer — curated breadth as proof */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px" }}>
        <span style={{ fontSize: "12px", color: TEXT.muted }}>{toolCount} tools · {mcpCount} MCP · {skillCount} skills</span>
        <Link href="/radar" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: SG, fontSize: "13px", fontWeight: 600, color: GOLD, textDecoration: "none" }}>
          Open the Radar <ArrowRight size={13} strokeWidth={2.4} />
        </Link>
      </div>
    </motion.div>
  );
}
