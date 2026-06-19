"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/radar-motion";

// Radar is its own space. A `template` (not a layout) remounts on every radar
// navigation — entering from Home AND switching radar tabs — so this sharp enter
// plays each time, making "you're in a new view" unmistakable (the fix for the
// "where am I / how do I get back" disorientation). Mirrors `.main`'s flex so the
// radar clients' `height:100%` scroll containers still resolve. Reduced-motion →
// opacity-only. Enter-only by design: App Router unmounts the old route before an
// exit animation could run, so we don't fight it with AnimatePresence.
export default function RadarTemplate({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.985, y: 10 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: reduced ? 0.16 : 0.22, ease: EASE }}
      style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
    >
      {children}
    </motion.div>
  );
}
