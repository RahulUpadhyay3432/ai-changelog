"use client";

import { useState, useCallback } from "react";
import { TrendingUp } from "lucide-react";
import { CategoryTabs } from "@/components/feed/CategoryTabs";
import { CardStack } from "@/components/feed/CardStack";
import { MOCK_STORIES } from "@/lib/mock-data";
import type { CategorySlug } from "@/lib/types";

// Sort by recency as trending proxy for mock data
const TRENDING_STORIES = [...MOCK_STORIES].sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
);

export default function TrendingPage() {
  const [activeCategory, setActiveCategory] = useState<CategorySlug>("all");
  const [cardPosition, setCardPosition] = useState({
    index: 0,
    total: TRENDING_STORIES.length,
  });

  const stories =
    activeCategory === "all"
      ? TRENDING_STORIES
      : TRENDING_STORIES.filter((s) => s.categorySlug === activeCategory);

  const handleIndexChange = useCallback((index: number, total: number) => {
    setCardPosition({ index, total });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0a0a0a",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px 8px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <TrendingUp size={20} color="#f5f5f5" strokeWidth={2} />
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#f5f5f5",
              margin: 0,
              letterSpacing: "-0.03em",
            }}
          >
            Trending
          </h1>
        </div>
        <div
          style={{
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "100px",
            padding: "4px 12px",
            fontSize: "13px",
            fontWeight: 500,
            color: "#737373",
          }}
        >
          {cardPosition.index + 1} / {cardPosition.total}
        </div>
      </div>

      <CategoryTabs activeSlug={activeCategory} onChange={setActiveCategory} />

      <CardStack
        key={activeCategory}
        items={stories}
        onIndexChange={handleIndexChange}
      />
    </div>
  );
}
