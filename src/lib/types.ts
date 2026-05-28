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
  storyCount?: number;
  lastUpdated?: string;
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
}
