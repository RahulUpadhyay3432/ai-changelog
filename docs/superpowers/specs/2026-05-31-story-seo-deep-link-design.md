# Story SEO + Deep-Link Design
**Date:** 2026-05-31
**Status:** Approved

---

## Problem

1. `/story/[id]` immediately redirects to homepage — Google indexes the homepage instead of the story. No organic search traffic for individual stories.
2. Shared story links open the Kapyn feed at the first card, not the shared story.
3. Share URLs use `kapyn.vercel.app` (old domain) instead of `kapyn.app`.
4. OG image tagline font too small; shows `kapyn.vercel.app` instead of `kapyn.app`.
5. No `sitemap.xml` or `robots.txt` — Google has no map to discover stories.

---

## Goals

- Every story URL is indexable by Google (organic search traffic)
- Shared story link → Kapyn feed opens → that specific story is shown first → user swipes from there
- WhatsApp/social previews show correct domain and readable tagline
- Google discovers all story URLs via sitemap

---

## Design

### 1. OG Image fixes (`src/app/story/[id]/opengraph-image.tsx`)

Two line changes:
- `fontSize: 28` → `fontSize: 36` for "AI & tech news in 30-second reads"
- `kapyn.vercel.app` → `kapyn.app` in bottom-right attribution

### 2. Share URL fix (`src/components/feed/NewsCard.tsx`)

Change share URL from `https://kapyn.vercel.app/story/${item.id}` to `https://kapyn.app/story/${item.id}`.

### 3. Story page — server-render + smart redirect (`src/app/story/[id]/page.tsx`)

**Two-audience approach:**
- **Google (no JS):** reads server-rendered HTML containing full story — title, summary, category, source name, published date. Gets indexed.
- **Real users (JS runs):** `ClientRedirect` fires instantly, sends user to `https://kapyn.app/?story={id}`. User never sees the story page.

Replace current `ClientRedirect to={APP_URL}` with `ClientRedirect to={`${APP_URL}/?story=${id}`}`.

Fix `APP_URL` constant from `https://kapyn.vercel.app` to `https://kapyn.app`.

Server-rendered fallback HTML (visible to Google, briefly visible before JS fires):
- Story title (large)
- Category badge
- Summary text
- Source name + published time
- Kapyn wordmark + tagline
- Styled dark background matching Kapyn design system

Also add to `generateMetadata`:
- `openGraph.images` — explicit `og:image` URL pointing to `/story/[id]/opengraph-image`
- `canonical` URL
- `alternates.canonical`

Add JSON-LD `NewsArticle` structured data as a `<script type="application/ld+json">` in the page's `<head>` via Next.js metadata.

### 4. HomeFeed deep-link (`src/components/feed/HomeFeed.tsx`)

Read `?story=id` from `useSearchParams` on mount.

If present:
1. Fetch that story by ID via `fetchNewsItemById(storyId)`
2. Prepend it to the stories array (put it first in the card stack)
3. Deduplicate — remove it from its original position if it also appears in the regular feed
4. Clear `?story=id` from the URL (using `window.history.replaceState`) so the param doesn't persist after navigation

If story not found (expired, invalid ID): silently ignore, load feed normally.

### 5. `sitemap.xml` (`src/app/sitemap.ts`)

Next.js App Router sitemap generation. Fetches all story IDs + `published_at` from Supabase (`news_items` table, no time filter — include all available stories). Returns one entry per story:

```
https://kapyn.app/story/{id}  lastModified: published_at  changeFrequency: never  priority: 0.7
```

Also includes static routes: `/` (priority 1.0), `/trending` (0.5), `/categories` (0.5).

Sitemap is regenerated on every request (Next.js default for dynamic sitemaps) — always reflects current DB state.

### 6. `robots.txt` (`src/app/robots.ts`)

```
User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://kapyn.app/sitemap.xml
```

---

## Files Changed

| File | Change |
|---|---|
| `src/app/story/[id]/opengraph-image.tsx` | Font size 28→36, fix URL |
| `src/components/feed/NewsCard.tsx` | Share URL `kapyn.vercel.app` → `kapyn.app` |
| `src/app/story/[id]/page.tsx` | Server-render story content, redirect to `/?story=id`, fix APP_URL, add og:image + canonical + JSON-LD |
| `src/components/feed/HomeFeed.tsx` | Read `?story` param, prepend story to stack, clear param |
| `src/app/sitemap.ts` | New — dynamic sitemap from Supabase |
| `src/app/robots.ts` | New — robots.txt |

---

## What does NOT change

- Swipe feed mechanics, card stack, animations
- Push notifications
- Category tabs
- Any other routes
- The OG image visual design (only font size + URL text)

---

## Edge Cases

- **Story expired (>48h, deleted from DB):** `fetchNewsItemById` returns null → story page shows generic fallback metadata → HomeFeed ignores the `?story` param and loads normally
- **Invalid UUID:** Same as expired — null return, graceful fallback
- **Sitemap with many stories:** Supabase query has no 48h filter, returns all stored stories. If table grows large, add `.limit(1000)` as a safety cap
- **Duplicate in feed:** Story from `?story=id` is prepended AND may exist in the regular feed fetch — deduplication by ID prevents showing it twice
