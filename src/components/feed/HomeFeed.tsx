"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useVelocity, animate } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, RefreshCw } from "lucide-react";
import { CategoryTabs } from "./CategoryTabs";
import { CardStack } from "./CardStack";
import { SwipeHint } from "./SwipeHint";
import { HomeScreenPill } from "@/components/pwa/HomeScreenPill";
import { fetchNewsItems, fetchNewsItemById } from "@/lib/supabase";
import { MOCK_STORIES } from "@/lib/mock-data";
import { CATEGORY_TABS } from "@/lib/categories";
import { getFeedHintShown, setFeedHintShown } from "@/lib/storage";
import type { CategorySlug, NewsItem } from "@/lib/types";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

// Minimum drag distance (px) or velocity (px/s) to commit a swipe
const SWIPE_DISTANCE = 72;
const SWIPE_VELOCITY = 400;

// Mock stories are a LOCAL dev convenience (work without a populated DB). Never
// in production: a failed/empty fetch there must show a real error/empty state,
// not silently swap in fake placeholder cards.
const USE_MOCK_FALLBACK = process.env.NODE_ENV === "development";

// Warm the browser cache for a feed's first few hero images so they're already
// downloaded before the user swipes into that category. Module-level dedupe set
// avoids re-requesting the same URL across category switches.
const warmedImageUrls = new Set<string>();
function warmImages(items: NewsItem[], count = 3) {
  if (typeof window === "undefined") return;
  for (let i = 0; i < Math.min(count, items.length); i++) {
    const url = items[i]?.imageUrl;
    if (!url || warmedImageUrls.has(url)) continue;
    warmedImageUrls.add(url);
    const img = new window.Image();
    img.decoding = "async";
    img.src = url;
  }
}

