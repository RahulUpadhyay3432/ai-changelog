"use client";

import { useState, useCallback, useRef, useLayoutEffect, useEffect } from "react";
import { CompletionCard } from "./CompletionCard";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from "framer-motion";
import { NewsCard } from "./NewsCard";
import type { NewsItem } from "@/lib/types";
import { updateStreak } from "@/lib/storage";
import posthog from "posthog-js";

interface CardStackProps {
  items: NewsItem[];
  onIndexChange?: (index: number, total: number) => void;
  onRefresh?: () => Promise<void>;
  onSave?: (id: string) => void;
}

const THRESHOLD = 0.3;
const SPRING = { type: "spring" as const, stiffness: 350, damping: 28 };

function vh() {
  return typeof window !== "undefined" ? window.innerHeight : 800;
}

export function CardStack({ items, onIndexChange, onRefresh, onSave }: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [caughtUpToast, setCaughtUpToast] = useState(false);
  const isAnimatingRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const caughtUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemsLenRef = useRef(items.length);
  const refreshingForCompletionRef = useRef(false);
  const prevLenBeforeRefreshRef = useRef(0);

  const dragY = useMotionValue(0);

  // Next card: starts below viewport, rises as current drags up
  const nextY = useTransform(dragY, (v) => vh() + v);
  const nextScale = useTransform(dragY, (v) => {
    const p = Math.max(0, Math.min(1, -v / (vh() * THRESHOLD)));
    return 0.85 + p * 0.15;
  });
  const nextOpacity = useTransform(dragY, (v) => {
    const p = Math.max(0, Math.min(1, -v / (vh() * THRESHOLD)));
    return 0.8 + p * 0.2;
  });

  // Prev card: starts above viewport, descends as current drags down
  const prevY = useTransform(dragY, (v) => -vh() + v);
  const prevScale = useTransform(dragY, (v) => {
    const p = Math.max(0, Math.min(1, v / (vh() * THRESHOLD)));
    return 0.85 + p * 0.15;
  });
  const prevOpacity = useTransform(dragY, (v) => {
    const p = Math.max(0, Math.min(1, v / (vh() * THRESHOLD)));
    return 0.8 + p * 0.2;
  });

  // Reset dragY before browser paints after an index transition
  useLayoutEffect(() => {
    dragY.set(0);
  }, [currentIndex, dragY]);

  // Keep itemsLenRef current
  useEffect(() => {
    itemsLenRef.current = items.length;
  }, [items.length]);

  useEffect(() => {
    // Record streak on mount
    updateStreak();
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (caughtUpTimerRef.current) clearTimeout(caughtUpTimerRef.current);
    };
  }, []);

  // After completion-triggered refresh, detect new items vs none
  useEffect(() => {
    if (!refreshingForCompletionRef.current) return;
    refreshingForCompletionRef.current = false;
    if (items.length > prevLenBeforeRefreshRef.current) {
      // New dispatches arrived — exit completion, advance to first new item
      setShowCompletion(false);
      const firstNew = prevLenBeforeRefreshRef.current;
      setCurrentIndex(firstNew);
      onIndexChange?.(firstNew, items.length);
    } else {
      // Nothing new
      if (caughtUpTimerRef.current) clearTimeout(caughtUpTimerRef.current);
      setCaughtUpToast(true);
      caughtUpTimerRef.current = setTimeout(() => setCaughtUpToast(false), 2000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const advanceTo = useCallback(
    async (direction: 1 | -1) => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      // Update streak on interaction
      updateStreak();

      await animate(dragY, direction === 1 ? -vh() : vh(), SPRING);

      setCurrentIndex((prev) => {
        const next = prev + direction;
        onIndexChange?.(next, items.length);
        const currentItem = items[prev];
        posthog.capture("story_swiped", {
          direction: direction === 1 ? "next" : "previous",
          story_id: currentItem?.id,
          story_title: currentItem?.title,
          category: currentItem?.categorySlug,
          position: prev,
          total: items.length,
        });
        return next;
      });

      isAnimatingRef.current = false;

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(10);
      }
    },
    [dragY, items, onIndexChange]
  );


  const handleCompletionRefresh = useCallback(async () => {
    if (!onRefresh) return;
    prevLenBeforeRefreshRef.current = itemsLenRef.current;
    refreshingForCompletionRef.current = true;
    await onRefresh();
  }, [onRefresh]);

  const handleDragEnd = useCallback(
    async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (isAnimatingRef.current) {
        animate(dragY, 0, SPRING);
        return;
      }

      const h = vh();
      const threshold = h * THRESHOLD;
      const { offset, velocity } = info;
      const idx = currentIndex;

      if (offset.y < -threshold || velocity.y < -500) {
        if (idx < items.length - 1) {
          await advanceTo(1);
        } else {
          // Last card — show completion instead of bouncing
          setShowCompletion(true);
          animate(dragY, 0, SPRING);
        }
      } else if (offset.y > threshold || velocity.y > 500) {
        if (idx > 0) {
          await advanceTo(-1);
        } else if (onRefresh) {
          setIsRefreshing(true);
          try {
            await onRefresh();
            posthog.capture("feed_refreshed", {
              stories_count: items.length,
            });
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            setShowToast(true);
            toastTimerRef.current = setTimeout(() => setShowToast(false), 2000);
          } finally {
            setIsRefreshing(false);
            animate(dragY, 0, SPRING);
          }
        } else {
          animate(dragY, 0, SPRING);
        }
      } else {
        animate(dragY, 0, SPRING);
      }
    },
    [dragY, currentIndex, items.length, advanceTo, onRefresh]
  );

  if (items.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#525252",
          fontSize: "15px",
        }}
      >
        No stories yet. Check back soon.
      </div>
    );
  }

  const prevItem = currentIndex > 0 ? items[currentIndex - 1] : null;
  const currentItem = items[currentIndex];
  const nextItem = currentIndex < items.length - 1 ? items[currentIndex + 1] : null;

  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        overflow: "hidden",
        touchAction: "none",
        overscrollBehavior: "none",
      }}
    >
      {/* Prev card — above viewport, peeks in when dragging down */}
      {prevItem && (
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            y: prevY,
            scale: prevScale,
            opacity: prevOpacity,
          }}
        >
          <NewsCard item={prevItem} onSave={onSave} />
        </motion.div>
      )}

      {/* Next card — below viewport, peeks in when dragging up */}
      {nextItem && (
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            y: nextY,
            scale: nextScale,
            opacity: nextOpacity,
          }}
        >
          <NewsCard item={nextItem} onSave={onSave} />
        </motion.div>
      )}

      {/* Current card — draggable, always on top */}
      <motion.div
        drag="y"
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{
          position: "absolute",
          inset: 0,
          y: dragY,
          zIndex: 10,
          touchAction: "none",
          cursor: "grab",
        }}
        whileDrag={{ cursor: "grabbing" }}
      >
        <NewsCard item={currentItem} onSave={onSave} />
      </motion.div>

      {/* Pull-to-refresh spinner */}
      {isRefreshing && (
        <div
          style={{
            position: "absolute",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          <div className="refresh-spinner" />
        </div>
      )}

      {/* Completion card */}
      <AnimatePresence>
        {showCompletion && (
          <CompletionCard
            key="completion"
            readCount={items.length}
            onBackToTop={() => {
              setShowCompletion(false);
              setCurrentIndex(0);
              onIndexChange?.(0, items.length);
            }}
            onRefresh={handleCompletionRefresh}
            caughtUpToast={caughtUpToast}
          />
        )}
      </AnimatePresence>

      {/* Feed Updated toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 6, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 4, x: "-50%", transition: { duration: 0.3 } }}
            style={{
              position: "fixed",
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
