"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryTabs } from "./CategoryTabs";
import { CardStack } from "./CardStack";
import { SwipeHint } from "./SwipeHint";
import { fetchNewsItems, fetchNewsItemById } from "@/lib/supabase";
import { MOCK_STORIES } from "@/lib/mock-data";
import { CATEGORY_TABS } from "@/lib/categories";
import type { CategorySlug, NewsItem } from "@/lib/types";
import posthog from "posthog-js";

// +1 = swiped left (→ next category slides in from right)
// -1 = swiped right (→ prev category slides in from left)
//  0 = tapped tab (no directional preference, fade-through)
const slideVariants = {
  enter: (dir: number) => ({
    x: dir === 0 ? 0 : dir > 0 ? "100%" : "-100%",
    opacity: dir === 0 ? 0 : 1,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir === 0 ? 0 : dir > 0 ? "-100%" : "100%",
    opacity: dir === 0 ? 0 : 1,
  }),
};

const slideTransition = {
  type: "spring" as const,
  stiffness: 380,
  damping: 36,
  mass: 0.85,
};

export function HomeFeed() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") ?? "all") as CategorySlug;

  // Capture storyId once on mount — avoids reactive re-renders when we clear the param
  const [storyId] = useState(() => searchParams.get("story"));

  const [activeCategory, setActiveCategory] = useState<CategorySlug>(initialCategory);
  const [stories, setStories] = useState<NewsItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true); // only true on very first load
  const [swipeDir, setSwipeDir] = useState(0);                // drives slide direction
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    // Only show the blank loading state on the very first fetch.
    // For category switches, keep existing stories visible — the slide animation
    // handles the visual transition; stories swap in when the query resolves.
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
    posthog.capture("category_changed", {
      category: slug,
      previous_category: activeCategory,
    });
    setSwipeDir(0); // tab tap — use fade, not slide
    setActiveCategory(slug);
  }, [activeCategory]);

  const handleRefresh = useCallback(async (): Promise<number> => {
    const items = await fetchNewsItems(activeCategory).catch(() => [] as typeof stories);
    if (items.length > 0) setStories(items);
    fetch("/api/news/trigger", { method: "POST" }).catch(() => {});
    return items.length > 0 ? items.length : stories.length;
  }, [activeCategory, stories]);

  const handleCategorySwipe = useCallback((direction: "left" | "right") => {
    const tabs = CATEGORY_TABS;
    const currentIndex = tabs.findIndex((t) => t.slug === activeCategory);
    const nextIndex = direction === "left" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= tabs.length) return;
    const nextSlug = tabs[nextIndex].slug;
    posthog.capture("category_swiped", {
      direction,
      from: activeCategory,
      to: nextSlug,
    });
    setSwipeDir(direction === "left" ? 1 : -1); // drives slide direction
    setActiveCategory(nextSlug);
  }, [activeCategory]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0a0a0a",
      }}
    >
      {/* Top bar */}
      <div style={{ padding: "8px 20px 4px", flexShrink: 0 }}>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 500,
            color: "#E8E4DE",
            margin: 0,
            letterSpacing: "-0.02em",
            fontFamily: "var(--font-space-grotesk), sans-serif",
          }}
        >
          kapyn
        </h1>
      </div>

      <CategoryTabs activeSlug={activeCategory} onChange={handleCategoryChange} />

      {/* Feed area — full height, clipped so slides don't overflow into nav */}
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        {initialLoading ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#525252",
              fontSize: "14px",
            }}
          >
            Loading stories…
          </div>
        ) : (
          <AnimatePresence mode="popLayout" custom={swipeDir} initial={false}>
            <motion.div
              key={activeCategory}
              custom={swipeDir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardStack
                items={stories}
                onRefresh={handleRefresh}
                onCategorySwipe={handleCategorySwipe}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <SwipeHint />
    </div>
  );
}
