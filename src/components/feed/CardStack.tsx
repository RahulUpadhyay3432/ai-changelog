"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { CompletionCard } from "./CompletionCard";
import { NotificationCard } from "./NotificationCard";
import { motion, AnimatePresence } from "framer-motion";
import { NewsCard } from "./NewsCard";
import type { NewsItem } from "@/lib/types";
import { shouldShowNotifCard } from "@/lib/notifications";
import { updateStreak } from "@/lib/storage";
import { prefetchBreakdown } from "@/lib/breakdown-cache";
import posthog from "posthog-js";

interface CardStackProps {
  items: NewsItem[];
  onIndexChange?: (index: number, total: number) => void;
  onRefresh?: () => Promise<number>;
  onSave?: (id: string) => void;
  onHorizontalDrag?: (dx: number) => void;
  onHorizontalDragEnd?: (dx: number) => void;
  // Unix ms of the user's previous visit (null for first-timers). Stories
  // published after it get a "New" badge — the returning-user hook.
  lastVisit?: number | null;
}

const PTR_THRESHOLD = 64;
const DIRECTION_LOCK_THRESHOLD = 8;
// Show the push opt-in after this many stories — engaged, but far before the
// end-of-stack. The old end-only placement sat after ~100 cards, so virtually
// nobody reached it → virtually no subscribers → push reached no one.
const NOTIF_SLOT = 5;

type FeedEntry =
  | { type: "news"; item: NewsItem; newsIdx: number }
  | { type: "notif" };

