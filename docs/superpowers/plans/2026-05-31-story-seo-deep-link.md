# Story SEO + Deep-Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every story URL Google-indexable, fix shared links to open the specific story in the swipe feed, and fix OG image metadata.

**Architecture:** `/story/[id]` server-renders story content for Google, then client-redirects users to `/?story=id`. HomeFeed reads `?story=id` on mount, prepends that story to the top of the card stack, clears the URL param. sitemap.xml and robots.txt added for Google discoverability.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase, `next/og` (ImageResponse), `MetadataRoute` from `next`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/app/story/[id]/opengraph-image.tsx` | Modify | Fix tagline font size + URL text |
| `src/components/feed/NewsCard.tsx` | Modify | Fix share URL domain |
| `src/app/story/[id]/page.tsx` | Rewrite | Server-render story content, redirect to `/?story=id`, add canonical + JSON-LD |
| `src/components/feed/HomeFeed.tsx` | Modify | Read `?story` param, prepend story to stack, clear param |
| `src/app/sitemap.ts` | Create | Dynamic sitemap from Supabase |
| `src/app/robots.ts` | Create | robots.txt |

---

## Task 1: Fix OG image tagline font + URL text

**Files:**
- Modify: `src/app/story/[id]/opengraph-image.tsx`

- [ ] **Step 1: Change tagline font size from 28 to 36**

In `opengraph-image.tsx`, find the span with "AI & tech news in 30-second reads" (line ~76-84). Change `fontSize: 28` → `fontSize: 36`:

```tsx
<span
  style={{
    fontSize: 36,
    color: "#C8C4BE",
    fontWeight: 400,
    letterSpacing: "0.01em",
  }}
>
  AI & tech news in 30-second reads
</span>
```

- [ ] **Step 2: Fix bottom-right URL from `kapyn.vercel.app` to `kapyn.app`**

Find the span at the bottom right (line ~127-129):

```tsx
<span style={{ fontSize: 20, color: "#404040", fontWeight: 400 }}>
  kapyn.app
</span>
```

- [ ] **Step 3: Verify visually**

Navigate to `http://localhost:3000/story/<any-valid-id>/opengraph-image` in the browser. Confirm tagline is larger, URL shows `kapyn.app`.

- [ ] **Step 4: Commit**

```bash
git add src/app/story/[id]/opengraph-image.tsx
git commit -m "fix: larger OG image tagline font, fix URL to kapyn.app"
```

---

## Task 2: Fix share URL in NewsCard

**Files:**
- Modify: `src/components/feed/NewsCard.tsx`

- [ ] **Step 1: Update share URL domain**

Find line ~149 in `NewsCard.tsx`:

```tsx
const shareUrl = `https://kapyn.app/story/${item.id}`;
```

(Replace `kapyn.vercel.app` with `kapyn.app`)

- [ ] **Step 2: Verify**

Open app at `http://localhost:3000`. Tap share icon on any card. On mobile use native share sheet — link should show `kapyn.app/story/...`. On desktop, link is copied to clipboard — paste and confirm domain.

- [ ] **Step 3: Commit**

```bash
git add src/components/feed/NewsCard.tsx
git commit -m "fix: share URL uses kapyn.app instead of kapyn.vercel.app"
```

---

## Task 3: Rewrite story page — server-render + smart redirect

**Files:**
- Rewrite: `src/app/story/[id]/page.tsx`

`ClientRedirect` component (`src/app/story/[id]/ClientRedirect.tsx`) stays unchanged — it already accepts any `to: string`.

- [ ] **Step 1: Rewrite `page.tsx` with server-rendered content and smart redirect**

Replace the entire file with:

```tsx
import type { Metadata } from "next";
import { fetchNewsItemById } from "@/lib/supabase";
import { getCategoryBySlug } from "@/lib/categories";
import { ClientRedirect } from "./ClientRedirect";

const APP_URL = "https://kapyn.app";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const story = await fetchNewsItemById(id);

  if (!story) {
    return {
      title: "Kapyn — AI & tech news in 30-second reads",
      description: "AI and tech news distilled into 30-second reads.",
    };
  }

  const description = story.summary.length > 155
    ? story.summary.slice(0, 152) + "..."
    : story.summary;

  return {
    title: `${story.title} — Kapyn`,
    description,
    alternates: {
      canonical: `${APP_URL}/story/${story.id}`,
    },
    openGraph: {
      title: story.title,
      description,
      url: `${APP_URL}/story/${story.id}`,
      siteName: "Kapyn",
      type: "article",
      publishedTime: story.publishedAt,
      images: [
        {
          url: `${APP_URL}/story/${story.id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: story.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description,
      images: [`${APP_URL}/story/${story.id}/opengraph-image`],
    },
  };
}

