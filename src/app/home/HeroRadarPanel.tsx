"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GOLD, HAIRLINE, TEXT, SG } from "@/lib/design-tokens";

// The hero's right-side visual: a live "Radar" panel showing the REAL curated
// catalog (real logos + value lines + type), so a cold visitor sees the product's
// value at a glance — not an abstract graphic. Rows stagger in on mount (calm
// easing, reduced-motion aware).

export interface RadarRow {
  name: string;
  value: string;
  type: string;
  logoHref: string | null;
}

export function HeroRadarPanel({
  rows,
  toolCount,
  mcpCount,
  skillCount,
  updated,
}: {
  rows: RadarRow[];
  toolCount: number;
  mcpCount: number;
  skillCount: number;
  updated: string;
}) {
  const reduce = useReducedMotion();
  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } } };
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "9px", fontFamily: SG, fontSize: "11px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: TEXT.muted }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: GOLD, boxShadow: "0 0 0 4px rgba(59,130,246,0.18)" }} />
          On the Radar
        </span>
        <span style={{ fontSize: "11px", color: TEXT.muted }}>{updated}</span>
      </div>
      <div style={{ height: "1px", background: HAIRLINE }} />

      {/* rows — the real curated catalog */}
      {rows.map((r) => (
        <motion.div key={r.name} variants={row} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 0", borderBottom: `1px solid ${HAIRLINE}` }}>
          <span style={{ width: "34px", height: "34px", borderRadius: "9px", background: "#fff", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {r.logoHref ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={r.logoHref}
                alt=""
                width={20}
                height={20}
                loading="lazy"
                style={{ width: "20px", height: "20px", objectFit: "contain" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : null}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontFamily: SG, fontSize: "14.5px", fontWeight: 600, color: TEXT.primary }}>{r.name}</span>
              <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.06em", color: TEXT.muted, border: `1px solid ${HAIRLINE}`, borderRadius: "5px", padding: "1px 5px" }}>{r.type}</span>
            </span>
            <span style={{ display: "block", fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.4, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.value}</span>
          </span>
        </motion.div>
      ))}

      {/* footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px" }}>
        <span style={{ fontSize: "12px", color: TEXT.muted }}>{toolCount} tools · {mcpCount} MCP · {skillCount} skills</span>
        <Link href="/radar" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: SG, fontSize: "13px", fontWeight: 600, color: GOLD, textDecoration: "none" }}>
          Open the Radar <ArrowRight size={13} strokeWidth={2.4} />
        </Link>
      </div>
    </motion.div>
  );
}