export function CardStack({
  items, onIndexChange, onRefresh, onSave,
  onHorizontalDrag, onHorizontalDragEnd, lastVisit,
}: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [caughtUpToast, setCaughtUpToast] = useState(false);
  const [ptrPull, setPtrPull] = useState(0);
  // Push opt-in interstitial (end-of-feed). Gated client-side to avoid a
  // hydration mismatch — shouldShowNotifCard() reads localStorage + permission.
  const [showNotif, setShowNotif] = useState(false);
  useEffect(() => { setShowNotif(shouldShowNotifCard()); }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(0);
  // Activation instrumentation: the deepest news card reached this session and
  // whether the end was hit — summarised in one event on session end so a
  // card-1 bouncer (who never fires story_swiped) is still counted at depth 0.
  const maxDepthRef = useRef(0);
  const reachedCompletionRef = useRef(false);
  const sessionEndedRef = useRef(false);
  const lastVisitRef = useRef(lastVisit);
  useEffect(() => { lastVisitRef.current = lastVisit; }, [lastVisit]);
  const isRefreshingRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const caughtUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemsLenRef = useRef(items.length);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchCurrentX = useRef(0);
  const touchCurrentY = useRef(0);
  const gestureLock = useRef<"none" | "horizontal" | "vertical">("none");

  const onHorizontalDragRef = useRef(onHorizontalDrag);
  const onHorizontalDragEndRef = useRef(onHorizontalDragEnd);
  const onRefreshRef = useRef(onRefresh);
  useEffect(() => { onHorizontalDragRef.current = onHorizontalDrag; }, [onHorizontalDrag]);
  useEffect(() => { onHorizontalDragEndRef.current = onHorizontalDragEnd; }, [onHorizontalDragEnd]);
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);
  useEffect(() => { itemsLenRef.current = items.length; }, [items.length]);

  // ─── Build feed (news + an early push opt-in interstitial) ───────────────
  const feedEntries = useMemo<FeedEntry[]>(() => {
    const entries: FeedEntry[] = items.map((item, i) => ({ type: "news", item, newsIdx: i }));
    // Splice the opt-in in early so engaged readers actually see it — only when
    // there are enough stories after it that it isn't crowding the end.
    if (showNotif && entries.length > NOTIF_SLOT) {
      entries.splice(NOTIF_SLOT, 0, { type: "notif" });
    }
    return entries;
  }, [items, showNotif]);

  useEffect(() => {
    updateStreak();
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (caughtUpTimerRef.current) clearTimeout(caughtUpTimerRef.current);
    };
  }, []);

  // ─── Activation summary — one event per feed session ──────────────────────
  // Fires once on session end (pagehide, tab hidden, or SPA unmount). This is
  // the event that answers "activation vs return-trigger": paired with
  // feed_viewed as the denominator, max_depth reveals whether first-timers ever
  // get past the opening cards. Card-1 bouncers land here at depth 0 — otherwise
  // invisible, since story_swiped never fires without a swipe.
  useEffect(() => {
    const endSession = () => {
      if (sessionEndedRef.current || itemsLenRef.current === 0) return;
      sessionEndedRef.current = true;
      posthog.capture("feed_session_ended", {
        max_depth: maxDepthRef.current,
        total: itemsLenRef.current,
        reached_completion: reachedCompletionRef.current,
        is_returning: lastVisitRef.current != null,
        // First-ever session proxy (no prior-visit marker) — the population whose
        // activation we most need to isolate against retention.
        is_first_session: lastVisitRef.current == null,
      });
    };
    const onVisibility = () => { if (document.visibilityState === "hidden") endSession(); };
    window.addEventListener("pagehide", endSession);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", endSession);
      document.removeEventListener("visibilitychange", onVisibility);
      endSession();
    };
  }, []);

  // ─── Non-passive touch listeners ─────────────────────────────────────────
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

      if (gestureLock.current === "none") {
        if (Math.abs(dx) >= DIRECTION_LOCK_THRESHOLD || Math.abs(dy) >= DIRECTION_LOCK_THRESHOLD) {
          gestureLock.current = Math.abs(dx) >= Math.abs(dy) ? "horizontal" : "vertical";
        }
        return;
      }

      if (gestureLock.current === "horizontal") {
        e.preventDefault();
        onHorizontalDragRef.current?.(dx);
      } else {
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

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove",  onTouchMove,  { passive: false });
    container.addEventListener("touchend",   onTouchEnd,   { passive: true });

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove",  onTouchMove);
      container.removeEventListener("touchend",   onTouchEnd);
    };
  }, []);

  // ─── Scroll handler ───────────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const index = Math.min(
      Math.round(container.scrollTop / container.clientHeight),
      feedEntries.length
    );
    if (index === currentIndexRef.current) return;
    const prev = currentIndexRef.current;
    currentIndexRef.current = index;
    setCurrentIndex(index);

    // Reaching the trailing completion card (index === feedEntries.length).
    if (index >= feedEntries.length) reachedCompletionRef.current = true;

    const entry = feedEntries[index];
    if (entry && entry.type === "news") {
      if (entry.newsIdx > maxDepthRef.current) maxDepthRef.current = entry.newsIdx;
      onIndexChange?.(entry.newsIdx, items.length);
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
      const prevEntry = feedEntries[prev];
      const prevItem = prevEntry?.type === "news" ? prevEntry.item : items[0];
      // Fire synchronously. Previously deferred via requestIdleCallback, which
      // silently dropped the first swipe on a fast bounce — exactly the users
      // whose swipe-depth we most need to measure. posthog.capture batches, so
      // this is cheap on the settled index-change handler.
      updateStreak();
      posthog.capture("story_swiped", {
        direction: index > prev ? "next" : "previous",
        story_id: prevItem?.id,
        story_title: prevItem?.title,
        category: prevItem?.categorySlug,
        position: prev,
        total: items.length,
      });
    }
  }, [feedEntries, items, onIndexChange]);

  const handleBackToTop = useCallback(() => {
    const container = containerRef.current;
    if (container) container.scrollTo({ top: 0, behavior: "smooth" });
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    onIndexChange?.(0, items.length);
  }, [items.length, onIndexChange]);

  // ─── Preload upcoming hero images ─────────────────────────────────────────
  const PRELOAD_AHEAD = 3;
  useEffect(() => {
    for (let i = currentIndex + 1; i <= currentIndex + PRELOAD_AHEAD; i++) {
      const entry = feedEntries[i];
      const url = entry?.type === "news" ? entry.item.imageUrl : null;
      if (!url) continue;
      const img = new window.Image();
      img.decoding = "async";
      img.src = url;
    }
  }, [currentIndex, feedEntries]);

  // ─── Prefetch "Why it matters" breakdowns ─────────────────────────────────
  const BREAKDOWN_PREFETCH_AHEAD = 1;
  useEffect(() => {
    for (let i = currentIndex; i <= currentIndex + BREAKDOWN_PREFETCH_AHEAD; i++) {
      const entry = feedEntries[i];
      if (!entry || entry.type !== "news") continue;
      prefetchBreakdown(entry.item);
    }
  }, [currentIndex, feedEntries]);

  if (items.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", padding: "0 32px", textAlign: "center" }}>
        <p style={{ fontSize: "15px", color: "var(--kt-text-primary, #E8E4DE)", margin: 0, fontWeight: 600 }}>No stories yet</p>
        <p style={{ fontSize: "13.5px", color: "var(--kt-text-muted, #a29d94)", margin: 0, lineHeight: 1.5 }}>Fresh dispatches land here as they break. Check back soon.</p>
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
        {feedEntries.map((entry) => (
          <div
            key={entry.type === "news" ? entry.item.id : "push-optin"}
            style={{ flex: "0 0 100%", scrollSnapAlign: "start", scrollSnapStop: "always" }}
          >
            {entry.type === "news" ? (
              <NewsCard
                item={entry.item}
                onSave={onSave}
                isNew={lastVisit != null && new Date(entry.item.publishedAt).getTime() > lastVisit}
              />
            ) : (
              <NotificationCard onDone={() => setShowNotif(false)} />
            )}
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
              background: "var(--kt-hairline, rgba(255,255,255,0.10))", backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)", color: "var(--kt-text-muted, #a3a3a3)",
              padding: "6px 16px", borderRadius: "20px", fontSize: "12px",
              fontWeight: 500, zIndex: 50, whiteSpace: "nowrap",
              border: "1px solid var(--kt-hairline, rgba(255,255,255,0.10))", pointerEvents: "none",
            }}
          >
            Feed Updated
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
