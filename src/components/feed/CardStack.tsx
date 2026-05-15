"use client";

import { useState, useCallback, useRef, useLayoutEffect, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from "framer-motion";
import { NewsCard } from "./NewsCard";
import type { NewsItem } from "@/lib/types";

interface CardStackProps {
  items: NewsItem[];
  onIndexChange?: (index: number, total: number) => void;
  onRefresh?: () => Promise<void>;
}

const THRESHOLD = 0.3;
const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

function vh() {
  return typeof window !== "undefined" ? window.innerHeight : 800;
}

export function CardStack({ items, onIndexChange, onRefresh }: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const isAnimatingRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const advanceTo = useCallback(
    async (direction: 1 | -1) => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      await animate(dragY, direction === 1 ? -vh() : vh(), SPRING);

      setCurrentIndex((prev) => {
        const next = prev + direction;
        onIndexChange?.(next, items.length);
        return next;
      });

      isAnimatingRef.current = false;

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(10);
      }
    },
    [dragY, items.length, onIndexChange]
  );

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
          animate(dragY, 0, SPRING);
        }
      } else if (offset.y > threshold || velocity.y > 500) {
        if (idx > 0) {
          await advanceTo(-1);
        } else if (onRefresh) {
          setIsRefreshing(true);
          try {
            await onRefresh();
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
          <NewsCard item={prevItem} />
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
          <NewsCard item={nextItem} />
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
        <NewsCard item={currentItem} />
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

      {/* "Feed Updated!" toast */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: "fixed",
            bottom: 72,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(30,30,30,0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: "#f5f5f5",
            padding: "10px 22px",
            borderRadius: "100px",
            fontSize: "14px",
            fontWeight: 600,
            zIndex: 20,
            whiteSpace: "nowrap",
            border: "1px solid rgba(255,255,255,0.15)",
            pointerEvents: "none",
          }}
        >
          Feed Updated!
        </motion.div>
      )}
    </div>
  );
}
