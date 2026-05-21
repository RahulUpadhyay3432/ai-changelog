"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CategoryTabs } from "./CategoryTabs";
import { CardStack } from "./CardStack";
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
  const [cardPosition, setCardPosition] = useState({ index: 0, total: 0 });

  useEffect(() => {
    setLoading(true);
    setCardPosition({ index: 0, total: 0 });

    fetchNewsItems(activeCategory)
      .then((items) => {
        const result = items.length > 0 ? items : MOCK_STORIES.filter(
          (s) => activeCategory === "all" || s.categorySlug === activeCategory
        );
        setStories(result);
        setCardPosition({ index: 0, total: result.length });
      })
      .catch(() => {
        const fallback = MOCK_STORIES.filter(
          (s) => activeCategory === "all" || s.categorySlug === activeCategory
        );
        setStories(fallback);
        setCardPosition({ index: 0, total: fallback.length });
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

  const handleIndexChange = useCallback((index: number, total: number) => {
    setCardPosition({ index, total });
  }, []);

  const handleRefresh = useCallback(async () => {
    const items = await fetchNewsItems(activeCategory).catch(() => [] as typeof stories);
    if (items.length > 0) {
      setStories(items);
      setCardPosition({ index: 0, total: items.length });
    }
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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 20px 4px",
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            fontSize: "19px",
            fontWeight: 500,
            color: "#E8E4DE",
            margin: 0,
            letterSpacing: "-0.02em",
            fontFamily: "var(--font-space-grotesk), sans-serif",
          }}
        >
          kapyn
        </h1>
        <div
          style={{
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "100px",
            padding: "3px 10px",
            fontSize: "11px",
            fontWeight: 500,
            color: "#555",
          }}
        >
          {loading ? "…" : `${cardPosition.index + 1} / ${cardPosition.total}`}
        </div>
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
          onIndexChange={handleIndexChange}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}
