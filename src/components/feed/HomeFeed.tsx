"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useVelocity, animate } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, RefreshCw } from "lucide-react";
import { CategoryTabs } from "./CategoryTabs";
import { CardStack } from "./CardStack";
import { FeedSkeleton } from "./FeedSkeleton";
import { SwipeHint } from "./SwipeHint";
import { HomeScreenPill } from "@/components/pwa/HomeScreenPill";
import { fetchNewsItems, fetchNewsItemById } from "@/lib/supabase";
import { MOCK_STORIES } from "@/lib/mock-data";
import { CATEGORY_TABS } from "@/lib/categories";
import { getFeedHintShown, setFeedHintShown, getStreak, getLastVisitTimestamp, setLastVisitTimestamp } from "@/lib/storage";
import type { CategorySlug, NewsItem } from "@/lib/types";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

// A/B: default to the importance-ranked opener; the "feed-opener-ranking" PostHog
// flag serves the pure-recency control (disabled). Undefined (flag not created, or
// not loaded yet) = opener on, i.e. no regression before the experiment exists.
function openerRankingEnabled(): boolean {
  return posthog.isFeatureEnabled("feed-opener-ranking") ?? true;
}

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

// Session-stable "new since last visit" baseline. Module-scoped so it survives
// feed remounts (in-app navigation) — captured once per page session in the
// HomeFeed initializer below, not re-read on every mount.
let sessionBaseline: number | null | undefined;

