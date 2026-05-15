export type CategorySlug =
  | "all"
  | "ai-models"
  | "tools"
  | "startups"
  | "open-source"
  | "research"
  | "funding"
  | "big-tech"
  | "producthunt";

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
