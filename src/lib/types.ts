export type CategorySlug =
  | "all"
  | "ai-models"
  | "dev-tools"
  | "open-source"
  | "startups"
  | "research"
  | "funding-ma"
  | "big-tech"
  | "infrastructure"
  | "policy";

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  icon: string;
  colorAccent: string;
  colorBg: string;
  colorLabel: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  sourceUrl: string;
  sourceName: string;
  categorySlug: CategorySlug;
  publishedAt: string;
  isSaved?: boolean;
  // Knowledge-graph entities this story mentions (populated lazily for in-feed
  // chips in M2; optional so nothing breaks where it's absent).
  entities?: { slug: string; name: string; type: string }[];
}

export interface InsightSlide {
  imageUrl: string; // complete card image — design, title, and text all baked in
}

export interface Insight {
  id: string;
  title: string;
  subtitle: string | null;
  coverImageUrl: string | null;
  accentColor: string;
  slides: InsightSlide[];
  publishedAt: string;
}