export function HomeFeed() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") ?? "all") as CategorySlug;
  const [storyId] = useState(() => searchParams.get("story"));

  const [activeCategory, setActiveCategory] = useState<CategorySlug>(initialCategory);
  const [stories, setStories] = useState<NewsItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0); // bump to force a re-fetch (retry)
  const [showFeedHint, setShowFeedHint] = useState(false);
  const router = useRouter();
  const hasLoadedOnce = useRef(false);
  const storiesLenRef = useRef(0); // stable ref so handleRefresh doesn't capture stale stories
  useEffect(() => { storiesLenRef.current = stories.length; }, [stories.length]);

  // Per-session cache of each category's resolved feed, so a sideways swipe to
  // an already-prefetched category is instant (no re-fetch, images pre-warmed).
  const feedCache = useRef<Map<string, NewsItem[]>>(new Map());

  // Bust the "all" cache on every mount so feed prefs changes in Profile apply immediately
  useEffect(() => {
    feedCache.current.delete("all");
  }, []);

  // Feed customization hint — shows after 3s, repeats each visit until user taps it
  useEffect(() => {
    if (getFeedHintShown()) return;
    const t = setTimeout(() => {
      setShowFeedHint(true);
      posthog.capture("feed_hint_shown");
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  // Real-time drag position — drives the card x transform without re-renders
  const dragX = useMotionValue(0);
  const dragVelocity = useVelocity(dragX);
  const isAnimating = useRef(false);

  // Resolve a category's feed: cache → Supabase. Lets fetch errors propagate so
  // the caller can show a real error state — we never silently swap in mock data
  // in production. Only successful, non-empty results are cached (so a failed or
  // empty category re-fetches on retry / next visit).
  const resolveFeed = useCallback(async (slug: CategorySlug): Promise<NewsItem[]> => {
    const cached = feedCache.current.get(slug);
    if (cached) return cached;
    const items = await fetchNewsItems(slug); // may throw → handled by the caller
    if (items.length > 0) {
      feedCache.current.set(slug, items);
      return items;
    }
    // Successful fetch, genuinely empty. Locally fall back to mock so dev isn't
    // blocked by an empty DB; in production return empty → real empty state.
    return USE_MOCK_FALLBACK
      ? MOCK_STORIES.filter((s) => slug === "all" || s.categorySlug === slug)
      : items;
  }, []);

  // Background-prefetch the categories on either side of the active tab and warm
  // their first hero images — so swiping sideways lands on a ready feed.
  const prefetchAdjacent = useCallback((slug: CategorySlug) => {
    const idx = CATEGORY_TABS.findIndex((t) => t.slug === slug);
    const neighbors = [CATEGORY_TABS[idx - 1]?.slug, CATEGORY_TABS[idx + 1]?.slug]
      .filter(Boolean) as CategorySlug[];
    for (const n of neighbors) {
      resolveFeed(n).then(warmImages).catch(() => {});
    }
  }, [resolveFeed]);

  useEffect(() => {
    if (!hasLoadedOnce.current) setInitialLoading(true);
    let cancelled = false;

    const loadFeed = async () => {
      const [base, pinnedStory] = await Promise.all([
        resolveFeed(activeCategory),
        storyId ? fetchNewsItemById(storyId).catch(() => null) : Promise.resolve(null),
      ]);
      if (cancelled) return;

      setLoadError(false);
      if (pinnedStory) {
        const deduped = base.filter((s) => s.id !== pinnedStory.id);
        setStories([pinnedStory, ...deduped]);
        const url = new URL(window.location.href);
        url.searchParams.delete("story");
        window.history.replaceState({}, "", url.toString());
      } else {
        setStories(base);
      }

      warmImages(base);
      prefetchAdjacent(activeCategory);
    };

    loadFeed()
      .catch(() => {
        if (cancelled) return;
        // A real failure (network / Supabase). In dev, fall back to mock so local
        // work isn't blocked; in production, surface a retryable error instead of
        // faking it with placeholder content.
        if (USE_MOCK_FALLBACK) {
          setStories(
            MOCK_STORIES.filter(
              (s) => activeCategory === "all" || s.categorySlug === activeCategory
            )
          );
          setLoadError(false);
        } else {
          setStories([]);
          setLoadError(true);
        }
      })
      .finally(() => {
        if (cancelled) return;
        setInitialLoading(false);
        hasLoadedOnce.current = true;
      });

    return () => { cancelled = true; };
  }, [activeCategory, storyId, resolveFeed, prefetchAdjacent, reloadNonce]);

  const handleCategoryChange = useCallback((slug: CategorySlug) => {
    posthog.capture("category_changed", { category: slug, previous_category: activeCategory });
    setActiveCategory(slug);
  }, [activeCategory]);

  const handleRetry = useCallback(() => {
    feedCache.current.delete(activeCategory); // drop the empty/failed result so it re-fetches
    setInitialLoading(true);
    setLoadError(false);
    setReloadNonce((n) => n + 1);
    posthog.capture("feed_retry", { category: activeCategory });
  }, [activeCategory]);

  const handleRefresh = useCallback(async (): Promise<number> => {
    const items = await fetchNewsItems(activeCategory).catch(() => [] as NewsItem[]);
    if (items.length > 0) {
      feedCache.current.set(activeCategory, items);
      setStories(items);
      warmImages(items);
    }
    fetch("/api/news/trigger", { method: "POST" }).catch(() => {});
    // Use ref for fallback — avoids stale closure on stories and removes it from deps
    return items.length > 0 ? items.length : storiesLenRef.current;
  }, [activeCategory]);

  // ── Real-time drag (called every touchmove) ──────────────────────────────
  const handleHorizontalDrag = useCallback((dx: number) => {
    if (isAnimating.current) return;
    const tabs = CATEGORY_TABS;
    const idx = tabs.findIndex((t) => t.slug === activeCategory);
    // Resist at edges: no next tab → dampen left drag; no prev tab → dampen right drag
    const atEnd = dx < 0 && idx >= tabs.length - 1;
    const atStart = dx > 0 && idx <= 0;
    const resistance = 0.25;
    dragX.set(atEnd || atStart ? dx * resistance : dx);
  }, [activeCategory, dragX]);

  // ── Snap or spring-back on release ──────────────────────────────────────
  const handleHorizontalDragEnd = useCallback((dx: number) => {
    if (isAnimating.current) return;
    const tabs = CATEGORY_TABS;
    const idx = tabs.findIndex((t) => t.slug === activeCategory);
    const velocity = dragVelocity.get();
    const screenW = typeof window !== "undefined" ? window.innerWidth : 390;

    const goNext = (dx < -SWIPE_DISTANCE || velocity < -SWIPE_VELOCITY) && idx < tabs.length - 1;
    const goPrev = (dx > SWIPE_DISTANCE  || velocity > SWIPE_VELOCITY)  && idx > 0;

    if (goNext || goPrev) {
      isAnimating.current = true;
      const target = goNext ? -screenW : screenW;
      const nextSlug = tabs[goNext ? idx + 1 : idx - 1].slug;
      posthog.capture("category_swiped", {
        direction: goNext ? "left" : "right",
        from: activeCategory,
        to: nextSlug,
      });
      animate(dragX, target, {
        type: "spring",
        stiffness: 400,
        damping: 38,
        restDelta: 1,
      }).then(() => {
        setActiveCategory(nextSlug);
        dragX.set(0);
        isAnimating.current = false;
      });
    } else {
      // Spring back to centre
      animate(dragX, 0, { type: "spring", stiffness: 400, damping: 38 });
    }
  }, [activeCategory, dragX, dragVelocity]);

  // ── Adjacent category accent colours (peek behind sliding card) ──────────
  const tabs = CATEGORY_TABS;
  const tabIdx = tabs.findIndex((t) => t.slug === activeCategory);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, background: "#0a0a0a" }}>
      {/* Top bar */}
      <div style={{
        padding: "2px 16px 6px 20px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <h1 style={{
          fontSize: "26px", fontWeight: 500, color: "#E8E4DE",
          margin: 0, letterSpacing: "-0.02em",
          fontFamily: "var(--font-space-grotesk), sans-serif",
        }}>
          kapyn
        </h1>
        <HomeScreenPill />
      </div>

      <CategoryTabs activeSlug={activeCategory} onChange={handleCategoryChange} />

      {/* Feed — clip overflow so sliding card stays within phone frame */}
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        {initialLoading ? (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#525252", fontSize: "14px",
          }}>
            Loading stories…
          </div>
        ) : loadError ? (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: "12px", padding: "0 32px", textAlign: "center",
          }}>
            <p style={{ fontSize: "15px", color: "#E8E4DE", margin: 0, fontWeight: 500 }}>Couldn&apos;t load stories</p>
            <p style={{ fontSize: "13.5px", color: "#737373", margin: 0, lineHeight: 1.5, maxWidth: "260px" }}>
              Something went wrong reaching the feed. Check your connection and try again.
            </p>
            <button
              onClick={handleRetry}
              style={{
                display: "inline-flex", alignItems: "center", gap: "7px", marginTop: "4px",
                fontSize: "14px", fontWeight: 600, color: "#0a0a0a", background: "#E8E4DE",
                border: "none", borderRadius: "100px", padding: "10px 20px", cursor: "pointer",
                fontFamily: "var(--font-space-grotesk), sans-serif",
              }}
            >
              <RefreshCw size={15} strokeWidth={2.3} /> Try again
            </button>
          </div>
        ) : (
          <>
            {/* Prev category peek — visible when dragging right */}
            {tabIdx > 0 && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "flex-end",
                gap: "6px", paddingRight: "24px",
                background: "#0a0a0a",
                color: "#333",
                fontSize: "13px", fontWeight: 600, letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>
                <ChevronLeft size={15} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                {tabs[tabIdx - 1].label}
              </div>
            )}
            {/* Next category peek — visible when dragging left */}
            {tabIdx < tabs.length - 1 && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "flex-start",
                gap: "6px", paddingLeft: "24px",
                background: "#0a0a0a",
                color: "#333",
                fontSize: "13px", fontWeight: 600, letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>
                {tabs[tabIdx + 1].label}
                <ChevronRight size={15} strokeWidth={2.5} style={{ flexShrink: 0 }} />
              </div>
            )}

            {/* Current card stack — follows finger in real time */}
            <motion.div
              style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                x: dragX,
              }}
            >
              <CardStack
                key={activeCategory}
                items={stories}
                onRefresh={handleRefresh}
                onHorizontalDrag={handleHorizontalDrag}
                onHorizontalDragEnd={handleHorizontalDragEnd}
              />
            </motion.div>

            {/* Feed customization hint */}
            <AnimatePresence>
              {showFeedHint && (
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    top: "14px",
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "center",
                    zIndex: 50,
                    padding: "0 20px",
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "380px",
                      background: "rgba(15,15,15,0.96)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                      display: "flex",
                      alignItems: "center",
                      pointerEvents: "auto",
                      overflow: "hidden",
                    }}
                  >
                    {/* Main tap area */}
                    <button
                      onClick={() => { setShowFeedHint(false); router.push("/profile"); }}
                      style={{
                        flex: 1,
                        background: "none",
                        border: "none",
                        padding: "14px 16px",
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        gap: "3px",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "#e5e5e5", letterSpacing: "-0.01em" }}>
                        <Sparkles size={13} strokeWidth={2.2} style={{ flexShrink: 0 }} />
                        Customize your feed
                      </span>
                      <span style={{ fontSize: "12px", color: "#525252", fontWeight: 400 }}>
                        Pick the topics you care about in Profile
                      </span>
                    </button>
                    {/* Dismiss */}
                    <button
                      onClick={() => { setFeedHintShown(); setShowFeedHint(false); }}
                      style={{
                        background: "none",
                        border: "none",
                        borderLeft: "1px solid rgba(255,255,255,0.06)",
                        padding: "0 16px",
                        height: "100%",
                        minHeight: "52px",
                        cursor: "pointer",
                        color: "#404040",
                        fontSize: "18px",
                        lineHeight: 1,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <SwipeHint />
    </div>
  );
}
