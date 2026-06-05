"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CompletionCard } from "./CompletionCard";
import { motion, AnimatePresence } from "framer-motion";
import { NewsCard } from "./NewsCard";
import type { NewsItem } from "@/lib/types";
import { updateStreak } from "@/lib/storage";
import posthog from "posthog-js";

interface CardStackProps {
  items: NewsItem[];
  onIndexChange?: (index: number, total: number) => void;
  onRefresh?: () => Promise<number>;
  onSave?: (id: string) => void;
  onHorizontalDrag?: (dx: number) => void;
  onHorizontalDragEnd?: (dx: number) => void;
}

const PTR_THRESHOLD = 64;
// How many px of movement before we commit to a direction
const DIRECTION_LOCK_THRESHOLD = 8;

// Run non-visual work (analytics, localStorage) after paint so it never blocks
// the scroll-snap frame — keeps card-to-card transitions smooth.
function deferIdle(fn: () => void) {
  if (typeof window === "undefined") return;
  const ric = (
    window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void;
    }
  ).requestIdleCallback;
  if (ric) ric(fn, { timeout: 500 });
  else setTimeout(fn, 0);
}

export function CardStack({
  items, onIndexChange, onRefresh, onSave,
  onHorizontalDrag, onHorizontalDragEnd,
}: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [caughtUpToast, setCaughtUpToast] = useState(false);
  const [ptrPull, setPtrPull] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const caughtUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemsLenRef = useRef(items.length);

  // Touch tracking refs — shared between the locked-direction useEffect
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchCurrentX = useRef(0);
  const touchCurrentY = useRef(0);
  // "none" → "horizontal" | "vertical" — locked on first significant movement
  const gestureLock = useRef<"none" | "horizontal" | "vertical">("none");

  // Keep callback refs fresh so the non-passive listener never captures stale closures
  const onHorizontalDragRef = useRef(onHorizontalDrag);
  const onHorizontalDragEndRef = useRef(onHorizontalDragEnd);
  const onRefreshRef = useRef(onRefresh);
  useEffect(() => { onHorizontalDragRef.current = onHorizontalDrag; }, [onHorizontalDrag]);
  useEffect(() => { onHorizontalDragEndRef.current = onHorizontalDragEnd; }, [onHorizontalDragEnd]);
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

  useEffect(() => { itemsLenRef.current = items.length; }, [items.length]);

  useEffect(() => {
    updateStreak();
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (caughtUpTimerRef.current) clearTimeout(caughtUpTimerRef.current);
    };
  }, []);


  // ─── Non-passive touch listeners ────────────────────────────────────────────
  // React attaches all synthetic touch events as `passive: true`, which means
  // e.preventDefault() is a no-op and the browser scrolls vertically even during
  // a horizontal swipe. We bypass React here and attach directly to the DOM with
  // { passive: false } so we can call preventDefault() the moment we lock to
  // horizontal — killing all vertical scroll for that gesture.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = (e: TouchEvent) => {
      gestureLock.current = "none";
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchCurrentX.current = e.touches[0].clientX;
      touchCurrentY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isRefreshingRef.current) return;
      touchCurrentX.current = e.touches[0].clientX;
      touchCurrentY.current = e.touches[0].clientY;
      const dx = touchCurrentX.current - touchStartX.current;
      const dy = touchCurrentY.current - touchStartY.current;

      // Lock direction on first significant movement
      if (gestureLock.current === "none") {
        if (Math.abs(dx) >= DIRECTION_LOCK_THRESHOLD || Math.abs(dy) >= DIRECTION_LOCK_THRESHOLD) {
          gestureLock.current = Math.abs(dx) >= Math.abs(dy) ? "horizontal" : "vertical";
        }
        return; // Wait until direction is decided
      }

      if (gestureLock.current === "horizontal") {
        // Prevent vertical scroll — this is the key line that makes it crisp
        e.preventDefault();
        onHorizontalDragRef.current?.(dx);
      } else {
        // Vertical: handle pull-to-refresh indicator only
        if (container.scrollTop <= 4 && dy > 0) {
          setPtrPull(Math.min(dy * 0.6, PTR_THRESHOLD * 1.2));
        }
      }
    };

    const onTouchEnd = async () => {
      const dx = touchCurrentX.current - touchStartX.current;
      const dy = touchCurrentY.current - touchStartY.current;
      const lock = gestureLock.current;
      gestureLock.current = "none";
      setPtrPull(0);

      if (lock === "horizontal") {
        onHorizontalDragEndRef.current?.(dx);
        return;
      }

      // Vertical: pull-to-refresh
      if (
        lock === "vertical" &&
        container.scrollTop <= 4 &&
        dy >= PTR_THRESHOLD &&
        onRefreshRef.current &&
        !isRefreshingRef.current
      ) {
        isRefreshingRef.current = true;
        setIsRefreshing(true);
        const countBefore = itemsLenRef.current;
        try {
          const newCount = await onRefreshRef.current();
          posthog.capture("feed_refreshed", {
            stories_before: countBefore,
            stories_after: newCount,
            new_stories: Math.max(0, newCount - countBefore),
          });
          if (newCount > countBefore) {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            setShowToast(true);
            toastTimerRef.current = setTimeout(() => setShowToast(false), 2000);
          } else {
            if (caughtUpTimerRef.current) clearTimeout(caughtUpTimerRef.current);
            setCaughtUpToast(true);
            caughtUpTimerRef.current = setTimeout(() => setCaughtUpToast(false), 2000);
          }
        } finally {
          setIsRefreshing(false);
          isRefreshingRef.current = false;
        }
      }
    };

    // passive: true  → browser can optimise scroll (we never preventDefault here)
    // passive: false → we may preventDefault; required for horizontal lock
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove",  onTouchMove,  { passive: false });
    container.addEventListener("touchend",   onTouchEnd,   { passive: true });

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove",  onTouchMove);
      container.removeEventListener("touchend",   onTouchEnd);
    };
  }, []); // Empty — all callbacks accessed via refs

  // ─── Scroll handler (vertical story tracking) ────────────────────────────
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const index = Math.min(
      Math.round(container.scrollTop / container.clientHeight),
      items.length
    );
    if (index === currentIndexRef.current) return;
    const prev = currentIndexRef.current;
    currentIndexRef.current = index;
    setCurrentIndex(index);
    if (index < items.length) {
      onIndexChange?.(index, items.length);
      // Haptic stays immediate so it feels tied to the snap.
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
      // Streak write + analytics are deferred off the snap frame.
      const prevItem = items[prev] ?? items[0];
      deferIdle(() => {
        updateStreak();
        posthog.capture("story_swiped", {
          direction: index > prev ? "next" : "previous",
          story_id: prevItem?.id,
          story_title: prevItem?.title,
          category: prevItem?.categorySlug,
          position: prev,
          total: items.length,
        });
      });
    }
  }, [items, onIndexChange]);

  const handleBackToTop = useCallback(() => {
    const container = containerRef.current;
    if (container) container.scrollTo({ top: 0, behavior: "smooth" });
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    onIndexChange?.(0, items.length);
  }, [items.length, onIndexChange]);

  // ─── Preload upcoming hero images ────────────────────────────────────────
  // Off-screen <img> tags are deprioritised by the browser, so the next card's
  // image often isn't downloaded yet when the user swipes to it — causing a
  // visible delay. Warm the cache for the next few cards whenever the position
  // changes; by the time they're swiped into view the image is already loaded.
  const PRELOAD_AHEAD = 3;
  useEffect(() => {
    for (let i = currentIndex + 1; i <= currentIndex + PRELOAD_AHEAD; i++) {
      const url = items[i]?.imageUrl;
      if (!url) continue;
      const img = new window.Image();
      img.decoding = "async";
      img.src = url;
    }
  }, [currentIndex, items]);

  if (items.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#525252", fontSize: "15px" }}>
        No stories yet. Check back soon.
      </div>
    );
  }

  return (
    <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {(ptrPull > 8 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            style={{
              position: "absolute",
              top: Math.min(ptrPull * 0.4, 24),
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 20,
              pointerEvents: "none",
            }}
          >
            <div className="refresh-spinner" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll container — touch events handled via non-passive DOM listeners above */}
      <div
        ref={containerRef}
        className="scrollbar-none"
        onScroll={handleScroll}
        style={{
          height: "100%",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          overscrollBehaviorY: "contain",
          WebkitOverflowScrolling: "touch",
          display: "flex",
          flexDirection: "column",
        } as React.CSSProperties}
      >
        {items.map((item) => (
          <div key={item.id} style={{ flex: "0 0 100%", scrollSnapAlign: "start", scrollSnapStop: "always" }}>
            <NewsCard item={item} onSave={onSave} />
          </div>
        ))}
        <div style={{ flex: "0 0 100%", scrollSnapAlign: "start", scrollSnapStop: "always" }}>
          <CompletionCard
            readCount={items.length}
            onBackToTop={handleBackToTop}
            caughtUpToast={caughtUpToast}
          />
        </div>
      </div>

      {/* Feed Updated toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 6, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 4, x: "-50%", transition: { duration: 0.3 } }}
            style={{
              position: "absolute", bottom: 80, left: "50%",
              background: "rgba(255,255,255,0.10)", backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)", color: "#a3a3a3",
              padding: "6px 16px", borderRadius: "20px", fontSize: "12px",
              fontWeight: 500, zIndex: 50, whiteSpace: "nowrap",
              border: "1px solid rgba(255,255,255,0.10)", pointerEvents: "none",
            }}
          >
            Feed Updated
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
