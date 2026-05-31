"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CategoryTabs } from "./CategoryTabs";
import { CardStack } from "./CardStack";
import { SwipeHint } from "./SwipeHint";
import { fetchNewsItems, fetchNewsItemById } from "@/lib/supabase";
import { MOCK_STORIES } from "@/lib/mock-data";
import type { CategorySlug, NewsItem } from "@/lib/types";
import posthog from "posthog-js";

export function HomeFeed() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") ?? "all") as CategorySlug;

  // Capture storyId once on mount — avoids reactive re-renders when we clear the param
  const [storyId] = useState(() => searchParams.get("story"));

  const [activeCategory, setActiveCategory] = useState<CategorySlug>(initialCategory);
  const [stories, setStories] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

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
        // Remove ?story from URL without triggering navigation
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
      .finally(() => setLoading(false));
  }, [activeCategory, storyId]);

  const handleCategoryChange = useCallback((slug: CategorySlug) => {
    posthog.capture("category_changed", {
      category: slug,
      previous_category: activeCategory,
    });
    setActiveCategory(slug);
  }, [activeCategory]);

  const handleRefresh = useCallback(async () => {
    fetch("/api/news/trigger", { method: "POST" }).catch(() => {});
    await new Promise((r) => setTimeout(r, 4000));
    const items = await fetchNewsItems(activeCategory).catch(() => [] as typeof stories);
    if (items.length > 0) setStories(items);
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
      <div
        style={{
          padding: "8px 20px 4px",
          flexShrink: 0,
        }}
      >
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

      {loading ? (
        <div
          style={{
            flex: 1,
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
        <CardStack
          key={activeCategory}
          items={stories}
          onRefresh={handleRefresh}
        />
      )}
      <SwipeHint />
    </div>
  );
}
