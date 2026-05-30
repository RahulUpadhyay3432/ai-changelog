---
name: nextjs-news-seo
description: Add or audit SEO for news articles and content pages in a Next.js App Router app — meta tags, NewsArticle JSON-LD structured data, dynamic sitemap, robots.txt, OG images, and Core Web Vitals.
---

# Next.js News SEO

## Purpose

Use this skill when adding SEO to any news article page, improving discovery of Kapyn dispatches in Google Search / Google News, or auditing existing metadata coverage. Covers the full stack: structured data, meta tags, sitemap, robots, canonical URLs, and image optimisation.

Trigger phrases: "add SEO", "structured data", "Google News", "sitemap", "meta tags", "OG image", "search ranking", "article schema", "crawlability", "index our content"

---

## Key concepts

### Why this matters for a news app

Google News and Discover can drive significant free traffic to a news product, but only if articles have:
1. `NewsArticle` JSON-LD (not just generic `Article`)
2. Per-article `<title>` and `<meta description>` (not shared across pages)
3. A dynamic `sitemap.xml` with `lastmod` timestamps
4. Stable, crawlable URLs (no hash routing, no query-string-only URLs)

### Next.js App Router SEO APIs (v15+)

| Goal | API to use |
|---|---|
| Per-page meta tags | `generateMetadata()` in `page.tsx` |
| Static metadata | `export const metadata = {...}` in `page.tsx` or `layout.tsx` |
| JSON-LD structured data | `<script type="application/ld+json">` in page JSX |
| Sitemap | `app/sitemap.ts` (returns `MetadataRoute.Sitemap`) |
| Robots | `app/robots.ts` (returns `MetadataRoute.Robots`) |
| OG images | `app/story/[id]/opengraph-image.tsx` (already exists in Kapyn) |

---

## Application

### Step 1 — Per-article metadata (`story/[id]/page.tsx`)

```tsx
// app/story/[id]/page.tsx
import type { Metadata } from "next";
import { fetchNewsItemById } from "@/lib/supabase";

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const story = await fetchNewsItemById(params.id);
  if (!story) return { title: "Kapyn" };

  return {
    title: `${story.title} | Kapyn`,
    description: story.summary.slice(0, 155), // keep under 160 chars
    alternates: {
      canonical: `https://kapyn.app/story/${story.id}`,
    },
    openGraph: {
      title: story.title,
      description: story.summary.slice(0, 155),
      url: `https://kapyn.app/story/${story.id}`,
      siteName: "Kapyn",
      type: "article",
      publishedTime: story.publishedAt,
      images: story.imageUrl ? [{ url: story.imageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description: story.summary.slice(0, 155),
      images: story.imageUrl ? [story.imageUrl] : [],
    },
  };
}
```

### Step 2 — NewsArticle JSON-LD

Add directly in the page component's JSX — not in `<head>`, Next.js handles placement:

```tsx
// Inside the story page component
function ArticleJsonLd({ story }: { story: NewsItem }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": story.title,
    "description": story.summary,
    "url": `https://kapyn.app/story/${story.id}`,
    "datePublished": story.publishedAt,
    "dateModified": story.publishedAt,
    "author": {
      "@type": "Organization",
      "name": story.sourceName,
      "url": story.sourceUrl,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Kapyn",
      "url": "https://kapyn.app",
      "logo": {
        "@type": "ImageObject",
        "url": "https://kapyn.app/icons/icon-512.png",
      },
    },
    "image": story.imageUrl ? [story.imageUrl] : [],
    "isPartOf": {
      "@type": "NewsMediaOrganization",
      "name": "Kapyn",
      "url": "https://kapyn.app",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### Step 3 — Dynamic sitemap (`app/sitemap.ts`)

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await supabase
    .from("news_items")
    .select("id, published_at")
    .order("published_at", { ascending: false })
    .limit(1000);

  const stories = (data ?? []).map((row) => ({
    url: `https://kapyn.app/story/${row.id}`,
    lastModified: new Date(row.published_at),
    changeFrequency: "never" as const, // news articles don't change
    priority: 0.8,
  }));

  return [
    {
      url: "https://kapyn.app",
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    ...stories,
  ];
}
```

### Step 4 — Robots (`app/robots.ts`)

```ts
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: "https://kapyn.app/sitemap.xml",
  };
}
```

### Step 5 — Root layout global metadata (`app/layout.tsx`)

```tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://kapyn.app"),
  title: { default: "Kapyn", template: "%s | Kapyn" },
  description: "AI moves fast. Every story that matters, distilled to 30 seconds.",
  openGraph: {
    siteName: "Kapyn",
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", site: "@kapynapp" },
  verification: {
    google: "TODO: add GSC verification token",
  },
};
```

### Step 6 — Google News eligibility checklist

- [ ] `NewsArticle` schema present on every story page
- [ ] `datePublished` in ISO 8601 format
- [ ] Unique `<title>` per article (not "Kapyn" on all pages)
- [ ] Story URL is stable and doesn't change after publish
- [ ] `sitemap.xml` submitted to Google Search Console
- [ ] Publication name consistent across schema and site

---

## Core Web Vitals targets

| Metric | Target | Kapyn risk |
|---|---|---|
| LCP | < 2.5s | Hero images from external CDNs — use `next/image` with `priority` |
| CLS | < 0.1 | Framer Motion layout shifts — use `layout={false}` where possible |
| INP | < 200ms | Card swipe animations — already using CSS transforms, low risk |

---

## Examples

### Good URL pattern (stable, crawlable)
```
https://kapyn.app/story/a3f4-uuid-here
```

### Bad URL pattern (avoid)
```
https://kapyn.app/?story=a3f4         ← query string only
https://kapyn.app/#story-a3f4         ← hash — not crawled
```

### Good NewsArticle headline (under 110 chars)
```
"Meta is developing an AI-powered wearable pendant with ambient context"
```

### Bad (truncated by Google)
```
"BREAKING: Meta Announces Revolutionary New AI Pendant Device That Will Completely Change..."
```

---

## Common pitfalls

- **Don't put JSON-LD in a client component** — it needs to be server-rendered to be indexed
- **Don't reuse the same `<title>` across pages** — Google deduplicates
- **Don't set `priority: 1.0` for all sitemap entries** — use it only for the homepage
- **Don't forget `metadataBase`** in root layout — relative OG image URLs will break without it
- **Don't block `/story/` in robots.txt** — that's where all the content is

---

## References

- [Next.js JSON-LD Guide (official)](https://nextjs.org/docs/app/guides/json-ld)
- [Next.js generateMetadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Google NewsArticle Schema](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google News Publisher Center](https://publishercenter.google.com/)
- [Next.js SEO Guide 2026](https://www.modernwebseo.com/en/blog/nextjs-seo-guide-2026)
