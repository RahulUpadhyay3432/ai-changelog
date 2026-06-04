"use client";

import { useState, useEffect } from "react";
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
          padding: "16px 20px 8px",
          flexShrink: 0,
          gap: "8px",
        }}
      >
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
        />
      )}
    </div>
  );
}
