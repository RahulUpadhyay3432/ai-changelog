"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { GOLD, GOLD_SOFT, GOLD_BORDER, SG, TEXT } from "@/lib/design-tokens";

export function HeroPill({ storyCount }: { storyCount: number }) {
  const reduce = useReducedMotion();

  const label = storyCount > 0 ? `${storyCount} stories today` : "Updated daily";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05, ease: [0.2, 0, 0, 1] }}
      style={{ display: "inline-flex" }}
    >
      <Link
        href="/?app=1"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: GOLD_SOFT,
          border: `1px solid ${GOLD_BORDER}`,
          borderRadius: "100px",
          padding: "5px 12px 5px 6px",
          textDecoration: "none",
        }}
      >
        <span style={{
          background: GOLD,
          borderRadius: "100px",
          padding: "2px 9px",
          fontFamily: SG,
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.04em",
          color: "#fff",
          whiteSpace: "nowrap",
        }}>
          Live
        </span>
        <span style={{ fontFamily: SG, fontSize: "12.5px", fontWeight: 500, color: TEXT.body, whiteSpace: "nowrap" }}>
          {label}
        </span>
        <ArrowRight size={12} strokeWidth={2.3} color={GOLD} />
      </Link>
    </motion.div>
  );
}
