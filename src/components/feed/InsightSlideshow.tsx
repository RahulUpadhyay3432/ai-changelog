"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import type { Insight } from "@/lib/types";
import posthog from "posthog-js";

interface InsightSlideshowProps {
  insight: Insight;
  open: boolean;
  onClose: () => void;
}

function SlideshowContent({ insight, onClose }: { insight: Insight; onClose: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const accent = insight.accentColor;
  const total = insight.slides.length;

  useEffect(() => {
    posthog.capture("insight_opened", {
      insight_id: insight.id,
      insight_title: insight.title,
    });
  }, [insight.id, insight.title]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentSlide(Math.max(0, Math.min(idx, total - 1)));
  };

  const goToSlide = (i: number) => {
    scrollRef.current?.scrollTo({ left: i * (scrollRef.current.clientWidth), behavior: "smooth" });
  };

  const isLast = currentSlide === total - 1;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 9999 }}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />

      {/* Slideshow panel */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 34 }}
        style={{
          position: "absolute",
          inset: 0,
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Progress bar */}
        <div
          style={{
            height: "3px",
            background: "rgba(255,255,255,0.06)",
            flexShrink: 0,
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              height: "100%",
              background: accent,
              width: `${((currentSlide + 1) / total) * 100}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Header — floats over the image */}
        <div
          style={{
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            position: "relative",
            zIndex: 2,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <X size={16} color="#ccc" strokeWidth={2} />
          </button>

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: accent,
              }}
            >
              {insight.title}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "1px" }}>
              {currentSlide + 1} / {total}
            </div>
          </div>

          {!isLast ? (
            <button
              onClick={() => goToSlide(currentSlide + 1)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: `${accent}25`,
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: `1px solid ${accent}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <ChevronRight size={16} color={accent} strokeWidth={2} />
            </button>
          ) : (
            <div style={{ width: "32px" }} />
          )}
        </div>

        {/* Full-bleed horizontal slides */}
        <div
          ref={scrollRef}
          className="scrollbar-none"
          onScroll={handleScroll}
          style={{
            flex: 1,
            display: "flex",
            overflowX: "scroll",
            scrollSnapType: "x mandatory",
            overflowY: "hidden",
            marginTop: "-60px", // slide under the header
          } as React.CSSProperties}
        >
          {insight.slides.map((s, i) => (
            <div
              key={i}
              style={{
                flex: "0 0 100%",
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
                position: "relative",
              }}
            >
              <img
                src={s.imageUrl}
                alt={`Slide ${i + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          ))}
        </div>

        {/* Dot navigation */}
        <div
          style={{
            padding: "14px 24px calc(env(safe-area-inset-bottom, 0px) + 20px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "6px",
            flexShrink: 0,
            position: "relative",
            zIndex: 2,
            background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
          }}
        >
          {insight.slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              style={{
                height: "5px",
                width: i === currentSlide ? "22px" : "5px",
                borderRadius: "3px",
                background: i === currentSlide ? accent : "rgba(255,255,255,0.25)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                flexShrink: 0,
                transition: "width 0.25s ease, background 0.25s ease",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function InsightSlideshow({ insight, open, onClose }: InsightSlideshowProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const container = document.getElementById("phone-overlay-root") ?? document.body;
  return createPortal(
    <AnimatePresence>
      {open && <SlideshowContent insight={insight} onClose={onClose} />}
    </AnimatePresence>,
    container
  );
}