export default async function StoryPage({ params }: Props) {
  const { id } = await params;
  const story = await fetchNewsItemById(id);
  const category = story ? getCategoryBySlug(story.categorySlug as never) : null;
  const accent = category?.colorAccent ?? "#7c3aed";
  const colorLabel = category?.colorLabel ?? "#c4b5fd";

  const redirectTo = story ? `${APP_URL}/?story=${id}` : APP_URL;

  const jsonLd = story
    ? {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: story.title,
        description: story.summary,
        datePublished: story.publishedAt,
        url: `${APP_URL}/story/${story.id}`,
        publisher: {
          "@type": "Organization",
          name: "Kapyn",
          url: APP_URL,
        },
        ...(story.imageUrl ? { image: story.imageUrl } : {}),
      }
    : null;

  return (
    <>
      <ClientRedirect to={redirectTo} />

      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Server-rendered content — visible to Google, shown briefly before JS redirect fires */}
      <div
        style={{
          minHeight: "100dvh",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          padding: "48px 24px",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          maxWidth: "640px",
          margin: "0 auto",
          gap: "32px",
        }}
      >
        {/* Wordmark */}
        <span
          style={{
            fontSize: "28px",
            fontWeight: 500,
            color: "#E8E4DE",
            letterSpacing: "-0.02em",
          }}
        >
          kapyn
        </span>

        {story ? (
          <>
            {/* Category badge */}
            <span
              style={{
                display: "inline-block",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: colorLabel,
                background: `${accent}12`,
                border: `1px solid ${accent}20`,
                padding: "3px 10px",
                borderRadius: "100px",
                width: "fit-content",
              }}
            >
              {category?.name ?? story.categorySlug}
            </span>

            {/* Title */}
            <h1
              style={{
                fontSize: "clamp(24px, 4vw, 36px)",
                fontWeight: 600,
                color: "#E8E4DE",
                lineHeight: 1.25,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {story.title}
            </h1>

            {/* Summary */}
            <p
              style={{
                fontSize: "17px",
                lineHeight: 1.65,
                color: "#9a9a9a",
                margin: 0,
              }}
            >
              {story.summary}
            </p>

            {/* Source + time */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "12px",
                color: "#555",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              <span>{story.sourceName}</span>
              <span>·</span>
              <span>{new Date(story.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
          </>
        ) : (
          <p style={{ fontSize: "16px", color: "#555" }}>Story not found.</p>
        )}

        <p style={{ fontSize: "13px", color: "#333", marginTop: "auto" }}>
          Opening Kapyn…
        </p>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify story page renders**

Start dev server. Navigate to `http://localhost:3000/story/<valid-id>`. Confirm:
- Page shows "kapyn" wordmark, story title, summary, category badge briefly before redirecting
- Redirect goes to `http://localhost:3000/?story=<id>` (not homepage)
- Browser URL changes to `/?story=<id>`

- [ ] **Step 3: Verify metadata with curl (simulates Google)**

```bash
curl -s http://localhost:3000/story/<valid-id> | grep -E "(og:|twitter:|canonical|application/ld)"
```

Expected output should include lines with `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`, `canonical`, `application/ld+json`.

- [ ] **Step 4: Commit**

```bash
git add src/app/story/[id]/page.tsx
git commit -m "feat: server-render story page for SEO, redirect to feed with story param"
```

---

## Task 4: HomeFeed deep-link — open feed at specific story

**Files:**
- Modify: `src/components/feed/HomeFeed.tsx`

- [ ] **Step 1: Add `fetchNewsItemById` import**

At the top of `HomeFeed.tsx`, add `fetchNewsItemById` to the supabase import:

```tsx
import { fetchNewsItems, fetchNewsItemById } from "@/lib/supabase";
```

- [ ] **Step 2: Capture storyId once on mount**

Inside the `HomeFeed` function, after the `searchParams` line, add:

```tsx
// Capture once — useState initializer only runs on mount, avoids reactive re-renders
const [storyId] = useState(() => searchParams.get("story"));
```

This also requires `useState` in the import (already imported). No change needed there.

- [ ] **Step 3: Replace the `useEffect` feed-loading logic**

Replace the existing `useEffect` (lines ~21-38) with:

```tsx
useEffect(() => {
  setLoading(true);

  const loadFeed = async () => {
    const [items, pinnedStory] = await Promise.all([
      fetchNewsItems(activeCategory).catch(() => [] as NewsItem[]),
      storyId ? fetchNewsItemById(storyId).catch(() => null) : Promise.resolve(null),
    ]);

    const base =
      items.length > 0
        ? items
        : MOCK_STORIES.filter(
            (s) => activeCategory === "all" || s.categorySlug === activeCategory
          );

    if (pinnedStory) {
      const deduped = base.filter((s) => s.id !== pinnedStory.id);
      setStories([pinnedStory, ...deduped]);
      // Remove ?story from URL without triggering navigation
      const url = new URL(window.location.href);
      url.searchParams.delete("story");
      window.history.replaceState({}, "", url.toString());
    } else {
      setStories(base);
    }
  };

  loadFeed()
    .catch(() => {
      setStories(
        MOCK_STORIES.filter(
          (s) => activeCategory === "all" || s.categorySlug === activeCategory
        )
      );
    })
    .finally(() => setLoading(false));
}, [activeCategory, storyId]);
```

- [ ] **Step 4: Verify deep-link works**

Navigate to `http://localhost:3000/?story=<valid-id>`. Confirm:
- Feed loads with that story shown as the FIRST card
- URL changes to `http://localhost:3000/` after a moment (param cleared)
- Swiping up shows rest of feed normally

Navigate to `http://localhost:3000/?story=invalid-id`. Confirm:
- Feed loads normally (no crash, no empty state)

- [ ] **Step 5: Verify full sharing flow**

1. Open app at `http://localhost:3000`
2. Tap share on any card
3. Copy the link — should be `https://kapyn.app/story/<id>`
4. Open that link (will go to `http://localhost:3000/story/<id>` in dev)
5. Brief story flash, then redirects to `/?story=<id>`
6. Feed shows that story first

- [ ] **Step 6: Commit**

```bash
git add src/components/feed/HomeFeed.tsx
git commit -m "feat: deep-link feed to specific story via ?story= param"
```

---

## Task 5: sitemap.xml + robots.txt

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

- [ ] **Step 1: Create `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: stories } = await supabase
    .from("news_items")
    .select("id, published_at")
    .order("published_at", { ascending: false })
    .limit(1000);

  const storyUrls: MetadataRoute.Sitemap = (stories ?? []).map((story) => ({
    url: `https://kapyn.app/story/${story.id}`,
    lastModified: new Date(story.published_at),
    changeFrequency: "never" as const,
    priority: 0.7,
  }));

  return [
    {
      url: "https://kapyn.app",
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: "https://kapyn.app/trending",
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.5,
    },
    {
      url: "https://kapyn.app/categories",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...storyUrls,
  ];
}
```

- [ ] **Step 2: Create `src/app/robots.ts`**

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: "https://kapyn.app/sitemap.xml",
  };
}
```

- [ ] **Step 3: Verify sitemap**

```bash
curl -s http://localhost:3000/sitemap.xml | head -30
```

Expected: XML with `<urlset>`, entries for `https://kapyn.app/`, `https://kapyn.app/trending`, and multiple `https://kapyn.app/story/<uuid>` entries.

- [ ] **Step 4: Verify robots.txt**

```bash
curl -s http://localhost:3000/robots.txt
```

Expected:
```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://kapyn.app/sitemap.xml
```

- [ ] **Step 5: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: add sitemap.xml and robots.txt for Google discoverability"
```

---

## Task 6: Final verification + push

- [ ] **Step 1: Full flow test**

1. Open `http://localhost:3000`
2. Tap share on a card → copy link → confirm it's `https://kapyn.app/story/<id>`
3. Open `http://localhost:3000/story/<id>` directly → see story content briefly → redirect to `/?story=<id>` → feed shows that story first
4. Open `http://localhost:3000/story/<id>/opengraph-image` → confirm tagline font is larger, URL shows `kapyn.app`
5. Open `http://localhost:3000/sitemap.xml` → valid XML with story URLs
6. Open `http://localhost:3000/robots.txt` → correct content

- [ ] **Step 2: Push to production**

```bash
git push origin main
```

- [ ] **Step 3: Verify on production after Vercel deploys**

```bash
curl -s https://kapyn.app/robots.txt
curl -s https://kapyn.app/sitemap.xml | head -10
```

Both should return correct content within ~2 minutes of push.
