"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { CompletionCard } from "./CompletionCard";
import { motion, AnimatePresence } from "framer-motion";
import { NewsCard } from "./NewsCard";
import type { NewsItem } from "@/lib/types";
import { updateStreak } from "@/lib/storage";
import posthog from "posthog-js";

interface CardStackProps {
  items: NewsItem[];
  onIndexChange?: (index: number, total: number) => void;
  onRefresh?: () => Promise<number>; // returns new item count
  onSave?: (id: string) => void;
  onHorizontalDrag?: (dx: number) => void;      // called every touchmove when horizontal
  onHorizontalDragEnd?: (dx: number) => void;   // called on touchend
}

const PTR_THRESHOLD = 64;

export function CardStack({ items, onIndexChange, onRefresh, onSave, onHorizontalDrag, onHorizontalDragEnd }: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [caughtUpToast, setCaughtUpToast] = useState(false);
  const [ptrPull, setPtrPull] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(0);
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const isRefreshingRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const caughtUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemsLenRef = useRef(items.length);
  const refreshingForCompletionRef = useRef(false);
  const prevLenBeforeRefreshRef = useRef(0);

  useEffect(() => {
    itemsLenRef.current = items.length;
  }, [items.length]);

  useEffect(() => {
    updateStreak();
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (caughtUpTimerRef.current) clearTimeout(caughtUpTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!refreshingForCompletionRef.current) return;
    refreshingForCompletionRef.current = false;
    const container = containerRef.current;
    if (items.length > prevLenBeforeRefreshRef.current) {
      const firstNew = prevLenBeforeRefreshRef.current;
      if (container) {
        container.scrollTo({ top: firstNew * container.clientHeight, behavior: "smooth" });
      }
      currentIndexRef.current = firstNew;
      setCurrentIndex(firstNew);
      onIndexChange?.(firstNew, items.length);
    } else {
      if (caughtUpTimerRef.current) clearTimeout(caughtUpTimerRef.current);
      setCaughtUpToast(true);
      caughtUpTimerRef.current = setTimeout(() => setCaughtUpToast(false), 2000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

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
      updateStreak();
      const prevItem = items[prev] ?? items[0];
      posthog.capture("story_swiped", {
        direction: index > prev ? "next" : "previous",
        story_id: prevItem?.id,
        story_title: prevItem?.title,
        category: prevItem?.categorySlug,
        position: prev,
        total: items.length,
      });
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  }, [items, onIndexChange]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container || isRefreshingRef.current) return;
    touchCurrentY.current = e.touches[0].clientY;
    touchCurrentX.current = e.touches[0].clientX;
    const deltaX = touchCurrentX.current - touchStartX.current;
    const deltaY = touchCurrentY.current - touchStartY.current;
    // Horizontal dominant — stream live position to parent, skip PTR
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > 6) onHorizontalDrag?.(deltaX);
      return;
    }
    if (container.scrollTop > 4) return;
    if (deltaY > 0) {
      setPtrPull(Math.min(deltaY * 0.6, PTR_THRESHOLD * 1.2));
    }
  }, [onHorizontalDrag]);

  const handleTouchEnd = useCallback(async () => {
    const container = containerRef.current;
    const deltaY = touchCurrentY.current - touchStartY.current;
    const deltaX = touchCurrentX.current - touchStartX.current;
    setPtrPull(0);

    // ── Horizontal drag end → let parent decide snap or spring-back ───────
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 6) {
      onHorizontalDragEnd?.(deltaX);
      return;
    }

    // ── Pull-to-refresh (vertical, first card) ────────────────────────────
    if (
      container &&
      container.scrollTop <= 4 &&
      deltaY >= PTR_THRESHOLD &&
      onRefresh &&
      !isRefreshingRef.current
    ) {
      isRefreshingRef.current = true;
      setIsRefreshing(true);
      const countBefore = itemsLenRef.current;
      try {
        // onRefresh returns the new item count — don't rely on itemsLenRef
        // which only updates after React re-renders (too late to read here)
        const newCount = await onRefresh();
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
  }, [onRefresh, onHorizontalDragEnd]);

  const handleCompletionRefresh = useCallback(async () => {
    if (!onRefresh) return;
    prevLenBeforeRefreshRef.current = itemsLenRef.current;
    refreshingForCompletionRef.current = true;
    await onRefresh(); // return value handled by the items.length useEffect
  }, [onRefresh]);

  const handleBackToTop = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    }
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    onIndexChange?.(0, items.length);
  }, [items.length, onIndexChange]);

  if (items.length === 0) {
    return (
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#525252",
        fontSize: "15px",
      }}>
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

      {/* Scroll container */}
      <div
        ref={containerRef}
        className="scrollbar-none"
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
          <div
            key={item.id}
            style={{
              flex: "0 0 100%",
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
            }}
          >
            <NewsCard item={item} onSave={onSave} />
          </div>
        ))}

        {/* Completion card — final scroll stop */}
        <div style={{
          flex: "0 0 100%",
          scrollSnapAlign: "start",
          scrollSnapStop: "always",
        }}>
          <CompletionCard
            readCount={items.length}
            onBackToTop={handleBackToTop}
            onRefresh={handleCompletionRefresh}
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
              position: "absolute",
              bottom: 80,
              left: "50%",
              background: "rgba(255,255,255,0.10)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              color: "#a3a3a3",
              padding: "6px 16px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 500,
              zIndex: 50,
              whiteSpace: "nowrap",
              border: "1px solid rgba(255,255,255,0.10)",
              pointerEvents: "none",
            }}
          >
            Feed Updated
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
