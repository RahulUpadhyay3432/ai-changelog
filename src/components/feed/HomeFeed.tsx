"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { CategoryTabs } from "./CategoryTabs";
import { CardStack } from "./CardStack";
import { SinceYouLeftCard } from "./SinceYouLeftCard";
import { fetchNewsItems } from "@/lib/supabase";
import { MOCK_STORIES } from "@/lib/mock-data";
import { getLastVisitTimestamp, setLastVisitTimestamp } from "@/lib/storage";
import type { CategorySlug, NewsItem } from "@/lib/types";
import posthog from "posthog-js";

export function HomeFeed() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") ?? "all") as CategorySlug;

  const [activeCategory, setActiveCategory] = useState<CategorySlug>(initialCategory);
  const [stories, setStories] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardPosition, setCardPosition] = useState({ index: 0, total: 0 });

  // Since You Left card
  const [showSYL, setShowSYL] = useState(false);
  const [lastVisitTimestamp, setLastVisitTs] = useState<number | null>(null);
  const [isFirstTime, setIsFirstTime] = useState(false);

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

  // Check last visit on mount — show SYL if away 1+ hour or first time
  useEffect(() => {
    const ts = getLastVisitTimestamp();
    const ONE_HOUR = 60 * 60 * 1000;
    if (ts === null) {
      setIsFirstTime(true);
      setShowSYL(true);
    } else if (Date.now() - ts >= ONE_HOUR) {
      setLastVisitTs(ts);
      setShowSYL(true);
    }
    setLastVisitTimestamp();
  }, []);

  const handleDismissSYL = useCallback(() => setShowSYL(false), []);

  const handleStartReading = useCallback(() => setShowSYL(false), []);

  const handleQuickCatchUp = useCallback((newItems: NewsItem[]) => {
    setShowSYL(false);
    if (newItems.length > 0) {
      setStories(newItems);
      setCardPosition({ index: 0, total: newItems.length });
    }
  }, []);

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

      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        {loading ? (
          <div
            style={{
              height: "100%",
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

        <AnimatePresence>
          {showSYL && !loading && (
            <SinceYouLeftCard
              key="syl"
              allItems={stories}
              lastVisitTimestamp={lastVisitTimestamp}
              isFirstTime={isFirstTime}
              onDismiss={handleDismissSYL}
              onStartReading={handleStartReading}
              onQuickCatchUp={handleQuickCatchUp}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
