"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GOLD, TEXT, SG } from "@/lib/design-tokens";
import { Typewriter } from "./Typewriter";

// The five pillars Kapyn covers — the rotating word cycles through these.
const PILLARS = ["coding agent", "AI model", "MCP server", "dev tool", "AI skill"];
const PREFIX = ["Find", "the", "best"];

const EASE: [number, number, number, number] = [0.2, 0, 0, 1];

const H1_STYLE: React.CSSProperties = {
  fontFamily: SG,
  fontSize: "clamp(40px, 6vw, 64px)",
  fontWeight: 700,
  color: TEXT.primary,
  letterSpacing: "-0.04em",
  lineHeight: 1.04,
  margin: "18px 0 0",
};

export function HeroHeadline() {
  const reduce = useReducedMotion();
  const rotating = <Typewriter words={PILLARS} color={GOLD} />;

  if (reduce) {
    return (
      <h1 style={H1_STYLE}>
        Find the best
        <br />
        {rotating}
      </h1>
    );
  }

  const nodes: React.ReactNode[] = [];
  PREFIX.forEach((w, i) => {
    nodes.push(
      <motion.span
        key={w}
        initial={{ opacity: 0, filter: "blur(6px)", y: 10 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 + i * 0.09, ease: EASE }}
        style={{ display: "inline-block" }}
      >
        {w}
      </motion.span>
    );
    if (i < PREFIX.length - 1) nodes.push(" ");
  });

  return (
    <h1 style={H1_STYLE}>
      {nodes}
      <br />
      {rotating}
    </h1>
  );
}
