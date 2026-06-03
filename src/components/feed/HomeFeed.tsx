"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useMotionValue, useVelocity, animate } from "framer-motion";
import { CategoryTabs } from "./CategoryTabs";
import { CardStack } from "./CardStack";
import { SwipeHint } from "./SwipeHint";
import { HomeScreenPill } from "@/components/pwa/HomeScreenPill";
import { fetchNewsItems, fetchNewsItemById } from "@/lib/supabase";
import { MOCK_STORIES } from "@/lib/mock-data";
import { CATEGORY_TABS } from "@/lib/categories";
import type { CategorySlug, NewsItem } from "@/lib/types";
import posthog from "posthog-js";

// Minimum drag distance (px) or velocity (px/s) to commit a swipe
const SWIPE_DISTANCE = 72;
const SWIPE_VELOCITY = 400;

export function HomeFeed() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") ?? "all") as CategorySlug;
  const [storyId] = useState(() => searchParams.get("story"));

  const [activeCategory, setActiveCategory] = useState<CategorySlug>(initialCategory);
  const [stories, setStories] = useState<NewsItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const hasLoadedOnce = useRef(false);

  // Real-time drag position — drives the card x transform without re-renders
  const dragX = useMotionValue(0);
  const dragVelocity = useVelocity(dragX);
  const isAnimating = useRef(false);

  useEffect(() => {
    if (!hasLoadedOnce.current) setInitialLoading(true);

    const loadFeed = async () => {
      const [items, pinnedStory] = await Promise.all([
        fetchNewsItems(activeCategory).catch(() => [] as NewsItem[]),
        storyId ? fetchNewsItemById(storyId).catch(() => null) : Promise.resolve(null),
      ]);

      const base =
        items.length > 0
          ? items
          : MOCK_STORIES.filter(
              (s) => activeCategory === "all" || s.categorySlug === activeCategory
            );

      if (pinnedStory) {
        const deduped = base.filter((s) => s.id !== pinnedStory.id);
        setStories([pinnedStory, ...deduped]);
        const url = new URL(window.location.href);
        url.searchParams.delete("story");
        window.history.replaceState({}, "", url.toString());
      } else {
        setStories(base);
      }
    };

    loadFeed()
      .catch(() => {
        setStories(
          MOCK_STORIES.filter(
            (s) => activeCategory === "all" || s.categorySlug === activeCategory
          )
        );
      })
      .finally(() => {
        setInitialLoading(false);
        hasLoadedOnce.current = true;
      });
  }, [activeCategory, storyId]);

  const handleCategoryChange = useCallback((slug: CategorySlug) => {
    posthog.capture("category_changed", { category: slug, previous_category: activeCategory });
    setActiveCategory(slug);
  }, [activeCategory]);

  const handleRefresh = useCallback(async (): Promise<number> => {
    const items = await fetchNewsItems(activeCategory).catch(() => [] as typeof stories);
    if (items.length > 0) setStories(items);
    fetch("/api/news/trigger", { method: "POST" }).catch(() => {});
    return items.length > 0 ? items.length : stories.length;
  }, [activeCategory, stories]);

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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0a0a0a" }}>
      {/* Top bar */}
      <div style={{
        padding: "8px 16px 10px 20px",
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
        ) : (
          <>
            {/* Prev category peek — visible when dragging right */}
            {tabIdx > 0 && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "flex-end",
                paddingRight: "24px",
                background: "#0a0a0a",
                color: "#333",
                fontSize: "13px", fontWeight: 600, letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>
                ← {tabs[tabIdx - 1].label}
              </div>
            )}
            {/* Next category peek — visible when dragging left */}
            {tabIdx < tabs.length - 1 && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "flex-start",
                paddingLeft: "24px",
                background: "#0a0a0a",
                color: "#333",
                fontSize: "13px", fontWeight: 600, letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>
                {tabs[tabIdx + 1].label} →
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
          </>
        )}
      </div>

      <SwipeHint />
    </div>
  );
}