export function HomeFeed() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") ?? "all") as CategorySlug;
  const [storyId] = useState(() => searchParams.get("story"));

  // "New since last visit" baseline: read the previous visit's timestamp ONCE per
  // page session (cached in module scope so it doesn't reset on remount), then
  // stamp "now" for next time. null for first-timers → no "new" hook (they've
  // missed nothing yet). Measured against publishedAt in CardStack/NewsCard.
  const [lastVisit] = useState<number | null>(() => {
    if (sessionBaseline === undefined) sessionBaseline = getLastVisitTimestamp();
    return sessionBaseline;
  });
  useEffect(() => { setLastVisitTimestamp(); }, []);

  const [activeCategory, setActiveCategory] = useState<CategorySlug>(initialCategory);
  const [stories, setStories] = useState<NewsItem[]>([]);
  // Loading is true whenever the active category's feed isn't ready yet — cold
  // start AND switches to a not-yet-prefetched tab (so the latter shows a
  // skeleton instead of frozen stale content). Cached/prefetched tabs stay instant.
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0); // bump to force a re-fetch (retry)
  const [showFeedHint, setShowFeedHint] = useState(false);
  const router = useRouter();
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
    const items = await fetchNewsItems(slug, { rankOpener: openerRankingEnabled() }); // may throw → handled by the caller
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
    // Show the skeleton only when this category isn't already resolved — a
    // prefetched/cached tab swaps in instantly with no flash.
    if (!feedCache.current.has(activeCategory)) setLoading(true);
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

      // Activation denominator: a reliable "saw the feed" event. (Autocaptured
      // $pageview mixes the news feed with the /radar surface, so it's a noisy
      // funnel entry.) opener_ranked carries the A/B arm for segmenting.
      const streak = getStreak();
      const newSince = lastVisit == null
        ? 0
        : base.filter((s) => new Date(s.publishedAt).getTime() > lastVisit).length;
      posthog.capture("feed_viewed", {
        category: activeCategory,
        story_count: base.length,
        opener_ranked: openerRankingEnabled(),
        streak_days: streak,
        // Returning-user retention signal: did they actually have unseen stories
        // waiting? is_returning separates first-timers (no baseline) from the rest.
        new_since_last_visit: newSince,
        is_returning: lastVisit != null,
        // Promote streak to a person property so returning power users are a segment.
        $set: { streak_days: streak },
      });

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
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [activeCategory, storyId, resolveFeed, prefetchAdjacent, reloadNonce, lastVisit]);

  const handleCategoryChange = useCallback((slug: CategorySlug) => {
    posthog.capture("category_changed", { category: slug, previous_category: activeCategory });
    setActiveCategory(slug);
  }, [activeCategory]);

  const handleRetry = useCallback(() => {
    feedCache.current.delete(activeCategory); // drop the empty/failed result so it re-fetches
    setLoading(true);
    setLoadError(false);
    setReloadNonce((n) => n + 1);
    posthog.capture("feed_retry", { category: activeCategory });
  }, [activeCategory]);

  const handleRefresh = useCallback(async (): Promise<number> => {
    const items = await fetchNewsItems(activeCategory, { rankOpener: openerRankingEnabled() }).catch(() => [] as NewsItem[]);
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

  // "You missed N" — stories in the current feed newer than the user's last
  // visit. The top-bar signal that pairs with the per-card "New" badges.
  const newCount = useMemo(
    () => (lastVisit == null ? 0 : stories.filter((s) => new Date(s.publishedAt).getTime() > lastVisit).length),
    [stories, lastVisit]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, background: "var(--kt-canvas, #0a0a0a)" }}>
      {/* Top bar */}
      <div style={{
        padding: "2px 16px 6px 20px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <h1 style={{
            fontSize: "26px", fontWeight: 500, color: "var(--kt-text-primary, #E8E4DE)",
            margin: 0, letterSpacing: "-0.02em",
            fontFamily: "var(--font-space-grotesk), sans-serif",
          }}>
            kapyn
          </h1>
          {newCount > 0 && (
            <span
              aria-label={`${newCount} new since your last visit`}
              style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                fontSize: "11px", fontWeight: 600, letterSpacing: "0.02em",
                color: "#4ade80", background: "rgba(74,222,128,0.12)",
                border: "1px solid rgba(74,222,128,0.24)",
                padding: "3px 9px", borderRadius: "100px", whiteSpace: "nowrap",
              }}
            >
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#4ade80" }} />
              {newCount} new
            </span>
          )}
        </div>
        <HomeScreenPill />
      </div>

      <CategoryTabs activeSlug={activeCategory} onChange={handleCategoryChange} />

      {/* Feed — clip overflow so sliding card stays within phone frame */}
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        {loading ? (
          <FeedSkeleton />
        ) : loadError ? (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: "12px", padding: "0 32px", textAlign: "center",
          }}>
            <p style={{ fontSize: "15px", color: "var(--kt-text-primary, #E8E4DE)", margin: 0, fontWeight: 500 }}>Couldn&apos;t load stories</p>
            <p style={{ fontSize: "13.5px", color: "var(--kt-text-muted, #737373)", margin: 0, lineHeight: 1.5, maxWidth: "260px" }}>
              Something went wrong reaching the feed. Check your connection and try again.
            </p>
            <button
              onClick={handleRetry}
              style={{
                display: "inline-flex", alignItems: "center", gap: "7px", marginTop: "4px",
                fontSize: "14px", fontWeight: 600, color: "var(--kt-canvas, #0a0a0a)", background: "var(--kt-text-primary, #E8E4DE)",
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
                background: "var(--kt-canvas, #0a0a0a)",
                color: "var(--kt-text-muted, #333)",
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
                background: "var(--kt-canvas, #0a0a0a)",
                color: "var(--kt-text-muted, #333)",
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
                lastVisit={lastVisit}
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
                      background: "var(--kt-surface-raised, rgba(15,15,15,0.96))",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid var(--kt-hairline, rgba(255,255,255,0.1))",
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
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--kt-text-primary, #e5e5e5)", letterSpacing: "-0.01em" }}>
                        <Sparkles size={13} strokeWidth={2.2} style={{ flexShrink: 0 }} />
                        Customize your feed
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--kt-text-muted, #525252)", fontWeight: 400 }}>
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
                        color: "var(--kt-text-muted, #404040)",
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
