"use client";

import { useState, useCallback, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { CategoryTabs } from "@/components/feed/CategoryTabs";
import { CardStack } from "@/components/feed/CardStack";
import { fetchNewsItems } from "@/lib/supabase";
import { MOCK_STORIES } from "@/lib/mock-data";
import type { CategorySlug, NewsItem } from "@/lib/types";

export default function TrendingPage() {
  const [activeCategory, setActiveCategory] = useState<CategorySlug>("all");
  const [stories, setStories] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardPosition, setCardPosition] = useState({ index: 0, total: 0 });

  useEffect(() => {
    setLoading(true);
    fetchNewsItems(activeCategory)
      .then((items) => {
        const result = items.length > 0
          ? [...items].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          : [...MOCK_STORIES]
              .filter((s) => activeCategory === "all" || s.categorySlug === activeCategory)
              .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        setStories(result);
      })
      .catch(() => {
        setStories(
          [...MOCK_STORIES]
            .filter((s) => activeCategory === "all" || s.categorySlug === activeCategory)
            .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        );
      })
      .finally(() => setLoading(false));
  }, [activeCategory]);

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
          {stories.length > 0 ? `${cardPosition.index + 1} / ${cardPosition.total}` : "—"}
        </div>
      </div>

      <CategoryTabs activeSlug={activeCategory} onChange={setActiveCategory} />

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
        />
      )}
    </div>
  );
}
