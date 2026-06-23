"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, Compass, Sparkles, Layers, Bookmark, type LucideIcon } from "lucide-react";
import { GOLD, HAIRLINE, TEXT, SG } from "@/lib/design-tokens";

const CAPABILITIES: { Icon: LucideIcon; title: string; line: string }[] = [
  { Icon: Compass, title: "Discover by what you're building", line: "The tool worth using, filed by the job — not buried in a feed." },
  { Icon: Sparkles, title: "See what's new, daily", line: "Fresh launches and what's trending, kept current by a calm signal." },
  { Icon: Layers, title: "The whole stack, one map", line: "Models, tools, MCP servers and skills — curated, not 12,000." },
  { Icon: Bookmark, title: "Make it your map", line: "Save any tool into a named Loadout — your stack, on device." },
];

const INTERVAL_MS = 3000;

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
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % CAPABILITIES.length);
    }, INTERVAL_MS);
  };

  useEffect(() => {
    if (reduce) return;
    startTimer();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [reduce]); // startTimer is stable — defined outside effect, uses only refs

  const jumpTo = (i: number) => {
    setActiveIndex(i);
    startTimer();
  };

  const rowVariants: Variants = {
    enter: { opacity: 0, y: 16 },
    show:  { opacity: 1, y: 0,  transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
    exit:  { opacity: 0, y: -12, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } },
  };

  const staticContainer: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
  };
  const staticRow: Variants = {
    hidden: { opacity: 0, y: 10 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  };

  const { Icon, title, line } = CAPABILITIES[activeIndex];

  return (
    <div
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

      {/* capability — rotating single card or static list (reduced-motion) */}
      {reduce ? (
        <motion.div initial="hidden" animate="show" variants={staticContainer}>
          {CAPABILITIES.map(({ Icon: I, title: t, line: l }) => (
            <motion.div key={t} variants={staticRow} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 0", borderBottom: `1px solid ${HAIRLINE}` }}>
              <span style={{ width: "34px", height: "34px", borderRadius: "9px", background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.22)", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <I size={17} strokeWidth={2} color={GOLD} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: TEXT.primary, lineHeight: 1.25 }}>{t}</span>
                <span style={{ display: "block", fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.4, marginTop: "2px" }}>{l}</span>
              </span>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <>
          {/* fixed-height container so the card doesn't resize between items */}
          <div style={{ position: "relative", overflow: "hidden", minHeight: "82px" }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeIndex}
                variants={rowVariants}
                initial="enter"
                animate="show"
                exit="exit"
                style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 0", width: "100%" }}
              >
                <span style={{ width: "34px", height: "34px", borderRadius: "9px", background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.22)", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={17} strokeWidth={2} color={GOLD} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: SG, fontSize: "14px", fontWeight: 600, color: TEXT.primary, lineHeight: 1.25 }}>{title}</span>
                  <span style={{ display: "block", fontSize: "12.5px", color: TEXT.muted, lineHeight: 1.4, marginTop: "2px" }}>{line}</span>
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* step dots */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingBottom: "10px", borderBottom: `1px solid ${HAIRLINE}` }}>
            {CAPABILITIES.map((_, i) => (
              <button
                key={i}
                onClick={() => jumpTo(i)}
                aria-label={`Show capability ${i + 1}`}
                style={{
                  width: i === activeIndex ? "20px" : "6px",
                  height: "6px",
                  borderRadius: "100px",
                  background: i === activeIndex ? GOLD : "rgba(255,255,255,0.18)",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  transition: "width 0.3s ease, background 0.3s ease",
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* footer — curated breadth as proof */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px" }}>
        <span style={{ fontSize: "12px", color: TEXT.muted }}>{toolCount} tools · {mcpCount} MCP · {skillCount} skills</span>
        <Link href="/radar" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: SG, fontSize: "13px", fontWeight: 600, color: GOLD, textDecoration: "none" }}>
          Open the Radar <ArrowRight size={13} strokeWidth={2.4} />
        </Link>
      </div>
    </div>
  );
}
