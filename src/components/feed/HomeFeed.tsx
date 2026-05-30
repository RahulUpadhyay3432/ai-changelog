"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CategoryTabs } from "./CategoryTabs";
import { CardStack } from "./CardStack";
import { SwipeHint } from "./SwipeHint";
import { fetchNewsItems } from "@/lib/supabase";
import { MOCK_STORIES } from "@/lib/mock-data";
import type { CategorySlug, NewsItem } from "@/lib/types";
import posthog from "posthog-js";

export function HomeFeed() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") ?? "all") as CategorySlug;

  const [activeCategory, setActiveCategory] = useState<CategorySlug>(initialCategory);
  const [stories, setStories] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetchNewsItems(activeCategory)
      .then((items) => {
        const result = items.length > 0 ? items : MOCK_STORIES.filter(
          (s) => activeCategory === "all" || s.categorySlug === activeCategory
        );
        setStories(result);
      })
      .catch(() => {
        const fallback = MOCK_STORIES.filter(
          (s) => activeCategory === "all" || s.categorySlug === activeCategory
        );
        setStories(fallback);
      })
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const handleCategoryChange = useCallback((slug: CategorySlug) => {
    posthog.capture("category_changed", {
      category: slug,
      previous_category: activeCategory,
    });
    setActiveCategory(slug);
  }, [activeCategory]);

  const handleRefresh = useCallback(async () => {
    // Trigger a real RSS fetch in the background, then re-read Supabase
    fetch("/api/news/trigger", { method: "POST" }).catch(() => {});
    // Give the fetch pipeline a moment to pull in new items
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
